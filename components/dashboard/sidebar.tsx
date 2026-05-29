"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  FolderOpen,
  Calendar,
  PenLine,
  MessageSquare,
  Users,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "deals", label: "Deals", href: "/deals", icon: Building2 },
      { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare },
      { id: "documents", label: "Documents", href: "/documents", icon: FolderOpen },
      { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "signatures", label: "Signatures", href: "/signatures", icon: PenLine },
      { id: "communications", label: "Messages", href: "/communications", icon: MessageSquare },
      { id: "clients", label: "Clients", href: "/clients", icon: Users },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "ai", label: "AI Assistant", href: "/ai", icon: Sparkles },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen bg-surface border-r border-border flex-shrink-0 relative overflow-hidden"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-border flex-shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-closetrack flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.35"/>
              <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.65"/>
              <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground truncate">CloseTrack</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-surface-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all duration-150 group",
                        active
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          active ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate font-medium">{item.label}</span>
                      )}
                      {!collapsed && item.id === "tasks" && (
                        <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5 font-bold">
                          2
                        </span>
                      )}
                      {!collapsed && item.id === "ai" && (
                        <span className="ml-auto">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings + Expand */}
      <div className="border-t border-border p-2 flex flex-col gap-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
