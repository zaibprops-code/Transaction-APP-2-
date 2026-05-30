import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { sendSignatureRequest, getSignatureRequest } from "@/lib/services/signatures";
import { sendSigningInvite } from "@/lib/email";
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
    demoStore.updateSignature(id, { status: "sent" });
    return ok({ sent: true, participants_notified: req.participants?.length ?? req.signers.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data: req, error: fetchError } = await getSignatureRequest(ctx.supabase, ctx.orgId, id);
  if (fetchError || !req) return err(fetchError ?? "Not found", 404);

  const { data: sendResult, error: sendError } = await sendSignatureRequest(ctx.supabase, id, ctx.orgId);
  if (sendError) return err(sendError, 400);

  // Send emails to each participant
  const participants = sendResult?.participants ?? [];
  for (const p of participants) {
    if (p.signing_token) {
      await sendSigningInvite(
        p.email,
        p.name,
        req.title || req.document_name || "Document",
        "CloseTrack",
        p.signing_token,
        req.expires_at
      );
    }
  }

  return ok({ sent: true, participants_notified: participants.length });
}
