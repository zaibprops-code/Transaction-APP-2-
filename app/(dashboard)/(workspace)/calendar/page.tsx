import type { Metadata } from "next";
import { CalendarShell } from "@/components/calendar/calendar-shell";

export const metadata: Metadata = {
  title: "Calendar — CloseTrack",
  description: "Transaction calendar with deal timelines and AI scheduling",
};

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CalendarShell />
    </div>
  );
}
