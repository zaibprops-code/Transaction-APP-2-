"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from "lucide-react";
import { useCalendarStore } from "@/stores/calendar-store";
import { DOT_CLASSES } from "@/components/calendar/event-pill";
import { cn } from "@/lib/utils";

const MINI_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function MiniCalendar() {
  const { selectedDate, setSelectedDate, getFilteredEvents } = useCalendarStore();
  const current = parseISO(selectedDate);
  const allEvents = getFilteredEvents();

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => set.add(e.date));
    return set;
  }, [allEvents]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current));
    const end = endOfWeek(endOfMonth(current));
    return eachDayOfInterval({ start, end });
  }, [current]);

  const prevMonth = () =>
    setSelectedDate(format(startOfMonth(subMonths(current, 1)), "yyyy-MM-dd"));
  const nextMonth = () =>
    setSelectedDate(format(startOfMonth(addMonths(current, 1)), "yyyy-MM-dd"));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">
          {format(current, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={nextMonth}
            className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {MINI_WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-muted-foreground/60 font-semibold py-0.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isSelected = key === selectedDate;
          const dayIsToday = isToday(day);
          const inMonth = isSameMonth(day, current);
          const hasEvents = eventDates.has(key);

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={cn(
                "relative w-full aspect-square flex flex-col items-center justify-center rounded-md text-[11px] font-medium transition-all",
                isSelected
                  ? "bg-indigo-500 text-white"
                  : dayIsToday
                  ? "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30"
                  : inMonth
                  ? "text-foreground hover:bg-surface-2"
                  : "text-muted-foreground/30"
              )}
            >
              {format(day, "d")}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FILTER_ITEMS = [
  { key: "showClosings", label: "Closings & Possession", color: "bg-emerald-400" },
  { key: "showInspections", label: "Inspections", color: "bg-amber-400" },
  { key: "showAppraisals", label: "Appraisals & Title", color: "bg-blue-400" },
  { key: "showSignings", label: "Signings & Walkthroughs", color: "bg-violet-400" },
  { key: "showContingencies", label: "Deadlines", color: "bg-red-400" },
  { key: "showMeetings", label: "Meetings", color: "bg-indigo-400" },
  { key: "showTasks", label: "Task Due Dates", color: "bg-rose-400" },
] as const;

export function CalendarSidebar() {
  const { filter, setFilter, getFilteredEvents, selectedDate } = useCalendarStore();
  const allEvents = getFilteredEvents();

  const upcomingEvents = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return allEvents
      .filter((e) => e.date >= today && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [allEvents]);

  const highPriorityCount = useMemo(
    () => allEvents.filter((e) => e.priority === "high" && !e.completed && e.date >= format(new Date(), "yyyy-MM-dd")).length,
    [allEvents]
  );

  return (
    <div className="w-56 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Mini calendar */}
        <MiniCalendar />

        {/* AI Insights */}
        {highPriorityCount > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-300">AI Insights</span>
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-amber-200/80">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-400" />
              <span>{highPriorityCount} high-priority event{highPriorityCount !== 1 ? "s" : ""} in the next 30 days</span>
            </div>
          </div>
        )}

        {/* Calendar layers */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Calendar Layers
          </p>
          <div className="space-y-1">
            {FILTER_ITEMS.map((item) => {
              const isOn = filter[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter({ [item.key]: !isOn })}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all",
                    isOn
                      ? "text-foreground hover:bg-surface-2"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  )}
                >
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-sm flex-shrink-0",
                    isOn ? item.color : "bg-muted-foreground/20"
                  )} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Coming Up
          </p>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No upcoming events</p>
            ) : (
              upcomingEvents.map((ev) => {
                const dotClass = DOT_CLASSES[ev.color];
                return (
                  <div key={ev.id} className="flex items-start gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", dotClass)} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{ev.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {ev.startTime ? ` · ${ev.startTime}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
