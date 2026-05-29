import { NextRequest } from "next/server";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { updateProfile } from "@/lib/services/profiles";

export async function PATCH(request: NextRequest) {
  if (isDemo()) return ok({ success: true, profile: {} });

  const { ctx, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { data, error: updateError } = await updateProfile(ctx.supabase, ctx.userId, {
      full_name: body.full_name as string | undefined,
      title: body.title as string | undefined,
      phone: body.phone as string | undefined,
      avatar_url: body.avatar_url as string | undefined,
    });
    if (updateError) return err(updateError, 400);
    return ok({ success: true, profile: data });
  } catch {
    return err("Invalid request body", 400);
  }
}
