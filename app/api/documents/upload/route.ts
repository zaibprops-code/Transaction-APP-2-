import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { uploadFile, insertDocumentRecord } from "@/lib/services/documents";
import { demoStore } from "@/lib/demo-store";
import type { Document } from "@/types";

function detectCategory(name: string): Document["category"] {
  const n = name.toLowerCase();
  if (/agreement|contract|purchase|offer/.test(n)) return "purchase_agreement";
  if (/disclos/.test(n)) return "disclosure";
  if (/inspect/.test(n)) return "inspection";
  if (/title|deed/.test(n)) return "title";
  if (/financ|loan|mortgage|lender/.test(n)) return "financing";
  if (/clos|hud|settlement/.test(n)) return "closing";
  if (/addend/.test(n)) return "addendum";
  return "other";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const dealId = (formData.get("deal_id") as string | null) ?? undefined;
  const categoryOverride = formData.get("category") as Document["category"] | null;
  const bucket = (formData.get("bucket") as string) ?? "client-documents";

  if (!file) return err("No file provided");

  const category = categoryOverride ?? detectCategory(file.name);

  if (isDemo()) {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      org_id: "org-1",
      deal_id: dealId ?? "",
      name: file.name,
      file_path: `demo/${Date.now()}-${file.name}`,
      file_size: file.size,
      mime_type: file.type,
      category,
      uploaded_by: "user-1",
      created_at: new Date().toISOString(),
    };
    demoStore.addDoc(newDoc);
    return ok({ document: newDoc, path: newDoc.file_path }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const path = dealId
    ? `${ctx.orgId}/${dealId}/${Date.now()}-${file.name}`
    : `${ctx.orgId}/${Date.now()}-${file.name}`;

  const { data: filePath, error: uploadError } = await uploadFile(ctx.supabase, bucket, path, file);
  if (uploadError) return err(uploadError, 500);

  const { data: doc, error: dbError } = await insertDocumentRecord(ctx.supabase, ctx.orgId, ctx.userId, {
    deal_id: dealId,
    name: file.name,
    category,
    file_path: filePath ?? path,
    file_size: file.size,
    mime_type: file.type,
  });
  if (dbError) return err(dbError, 500);

  // Non-blocking activity log
  ctx.supabase.from("activity_log").insert({
    org_id: ctx.orgId,
    user_id: ctx.userId,
    deal_id: dealId ?? null,
    action: "uploaded",
    entity_type: "document",
    entity_id: doc?.id,
    description: `Uploaded ${file.name}`,
  }).then(() => {}, () => {});

  return ok({ document: doc, path: filePath, bucket }, 201);
}
