"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, Clock, Eye, XCircle, AlertTriangle,
  Bell, Ban, Copy, ExternalLink, FileText, User, Shield, Loader2
} from "lucide-react";
import type { SignatureRequest, SignatureParticipant } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface RequestDetailsModalProps {
  request: SignatureRequest | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

function statusConfig(status: string) {
  switch (status) {
    case "completed": return { label: "Completed", variant: "success" as const, icon: CheckCircle, color: "text-emerald-400" };
    case "partially_signed": return { label: "Partially Signed", variant: "info" as const, icon: Clock, color: "text-blue-400" };
    case "sent": return { label: "Sent", variant: "info" as const, icon: Eye, color: "text-blue-400" };
    case "viewed": return { label: "Viewed", variant: "warning" as const, icon: Eye, color: "text-amber-400" };
    case "pending": return { label: "Draft", variant: "warning" as const, icon: Clock, color: "text-amber-400" };
    case "declined": return { label: "Declined", variant: "destructive" as const, icon: XCircle, color: "text-red-400" };
    case "expired": return { label: "Expired", variant: "destructive" as const, icon: AlertTriangle, color: "text-red-400" };
    case "cancelled": return { label: "Cancelled", variant: "destructive" as const, icon: Ban, color: "text-red-400" };
    default: return { label: status, variant: "warning" as const, icon: Clock, color: "text-amber-400" };
  }
}

function participantStatusConfig(status: string) {
  switch (status) {
    case "signed": return { label: "Signed", color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle };
    case "viewed": return { label: "Viewed", color: "text-blue-400 bg-blue-400/10", icon: Eye };
    case "sent": return { label: "Sent", color: "text-indigo-400 bg-indigo-400/10", icon: Bell };
    case "declined": return { label: "Declined", color: "text-red-400 bg-red-400/10", icon: XCircle };
    default: return { label: "Pending", color: "text-amber-400 bg-amber-400/10", icon: Clock };
  }
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    request_created: "Request created",
    request_sent: "Invites sent",
    document_viewed: "Document viewed",
    document_signed: "Document signed",
    reminder_sent: "Reminder sent",
    request_completed: "Request completed",
    request_cancelled: "Request cancelled",
  };
  return map[action] ?? action.replace(/_/g, " ");
}

export function RequestDetailsModal({ request, open, onClose, onUpdated }: RequestDetailsModalProps) {
  const [reminding, setReminding] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [sending, setSending] = useState(false);

  if (!request) return null;

  const sc = statusConfig(request.status);
  const StatusIcon = sc.icon;
  const participants: SignatureParticipant[] = request.participants ?? request.signers.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    request_id: request.id,
    role: "external" as const,
    signing_order: 0,
    status: s.status,
    signed_at: s.signed_at,
    ip_address: s.ip_address,
    created_at: request.created_at,
  }));
  const auditLogs = request.audit_logs ?? [];
  const isActive = !["completed", "cancelled", "expired", "declined"].includes(request.status);

  const handleRemind = async () => {
    setReminding(true);
    try {
      const res = await fetch(`/api/signatures/${request.id}/remind`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send reminders");
      const data = await res.json();
      toast.success(`${data.reminders_sent ?? "All"} reminders sent`);
      onUpdated();
    } catch {
      toast.error("Failed to send reminders");
    } finally {
      setReminding(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/signatures/${request.id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      toast.success("Request sent", { description: `${data.participants_notified} participant${data.participants_notified !== 1 ? "s" : ""} notified.` });
      onUpdated();
    } catch {
      toast.error("Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this signature request? Signers will no longer be able to sign.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/signatures/${request.id}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel");
      toast.success("Request cancelled");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  const signedCount = participants.filter(p => p.status === "signed").length;
  const progressPct = participants.length > 0 ? (signedCount / participants.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={open ? onClose : undefined}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-indigo-400" />
            {request.title || request.document_name}
          </DialogTitle>
        </DialogHeader>

        {/* Header info */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            {request.deal_address && (
              <p className="text-xs text-muted-foreground">{request.deal_address}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant={sc.variant} className="text-[10px]">
                <StatusIcon className="w-2.5 h-2.5 mr-1" />
                {sc.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {signedCount}/{participants.length} signed
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Expires {formatDate(request.expires_at, "MMM d, yyyy")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {request.status === "pending" && (
              <Button size="sm" onClick={handleSend} disabled={sending} className="h-7 text-xs">
                {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Send Invites
              </Button>
            )}
            {isActive && request.status !== "pending" && (
              <Button size="sm" variant="outline" onClick={handleRemind} disabled={reminding} className="h-7 text-xs gap-1">
                {reminding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                Remind All
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={cancelling} className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10">
                {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Signing Progress</span>
            <span className="text-foreground font-medium">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Participants ({participants.length})
          </p>
          <div className="space-y-2">
            {participants.map((p, i) => {
              const psc = participantStatusConfig(p.status);
              const PIcon = psc.icon;
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                  <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{p.role?.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                    {p.signed_at && (
                      <p className="text-xs text-emerald-400 mt-0.5">Signed {formatDate(p.signed_at, "MMM d, h:mm a")}</p>
                    )}
                    {p.viewed_at && !p.signed_at && (
                      <p className="text-xs text-blue-400 mt-0.5">Viewed {formatDate(p.viewed_at, "MMM d, h:mm a")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${psc.color}`}>
                      <PIcon className="w-3 h-3" />
                      {psc.label}
                    </span>
                    {isActive && p.status !== "signed" && (
                      <button
                        onClick={async () => {
                          await fetch(`/api/signatures/${request.id}/remind`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ participant_id: p.id }),
                          });
                          toast.success(`Reminder sent to ${p.name}`);
                        }}
                        className="text-muted-foreground hover:text-indigo-400 transition-colors"
                        title="Send reminder"
                      >
                        <Bell className="w-3 h-3" />
                      </button>
                    )}
                    {("signing_token" in p) && p.signing_token && (
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/sign/${p.signing_token}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Signing link copied");
                        }}
                        className="text-muted-foreground hover:text-indigo-400 transition-colors"
                        title="Copy signing link"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        {request.fields && request.fields.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Signature Fields ({request.fields.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {request.fields.map(f => {
                const assignedP = participants.find(p => p.id === f.participant_id);
                return (
                  <div key={f.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-surface text-xs">
                    <span className="font-medium capitalize text-foreground">{f.field_type.replace("_", " ")}</span>
                    <span className="text-muted-foreground">pg.{f.page}</span>
                    {assignedP && <span className="text-indigo-400">→ {assignedP.name.split(" ")[0]}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit log */}
        {auditLogs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              Audit Trail
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...auditLogs].reverse().map(log => (
                <div key={log.id} className="flex items-start gap-3 py-1.5">
                  <div className="w-1 h-1 rounded-full bg-border mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground">{actionLabel(log.action)}</span>
                      {log.ip_address && (
                        <span className="text-[10px] text-muted-foreground font-mono">{log.ip_address}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(log.created_at, "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
