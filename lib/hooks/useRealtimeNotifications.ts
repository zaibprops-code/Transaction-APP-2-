"use client";

import { useEffect, useState, useCallback } from "react";
import { isDemo } from "@/lib/utils";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import type { Notification } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (isDemo()) {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json() as { notifications: Notification[] };
        setNotifications(json.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (isDemo()) return;

    let channel: RealtimeChannel | undefined;

    async function subscribe() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ch = supabase.channel(`notifications:${user.id}`);
      ch
        .on(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "postgres_changes" as any,
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload: { new: Notification }) => {
            setNotifications((prev) => [payload.new, ...prev]);
          }
        )
        .on(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "postgres_changes" as any,
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload: { new: Notification }) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          }
        )
        .subscribe();
      channel = ch;
    }

    subscribe();

    return () => {
      if (channel) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          createClient().removeChannel(channel!);
        });
      }
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!isDemo()) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!isDemo()) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });
    }
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}
