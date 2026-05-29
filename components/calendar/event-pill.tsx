"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarEventColor } from "@/types/calendar";
import { EVENT_TYPE_LABELS } from "@/types/calendar";

const COLOR_CLASSES: Record<CalendarEventColor, string> = {
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  red: "bg-red-500/20 text-red-300 border-red-500/30",
  indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const DOT_CLASSES: Record<CalendarEventColor, string> = {
  emerald: "bg-emerald-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  red: "bg-red-400",
  indigo: "bg-indigo-400",
  rose: "bg-rose-400",
  cyan: "bg-cyan-400",
};

interface EventPillProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
  showDot?: boolean;
}

export function EventPill({ event, compact = false, onClick, showDot = false }: EventPillProps) {
  const colorClass = COLOR_CLASSES[event.color];
  const dotClass = DOT_CLASSES[event.color];

  if (showDot) {
    return (
      <button
        onClick={onClick}
        title={event.title}
        className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform hover:scale-125",
          dotClass,
          event.completed && "opacity-50"
        )}
      />
    );
  }

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium border truncate transition-opacity",
          colorClass,
          event.completed && "opacity-50 line-through"
        )}
        title={event.title}
      >
        <span className={cn("inline-block w-1 h-1 rounded-full mr-1 flex-shrink-0 align-middle", dotClass)} />
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:opacity-80 group",
        colorClass,
        event.completed && "opacity-60"
      )}
    >
      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dotClass)} />
      <span className={cn("flex-1 truncate", event.completed && "line-through")}>
        {event.title}
      </span>
      {event.startTime && (
        <span className="text-[10px] opacity-70 flex-shrink-0">{event.startTime}</span>
      )}
    </button>
  );
}

export { COLOR_CLASSES, DOT_CLASSES };
