"use client";

import { use } from "react";

import { useState, useRef, useEffect } from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { Send, Paperclip, Sparkles, ChevronLeft } from "lucide-react";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import { PortalNav } from "@/components/portal/portal-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortalMessage } from "@/types/portal";

const AI_SUMMARY = "This thread covers: (1) initial portal welcome and inspection scheduling, (2) appraisal appointment details, (3) repair request after inspection, and (4) two pending action reminders — seller disclosure signature and homeowner's insurance upload.";

export default function MessagesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const portal = MOCK_CLIENT_PORTAL;
  const daysToClose = differenceInDays(parseISO(portal.closingDate), new Date());
  const [messages, setMessages] = useState<PortalMessage[]>(portal.messages);
  const [input, setInput] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: PortalMessage = {
      id: `msg-${Date.now()}`,
      sender: "client",
      senderName: "You",
      senderInitials: portal.clientInitials,
      content: input,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-auto-${Date.now()}`,
          sender: "team",
          senderName: "Sarah Mitchell",
          senderInitials: "SM",
          content: "Thanks for your message! I'll review this and get back to you shortly. You can also check your tasks and documents tabs for the latest updates on your transaction.",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PortalNav
        token={token}
        clientName={portal.clientName}
        clientInitials={portal.clientInitials}
        propertyAddress={portal.propertyAddress}
        daysToClose={daysToClose}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full px-0 sm:px-6 py-0 sm:py-6 flex flex-col" style={{ minHeight: 0 }}>
        <div className="flex-1 flex rounded-none sm:rounded-2xl border-0 sm:border border-border bg-surface overflow-hidden" style={{ minHeight: 0 }}>
          {/* Sidebar — conversation list */}
          <div className={cn(
            "w-full sm:w-72 border-r border-border flex-shrink-0 flex flex-col",
            mobileView === "thread" ? "hidden sm:flex" : "flex"
          )}>
            <div className="px-4 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Messages</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{portal.unreadMessages} unread</p>
            </div>

            {/* One conversation thread shown */}
            <button
              onClick={() => setMobileView("thread")}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors bg-indigo-500/5 border-l-2 border-indigo-400"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="text-xs bg-indigo-500/20 text-indigo-300">SM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground truncate">Your Transaction Team</p>
                <p className="text-xs text-muted-foreground truncate">Sarah M., James T., Derek V...</p>
              </div>
              {portal.unreadMessages > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {portal.unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Thread panel */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0",
            mobileView === "list" ? "hidden sm:flex" : "flex"
          )}>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
              <button
                onClick={() => setMobileView("list")}
                className="sm:hidden p-1 rounded-lg hover:bg-surface-2 text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex -space-x-2">
                {["SM", "JT", "DV"].map((init) => (
                  <Avatar key={init} className="w-7 h-7 ring-2 ring-surface">
                    <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-300">{init}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Your Transaction Team</p>
                <p className="text-[11px] text-muted-foreground">Coordinator, Agent, Loan Officer</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 flex-shrink-0 hidden sm:flex"
                onClick={() => setShowSummary(!showSummary)}
              >
                <Sparkles className="w-3 h-3" />
                AI Summary
              </Button>
            </div>

            {/* AI summary banner */}
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-3 flex items-start gap-2.5 bg-indigo-500/8 border border-indigo-500/15 rounded-xl px-3 py-2.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">{AI_SUMMARY}</p>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => {
                const isClient = msg.sender === "client";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={cn("flex gap-2.5", isClient ? "flex-row-reverse" : "flex-row")}
                  >
                    {!isClient && (
                      <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                        <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-300">{msg.senderInitials}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[75%] space-y-1", isClient && "items-end flex flex-col")}>
                      {!isClient && (
                        <p className="text-[10px] text-muted-foreground px-1">{msg.senderName}</p>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isClient
                          ? "bg-indigo-500 text-white rounded-br-sm"
                          : "bg-surface-2 border border-border text-foreground rounded-bl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 px-1">
                        {format(parseISO(msg.timestamp), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {typing && (
                <div className="flex gap-2.5">
                  <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                    <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-300">SM</AvatarFallback>
                  </Avatar>
                  <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 0.2, 0.4].map((delay) => (
                      <motion.span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 px-4 py-3 border-t border-border flex-shrink-0">
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Message your team..."
                className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={sendMessage}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
