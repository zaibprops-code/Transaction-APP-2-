import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deal } from "@/types";

type ServiceResult<T> = { data: T | null; error: string | null };

function mapDealRow(row: Record<string, unknown>): Deal {
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    zip: (row.zip as string) ?? "",
    property_type: (row.property_type as Deal["property_type"]) ?? "single_family",
    status: (row.status as Deal["status"]) ?? "active",
    stage: (row.stage as Deal["stage"]) ?? "new_lead",
    buyer_name: (row.buyer_name as string) ?? "",
    buyer_email: row.buyer_email as string | undefined,
    buyer_phone: row.buyer_phone as string | undefined,
    seller_name: (row.seller_name as string) ?? "",
    seller_email: row.seller_email as string | undefined,
    seller_phone: row.seller_phone as string | undefined,
    listing_agent: row.listing_agent as string | undefined,
    buyers_agent: row.buyers_agent as string | undefined,
    purchase_price: Number(row.purchase_price ?? 0),
    earnest_money: row.earnest_money != null ? Number(row.earnest_money) : undefined,
    down_payment: row.down_payment != null ? Number(row.down_payment) : undefined,
    loan_amount: row.loan_amount != null ? Number(row.loan_amount) : undefined,
    closing_date: row.closing_date as string,
    contract_date: (row.contract_date as string) ?? "",
    health_score: Number(row.health_score ?? 80),
    health_factors: [],
    assigned_to: (row.assigned_to as string) ?? "",
    created_by: (row.created_by as string) ?? "",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    task_count: Number(row.task_count ?? 0),
    doc_count: Number(row.doc_count ?? 0),
    pending_sigs: Number(row.pending_sigs ?? 0),
  };
}

export async function getDeals(
  supabase: SupabaseClient,
  orgId: string,
  filters?: { status?: string; stage?: string }
): Promise<ServiceResult<Deal[]>> {
  let query = supabase
    .from("deals")
    .select("*")
    .eq("org_id", orgId)
    .eq("status", filters?.status ?? "active")
    .order("created_at", { ascending: false });

  if (filters?.stage) query = query.eq("stage", filters.stage);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapDealRow), error: null };
}

export async function getDeal(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<Deal>> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapDealRow(data as Record<string, unknown>), error: null };
}

export async function createDeal(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  input: Partial<Deal>
): Promise<ServiceResult<Deal>> {
  const { data, error } = await supabase
    .from("deals")
    .insert({
      org_id: orgId,
      created_by: userId,
      assigned_to: input.assigned_to ?? userId,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      property_type: input.property_type ?? "single_family",
      buyer_name: input.buyer_name,
      buyer_email: input.buyer_email,
      buyer_phone: input.buyer_phone,
      seller_name: input.seller_name ?? "",
      seller_email: input.seller_email,
      seller_phone: input.seller_phone,
      purchase_price: input.purchase_price ?? 0,
      earnest_money: input.earnest_money,
      loan_amount: input.loan_amount,
      closing_date: input.closing_date,
      contract_date: input.contract_date,
      stage: input.stage ?? "new_lead",
      status: "active",
      health_score: 80,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Log activity
  await supabase.from("activity_log").insert({
    org_id: orgId,
    user_id: userId,
    deal_id: (data as Record<string, unknown>).id,
    action: "created",
    entity_type: "deal",
    entity_id: (data as Record<string, unknown>).id,
    description: `Created deal for ${input.address}`,
  });

  return { data: mapDealRow(data as Record<string, unknown>), error: null };
}

export async function updateDeal(
  supabase: SupabaseClient,
  id: string,
  orgId: string,
  userId: string,
  updates: Partial<Deal>
): Promise<ServiceResult<Deal>> {
  const { data, error } = await supabase
    .from("deals")
    .update({
      address: updates.address,
      city: updates.city,
      state: updates.state,
      zip: updates.zip,
      property_type: updates.property_type,
      buyer_name: updates.buyer_name,
      buyer_email: updates.buyer_email,
      buyer_phone: updates.buyer_phone,
      seller_name: updates.seller_name,
      seller_email: updates.seller_email,
      seller_phone: updates.seller_phone,
      purchase_price: updates.purchase_price,
      earnest_money: updates.earnest_money,
      loan_amount: updates.loan_amount,
      contract_date: updates.contract_date,
      closing_date: updates.closing_date,
      stage: updates.stage,
      status: updates.status,
      health_score: updates.health_score,
      notes: (updates as Record<string, unknown>).notes,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  await supabase.from("activity_log").insert({
    org_id: orgId,
    user_id: userId,
    deal_id: id,
    action: "updated",
    entity_type: "deal",
    entity_id: id,
    description: "Deal updated",
  });

  return { data: mapDealRow(data as Record<string, unknown>), error: null };
}

export async function archiveDeal(
  supabase: SupabaseClient,
  id: string,
  orgId: string
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase
    .from("deals")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function getDealTimeline(
  supabase: SupabaseClient,
  dealId: string
): Promise<ServiceResult<Record<string, unknown>[]>> {
  const { data, error } = await supabase
    .from("deal_timeline")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
