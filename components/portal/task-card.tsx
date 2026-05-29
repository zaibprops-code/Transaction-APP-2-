"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, PenLine, Eye, Calendar, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientTask } from "@/types/portal";

const TYPE_ICONS = { upload: Upload, sign: PenLine, review: Eye, action: ArrowRight, schedule: Calendar };
const TYPE_CTA = { upload: "Upload File", sign: "Sign Document", review: "Review Now", action: "Take Action", schedule: "Schedule Now" };

interface TaskCardProps {
  task: ClientTask;
  index?: number;
  onComplete?: (taskId: string) => void;
}

export function TaskCard({ task, index = 0, onComplete }: TaskCardProps) {
  const [done, setDone] = useState(task.status === "completed");
  const [celebrating, setCelebrating] = useState(false);
  const Icon = TYPE_ICONS[task.type];
  const isOverdue = task.status === "overdue" && !done;

  const handleComplete = () => {
    setDone(true);
    setCelebrating(true);
    onComplete?.(task.id);
    setTimeout(() => setCelebrating(false), 1800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: done ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-300",
        done ? "bg-surface border-border" : isOverdue ? "bg-red-500/5 border-red-500/25" : "bg-surface border-border hover:border-indigo-500/25 hover:bg-surface-2"
      )}
    >
      {/* Celebration burst */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            key="burst"
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 8) * 40,
                  y: Math.sin((i * Math.PI * 2) / 8) * 40,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={done}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
            done ? "bg-emerald-500 border-emerald-500" : "border-border hover:border-emerald-400"
          )}
        >
          {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
              isOverdue ? "bg-red-500/15 text-red-400" : "bg-indigo-500/15 text-indigo-400"
            )}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm font-semibold leading-snug", done && "line-through text-muted-foreground")}>
                {task.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>

              {task.dueDate && task.dueDate !== "—" && (
                <div className={cn("flex items-center gap-1 mt-2 text-[11px] font-medium", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                  <Clock className="w-3 h-3" />
                  {isOverdue ? `Overdue — was due ${task.dueDate}` : `Due ${task.dueDate}`}
                </div>
              )}

              {!done && (
                <Button
                  size="sm"
                  className="mt-3 h-7 text-xs"
                  variant={isOverdue ? "default" : "outline"}
                >
                  {TYPE_CTA[task.type]}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
