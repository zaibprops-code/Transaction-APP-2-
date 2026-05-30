import { NextRequest } from "next/server";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getSignatureRequests, createSignatureRequest } from "@/lib/services/signatures";
import { demoStore } from "@/lib/demo-store";
import type { SignatureParticipant, SignatureField } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("deal_id") ?? undefined;

  if (isDemo()) {
    let reqs = [...MOCK_SIGNATURE_REQUESTS, ...demoStore.getSignatures()];
    if (dealId) reqs = reqs.filter(r => r.deal_id === dealId);
    return ok({ requests: reqs, total: reqs.length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getSignatureRequests(ctx.supabase, ctx.orgId, dealId);
  if (svcError) return err(svcError, 500);
  return ok({ requests: data, total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    deal_id?: string;
    document_id: string;
    title: string;
    expires_at: string;
    participants: Array<{ name: string; email: string; role: SignatureParticipant["role"]; signing_order: number }>;
    fields?: Array<{ field_type: SignatureField["field_type"]; page: number; participant_index: number; x_percent?: number; y_percent?: number; label?: string }>;
  };

  if (isDemo()) {
    const mockRequest = {
      id: `sig-${Date.now()}`,
      deal_id: body.deal_id ?? "",
      deal_address: "Demo Property",
      org_id: "org-1",
      document_id: body.document_id,
      document_name: "Document",
      title: body.title,
      signers: body.participants.map((p, i) => ({
        id: `signer-demo-${i}`,
        name: p.name,
        email: p.email,
        role: p.role,
        status: "pending" as const,
      })),
      participants: body.participants.map((p, i) => ({
        id: `signer-demo-${i}`,
        request_id: `sig-${Date.now()}`,
        name: p.name,
        email: p.email,
        role: p.role,
        signing_order: p.signing_order,
        status: "pending" as const,
        signing_token: `demo-token-new-${i}`,
        created_at: new Date().toISOString(),
      })),
      fields: [],
      audit_logs: [{ id: `log-${Date.now()}`, request_id: `sig-${Date.now()}`, action: "request_created", metadata: {}, created_at: new Date().toISOString() }],
      status: "pending" as const,
      expires_at: body.expires_at,
      audit_trail: [],
      created_by: "user-1",
      created_at: new Date().toISOString(),
    };
    demoStore.addSignature(mockRequest);
    return ok({ request: mockRequest }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  if (!body.document_id || !body.title || !body.participants?.length) {
    return err("document_id, title, and participants are required.");
  }

  const { data, error: svcError } = await createSignatureRequest(
    ctx.supabase, ctx.orgId, ctx.userId, body
  );
  if (svcError) return err(svcError, 400);
  return ok({ request: data }, 201);
}
