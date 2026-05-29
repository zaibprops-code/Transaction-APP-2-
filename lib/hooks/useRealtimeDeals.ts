"use client";

import { useEffect, useState, useCallback } from "react";
import { isDemo } from "@/lib/utils";
import { MOCK_DEALS } from "@/lib/mock-data";
import type { Deal } from "@/types";

export function useRealtimeDeals(filters?: { status?: string; stage?: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    if (isDemo()) {
      let result = MOCK_DEALS.filter((d) => d.status === (filters?.status ?? "active"));
      if (filters?.stage) result = result.filter((d) => d.stage === filters.stage);
      setDeals(result);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.stage) params.set("stage", filters.stage);

    const res = await fetch(`/api/deals?${params.toString()}`);
    if (res.ok) {
      const json = await res.json() as { deals: Deal[] };
      setDeals(json.deals ?? []);
    }
    setLoading(false);
  }, [filters?.status, filters?.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDeals();

    if (isDemo()) return;

    let cleanup: (() => void) | undefined;

    async function subscribe() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();
      if (!profile) return;

      const channel = supabase
        .channel("deals:realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "deals",
            filter: `org_id=eq.${(profile as { org_id: string }).org_id}`,
          },
          () => {
            fetchDeals();
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    }

    subscribe();
    return () => cleanup?.();
  }, [fetchDeals]);

  return { deals, loading, refetch: fetchDeals };
}
