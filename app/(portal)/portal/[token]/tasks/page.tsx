"use client";

import { use } from "react";
import { useState, useCallback } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle, ClipboardList } from "lucide-react";
import { usePortalData } from "@/lib/hooks/usePortalData";
import { PortalNav } from "@/components/portal/portal-nav";
import { TaskCard } from "@/components/portal/task-card";
import { AIHelpWidget } from "@/components/portal/ai-help-widget";
import { Progress } from "@/components/ui/progress";
import type { ClientTask } from "@/types/portal";
import { isDemo } from "@/lib/utils";

export default function TasksPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { portal, loading } = usePortalData(token);
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, ClientTask["status"]>>({});

  const daysToClose = portal ? differenceInDays(parseISO(portal.closingDate), new Date()) : 0;

  // Merge portal tasks with any optimistic overrides
  const tasks: ClientTask[] = (portal?.tasks ?? []).map((t) => ({
    ...t,
    status: optimisticOverrides[t.id] ?? t.status,
  }));

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const overdues = tasks.filter((t) => t.status === "overdue");
  const urgents = tasks.filter((t) => t.status === "pending" && t.priority === "urgent");
  const normals = tasks.filter((t) => t.status === "pending" && t.priority === "normal");
  const lows = tasks.filter((t) => t.status === "pending" && t.priority === "low");
  const completed = tasks.filter((t) => t.status === "completed");

  const handleComplete = useCallback(
    async (taskId: string) => {
      // Optimistic update
      setOptimisticOverrides((prev) => ({ ...prev, [taskId]: "completed" }));

      if (isDemo() || token === "demo-token-2024") return;

      try {
        const res = await fetch(`/api/portal/${encodeURIComponent(token)}/tasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, status: "completed" }),
        });

        if (!res.ok) {
          // Revert optimistic update
          setOptimisticOverrides((prev) => {
            const next = { ...prev };
            delete next[taskId];
            return next;
          });
        }
      } catch {
        setOptimisticOverrides((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    },
    [token]
  );

  const Section = ({
    title,
    items,
    startIndex = 0,
  }: {
    title: string;
    items: ClientTask[];
    startIndex?: number;
  }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          {title}
        </h2>
        <div className="space-y-3">
          {items.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={startIndex + i}
              onComplete={handleComplete}
            />
          ))}
        </div>
      </div>
    );
  };

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
        {/* Header + progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Your Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Complete these items to keep your transaction on track.
          </p>

          <div className="mt-4 bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {completedCount} of {tasks.length} complete
              </span>
              <span className="text-sm font-bold text-indigo-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {progress === 100 && tasks.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">All tasks complete — great work!</span>
              </div>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No tasks assigned yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your coordinator will assign tasks as your transaction progresses.
            </p>
          </div>
        ) : (
          <>
            <Section title="⚠ Action Required Now" items={overdues} />
            <Section
              title="This Week"
              items={urgents}
              startIndex={overdues.length}
            />
            <Section
              title="Upcoming"
              items={normals}
              startIndex={overdues.length + urgents.length}
            />
            <Section
              title="Optional"
              items={lows}
              startIndex={overdues.length + urgents.length + normals.length}
            />

            {completed.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Completed
                </h2>
                <div className="space-y-3">
                  {completed.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} onComplete={handleComplete} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <AIHelpWidget />
    </div>
  );
}
