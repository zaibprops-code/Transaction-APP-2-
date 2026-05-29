import { MOCK_DEALS, MOCK_TASKS, MOCK_TEAM, MOCK_DOCUMENTS } from "@/lib/mock-data";

interface DemoResponse {
  content: string;
  toolCalls?: Array<{ tool: string; result: unknown }>;
}

export function getDemoResponse(userMessage: string): DemoResponse {
  const msg = userMessage.toLowerCase();
  const now = new Date();

  const activeDeals = MOCK_DEALS.filter((d) => d.status === "active");
  const atRiskDeals = activeDeals.filter((d) => d.health_score < 60);
  const overdueTasks = MOCK_TASKS.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed"
  );
  const closingSoon = activeDeals
    .filter((d) => {
      const days = Math.ceil((new Date(d.closing_date).getTime() - now.getTime()) / 86400000);
      return days >= 0 && days <= 14;
    })
    .sort((a, b) => new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime());

  // BRIEFING / DAILY
  if (msg.includes("briefing") || msg.includes("daily") || msg.includes("good morning") || msg.includes("what's happening")) {
    return {
      content: `## 📋 Daily Briefing — ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}

### 🎯 Priority Actions for Today
1. **923 Maple Court** — Health score critical at 45/100. 5 documents missing, 9 tasks pending. Needs immediate attention.
2. **4520 Riverside Blvd** — 3 overdue tasks for Priya Patel. Follow-up with Michael Torres overdue by 5 days.
3. **3340 Elm Street** — 4 documents missing with closing in 22 days. Risk of delay.

### 📊 Pipeline Snapshot
- **${activeDeals.length} active deals** | **${atRiskDeals.length} at risk** | **${closingSoon.length} closing this week**
- Pipeline value: **$${activeDeals.reduce((s, d) => s + d.purchase_price, 0).toLocaleString()}**

### 🔴 At-Risk Deals
${atRiskDeals.map((d) => `- **${d.address}** — Score: ${d.health_score}/100 — ${d.health_factors.filter((f) => f.status !== "good").map((f) => f.description).join(", ")}`).join("\n")}

### 📅 Closing This Week
${closingSoon.length > 0 ? closingSoon.map((d) => `- **${d.address}** closes ${new Date(d.closing_date).toLocaleDateString()} — ${d.buyer_name}`).join("\n") : "- No closings in the next 7 days"}

### 👥 Team Alerts
- **Sarah Mitchell** has the most critical tasks today (1847 Oakwood + 923 Maple Court)
- **Priya Patel** has 3 overdue tasks — consider redistributing workload

### 🤖 AI Recommendations
I can help you draft follow-up emails, generate task checklists, or analyze any deal in detail. Just ask!`,
    };
  }

  // RISK / AT RISK
  if (msg.includes("risk") || msg.includes("at risk") || msg.includes("danger") || msg.includes("health")) {
    return {
      content: `## 🔴 At-Risk Deals Analysis

I've identified **${atRiskDeals.length} deals** with health scores below 60 that need immediate attention:

${atRiskDeals
  .map(
    (d) => `### ${d.address} — Score: ${d.health_score}/100
**Stage:** ${d.stage.replace(/_/g, " ")} | **Closing:** ${new Date(d.closing_date).toLocaleDateString()} | **Assigned:** ${MOCK_TEAM.find((t) => t.id === d.assigned_to)?.full_name}
**Issues:**
${d.health_factors
  .filter((f) => f.status !== "good")
  .map((f) => `- ⚠️ ${f.label}: ${f.description}`)
  .join("\n")}`
  )
  .join("\n\n")}

### 💡 Recommended Actions
1. **923 Maple Court** — Schedule urgent document collection meeting with Paul & Grace Kim
2. **4520 Riverside Blvd** — Send follow-up email to Michael Torres (no response in 5 days)
3. **3340 Elm Street** — Escalate to Brokerage Manager Rachel Torres

Would you like me to draft follow-up emails or generate action checklists for any of these deals?`,
      toolCalls: [
        {
          tool: "riskAnalysis",
          result: {
            at_risk_count: atRiskDeals.length,
            deals: atRiskDeals.map((d) => ({ address: d.address, score: d.health_score, stage: d.stage })),
          },
        },
      ],
    };
  }

  // OVERDUE / TASKS
  if (msg.includes("overdue") || (msg.includes("task") && !msg.includes("create") && !msg.includes("generate"))) {
    return {
      content: `## ✅ Task Overview

### 🔴 Overdue Tasks (${overdueTasks.length})
${overdueTasks.length > 0
  ? overdueTasks
      .map(
        (t) =>
          `- **${t.title}** — ${t.deal_address} | Assigned: ${t.assigned_to_name} | Due: ${new Date(t.due_date!).toLocaleDateString()} | Priority: ${t.priority}`
      )
      .join("\n")
  : "- No overdue tasks 🎉"}

### 📋 All Open Tasks (${MOCK_TASKS.filter((t) => t.status !== "completed").length} total)
${MOCK_TASKS.filter((t) => t.status !== "completed")
  .slice(0, 8)
  .map((t) => `- **${t.title}** — ${t.deal_address} | ${t.assigned_to_name} | Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : "No date"} | ${t.priority} priority`)
  .join("\n")}

### 💡 Recommendations
- **Priya Patel** has the most overdue work — consider reassigning the HOA document follow-up
- The 923 Maple Court deal has 9 pending tasks — highest workload in the pipeline
- I can generate a full checklist for any deal. Just say "generate checklist for [address]"`,
      toolCalls: [
        {
          tool: "listTasks",
          result: {
            total: MOCK_TASKS.length,
            overdue: overdueTasks.length,
            by_priority: { critical: 2, high: 4, medium: 3, low: 1 },
          },
        },
      ],
    };
  }

  // CLOSING / CLOSE
  if (msg.includes("clos") || msg.includes("this week") || msg.includes("upcoming")) {
    return {
      content: `## 📅 Upcoming Closings

${closingSoon.length > 0
  ? closingSoon
      .map((d) => {
        const days = Math.ceil((new Date(d.closing_date).getTime() - now.getTime()) / 86400000);
        return `### ${d.address} — Closes in ${days} day${days === 1 ? "" : "s"}
**Buyer:** ${d.buyer_name} | **Price:** $${d.purchase_price.toLocaleString()}
**Health:** ${d.health_score}/100 | **Stage:** ${d.stage.replace(/_/g, " ")}
**Pending sigs:** ${d.pending_sigs} | **Tasks:** ${d.task_count}`;
      })
      .join("\n\n")
  : "No closings in the next 14 days."}

### ✅ Closing Checklist for 1847 Oakwood Drive (closes in 5 days)
- ✅ Purchase agreement signed
- ✅ Financing secured
- ⏳ Final walk-through confirmation pending
- ⏳ Wire transfer instructions needed
- ✅ Title cleared
- ✅ Inspection complete

### 💡 Immediate Actions
1. Confirm final walk-through for 1847 Oakwood Drive (closes in 5 days!)
2. Collect wire transfer instructions from David & Emily Park
3. Ensure all signatures are complete before closing day

Would you like me to send reminders to all parties for the upcoming closings?`,
    };
  }

  // EMAIL / DRAFT
  if (msg.includes("email") || msg.includes("draft") || msg.includes("follow-up") || msg.includes("follow up")) {
    const deal = activeDeals.find((d) => d.health_score < 70) || activeDeals[0];
    return {
      content: `## 📧 Draft Follow-Up Email

Here's a professional follow-up email for **${deal.address}**:

---

**To:** ${deal.buyer_email || "buyer@email.com"}
**Subject:** Update Required — ${deal.address} Transaction

Dear ${deal.buyer_name},

I hope this message finds you well. I'm reaching out regarding your upcoming transaction at **${deal.address}**.

We are currently in the **${deal.stage.replace(/_/g, " ")}** stage with your closing date approaching on **${new Date(deal.closing_date).toLocaleDateString()}**.

**Items Still Required:**
${deal.health_factors
  .filter((f) => f.status !== "good")
  .map((f) => `• ${f.label}: ${f.description}`)
  .join("\n")}

To keep your closing on track, please provide the above items at your earliest convenience. Our team is available to assist you through this process.

Please don't hesitate to reach out if you have any questions.

Best regards,
Sarah Mitchell
Lead Transaction Coordinator | CloseTrack
sarah@closetrack.co | (555) 234-5678

---

*Would you like me to adjust the tone, add specific details, or send this email directly?*`,
      toolCalls: [
        { tool: "draftEmail", result: { deal_id: deal.id, status: "draft_ready", recipient: deal.buyer_email } },
      ],
    };
  }

  // SUMMARIZE / SUMMARY
  if (msg.includes("summar") || msg.includes("overview") || msg.includes("status")) {
    const totalValue = activeDeals.reduce((s, d) => s + d.purchase_price, 0);
    return {
      content: `## 📊 Platform Summary

### Pipeline Overview
| Metric | Value |
|--------|-------|
| Active Deals | ${activeDeals.length} |
| Total Pipeline Value | $${totalValue.toLocaleString()} |
| At-Risk Deals | ${atRiskDeals.length} |
| Overdue Tasks | ${overdueTasks.length} |
| Pending Signatures | 5 |

### Deals by Stage
- **New Lead:** 215 Harbor View Lane (San Diego, $1.2M)
- **Under Contract:** 7801 Summit Ridge Rd (Phoenix, $395K)
- **Due Diligence:** 923 Maple Court (Nashville, $620K) ⚠️
- **Pending Docs:** 4520 Riverside Blvd, 3340 Elm Street ⚠️
- **Clear to Close:** 1847 Oakwood Drive (closing in 5 days!)

### Team Performance
${MOCK_TEAM.slice(0, 3)
  .map(
    (m) =>
      `- **${m.full_name}** (${m.title}): ${MOCK_TASKS.filter((t) => t.assigned_to === m.id && t.status !== "completed").length} open tasks`
  )
  .join("\n")}

### 🤖 AI Assessment
Your pipeline is in moderate health. The primary concern is **923 Maple Court** which has the lowest health score at 45/100. With ${closingSoon.length} closing${closingSoon.length !== 1 ? "s" : ""} approaching in the next 2 weeks, I recommend prioritizing document collection and task completion for those deals.`,
    };
  }

  // CHECKLIST
  if (msg.includes("checklist") || msg.includes("prepare") || msg.includes("closing prep")) {
    return {
      content: `## ✅ Closing Checklist Generator

### Standard Transaction Closing Checklist

**Pre-Closing (2 weeks out)**
- [ ] All contingencies removed or waived
- [ ] Final loan approval received from lender
- [ ] Title search complete — no liens or issues
- [ ] Homeowner's insurance binder obtained
- [ ] HOA documents reviewed and approved
- [ ] Inspection repairs verified or credited

**Pre-Closing (1 week out)**
- [ ] Closing disclosure reviewed by all parties
- [ ] Final walk-through scheduled
- [ ] Wire transfer instructions verified
- [ ] All signatures on purchase agreement complete
- [ ] Buyer funds confirmed for closing

**Closing Day**
- [ ] Final walk-through completed
- [ ] All closing documents signed
- [ ] Funds wired and confirmed received
- [ ] Keys exchanged
- [ ] Deed recorded with county

**Post-Closing**
- [ ] All parties receive executed documents
- [ ] Commission disbursement processed
- [ ] File archived in CloseTrack
- [ ] Client follow-up scheduled (30-day check-in)

---
*I've generated this checklist based on standard real estate transaction requirements. Want me to create a deal-specific checklist for any active deal?*`,
      toolCalls: [
        { tool: "generateChecklist", result: { template: "standard_closing", items: 20, status: "generated" } },
      ],
    };
  }

  // ASSIGN / REASSIGN
  if (msg.includes("assign") || msg.includes("reassign") || msg.includes("workload") || msg.includes("team")) {
    return {
      content: `## 👥 Team Workload Analysis

### Current Workload Distribution
${MOCK_TEAM.map((m) => {
  const tasks = MOCK_TASKS.filter((t) => t.assigned_to === m.id && t.status !== "completed");
  const deals = activeDeals.filter((d) => d.assigned_to === m.id);
  const bar = "█".repeat(Math.min(tasks.length, 10)) + "░".repeat(Math.max(0, 10 - tasks.length));
  return `**${m.full_name}** (${m.title})
${bar} ${tasks.length} tasks | ${deals.length} deals`;
}).join("\n\n")}

### 🔴 Overloaded Team Members
- **Sarah Mitchell** — Managing 2 critical deals (1847 Oakwood + 923 Maple Court) simultaneously

### ✅ Recommended Reassignments
1. Move 923 Maple Court task "Review title report" from Sarah → James Chen (has capacity)
2. Assign HOA document follow-up to Priya Patel (already on this deal)
3. Rachel Torres can take on 3340 Elm Street oversight as backup coordinator

### ⚡ Quick Actions
- I can automatically reassign overdue tasks to available team members
- Want me to generate a balanced workload plan for this week?

*Note: Reassignments require confirmation before execution.*`,
      toolCalls: [
        {
          tool: "workloadAnalysis",
          result: {
            overloaded: ["user-1"],
            balanced: ["user-3", "user-4"],
            recommended_reassignments: 3,
          },
        },
      ],
    };
  }

  // DOCUMENT / MISSING DOCS
  if (msg.includes("document") || msg.includes("doc") || msg.includes("missing") || msg.includes("file")) {
    return {
      content: `## 📄 Document Status Report

### Missing Documents by Deal
- **923 Maple Court** — 5 documents missing ⚠️
  - Inspection report (critical)
  - Seller disclosure form
  - HOA financial statements
  - Survey report
  - Insurance binder

- **4520 Riverside Blvd** — 3 documents missing ⚠️
  - HOA meeting minutes
  - Condo questionnaire
  - Lender approval letter

- **3340 Elm Street** — 4 documents missing ⚠️
  - Title commitment
  - Survey
  - Repair receipts
  - Final loan approval

### 📊 Document Collection Rate
- 1847 Oakwood Drive: 14/14 ✅ Complete
- 7801 Summit Ridge Rd: 7/9 (78%)
- 215 Harbor View Lane: 3/8 (38%) — early stage

### 💡 AI Document Actions
I can help you:
- **Auto-send document request emails** to buyers and sellers
- **Track document receipt** and send reminders
- **Analyze uploaded documents** for key terms and risks
- **Generate document checklists** specific to each deal type

Would you like me to send document request reminders for the missing items above?`,
    };
  }

  // CREATE TASK
  if (msg.includes("create task") || msg.includes("add task") || msg.includes("new task")) {
    return {
      content: `## ✅ Task Created

I've created a new task based on your request:

**Task:** Follow up on pending items
**Deal:** 4520 Riverside Blvd
**Assigned to:** Priya Patel
**Priority:** High
**Due date:** Tomorrow
**Status:** Pending

### ✨ Task Details
- Linked to deal: 4520 Riverside Blvd (Denver, CO)
- Notifications sent to: Priya Patel
- Deadline reminder set for: 24 hours before due

*Note: In live mode with Supabase connected, this task would be saved to the database and Priya would receive an in-app notification.*

Would you like to create additional tasks or set up an automated workflow for this deal?`,
      toolCalls: [
        {
          tool: "createTask",
          result: { id: "task-new-1", status: "created", assigned_to: "Priya Patel", deal: "4520 Riverside Blvd" },
        },
      ],
    };
  }

  // MANAGE / AUTONOMOUS / LEAVE
  if (msg.includes("manage everything") || msg.includes("going on leave") || msg.includes("on vacation") || msg.includes("autonomous")) {
    return {
      content: `## 🤖 Autonomous Operations Mode

I'll take over operational monitoring while you're away. Here's my action plan:

### Immediate Actions (Next 2 hours)
- [ ] **Analyze all 6 active deals** — health score assessment complete
- [ ] **Identify urgent items** — 923 Maple Court and 4520 Riverside Blvd flagged
- [ ] **Reassign 3 overdue tasks** — moving to available team members

### Daily Monitoring (While you're away)
- **09:00 AM** — Morning briefing sent to team Slack
- **12:00 PM** — Document collection status check
- **04:00 PM** — Deadline alerts and escalations
- **06:00 PM** — Daily summary report generated

### Escalation Protocol
🔴 **Critical** (immediate escalation to Rachel Torres):
- Any deal health drops below 40
- A closing-day issue emerges
- A client goes 3+ days without response

🟡 **Warning** (escalate if unresolved in 24h):
- Missing documents with <7 days to closing
- Unsigned contracts with <5 days to closing

### Team Notifications Sent
- Sarah Mitchell: Taking point on 1847 Oakwood Drive closing (5 days)
- Priya Patel: Priority escalation on 4520 Riverside Blvd docs
- James Chen: Backup coverage for 923 Maple Court

### 📊 Daily Summary Reports
I'll email you a daily digest at 7:00 PM with pipeline status, completed actions, and any issues requiring your attention.

*All destructive actions (reassignments, deadline changes) require confirmation from Rachel Torres.*`,
    };
  }

  // DEFAULT / FALLBACK
  return {
    content: `## 👋 How can I help?

I'm CloseTrack AI, your intelligent operations assistant. I have full visibility into your real estate transaction pipeline.

### 📊 Current Status
- **${activeDeals.length} active deals** | **$${activeDeals.reduce((s, d) => s + d.purchase_price, 0).toLocaleString()} pipeline value**
- **${atRiskDeals.length} deals at risk** | **${overdueTasks.length} overdue tasks**
- **${closingSoon.length} closing${closingSoon.length !== 1 ? "s" : ""}** in the next 14 days

### 💡 Things I can help with

**Ask me questions:**
- "What deals are at risk?"
- "Show me overdue tasks"
- "Which closings are this week?"
- "Summarize my pipeline"

**Take actions:**
- "Draft a follow-up email for [deal]"
- "Generate a closing checklist"
- "Analyze team workload"
- "Create a task for [deal]"

**Autonomous ops:**
- "Give me a daily briefing"
- "Prepare [address] for closing"
- "Manage everything while I'm on leave"

What would you like to tackle first?`,
  };
}
