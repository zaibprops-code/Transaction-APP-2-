import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notification, NotificationType } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapNotificationRow(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    org_id: row.org_id as string,
    type: (row.type as NotificationType),
    title: row.title as string,
    message: (row.message ?? row.body) as string,
    read: Boolean(row.read),
    action_url: row.action_url as string | undefined,
    created_at: row.created_at as string,
  };
}

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
): Promise<ServiceResult<Notification[]>> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r) => mapNotificationRow(r as Record<string, unknown>)),
    error: null,
  };
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function createNotification(
  supabase: SupabaseClient,
  input: {
    org_id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    action_url?: string;
  }
): Promise<ServiceResult<Notification>> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      org_id: input.org_id,
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      message: input.message,
      action_url: input.action_url,
    })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapNotificationRow(data as Record<string, unknown>), error: null };
}
