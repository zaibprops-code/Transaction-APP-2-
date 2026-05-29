export type UserRole =
  | "solo_coordinator"
  | "agent"
  | "team_coordinator"
  | "brokerage_admin"
  | "enterprise_admin"
  | "client"
  | "platform_admin";

export type DealStage =
  | "new_lead"
  | "under_contract"
  | "due_diligence"
  | "pending_docs"
  | "clear_to_close"
  | "closed"
  | "cancelled";

export type DealStatus = "active" | "closed" | "cancelled" | "on_hold";

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "commercial"
  | "land"
  | "other";

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "blocked";

export type DocumentCategory =
  | "purchase_agreement"
  | "disclosure"
  | "inspection"
  | "title"
  | "financing"
  | "closing"
  | "addendum"
  | "other";

export type SignatureStatus = "pending" | "sent" | "viewed" | "signed" | "declined" | "expired";

export type CommunicationType = "email" | "sms" | "note" | "call_log";

export type NotificationType =
  | "task_due"
  | "signature_needed"
  | "document_uploaded"
  | "deal_stage_changed"
  | "ai_insight"
  | "message_received"
  | "closing_reminder";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "growth" | "enterprise";
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_url?: string;
  title?: string;
  phone?: string;
  preferences: Record<string, unknown>;
  created_at: string;
}

export interface Deal {
  id: string;
  org_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: PropertyType;
  status: DealStatus;
  stage: DealStage;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  seller_name: string;
  seller_email?: string;
  seller_phone?: string;
  listing_agent?: string;
  buyers_agent?: string;
  purchase_price: number;
  closing_date: string;
  contract_date: string;
  earnest_money?: number;
  down_payment?: number;
  loan_amount?: number;
  health_score: number;
  health_factors: HealthFactor[];
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  doc_count?: number;
  pending_sigs?: number;
}

export interface HealthFactor {
  label: string;
  score: number;
  max_score: number;
  status: "good" | "warning" | "critical";
  description: string;
}

export interface Task {
  id: string;
  deal_id: string;
  deal_address?: string;
  org_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  due_date: string;
  completed_at?: string;
  dependencies: string[];
  created_by: string;
  created_at: string;
  tags?: string[];
}

export interface Document {
  id: string;
  deal_id: string;
  deal_address?: string;
  org_id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: DocumentCategory;
  ai_extracted?: Record<string, unknown>;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
  version?: number;
  is_signed?: boolean;
}

export interface SignatureRequest {
  id: string;
  deal_id: string;
  deal_address?: string;
  org_id: string;
  document_id: string;
  document_name?: string;
  signers: Signer[];
  status: SignatureStatus;
  expires_at: string;
  audit_trail: AuditEntry[];
  created_by: string;
  created_at: string;
  signing_url?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: SignatureStatus;
  signed_at?: string;
  ip_address?: string;
}

export interface AuditEntry {
  timestamp: string;
  event: string;
  actor: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
}

export interface Communication {
  id: string;
  deal_id: string;
  deal_address?: string;
  org_id: string;
  type: CommunicationType;
  subject: string;
  body: string;
  from_email: string;
  from_name?: string;
  to_emails: string[];
  status: "draft" | "sent" | "delivered" | "failed";
  sent_at?: string;
  created_at: string;
  attachments?: string[];
  thread_id?: string;
}

export interface Activity {
  id: string;
  org_id: string;
  deal_id?: string;
  deal_address?: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  icon?: string;
  color?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  org_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  deal_id?: string;
  deal_address?: string;
  type: "risk" | "opportunity" | "action" | "reminder";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  recommended_action?: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  deal_context?: string;
  tools_used?: string[];
}

export interface AnalyticsData {
  deals_by_month: { month: string; closed: number; opened: number; value: number }[];
  pipeline_value_over_time: { date: string; value: number }[];
  task_completion_rate: { week: string; rate: number; completed: number; total: number }[];
  stage_distribution: { stage: string; count: number; value: number }[];
  team_performance: { name: string; deals_closed: number; avg_days: number; revenue: number }[];
  health_distribution: { deal: string; health_score: number; days_to_close: number }[];
}

export interface KPIData {
  active_deals: number;
  active_deals_trend: number;
  tasks_due_today: number;
  tasks_overdue: number;
  docs_pending_signature: number;
  closings_this_month: number;
  closings_revenue: number;
  closings_trend: number;
}
