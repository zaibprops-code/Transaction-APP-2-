import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapDocRow(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    deal_id: (row.deal_id as string) ?? "",
    deal_address: row.deal_address as string | undefined,
    org_id: row.org_id as string,
    name: row.name as string,
    file_path: row.file_path as string,
    file_size: Number(row.file_size ?? 0),
    mime_type: (row.mime_type as string) ?? "application/octet-stream",
    category: (row.category as Document["category"]) ?? "other",
    ai_extracted: row.ai_extracted as Record<string, unknown> | undefined,
    uploaded_by: (row.uploaded_by as string) ?? "",
    uploaded_by_name: row.uploaded_by_name as string | undefined,
    created_at: row.created_at as string,
    version: Number(row.version ?? 1),
    is_signed: Boolean(row.is_signed),
  };
}

export async function getDocuments(
  supabase: SupabaseClient,
  orgId: string,
  dealId?: string
): Promise<ServiceResult<Document[]>> {
  let query = supabase
    .from("documents")
    .select(`
      *,
      deals!documents_deal_id_fkey(address),
      profiles!documents_uploaded_by_fkey(full_name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (dealId) query = query.eq("deal_id", dealId);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };

  const docs = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const deal = r.deals as { address?: string } | null;
    const profile = r.profiles as { full_name?: string } | null;
    return mapDocRow({
      ...r,
      deal_address: deal?.address,
      uploaded_by_name: profile?.full_name,
    });
  });

  return { data: docs, error: null };
}

export async function insertDocumentRecord(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  input: {
    deal_id?: string;
    client_id?: string;
    name: string;
    category: Document["category"];
    file_path: string;
    file_size: number;
    mime_type: string;
  }
): Promise<ServiceResult<Document>> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      org_id: orgId,
      uploaded_by: userId,
      deal_id: input.deal_id ?? null,
      client_id: input.client_id ?? null,
      name: input.name,
      category: input.category,
      file_path: input.file_path,
      file_size: input.file_size,
      mime_type: input.mime_type,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapDocRow(data as Record<string, unknown>), error: null };
}

export async function getSignedUrl(
  supabase: SupabaseClient,
  filePath: string,
  bucket = "documents"
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600); // 1 hour
  if (error) return { data: null, error: error.message };
  return { data: data.signedUrl, error: null };
}

export async function uploadFile(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File | Blob
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false });
  if (error) return { data: null, error: error.message };
  return { data: data.path, error: null };
}
