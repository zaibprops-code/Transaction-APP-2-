import { create } from "zustand";
import type { CalendarView, CalendarEvent, CalendarFilter } from "@/types/calendar";
import { DEFAULT_FILTER } from "@/types/calendar";
import { getMockCalendarEvents } from "@/lib/calendar/mock-calendar-data";
import { format } from "date-fns";

interface CalendarStore {
  view: CalendarView;
  selectedDate: string; // YYYY-MM-DD
  events: CalendarEvent[];
  filter: CalendarFilter;
  quickAddOpen: boolean;
  quickAddDate: string | null;

  setView: (view: CalendarView) => void;
  setSelectedDate: (date: string) => void;
  setFilter: (filter: Partial<CalendarFilter>) => void;
  openQuickAdd: (date?: string) => void;
  closeQuickAdd: () => void;
  addEvent: (event: CalendarEvent) => void;
  toggleEventComplete: (id: string) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getFilteredEvents: () => CalendarEvent[];
}

function applyFilter(events: CalendarEvent[], filter: CalendarFilter): CalendarEvent[] {
  return events.filter((e) => {
    if (e.type === "closing" || e.type === "possession") return filter.showClosings;
    if (e.type === "inspection") return filter.showInspections;
    if (e.type === "appraisal" || e.type === "title_search") return filter.showAppraisals;
    if (e.type === "task_due") return filter.showTasks;
    if (e.type === "meeting" || e.type === "open_house") return filter.showMeetings;
    if (e.type === "contingency_deadline" || e.type === "financing_deadline") return filter.showContingencies;
    if (e.type === "signing" || e.type === "walkthrough") return filter.showSignings;
    return true;
  });
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  view: "month",
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  events: getMockCalendarEvents(),
  filter: DEFAULT_FILTER,
  quickAddOpen: false,
  quickAddDate: null,

  setView: (view) => set({ view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setFilter: (partial) =>
    set((state) => ({ filter: { ...state.filter, ...partial } })),

  openQuickAdd: (date) =>
    set({ quickAddOpen: true, quickAddDate: date ?? format(new Date(), "yyyy-MM-dd") }),
  closeQuickAdd: () => set({ quickAddOpen: false, quickAddDate: null }),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  toggleEventComplete: (id) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      ),
    })),

  getEventsForDate: (date) => {
    const { events, filter } = get();
    return applyFilter(
      events.filter((e) => e.date === date),
      filter
    );
  },

  getFilteredEvents: () => {
    const { events, filter } = get();
    return applyFilter(events, filter);
  },
}));
