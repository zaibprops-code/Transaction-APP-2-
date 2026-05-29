import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getClient } from "@/lib/services/clients";

// Demo mock clients — mirrors /api/clients/route.ts
const DEMO_CLIENTS = [
  { id: "client-1", org_id: "org-1", full_name: "David & Emily Park", email: "david.park@email.com", phone: "(555) 123-4567", portal_token: "demo-token-2024", portal_enabled: true, portal_status: "client_active", last_portal_visit: new Date(Date.now() - 2 * 3600000).toISOString(), notes: null, avatar_url: null, created_at: "2024-01-15T00:00:00Z" },
  { id: "client-2", org_id: "org-1", full_name: "Michael Torres", email: "m.torres@email.com", phone: "(555) 234-5678", portal_token: "demo-token-2", portal_enabled: true, portal_status: "invite_sent", last_portal_visit: null, notes: null, avatar_url: null, created_at: "2024-02-01T00:00:00Z" },
  { id: "client-3", org_id: "org-1", full_name: "Jennifer Walsh", email: "j.walsh@email.com", phone: "(555) 345-6789", portal_token: "demo-token-3", portal_enabled: false, portal_status: "invite_pending", last_portal_visit: null, notes: null, avatar_url: null, created_at: "2024-02-10T00:00:00Z" },
];

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const client = DEMO_CLIENTS.find((c) => c.id === id);
    if (!client) return err("Client not found", 404);
    return ok({ client });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getClient(ctx.supabase, id);
  if (svcError) return err(svcError, svcError.includes("not found") ? 404 : 500);
  return ok({ client: data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (isDemo()) {
    const client = DEMO_CLIENTS.find((c) => c.id === id);
    if (!client) return err("Client not found", 404);
    const body = await request.json() as Record<string, unknown>;
    return ok({ client: { ...client, ...body } });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as Record<string, unknown>;
  const { error: updateError } = await ctx.supabase
    .from("clients")
    .update(body)
    .eq("id", id)
    .eq("org_id", ctx.orgId);

  if (updateError) return err(updateError.message, 400);
  return ok({ success: true });
}
