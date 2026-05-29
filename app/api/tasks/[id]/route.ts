import { NextRequest } from "next/server";
import { MOCK_TASKS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { updateTask, deleteTask } from "@/lib/services/tasks";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const task = MOCK_TASKS.find((t) => t.id === id);
    if (!task) return err("Task not found", 404);
    return ok({ task });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  // Re-use updateTask with no-op to get the task (or add getTask to service)
  const { data: { user } } = await ctx.supabase.auth.getUser();
  const { data, error: svcError } = await ctx.supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("org_id", ctx.orgId)
    .single();
  if (svcError) return err(svcError.message, 404);
  return ok({ task: data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const task = MOCK_TASKS.find((t) => t.id === id);
    if (!task) return err("Task not found", 404);
    const body = await request.json() as Record<string, unknown>;
    return ok({ task: { ...task, ...body } });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  const { data, error: svcError } = await updateTask(
    ctx.supabase,
    id,
    ctx.orgId,
    body as Parameters<typeof updateTask>[3]
  );
  if (svcError) return err(svcError, 400);
  return ok({ task: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) return ok({ success: true });

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { error: svcError } = await deleteTask(ctx.supabase, id, ctx.orgId);
  if (svcError) return err(svcError, 400);
  return ok({ success: true });
}
