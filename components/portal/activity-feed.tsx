"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, MessageSquare, CheckSquare, FolderOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { PortalActivity } from "@/types/portal";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  CheckCircle,
  MessageSquare,
  CheckSquare,
  FolderOpen,
  BarChart3,
};

const TYPE_COLORS = {
  document: "bg-indigo-500/15 text-indigo-400",
  signature: "bg-emerald-500/15 text-emerald-400",
  task: "bg-amber-500/15 text-amber-400",
  message: "bg-teal-500/15 text-teal-400",
  milestone: "bg-violet-500/15 text-violet-400",
  update: "bg-blue-500/15 text-blue-400",
};

interface ActivityFeedProps {
  activities: PortalActivity[];
  limit?: number;
}

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const items = limit ? activities.slice(0, limit) : activities;

  return (
    <div className="space-y-0">
      {items.map((activity, i) => {
        const Icon = ICON_MAP[activity.icon] || FileText;
        const colorClass = TYPE_COLORS[activity.type] || TYPE_COLORS.update;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex gap-3 group"
          >
            {/* Line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {i < items.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {format(parseISO(activity.timestamp), "MMM d 'at' h:mm a")}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
