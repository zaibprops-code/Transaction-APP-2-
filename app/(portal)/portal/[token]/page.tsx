"use client";

import { use } from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import {
  FileText,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { usePortalData } from "@/lib/hooks/usePortalData";
import { PortalNav } from "@/components/portal/portal-nav";
import { MilestoneStepper } from "@/components/portal/milestone-stepper";
import { ClosingCountdown } from "@/components/portal/closing-countdown";
import { ActionCard } from "@/components/portal/action-card";
import { TeamContactCard } from "@/components/portal/team-contact-card";
import { ActivityFeed } from "@/components/portal/activity-feed";
import { AIHelpWidget } from "@/components/portal/ai-help-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

function PortalSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
      <div className="rounded-2xl bg-surface border border-border h-40" />
      <div className="rounded-2xl bg-surface border border-border h-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border h-64" />
        <div className="rounded-2xl bg-surface border border-border h-64" />
      </div>
    </div>
  );
}

export default function PortalDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { portal, loading, error } = usePortalData(token);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-surface border-b border-border" />
        <PortalSkeleton />
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h1 className="text-xl font-semibold text-foreground">Portal Unavailable</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          {error ?? "This portal link is invalid or has expired. Contact your agent for a new link."}
        </p>
      </div>
    );
  }

  const daysToClose = differenceInDays(parseISO(portal.closingDate), new Date());
  const urgentTasks = portal.tasks
    .filter((t) => t.status === "pending" || t.status === "overdue")
    .slice(0, 3);
  const completedMilestones = portal.milestones.filter((m) => m.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <PortalNav
        token={token}
        clientName={portal.clientName}
        clientInitials={portal.clientInitials}
        propertyAddress={portal.propertyAddress}
        daysToClose={daysToClose}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Welcome hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl bg-gradient-to-br from-indigo-500/10 via-teal-500/5 to-background border border-indigo-500/20 overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-400 mb-1">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {portal.clientName}
              </h1>
              <p className="text-muted-foreground mt-2 leading-relaxed">{portal.welcomeMessage}</p>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{portal.pendingTasks}</span>
                    <span className="text-muted-foreground ml-1">tasks pending</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">
                      {portal.docsComplete}/{portal.docsTotal}
                    </span>
                    <span className="text-muted-foreground ml-1">docs complete</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{portal.unreadMessages}</span>
                    <span className="text-muted-foreground ml-1">new messages</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <ClosingCountdown closingDate={portal.closingDate} size="md" />
            </div>
          </div>
        </motion.div>

        {/* ── Progress tracker ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="rounded-2xl border border-border bg-surface p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">Transaction Progress</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {completedMilestones} of {portal.milestones.length} milestones complete
              </p>
            </div>
            <Link href={`/portal/${token}/timeline`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-indigo-400 hover:text-indigo-300"
              >
                Full timeline
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <MilestoneStepper milestones={portal.milestones} />
        </motion.div>

        {/* ── Action center + Deal summary ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action center */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Action Required</h2>
              {urgentTasks.length > 0 && (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px]">
                  {urgentTasks.filter((t) => t.status === "overdue").length} overdue
                </Badge>
              )}
            </div>
            {urgentTasks.length > 0 ? (
              <div className="space-y-3">
                {urgentTasks.map((task, i) => (
                  <ActionCard key={task.id} task={task} index={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <CheckSquare className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No pending actions at this time.
                </p>
              </div>
            )}
            <Link href={`/portal/${token}/tasks`} className="block mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-muted-foreground w-full justify-center"
              >
                View all tasks <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* Deal summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-surface p-5 space-y-4"
          >
            <h2 className="text-base font-semibold text-foreground">Your Property</h2>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {portal.propertyAddress}
                </p>
                <p className="text-xs text-muted-foreground">{portal.propertyCity}</p>
                {portal.propertyType && (
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {portal.propertyType}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              {portal.purchasePrice > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5" />
                    Purchase Price
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {formatCurrency(portal.purchasePrice)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Closing Date
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {format(parseISO(portal.closingDate), "MMM d, yyyy")}
                </span>
              </div>
              {portal.contractDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Contract Date
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {format(parseISO(portal.contractDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Transaction Health
                </div>
                <span
                  className={`text-xs font-bold ${
                    portal.healthScore >= 75
                      ? "text-emerald-400"
                      : portal.healthScore >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {portal.healthScore}/100
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Recent activity + Team contacts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity feed */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Recent Updates</h2>
            </div>
            {portal.activities.length > 0 ? (
              <ActivityFeed activities={portal.activities} limit={5} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              </div>
            )}
          </div>

          {/* Team */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Your Team</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Available now
              </div>
            </div>
            {portal.contacts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portal.contacts.slice(0, 6).map((contact, i) => (
                    <TeamContactCard key={contact.id} contact={contact} index={i} />
                  ))}
                </div>
                <Link href={`/portal/${token}/messages`} className="block mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 w-full justify-center"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Open Messages
                  </Button>
                </Link>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-muted-foreground">Your team will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AIHelpWidget />
    </div>
  );
}
