import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    org_id: (row.org_id ?? row.organization_id) as string,
    role: (row.role as Profile["role"]) ?? "agent",
    full_name: row.full_name as string,
    email: row.email as string,
    avatar_url: row.avatar_url as string | undefined,
    title: row.title as string | undefined,
    phone: row.phone as string | undefined,
    preferences: (row.preferences as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  };
}

export async function getMyProfile(
  supabase: SupabaseClient
): Promise<ServiceResult<Profile>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapProfileRow(data as Record<string, unknown>), error: null };
}

export async function getOrgProfiles(
  supabase: SupabaseClient,
  orgId: string
): Promise<ServiceResult<Profile[]>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("org_id", orgId)
    .order("full_name");
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r) => mapProfileRow(r as Record<string, unknown>)),
    error: null,
  };
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "title" | "phone" | "avatar_url" | "preferences">>
): Promise<ServiceResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapProfileRow(data as Record<string, unknown>), error: null };
}

export async function getMyOrgId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  return (data as { org_id?: string } | null)?.org_id ?? null;
}
