"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PortalStatus =
  | "enabled"
  | "invite_sent"
  | "invite_pending"
  | "waiting_for_client"
  | "client_active"
  | "disabled";

const STATUS_CONFIG: Record<
  PortalStatus,
  { label: string; dot: string; pulse: boolean; text: string; bg: string; border: string }
> = {
  client_active: {
    label: "Client Active",
    dot: "bg-emerald-400",
    pulse: true,
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  enabled: {
    label: "Portal Active",
    dot: "bg-emerald-400",
    pulse: false,
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  waiting_for_client: {
    label: "Awaiting Client",
    dot: "bg-amber-400",
    pulse: true,
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  invite_sent: {
    label: "Invite Sent",
    dot: "bg-amber-400",
    pulse: false,
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  invite_pending: {
    label: "Invite Pending",
    dot: "bg-muted-foreground/50",
    pulse: false,
    text: "text-muted-foreground",
    bg: "bg-surface-2",
    border: "border-border",
  },
  disabled: {
    label: "Portal Disabled",
    dot: "bg-muted-foreground/40",
    pulse: false,
    text: "text-muted-foreground",
    bg: "bg-surface-2",
    border: "border-border",
  },
};

interface PortalStatusBadgeProps {
  status: PortalStatus;
  compact?: boolean;
}

export function PortalStatusBadge({ status, compact = false }: PortalStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border text-[10px] font-semibold",
        cfg.bg,
        cfg.border,
        cfg.text,
        compact ? "px-1.5 py-0.5" : "px-2.5 py-1"
      )}
      title={compact ? cfg.label : undefined}
    >
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", cfg.dot)} />
        {cfg.pulse && (
          <motion.span
            className={cn("absolute inline-flex rounded-full h-1.5 w-1.5", cfg.dot, "opacity-75")}
            animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </span>
      {!compact && cfg.label}
    </div>
  );
}
