"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/stores/calendar-store";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { AgendaView } from "@/components/calendar/agenda-view";
import { DealTimelineView } from "@/components/calendar/deal-timeline-view";
import { QuickAddModal } from "@/components/calendar/quick-add-modal";

export function CalendarShell() {
  const { view } = useCalendarStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CalendarHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <CalendarSidebar />
        </div>

        {/* Main view */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="h-full overflow-auto p-4"
            >
              {view === "month" && <MonthView />}
              {view === "week" && <WeekView />}
              {view === "agenda" && <AgendaView />}
              {view === "timeline" && <DealTimelineView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <QuickAddModal />
    </div>
  );
}
