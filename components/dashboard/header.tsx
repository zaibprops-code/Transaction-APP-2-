"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    router.push("/login");
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-3 px-4 flex-shrink-0">
      {/* Search */}
      <button
        className="flex items-center gap-2 flex-1 max-w-sm bg-surface-2 hover:bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors group"
        onClick={() => {}}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left hidden sm:block">Search deals, tasks, docs...</span>
        <div className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/60 font-mono">
          <Command className="w-2.5 h-2.5" />K
        </div>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">
                  Mark all read
                </span>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 flex gap-3 hover:bg-surface-2 cursor-pointer transition-colors ${!n.read ? "bg-indigo-500/5" : ""}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? "bg-indigo-400" : "bg-transparent"}`} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatRelativeDate(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-surface-2 rounded-lg px-2 py-1.5 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs">SM</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-foreground">Sarah Mitchell</div>
                <div className="text-[10px] text-muted-foreground">Lead Coordinator</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sarah Mitchell</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
