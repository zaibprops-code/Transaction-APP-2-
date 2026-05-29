import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import type { Deal, Task } from "@/types";

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
