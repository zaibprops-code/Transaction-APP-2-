"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { useCalendarStore } from "@/stores/calendar-store";
import { EventPill } from "@/components/calendar/event-pill";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayPopoverProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

function DayPopover({ date, events, onClose }: DayPopoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute z-30 top-full left-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-2xl p-3 space-y-1.5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">
          {format(date, "EEEE, MMMM d")}
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">
          ✕
        </button>
      </div>
      {events.map((ev) => (
        <EventPill key={ev.id} event={ev} />
      ))}
    </motion.div>
  );
}

export function MonthView() {
  const { selectedDate, setSelectedDate, getFilteredEvents, openQuickAdd } = useCalendarStore();
  const [popoverDate, setPopoverDate] = useState<string | null>(null);

  const currentDate = parseISO(selectedDate);
  const allEvents = getFilteredEvents();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return allEvents.filter((e) => e.date === key);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-border">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = key === selectedDate;
          const dayIsToday = isToday(day);
          const events = getEventsForDay(day);
          const maxVisible = 3;
          const overflow = Math.max(0, events.length - maxVisible);
          const isPopoverOpen = popoverDate === key;

          return (
            <div
              key={key}
              className={cn(
                "relative min-h-[90px] p-1.5 flex flex-col gap-0.5 cursor-pointer group transition-colors",
                isCurrentMonth ? "bg-background" : "bg-surface/30",
                isSelected && "ring-1 ring-inset ring-indigo-500/40",
                !isSelected && isCurrentMonth && "hover:bg-surface/60"
              )}
              onClick={() => {
                setSelectedDate(key);
                if (isPopoverOpen) setPopoverDate(null);
              }}
              onDoubleClick={() => openQuickAdd(key)}
            >
              {/* Day number */}
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                    dayIsToday
                      ? "bg-indigo-500 text-white font-bold"
                      : isCurrentMonth
                      ? "text-foreground group-hover:text-indigo-300"
                      : "text-muted-foreground/40"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Event pills */}
              <div className="space-y-0.5 flex-1">
                {events.slice(0, maxVisible).map((ev) => (
                  <div key={ev.id} onClick={(e) => { e.stopPropagation(); setPopoverDate(isPopoverOpen ? null : key); }}>
                    <EventPill event={ev} compact />
                  </div>
                ))}
                {overflow > 0 && (
                  <button
                    className="text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopoverDate(isPopoverOpen ? null : key);
                    }}
                  >
                    +{overflow} more
                  </button>
                )}
              </div>

              {/* Popover */}
              <AnimatePresence>
                {isPopoverOpen && events.length > 0 && (
                  <DayPopover
                    date={day}
                    events={events}
                    onClose={() => setPopoverDate(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
