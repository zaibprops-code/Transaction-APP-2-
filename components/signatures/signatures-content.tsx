"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PenLine, Plus, Clock, CheckCircle, AlertTriangle,
  Eye, XCircle, Ban, Search, Filter, Loader2,
  FileText, Users, TrendingUp, AlertCircle, Bell
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SignatureRequest } from "@/types";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { CreateRequestModal } from "./create-request-modal";
import { RequestDetailsModal } from "./request-details-modal";
import { toast } from "sonner";

type FilterTab = "all" | "pending" | "sent" | "completed" | "overdue";

function statusConfig(status: string) {
  switch (status) {
    case "completed": return { label: "Completed", variant: "success" as const, icon: CheckCircle, bg: "bg-emerald-400/10 text-emerald-400" };
    case "partially_signed": return { label: "Partially Signed", variant: "info" as const, icon: Clock, bg: "bg-blue-400/10 text-blue-400" };
    case "sent": return { label: "Sent", variant: "info" as const, icon: Eye, bg: "bg-indigo-400/10 text-indigo-400" };
    case "viewed": return { label: "Viewed", variant: "warning" as const, icon: Eye, bg: "bg-amber-400/10 text-amber-400" };
    case "pending": return { label: "Draft", variant: "warning" as const, icon: Clock, bg: "bg-amber-400/10 text-amber-400" };
    case "declined": return { label: "Declined", variant: "destructive" as const, icon: XCircle, bg: "bg-red-400/10 text-red-400" };
    case "expired": return { label: "Expired", variant: "destructive" as const, icon: AlertTriangle, bg: "bg-red-400/10 text-red-400" };
    case "cancelled": return { label: "Cancelled", variant: "destructive" as const, icon: Ban, bg: "bg-red-400/10 text-red-400" };
    default: return { label: status, variant: "warning" as const, icon: Clock, bg: "bg-amber-400/10 text-amber-400" };
  }
}

function isOverdue(req: SignatureRequest): boolean {
  return !["completed", "cancelled", "declined"].includes(req.status) &&
    new Date(req.expires_at) < new Date();
}

export function SignaturesContent() {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/signatures");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      toast.error("Failed to load signatures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(req => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || [
      req.title, req.document_name, req.deal_address,
      ...((req.participants ?? req.signers).map(p => p.name + " " + p.email))
    ].some(s => s?.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    switch (filter) {
      case "pending": return ["pending", "sent", "viewed"].includes(req.status);
      case "sent": return ["sent", "viewed", "partially_signed"].includes(req.status);
      case "completed": return req.status === "completed";
      case "overdue": return isOverdue(req);
      default: return true;
    }
  });

  const stats = {
    pending: requests.filter(r => ["pending", "sent", "viewed", "partially_signed"].includes(r.status)).length,
    completed: requests.filter(r => r.status === "completed").length,
    overdue: requests.filter(isOverdue).length,
    total: requests.length,
  };

  const handleRemindAll = async (req: SignatureRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/signatures/${req.id}/remind`, { method: "POST" });
      const data = await res.json();
      toast.success(`${data.reminders_sent ?? "All"} reminders sent`);
    } catch {
      toast.error("Failed to send reminders");
    }
  };

  const FILTER_TABS: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "completed", label: "Completed", count: stats.completed },
    { id: "overdue", label: "Overdue", count: stats.overdue },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">E-Signatures</h1>
          {stats.pending > 0 && (
            <Badge variant="warning" className="text-[10px]">{stats.pending} pending</Badge>
          )}
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Total", value: stats.total, icon: FileText, color: "text-indigo-400", bg: "bg-indigo-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search requests, documents, signers…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-surface">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                filter === tab.id
                  ? "bg-indigo-500/20 text-indigo-400 font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[9px] px-1 rounded-full ${
                  filter === tab.id ? "bg-indigo-400/20 text-indigo-400" : "bg-surface-2 text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading signature requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <PenLine className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {search || filter !== "all" ? "No matching requests" : "No signature requests yet"}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {search || filter !== "all" ? "Try adjusting your filters" : "Create your first request to get started"}
          </p>
          {filter === "all" && !search && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> New Request
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const participants = req.participants ?? req.signers.map(s => ({ ...s, status: s.status }));
            const signedCount = participants.filter(p => p.status === "signed").length;
            const progress = participants.length > 0 ? (signedCount / participants.length) * 100 : 0;
            const sc = statusConfig(req.status);
            const StatusIcon = sc.icon;
            const overdue = isOverdue(req);
            const isActive = !["completed", "cancelled", "declined", "expired"].includes(req.status);

            return (
              <Card
                key={req.id}
                className={`hover:border-indigo-500/30 transition-all cursor-pointer ${overdue ? "border-red-500/30" : ""}`}
                onClick={() => setSelectedRequest(req)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {req.title || req.document_name}
                      </h3>
                      {req.deal_address && (
                        <p className="text-xs text-muted-foreground mt-0.5">{req.deal_address}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {overdue && (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                        </Badge>
                      )}
                      <Badge variant={sc.variant} className="text-[10px] gap-1">
                        <StatusIcon className="w-2.5 h-2.5" />
                        {sc.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Signers */}
                  <div className="space-y-1.5 mb-3">
                    {participants.map((signer, i) => {
                      const isSigned = signer.status === "signed";
                      const isViewed = signer.status === "viewed";
                      return (
                        <div key={signer.id ?? i} className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSigned ? "bg-emerald-500/20" : isViewed ? "bg-blue-500/20" : "bg-surface-2"
                          }`}>
                            {isSigned ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                              : isViewed ? <Eye className="w-3 h-3 text-blue-400" />
                              : <Clock className="w-3 h-3 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-xs text-foreground">{signer.name}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground capitalize">{signer.role?.replace("_", " ")}</span>
                          </div>
                          <span className={`text-xs font-medium ${
                            isSigned ? "text-emerald-400" : isViewed ? "text-blue-400" : "text-amber-400"
                          }`}>
                            {isSigned && "signed_at" in signer && signer.signed_at
                              ? formatRelativeDate(signer.signed_at)
                              : isViewed ? "Viewed"
                              : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  {participants.length > 1 && (
                    <div className="mb-3">
                      <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {signedCount}/{participants.length} signed
                      {" · "}
                      {overdue ? (
                        <span className="text-red-400 font-medium">Expired {formatDate(req.expires_at, "MMM d")}</span>
                      ) : (
                        <>Expires {formatDate(req.expires_at, "MMM d")}</>
                      )}
                    </span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 gap-1 px-2"
                          onClick={e => handleRemindAll(req, e)}
                        >
                          <Bell className="w-3 h-3" />
                          Remind
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 text-indigo-400 hover:text-indigo-300 px-2"
                        onClick={e => { e.stopPropagation(); setSelectedRequest(req); }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchRequests}
      />

      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdated={() => { fetchRequests(); if (selectedRequest) {
          fetch(`/api/signatures/${selectedRequest.id}`).then(r => r.json()).then(d => setSelectedRequest(d.request));
        }}}
      />
    </div>
  );
}
