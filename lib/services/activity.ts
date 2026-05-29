import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapActivityRow(row: Record<string, unknown>): Activity {
  const profile = row.profiles as { full_name?: string; avatar_url?: string } | null;
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    deal_id: row.deal_id as string | undefined,
    deal_address: row.deal_address as string | undefined,
    user_id: (row.user_id as string) ?? "",
    user_name: profile?.full_name,
    user_avatar: profile?.avatar_url,
    type: (row.action as string) ?? "updated",
    description: (row.description as string) ?? "",
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  };
}

export async function logActivity(
  supabase: SupabaseClient,
  input: {
    org_id: string;
    user_id?: string;
    deal_id?: string;
    task_id?: string;
    document_id?: string;
    client_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    description: string;
    metadata?: Record<string, unknown>;
  }
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from("activity_log").insert({
    org_id: input.org_id,
    user_id: input.user_id ?? null,
    deal_id: input.deal_id ?? null,
    task_id: input.task_id ?? null,
    document_id: input.document_id ?? null,
    client_id: input.client_id ?? null,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id ?? null,
    description: input.description,
    metadata: input.metadata ?? {},
  });
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function getDealActivity(
  supabase: SupabaseClient,
  dealId: string,
  limit = 50
): Promise<ServiceResult<Activity[]>> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, profiles!activity_log_user_id_fkey(full_name, avatar_url)")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r) => mapActivityRow(r as Record<string, unknown>)),
    error: null,
  };
}

export async function getOrgActivity(
  supabase: SupabaseClient,
  orgId: string,
  limit = 30
): Promise<ServiceResult<Activity[]>> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, profiles!activity_log_user_id_fkey(full_name, avatar_url), deals!activity_log_deal_id_fkey(address)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      const deal = row.deals as { address?: string } | null;
      return mapActivityRow({ ...row, deal_address: deal?.address });
    }),
    error: null,
  };
}
