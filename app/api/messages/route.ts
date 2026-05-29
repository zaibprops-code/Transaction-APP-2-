import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getMessages, sendMessage } from "@/lib/services/messages";

const DEMO_MESSAGES = [
  { id: "msg-1", org_id: "org-1", deal_id: "deal-1", sender_id: "user-1", sender_name: "Sarah Mitchell", content: "Inspection report received — looks clean overall, minor HVAC issue noted.", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "msg-2", org_id: "org-1", deal_id: "deal-1", sender_id: "user-2", sender_name: "Marcus Johnson", content: "Lender confirmed the appraisal is scheduled for Thursday morning.", is_read: true, created_at: new Date(Date.now() - 43200000).toISOString() },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id");

  if (isDemo()) {
    const msgs = dealId ? DEMO_MESSAGES.filter((m) => m.deal_id === dealId) : DEMO_MESSAGES;
    return ok({ messages: msgs });
  }

  if (!dealId) return err("deal_id required");

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getMessages(ctx.supabase, dealId);
  if (svcError) return err(svcError, 500);
  return ok({ messages: data });
}

export async function POST(request: NextRequest) {
  if (isDemo()) {
    const body = await request.json() as Record<string, unknown>;
    return ok({
      message: {
        id: `msg-${Date.now()}`,
        org_id: "org-1",
        sender_name: "Sarah Mitchell",
        is_read: false,
        ...body,
        created_at: new Date().toISOString(),
      },
    }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as { deal_id?: string; content: string };
  const { data, error: svcError } = await sendMessage(ctx.supabase, ctx.orgId, ctx.userId, body);
  if (svcError) return err(svcError, 400);
  return ok({ message: data }, 201);
}
