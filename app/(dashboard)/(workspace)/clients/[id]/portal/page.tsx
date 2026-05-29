"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Send,
  Eye,
  Settings,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import { formatCurrency } from "@/lib/utils";

const PORTAL_URL = `/portal/demo-token-2024`;

const ACTIVITY_LOG = [
  { event: "Portal opened", time: "Today at 2:34 PM", detail: "Marcus Reyes viewed dashboard" },
  { event: "Document viewed", time: "Today at 2:36 PM", detail: "Opened: Home Inspection Report" },
  { event: "Message sent", time: "Yesterday at 4:12 PM", detail: "Client sent 1 message" },
  { event: "Task viewed", time: "2 days ago", detail: "Viewed: Sign Seller Disclosure" },
  { event: "Portal opened", time: "3 days ago", detail: "Elena Reyes viewed timeline" },
];

type DocVisibility = Record<string, boolean>;

export default function ClientPortalAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const portal = MOCK_CLIENT_PORTAL;
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [inviteSent, setInviteSent] = useState(true);
  const [copied, setCopied] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState(portal.welcomeMessage || "");
  const [docVisibility, setDocVisibility] = useState<DocVisibility>(
    Object.fromEntries(portal.documents.map((d) => [d.id, true]))
  );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + PORTAL_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = () => setInviteSent(true);

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
            <span className="text-sm text-foreground font-medium">{portal.clientName}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-indigo-400">Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the client-facing experience for {portal.clientName}</p>
        </div>
        <Link href={PORTAL_URL} target="_blank">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Portal
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Portal status */}
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
                <button onClick={() => setPortalEnabled(!portalEnabled)} className="text-muted-foreground hover:text-foreground transition-colors">
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
                <span className="text-xs text-muted-foreground flex-1 truncate">{portal.clientEmail}</span>
                <Badge className={inviteSent ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}>
                  {inviteSent ? "Invite Sent" : "Not Sent"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  variant={inviteSent ? "outline" : "default"}
                  onClick={sendInvite}
                >
                  <Send className="w-3.5 h-3.5" />
                  {inviteSent ? "Resend Invite" : "Send Invite"}
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={copyLink}>
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Link href={PORTAL_URL} target="_blank">
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Link2 className="w-3.5 h-3.5" />
                    Open
                  </Button>
                </Link>
              </div>
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
                placeholder="Custom welcome message shown to the client..."
              />
              <Button size="sm" className="mt-2">Save Message</Button>
            </CardContent>
          </Card>

          {/* Document visibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Document Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {portal.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground truncate flex-1">{doc.name}</span>
                    <button
                      onClick={() => setDocVisibility((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-3 flex-shrink-0"
                    >
                      {docVisibility[doc.id]
                        ? <ToggleRight className="w-6 h-6 text-indigo-400" />
                        : <ToggleLeft className="w-6 h-6" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Client info */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-sm">
                    {portal.clientInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{portal.clientName}</p>
                  <p className="text-xs text-muted-foreground">{portal.clientEmail}</p>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property</span>
                  <span className="text-foreground font-medium text-right max-w-[60%] truncate">{portal.propertyAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-foreground font-medium">{formatCurrency(portal.purchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing</span>
                  <span className="text-foreground font-medium">{portal.closingDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Portal Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ACTIVITY_LOG.map((log, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{log.event}</p>
                      <p className="text-[11px] text-muted-foreground">{log.detail}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
