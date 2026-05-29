"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Brain,
  FileSearch,
  AlertTriangle,
  ListChecks,
  Mail,
  TrendingUp,
  Download,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_AI_MESSAGES, MOCK_AI_INSIGHTS } from "@/lib/mock-data";
import { AI_QUICK_PROMPTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types";

const aiTools = [
  { id: "analysis", icon: Brain, label: "Deal Analysis", desc: "Analyze all active deals" },
  { id: "contract", icon: FileSearch, label: "Contract Intelligence", desc: "Extract key terms" },
  { id: "risk", icon: AlertTriangle, label: "Risk Scanner", desc: "Find deal risks" },
  { id: "tasks", icon: ListChecks, label: "Task Generator", desc: "AI-generated checklists" },
  { id: "email", icon: Mail, label: "Email Drafting", desc: "Professional emails" },
  { id: "insights", icon: TrendingUp, label: "Market Insights", desc: "Portfolio trends" },
];

function Message({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "justify-end")}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-strata flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-indigo-500/20 text-foreground rounded-tr-sm"
            : "bg-surface-2 text-foreground border border-border rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        {message.tools_used && message.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.tools_used.map(tool => (
              <Badge key={tool} variant="purple" className="text-[9px]">
                {tool}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AIAssistantContent() {
  const [messages, setMessages] = useState<AIMessage[]>(MOCK_AI_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 1500));

    const aiResponse: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: `I'm analyzing your request: "${content}"\n\nBased on your current portfolio of 6 active deals, here's what I found:\n\n• **1847 Oakwood Drive** is your healthiest deal at 88/100 — closing in 5 days\n• **923 Maple Court** needs immediate attention (health: 45) — inspection deadline imminent\n• **4520 Riverside Blvd** has 3 missing documents with 18 days to close\n\nWould you like me to take action on any of these?`,
      timestamp: new Date().toISOString(),
      tools_used: ["deal_analysis", "risk_scoring"],
    };

    setMessages(prev => [...prev, aiResponse]);
    setLoading(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar: Tools + Insights */}
      <div className="hidden lg:flex flex-col w-64 border-r border-border bg-surface/50 flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-foreground">AI Tools</h2>
            <Badge variant="purple" className="text-[10px]">GPT-4o</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-1 mb-6">
            {aiTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSend(tool.desc)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-2 group-hover:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{tool.label}</p>
                    <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold px-1 mb-2">
              Active Insights
            </p>
            <div className="space-y-2">
              {MOCK_AI_INSIGHTS.slice(0, 3).map(insight => (
                <div
                  key={insight.id}
                  className={cn(
                    "rounded-lg p-2.5 border text-xs cursor-pointer hover:opacity-80 transition-opacity",
                    insight.severity === "critical" && "border-red-500/20 bg-red-500/5 text-red-400",
                    insight.severity === "high" && "border-amber-500/20 bg-amber-500/5 text-amber-400",
                    insight.severity === "medium" && "border-indigo-500/20 bg-indigo-500/5 text-indigo-400"
                  )}
                >
                  <p className="font-medium line-clamp-2">{insight.title}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-strata flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Strata AI</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">Context loaded · 6 deals · 28 tasks</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            <AnimatePresence>
              {messages.map(msg => (
                <Message key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-strata flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                </div>
                <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        {/* Quick prompts */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-border/50">
          {AI_QUICK_PROMPTS.slice(0, 5).map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 text-[10px] bg-surface-2 hover:bg-surface border border-border hover:border-indigo-500/30 text-muted-foreground hover:text-foreground rounded-lg px-2.5 py-1.5 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-end gap-3 bg-surface-2 border border-border rounded-xl p-3 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about your deals, documents, or workflows..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-32 overflow-y-auto"
              style={{ height: "auto" }}
            />
            <Button
              size="icon-sm"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
