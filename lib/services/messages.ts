import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceResult<T> = { data: T | null; error: string | null };

export interface Message {
  id: string;
  org_id: string;
  deal_id: string | null;
  sender_id: string | null;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

function mapMessageRow(row: Record<string, unknown>): Message {
  const profile = row.profiles as { full_name?: string; avatar_url?: string } | null;
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    deal_id: row.deal_id as string | null,
    sender_id: row.sender_id as string | null,
    sender_name: profile?.full_name,
    sender_avatar: profile?.avatar_url,
    content: row.content as string,
    is_read: Boolean(row.is_read),
    created_at: row.created_at as string,
  };
}

export async function getMessages(
  supabase: SupabaseClient,
  dealId: string
): Promise<ServiceResult<Message[]>> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles!messages_sender_id_fkey(full_name, avatar_url)")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r) => mapMessageRow(r as Record<string, unknown>)),
    error: null,
  };
}

export async function sendMessage(
  supabase: SupabaseClient,
  orgId: string,
  senderId: string,
  input: { deal_id?: string; content: string }
): Promise<ServiceResult<Message>> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      org_id: orgId,
      sender_id: senderId,
      deal_id: input.deal_id ?? null,
      content: input.content,
    })
    .select("*, profiles!messages_sender_id_fkey(full_name, avatar_url)")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapMessageRow(data as Record<string, unknown>), error: null };
}

export async function markMessageRead(
  supabase: SupabaseClient,
  messageId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

// Portal messages (client-facing)
export async function getPortalMessages(
  supabase: SupabaseClient,
  clientId: string
): Promise<ServiceResult<Record<string, unknown>[]>> {
  const { data, error } = await supabase
    .from("portal_messages")
    .select("*, profiles!portal_messages_sender_id_fkey(full_name, avatar_url)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function sendPortalMessage(
  supabase: SupabaseClient,
  orgId: string,
  input: {
    client_id: string;
    deal_id?: string;
    sender_id?: string;
    sender_type: "agent" | "client";
    content: string;
  }
): Promise<ServiceResult<Record<string, unknown>>> {
  const { data, error } = await supabase
    .from("portal_messages")
    .insert({
      org_id: orgId,
      client_id: input.client_id,
      deal_id: input.deal_id ?? null,
      sender_id: input.sender_id ?? null,
      sender_type: input.sender_type,
      content: input.content,
    })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Record<string, unknown>, error: null };
}
