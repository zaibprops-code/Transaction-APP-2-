import { Metadata } from "next";
import { Users, Search, Plus, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_DEALS } from "@/lib/mock-data";
import { generateInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  const clients = MOCK_DEALS.flatMap(deal => [
    { id: `${deal.id}-buyer`, name: deal.buyer_name, email: deal.buyer_email, phone: deal.buyer_phone, role: "Buyer", deal: deal.address, status: deal.stage },
    { id: `${deal.id}-seller`, name: deal.seller_name, email: deal.seller_email, phone: deal.seller_phone, role: "Seller", deal: deal.address, status: deal.stage },
  ]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Clients</h1>
          <Badge variant="secondary">{clients.length} total</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search clients..."
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
        {clients.slice(0, 12).map(client => (
          <Card key={client.id} className="hover:border-indigo-500/20 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>{generateInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                  <Badge variant={client.role === "Buyer" ? "info" : "secondary"} className="text-[10px] mt-0.5">
                    {client.role}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-indigo-400 truncate mb-2">{client.deal}</p>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
