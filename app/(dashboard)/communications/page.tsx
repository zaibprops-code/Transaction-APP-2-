import { Metadata } from "next";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_COMMUNICATIONS } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Communications" };

const typeColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  note: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sms: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function CommunicationsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Communications</h1>
          <Badge variant="secondary">{MOCK_COMMUNICATIONS.length} messages</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search messages..."
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <Button size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="w-3.5 h-3.5" />
            New Message
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_COMMUNICATIONS.map(comm => (
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
      </div>
    </div>
  );
}
