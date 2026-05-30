import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ token: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;

  if (isDemo() || token === "demo-token-2024") {
    return ok({ success: true });
  }

  const body = (await req.json()) as { taskId?: string; status?: string };
  if (!body.taskId) return err("Task ID required", 400);

  const supabase = createAdminClient();

  // Verify portal token
  const { data: client } = await supabase
    .from("clients")
    .select("id, org_id")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .single();

  if (!client) return err("Invalid portal link", 404);

  // Verify the task belongs to the client's deal (security check)
  const { data: deals } = await supabase
    .from("deals")
    .select("id")
    .eq("client_id", client.id)
    .limit(1);

  const dealId = deals?.[0]?.id;
  if (!dealId) return err("No deal found", 404);

  const newStatus = body.status ?? "completed";

  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", body.taskId)
    .eq("deal_id", dealId);

  if (error) return err("Failed to update task", 500);

  return ok({ success: true });
}
