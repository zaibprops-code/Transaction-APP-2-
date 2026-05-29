"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isToday,
  isSameDay,
} from "date-fns";
import { useCalendarStore } from "@/stores/calendar-store";
import { DOT_CLASSES } from "@/components/calendar/event-pill";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 8pm

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToPercent(minutes: number, startHour = 7): number {
  return ((minutes - startHour * 60) / (14 * 60)) * 100;
}

interface TimedEventCardProps {
  event: CalendarEvent;
}

function TimedEventCard({ event }: TimedEventCardProps) {
  if (!event.startTime) return null;

  const startMin = timeToMinutes(event.startTime);
  const endMin = event.endTime ? timeToMinutes(event.endTime) : startMin + 60;
  const top = minutesToPercent(startMin);
  const height = Math.max(((endMin - startMin) / (14 * 60)) * 100, 3);
  const dotClass = DOT_CLASSES[event.color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ top: `${top}%`, height: `${height}%` }}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-lg px-2 py-1 overflow-hidden border cursor-pointer hover:z-10 transition-all hover:shadow-lg hover:scale-[1.01] group",
        event.color === "emerald" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
        event.color === "violet" && "bg-violet-500/15 border-violet-500/30 text-violet-300",
        event.color === "amber" && "bg-amber-500/15 border-amber-500/30 text-amber-300",
        event.color === "blue" && "bg-blue-500/15 border-blue-500/30 text-blue-300",
        event.color === "red" && "bg-red-500/15 border-red-500/30 text-red-300",
        event.color === "indigo" && "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
        event.color === "rose" && "bg-rose-500/15 border-rose-500/30 text-rose-300",
        event.color === "cyan" && "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
        event.completed && "opacity-50"
      )}
      title={event.title}
    >
      <p className="text-[11px] font-semibold leading-tight truncate">{event.title}</p>
      {event.startTime && (
        <p className="text-[10px] opacity-70 leading-tight">
          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
        </p>
      )}
    </motion.div>
  );
}

export function WeekView() {
  const { selectedDate, setSelectedDate, getFilteredEvents } = useCalendarStore();
  const currentDate = parseISO(selectedDate);
  const allEvents = getFilteredEvents();

  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return allEvents.filter((e) => e.date === key);
  };

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const nowPercent = minutesToPercent(currentHour * 60 + currentMinutes);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header row */}
      <div className="flex border-b border-border flex-shrink-0">
        <div className="w-14 flex-shrink-0" />
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isSelected = key === selectedDate;
          const dayIsToday = isToday(day);
          const dayEvents = getEventsForDay(day);
          const allDayEvents = dayEvents.filter((e) => e.allDay);

          return (
            <div
              key={key}
              className={cn(
                "flex-1 text-center border-l border-border cursor-pointer hover:bg-surface/50 transition-colors",
                isSelected && "bg-indigo-500/5"
              )}
              onClick={() => setSelectedDate(key)}
            >
              <div className="py-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-bold mt-0.5",
                    dayIsToday ? "bg-indigo-500 text-white" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
              {/* All-day events */}
              {allDayEvents.length > 0 && (
                <div className="px-1 pb-1 space-y-0.5">
                  {allDayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "text-[9px] px-1 py-0.5 rounded truncate font-medium",
                        ev.color === "emerald" && "bg-emerald-500/20 text-emerald-300",
                        ev.color === "red" && "bg-red-500/20 text-red-300",
                        ev.color === "amber" && "bg-amber-500/20 text-amber-300",
                        ev.color === "blue" && "bg-blue-500/20 text-blue-300",
                        ev.color === "violet" && "bg-violet-500/20 text-violet-300",
                        ev.color === "indigo" && "bg-indigo-500/20 text-indigo-300",
                        ev.color === "rose" && "bg-rose-500/20 text-rose-300",
                        ev.color === "cyan" && "bg-cyan-500/20 text-cyan-300",
                      )}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {allDayEvents.length > 2 && (
                    <div className="text-[9px] text-muted-foreground px-1">+{allDayEvents.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${HOURS.length * 60}px` }}>
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute w-full"
                style={{ top: `${((h - 7) / 14) * 100}%` }}
              >
                <span className="text-[10px] text-muted-foreground/60 pl-2">
                  {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayIsToday = isToday(day);
            const dayEvents = getEventsForDay(day).filter((e) => !e.allDay && e.startTime);

            return (
              <div
                key={key}
                className="flex-1 relative border-l border-border"
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: `${((h - 7) / 14) * 100}%` }}
                  />
                ))}

                {/* Now line */}
                {dayIsToday && nowPercent >= 0 && nowPercent <= 100 && (
                  <div
                    className="absolute w-full z-10 pointer-events-none"
                    style={{ top: `${nowPercent}%` }}
                  >
                    <div className="relative flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 -ml-1" />
                      <div className="flex-1 h-px bg-red-500" />
                    </div>
                  </div>
                )}

                {/* Timed events */}
                {dayEvents.map((ev) => (
                  <TimedEventCard key={ev.id} event={ev} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
