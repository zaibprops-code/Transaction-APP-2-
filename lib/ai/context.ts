import {
  MOCK_DEALS,
  MOCK_TASKS,
  MOCK_DOCUMENTS,
  MOCK_TEAM,
  MOCK_SIGNATURE_REQUESTS,
} from "@/lib/mock-data";

export interface ProactiveInsight {
  id: string;
  type: "risk" | "overdue" | "signature" | "document" | "inactivity";
  message: string;
  prompt: string;
  severity: "high" | "medium" | "low";
}

export function buildContext(pathname: string, dealId?: string): string {
  const now = new Date();
  const activeDeals = MOCK_DEALS.filter((d) => d.status === "active");
  const atRiskDeals = activeDeals.filter((d) => d.health_score < 60);
  const overdueTasks = MOCK_TASKS.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed"
  );
  const pendingSigs = MOCK_SIGNATURE_REQUESTS.filter((s) => s.status === "pending");
  const missingDocs = MOCK_DOCUMENTS.filter((d) => !d.ai_extracted);
  const teamWorkload = MOCK_TEAM.map((m) => ({
    name: m.full_name,
    taskCount: MOCK_TASKS.filter((t) => t.assigned_to === m.id && t.status !== "completed").length,
  }));

  const currentDeal = dealId ? MOCK_DEALS.find((d) => d.id === dealId) : null;

  let ctx = `You are CloseTrack AI, an intelligent AI Operations Assistant for a real estate transaction coordination platform called CloseTrack.

## Current Date
${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

## Current Page
${getPageName(pathname)}

## Platform Overview
- Total active deals: ${activeDeals.length}
- At-risk deals (health < 60): ${atRiskDeals.length} — ${atRiskDeals.map((d) => d.address).join(", ")}
- Overdue tasks: ${overdueTasks.length}
- Pending signatures: ${pendingSigs.length}
- Missing document reviews: ${missingDocs.length}

## Active Deals Summary
${activeDeals
  .map(
    (d) =>
      `- ${d.address} (${d.city}, ${d.state}): Stage=${d.stage}, Health=${d.health_score}/100, Closing=${d.closing_date}, Buyer=${d.buyer_name}, Assigned=${MOCK_TEAM.find((t) => t.id === d.assigned_to)?.full_name ?? "Unassigned"}`
  )
  .join("\n")}

## Team Workload
${teamWorkload.map((m) => `- ${m.name}: ${m.taskCount} open tasks`).join("\n")}

## At-Risk Deals Detail
${atRiskDeals
  .map(
    (d) =>
      `- ${d.address}: Score ${d.health_score} — ${d.health_factors
        .filter((f) => f.status !== "good")
        .map((f) => f.description)
        .join(", ")}`
  )
  .join("\n")}
`;

  if (currentDeal) {
    ctx += `
## Current Deal Context
Address: ${currentDeal.address}, ${currentDeal.city}, ${currentDeal.state}
Buyer: ${currentDeal.buyer_name}
Seller: ${currentDeal.seller_name}
Stage: ${currentDeal.stage}
Health Score: ${currentDeal.health_score}/100
Closing Date: ${currentDeal.closing_date}
Purchase Price: $${currentDeal.purchase_price.toLocaleString()}
Tasks: ${currentDeal.task_count} total
Documents: ${currentDeal.doc_count} collected
Pending Signatures: ${currentDeal.pending_sigs}
`;
  }

  ctx += `
## Your Role
You are an AI Operations Manager. You can answer questions, provide insights, and help coordinate transactions.
Always reference actual data. Be concise, professional, and action-oriented. Format responses with markdown.
When suggesting actions, be specific with deal names and task details from the real data above.`;

  return ctx;
}

export function getProactiveInsights(): ProactiveInsight[] {
  const now = new Date();
  const insights: ProactiveInsight[] = [];

  const atRiskDeals = MOCK_DEALS.filter((d) => d.status === "active" && d.health_score < 60);
  if (atRiskDeals.length > 0) {
    insights.push({
      id: "risk-deals",
      type: "risk",
      severity: "high",
      message: `${atRiskDeals.length} deal${atRiskDeals.length > 1 ? "s" : ""} at risk of missing closing`,
      prompt: "Which deals are at risk and what should I do?",
    });
  }

  const overdueTasks = MOCK_TASKS.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed"
  );
  if (overdueTasks.length > 0) {
    insights.push({
      id: "overdue-tasks",
      type: "overdue",
      severity: "high",
      message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} need attention`,
      prompt: "Show me all overdue tasks and suggest how to prioritize them",
    });
  }

  const pendingSigs = MOCK_SIGNATURE_REQUESTS.filter((s) => s.status === "pending");
  if (pendingSigs.length > 0) {
    insights.push({
      id: "pending-sigs",
      type: "signature",
      severity: "medium",
      message: `${pendingSigs.length} signature request${pendingSigs.length > 1 ? "s" : ""} awaiting response`,
      prompt: "Which signature requests are still pending?",
    });
  }

  insights.push({
    id: "client-inactivity",
    type: "inactivity",
    severity: "medium",
    message: "Michael Torres hasn't responded in 5 days",
    prompt: "Draft a follow-up email for the 4520 Riverside Blvd deal",
  });

  return insights.slice(0, 3);
}

function getPageName(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard — Overview";
  if (pathname.startsWith("/deals/") && pathname.length > 7) return `Deal Workspace — ${pathname.split("/")[2]}`;
  if (pathname === "/deals") return "Deals Pipeline";
  if (pathname === "/tasks") return "Task Manager";
  if (pathname === "/documents") return "Document Center";
  if (pathname === "/ai") return "AI Assistant Hub";
  if (pathname === "/analytics") return "Analytics";
  return pathname;
}
