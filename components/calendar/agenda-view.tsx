"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  compareAsc,
  startOfDay,
} from "date-fns";
import { useCalendarStore } from "@/stores/calendar-store";
import { DOT_CLASSES, COLOR_CLASSES } from "@/components/calendar/event-pill";
import { EVENT_TYPE_LABELS } from "@/types/calendar";
import { Building2, Clock, MapPin, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

function getRelativeLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 0 })) return format(date, "EEEE");
  if (isThisMonth(date)) return format(date, "MMMM d");
  return format(date, "MMMM d, yyyy");
}

interface AgendaEventCardProps {
  event: CalendarEvent;
}

function AgendaEventCard({ event }: AgendaEventCardProps) {
  const { toggleEventComplete } = useCalendarStore();
  const colorClass = COLOR_CLASSES[event.color];
  const dotClass = DOT_CLASSES[event.color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all hover:opacity-90 cursor-pointer",
        colorClass,
        event.completed && "opacity-50"
      )}
    >
      {/* Dot */}
      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5", dotClass)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-semibold text-foreground leading-tight",
              event.completed && "line-through text-muted-foreground"
            )}>
              {event.title}
            </p>
            <p className="text-[11px] opacity-70 mt-0.5">{EVENT_TYPE_LABELS[event.type]}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {event.startTime && (
              <div className="flex items-center gap-1 text-[11px] opacity-70">
                <Clock className="w-3 h-3" />
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
              </div>
            )}
            {event.allDay && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 opacity-70">All day</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleEventComplete(event.id);
              }}
              className="flex-shrink-0"
            >
              <CheckCircle className={cn(
                "w-4 h-4 transition-colors",
                event.completed ? "text-emerald-400" : "opacity-30 hover:opacity-70"
              )} />
            </button>
          </div>
        </div>

        {/* Deal / description */}
        {event.dealAddress && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] opacity-70">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.dealAddress}</span>
          </div>
        )}
        {event.description && !event.dealAddress && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] opacity-70">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.description}</span>
          </div>
        )}

        {/* Priority badge */}
        {event.priority === "high" && !event.completed && (
          <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20 font-medium">
            High Priority
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AgendaView() {
  const { getFilteredEvents } = useCalendarStore();
  const allEvents = getFilteredEvents();

  const grouped = useMemo(() => {
    const today = startOfDay(new Date());
    const upcoming = allEvents
      .filter((e) => {
        const d = parseISO(e.date);
        return d >= today;
      })
      .sort((a, b) => {
        const dateDiff = compareAsc(parseISO(a.date), parseISO(b.date));
        if (dateDiff !== 0) return dateDiff;
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });

    const groups: Record<string, CalendarEvent[]> = {};
    for (const ev of upcoming) {
      const key = ev.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    return groups;
  }, [allEvents]);

  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {dates.map((dateKey) => {
        const events = grouped[dateKey];
        const label = getRelativeLabel(dateKey);
        const isCurrentDay = dateKey === format(new Date(), "yyyy-MM-dd");

        return (
          <div key={dateKey}>
            {/* Date label */}
            <div className="flex items-center gap-3 mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
              <div className={cn(
                "flex flex-col items-center w-10 flex-shrink-0",
              )}>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold",
                  isCurrentDay ? "text-indigo-400" : "text-muted-foreground"
                )}>
                  {format(parseISO(dateKey), "EEE")}
                </span>
                <span className={cn(
                  "text-xl font-bold leading-tight",
                  isCurrentDay ? "text-indigo-400" : "text-foreground"
                )}>
                  {format(parseISO(dateKey), "d")}
                </span>
              </div>
              <div className="flex-1">
                <span className={cn(
                  "text-sm font-semibold",
                  isCurrentDay ? "text-indigo-300" : "text-foreground"
                )}>
                  {label}
                </span>
                {isCurrentDay && (
                  <span className="ml-2 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Today
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  {events.length} event{events.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Events */}
            <div className="ml-13 space-y-2 pl-4 border-l border-border">
              {events.map((ev) => (
                <AgendaEventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
