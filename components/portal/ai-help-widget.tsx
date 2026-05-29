"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_PROMPTS = [
  "What happens next?",
  "What documents are pending?",
  "When is my closing date?",
  "What is earnest money?",
  "What do I need to do this week?",
];

const CANNED_RESPONSES: Record<string, string> = {
  "What happens next?": "Your next milestone is the **Appraisal**. The lender's appraiser visited on June 18th — we're waiting on the report. Once received, your file moves to **Financing Approval** which triggers underwriting review. Your coordinator Sarah will notify you immediately when the appraisal comes in.",
  "What documents are pending?": "You have **2 documents requiring action**: \n\n1. **Seller Disclosure Statement** — needs your signature (overdue)\n2. **Proof of Homeowner's Insurance** — needs to be uploaded\n\nPlease complete these as soon as possible to keep your transaction on track.",
  "When is my closing date?": "Your closing is scheduled for **July 15, 2025**. That's approximately 29 days away. Your coordinator will send closing instructions and wire transfer details approximately 3 days before closing.",
  "What is earnest money?": "Earnest money is a good-faith deposit you made when your offer was accepted. It shows the seller you're serious. Your deposit of is being held in escrow and will be applied toward your down payment at closing. If the deal falls through due to a contingency, it's typically refundable.",
  "What do I need to do this week?": "This week you should focus on: \n\n1. **Sign the Seller Disclosure** (overdue — do this today)\n2. **Upload Homeowner's Insurance** (needed for final loan approval)\n3. **Review the Inspection Report** — let James know if you want to request repairs\n\nCompleting these keeps your July 15 closing on schedule.",
};

export function AIHelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! I'm your CloseTrack AI assistant. I can answer questions about your transaction, explain next steps, and help you understand your documents. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, text };
    const response = CANNED_RESPONSES[text] || "Great question! Your coordinator Sarah Mitchell can answer this in detail. You can message her directly in the Messages tab — she typically responds within a few hours during business hours.";
    setMessages((prev) => [...prev, userMsg, { role: "assistant", text: response }]);
    setInput("");
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { type: "spring", stiffness: 400, damping: 25 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-shadow"
            aria-label="Open AI help"
          >
            <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-background" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">Transaction Assistant</p>
                <p className="text-[10px] text-muted-foreground">Ask anything about your purchase</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-sm"
                      : "bg-surface-2 text-foreground rounded-bl-sm border border-border"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-[11px] bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:border-indigo-500/40 rounded-full px-3 py-1 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 px-4 py-3 border-t border-border flex-shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask a question..."
                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => sendMessage(input)}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
