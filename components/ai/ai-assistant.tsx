"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  BarChart3,
  FileText,
  Mail,
  ListTodo,
  Zap,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  AlertTriangle,
  Wrench,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAIStore } from "@/stores/ai-store";
import type { AIMessage } from "@/stores/ai-store";
import { BackgroundAgents } from "@/components/ai/background-agents";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Daily Briefing", icon: <Sparkles className="w-3.5 h-3.5" />, prompt: "Give me my daily briefing" },
  { label: "At-Risk Deals", icon: <AlertTriangle className="w-3.5 h-3.5" />, prompt: "Which deals are at risk?" },
  { label: "Overdue Tasks", icon: <ListTodo className="w-3.5 h-3.5" />, prompt: "Show me overdue tasks" },
  { label: "Draft Email", icon: <Mail className="w-3.5 h-3.5" />, prompt: "Draft a follow-up email for the 4520 Riverside Blvd deal" },
  { label: "Risk Report", icon: <BarChart3 className="w-3.5 h-3.5" />, prompt: "Generate a risk analysis report" },
  { label: "Closing Prep", icon: <FileText className="w-3.5 h-3.5" />, prompt: "Generate a closing checklist for 1847 Oakwood Drive" },
];

const SLASH_COMMANDS = [
  { cmd: "/briefing", desc: "Daily operational briefing" },
  { cmd: "/risks", desc: "Analyze at-risk deals" },
  { cmd: "/tasks", desc: "Show all overdue tasks" },
  { cmd: "/email", desc: "Draft follow-up email" },
  { cmd: "/checklist", desc: "Generate closing checklist" },
  { cmd: "/analyze", desc: "Analyze current deal" },
  { cmd: "/report", desc: "Generate analytics report" },
  { cmd: "/workload", desc: "Team workload analysis" },
];

const PROMPT_CHIPS = [
  "What needs attention?",
  "At-risk deals",
  "Draft follow-up",
  "Today's tasks",
  "Missing docs",
  "Team workload",
];

function ToolCallCard({ toolName, result }: { toolName: string; result: unknown }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-xs overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-500/10 transition-colors"
      >
        <Wrench className="w-3 h-3 text-indigo-400 flex-shrink-0" />
        <span className="text-indigo-300 font-medium flex-1 text-left">Tool: {toolName}</span>
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre className="px-3 py-2 text-[10px] text-muted-foreground overflow-auto max-h-32 border-t border-indigo-500/20">
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-2 px-1 rounded text-indigo-300 text-[10px]">$1</code>');
}

function MarkdownContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("## "))
          return <h2 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1 first:mt-0">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="text-xs font-semibold text-foreground/90 mt-2 mb-0.5">{line.slice(4)}</h3>;
        if (line.startsWith("- ") || line.startsWith("• ")) {
          const text = line.slice(2);
          return (
            <div key={i} className="flex gap-1.5 text-xs text-foreground/90">
              <span className="text-indigo-400 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
            </div>
          );
        }
        if (line.match(/^- \[[ x]\]/)) {
          const checked = line.includes("[x]");
          const text = line.replace(/^- \[[ x]\] ?/, "");
          return (
            <div key={i} className="flex gap-1.5 text-xs text-foreground/90">
              <span className={checked ? "text-emerald-400" : "text-muted-foreground"}>{checked ? "✅" : "☐"}</span>
              <span>{text}</span>
            </div>
          );
        }
        if (line.startsWith("|"))
          return <div key={i} className="font-mono text-[10px] text-muted-foreground overflow-auto">{line}</div>;
        if (line === "---") return <hr key={i} className="border-border my-2" />;
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-xs text-foreground/90" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
      {isStreaming && <span className="inline-block w-0.5 h-3.5 bg-indigo-400 animate-pulse ml-0.5 align-middle" />}
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";
  if (message.role === "tool") {
    return <ToolCallCard toolName={message.toolName ?? "tool"} result={message.toolResult} />;
  }
  if (message.role === "system") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200">{message.content}</p>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isUser ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-violet-500/20 border border-violet-500/30")}>
        {isUser ? <User className="w-3.5 h-3.5 text-indigo-400" /> : <Bot className="w-3.5 h-3.5 text-violet-400" />}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "flex justify-end")}>
        <div className={cn("rounded-xl px-3.5 py-2.5 max-w-full",
          isUser ? "bg-indigo-600/20 border border-indigo-500/20 rounded-tr-sm" : "bg-surface border border-border rounded-tl-sm")}>
          <MarkdownContent content={message.content} isStreaming={message.isStreaming} />
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-violet-500/20 border border-violet-500/30 flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-violet-400" />
      </div>
      <div className="bg-surface border border-border rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </div>
  );
}

export function AIAssistant() {
  const pathname = usePathname();
  const { messages, isThinking, addMessage, updateMessage, setThinking, setContext, clearHistory } = useAIStore();
  const [input, setInput] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setContext({ pathname }); }, [pathname, setContext]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isThinking) return;
    setInput("");
    setShowSlash(false);

    addMessage({ role: "user", content: content.trim() });
    setThinking(true);
    const assistantId = addMessage({ role: "assistant", content: "", isStreaming: true });

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const chatMessages = [
        ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
        { role: "user", content: content.trim() },
      ].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages, pathname }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string; content?: string; tool?: string; result?: unknown;
            };
            if (event.type === "token" && event.content) {
              accumulated += event.content;
              updateMessage(assistantId, { content: accumulated });
            } else if (event.type === "tool_call" && event.tool) {
              addMessage({ role: "tool", content: "", toolName: event.tool, toolResult: event.result });
            } else if (event.type === "done") {
              updateMessage(assistantId, { isStreaming: false });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      updateMessage(assistantId, { content: "Sorry, I encountered an error. Please try again.", isStreaming: false });
    } finally {
      setThinking(false);
      updateMessage(assistantId, { isStreaming: false });
    }
  }, [messages, isThinking, pathname, addMessage, updateMessage, setThinking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    if (e.key === "Escape") setShowSlash(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith("/")) { setShowSlash(true); setSlashFilter(val.slice(1).toLowerCase()); }
    else setShowSlash(false);
  };

  const filteredCommands = SLASH_COMMANDS.filter(
    (c) => !slashFilter || c.cmd.includes(slashFilter) || c.desc.toLowerCase().includes(slashFilter)
  );

  const contextLabel =
    pathname === "/dashboard" ? "Dashboard"
    : pathname.startsWith("/deals/") && pathname.length > 7 ? "Deal Workspace"
    : pathname === "/deals" ? "Deals Pipeline"
    : pathname === "/tasks" ? "Task Manager"
    : pathname === "/documents" ? "Document Center"
    : "CloseTrack";

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden lg:flex w-44 flex-col border-r border-border p-3 gap-4 flex-shrink-0 overflow-y-auto">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
          <div className="space-y-0.5">
            {QUICK_ACTIONS.map((action) => (
              <button key={action.label} onClick={() => sendMessage(action.prompt)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors text-left">
                <span className="text-indigo-400 flex-shrink-0">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <BackgroundAgents />
        <button onClick={clearHistory}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors mt-auto">
          <Trash2 className="w-3.5 h-3.5" /> Clear history
        </button>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Context bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface/50 flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-muted-foreground">Context:</span>
          <span className="text-xs font-medium text-indigo-300">{contextLabel}</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">AI Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">CloseTrack AI</p>
                  <p className="text-xs text-muted-foreground mt-1">Your AI Operations Assistant</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  {QUICK_ACTIONS.slice(0, 4).map((a) => (
                    <button key={a.label} onClick={() => sendMessage(a.prompt)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-center">
                      <span className="text-indigo-400">{a.icon}</span>
                      <span className="text-[11px] text-muted-foreground">{a.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            </AnimatePresence>
            {isThinking && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TypingIndicator /></motion.div>}
          </div>
        </div>

        {/* Prompt chips */}
        {messages.length === 0 && (
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {PROMPT_CHIPS.map((chip) => (
              <button key={chip} onClick={() => sendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-muted-foreground hover:text-foreground hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Slash command dropdown */}
        <AnimatePresence>
          {showSlash && filteredCommands.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="mx-4 mb-1 rounded-lg border border-border bg-surface-2 shadow-lg overflow-hidden">
              {filteredCommands.map((cmd) => (
                <button key={cmd.cmd}
                  onClick={() => { setInput(cmd.cmd + " "); setShowSlash(false); inputRef.current?.focus(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface text-left transition-colors">
                  <code className="text-indigo-400 text-xs font-mono">{cmd.cmd}</code>
                  <span className="text-xs text-muted-foreground">{cmd.desc}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex items-end gap-2 bg-surface rounded-xl border border-border focus-within:border-indigo-500/50 transition-colors p-2">
            <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
              placeholder='Ask anything… or type "/" for commands' rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-h-[24px] max-h-32 leading-6"
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }} />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isThinking}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-all shadow-glow-sm disabled:shadow-none">
              {isThinking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Enter to send · Shift+Enter for newline · / for commands
          </p>
        </div>
      </div>
    </div>
  );
}
