import type {
  ClientPortalData,
  PortalMilestone,
  ClientTask,
  ClientTaskType,
  PortalDocument,
  PortalDocCategory,
  PortalContact,
  PortalMessage,
  PortalActivity,
} from "@/types/portal";
import type { Task, Document } from "@/types";

// ─── Stage rank for milestone status derivation ───────────────────────────────
const STAGE_RANK: Record<string, number> = {
  new_lead: 0,
  under_contract: 1,
  due_diligence: 2,
  pending_docs: 3,
  clear_to_close: 4,
  closed: 5,
  cancelled: -1,
};

// Milestone definitions — stage at which each milestone becomes "completed"
const MILESTONE_DEFS = [
  {
    id: "m1",
    label: "Offer Accepted",
    description: "Your offer was accepted by the seller.",
    completesAtStage: "under_contract",
    icon: "CheckCircle",
    aiExplainer:
      "Your offer was accepted — this means you and the seller have agreed on price and terms. The transaction is now officially underway.",
    subSteps: [
      { label: "Offer submitted" },
      { label: "Counter offer reviewed" },
      { label: "Offer accepted by seller" },
    ],
  },
  {
    id: "m2",
    label: "Earnest Money Deposited",
    description: "Earnest money deposit confirmed by escrow.",
    completesAtStage: "under_contract",
    icon: "DollarSign",
    aiExplainer:
      "Earnest money is a deposit showing you're serious about the purchase. It will be applied toward your down payment at closing.",
    subSteps: [
      { label: "EMD wired to escrow" },
      { label: "Escrow confirmed receipt" },
    ],
  },
  {
    id: "m3",
    label: "Home Inspection",
    description: "Professional inspection of the property completed.",
    completesAtStage: "due_diligence",
    icon: "Search",
    aiExplainer:
      "A licensed home inspector assessed the property's condition. The report identifies any issues so you can negotiate repairs or credits before closing.",
    subSteps: [
      { label: "Inspector scheduled" },
      { label: "Inspection completed" },
      { label: "Report delivered" },
    ],
  },
  {
    id: "m4",
    label: "Appraisal",
    description: "Lender-ordered property appraisal.",
    completesAtStage: "pending_docs",
    icon: "BarChart3",
    aiExplainer:
      "Your lender hired an independent appraiser to confirm the home's market value. This ensures the loan amount is appropriate for the property.",
    subSteps: [
      { label: "Appraisal ordered by lender" },
      { label: "Appraiser visit scheduled" },
      { label: "Appraisal report received" },
    ],
  },
  {
    id: "m5",
    label: "Financing Approved",
    description: "Final loan approval from your lender.",
    completesAtStage: "clear_to_close",
    icon: "Shield",
    aiExplainer:
      "After underwriting, your lender will issue a 'Clear to Close' — this is the final approval for your mortgage. No major financial changes before this step.",
    subSteps: [
      { label: "Loan application submitted" },
      { label: "Underwriting review" },
      { label: "Clear to close issued" },
    ],
  },
  {
    id: "m6",
    label: "Documents & Disclosures",
    description: "All required documents signed and delivered.",
    completesAtStage: "clear_to_close",
    icon: "FileText",
    aiExplainer:
      "This phase covers all legal documents — title confirms there are no claims on the property, disclosures inform you of known issues, and the walkthrough confirms condition.",
    subSteps: [
      { label: "Title search complete" },
      { label: "Disclosure documents signed" },
      { label: "Final walkthrough scheduled" },
    ],
  },
  {
    id: "m7",
    label: "Final Walkthrough",
    description: "Last chance to inspect the property before closing.",
    completesAtStage: "closed",
    icon: "Home",
    aiExplainer:
      "The final walkthrough is your last opportunity to verify the property is in the agreed-upon condition and all negotiated repairs have been completed.",
    subSteps: [
      { label: "Walkthrough scheduled" },
      { label: "Walkthrough completed" },
    ],
  },
  {
    id: "m8",
    label: "Closing Day",
    description: "Sign final documents and receive your keys.",
    completesAtStage: "closed",
    icon: "Key",
    aiExplainer:
      "On closing day you'll sign final documents, funds will be transferred, and you'll receive the keys to your new home. Congratulations in advance!",
    subSteps: [
      { label: "Closing disclosure reviewed" },
      { label: "Wire transfer confirmed" },
      { label: "Documents signed" },
      { label: "Keys received" },
    ],
  },
];

export function generateMilestones(
  stage: string,
  closingDate: string,
  contractDate: string
): PortalMilestone[] {
  const stageRank = STAGE_RANK[stage] ?? 0;
  const isCancelled = stage === "cancelled";
  let foundActive = false;

  return MILESTONE_DEFS.map((def, idx) => {
    const completesRank = STAGE_RANK[def.completesAtStage] ?? 0;
    let status: PortalMilestone["status"];

    if (!isCancelled && stageRank >= completesRank) {
      status = "completed";
    } else if (!foundActive && !isCancelled) {
      status = "active";
      foundActive = true;
    } else {
      status = "upcoming";
    }

    // Estimate milestone date
    let date = "—";
    if (closingDate) {
      const closing = new Date(closingDate);
      if (status === "completed" && contractDate) {
        const contract = new Date(contractDate);
        const totalDays = Math.max(1, (closing.getTime() - contract.getTime()) / 86400000);
        const fraction = idx / (MILESTONE_DEFS.length - 1);
        const estimated = new Date(contract.getTime() + fraction * totalDays * 86400000);
        date = estimated.toISOString().split("T")[0];
      } else if (status !== "upcoming") {
        const daysBeforeClosing = (MILESTONE_DEFS.length - 1 - idx) * 6;
        const estimated = new Date(closing.getTime() - daysBeforeClosing * 86400000);
        date = estimated.toISOString().split("T")[0];
      } else {
        const daysBeforeClosing = (MILESTONE_DEFS.length - 1 - idx) * 6;
        const estimated = new Date(closing.getTime() - daysBeforeClosing * 86400000);
        date = estimated.toISOString().split("T")[0];
      }
    }

    // Sub-steps: completed ones depend on status
    const completedCount =
      status === "completed"
        ? def.subSteps.length
        : status === "active"
        ? Math.ceil(def.subSteps.length / 2)
        : 0;

    return {
      id: def.id,
      label: def.label,
      description: def.description,
      date,
      status,
      icon: def.icon,
      aiExplainer: def.aiExplainer,
      subSteps: def.subSteps.map((step, i) => ({
        label: step.label,
        completed: i < completedCount,
      })),
    };
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

export function inferTaskType(title: string, description = ""): ClientTaskType {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("upload") || text.includes("provide") || text.includes("submit") || text.includes("send"))
    return "upload";
  if (text.includes("sign") || text.includes("signature") || text.includes("execute")) return "sign";
  if (text.includes("review") || text.includes("read") || text.includes("verify")) return "review";
  if (
    text.includes("schedule") ||
    text.includes("appointment") ||
    text.includes("walkthrough") ||
    text.includes("book")
  )
    return "schedule";
  return "action";
}

export function mapTaskToPortal(task: Task): ClientTask {
  const now = new Date();
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < now &&
    task.status !== "completed" &&
    task.status !== "cancelled";

  let status: ClientTask["status"] = "pending";
  if (task.status === "completed") status = "completed";
  else if (isOverdue) status = "overdue";

  let priority: ClientTask["priority"] = "normal";
  if (task.priority === "critical" || task.priority === "high") priority = "urgent";
  else if (task.priority === "low") priority = "low";

  return {
    id: task.id,
    type: inferTaskType(task.title, task.description),
    title: task.title,
    description: task.description ?? "",
    dueDate: task.due_date ?? "—",
    status,
    priority,
  };
}

const DOC_CATEGORY_MAP: Record<string, PortalDocCategory> = {
  purchase_agreement: "contract",
  disclosure: "disclosure",
  inspection: "inspection",
  title: "contract",
  financing: "financing",
  closing: "closing",
  addendum: "other",
  other: "other",
};

export function mapDocToPortal(doc: Document): PortalDocument {
  const status: PortalDocument["status"] = doc.is_signed ? "signed" : "uploaded";
  const sizeKB = doc.file_size / 1024;
  const sizeMB = sizeKB / 1024;
  const sizeStr =
    sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : sizeKB >= 1 ? `${Math.round(sizeKB)} KB` : "—";

  return {
    id: doc.id,
    name: doc.name,
    category: DOC_CATEGORY_MAP[doc.category] ?? "other",
    status,
    date: doc.created_at ? doc.created_at.split("T")[0] : "—",
    size: doc.file_size > 0 ? sizeStr : "—",
    aiSummary: (doc.ai_extracted as Record<string, unknown> | undefined)?.summary as
      | string
      | undefined,
    requiresSignature:
      !doc.is_signed &&
      (doc.category === "purchase_agreement" ||
        doc.category === "disclosure" ||
        doc.category === "addendum"),
  };
}

const AVATAR_COLORS = ["indigo", "teal", "violet", "emerald", "amber", "rose"];

export function mapProfileToContact(profile: Record<string, unknown>): PortalContact {
  const name = profile.full_name as string;
  const charSum = (name.charCodeAt(0) ?? 0) + (name.charCodeAt(1) ?? 0);
  return {
    id: profile.id as string,
    name,
    role: (profile.title as string) || roleLabel(profile.role as string) || "Team Member",
    email: (profile.email as string) ?? "",
    phone: (profile.phone as string) ?? "",
    avatarInitials: getInitials(name),
    avatarColor: AVATAR_COLORS[charSum % AVATAR_COLORS.length],
    available: true,
  };
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    brokerage_owner: "Brokerage Owner",
    admin: "Administrator",
    team_coordinator: "Transaction Coordinator",
    agent: "Agent",
    assistant: "Assistant",
  };
  return map[role] ?? role;
}

export function mapPortalMessageRow(row: Record<string, unknown>): PortalMessage {
  const isClient = row.sender_type === "client";
  const profile = row.profiles as { full_name?: string } | null;
  const senderName = isClient ? "You" : (profile?.full_name ?? "Team Member");

  return {
    id: row.id as string,
    sender: isClient ? "client" : "team",
    senderName,
    senderInitials: getInitials(senderName),
    content: row.content as string,
    timestamp: row.created_at as string,
    read: Boolean(row.is_read),
  };
}

export function mapActivityRow(row: Record<string, unknown>): PortalActivity {
  const typeMap: Record<string, PortalActivity["type"]> = {
    document: "document",
    documents: "document",
    signature: "signature",
    signatures: "signature",
    task: "task",
    tasks: "task",
    message: "message",
    messages: "message",
    milestone: "milestone",
    deal: "milestone",
    stage_changed: "milestone",
    created: "update",
    updated: "update",
  };

  const entityType = (row.entity_type as string) ?? "";
  const action = (row.action as string) ?? "";
  const type: PortalActivity["type"] =
    typeMap[entityType] ?? typeMap[action] ?? "update";

  const iconMap: Record<PortalActivity["type"], string> = {
    document: "FileText",
    signature: "PenLine",
    task: "CheckSquare",
    message: "MessageSquare",
    milestone: "CheckCircle",
    update: "Activity",
  };

  return {
    id: row.id as string,
    title: (row.description as string) || "Activity update",
    description: ((row.metadata as Record<string, unknown>)?.note as string) || "",
    timestamp: row.created_at as string,
    type,
    icon: iconMap[type],
  };
}

export function generateWelcomeMessage(
  stage: string,
  healthScore: number,
  closingDate: string
): string {
  const daysToClose = Math.max(
    0,
    Math.floor((new Date(closingDate).getTime() - Date.now()) / 86400000)
  );

  if (stage === "closed") return "Congratulations on closing! Your transaction is complete.";
  if (stage === "cancelled") return "This transaction has been cancelled. Contact your agent for next steps.";
  if (stage === "clear_to_close") return "You're clear to close! Final steps are underway — you're almost there.";
  if (healthScore >= 80) {
    if (daysToClose <= 7) return "You're in the home stretch — closing is just around the corner!";
    return "Your transaction is on track. Our team is here every step of the way — reach out anytime.";
  }
  if (healthScore >= 60)
    return "A few items need your attention. Check your tasks below to keep things moving.";
  return "Please review your pending tasks — urgent items need attention to keep your transaction on track.";
}

export function buildPortalData(
  token: string,
  client: Record<string, unknown>,
  deal: Record<string, unknown>,
  tasks: Record<string, unknown>[],
  docs: Record<string, unknown>[],
  messages: Record<string, unknown>[],
  activities: Record<string, unknown>[],
  profiles: Record<string, unknown>[]
): ClientPortalData {
  const portalTasks = tasks.map((t) => mapTaskToPortal(t as unknown as Task));
  const portalDocs = docs.map((d) => mapDocToPortal(d as unknown as Document));
  const portalMessages = messages.map(mapPortalMessageRow);
  const portalActivities = activities.map(mapActivityRow);
  const portalContacts = profiles.map(mapProfileToContact);

  const unreadMessages = portalMessages.filter(
    (m) => !m.read && m.sender === "team"
  ).length;
  const pendingTasks = portalTasks.filter(
    (t) => t.status === "pending" || t.status === "overdue"
  ).length;
  const completeDocs = portalDocs.filter(
    (d) => d.status === "signed" || d.status === "reviewed"
  ).length;

  const propertyTypeLabels: Record<string, string> = {
    single_family: "Single Family Home",
    condo: "Condominium",
    townhouse: "Townhouse",
    multi_family: "Multi-Family",
    commercial: "Commercial",
    land: "Land",
    other: "Property",
  };

  const stage = (deal.stage as string) ?? "new_lead";
  const closingDate =
    (deal.closing_date as string) ??
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const contractDate =
    (deal.contract_date as string) ?? new Date().toISOString().split("T")[0];

  return {
    token,
    clientName: client.full_name as string,
    clientEmail: (client.email as string) ?? "",
    clientInitials: getInitials(client.full_name as string),
    dealId: deal.id as string,
    propertyAddress: deal.address as string,
    propertyCity: `${deal.city as string}, ${deal.state as string}${
      deal.zip ? ` ${deal.zip as string}` : ""
    }`,
    propertyType: propertyTypeLabels[(deal.property_type as string) ?? "other"] ?? "Property",
    purchasePrice: Number(deal.purchase_price ?? 0),
    closingDate,
    contractDate,
    currentStage: stage,
    healthScore: Number(deal.health_score ?? 80),
    milestones: generateMilestones(stage, closingDate, contractDate),
    tasks: portalTasks,
    documents: portalDocs,
    contacts: portalContacts,
    messages: portalMessages,
    activities: portalActivities,
    unreadMessages,
    pendingTasks,
    docsComplete: completeDocs,
    docsTotal: portalDocs.length,
    welcomeMessage: generateWelcomeMessage(
      stage,
      Number(deal.health_score ?? 80),
      closingDate
    ),
  };
}
