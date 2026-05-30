"use client";

import { useState, useEffect, useCallback } from "react";
import { isDemo } from "@/lib/utils";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import type { ClientPortalData } from "@/types/portal";

export function usePortalData(token: string) {
  const [portal, setPortal] = useState<ClientPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortal = useCallback(async () => {
    if (isDemo() || token === "demo-token-2024") {
      setPortal(MOCK_CLIENT_PORTAL);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/portal/${encodeURIComponent(token)}`);
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Portal unavailable");
        setLoading(false);
        return;
      }
      const json = (await res.json()) as { portal: ClientPortalData };
      setPortal(json.portal);
      setError(null);
    } catch {
      setError("Could not load portal data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortal();
  }, [fetchPortal]);

  return { portal, loading, error, refetch: fetchPortal };
}
