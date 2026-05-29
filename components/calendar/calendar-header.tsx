"use client";

import {
  format,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  List,
  AlignLeft,
  GitBranch,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCalendarStore } from "@/stores/calendar-store";
import { cn } from "@/lib/utils";
import type { CalendarView } from "@/types/calendar";

const VIEW_OPTIONS: Array<{ id: CalendarView; label: string; icon: React.ReactNode }> = [
  { id: "month", label: "Month", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: "week", label: "Week", icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: "agenda", label: "Agenda", icon: <AlignLeft className="w-3.5 h-3.5" /> },
  { id: "timeline", label: "Timeline", icon: <GitBranch className="w-3.5 h-3.5" /> },
];

function getDisplayRange(view: CalendarView, dateStr: string): string {
  const date = parseISO(dateStr);
  if (view === "month") return format(date, "MMMM yyyy");
  if (view === "week") {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    if (format(start, "MMM") === format(end, "MMM")) {
      return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
    }
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }
  if (view === "timeline") return "Deal Milestone View";
  return format(date, "MMMM yyyy");
}

function navigate(view: CalendarView, dateStr: string, direction: 1 | -1): string {
  const date = parseISO(dateStr);
  if (view === "month") {
    return format(direction === 1 ? addMonths(date, 1) : subMonths(date, 1), "yyyy-MM-dd");
  }
  if (view === "week") {
    return format(direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1), "yyyy-MM-dd");
  }
  return format(direction === 1 ? addDays(date, 7) : subDays(date, 7), "yyyy-MM-dd");
}

export function CalendarHeader() {
  const { view, setView, selectedDate, setSelectedDate, openQuickAdd } = useCalendarStore();

  const goToday = () => setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  const goPrev = () => setSelectedDate(navigate(view, selectedDate, -1));
  const goNext = () => setSelectedDate(navigate(view, selectedDate, 1));

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 flex-wrap gap-y-2">
      {/* Title */}
      <h1 className="text-base font-bold text-foreground min-w-[160px]">
        {getDisplayRange(view, selectedDate)}
      </h1>

      {/* Nav controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={goPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToday}
          className="px-3 h-7 flex items-center rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-border transition-colors"
        >
          Today
        </button>
        <button
          onClick={goNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI scheduling button */}
      <button className="hidden sm:flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium text-violet-300 border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
        <Sparkles className="w-3.5 h-3.5" />
        AI Schedule
      </button>

      {/* Add event */}
      <button
        onClick={() => openQuickAdd()}
        className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Event
      </button>

      {/* View switcher */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface border border-border">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setView(opt.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 h-6 rounded-md text-xs font-medium transition-all",
              view === opt.id
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={opt.label}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
