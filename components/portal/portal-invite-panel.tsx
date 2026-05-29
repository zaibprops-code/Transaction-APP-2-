"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  CheckCircle,
  Send,
  ExternalLink,
  MessageSquare,
  FileText,
  CheckSquare,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import type { PortalStatus } from "@/components/portal/portal-status-badge";
import { cn } from "@/lib/utils";

interface PortalInvitePanelProps {
  clientName: string;
  clientEmail: string;
  dealId: string;
  dealAddress: string;
  status: PortalStatus;
  stats: {
    unreadMessages: number;
    pendingTasks: number;
    pendingDocs: number;
  };
  lastActivity?: string;
  portalToken?: string;
}

const PORTAL_TOKEN = "demo-token-2024";

export function PortalInvitePanel({
  clientName,
  clientEmail,
  dealId,
  dealAddress,
  status,
  stats,
  lastActivity,
  portalToken = PORTAL_TOKEN,
}: PortalInvitePanelProps) {
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(
    status === "invite_sent" || status === "waiting_for_client" || status === "client_active"
  );

  const portalUrl = `/portal/${portalToken}`;

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + portalUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => setInviteSent(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface p-5 space-y-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{clientName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{clientEmail}</p>
        </div>
        <PortalStatusBadge status={status} />
      </div>

      {/* Last activity */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        {lastActivity ?? "Never visited"}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageSquare, value: stats.unreadMessages, label: "Messages", color: "text-teal-400" },
          { icon: CheckSquare, value: stats.pendingTasks, label: "Tasks", color: "text-amber-400" },
          { icon: FileText, value: stats.pendingDocs, label: "Docs", color: "text-indigo-400" },
        ].map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-surface-2 border border-border"
          >
            <Icon className={cn("w-3.5 h-3.5", color)} />
            <span className="text-base font-bold text-foreground leading-none">{value}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="gap-1.5 text-xs h-8 flex-1"
          variant={inviteSent ? "outline" : "default"}
          onClick={handleSendInvite}
        >
          <Send className="w-3 h-3" />
          {inviteSent ? "Resend Invite" : "Send Invite"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs h-8"
          onClick={copyLink}
        >
          {copied ? (
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Link href={portalUrl} target="_blank">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8">
            <ExternalLink className="w-3 h-3" />
            Preview
          </Button>
        </Link>
      </div>

      {/* Admin link */}
      <div className="pt-1 border-t border-border">
        <Link
          href={`/clients/${dealId}/portal`}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          Open Portal Admin
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
