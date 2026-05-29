export const APP_NAME = "CloseTrack";
export const APP_TAGLINE = "The AI Operating System for Real Estate Transactions";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://closetrack.co";

export const DEAL_STAGES = [
  { id: "new_lead", label: "New Lead", color: "blue" },
  { id: "under_contract", label: "Under Contract", color: "violet" },
  { id: "due_diligence", label: "Due Diligence", color: "indigo" },
  { id: "pending_docs", label: "Pending Docs", color: "amber" },
  { id: "clear_to_close", label: "Clear to Close", color: "emerald" },
  { id: "closed", label: "Closed", color: "slate" },
  { id: "cancelled", label: "Cancelled", color: "red" },
] as const;

export const TASK_PRIORITIES = [
  { id: "critical", label: "Critical", color: "red" },
  { id: "high", label: "High", color: "orange" },
  { id: "medium", label: "Medium", color: "amber" },
  { id: "low", label: "Low", color: "slate" },
] as const;

export const DOCUMENT_CATEGORIES = [
  { id: "purchase_agreement", label: "Purchase Agreement" },
  { id: "disclosure", label: "Disclosure" },
  { id: "inspection", label: "Inspection Report" },
  { id: "title", label: "Title Document" },
  { id: "financing", label: "Financing" },
  { id: "closing", label: "Closing Document" },
  { id: "addendum", label: "Addendum" },
  { id: "other", label: "Other" },
] as const;

export const PROPERTY_TYPES = [
  { id: "single_family", label: "Single Family" },
  { id: "condo", label: "Condo" },
  { id: "townhouse", label: "Townhouse" },
  { id: "multi_family", label: "Multi-Family" },
  { id: "commercial", label: "Commercial" },
  { id: "land", label: "Land" },
  { id: "other", label: "Other" },
] as const;

export const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { id: "deals", label: "Deals", href: "/deals", icon: "Building2", badge: null },
      { id: "tasks", label: "Tasks", href: "/tasks", icon: "CheckSquare", badge: null },
      { id: "documents", label: "Documents", href: "/documents", icon: "FolderOpen" },
    ],
  },
  {
    section: "Operations",
    items: [
      { id: "signatures", label: "Signatures", href: "/signatures", icon: "PenLine" },
      { id: "communications", label: "Communications", href: "/communications", icon: "MessageSquare" },
      { id: "clients", label: "Clients", href: "/clients", icon: "Users" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { id: "ai", label: "AI Assistant", href: "/ai", icon: "Sparkles" },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: "BarChart3" },
    ],
  },
] as const;

export const AI_QUICK_PROMPTS = [
  "Summarize my active deals",
  "What needs my attention today?",
  "Which deals are at risk?",
  "Draft a follow-up email",
  "Analyze contract risks",
  "Generate tasks for a deal",
  "What documents are missing?",
  "Show me closing this month",
] as const;

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price_monthly: 49,
    price_annual: 39,
    description: "Perfect for solo transaction coordinators getting started.",
    features: [
      "Up to 10 active deals",
      "Task management",
      "Document storage (5GB)",
      "Basic e-signatures (10/mo)",
      "Client portal",
      "Email support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price_monthly: 149,
    price_annual: 119,
    description: "For growing teams that need AI-powered coordination.",
    features: [
      "Unlimited active deals",
      "Full AI assistant access",
      "Document storage (50GB)",
      "Unlimited e-signatures",
      "Advanced workflow automation",
      "Team collaboration (up to 5)",
      "Analytics dashboard",
      "Priority support",
      "API access",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: null,
    price_annual: null,
    description: "For brokerages and large organizations with custom needs.",
    features: [
      "Everything in Growth",
      "Unlimited team members",
      "SSO / SAML authentication",
      "Custom integrations & API",
      "White-label client portal",
      "Dedicated success manager",
      "SLA guarantees",
      "Custom AI training",
      "Audit logs & compliance",
      "On-premise option",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
] as const;
