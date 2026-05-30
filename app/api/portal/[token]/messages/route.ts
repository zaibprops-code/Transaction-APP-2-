import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  if (isDemo() || token === "demo-token-2024") {
    return ok({ messages: [] });
  }

  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, org_id")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .single();

  if (!client) return err("Invalid portal link", 404);

  const { data: messages } = await supabase
    .from("portal_messages")
    .select("*, profiles!portal_messages_sender_id_fkey(full_name, avatar_url)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: true });

  return ok({ messages: messages ?? [] });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  if (isDemo() || token === "demo-token-2024") {
    return ok({ success: true }, 201);
  }

  const body = (await req.json()) as { content?: string };
  if (!body.content?.trim()) return err("Message content required", 400);

  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, org_id")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .single();

  if (!client) return err("Invalid portal link", 404);

  // Find the linked deal for deal_id context
  const { data: deals } = await supabase
    .from("deals")
    .select("id")
    .eq("client_id", client.id)
    .eq("status", "active")
    .limit(1);

  const dealId = deals?.[0]?.id ?? null;

  const { data: message, error } = await supabase
    .from("portal_messages")
    .insert({
      org_id: client.org_id,
      client_id: client.id,
      deal_id: dealId,
      sender_type: "client",
      content: body.content.trim(),
    })
    .select()
    .single();

  if (error) return err("Failed to send message", 500);

  return ok({ message }, 201);
}
