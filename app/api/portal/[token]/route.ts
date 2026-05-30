import { NextRequest } from "next/server";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPortalData, generateMilestones, getInitials, generateWelcomeMessage } from "@/lib/portal-utils";
import type { ClientPortalData } from "@/types/portal";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  if (isDemo() || token === "demo-token-2024") {
    return ok({ portal: MOCK_CLIENT_PORTAL });
  }

  try {
    const supabase = createAdminClient();

    // 1. Validate token → get client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("portal_token", token)
      .eq("portal_enabled", true)
      .single();

    if (clientError || !client) {
      return err("Invalid or expired portal link", 404);
    }

    // Record portal visit and activate status
    await supabase
      .from("clients")
      .update({
        last_portal_visit: new Date().toISOString(),
        portal_status: "client_active",
      })
      .eq("id", client.id);

    // 2. Find the client's linked deal
    const { data: deals } = await supabase
      .from("deals")
      .select("*")
      .eq("client_id", client.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1);

    const deal = deals?.[0];

    // Return minimal portal when no deal is linked yet
    if (!deal) {
      const fallbackDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      const emptyPortal: ClientPortalData = {
        token,
        clientName: client.full_name as string,
        clientEmail: (client.email as string) ?? "",
        clientInitials: getInitials(client.full_name as string),
        dealId: "",
        propertyAddress: "Your Transaction",
        propertyCity: "",
        propertyType: "",
        purchasePrice: 0,
        closingDate: fallbackDate,
        contractDate: new Date().toISOString().split("T")[0],
        currentStage: "new_lead",
        healthScore: 80,
        milestones: generateMilestones("new_lead", fallbackDate, new Date().toISOString().split("T")[0]),
        tasks: [],
        documents: [],
        contacts: [],
        messages: [],
        activities: [],
        unreadMessages: 0,
        pendingTasks: 0,
        docsComplete: 0,
        docsTotal: 0,
        welcomeMessage:
          "Welcome to your CloseTrack portal! Your coordinator will be setting up your transaction shortly.",
      };
      return ok({ portal: emptyPortal });
    }

    // 3. Parallel fetch of all related data
    const [tasksRes, docsRes, messagesRes, activityRes, profilesRes] = await Promise.all([
      supabase
        .from("tasks")
        .select(
          "*, deals!tasks_deal_id_fkey(address), profiles!tasks_assigned_to_fkey(full_name, avatar_url)"
        )
        .eq("deal_id", deal.id)
        .not("status", "in", '("cancelled")')
        .order("due_date", { ascending: true }),

      supabase
        .from("documents")
        .select(
          "*, deals!documents_deal_id_fkey(address), profiles!documents_uploaded_by_fkey(full_name)"
        )
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("portal_messages")
        .select("*, profiles!portal_messages_sender_id_fkey(full_name, avatar_url)")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true }),

      supabase
        .from("activity_log")
        .select("*")
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("profiles")
        .select("id, full_name, email, phone, title, role, avatar_url")
        .eq("org_id", deal.org_id)
        .limit(8),
    ]);

    const tasks = (tasksRes.data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      deal_address: (row.deals as Record<string, unknown> | null)?.address,
      assigned_to_name: (row.profiles as Record<string, unknown> | null)?.full_name,
      assigned_to_avatar: (row.profiles as Record<string, unknown> | null)?.avatar_url,
    }));

    const docs = (docsRes.data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      deal_address: (row.deals as Record<string, unknown> | null)?.address,
      uploaded_by_name: (row.profiles as Record<string, unknown> | null)?.full_name,
    }));

    const portal = buildPortalData(
      token,
      client as Record<string, unknown>,
      deal as Record<string, unknown>,
      tasks,
      docs,
      (messagesRes.data ?? []) as Record<string, unknown>[],
      (activityRes.data ?? []) as Record<string, unknown>[],
      (profilesRes.data ?? []) as Record<string, unknown>[]
    );

    return ok({ portal });
  } catch (error) {
    console.error("[Portal API] Error:", error);
    return err("Portal temporarily unavailable", 500);
  }
}
