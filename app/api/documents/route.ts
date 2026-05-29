import { NextRequest, NextResponse } from "next/server";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id");
  const category = searchParams.get("category");

  let docs = MOCK_DOCUMENTS;
  if (dealId) docs = docs.filter(d => d.deal_id === dealId);
  if (category) docs = docs.filter(d => d.category === category);

  return NextResponse.json({ documents: docs, total: docs.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        document: {
          id: `doc-${Date.now()}`,
          org_id: "org-1",
          ...body,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
