"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, FileText, CheckSquare, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PortalNavProps {
  token: string;
  clientName: string;
  clientInitials: string;
  propertyAddress: string;
  daysToClose: number;
}

const navLinks = (token: string) => [
  { href: `/portal/${token}`, label: "Overview", icon: Home },
  { href: `/portal/${token}/timeline`, label: "Timeline", icon: FileText },
  { href: `/portal/${token}/documents`, label: "Documents", icon: FileText },
  { href: `/portal/${token}/tasks`, label: "Tasks", icon: CheckSquare },
  { href: `/portal/${token}/messages`, label: "Messages", icon: MessageSquare },
];

export function PortalNav({ token, clientName, clientInitials, propertyAddress, daysToClose }: PortalNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navLinks(token);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href={`/portal/${token}`} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4"/>
                <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7"/>
                <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-foreground hidden sm:block">CloseTrack</span>
          </Link>

          {/* Property address */}
          <div className="hidden md:block h-5 w-px bg-border" />
          <p className="hidden md:block text-sm text-muted-foreground truncate max-w-xs">
            {propertyAddress}
          </p>

          {/* Countdown chip */}
          {daysToClose > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold ml-auto mr-0 md:ml-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {daysToClose} days to closing
            </div>
          )}

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Avatar */}
          <div className="flex items-center gap-2 ml-4 hidden md:flex">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-indigo-500/20 text-indigo-300">{clientInitials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed top-16 left-0 right-0 z-30 bg-surface border-b border-border shadow-xl px-4 py-4"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-sm bg-indigo-500/20 text-indigo-300">{clientInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{clientName}</p>
                <p className="text-xs text-muted-foreground">{propertyAddress}</p>
              </div>
              {daysToClose > 0 && (
                <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1 text-xs font-semibold">
                  {daysToClose}d
                </div>
              )}
            </div>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
