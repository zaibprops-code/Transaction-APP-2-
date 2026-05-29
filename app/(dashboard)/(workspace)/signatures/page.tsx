import { Metadata } from "next";
import { PenLine, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_SIGNATURE_REQUESTS } from "@/lib/mock-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Signatures" };

export default function SignaturesPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">E-Signatures</h1>
          <Badge variant="warning">2 pending</Badge>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Request
        </Button>
      </div>

      <div className="space-y-4">
        {MOCK_SIGNATURE_REQUESTS.map(req => {
          const signedCount = req.signers.filter(s => s.status === "signed").length;
          const progress = (signedCount / req.signers.length) * 100;
          return (
            <Card key={req.id} className="hover:border-indigo-500/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{req.document_name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.deal_address}</p>
                  </div>
                  <Badge
                    variant={
                      req.status === "signed" ? "success" :
                      req.status === "sent" ? "info" : "warning"
                    }
                    className="text-[10px]"
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {req.signers.map(signer => (
                    <div key={signer.id} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        signer.status === "signed" ? "bg-emerald-500/20" : "bg-surface-2"
                      }`}>
                        {signer.status === "signed"
                          ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                          : <Clock className="w-3 h-3 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground">{signer.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">· {signer.role}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        signer.status === "signed" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {signer.status === "signed" ? `Signed ${formatRelativeDate(signer.signed_at!)}` : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{signedCount}/{req.signers.length} signed · Expires {formatDate(req.expires_at, "MMM d")}</span>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Send reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
