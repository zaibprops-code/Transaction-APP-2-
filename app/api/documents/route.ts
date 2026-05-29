import { NextRequest } from "next/server";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getDocuments, insertDocumentRecord } from "@/lib/services/documents";
import { demoStore } from "@/lib/demo-store";
import type { Document } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  if (isDemo()) {
    let docs = [...MOCK_DOCUMENTS, ...demoStore.getDocs()];
    if (dealId) docs = docs.filter((d) => d.deal_id === dealId);
    if (category) docs = docs.filter((d) => d.category === category);
    return ok({ documents: docs, total: docs.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getDocuments(ctx.supabase, ctx.orgId, dealId);
  if (svcError) return err(svcError, 500);
  return ok({ documents: data, total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  if (isDemo()) {
    const body = await request.json() as Record<string, unknown>;
    return ok({
      document: {
        id: `doc-${Date.now()}`,
        org_id: "org-1",
        ...body,
        created_at: new Date().toISOString(),
      },
    }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as {
    deal_id?: string;
    client_id?: string;
    name: string;
    category: Document["category"];
    file_path: string;
    file_size: number;
    mime_type: string;
  };

  const { data, error: svcError } = await insertDocumentRecord(
    ctx.supabase,
    ctx.orgId,
    ctx.userId,
    body
  );
  if (svcError) return err(svcError, 400);
  return ok({ document: data }, 201);
}
