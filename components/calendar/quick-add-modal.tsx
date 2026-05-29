"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Plus } from "lucide-react";
import { useCalendarStore } from "@/stores/calendar-store";
import { cn } from "@/lib/utils";
import type { CalendarEventType, CalendarEventColor } from "@/types/calendar";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/types/calendar";

const QUICK_TYPES: CalendarEventType[] = [
  "meeting",
  "inspection",
  "walkthrough",
  "signing",
  "closing",
  "task_due",
];

export function QuickAddModal() {
  const { quickAddOpen, quickAddDate, closeQuickAdd, addEvent } = useCalendarStore();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("meeting");
  const [time, setTime] = useState("10:00");

  const handleAdd = () => {
    if (!title.trim() || !quickAddDate) return;
    addEvent({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      type,
      color: EVENT_TYPE_COLORS[type] as CalendarEventColor,
      date: quickAddDate,
      startTime: time || undefined,
      allDay: !time,
      priority: "medium",
      completed: false,
    });
    setTitle("");
    setType("meeting");
    setTime("10:00");
    closeQuickAdd();
  };

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeQuickAdd}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-foreground">Add Event</h2>
                {quickAddDate && (
                  <span className="text-xs text-muted-foreground">
                    — {new Date(quickAddDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
              <button
                onClick={closeQuickAdd}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500/60 transition-colors"
              />

              {/* Type selector */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                      type === t
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "text-muted-foreground border-border hover:border-indigo-500/30 hover:text-foreground"
                    )}
                  >
                    {EVENT_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-16 flex-shrink-0">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground outline-none focus:border-indigo-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeQuickAdd}
                className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!title.trim()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
