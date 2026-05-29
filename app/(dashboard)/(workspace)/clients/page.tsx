"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Search, Plus, Mail, Phone, ExternalLink, Settings2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateInitials, formatRelativeDate } from "@/lib/utils";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
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

function lastActivityLabel(lastVisit: string | null): string {
  if (!lastVisit) return "Never visited";
  return `Last active ${formatRelativeDate(lastVisit)}`;
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Button size="sm" className="gap-1.5 h-8 text-xs">
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
          <Button size="sm" className="gap-1.5">
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
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
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
    </div>
  );
}
