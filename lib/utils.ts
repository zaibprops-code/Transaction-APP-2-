import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import type { Deal, Task, HealthFactor } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, fmt = "MMM d, yyyy"): string {
  try {
    return format(new Date(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function getDaysToClose(closingDate: string): number {
  return differenceInDays(new Date(closingDate), new Date());
}

export function getHealthColor(score: number): string {
  if (score >= 75) return "emerald";
  if (score >= 50) return "amber";
  return "red";
}

export function getHealthLabel(score: number): string {
  if (score >= 75) return "Healthy";
  if (score >= 50) return "At Risk";
  return "Critical";
}

export function computeHealthFactors(deal: Pick<Deal, "closing_date" | "task_count" | "doc_count" | "stage">): { factors: HealthFactor[]; score: number } {
  const days = differenceInDays(new Date(deal.closing_date), new Date());

  // Days to close (max 25)
  let daysScore: number;
  let daysStatus: HealthFactor["status"];
  let daysDesc: string;
  if (days > 30) { daysScore = 25; daysStatus = "good"; daysDesc = `${days} days remaining`; }
  else if (days > 14) { daysScore = 20; daysStatus = "good"; daysDesc = `${days} days remaining`; }
  else if (days > 7) { daysScore = 14; daysStatus = "warning"; daysDesc = `${days} days remaining`; }
  else if (days >= 0) { daysScore = 7; daysStatus = "critical"; daysDesc = `${days} days remaining`; }
  else { daysScore = 3; daysStatus = "critical"; daysDesc = "Past closing date"; }

  // Pending tasks (max 25) — lower task_count = healthier
  const tasks = deal.task_count ?? 0;
  let tasksScore: number;
  let tasksStatus: HealthFactor["status"];
  let tasksDesc: string;
  if (tasks === 0) { tasksScore = 25; tasksStatus = "good"; tasksDesc = "No pending tasks"; }
  else if (tasks <= 2) { tasksScore = 20; tasksStatus = "good"; tasksDesc = `${tasks} task${tasks > 1 ? "s" : ""} pending`; }
  else if (tasks <= 5) { tasksScore = 14; tasksStatus = "warning"; tasksDesc = `${tasks} tasks pending`; }
  else { tasksScore = 8; tasksStatus = "critical"; tasksDesc = `${tasks} tasks pending`; }

  // Documents (max 25) — more docs = healthier
  const docs = deal.doc_count ?? 0;
  let docsScore: number;
  let docsStatus: HealthFactor["status"];
  let docsDesc: string;
  if (docs >= 8) { docsScore = 25; docsStatus = "good"; docsDesc = "All docs collected"; }
  else if (docs >= 4) { docsScore = 20; docsStatus = "good"; docsDesc = `${docs} documents uploaded`; }
  else if (docs >= 1) { docsScore = 12; docsStatus = "warning"; docsDesc = `${docs} doc${docs > 1 ? "s" : ""} uploaded`; }
  else { docsScore = 5; docsStatus = "critical"; docsDesc = "No documents uploaded"; }

  // Communication / stage progress (max 25)
  const stageScores: Record<Deal["stage"], number> = {
    new_lead: 10, under_contract: 15, due_diligence: 18, pending_docs: 20, clear_to_close: 23, closed: 25, cancelled: 5,
  };
  const commScore = stageScores[deal.stage] ?? 10;
  const commStatus: HealthFactor["status"] = commScore >= 20 ? "good" : commScore >= 14 ? "warning" : "critical";
  const commDesc = commScore >= 23 ? "Clear to close" : commScore >= 20 ? "Good progress" : commScore >= 15 ? "Under contract" : "Early stage";

  const factors: HealthFactor[] = [
    { label: "Days to close", score: daysScore, max_score: 25, status: daysStatus, description: daysDesc },
    { label: "Pending tasks", score: tasksScore, max_score: 25, status: tasksStatus, description: tasksDesc },
    { label: "Documents", score: docsScore, max_score: 25, status: docsStatus, description: docsDesc },
    { label: "Communication", score: commScore, max_score: 25, status: commStatus, description: commDesc },
  ];

  const score = factors.reduce((sum, f) => sum + f.score, 0);
  return { factors, score };
}

export function getStageLabel(stage: Deal["stage"]): string {
  const labels: Record<Deal["stage"], string> = {
    new_lead: "New Lead",
    under_contract: "Under Contract",
    due_diligence: "Due Diligence",
    pending_docs: "Pending Docs",
    clear_to_close: "Clear to Close",
    closed: "Closed",
    cancelled: "Cancelled",
  };
  return labels[stage] ?? stage;
}

export function getStageColor(stage: Deal["stage"]): string {
  const colors: Record<Deal["stage"], string> = {
    new_lead: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    under_contract: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    due_diligence: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    pending_docs: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    clear_to_close: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    closed: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return colors[stage] ?? "text-slate-400 bg-slate-400/10";
}

export function getPriorityColor(priority: Task["priority"]): string {
  const colors: Record<Task["priority"], string> = {
    critical: "text-red-400 bg-red-400/10 border-red-400/20",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  };
  return colors[priority] ?? "text-slate-400 bg-slate-400/10";
}

export function getPropertyTypeLabel(type: Deal["property_type"]): string {
  const labels: Record<Deal["property_type"], string> = {
    single_family: "Single Family",
    condo: "Condo",
    townhouse: "Townhouse",
    multi_family: "Multi-Family",
    commercial: "Commercial",
    land: "Land",
    other: "Other",
  };
  return labels[type] ?? type;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isOverdue(dueDate: string): boolean {
  return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
}

export function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getDocumentCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    purchase_agreement: "Purchase Agreement",
    disclosure: "Disclosure",
    inspection: "Inspection Report",
    title: "Title Document",
    financing: "Financing",
    closing: "Closing Document",
    addendum: "Addendum",
    other: "Other",
  };
  return labels[category] ?? category;
}

export function getDocumentIcon(mimeType: string): string {
  if (mimeType === "application/pdf") return "FileText";
  if (mimeType.includes("word")) return "FileText";
  if (mimeType.includes("image")) return "Image";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "Table";
  return "File";
}

export function isDemo(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url"
  );
}
