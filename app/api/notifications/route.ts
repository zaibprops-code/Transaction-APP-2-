import { NextRequest } from "next/server";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/services/notifications";

export async function GET() {
  if (isDemo()) {
    return ok({ notifications: MOCK_NOTIFICATIONS, unread: MOCK_NOTIFICATIONS.filter((n) => !n.read).length });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const { data, error: svcError } = await getNotifications(ctx.supabase, ctx.userId);
  if (svcError) return err(svcError, 500);
  return ok({
    notifications: data,
    unread: data?.filter((n) => !n.read).length ?? 0,
  });
}

export async function PATCH(request: NextRequest) {
  if (isDemo()) return ok({ success: true });

  const { ctx, error } = await requireAuth();
  if (error) return error;

  const body = await request.json() as { id?: string; mark_all?: boolean };

  if (body.mark_all) {
    const { error: svcError } = await markAllNotificationsRead(ctx.supabase, ctx.userId);
    if (svcError) return err(svcError, 500);
    return ok({ success: true });
  }

  if (!body.id) return err("id required");
  const { error: svcError } = await markNotificationRead(ctx.supabase, body.id, ctx.userId);
  if (svcError) return err(svcError, 500);
  return ok({ success: true });
}
