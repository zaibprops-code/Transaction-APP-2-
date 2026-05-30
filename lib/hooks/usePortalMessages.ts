"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { isDemo } from "@/lib/utils";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import type { PortalMessage } from "@/types/portal";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

function mapRow(row: Record<string, unknown>): PortalMessage {
  const isClient = row.sender_type === "client";
  const profile = row.profiles as { full_name?: string } | null;
  const senderName = isClient ? "You" : (profile?.full_name ?? "Team Member");
  return {
    id: row.id as string,
    sender: isClient ? "client" : "team",
    senderName,
    senderInitials: getInitials(senderName),
    content: row.content as string,
    timestamp: row.created_at as string,
    read: Boolean(row.is_read),
  };
}

export function usePortalMessages(token: string) {
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (isDemo() || token === "demo-token-2024") {
      setMessages(MOCK_CLIENT_PORTAL.messages);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/portal/${encodeURIComponent(token)}/messages`);
      if (res.ok) {
        const json = (await res.json()) as { messages: Record<string, unknown>[] };
        if (mountedRef.current) {
          setMessages((json.messages ?? []).map(mapRow));
        }
      }
    } catch {
      // keep existing messages
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    fetchMessages();

    // Poll every 12 seconds for new messages
    if (!isDemo() && token !== "demo-token-2024") {
      pollRef.current = setInterval(fetchMessages, 12000);
    }

    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!content.trim()) return false;

      const optimisticId = `optimistic-${Date.now()}`;
      const optimistic: PortalMessage = {
        id: optimisticId,
        sender: "client",
        senderName: "You",
        senderInitials: "ME",
        content,
        timestamp: new Date().toISOString(),
        read: true,
      };

      setMessages((prev: PortalMessage[]) => [...prev, optimistic]);
      setSending(true);

      if (isDemo() || token === "demo-token-2024") {
        setSending(false);
        return true;
      }

      try {
        const res = await fetch(`/api/portal/${encodeURIComponent(token)}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (res.ok) {
          await fetchMessages();
          setSending(false);
          return true;
        }

        setMessages((prev: PortalMessage[]) => prev.filter((m: PortalMessage) => m.id !== optimisticId));
        setSending(false);
        return false;
      } catch {
        setMessages((prev: PortalMessage[]) => prev.filter((m: PortalMessage) => m.id !== optimisticId));
        setSending(false);
        return false;
      }
    },
    [token, fetchMessages]
  );

  return { messages, sendMessage, sending, loading, refetch: fetchMessages };
}
