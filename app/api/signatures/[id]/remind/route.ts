import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { sendParticipantReminder, getSignatureRequest } from "@/lib/services/signatures";
import { sendSigningReminder } from "@/lib/email";
import { demoStore } from "@/lib/demo-store";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({})) as { participant_id?: string };

  if (isDemo()) {
    const req = demoStore.getSignature(id) ?? MOCK_SIGNATURE_REQUESTS.find(r => r.id === id);
    if (!req) return err("Not found", 404);
    return ok({ reminders_sent: req.participants?.filter(p => p.status !== "signed").length ?? 1 });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data: req, error: fetchError } = await getSignatureRequest(ctx.supabase, ctx.orgId, id);
  if (fetchError || !req) return err(fetchError ?? "Not found", 404);

  const { data: participants, error: remindError } = await sendParticipantReminder(
    ctx.supabase, id, ctx.orgId, body.participant_id
  );
  if (remindError) return err(remindError, 400);

  for (const p of participants ?? []) {
    if (p.signing_token) {
      await sendSigningReminder(
        p.email,
        p.name,
        req.title || req.document_name || "Document",
        "CloseTrack",
        p.signing_token,
        req.expires_at
      );
    }
  }

  return ok({ reminders_sent: participants?.length ?? 0 });
}
