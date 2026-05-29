import { MOCK_KPI, MOCK_ACTIVITIES, MOCK_AI_INSIGHTS } from "@/lib/mock-data";
import { isDemo } from "@/lib/utils";
import { requireAuth, ok, err } from "@/lib/api-helpers";

export async function GET() {
  if (isDemo()) {
    return ok({
      kpi: MOCK_KPI,
      activities: MOCK_ACTIVITIES.slice(0, 10),
      insights: MOCK_AI_INSIGHTS.filter(
        (i) => i.severity === "critical" || i.severity === "high"
      ).slice(0, 3),
    });
  }

  const { ctx, error } = await requireAuth();
  if (error) return error;

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [dealsRes, tasksRes, docsRes, closedThisMonthRes, activityRes] = await Promise.all([
      ctx.supabase
        .from("deals")
        .select("id, health_score, stage, status")
        .eq("org_id", ctx.orgId)
        .eq("status", "active"),
      ctx.supabase
        .from("tasks")
        .select("id, status, due_date, priority")
        .eq("org_id", ctx.orgId)
        .not("status", "in", '("completed","cancelled")'),
      ctx.supabase
        .from("documents")
        .select("id, is_signed")
        .eq("org_id", ctx.orgId),
      ctx.supabase
        .from("deals")
        .select("id, purchase_price")
        .eq("org_id", ctx.orgId)
        .eq("status", "closed")
        .gte("closing_date", startOfMonth.toISOString())
        .lte("closing_date", endOfMonth.toISOString()),
      ctx.supabase
        .from("activity_log")
        .select("id, action, entity_type, entity_id, metadata, created_at, user_id")
        .eq("org_id", ctx.orgId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const activeDeals = (dealsRes.data ?? []);
    const tasks = (tasksRes.data ?? []);
    const docs = (docsRes.data ?? []);
    const closedDeals = (closedThisMonthRes.data ?? []);
    const activityRows = (activityRes.data ?? []);

    const tasksDueToday = tasks.filter((t) => {
      const d = new Date(t.due_date as string);
      return d >= startOfDay && d <= endOfDay;
    }).length;

    const tasksOverdue = tasks.filter((t) => new Date(t.due_date as string) < now).length;

    const pendingSigs = docs.filter((d) => !(d.is_signed as boolean)).length;

    const closingsRevenue = closedDeals.reduce(
      (sum, d) => sum + ((d.purchase_price as number) ?? 0),
      0
    );

    const activities = activityRows.map((row) => ({
      id: row.id as string,
      type: row.action as string,
      description: `${row.action} on ${row.entity_type}`,
      created_at: row.created_at as string,
      user_name: "Team",
      color: "indigo",
    }));

    const kpi = {
      active_deals: activeDeals.length,
      active_deals_trend: 0,
      tasks_due_today: tasksDueToday,
      tasks_overdue: tasksOverdue,
      docs_pending_signature: pendingSigs,
      closings_this_month: closedDeals.length,
      closings_trend: 0,
      closings_revenue: closingsRevenue,
    };

    return ok({ kpi, activities, insights: [] });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Dashboard fetch failed", 500);
  }
}
