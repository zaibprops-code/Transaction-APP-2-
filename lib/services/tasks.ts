import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapTaskRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    deal_id: (row.deal_id as string) ?? "",
    deal_address: row.deal_address as string | undefined,
    org_id: row.org_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    status: (row.status as Task["status"]) ?? "pending",
    priority: (row.priority as Task["priority"]) ?? "medium",
    assigned_to: (row.assigned_to as string) ?? "",
    assigned_to_name: row.assigned_to_name as string | undefined,
    assigned_to_avatar: row.assigned_to_avatar as string | undefined,
    due_date: row.due_date as string,
    completed_at: row.completed_at as string | undefined,
    dependencies: (row.dependencies as string[]) ?? [],
    created_by: (row.created_by as string) ?? "",
    created_at: row.created_at as string,
    tags: (row.tags as string[]) ?? [],
  };
}

export async function getTasks(
  supabase: SupabaseClient,
  orgId: string,
  filters?: { deal_id?: string; status?: string; assigned_to?: string }
): Promise<ServiceResult<Task[]>> {
  let query = supabase
    .from("tasks")
    .select(`
      *,
      deals!tasks_deal_id_fkey(address),
      profiles!tasks_assigned_to_fkey(full_name, avatar_url)
    `)
    .eq("org_id", orgId)
    .order("due_date", { ascending: true });

  if (filters?.deal_id) query = query.eq("deal_id", filters.deal_id);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };

  const tasks = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const deal = r.deals as { address?: string } | null;
    const profile = r.profiles as { full_name?: string; avatar_url?: string } | null;
    return mapTaskRow({
      ...r,
      deal_address: deal?.address,
      assigned_to_name: profile?.full_name,
      assigned_to_avatar: profile?.avatar_url,
    });
  });

  return { data: tasks, error: null };
}

export async function createTask(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  input: Partial<Task>
): Promise<ServiceResult<Task>> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: orgId,
      created_by: userId,
      deal_id: input.deal_id || null,
      assigned_to: input.assigned_to || userId,
      title: input.title,
      description: input.description,
      status: input.status ?? "pending",
      priority: input.priority ?? "medium",
      due_date: input.due_date,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapTaskRow(data as Record<string, unknown>), error: null };
}

export async function updateTask(
  supabase: SupabaseClient,
  id: string,
  orgId: string,
  updates: Partial<Task>
): Promise<ServiceResult<Task>> {
  const updatePayload: Record<string, unknown> = {};
  if (updates.title !== undefined) updatePayload.title = updates.title;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.priority !== undefined) updatePayload.priority = updates.priority;
  if (updates.due_date !== undefined) updatePayload.due_date = updates.due_date;
  if (updates.assigned_to !== undefined) updatePayload.assigned_to = updates.assigned_to;
  if (updates.tags !== undefined) updatePayload.tags = updates.tags;
  if (updates.status === "completed") updatePayload.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapTaskRow(data as Record<string, unknown>), error: null };
}

export async function completeTask(
  supabase: SupabaseClient,
  id: string,
  orgId: string
): Promise<ServiceResult<Task>> {
  return updateTask(supabase, id, orgId, { status: "completed" });
}

export async function deleteTask(
  supabase: SupabaseClient,
  id: string,
  orgId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
