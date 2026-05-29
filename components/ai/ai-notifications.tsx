"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, Clock, FileSignature } from "lucide-react";
import { useAIStore } from "@/stores/ai-store";
import { getProactiveInsights } from "@/lib/ai/context";
import type { ProactiveInsight } from "@/lib/ai/context";

const iconMap = {
  risk: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  overdue: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  signature: <FileSignature className="w-3.5 h-3.5 text-indigo-400" />,
  document: <FileSignature className="w-3.5 h-3.5 text-violet-400" />,
  inactivity: <Clock className="w-3.5 h-3.5 text-amber-400" />,
};

const borderMap = {
  high: "border-red-500/30 bg-red-500/5",
  medium: "border-amber-500/30 bg-amber-500/5",
  low: "border-border bg-surface",
};

export function AINotifications() {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { openAssistant, isOpen } = useAIStore();

  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => {
      setInsights(getProactiveInsights());
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const visible = insights.filter((i) => !dismissed.has(i.id));

  if (isOpen || visible.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {visible.slice(0, 3).map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto w-72 rounded-xl border p-3 shadow-lg ${borderMap[insight.severity]} backdrop-blur-sm`}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">{iconMap[insight.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium leading-snug">
                  {insight.message}
                </p>
                <button
                  onClick={() => {
                    setDismissed((s) => new Set(s).add(insight.id));
                    openAssistant(insight.prompt);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                >
                  Ask Strata AI →
                </button>
              </div>
              <button
                onClick={() => setDismissed((s) => new Set(s).add(insight.id))}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
