export type PortalMilestoneStatus = "completed" | "active" | "upcoming";
export type ClientTaskType = "upload" | "sign" | "review" | "action" | "schedule";
export type ClientTaskStatus = "pending" | "completed" | "overdue";
export type PortalDocCategory = "contract" | "disclosure" | "inspection" | "financing" | "closing" | "other";
export type PortalDocStatus = "action_required" | "pending" | "signed" | "uploaded" | "reviewed";
export type MessageSender = "client" | "team";

export interface PortalMilestone {
  id: string;
  label: string;
  description: string;
  date: string;
  status: PortalMilestoneStatus;
  icon: string;
  subSteps?: { label: string; completed: boolean }[];
  aiExplainer?: string;
}

export interface ClientTask {
  id: string;
  type: ClientTaskType;
  title: string;
  description: string;
  dueDate: string;
  status: ClientTaskStatus;
  priority: "urgent" | "normal" | "low";
  documentId?: string;
  documentName?: string;
}

export interface PortalDocument {
  id: string;
  name: string;
  category: PortalDocCategory;
  status: PortalDocStatus;
  date: string;
  size: string;
  aiSummary?: string;
  requiresSignature?: boolean;
  uploadedByClient?: boolean;
}

export interface PortalContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarInitials: string;
  avatarColor: string;
  available: boolean;
}

export interface PortalMessage {
  id: string;
  sender: MessageSender;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string }[];
  read: boolean;
}

export interface PortalActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "document" | "signature" | "task" | "message" | "milestone" | "update";
  icon: string;
}

export interface ClientPortalData {
  token: string;
  clientName: string;
  clientEmail: string;
  clientInitials: string;
  dealId: string;
  propertyAddress: string;
  propertyCity: string;
  propertyType: string;
  purchasePrice: number;
  closingDate: string;
  contractDate: string;
  currentStage: string;
  healthScore: number;
  milestones: PortalMilestone[];
  tasks: ClientTask[];
  documents: PortalDocument[];
  contacts: PortalContact[];
  messages: PortalMessage[];
  activities: PortalActivity[];
  unreadMessages: number;
  pendingTasks: number;
  docsComplete: number;
  docsTotal: number;
  welcomeMessage?: string;
}
