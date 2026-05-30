import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { getSigningSession } from "@/lib/services/signatures";
import { createClient } from "@/lib/supabase/server";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (isDemo()) {
    const allRequests = MOCK_SIGNATURE_REQUESTS;
    let foundParticipant = null;
    let foundRequest = null;

    for (const req of allRequests) {
      const p = req.participants?.find(p => p.signing_token === token);
      if (p) {
        foundParticipant = p;
        foundRequest = req;
        break;
      }
    }

    if (!foundParticipant || !foundRequest) {
      return err("Invalid or expired signing link.", 404);
    }

    return ok({
      session: {
        participant: foundParticipant,
        request: {
          id: foundRequest.id,
          title: foundRequest.title,
          document_name: foundRequest.document_name ?? "Document",
          document_id: foundRequest.document_id,
          deal_address: foundRequest.deal_address,
          expires_at: foundRequest.expires_at,
          status: foundRequest.status,
        },
        fields: foundRequest.fields?.filter(f => f.participant_id === foundParticipant!.id) ?? [],
        documentUrl: null,
      },
    });
  }

  const supabase = await createClient();
  const { data, error } = await getSigningSession(supabase, token);
  if (error) return err(error, 404);
  return ok({ session: data });
}
