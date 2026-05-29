import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceResult<T> = { data: T | null; error: string | null };

export interface Client {
  id: string;
  org_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  portal_token: string;
  portal_enabled: boolean;
  portal_status: "invite_pending" | "invite_sent" | "waiting_for_client" | "client_active" | "disabled";
  last_portal_visit: string | null;
  notes: string | null;
  created_at: string;
}

function mapClientRow(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    full_name: row.full_name as string,
    email: row.email as string | null,
    phone: row.phone as string | null,
    avatar_url: row.avatar_url as string | null,
    portal_token: row.portal_token as string,
    portal_enabled: Boolean(row.portal_enabled),
    portal_status: (row.portal_status as Client["portal_status"]) ?? "invite_pending",
    last_portal_visit: row.last_portal_visit as string | null,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
  };
}

export async function getClients(
  supabase: SupabaseClient,
  orgId: string
): Promise<ServiceResult<Client[]>> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapClientRow), error: null };
}

export async function getClient(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapClientRow(data as Record<string, unknown>), error: null };
}

export async function getClientByPortalToken(
  supabase: SupabaseClient,
  token: string
): Promise<ServiceResult<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapClientRow(data as Record<string, unknown>), error: null };
}

export async function createClient(
  supabase: SupabaseClient,
  orgId: string,
  input: { full_name: string; email?: string; phone?: string; notes?: string }
): Promise<ServiceResult<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .insert({ org_id: orgId, ...input })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapClientRow(data as Record<string, unknown>), error: null };
}

export async function updatePortalStatus(
  supabase: SupabaseClient,
  clientId: string,
  orgId: string,
  enabled: boolean,
  status?: Client["portal_status"]
): Promise<ServiceResult<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .update({
      portal_enabled: enabled,
      portal_status: status ?? (enabled ? "invite_pending" : "disabled"),
    })
    .eq("id", clientId)
    .eq("org_id", orgId)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapClientRow(data as Record<string, unknown>), error: null };
}

export async function recordPortalVisit(
  supabase: SupabaseClient,
  clientId: string
): Promise<void> {
  await supabase
    .from("clients")
    .update({
      last_portal_visit: new Date().toISOString(),
      portal_status: "client_active",
    })
    .eq("id", clientId);
}
