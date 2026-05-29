"use client";

import { motion } from "framer-motion";
import { FileText, Download, Eye, Upload, CheckCircle, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PortalDocument } from "@/types/portal";

const STATUS_CONFIG = {
  action_required: { label: "Action Required", color: "bg-red-500/15 text-red-400 border-red-500/25", icon: AlertCircle, iconColor: "text-red-400" },
  pending: { label: "Pending", color: "bg-amber-500/15 text-amber-400 border-amber-500/25", icon: Clock, iconColor: "text-amber-400" },
  signed: { label: "Signed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: CheckCircle, iconColor: "text-emerald-400" },
  uploaded: { label: "Uploaded", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25", icon: CheckCircle, iconColor: "text-indigo-400" },
  reviewed: { label: "Reviewed", color: "bg-teal-500/15 text-teal-400 border-teal-500/25", icon: CheckCircle, iconColor: "text-teal-400" },
};

const CATEGORY_LABELS = {
  contract: "Contract",
  disclosure: "Disclosure",
  inspection: "Inspection",
  financing: "Financing",
  closing: "Closing",
  other: "Other",
};

interface DocumentCardProps {
  doc: PortalDocument;
  index?: number;
  onPreview?: (doc: PortalDocument) => void;
  onAction?: (doc: PortalDocument) => void;
}

export function DocumentCard({ doc, index = 0, onPreview, onAction }: DocumentCardProps) {
  const statusCfg = STATUS_CONFIG[doc.status];
  const StatusIcon = statusCfg.icon;
  const isActionable = doc.status === "action_required";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "rounded-xl border p-4 bg-surface hover:bg-surface-2 transition-all duration-200 group",
        isActionable ? "border-red-500/25 bg-red-500/5" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
          isActionable ? "bg-red-500/15" : "bg-surface-2"
        )}>
          <FileText className={cn("w-5 h-5", isActionable ? "text-red-400" : "text-indigo-400")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground leading-snug truncate">{doc.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[doc.category]}</span>
                {doc.size !== "—" && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                  </>
                )}
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold flex-shrink-0",
              statusCfg.color
            )}>
              <StatusIcon className={cn("w-3 h-3", statusCfg.iconColor)} />
              {statusCfg.label}
            </div>
          </div>

          {/* AI summary */}
          {doc.aiSummary && (
            <div className="mt-2.5 flex items-start gap-1.5 bg-indigo-500/8 border border-indigo-500/15 rounded-lg px-2.5 py-2">
              <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{doc.aiSummary}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {doc.size !== "—" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => onPreview?.(doc)}
              >
                <Eye className="w-3 h-3" />
                Preview
              </Button>
            )}
            {doc.size !== "—" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            )}
            {isActionable && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 ml-auto bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
                variant="ghost"
                onClick={() => onAction?.(doc)}
              >
                {doc.requiresSignature ? (
                  <><span>Sign Now</span></>
                ) : (
                  <><Upload className="w-3 h-3" /><span>Upload</span></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
