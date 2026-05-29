"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Send,
  Eye,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateInitials, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";

interface ClientData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  portal_token: string | null;
  portal_enabled: boolean;
  portal_status: string;
  last_portal_visit: string | null;
  notes: string | null;
  avatar_url: string | null;
}

export default function ClientPortalAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [savingMsg, setSavingMsg] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const json = await res.json() as { client: ClientData };
        setClient(json.client);
        setPortalEnabled(json.client.portal_enabled);
        setWelcomeMsg(json.client.notes ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const portalUrl = client?.portal_token ? `/portal/${client.portal_token}` : null;

  async function handleTogglePortal() {
    if (!client) return;
    const newVal = !portalEnabled;
    setPortalEnabled(newVal);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal_enabled: newVal }),
      });
      if (!res.ok) throw new Error();
      toast.success(newVal ? "Portal enabled" : "Portal disabled");
    } catch {
      setPortalEnabled(!newVal);
      toast.error("Failed to update portal access");
    }
  }

  async function handleSendInvite() {
    if (!client?.portal_token) return;
    setInviteSending(true);
    try {
      const res = await fetch("/api/email/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
          client_email: client.email,
          client_name: client.full_name,
          portal_token: client.portal_token,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Invite sent to " + client.email);
      setClient(prev => prev ? { ...prev, portal_status: "invite_sent" } : prev);
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviteSending(false);
    }
  }

  function handleCopyLink() {
    if (!portalUrl) return;
    navigator.clipboard.writeText(window.location.origin + portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveMessage() {
    if (!client) return;
    setSavingMsg(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: welcomeMsg }),
      });
      if (!res.ok) throw new Error();
      toast.success("Welcome message saved");
    } catch {
      toast.error("Failed to save message");
    } finally {
      setSavingMsg(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-sm text-muted-foreground">Client not found.</p>
        <Button size="sm" asChild variant="outline">
          <Link href="/clients"><ArrowLeft className="w-3.5 h-3.5" /> Back to Clients</Link>
        </Button>
      </div>
    );
  }

  const inviteSent = client.portal_status === "invite_sent" || client.portal_status === "client_active" || client.portal_status === "waiting_for_client";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Clients
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground font-medium">{client.full_name}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-indigo-400">Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the client-facing experience for {client.full_name}</p>
        </div>
        {portalUrl && (
          <Link href={portalUrl} target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Portal
            </Button>
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Portal status toggle */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${portalEnabled ? "bg-emerald-500/15" : "bg-surface-2"}`}>
                    <Shield className={`w-5 h-5 ${portalEnabled ? "text-emerald-400" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Portal Access</p>
                    <p className="text-xs text-muted-foreground">{portalEnabled ? "Client can access their portal" : "Portal is disabled"}</p>
                  </div>
                </div>
                <button onClick={handleTogglePortal} className="text-muted-foreground hover:text-foreground transition-colors">
                  {portalEnabled
                    ? <ToggleRight className="w-8 h-8 text-emerald-400" />
                    : <ToggleLeft className="w-8 h-8" />
                  }
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Invite */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                Client Invite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-surface-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground flex-1 truncate">{client.email}</span>
                <Badge className={inviteSent ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}>
                  {inviteSent ? "Invite Sent" : "Not Sent"}
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-2"
                  variant={inviteSent ? "outline" : "default"}
                  onClick={handleSendInvite}
                  disabled={inviteSending || !client.portal_token}
                >
                  {inviteSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {inviteSent ? "Resend Invite" : "Send Invite"}
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleCopyLink} disabled={!portalUrl}>
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                {portalUrl && (
                  <Link href={portalUrl} target="_blank">
                    <Button size="sm" variant="ghost" className="gap-2">
                      <Link2 className="w-3.5 h-3.5" />
                      Open
                    </Button>
                  </Link>
                )}
              </div>
              {portalUrl && (
                <p className="text-[10px] text-muted-foreground font-mono break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}{portalUrl}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Welcome message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Welcome Message</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                rows={3}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Custom welcome message shown to the client when they log in..."
              />
              <Button size="sm" className="mt-2" onClick={handleSaveMessage} disabled={savingMsg}>
                {savingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                {savingMsg ? "Saving..." : "Save Message"}
              </Button>
            </CardContent>
          </Card>

          {/* Portal link info */}
          {!client.portal_token && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No portal token</p>
                    <p className="text-xs text-muted-foreground">This client does not have a portal token assigned yet.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Client info */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-sm">
                    {generateInitials(client.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{client.full_name}</p>
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                {client.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground font-medium">{client.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portal Status</span>
                  <span className="text-foreground font-medium capitalize">{client.portal_status.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Visit</span>
                  <span className="text-foreground font-medium">
                    {client.last_portal_visit ? formatRelativeDate(client.last_portal_visit) : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Portal Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.last_portal_visit ? (
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Portal visited</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeDate(client.last_portal_visit)}</p>
                    </div>
                  </div>
                  {inviteSent && (
                    <div className="flex gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Invite sent</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                  {!inviteSent && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Send an invite to get started</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
