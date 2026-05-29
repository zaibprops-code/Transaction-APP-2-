import { NextRequest, NextResponse } from "next/server";
import { MOCK_DEALS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getDeals, createDeal } from "@/lib/services/deals";
import { demoStore } from "@/lib/demo-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") ?? undefined;
  const status = searchParams.get("status") ?? "active";

  if (isDemo()) {
    let deals = [...MOCK_DEALS, ...demoStore.getDeals()].filter((d) => d.status === (status ?? "active"));
    if (stage) deals = deals.filter((d) => d.stage === stage);
    return ok({ deals, total: deals.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getDeals(ctx.supabase, ctx.orgId, { status, stage });
  if (svcError) return err(svcError, 500);
  return ok({ deals: data, total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  if (isDemo()) {
    try {
      const body = await request.json() as Record<string, unknown>;
      const newDeal = {
        id: `deal-${Date.now()}`,
        org_id: "org-1",
        status: "active",
        ...body,
        health_score: 80,
        health_factors: [],
        task_count: 0,
        doc_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as import("@/types").Deal;
      demoStore.addDeal(newDeal);
      return ok({ deal: newDeal }, 201);
    } catch {
      return err("Failed to create deal", 500);
    }
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { data, error: svcError } = await createDeal(
      ctx.supabase,
      ctx.orgId,
      ctx.userId,
      body as Parameters<typeof createDeal>[3]
    );
    if (svcError) return err(svcError, 400);
    return ok({ deal: data }, 201);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
