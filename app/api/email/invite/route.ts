import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { sendPortalInvite } from "@/lib/email";
import { updatePortalStatus } from "@/lib/services/clients";

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    client_id: string;
    client_email: string;
    client_name: string;
    portal_token: string;
    agent_name?: string;
  };

  if (isDemo()) {
    console.log(`[Demo] Portal invite to ${body.client_email}`);
    return ok({ success: true, message: "Invite sent (demo mode)" });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { error: emailError } = await sendPortalInvite(
    body.client_email,
    body.client_name,
    body.portal_token,
    body.agent_name ?? "Your Agent"
  );

  if (emailError) return err(`Email failed: ${emailError}`, 500);

  // Mark invite as sent
  await updatePortalStatus(ctx.supabase, body.client_id, ctx.orgId, true, "invite_sent");

  return ok({ success: true });
}
