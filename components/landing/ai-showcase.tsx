"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  FileSearch,
  AlertTriangle,
  ListChecks,
  Mail,
  ChevronRight,
  Sparkles,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const aiCapabilities = [
  {
    id: "analysis",
    icon: Brain,
    title: "Deal Analysis",
    description: "Real-time health scoring across your entire portfolio with AI-computed risk factors.",
    preview: "🔴 **923 Maple Court** — Health Score: 45\nInspection deadline in 2 days, 5 docs missing.\n\n🟡 **4520 Riverside Blvd** — Health Score: 62\nHOA financials outstanding, closing in 18 days.",
  },
  {
    id: "contract",
    icon: FileSearch,
    title: "Contract Intelligence",
    description: "AI reads and extracts key terms, deadlines, contingencies, and risk clauses automatically.",
    preview: "📋 **Contract Analysis Complete**\n\n• Closing Date: Dec 15, 2024\n• Inspection Period: 10 days (expires Dec 5)\n• Financing Contingency: 21 days\n• ⚠️ Non-standard liability clause detected in §8.2",
  },
  {
    id: "risk",
    icon: AlertTriangle,
    title: "Risk Detection",
    description: "Proactive alerts for missed deadlines, contract deviations, and compliance issues.",
    preview: "⚠️ **3 Risk Alerts Detected**\n\n1. CRITICAL: Inspection contingency expires in 2 days\n2. HIGH: Lender commitment letter 5 days overdue\n3. MEDIUM: Payoff statement not yet requested",
  },
  {
    id: "tasks",
    icon: ListChecks,
    title: "Task Generation",
    description: "AI generates a complete transaction checklist from contract terms and deal specifics.",
    preview: "✅ **Generated 18 Tasks for 923 Maple Court**\n\n• Schedule home inspection (DUE: Dec 3)\n• Order title search (DUE: Dec 5)\n• Request HOA docs (DUE: Dec 7)\n• Verify lender commitment (DUE: Dec 10)\n+14 more tasks...",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email Drafting",
    description: "Draft professional follow-up emails, reminders, and client updates in seconds.",
    preview: "✉️ **Draft: Follow-up to Lender**\n\nSubject: Commitment Letter Request — 4520 Riverside Blvd\n\nHi [Loan Officer],\n\nI'm following up regarding the commitment letter for Michael Torres at 4520 Riverside Blvd, Denver CO 80202. Our closing is scheduled for Dec 15, and we need this letter by Dec 10...",
  },
];

const conversationMessages = [
  { role: "user", content: "What deals are closing this week?" },
  { role: "ai", content: "You have **1 deal closing this week**:\n\n**🏠 1847 Oakwood Drive** — Closing in **5 days** (Dec 5)\n• Buyer: David & Emily Park\n• Sale price: $875,000\n• Health Score: 88/100 ✅\n• 1 signature still needed from Emily Park\n\nWould you like me to send a reminder to Emily?" },
  { role: "user", content: "Yes, draft the reminder email" },
  { role: "ai", content: "Here's a draft:\n\n**Subject:** Signature Needed — 1847 Oakwood Drive Closing\n\nHi Emily,\n\nExcited to share that your closing is just 5 days away! We just need your signature on the Closing Disclosure to proceed.\n\n[Click here to sign →]\n\nThis takes less than 2 minutes. Let me know if you have any questions!\n\nBest,\nSarah Mitchell" },
];

export function AIShowcase() {
  const [activeCapability, setActiveCapability] = useState("analysis");
  const [chatInput, setChatInput] = useState("");
  const active = aiCapabilities.find(c => c.id === activeCapability)!;

  return (
    <section id="ai" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="purple" className="mb-4 gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI-Native Intelligence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet your AI transaction{" "}
            <span className="text-gradient">co-pilot.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CloseTrack&apos;s AI isn&apos;t a chatbot tacked on. It&apos;s embedded in every workflow,
            understanding your deals, your team, and your clients.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Capabilities */}
          <div className="space-y-3">
            {aiCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              const isActive = cap.id === activeCapability;
              return (
                <motion.button
                  key={cap.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => setActiveCapability(cap.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/30 shadow-glow-sm"
                      : "bg-surface border-border hover:bg-surface-2 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isActive ? "bg-indigo-500/20" : "bg-surface-2"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {cap.title}
                        </span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            <div className="flex items-center gap-2 pt-2 px-1">
              <Badge variant="secondary" className="text-[10px]">Powered by GPT-4o</Badge>
              <Badge variant="secondary" className="text-[10px]">Context-aware</Badge>
              <Badge variant="secondary" className="text-[10px]">Real-time</Badge>
            </div>
          </div>

          {/* Right: Chat interface + preview */}
          <div className="space-y-4">
            {/* AI Preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCapability}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-indigo-500/20 rounded-xl p-4 bg-gradient-to-br from-indigo-500/5 to-violet-500/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-closetrack flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-indigo-400">CloseTrack AI · {active.title}</span>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {active.preview}
                </pre>
              </motion.div>
            </AnimatePresence>

            {/* Chat interface */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">CloseTrack AI — Live context loaded</span>
              </div>

              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {conversationMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-xl px-3 py-2 text-xs max-w-[85%] whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-indigo-500/20 text-foreground"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 bg-surface-2 rounded-lg border border-border px-3 py-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask anything about your deals..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
