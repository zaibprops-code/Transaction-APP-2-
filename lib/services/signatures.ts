import type { SupabaseClient } from "@supabase/supabase-js";
import type { SignatureRequest, SignatureParticipant, SignatureField, SignatureAuditLog } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapParticipant(row: Record<string, unknown>): SignatureParticipant {
  return {
    id: row.id as string,
    request_id: row.request_id as string,
    client_id: row.client_id as string | undefined,
    name: row.name as string,
    email: row.email as string,
    role: row.role as SignatureParticipant["role"],
    signing_order: Number(row.signing_order ?? 0),
    status: row.status as SignatureParticipant["status"],
    signing_token: row.signing_token as string | undefined,
    signed_at: row.signed_at as string | undefined,
    viewed_at: row.viewed_at as string | undefined,
    reminder_sent_at: row.reminder_sent_at as string | undefined,
    ip_address: row.ip_address as string | undefined,
    device_info: row.device_info as string | undefined,
    signature_data: row.signature_data as string | undefined,
    created_at: row.created_at as string,
  };
}

function mapField(row: Record<string, unknown>): SignatureField {
  return {
    id: row.id as string,
    request_id: row.request_id as string,
    participant_id: row.participant_id as string | undefined,
    page: Number(row.page ?? 1),
    field_type: row.field_type as SignatureField["field_type"],
    x_percent: Number(row.x_percent ?? 0),
    y_percent: Number(row.y_percent ?? 0),
    width_percent: Number(row.width_percent ?? 20),
    height_percent: Number(row.height_percent ?? 5),
    required: Boolean(row.required ?? true),
    value: row.value as string | undefined,
    label: row.label as string | undefined,
    created_at: row.created_at as string,
  };
}

function mapAuditLog(row: Record<string, unknown>): SignatureAuditLog {
  return {
    id: row.id as string,
    request_id: row.request_id as string,
    participant_id: row.participant_id as string | undefined,
    action: row.action as string,
    ip_address: row.ip_address as string | undefined,
    device_info: row.device_info as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  };
}

function mapRequest(
  row: Record<string, unknown>,
  participants: SignatureParticipant[],
  fields: SignatureField[],
  auditLogs: SignatureAuditLog[]
): SignatureRequest {
  return {
    id: row.id as string,
    deal_id: (row.deal_id as string) ?? "",
    deal_address: row.deal_address as string | undefined,
    org_id: row.org_id as string,
    document_id: (row.document_id as string) ?? "",
    document_name: row.document_name as string | undefined,
    title: (row.title as string) ?? "",
    signers: participants.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      status: p.status,
      signed_at: p.signed_at,
      ip_address: p.ip_address,
    })),
    participants,
    fields,
    audit_logs: auditLogs,
    status: row.status as SignatureRequest["status"],
    expires_at: row.expires_at as string,
    completed_at: row.completed_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
    audit_trail: [],
    created_by: row.created_by as string,
    created_at: row.created_at as string,
  };
}

export async function getSignatureRequests(
  supabase: SupabaseClient,
  orgId: string,
  dealId?: string
): Promise<ServiceResult<SignatureRequest[]>> {
  let query = supabase
    .from("signature_requests")
    .select(`*, deals!signature_requests_deal_id_fkey(address), documents!signature_requests_document_id_fkey(name)`)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (dealId) query = query.eq("deal_id", dealId);

  const { data: reqRows, error: reqError } = await query;
  if (reqError) return { data: null, error: reqError.message };

  const requests: SignatureRequest[] = [];
  for (const row of reqRows ?? []) {
    const r = row as Record<string, unknown>;
    const deal = r.deals as { address?: string } | null;
    const doc = r.documents as { name?: string } | null;

    const [partResult, fieldResult, logResult] = await Promise.all([
      supabase.from("signature_participants").select("*").eq("request_id", r.id as string).order("signing_order"),
      supabase.from("signature_fields").select("*").eq("request_id", r.id as string).order("page"),
      supabase.from("signature_audit_logs").select("*").eq("request_id", r.id as string).order("created_at"),
    ]);

    requests.push(mapRequest(
      { ...r, deal_address: deal?.address, document_name: doc?.name },
      (partResult.data ?? []).map(p => mapParticipant(p as Record<string, unknown>)),
      (fieldResult.data ?? []).map(f => mapField(f as Record<string, unknown>)),
      (logResult.data ?? []).map(l => mapAuditLog(l as Record<string, unknown>))
    ));
  }

  return { data: requests, error: null };
}

export async function getSignatureRequest(
  supabase: SupabaseClient,
  orgId: string,
  id: string
): Promise<ServiceResult<SignatureRequest>> {
  const { data: row, error } = await supabase
    .from("signature_requests")
    .select(`*, deals!signature_requests_deal_id_fkey(address), documents!signature_requests_document_id_fkey(name)`)
    .eq("id", id)
    .eq("org_id", orgId)
    .single();

  if (error) return { data: null, error: error.message };

  const r = row as Record<string, unknown>;
  const deal = r.deals as { address?: string } | null;
  const doc = r.documents as { name?: string } | null;

  const [partResult, fieldResult, logResult] = await Promise.all([
    supabase.from("signature_participants").select("*").eq("request_id", id).order("signing_order"),
    supabase.from("signature_fields").select("*").eq("request_id", id).order("page"),
    supabase.from("signature_audit_logs").select("*").eq("request_id", id).order("created_at"),
  ]);

  return {
    data: mapRequest(
      { ...r, deal_address: deal?.address, document_name: doc?.name },
      (partResult.data ?? []).map(p => mapParticipant(p as Record<string, unknown>)),
      (fieldResult.data ?? []).map(f => mapField(f as Record<string, unknown>)),
      (logResult.data ?? []).map(l => mapAuditLog(l as Record<string, unknown>))
    ),
    error: null,
  };
}

export async function createSignatureRequest(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  input: {
    deal_id?: string;
    document_id: string;
    title: string;
    expires_at: string;
    participants: Array<{ name: string; email: string; role: SignatureParticipant["role"]; signing_order: number }>;
    fields?: Array<{ field_type: SignatureField["field_type"]; page: number; participant_index: number; x_percent?: number; y_percent?: number; width_percent?: number; height_percent?: number; label?: string }>;
  }
): Promise<ServiceResult<SignatureRequest>> {
  const { data: reqRow, error: reqError } = await supabase
    .from("signature_requests")
    .insert({
      org_id: orgId,
      deal_id: input.deal_id ?? null,
      document_id: input.document_id,
      title: input.title,
      status: "pending",
      expires_at: input.expires_at,
      created_by: userId,
    })
    .select()
    .single();

  if (reqError) return { data: null, error: reqError.message };

  const reqId = (reqRow as Record<string, unknown>).id as string;

  const partInserts = input.participants.map(p => ({
    request_id: reqId,
    name: p.name,
    email: p.email,
    role: p.role,
    signing_order: p.signing_order,
    status: "pending" as const,
  }));

  const { data: partRows, error: partError } = await supabase
    .from("signature_participants")
    .insert(partInserts)
    .select();

  if (partError) return { data: null, error: partError.message };

  const participants = (partRows ?? []).map(p => mapParticipant(p as Record<string, unknown>));

  let fields: SignatureField[] = [];
  if (input.fields && input.fields.length > 0) {
    const fieldInserts = input.fields.map(f => ({
      request_id: reqId,
      participant_id: participants[f.participant_index]?.id ?? null,
      field_type: f.field_type,
      page: f.page,
      x_percent: f.x_percent ?? 10,
      y_percent: f.y_percent ?? 80,
      width_percent: f.width_percent ?? 20,
      height_percent: f.height_percent ?? 5,
      required: true,
      label: f.label ?? null,
    }));

    const { data: fieldRows, error: fieldError } = await supabase
      .from("signature_fields")
      .insert(fieldInserts)
      .select();

    if (!fieldError) {
      fields = (fieldRows ?? []).map(f => mapField(f as Record<string, unknown>));
    }
  }

  await supabase.from("signature_audit_logs").insert({
    request_id: reqId,
    action: "request_created",
    metadata: { created_by: userId },
  });

  return {
    data: mapRequest(
      { ...(reqRow as Record<string, unknown>), deal_address: undefined, document_name: undefined },
      participants,
      fields,
      []
    ),
    error: null,
  };
}

export async function sendSignatureRequest(
  supabase: SupabaseClient,
  id: string,
  orgId: string
): Promise<ServiceResult<{ participants: SignatureParticipant[] }>> {
  const { error } = await supabase
    .from("signature_requests")
    .update({ status: "sent" })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) return { data: null, error: error.message };

  const { data: partRows, error: partError } = await supabase
    .from("signature_participants")
    .update({ status: "sent" })
    .eq("request_id", id)
    .eq("status", "pending")
    .select();

  if (partError) return { data: null, error: partError.message };

  await supabase.from("signature_audit_logs").insert({
    request_id: id,
    action: "request_sent",
    metadata: {},
  });

  return {
    data: { participants: (partRows ?? []).map(p => mapParticipant(p as Record<string, unknown>)) },
    error: null,
  };
}

export async function cancelSignatureRequest(
  supabase: SupabaseClient,
  id: string,
  orgId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("signature_requests")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) return { data: null, error: error.message };

  await supabase.from("signature_audit_logs").insert({
    request_id: id,
    action: "request_cancelled",
    metadata: {},
  });

  return { data: true, error: null };
}

export async function sendParticipantReminder(
  supabase: SupabaseClient,
  requestId: string,
  orgId: string,
  participantId?: string
): Promise<ServiceResult<SignatureParticipant[]>> {
  let query = supabase
    .from("signature_participants")
    .select("*")
    .eq("request_id", requestId)
    .in("status", ["pending", "sent", "viewed"]);

  if (participantId) query = query.eq("id", participantId);

  const { data: partRows, error } = await query;
  if (error) return { data: null, error: error.message };

  const participants = (partRows ?? []).map(p => mapParticipant(p as Record<string, unknown>));

  for (const p of participants) {
    await supabase
      .from("signature_participants")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", p.id);

    await supabase.from("signature_audit_logs").insert({
      request_id: requestId,
      participant_id: p.id,
      action: "reminder_sent",
      metadata: { email: p.email },
    });
  }

  return { data: participants, error: null };
}

// ── Public signing operations (no auth required) ─────────────────────────────

export interface SigningSession {
  participant: SignatureParticipant;
  request: {
    id: string;
    title: string;
    document_name: string;
    document_id: string;
    deal_address?: string;
    expires_at: string;
    status: string;
  };
  fields: SignatureField[];
  documentUrl?: string;
}

export async function getSigningSession(
  supabase: SupabaseClient,
  token: string
): Promise<ServiceResult<SigningSession>> {
  const { data: partRow, error: partError } = await supabase
    .from("signature_participants")
    .select("*")
    .eq("signing_token", token)
    .single();

  if (partError || !partRow) return { data: null, error: "Invalid or expired signing link." };

  const participant = mapParticipant(partRow as Record<string, unknown>);

  if (participant.status === "signed") {
    return { data: null, error: "You have already signed this document." };
  }

  const { data: reqRow, error: reqError } = await supabase
    .from("signature_requests")
    .select(`*, deals!signature_requests_deal_id_fkey(address), documents!signature_requests_document_id_fkey(name, file_path)`)
    .eq("id", participant.request_id)
    .single();

  if (reqError || !reqRow) return { data: null, error: "Signature request not found." };

  const r = reqRow as Record<string, unknown>;
  const deal = r.deals as { address?: string } | null;
  const doc = r.documents as { name?: string; file_path?: string } | null;

  if (r.status === "cancelled" || r.status === "expired") {
    return { data: null, error: "This signature request has been cancelled or expired." };
  }

  if (r.expires_at && new Date(r.expires_at as string) < new Date()) {
    return { data: null, error: "This signing link has expired." };
  }

  const { data: fieldRows } = await supabase
    .from("signature_fields")
    .select("*")
    .eq("request_id", participant.request_id)
    .eq("participant_id", participant.id)
    .order("page");

  // Mark as viewed if first time
  if (!participant.viewed_at) {
    await supabase
      .from("signature_participants")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", participant.id);

    await supabase.from("signature_audit_logs").insert({
      request_id: participant.request_id,
      participant_id: participant.id,
      action: "document_viewed",
      metadata: {},
    });

    // Update request status to "viewed" if still "sent"
    await supabase
      .from("signature_requests")
      .update({ status: "viewed" })
      .eq("id", participant.request_id)
      .eq("status", "sent");
  }

  let documentUrl: string | undefined;
  if (doc?.file_path) {
    const { data: urlData } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_path, 3600);
    documentUrl = urlData?.signedUrl;
  }

  return {
    data: {
      participant: { ...participant, status: participant.viewed_at ? participant.status : "viewed" },
      request: {
        id: r.id as string,
        title: (r.title as string) || (doc?.name ?? "Document"),
        document_name: doc?.name ?? "Document",
        document_id: r.document_id as string,
        deal_address: deal?.address,
        expires_at: r.expires_at as string,
        status: r.status as string,
      },
      fields: (fieldRows ?? []).map(f => mapField(f as Record<string, unknown>)),
      documentUrl,
    },
    error: null,
  };
}

export async function submitSignature(
  supabase: SupabaseClient,
  token: string,
  signatureData: string,
  fieldValues: Record<string, string>,
  ipAddress: string,
  deviceInfo: string
): Promise<ServiceResult<{ completed: boolean }>> {
  const { data: partRow, error: partError } = await supabase
    .from("signature_participants")
    .select("*")
    .eq("signing_token", token)
    .single();

  if (partError || !partRow) return { data: null, error: "Invalid signing token." };

  const participant = mapParticipant(partRow as Record<string, unknown>);

  if (participant.status === "signed") {
    return { data: { completed: false }, error: null };
  }

  // Update participant as signed
  await supabase
    .from("signature_participants")
    .update({
      status: "signed",
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
      ip_address: ipAddress,
      device_info: deviceInfo,
    })
    .eq("id", participant.id);

  // Update field values
  for (const [fieldId, value] of Object.entries(fieldValues)) {
    await supabase
      .from("signature_fields")
      .update({ value })
      .eq("id", fieldId)
      .eq("request_id", participant.request_id);
  }

  // Log the signing
  await supabase.from("signature_audit_logs").insert({
    request_id: participant.request_id,
    participant_id: participant.id,
    action: "document_signed",
    ip_address: ipAddress,
    device_info: deviceInfo,
    metadata: { method: signatureData.startsWith("data:image") ? "drawn" : "typed" },
  });

  // Check if all participants have signed
  const { data: allParts } = await supabase
    .from("signature_participants")
    .select("status")
    .eq("request_id", participant.request_id);

  const allSigned = (allParts ?? []).every(p => (p as { status: string }).status === "signed");

  if (allSigned) {
    await supabase
      .from("signature_requests")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", participant.request_id);

    await supabase
      .from("documents")
      .update({ is_signed: true })
      .eq("id", (await supabase.from("signature_requests").select("document_id").eq("id", participant.request_id).single()).data?.document_id);

    await supabase.from("signature_audit_logs").insert({
      request_id: participant.request_id,
      action: "request_completed",
      metadata: {},
    });
  } else {
    await supabase
      .from("signature_requests")
      .update({ status: "partially_signed" })
      .eq("id", participant.request_id)
      .in("status", ["sent", "viewed"]);
  }

  return { data: { completed: allSigned }, error: null };
}
