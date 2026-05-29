import { NextRequest } from "next/server";
import { MOCK_DEALS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getDeal, updateDeal, archiveDeal } from "@/lib/services/deals";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const deal = MOCK_DEALS.find((d) => d.id === id);
    if (!deal) return err("Deal not found", 404);
    return ok({ deal });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getDeal(ctx.supabase, id);
  if (svcError) return err(svcError, svcError.includes("not found") ? 404 : 500);
  return ok({ deal: data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const deal = MOCK_DEALS.find((d) => d.id === id);
    if (!deal) return err("Deal not found", 404);
    const body = await request.json() as Record<string, unknown>;
    return ok({ deal: { ...deal, ...body, updated_at: new Date().toISOString() } });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  const { data, error: svcError } = await updateDeal(
    ctx.supabase,
    id,
    ctx.orgId,
    ctx.userId,
    body as Parameters<typeof updateDeal>[4]
  );
  if (svcError) return err(svcError, 400);
  return ok({ deal: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) return ok({ success: true });

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { error: svcError } = await archiveDeal(ctx.supabase, id, ctx.orgId);
  if (svcError) return err(svcError, 400);
  return ok({ success: true });
}
