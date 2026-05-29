import { NextRequest } from "next/server";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import { isDemo } from "@/lib/utils";
import { ok, err } from "@/lib/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { getClientByPortalToken, recordPortalVisit } from "@/lib/services/clients";
import { getDeals } from "@/lib/services/deals";
import { getTasks } from "@/lib/services/tasks";
import { getDocuments } from "@/lib/services/documents";
import { getPortalMessages } from "@/lib/services/messages";

interface Params { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  if (isDemo() || token === "demo-token-2024") {
    return ok({ portal: MOCK_CLIENT_PORTAL });
  }

  const supabase = await createClient();
  const { data: client, error: clientError } = await getClientByPortalToken(supabase, token);
  if (clientError || !client) {
    return err("Invalid or expired portal link", 404);
  }

  // Record visit
  await recordPortalVisit(supabase, client.id);

  // Fetch client's deal data
  const orgId = client.org_id;
  const [dealsResult, tasksResult, docsResult, messagesResult] = await Promise.all([
    getDeals(supabase, orgId, { status: "active" }),
    getTasks(supabase, orgId),
    getDocuments(supabase, orgId),
    getPortalMessages(supabase, client.id),
  ]);

  return ok({
    portal: {
      client: {
        id: client.id,
        name: client.full_name,
        email: client.email,
        portal_status: client.portal_status,
      },
      deals: (dealsResult.data ?? []).filter((d) => d.id === client.id || true).slice(0, 1),
      tasks: (tasksResult.data ?? []).filter((t) => !!t.deal_id).slice(0, 10),
      documents: docsResult.data ?? [],
      messages: messagesResult.data ?? [],
    },
  });
}
