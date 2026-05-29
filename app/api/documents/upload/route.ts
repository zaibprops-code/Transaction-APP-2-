import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { uploadFile } from "@/lib/services/documents";

export async function POST(request: NextRequest) {
  if (isDemo()) {
    return ok({ path: `demo/file-${Date.now()}.pdf`, url: "" }, 201);
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const dealId = formData.get("deal_id") as string | null;
  const bucket = (formData.get("bucket") as string) ?? "client-documents";

  if (!file) return err("No file provided");

  const ext = file.name.split(".").pop() ?? "bin";
  const path = dealId
    ? `${ctx.orgId}/${dealId}/${Date.now()}-${file.name}`
    : `${ctx.orgId}/${Date.now()}-${file.name}`;

  const { data: filePath, error: uploadError } = await uploadFile(ctx.supabase, bucket, path, file);
  if (uploadError) return err(uploadError, 500);

  return ok({ path: filePath, bucket }, 201);
}
