"use client";

import { motion } from "framer-motion";
import {
  Clock,
  ShieldAlert,
  FileSearch,
  PenLine,
  UserX,
  ChevronRight,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "alert";
  lastAction: string;
  icon: React.ReactNode;
}

const AGENTS: Agent[] = [
  {
    id: "deadline",
    name: "Deadline Monitor",
    status: "active",
    lastAction: "Watching 3 deals · Now",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    id: "risk",
    name: "Risk Scanner",
    status: "alert",
    lastAction: "2 risks found · 2m ago",
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  {
    id: "docs",
    name: "Document Tracker",
    status: "alert",
    lastAction: "2 missing docs · 5m ago",
    icon: <FileSearch className="w-3.5 h-3.5" />,
  },
  {
    id: "sigs",
    name: "Signature Tracker",
    status: "active",
    lastAction: "2 unsigned · 8m ago",
    icon: <PenLine className="w-3.5 h-3.5" />,
  },
  {
    id: "inactivity",
    name: "Client Inactivity",
    status: "alert",
    lastAction: "1 client · 5 days silent",
    icon: <UserX className="w-3.5 h-3.5" />,
  },
];

const statusColors = {
  active: "bg-emerald-400",
  idle: "bg-slate-500",
  alert: "bg-amber-400",
};

export function BackgroundAgents() {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
        Background Agents
      </p>
      {AGENTS.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-2 group cursor-pointer transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded bg-surface-2 border border-border flex items-center justify-center text-muted-foreground">
              {agent.icon}
            </div>
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${statusColors[agent.status]} ${
                agent.status !== "idle" ? "animate-pulse" : ""
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">{agent.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{agent.lastAction}</p>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}
