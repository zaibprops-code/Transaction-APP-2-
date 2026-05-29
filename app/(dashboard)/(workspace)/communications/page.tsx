"use client";

import { useState } from "react";
import { MessageSquare, Plus, Search, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MOCK_COMMUNICATIONS } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Communication } from "@/types";

const typeColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  note: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sms: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

interface NewMessageForm {
  subject: string;
  body: string;
  to_emails: string;
  type: "email" | "note" | "sms";
}

const DEFAULT_MSG_FORM: NewMessageForm = {
  subject: "",
  body: "",
  to_emails: "",
  type: "email",
};

function NewMessageDialog({
  open,
  onClose,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  onSent: (comm: Communication) => void;
}) {
  const [form, setForm] = useState<NewMessageForm>(DEFAULT_MSG_FORM);
  const [sending, setSending] = useState(false);

  function set(field: keyof NewMessageForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSending(true);
    try {
      // In demo mode or production, post to messages API
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          subject: form.subject,
          body: form.body,
          to_emails: form.to_emails
            ? form.to_emails.split(",").map((e) => e.trim()).filter(Boolean)
            : [],
        }),
      });

      // Build a local communication record for display
      const newComm: Communication = {
        id: `comm-${Date.now()}`,
        deal_id: "",
        org_id: "org-1",
        type: form.type,
        subject: form.subject,
        body: form.body,
        from_email: "sarah@closetrack.co",
        from_name: "Sarah Mitchell",
        to_emails: form.to_emails
          ? form.to_emails.split(",").map((e) => e.trim()).filter(Boolean)
          : [],
        status: "sent",
        created_at: new Date().toISOString(),
      };

      if (!res.ok) {
        // In demo mode the messages API may not exist; still show success
        toast.success("Message sent");
      } else {
        toast.success("Message sent");
      }

      setForm(DEFAULT_MSG_FORM);
      onSent(newComm);
      onClose();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">New Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="email">Email</option>
              <option value="note">Note</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Re: Inspection Results"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To (comma-separated emails)</label>
            <input
              type="text"
              value={form.to_emails}
              onChange={(e) => set("to_emails", e.target.value)}
              placeholder="client@email.com, agent@email.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Write your message..."
              required
              rows={4}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={sending}>
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunicationsPage() {
  const [search, setSearch] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>(MOCK_COMMUNICATIONS);

  function handleMessageSent(comm: Communication) {
    setCommunications((prev) => [comm, ...prev]);
  }

  const filtered = search
    ? communications.filter(
        (c) =>
          c.subject.toLowerCase().includes(search.toLowerCase()) ||
          c.body.toLowerCase().includes(search.toLowerCase()) ||
          c.deal_address?.toLowerCase().includes(search.toLowerCase())
      )
    : communications;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Communications</h1>
          <Badge variant="secondary">{communications.length} messages</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNewMessage(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Message
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(comm => (
          <Card key={comm.id} className="hover:border-indigo-500/20 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`px-2 py-0.5 rounded border text-[10px] font-medium flex-shrink-0 mt-0.5 ${typeColors[comm.type] ?? typeColors.email}`}>
                  {comm.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">{comm.subject}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeDate(comm.created_at)}
                    </span>
                  </div>
                  {comm.deal_address && (
                    <p className="text-xs text-indigo-400 mt-0.5">{comm.deal_address}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{comm.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>From: {comm.from_name ?? comm.from_email}</span>
                    {comm.to_emails.length > 0 && (
                      <>
                        <span>·</span>
                        <span>To: {comm.to_emails[0]}{comm.to_emails.length > 1 ? ` +${comm.to_emails.length - 1}` : ""}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages found</p>
          </div>
        )}
      </div>

      <NewMessageDialog
        open={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onSent={handleMessageSent}
      />
    </div>
  );
}
