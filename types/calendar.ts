export type CalendarView = "month" | "week" | "agenda" | "timeline";

export type CalendarEventType =
  | "closing"
  | "inspection"
  | "appraisal"
  | "walkthrough"
  | "contingency_deadline"
  | "signing"
  | "meeting"
  | "task_due"
  | "open_house"
  | "financing_deadline"
  | "title_search"
  | "possession";

export type CalendarEventColor =
  | "emerald"
  | "violet"
  | "amber"
  | "blue"
  | "red"
  | "indigo"
  | "rose"
  | "cyan";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  color: CalendarEventColor;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  allDay?: boolean;
  dealId?: string;
  dealAddress?: string;
  assignedTo?: string;
  assignedToName?: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  completed?: boolean;
  location?: string;
}

export interface DealMilestone {
  id: string;
  dealId: string;
  label: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  color: CalendarEventColor;
  completed: boolean;
}

export interface DealTimelineRow {
  dealId: string;
  address: string;
  stage: string;
  healthScore: number;
  contractDate: string;
  closingDate: string;
  milestones: DealMilestone[];
}

export interface CalendarFilter {
  showClosings: boolean;
  showInspections: boolean;
  showAppraisals: boolean;
  showTasks: boolean;
  showMeetings: boolean;
  showContingencies: boolean;
  showSignings: boolean;
}

export const DEFAULT_FILTER: CalendarFilter = {
  showClosings: true,
  showInspections: true,
  showAppraisals: true,
  showTasks: true,
  showMeetings: true,
  showContingencies: true,
  showSignings: true,
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  closing: "Closing",
  inspection: "Inspection",
  appraisal: "Appraisal",
  walkthrough: "Walkthrough",
  contingency_deadline: "Contingency",
  signing: "Signing",
  meeting: "Meeting",
  task_due: "Task Due",
  open_house: "Open House",
  financing_deadline: "Financing",
  title_search: "Title Search",
  possession: "Possession",
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, CalendarEventColor> = {
  closing: "emerald",
  inspection: "amber",
  appraisal: "blue",
  walkthrough: "cyan",
  contingency_deadline: "red",
  signing: "violet",
  meeting: "indigo",
  task_due: "rose",
  open_house: "amber",
  financing_deadline: "red",
  title_search: "blue",
  possession: "emerald",
};
