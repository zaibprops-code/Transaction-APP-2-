"use client";

import { use } from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Lock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { usePortalData } from "@/lib/hooks/usePortalData";
import { PortalNav } from "@/components/portal/portal-nav";
import { ClosingCountdown } from "@/components/portal/closing-countdown";
import { AIHelpWidget } from "@/components/portal/ai-help-widget";
import { cn } from "@/lib/utils";
import type { PortalMilestone } from "@/types/portal";

function MilestoneCard({
  milestone,
  index,
}: {
  milestone: PortalMilestone;
  index: number;
}) {
  const [expanded, setExpanded] = useState(milestone.status === "active");

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative flex gap-4"
    >
      {/* Vertical connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all",
            milestone.status === "completed"
              ? "bg-gradient-to-br from-indigo-500 to-teal-500 border-transparent shadow-lg shadow-indigo-500/25"
              : milestone.status === "active"
              ? "bg-surface-2 border-indigo-400 shadow-md shadow-indigo-500/20"
              : "bg-surface border-border"
          )}
        >
          {milestone.status === "completed" ? (
            <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
          ) : milestone.status === "active" ? (
            <motion.span
              className="w-3 h-3 rounded-full bg-indigo-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div
          className={cn(
            "w-px flex-1 mt-1",
            milestone.status === "completed"
              ? "bg-gradient-to-b from-indigo-500/50 to-teal-500/30"
              : "bg-border"
          )}
          style={{ minHeight: "40px" }}
        />
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 rounded-xl border p-4 mb-4 transition-all duration-200",
          milestone.status === "completed"
            ? "bg-surface border-border"
            : milestone.status === "active"
            ? "bg-indigo-500/5 border-indigo-500/30 shadow-sm"
            : "bg-surface border-border opacity-70"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  milestone.status === "completed"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : milestone.status === "active"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-surface-2 text-muted-foreground"
                )}
              >
                {milestone.status === "completed"
                  ? "Completed"
                  : milestone.status === "active"
                  ? "In Progress"
                  : "Upcoming"}
              </span>
              {milestone.date && milestone.date !== "—" && (
                <span className="text-[10px] text-muted-foreground">
                  {milestone.status === "completed" ? "Completed" : "Estimated"}:{" "}
                  {format(parseISO(milestone.date), "MMMM d, yyyy")}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground mt-1.5">{milestone.label}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {milestone.description}
            </p>
          </div>

          {(milestone.subSteps || milestone.aiExplainer) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-3 p-1.5 rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-3"
          >
            {milestone.subSteps && (
              <div className="space-y-2">
                {milestone.subSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                        step.completed
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-surface-2 border border-border"
                      )}
                    >
                      {step.completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        step.completed ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {milestone.aiExplainer && (
              <div className="flex items-start gap-2.5 bg-indigo-500/8 border border-indigo-500/15 rounded-lg p-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {milestone.aiExplainer}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function TimelinePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { portal, loading } = usePortalData(token);

  const daysToClose = portal ? differenceInDays(parseISO(portal.closingDate), new Date()) : 0;

  return (
    <div className="min-h-screen bg-background">
      <PortalNav
        token={token}
        clientName={portal?.clientName ?? ""}
        clientInitials={portal?.clientInitials ?? ""}
        propertyAddress={portal?.propertyAddress ?? ""}
        daysToClose={daysToClose}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center gap-6"
        >
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Transaction Timeline</h1>
            <p className="text-muted-foreground mt-1">
              Follow each step of your real estate transaction from offer to closing.
            </p>
          </div>
          {portal && <ClosingCountdown closingDate={portal.closingDate} size="sm" />}
        </motion.div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div>
            {(portal?.milestones ?? []).map((milestone, i) => (
              <MilestoneCard key={milestone.id} milestone={milestone} index={i} />
            ))}
          </div>
        )}
      </main>

      <AIHelpWidget />
    </div>
  );
}
