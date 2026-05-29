"use client";

import { useState } from "react";
import { Share2, Bell, CheckSquare, FileText, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareOption = "document" | "notification" | "task";

interface QuickShareModalProps {
  open: boolean;
  onClose: () => void;
  itemName?: string;
  itemType?: "document" | "task" | "update";
}

const SHARE_OPTIONS: { id: ShareOption; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    id: "document",
    label: "Share document to portal",
    desc: "Client will see it in their Documents tab",
    icon: FileText,
    color: "text-indigo-400",
  },
  {
    id: "notification",
    label: "Send portal notification",
    desc: "Notify the client with a custom message",
    icon: Bell,
    color: "text-amber-400",
  },
  {
    id: "task",
    label: "Add to client tasks",
    desc: "Creates a task in the client's task center",
    icon: CheckSquare,
    color: "text-teal-400",
  },
];

export function QuickShareModal({ open, onClose, itemName, itemType = "document" }: QuickShareModalProps) {
  const [selected, setSelected] = useState<ShareOption>("document");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleShare = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Share2 className="w-4 h-4 text-indigo-400" />
            Share to Client Portal
          </DialogTitle>
        </DialogHeader>

        {itemName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded-lg">
            <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-foreground truncate">{itemName}</span>
          </div>
        )}

        {/* Share options */}
        <div className="space-y-2">
          {SHARE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  selected === opt.id
                    ? "border-indigo-500/40 bg-indigo-500/8"
                    : "border-border bg-surface hover:bg-surface-2"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  selected === opt.id ? "bg-indigo-500/20" : "bg-surface-2"
                )}>
                  <Icon className={cn("w-4 h-4", opt.color)} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </div>
                <div className={cn(
                  "ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0",
                  selected === opt.id ? "border-indigo-400 bg-indigo-400" : "border-border"
                )} />
              </button>
            );
          })}
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Custom message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Add a note for your client..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="gap-1.5" onClick={handleShare}>
            {sent ? (
              <>Shared!</>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Share Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
