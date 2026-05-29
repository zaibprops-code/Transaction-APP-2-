"use client";

import { useState } from "react";
import { Users, Search, Plus, Mail, Phone, ExternalLink, Settings2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_DEALS } from "@/lib/mock-data";
import { generateInitials } from "@/lib/utils";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import type { PortalStatus } from "@/components/portal/portal-status-badge";
import Link from "next/link";

const PORTAL_STATUSES: PortalStatus[] = [
  "client_active",
  "waiting_for_client",
  "invite_sent",
  "invite_pending",
  "enabled",
  "disabled",
  "client_active",
  "waiting_for_client",
];

const LAST_ACTIVITY = [
  "Last active 2h ago",
  "Last active 4h ago",
  "Last active yesterday",
  "Never visited",
  "Last active 3 days ago",
  "Never visited",
  "Last active 1h ago",
  "Last active 6h ago",
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const allClients = MOCK_DEALS.flatMap((deal, i) => [
    {
      id: `${deal.id}-buyer`,
      name: deal.buyer_name,
      email: deal.buyer_email,
      phone: deal.buyer_phone,
      role: "Buyer",
      deal: deal.address,
      dealId: deal.id,
      status: deal.stage,
      portalStatus: PORTAL_STATUSES[i * 2 % PORTAL_STATUSES.length],
      lastActivity: LAST_ACTIVITY[i * 2 % LAST_ACTIVITY.length],
    },
    {
      id: `${deal.id}-seller`,
      name: deal.seller_name,
      email: deal.seller_email,
      phone: deal.seller_phone,
      role: "Seller",
      deal: deal.address,
      dealId: deal.id,
      status: deal.stage,
      portalStatus: PORTAL_STATUSES[(i * 2 + 1) % PORTAL_STATUSES.length],
      lastActivity: LAST_ACTIVITY[(i * 2 + 1) % LAST_ACTIVITY.length],
    },
  ]);

  const filtered = search
    ? allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.deal.toLowerCase().includes(search.toLowerCase())
      )
    : allClients;

  const displayed = filtered.slice(0, 12);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Clients</h1>
          <Badge variant="secondary">{allClients.length} total</Badge>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((client) => (
          <Card
            key={client.id}
            className="hover:border-indigo-500/20 transition-all group"
          >
            <CardContent className="p-4">
              {/* Top row */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>{generateInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                  <Badge
                    variant={client.role === "Buyer" ? "info" : "secondary"}
                    className="text-[10px] mt-0.5"
                  >
                    {client.role}
                  </Badge>
                </div>
                <PortalStatusBadge status={client.portalStatus} compact />
              </div>

              {/* Deal */}
              <p className="text-xs text-indigo-400 truncate mb-2">{client.deal}</p>

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
                {client.lastActivity}
              </div>

              {/* Actions — visible on hover */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                <Link href="/portal/demo-token-2024" target="_blank" className="flex-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-7 text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Portal
                  </Button>
                </Link>
                <Link href={`/clients/${client.dealId}/portal`}>
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
      </div>
    </div>
  );
}
