import { MOCK_DEALS, MOCK_TASKS } from "@/lib/mock-data";
import type { CalendarEvent, DealTimelineRow, DealMilestone } from "@/types/calendar";
import { EVENT_TYPE_COLORS } from "@/types/calendar";
import { addDays, subDays, format } from "date-fns";

function offsetDate(baseDate: string, offsetDays: number): string {
  return format(addDays(new Date(baseDate), offsetDays), "yyyy-MM-dd");
}

function subOffsetDate(baseDate: string, offsetDays: number): string {
  return format(subDays(new Date(baseDate), offsetDays), "yyyy-MM-dd");
}

function todayOffset(days: number): string {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

// Generate events from mock deals
export function getMockCalendarEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  MOCK_DEALS.forEach((deal) => {
    if (!deal.closing_date) return;
    const closingDate = deal.closing_date;

    // Closing day
    events.push({
      id: `${deal.id}-closing`,
      title: `Closing — ${deal.address}`,
      type: "closing",
      color: EVENT_TYPE_COLORS.closing,
      date: closingDate,
      startTime: "10:00",
      endTime: "11:30",
      dealId: deal.id,
      dealAddress: deal.address,
      allDay: false,
      description: `Closing for ${deal.buyer_name} at ${deal.address}. Purchase price: $${deal.purchase_price?.toLocaleString()}`,
      priority: "high",
      completed: deal.status === "closed",
    });

    // Possession (1 day after closing)
    if (deal.status === "active") {
      events.push({
        id: `${deal.id}-possession`,
        title: `Possession — ${deal.address}`,
        type: "possession",
        color: EVENT_TYPE_COLORS.possession,
        date: offsetDate(closingDate, 1),
        startTime: "12:00",
        allDay: false,
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Key handoff and possession transfer for ${deal.address}`,
        priority: "high",
        completed: false,
      });
    }

    // Final walkthrough (2 days before closing)
    if (deal.status === "active") {
      events.push({
        id: `${deal.id}-walkthrough`,
        title: `Final Walkthrough — ${deal.address}`,
        type: "walkthrough",
        color: EVENT_TYPE_COLORS.walkthrough,
        date: subOffsetDate(closingDate, 2),
        startTime: "14:00",
        endTime: "15:00",
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Pre-closing walkthrough for ${deal.buyer_name}`,
        priority: "medium",
        completed: false,
      });
    }

    // Inspection (based on stage)
    if (
      deal.stage === "due_diligence" ||
      deal.stage === "under_contract" ||
      deal.stage === "pending_docs"
    ) {
      events.push({
        id: `${deal.id}-inspection`,
        title: `Home Inspection — ${deal.address}`,
        type: "inspection",
        color: EVENT_TYPE_COLORS.inspection,
        date: subOffsetDate(closingDate, 14),
        startTime: "09:00",
        endTime: "12:00",
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Property inspection for ${deal.address}. Inspector: John Martinez`,
        priority: "high",
        completed: false,
      });
    }

    // Appraisal
    if (
      deal.stage === "due_diligence" ||
      deal.stage === "pending_docs" ||
      deal.stage === "clear_to_close"
    ) {
      events.push({
        id: `${deal.id}-appraisal`,
        title: `Appraisal — ${deal.address}`,
        type: "appraisal",
        color: EVENT_TYPE_COLORS.appraisal,
        date: subOffsetDate(closingDate, 10),
        startTime: "11:00",
        endTime: "12:30",
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Property appraisal. Lender: First National Bank`,
        priority: "high",
        completed: deal.stage === "clear_to_close",
      });
    }

    // Financing contingency deadline
    if (deal.stage !== "closed" && deal.status === "active") {
      events.push({
        id: `${deal.id}-financing`,
        title: `Financing Deadline — ${deal.address}`,
        type: "financing_deadline",
        color: EVENT_TYPE_COLORS.financing_deadline,
        date: subOffsetDate(closingDate, 7),
        allDay: true,
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Loan commitment deadline for ${deal.address}`,
        priority: "high",
        completed: false,
      });
    }

    // Inspection contingency (15 days before closing for active deals)
    if (deal.stage === "due_diligence" || deal.stage === "under_contract") {
      events.push({
        id: `${deal.id}-inspection-contingency`,
        title: `Inspection Contingency — ${deal.address}`,
        type: "contingency_deadline",
        color: EVENT_TYPE_COLORS.contingency_deadline,
        date: subOffsetDate(closingDate, 15),
        allDay: true,
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Deadline to complete inspections and submit repair requests`,
        priority: "high",
        completed: false,
      });
    }

    // Signing event
    if (deal.pending_sigs && deal.pending_sigs > 0) {
      events.push({
        id: `${deal.id}-signing`,
        title: `Document Signing — ${deal.address}`,
        type: "signing",
        color: EVENT_TYPE_COLORS.signing,
        date: subOffsetDate(closingDate, 3),
        startTime: "15:00",
        endTime: "16:30",
        dealId: deal.id,
        dealAddress: deal.address,
        description: `${deal.pending_sigs} document${deal.pending_sigs > 1 ? "s" : ""} pending signature`,
        priority: "high",
        completed: false,
      });
    }

    // Title search
    if (deal.status === "active") {
      events.push({
        id: `${deal.id}-title`,
        title: `Title Search — ${deal.address}`,
        type: "title_search",
        color: EVENT_TYPE_COLORS.title_search,
        date: subOffsetDate(closingDate, 12),
        allDay: true,
        dealId: deal.id,
        dealAddress: deal.address,
        description: `Title search and examination for ${deal.address}`,
        priority: "medium",
        completed: false,
      });
    }
  });

  // Add task due dates as calendar events
  MOCK_TASKS.forEach((task) => {
    if (!task.due_date) return;
    const deal = MOCK_DEALS.find((d) => d.id === task.deal_id);
    events.push({
      id: `task-${task.id}`,
      title: task.title,
      type: "task_due",
      color: task.priority === "critical" ? "red" : task.priority === "high" ? "rose" : "indigo",
      date: task.due_date,
      allDay: true,
      dealId: task.deal_id ?? undefined,
      dealAddress: deal?.address,
      assignedTo: task.assigned_to ?? undefined,
      description: task.description ?? undefined,
      priority: task.priority === "critical" || task.priority === "high" ? "high" : task.priority === "medium" ? "medium" : "low",
      completed: task.status === "completed",
    });
  });

  // Add a few meetings
  events.push(
    {
      id: "meeting-1",
      title: "Team Pipeline Review",
      type: "meeting",
      color: "indigo",
      date: todayOffset(0),
      startTime: "10:00",
      endTime: "11:00",
      allDay: false,
      description: "Weekly deal pipeline review with all coordinators",
      priority: "medium",
      completed: false,
    },
    {
      id: "meeting-2",
      title: "Lender Call — 4520 Riverside Blvd",
      type: "meeting",
      color: "indigo",
      date: todayOffset(2),
      startTime: "14:00",
      endTime: "14:30",
      allDay: false,
      dealId: "deal-2",
      dealAddress: "4520 Riverside Blvd",
      description: "Update call with First National Bank regarding loan status",
      priority: "high",
      completed: false,
    },
    {
      id: "meeting-3",
      title: "Client Onboarding — 215 Harbor View",
      type: "meeting",
      color: "indigo",
      date: todayOffset(4),
      startTime: "11:00",
      endTime: "12:00",
      allDay: false,
      dealId: "deal-5",
      dealAddress: "215 Harbor View Lane",
      description: "Introduction meeting with Olivia & Ryan Walsh",
      priority: "medium",
      completed: false,
    },
    {
      id: "meeting-4",
      title: "Open House — 923 Maple Court",
      type: "open_house",
      color: "amber",
      date: todayOffset(6),
      startTime: "13:00",
      endTime: "16:00",
      allDay: false,
      dealId: "deal-3",
      dealAddress: "923 Maple Court",
      description: "Sunday open house for 923 Maple Court, Nashville TN",
      priority: "medium",
      completed: false,
    }
  );

  return events;
}

// Build Gantt timeline data for active deals
export function getDealTimelineRows(): DealTimelineRow[] {
  const activeDeals = MOCK_DEALS.filter(
    (d) => d.status === "active" && d.closing_date && d.contract_date
  );

  return activeDeals.map((deal) => {
    const closingDate = deal.closing_date!;
    const contractDate = deal.contract_date!;

    const milestones: DealMilestone[] = [
      {
        id: `${deal.id}-contract`,
        dealId: deal.id,
        label: "Contract",
        date: contractDate,
        type: "signing",
        color: "violet",
        completed: true,
      },
    ];

    if (deal.stage === "due_diligence" || deal.stage === "under_contract") {
      milestones.push({
        id: `${deal.id}-inspection-ms`,
        dealId: deal.id,
        label: "Inspection",
        date: subOffsetDate(closingDate, 14),
        type: "inspection",
        color: "amber",
        completed: false,
      });
    }

    if (deal.stage !== "new_lead") {
      milestones.push({
        id: `${deal.id}-appraisal-ms`,
        dealId: deal.id,
        label: "Appraisal",
        date: subOffsetDate(closingDate, 10),
        type: "appraisal",
        color: "blue",
        completed: deal.stage === "clear_to_close",
      });
    }

    milestones.push(
      {
        id: `${deal.id}-financing-ms`,
        dealId: deal.id,
        label: "Financing",
        date: subOffsetDate(closingDate, 7),
        type: "financing_deadline",
        color: "red",
        completed: deal.stage === "clear_to_close" || deal.stage === "pending_docs",
      },
      {
        id: `${deal.id}-walkthrough-ms`,
        dealId: deal.id,
        label: "Walkthrough",
        date: subOffsetDate(closingDate, 2),
        type: "walkthrough",
        color: "cyan",
        completed: false,
      },
      {
        id: `${deal.id}-closing-ms`,
        dealId: deal.id,
        label: "Closing",
        date: closingDate,
        type: "closing",
        color: "emerald",
        completed: false,
      }
    );

    return {
      dealId: deal.id,
      address: deal.address,
      stage: deal.stage,
      healthScore: deal.health_score,
      contractDate,
      closingDate,
      milestones,
    };
  });
}
