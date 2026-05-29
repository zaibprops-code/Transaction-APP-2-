"use client";

import { useEffect, useState, useCallback } from "react";
import { isDemo } from "@/lib/utils";
import type { Message } from "@/lib/services/messages";

const DEMO_MESSAGES: Message[] = [
  { id: "msg-1", org_id: "org-1", deal_id: "deal-1", sender_id: "user-1", sender_name: "Sarah Mitchell", content: "Inspection report received — looks clean overall, minor HVAC issue noted.", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "msg-2", org_id: "org-1", deal_id: "deal-1", sender_id: "user-2", sender_name: "Marcus Johnson", content: "Lender confirmed the appraisal is scheduled for Thursday morning.", is_read: true, created_at: new Date(Date.now() - 43200000).toISOString() },
];

export function useRealtimeMessages(dealId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!dealId) { setLoading(false); return; }

    if (isDemo()) {
      setMessages(DEMO_MESSAGES.filter((m) => m.deal_id === dealId));
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/messages?deal_id=${dealId}`);
    if (res.ok) {
      const json = await res.json() as { messages: Message[] };
      setMessages(json.messages ?? []);
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchMessages();

    if (isDemo() || !dealId) return;

    let cleanup: (() => void) | undefined;

    async function subscribe() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const channel = supabase
        .channel(`messages:${dealId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `deal_id=eq.${dealId}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    }

    subscribe();
    return () => cleanup?.();
  }, [dealId, fetchMessages]);

  const send = useCallback(async (content: string): Promise<boolean> => {
    if (!dealId) return false;

    if (isDemo()) {
      const optimistic: Message = {
        id: `msg-${Date.now()}`,
        org_id: "org-1",
        deal_id: dealId,
        sender_id: "user-1",
        sender_name: "Sarah Mitchell",
        content,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      return true;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal_id: dealId, content }),
    });

    if (res.ok) {
      const json = await res.json() as { message: Message };
      setMessages((prev) => [...prev, json.message]);
      return true;
    }
    return false;
  }, [dealId]);

  return { messages, loading, send, refetch: fetchMessages };
}
