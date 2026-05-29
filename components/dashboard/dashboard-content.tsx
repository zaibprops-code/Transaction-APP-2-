"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CheckSquare,
  PenLine,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Clock,
  Sparkles,
  Trophy,
  FileText,
  Upload,
  CheckCircle,
  Plus,
  Globe,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  formatCurrency,
  formatDate,
  getDaysToClose,
  getHealthColor,
  getStageLabel,
  getStageColor,
  generateInitials,
  isOverdue,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRealtimeDeals } from "@/lib/hooks/useRealtimeDeals";
import { useUser } from "@/lib/hooks/useUser";
import type { KPIData, Activity, AIInsight, Task } from "@/types";

interface DashboardData {
  kpi: KPIData;
  activities: Activity[];
  insights: AIInsight[];
}

function KPICard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color,
  suffix,
  delay,
}: {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  delay: number;
}) {
  const isPositive = (trend ?? 0) > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                  isPositive
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-red-400 bg-red-400/10"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{title}</div>
          {trendLabel && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{trendLabel}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color = getHealthColor(score);
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded border",
        color === "emerald" && "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        color === "amber" && "text-amber-400 bg-amber-400/10 border-amber-400/20",
        color === "red" && "text-red-400 bg-red-400/10 border-red-400/20"
      )}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}
    </div>
  );
}

const activityIcons: Record<string, React.ElementType> = {
  signature_completed: PenLine,
  document_uploaded: Upload,
  task_completed: CheckCircle,
  deal_created: Plus,
  ai_insight: Sparkles,
  deal_closed: Trophy,
};

const activityColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10",
  indigo: "text-indigo-400 bg-indigo-400/10",
  violet: "text-violet-400 bg-violet-400/10",
  blue: "text-blue-400 bg-blue-400/10",
  amber: "text-amber-400 bg-amber-400/10",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

export function DashboardContent() {
  const { user } = useUser();
  const { deals: activeDeals, loading: dealsLoading } = useRealtimeDeals({ status: "active" });
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, tasksRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/tasks"),
      ]);
      if (dashRes.ok) {
        const json = await dashRes.json() as DashboardData;
        setDashData(json);
      }
      if (tasksRes.ok) {
        const json = await tasksRes.json() as { tasks: Task[] };
        setTasks(json.tasks ?? []);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpi = dashData?.kpi;
  const activities = dashData?.activities ?? [];
  const insights = dashData?.insights ?? [];

  const todayTasks = tasks
    .filter((t) => t.status !== "completed" && t.status !== "cancelled")
    .slice(0, 5);

  const displayDeals = activeDeals.slice(0, 5);
  const firstName = getFirstName(user?.full_name);

  if (dataLoading || dealsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasDeals = displayDeals.length > 0;
  const hasTasks = todayTasks.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {kpi
              ? `You have ${kpi.tasks_due_today} task${kpi.tasks_due_today !== 1 ? "s" : ""} due today and ${kpi.active_deals} active deal${kpi.active_deals !== 1 ? "s" : ""}.`
              : "Welcome to CloseTrack — your transaction workspace is ready."}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/deals">
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </Link>
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Deals"
          value={kpi?.active_deals ?? 0}
          trend={kpi?.active_deals_trend}
          trendLabel="vs last month"
          icon={Building2}
          color="bg-indigo-500/20 text-indigo-400"
          delay={0}
        />
        <KPICard
          title="Tasks Due Today"
          value={kpi?.tasks_due_today ?? 0}
          trendLabel={kpi ? `${kpi.tasks_overdue} overdue` : undefined}
          icon={CheckSquare}
          color="bg-amber-500/20 text-amber-400"
          delay={0.1}
        />
        <KPICard
          title="Pending Signatures"
          value={kpi?.docs_pending_signature ?? 0}
          icon={PenLine}
          color="bg-violet-500/20 text-violet-400"
          delay={0.2}
        />
        <KPICard
          title="Closings This Month"
          value={kpi?.closings_this_month ?? 0}
          trend={kpi?.closings_trend}
          trendLabel={kpi?.closings_revenue ? formatCurrency(kpi.closings_revenue, true) : undefined}
          icon={TrendingUp}
          color="bg-emerald-500/20 text-emerald-400"
          delay={0.3}
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Deals + Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Active Deals</h2>
            <Link href="/deals" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {hasDeals ? (
                <div className="divide-y divide-border">
                  {displayDeals.map((deal) => {
                    const daysToClose = getDaysToClose(deal.closing_date);
                    return (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-surface-2/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground truncate">
                              {deal.address}
                            </span>
                            <span className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0",
                              getStageColor(deal.stage)
                            )}>
                              {getStageLabel(deal.stage)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{deal.buyer_name}</span>
                            <span>·</span>
                            <span>{formatCurrency(deal.purchase_price, true)}</span>
                            <span>·</span>
                            <span className={daysToClose <= 7 ? "text-amber-400 font-medium" : ""}>
                              Closes {daysToClose <= 0 ? "today" : `in ${daysToClose}d`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden md:flex items-center gap-1">
                            <div className="w-16">
                              <Progress
                                value={deal.health_score}
                                color={
                                  deal.health_score >= 75
                                    ? "emerald"
                                    : deal.health_score >= 50
                                    ? "amber"
                                    : "red"
                                }
                              />
                            </div>
                          </div>
                          <HealthBadge score={deal.health_score} />
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <PackageOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">No active deals yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first deal to get started</p>
                  <Button size="sm" asChild>
                    <Link href="/deals">
                      <Plus className="w-3.5 h-3.5" />
                      Create Deal
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-semibold text-foreground">Task Queue</h2>
            <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {hasTasks ? (
                <div className="divide-y divide-border">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-4 hover:bg-surface-2/50 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-border text-indigo-500 focus:ring-indigo-500 bg-surface-2 flex-shrink-0 cursor-pointer"
                        defaultChecked={task.status === "completed"}
                        readOnly
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn(
                            "text-sm font-medium line-clamp-1",
                            task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {task.title}
                          </span>
                          <Badge
                            variant={
                              task.priority === "critical" ? "destructive" :
                              task.priority === "high" ? "warning" : "secondary"
                            }
                            className="text-[10px] flex-shrink-0"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {task.deal_id && (
                            <>
                              <Link href={`/deals/${task.deal_id}`} className="text-indigo-400 hover:text-indigo-300 truncate">
                                {task.deal_address ?? "Deal"}
                              </Link>
                              <span>·</span>
                            </>
                          )}
                          <span className={isOverdue(task.due_date) ? "text-red-400" : ""}>
                            {isOverdue(task.due_date) ? "Overdue" : `Due ${formatDate(task.due_date, "MMM d")}`}
                          </span>
                        </div>
                      </div>
                      {task.assigned_to_name && (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-[9px]">
                            {generateInitials(task.assigned_to_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">No open tasks</p>
                  <p className="text-xs text-muted-foreground mt-1">You&apos;re all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {/* AI Insights */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
          </div>

          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <Card
                  key={insight.id}
                  className={cn(
                    "border hover:border-indigo-500/20 transition-all cursor-pointer hover:-translate-y-0.5",
                    insight.severity === "critical" && "border-red-500/20 bg-red-500/5",
                    insight.severity === "high" && "border-amber-500/20 bg-amber-500/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          insight.severity === "critical" ? "text-red-400" : "text-amber-400"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                          {insight.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {insight.description}
                        </p>
                        {insight.deal_address && (
                          <Link
                            href={`/deals/${insight.deal_id}`}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-0.5"
                          >
                            {insight.deal_address}
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <Sparkles className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No insights yet — add deals to get AI analysis</p>
                </CardContent>
              </Card>
            )}

            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <Link href="/ai">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Open AI Assistant
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </div>

          {/* Client Portals widget */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-foreground">Client Portals</h2>
              </div>
              <Link href="/clients" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <Card>
              <CardContent className="p-4">
                {kpi && (kpi.active_deals > 0 || kpi.tasks_due_today > 0) ? (
                  <div className="space-y-3">
                    {[
                      { label: "Active portals", value: kpi?.active_deals ?? 0, color: "text-emerald-400", dot: "bg-emerald-400" },
                      { label: "Awaiting client", value: kpi?.tasks_overdue ?? 0, color: "text-amber-400", dot: "bg-amber-400" },
                      { label: "Invites pending", value: Math.max(0, (kpi?.active_deals ?? 0) - 2), color: "text-muted-foreground", dot: "bg-muted-foreground/50" },
                    ].map(({ label, value, color, dot }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dot}`} />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <span className={`text-sm font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Globe className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No portals yet</p>
                    <Link href="/clients" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
                      Add clients to enable portals
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h2>
            <Card>
              <CardContent className="p-4">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => {
                      const Icon = activityIcons[activity.type] ?? FileText;
                      const colorClass = activityColors[(activity as Activity & { color?: string }).color ?? "indigo"] ?? activityColors.indigo;
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground line-clamp-2">{activity.description}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              {activity.user_name} · {new Date(activity.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
