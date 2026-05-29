import { NextRequest } from "next/server";
import { MOCK_TASKS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getTasks, createTask } from "@/lib/services/tasks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  if (isDemo()) {
    let tasks = [...MOCK_TASKS];
    if (dealId) tasks = tasks.filter((t) => t.deal_id === dealId);
    if (status) tasks = tasks.filter((t) => t.status === status);
    return ok({ tasks, total: tasks.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getTasks(ctx.supabase, ctx.orgId, { deal_id: dealId, status });
  if (svcError) return err(svcError, 500);
  return ok({ tasks: data, total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  if (isDemo()) {
    const body = await request.json() as Record<string, unknown>;
    return ok({
      task: {
        id: `task-${Date.now()}`,
        org_id: "org-1",
        ...body,
        created_at: new Date().toISOString(),
      },
    }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  const { data, error: svcError } = await createTask(
    ctx.supabase,
    ctx.orgId,
    ctx.userId,
    body as Parameters<typeof createTask>[3]
  );
  if (svcError) return err(svcError, 400);
  return ok({ task: data }, 201);
}
