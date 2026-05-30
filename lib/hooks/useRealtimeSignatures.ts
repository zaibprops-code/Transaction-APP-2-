"use client";

import { useEffect, useState, useCallback } from "react";
import type { SignatureRequest } from "@/types";

export function useRealtimeSignatures(dealId?: string) {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const url = dealId ? `/api/signatures?deal_id=${dealId}` : "/api/signatures";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch signatures");
      const data = await res.json();
      setRequests(data.requests ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchRequests();
    // Poll every 30 seconds to pick up status changes from signers
    const interval = setInterval(fetchRequests, 30_000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const refresh = useCallback(() => fetchRequests(), [fetchRequests]);

  return { requests, loading, error, refresh };
}
