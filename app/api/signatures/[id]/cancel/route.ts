import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { cancelSignatureRequest } from "@/lib/services/signatures";
import { demoStore } from "@/lib/demo-store";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDemo()) {
    const req = demoStore.getSignature(id) ?? MOCK_SIGNATURE_REQUESTS.find(r => r.id === id);
    if (!req) return err("Not found", 404);
    demoStore.updateSignature(id, { status: "cancelled" });
    return ok({ cancelled: true });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { error: cancelError } = await cancelSignatureRequest(ctx.supabase, id, ctx.orgId);
  if (cancelError) return err(cancelError, 400);
  return ok({ cancelled: true });
}
