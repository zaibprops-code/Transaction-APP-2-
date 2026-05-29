"use client";

import { motion } from "framer-motion";
import { ArrowRight, Upload, PenLine, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientTask } from "@/types/portal";

const TYPE_ICONS = {
  upload: Upload,
  sign: PenLine,
  review: Eye,
  action: ArrowRight,
  schedule: Calendar,
};

const TYPE_LABELS = {
  upload: "Upload Required",
  sign: "Signature Required",
  review: "Review Required",
  action: "Action Required",
  schedule: "Schedule Required",
};

interface ActionCardProps {
  task: ClientTask;
  index?: number;
  onAction?: (task: ClientTask) => void;
}

export function ActionCard({ task, index = 0, onAction }: ActionCardProps) {
  const Icon = TYPE_ICONS[task.type];
  const isOverdue = task.status === "overdue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative rounded-xl border p-4 bg-surface hover:bg-surface-2 transition-colors group cursor-pointer",
        isOverdue ? "border-red-500/30 bg-red-500/5" : "border-amber-500/25 bg-amber-500/5"
      )}
      onClick={() => onAction?.(task)}
    >
      {/* Priority dot */}
      {task.priority === "urgent" && (
        <span className="absolute top-3 right-3">
          <span className={cn(
            "w-2 h-2 rounded-full block",
            isOverdue ? "bg-red-400" : "bg-amber-400"
          )} />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          isOverdue ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
        )}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-wider mb-0.5",
            isOverdue ? "text-red-400" : "text-amber-400"
          )}>
            {isOverdue ? "Overdue" : TYPE_LABELS[task.type]}
          </p>
          <h4 className="text-sm font-semibold text-foreground leading-snug">{task.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          {task.dueDate && task.dueDate !== "—" && (
            <p className={cn(
              "text-[10px] font-medium mt-2",
              isOverdue ? "text-red-400" : "text-muted-foreground"
            )}>
              Due: {task.dueDate}
            </p>
          )}
        </div>
      </div>

      <Button
        size="sm"
        className={cn(
          "w-full mt-3 text-xs h-8",
          isOverdue
            ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
            : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
        )}
        variant="ghost"
      >
        {task.type === "upload" ? "Upload Now" : task.type === "sign" ? "Sign Now" : task.type === "review" ? "View Document" : "Take Action"}
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </motion.div>
  );
}
