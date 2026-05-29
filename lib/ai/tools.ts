import { z } from "zod";
import { MOCK_DEALS, MOCK_TASKS, MOCK_DOCUMENTS, MOCK_TEAM } from "@/lib/mock-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AITool<TInput = any, TOutput = unknown> {
  name: string;
  description: string;
  parameters: z.ZodSchema<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

// Deal Tools
export const getDealTool: AITool = {
  name: "getDeal",
  description: "Get details about a specific deal by ID or address",
  parameters: z.object({ deal_id: z.string().optional(), address: z.string().optional() }),
  execute: async ({ deal_id, address }: { deal_id?: string; address?: string }) => {
    const deal = MOCK_DEALS.find(
      (d) => d.id === deal_id || d.address.toLowerCase().includes((address ?? "").toLowerCase())
    );
    if (!deal) return { error: "Deal not found" };
    return { deal, team_member: MOCK_TEAM.find((t) => t.id === deal.assigned_to) };
  },
};

export const listDealsTool: AITool = {
  name: "listDeals",
  description: "List all deals with optional filters",
  parameters: z.object({
    status: z.enum(["active", "closed", "cancelled"]).optional(),
    stage: z.string().optional(),
    at_risk: z.boolean().optional(),
  }),
  execute: async ({ status, stage, at_risk }: { status?: string; stage?: string; at_risk?: boolean }) => {
    let deals = [...MOCK_DEALS];
    if (status) deals = deals.filter((d) => d.status === status);
    if (stage) deals = deals.filter((d) => d.stage === stage);
    if (at_risk) deals = deals.filter((d) => d.health_score < 60);
    return { deals, total: deals.length };
  },
};

export const analyzeDealTool: AITool = {
  name: "analyzeDeal",
  description: "Analyze deal health, risks, and recommended actions",
  parameters: z.object({ deal_id: z.string() }),
  execute: async ({ deal_id }: { deal_id: string }) => {
    const deal = MOCK_DEALS.find((d) => d.id === deal_id);
    if (!deal) return { error: "Deal not found" };
    const daysToClose = Math.ceil((new Date(deal.closing_date).getTime() - Date.now()) / 86400000);
    const risks = deal.health_factors.filter((f) => f.status !== "good");
    return {
      deal_id,
      address: deal.address,
      health_score: deal.health_score,
      days_to_close: daysToClose,
      risks,
      risk_level: deal.health_score < 50 ? "critical" : deal.health_score < 70 ? "warning" : "good",
      recommended_actions: risks.map((r) => `Address: ${r.label} — ${r.description}`),
    };
  },
};

// Task Tools
export const listTasksTool: AITool = {
  name: "listTasks",
  description: "List tasks with optional filters",
  parameters: z.object({
    deal_id: z.string().optional(),
    assigned_to: z.string().optional(),
    overdue: z.boolean().optional(),
    priority: z.string().optional(),
  }),
  execute: async ({ deal_id, assigned_to, overdue, priority }: { deal_id?: string; assigned_to?: string; overdue?: boolean; priority?: string }) => {
    let tasks = [...MOCK_TASKS];
    if (deal_id) tasks = tasks.filter((t) => t.deal_id === deal_id);
    if (assigned_to) tasks = tasks.filter((t) => t.assigned_to === assigned_to);
    if (overdue) tasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed");
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    return { tasks, total: tasks.length };
  },
};

export const createTaskTool: AITool = {
  name: "createTask",
  description: "Create a new task for a deal",
  parameters: z.object({
    deal_id: z.string(),
    title: z.string(),
    priority: z.enum(["low", "medium", "high", "critical"]),
    assigned_to: z.string().optional(),
    due_date: z.string().optional(),
  }),
  execute: async (input: { deal_id: string; title: string; priority: string; assigned_to?: string; due_date?: string }) => {
    const deal = MOCK_DEALS.find((d) => d.id === input.deal_id);
    const assignee = input.assigned_to ? MOCK_TEAM.find((m) => m.id === input.assigned_to) : MOCK_TEAM[0];
    return {
      id: `task-new-${Date.now()}`,
      ...input,
      deal_address: deal?.address,
      assigned_to_name: assignee?.full_name,
      status: "pending",
      created_at: new Date().toISOString(),
    };
  },
};

export const generateChecklistTool: AITool = {
  name: "generateChecklist",
  description: "Generate a closing checklist for a deal",
  parameters: z.object({ deal_id: z.string() }),
  execute: async ({ deal_id }: { deal_id: string }) => {
    const deal = MOCK_DEALS.find((d) => d.id === deal_id);
    return {
      deal_id,
      address: deal?.address,
      checklist: [
        { item: "Purchase agreement executed", status: "complete" },
        { item: "Earnest money deposited", status: "complete" },
        { item: "Inspection completed", status: deal?.doc_count && deal.doc_count > 5 ? "complete" : "pending" },
        { item: "Financing approval received", status: "pending" },
        { item: "Title search completed", status: "pending" },
        { item: "Final walk-through scheduled", status: "pending" },
        { item: "Closing disclosure reviewed", status: "pending" },
        { item: "Wire transfer instructions verified", status: "pending" },
      ],
      total: 8,
      completed: deal?.doc_count && deal.doc_count > 5 ? 3 : 2,
    };
  },
};

// Document Tools
export const listDocumentsTool: AITool = {
  name: "listDocuments",
  description: "List documents for a deal or all deals",
  parameters: z.object({ deal_id: z.string().optional(), category: z.string().optional() }),
  execute: async ({ deal_id, category }: { deal_id?: string; category?: string }) => {
    let docs = [...MOCK_DOCUMENTS];
    if (deal_id) docs = docs.filter((d) => d.deal_id === deal_id);
    if (category) docs = docs.filter((d) => d.category === category);
    return { documents: docs, total: docs.length };
  },
};

export const analyzeDocumentTool: AITool = {
  name: "analyzeDocument",
  description: "AI analysis of a document for key terms, risks, and dates",
  parameters: z.object({ document_id: z.string() }),
  execute: async ({ document_id }: { document_id: string }) => {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === document_id);
    if (!doc) return { error: "Document not found" };
    return {
      document_id,
      name: doc.name,
      analysis: {
        key_dates: ["Closing: see deal record", "Inspection deadline: passed"],
        risks: ["No significant risks detected"],
        key_terms: ["Purchase price", "Earnest money", "Contingencies"],
        completeness: "Complete",
        recommendation: "Document appears standard. No action required.",
      },
    };
  },
};

// Communication Tools
export const draftEmailTool: AITool = {
  name: "draftEmail",
  description: "Draft a professional email for a deal party",
  parameters: z.object({
    deal_id: z.string(),
    recipient_type: z.enum(["buyer", "seller", "agent", "lender", "title"]),
    purpose: z.string(),
  }),
  execute: async ({ deal_id, recipient_type, purpose }: { deal_id: string; recipient_type: string; purpose: string }) => {
    const deal = MOCK_DEALS.find((d) => d.id === deal_id);
    const recipient = recipient_type === "buyer" ? deal?.buyer_name : deal?.seller_name;
    return {
      deal_id,
      to: recipient_type === "buyer" ? deal?.buyer_email : deal?.seller_email,
      subject: `${purpose} — ${deal?.address}`,
      body: `Dear ${recipient},\n\nI'm writing regarding your transaction at ${deal?.address}. ${purpose}.\n\nPlease don't hesitate to reach out with any questions.\n\nBest regards,\nCloseTrack Team`,
      status: "draft",
    };
  },
};

// Analytics Tools
export const riskAnalysisTool: AITool = {
  name: "riskAnalysis",
  description: "Comprehensive risk analysis across all active deals",
  parameters: z.object({}),
  execute: async () => {
    const active = MOCK_DEALS.filter((d) => d.status === "active");
    return {
      total_active: active.length,
      critical: active.filter((d) => d.health_score < 50).length,
      warning: active.filter((d) => d.health_score >= 50 && d.health_score < 70).length,
      healthy: active.filter((d) => d.health_score >= 70).length,
      at_risk_deals: active.filter((d) => d.health_score < 60).map((d) => ({
        address: d.address,
        score: d.health_score,
        primary_risk: d.health_factors.find((f) => f.status === "critical")?.label || d.health_factors.find((f) => f.status === "warning")?.label,
      })),
    };
  },
};

export const workloadAnalysisTool: AITool = {
  name: "workloadAnalysis",
  description: "Analyze team workload and identify imbalances",
  parameters: z.object({}),
  execute: async () => {
    return MOCK_TEAM.map((m) => ({
      id: m.id,
      name: m.full_name,
      role: m.role,
      open_tasks: MOCK_TASKS.filter((t) => t.assigned_to === m.id && t.status !== "completed").length,
      active_deals: MOCK_DEALS.filter((d) => d.assigned_to === m.id && d.status === "active").length,
      overdue_tasks: MOCK_TASKS.filter(
        (t) => t.assigned_to === m.id && t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
      ).length,
    }));
  },
};

export const ALL_TOOLS = [
  getDealTool,
  listDealsTool,
  analyzeDealTool,
  listTasksTool,
  createTaskTool,
  generateChecklistTool,
  listDocumentsTool,
  analyzeDocumentTool,
  draftEmailTool,
  riskAnalysisTool,
  workloadAnalysisTool,
];
