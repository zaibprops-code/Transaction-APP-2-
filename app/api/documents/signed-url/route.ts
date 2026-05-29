import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getSignedUrl } from "@/lib/services/documents";

export async function POST(request: NextRequest) {
  const body = await request.json() as { file_path: string; bucket?: string };
  const { file_path, bucket = "client-documents" } = body;

  if (!file_path) return err("file_path is required");

  // In demo mode, return a placeholder — real files are in demo store
  if (isDemo()) {
    // For demo files we can't generate real signed URLs, so return null
    // The viewer will fall back to download-only mode
    return ok({ signed_url: null, expires_in: 0 });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data: signedUrl, error: svcError } = await getSignedUrl(ctx.supabase, file_path, bucket);
  if (svcError) return err(svcError, 500);

  return ok({ signed_url: signedUrl, expires_in: 3600 });
}
