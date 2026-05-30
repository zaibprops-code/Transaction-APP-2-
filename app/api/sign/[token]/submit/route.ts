import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { submitSignature } from "@/lib/services/signatures";
import { createClient } from "@/lib/supabase/server";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json() as {
    signature_data: string;
    field_values?: Record<string, string>;
  };

  if (isDemo()) {
    // Simulate successful signing in demo mode
    const allRequests = MOCK_SIGNATURE_REQUESTS;
    let foundParticipant = null;

    for (const req of allRequests) {
      const p = req.participants?.find(p => p.signing_token === token);
      if (p) { foundParticipant = p; break; }
    }

    if (!foundParticipant) return err("Invalid signing token.", 404);

    return ok({ success: true, completed: false, message: "Document signed successfully (demo mode)." });
  }

  if (!body.signature_data) {
    return err("signature_data is required.");
  }

  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const supabase = await createClient();
  const { data, error } = await submitSignature(
    supabase,
    token,
    body.signature_data,
    body.field_values ?? {},
    forwardedFor,
    userAgent
  );

  if (error) return err(error, 400);
  return ok({ success: true, completed: data?.completed ?? false });
}
