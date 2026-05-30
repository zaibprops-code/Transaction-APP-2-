import { NextRequest } from "next/server";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getSignatureRequest } from "@/lib/services/signatures";
import { demoStore } from "@/lib/demo-store";
import type { SignatureRequest } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDemo()) {
    const req = [...MOCK_SIGNATURE_REQUESTS, ...demoStore.getSignatures()].find(r => r.id === id);
    if (!req) return err("Not found", 404);
    return ok({ request: req });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getSignatureRequest(ctx.supabase, ctx.orgId, id);
  if (svcError) return err(svcError, 404);
  return ok({ request: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json() as { status?: SignatureRequest["status"]; expires_at?: string; title?: string };

  if (isDemo()) {
    demoStore.updateSignature(id, body as Partial<SignatureRequest>);
    const req = demoStore.getSignature(id) ?? [...MOCK_SIGNATURE_REQUESTS].find(r => r.id === id);
    return ok({ request: req });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.expires_at) updates.expires_at = body.expires_at;
  if (body.title) updates.title = body.title;

  const { error: updateError } = await ctx.supabase
    .from("signature_requests")
    .update(updates)
    .eq("id", id)
    .eq("org_id", ctx.orgId);

  if (updateError) return err(updateError.message, 400);

  const { data, error: svcError } = await getSignatureRequest(ctx.supabase, ctx.orgId, id);
  if (svcError) return err(svcError, 404);
  return ok({ request: data });
}
