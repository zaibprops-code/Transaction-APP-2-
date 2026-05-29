"use client";

import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortalMilestone } from "@/types/portal";

interface MilestoneStepperProps {
  milestones: PortalMilestone[];
}

export function MilestoneStepper({ milestones }: MilestoneStepperProps) {
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const activeIndex = milestones.findIndex((m) => m.status === "active");
  const progressPct = (completedCount / (milestones.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </div>

        {/* Step indicators overlaid on bar */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between">
          {milestones.map((milestone, i) => (
            <motion.div
              key={milestone.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  milestone.status === "completed"
                    ? "bg-gradient-to-br from-indigo-500 to-teal-500 border-transparent shadow-md shadow-indigo-500/20"
                    : milestone.status === "active"
                    ? "bg-surface-2 border-indigo-400 shadow-md shadow-indigo-500/30"
                    : "bg-surface border-border"
                )}
              >
                {milestone.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                ) : milestone.status === "active" ? (
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                ) : (
                  <Clock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Labels below — only show a subset on mobile */}
      <div className="flex justify-between mt-2">
        {milestones.map((milestone, i) => (
          <div
            key={milestone.id}
            className={cn(
              "flex-1 text-center",
              i !== 0 && i !== milestones.length - 1 && i !== activeIndex && "hidden sm:block"
            )}
          >
            <p
              className={cn(
                "text-[10px] font-medium leading-tight truncate px-0.5",
                milestone.status === "completed"
                  ? "text-indigo-400"
                  : milestone.status === "active"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {milestone.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
