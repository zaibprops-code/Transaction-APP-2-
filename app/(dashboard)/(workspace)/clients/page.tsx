"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Search, Plus, Mail, Phone, ExternalLink, Settings2, Clock, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateInitials, formatRelativeDate } from "@/lib/utils";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import { toast } from "sonner";
import type { PortalStatus } from "@/components/portal/portal-status-badge";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  portal_token: string | null;
  portal_enabled: boolean;
  portal_status: string;
  last_portal_visit: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AddClientForm {
  full_name: string;
  email: string;
  phone: string;
}

const DEFAULT_CLIENT_FORM: AddClientForm = {
  full_name: "",
  email: "",
  phone: "",
};

function lastActivityLabel(lastVisit: string | null): string {
  if (!lastVisit) return "Never visited";
  return `Last active ${formatRelativeDate(lastVisit)}`;
}

function AddClientDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  const [form, setForm] = useState<AddClientForm>(DEFAULT_CLIENT_FORM);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof AddClientForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to add client");
      }
      const json = await res.json() as { client: Client };
      toast.success("Client added");
      setForm(DEFAULT_CLIENT_FORM);
      onCreated(json.client);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@email.com"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {submitting ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const json = await res.json() as { clients: Client[] };
        setClients(json.clients ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function handleClientCreated(client: Client) {
    setClients((prev) => [client, ...prev]);
  }

  async function handleSendInvite(client: Client) {
    if (!client.portal_token) {
      toast.error("No portal token found for this client");
      return;
    }
    setSendingInvite(client.id);
    // Optimistically update portal status
    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, portal_status: "invite_sent" } : c
      )
    );
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
      if (!res.ok) {
        throw new Error("Failed to send invite");
      }
      toast.success("Invite sent to " + client.email);
    } catch {
      // Revert
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, portal_status: client.portal_status } : c
        )
      );
      toast.error("Failed to send invite");
    } finally {
      setSendingInvite(null);
    }
  }

  const filtered = search
    ? clients.filter(
        (c) =>
          c.full_name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Clients</h1>
          {!loading && <Badge variant="secondary">{clients.length} total</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowAddClient(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">No clients yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Add clients to manage their portal access and track their engagement.
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddClient(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add your first client
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="hover:border-indigo-500/20 transition-all group"
            >
              <CardContent className="p-4">
                {/* Top row */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{generateInitials(client.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{client.full_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <PortalStatusBadge status={client.portal_status as PortalStatus} compact />
                </div>

                {/* Contact */}
                {client.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {client.phone}
                  </p>
                )}

                {/* Last portal activity */}
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {lastActivityLabel(client.last_portal_visit)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border flex-wrap">
                  {/* Send Invite button for pending/not yet invited */}
                  {(client.portal_status === "invite_pending" || client.portal_status === "disabled") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border-indigo-500/20"
                      disabled={sendingInvite === client.id}
                      onClick={() => handleSendInvite(client)}
                    >
                      {sendingInvite === client.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Send Invite
                    </Button>
                  )}
                  {client.portal_token && (
                    <Link href={`/portal/${client.portal_token}`} target="_blank" className="flex-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full h-7 text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Portal
                      </Button>
                    </Link>
                  )}
                  <Link href={`/clients/${client.id}/portal`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Settings2 className="w-3 h-3" />
                      Admin
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && search && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No clients match &quot;{search}&quot;
            </div>
          )}
        </div>
      )}

      <AddClientDialog
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onCreated={handleClientCreated}
      />
    </div>
  );
}
