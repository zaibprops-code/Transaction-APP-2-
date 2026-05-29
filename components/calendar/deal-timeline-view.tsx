"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  parseISO,
  differenceInDays,
  eachDayOfInterval,
  isToday,
  startOfDay,
  addDays,
  isSameDay,
} from "date-fns";
import { getDealTimelineRows } from "@/lib/calendar/mock-calendar-data";
import { DOT_CLASSES, COLOR_CLASSES } from "@/components/calendar/event-pill";
import { cn } from "@/lib/utils";
import type { DealTimelineRow, DealMilestone, CalendarEventColor } from "@/types/calendar";
import { ZoomIn, ZoomOut, ChevronRight } from "lucide-react";

type ZoomLevel = 30 | 60 | 90;

const ZOOM_OPTIONS: ZoomLevel[] = [30, 60, 90];

const HEALTH_COLOR: Record<string, string> = {
  good: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  warning: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  critical: "bg-red-500/20 border-red-500/30 text-red-300",
};

function getHealthBand(score: number) {
  if (score >= 75) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

const STAGE_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  under_contract: "Under Contract",
  due_diligence: "Due Diligence",
  pending_docs: "Pending Docs",
  clear_to_close: "Clear to Close",
  closed: "Closed",
};

interface MilestoneTooltipProps {
  milestone: DealMilestone;
}

function MilestoneTooltip({ milestone }: MilestoneTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
      <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-xl whitespace-nowrap text-xs">
        <p className="font-semibold text-foreground">{milestone.label}</p>
        <p className="text-muted-foreground mt-0.5">{format(parseISO(milestone.date), "MMM d, yyyy")}</p>
      </div>
    </div>
  );
}

interface TimelineBarProps {
  row: DealTimelineRow;
  startDate: Date;
  totalDays: number;
  columnWidth: number;
}

function TimelineBar({ row, startDate, totalDays, columnWidth }: TimelineBarProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const healthBand = getHealthBand(row.healthScore);

  const contractDate = parseISO(row.contractDate);
  const closingDate = parseISO(row.closingDate);
  const today = startOfDay(new Date());

  // Calculate positions as percentages
  const totalPx = totalDays * columnWidth;
  const startPx = Math.max(0, differenceInDays(contractDate, startDate)) * columnWidth;
  const endPx = Math.min(totalDays, differenceInDays(closingDate, startDate) + 1) * columnWidth;
  const widthPx = Math.max(endPx - startPx, 20);

  const todayPx = differenceInDays(today, startDate) * columnWidth;
  const progressPct =
    todayPx <= startPx
      ? 0
      : todayPx >= endPx
      ? 100
      : ((todayPx - startPx) / widthPx) * 100;

  return (
    <div className="relative h-12 flex items-center">
      {/* Bar background */}
      <div
        className={cn(
          "absolute h-6 rounded-full border opacity-30",
          healthBand === "good" && "bg-emerald-500 border-emerald-400",
          healthBand === "warning" && "bg-amber-500 border-amber-400",
          healthBand === "critical" && "bg-red-500 border-red-400"
        )}
        style={{ left: startPx, width: widthPx }}
      />
      {/* Progress fill */}
      <div
        className={cn(
          "absolute h-6 rounded-full",
          healthBand === "good" && "bg-emerald-500",
          healthBand === "warning" && "bg-amber-500",
          healthBand === "critical" && "bg-red-500"
        )}
        style={{ left: startPx, width: `${(progressPct / 100) * widthPx}px` }}
      />

      {/* Milestones */}
      {row.milestones.map((ms) => {
        const msDate = parseISO(ms.date);
        const msPx = differenceInDays(msDate, startDate) * columnWidth;
        if (msPx < 0 || msPx > totalPx) return null;
        const dotClass = DOT_CLASSES[ms.color as CalendarEventColor] ?? "bg-white";
        const isHovered = hoveredMilestone === ms.id;

        return (
          <div
            key={ms.id}
            className="absolute z-10"
            style={{ left: msPx - 6 }}
            onMouseEnter={() => setHoveredMilestone(ms.id)}
            onMouseLeave={() => setHoveredMilestone(null)}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full border-2 border-background transition-transform cursor-pointer",
                dotClass,
                ms.completed && "opacity-50",
                isHovered && "scale-150"
              )}
            />
            {isHovered && <MilestoneTooltip milestone={ms} />}
          </div>
        );
      })}
    </div>
  );
}

export function DealTimelineView() {
  const [zoom, setZoom] = useState<ZoomLevel>(60);
  const rows = useMemo(() => getDealTimelineRows(), []);

  const today = startOfDay(new Date());
  const startDate = addDays(today, -5);
  const endDate = addDays(today, zoom - 5);
  const totalDays = zoom;
  const COLUMN_WIDTH = 20; // px per day

  const days = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  // Group day labels by month
  const monthGroups = useMemo(() => {
    const groups: { month: string; startIdx: number; count: number }[] = [];
    let currentMonth = "";
    let startIdx = 0;
    days.forEach((d, i) => {
      const m = format(d, "MMM yyyy");
      if (m !== currentMonth) {
        if (currentMonth) groups[groups.length - 1].count = i - startIdx;
        groups.push({ month: m, startIdx: i, count: 0 });
        currentMonth = m;
        startIdx = i;
      }
    });
    if (groups.length > 0) {
      groups[groups.length - 1].count = days.length - groups[groups.length - 1].startIdx;
    }
    return groups;
  }, [days]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <p className="text-sm text-muted-foreground">No active deals to display</p>
      </div>
    );
  }

  const todayOffset = differenceInDays(today, startDate) * COLUMN_WIDTH;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Deal Milestone Timeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {rows.length} active deal{rows.length !== 1 ? "s" : ""} — Gantt view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom:</span>
          {ZOOM_OPTIONS.map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                zoom === z
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
              )}
            >
              {z}d
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        {[
          { label: "On Track", color: "bg-emerald-500" },
          { label: "At Risk", color: "bg-amber-500" },
          { label: "Critical", color: "bg-red-500" },
          { label: "Today", color: "bg-red-400", dashed: true },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={cn("w-3 h-0.5 rounded", l.color, l.dashed && "border-t border-dashed")} />
            {l.label}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
          Milestones
        </div>
      </div>

      {/* Timeline container */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-max">
          {/* Row labels */}
          <div className="w-52 flex-shrink-0 mr-3">
            {/* Header spacer */}
            <div className="h-10" />
            {/* Day label spacer */}
            <div className="h-7" />

            {/* Deal rows */}
            {rows.map((row) => {
              const healthBand = getHealthBand(row.healthScore);
              return (
                <div key={row.dealId} className="h-12 flex items-center">
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          healthBand === "good" && "bg-emerald-400",
                          healthBand === "warning" && "bg-amber-400",
                          healthBand === "critical" && "bg-red-400"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate max-w-[170px]">
                          {row.address}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {STAGE_LABELS[row.stage] ?? row.stage} · {row.healthScore}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gantt area */}
          <div className="flex-1 relative" style={{ width: `${totalDays * COLUMN_WIDTH}px` }}>
            {/* Month labels */}
            <div className="flex h-5 mb-1">
              {monthGroups.map((g) => (
                <div
                  key={g.month}
                  className="flex-shrink-0 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1"
                  style={{ width: `${g.count * COLUMN_WIDTH}px` }}
                >
                  {g.month}
                </div>
              ))}
            </div>

            {/* Day labels */}
            <div className="flex h-7 border-b border-border mb-0">
              {days.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const dayIsToday = isToday(d);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-shrink-0 text-center border-r border-border/30 flex flex-col items-center justify-center",
                      isWeekend && "bg-surface/30"
                    )}
                    style={{ width: COLUMN_WIDTH }}
                  >
                    <span className={cn(
                      "text-[9px] font-medium",
                      dayIsToday ? "text-red-400" : "text-muted-foreground/60"
                    )}>
                      {format(d, "d")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Today vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400/60 z-20 pointer-events-none"
              style={{ left: todayOffset }}
            >
              <div className="w-6 -ml-3 mt-12 text-center">
                <span className="text-[9px] text-red-400 font-semibold bg-background px-0.5">NOW</span>
              </div>
            </div>

            {/* Weekend shading */}
            {days.map((d, i) => {
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              if (!isWeekend) return null;
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 bg-surface/40 pointer-events-none"
                  style={{ left: i * COLUMN_WIDTH, width: COLUMN_WIDTH }}
                />
              );
            })}

            {/* Deal rows */}
            {rows.map((row) => (
              <motion.div
                key={row.dealId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-border/20"
              >
                <TimelineBar
                  row={row}
                  startDate={startDate}
                  totalDays={totalDays}
                  columnWidth={COLUMN_WIDTH}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestone color legend */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border pt-4">
          {[
            { label: "Contract", color: "bg-violet-400" },
            { label: "Inspection", color: "bg-amber-400" },
            { label: "Appraisal", color: "bg-blue-400" },
            { label: "Financing", color: "bg-red-400" },
            { label: "Walkthrough", color: "bg-cyan-400" },
            { label: "Closing", color: "bg-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
