import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getClients, createClient } from "@/lib/services/clients";

// Demo mock clients
const DEMO_CLIENTS = [
  { id: "client-1", org_id: "org-1", full_name: "David & Emily Park", email: "david.park@email.com", phone: "(555) 123-4567", portal_token: "demo-token-2024", portal_enabled: true, portal_status: "client_active", last_portal_visit: new Date(Date.now() - 2 * 3600000).toISOString(), notes: null, avatar_url: null, created_at: "2024-01-15T00:00:00Z" },
  { id: "client-2", org_id: "org-1", full_name: "Michael Torres", email: "m.torres@email.com", phone: "(555) 234-5678", portal_token: "demo-token-2", portal_enabled: true, portal_status: "invite_sent", last_portal_visit: null, notes: null, avatar_url: null, created_at: "2024-02-01T00:00:00Z" },
  { id: "client-3", org_id: "org-1", full_name: "Jennifer Walsh", email: "j.walsh@email.com", phone: "(555) 345-6789", portal_token: "demo-token-3", portal_enabled: false, portal_status: "invite_pending", last_portal_visit: null, notes: null, avatar_url: null, created_at: "2024-02-10T00:00:00Z" },
];

export async function GET() {
  if (isDemo()) {
    return ok({ clients: DEMO_CLIENTS, total: DEMO_CLIENTS.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getClients(ctx.supabase, ctx.orgId);
  if (svcError) return err(svcError, 500);
  return ok({ clients: data, total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  if (isDemo()) {
    const body = await request.json() as Record<string, unknown>;
    return ok({
      client: {
        id: `client-${Date.now()}`,
        org_id: "org-1",
        portal_token: `demo-token-${Date.now()}`,
        portal_enabled: false,
        portal_status: "invite_pending",
        ...body,
        created_at: new Date().toISOString(),
      },
    }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as Parameters<typeof createClient>[2];
  const { data, error: svcError } = await createClient(ctx.supabase, ctx.orgId, body);
  if (svcError) return err(svcError, 400);
  return ok({ client: data }, 201);
}
