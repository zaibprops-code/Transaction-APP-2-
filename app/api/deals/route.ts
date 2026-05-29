import { NextRequest, NextResponse } from "next/server";
import { MOCK_DEALS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const status = searchParams.get("status") ?? "active";

  let deals = MOCK_DEALS.filter(d => d.status === status);
  if (stage) deals = deals.filter(d => d.stage === stage);

  return NextResponse.json({ deals, total: deals.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newDeal = {
      id: `deal-${Date.now()}`,
      org_id: "org-1",
      ...body,
      health_score: 80,
      health_factors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ deal: newDeal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
