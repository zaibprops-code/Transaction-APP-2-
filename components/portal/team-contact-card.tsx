"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortalContact } from "@/types/portal";

const AVATAR_COLORS: Record<string, string> = {
  indigo: "bg-indigo-500/20 text-indigo-300",
  teal: "bg-teal-500/20 text-teal-300",
  violet: "bg-violet-500/20 text-violet-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  amber: "bg-amber-500/20 text-amber-300",
  rose: "bg-rose-500/20 text-rose-300",
};

interface TeamContactCardProps {
  contact: PortalContact;
  index?: number;
  onMessage?: (contact: PortalContact) => void;
}

export function TeamContactCard({ contact, index = 0, onMessage }: TeamContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-indigo-500/30 hover:bg-surface-2 transition-all duration-200 group text-center"
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarFallback className={cn("text-sm font-semibold", AVATAR_COLORS[contact.avatarColor] || AVATAR_COLORS.indigo)}>
            {contact.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
          contact.available ? "bg-emerald-400" : "bg-muted-foreground/40"
        )} />
      </div>

      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{contact.role}</p>
      </div>

      <div className="flex items-center gap-1.5 w-full">
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1.5" asChild>
          <a href={`mailto:${contact.email}`}>
            <Mail className="w-3 h-3" />
            <span className="hidden sm:inline">Email</span>
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-8 text-xs gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
          onClick={() => onMessage?.(contact)}
        >
          <MessageSquare className="w-3 h-3" />
          <span className="hidden sm:inline">Message</span>
        </Button>
      </div>
    </motion.div>
  );
}
