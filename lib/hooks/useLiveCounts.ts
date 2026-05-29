"use client";

import { useEffect, useState, useCallback } from "react";
import { isDemo } from "@/lib/utils";
import { MOCK_TASKS } from "@/lib/mock-data";

interface LiveCounts {
  overdueTasks: number;
  activePortals: number;
}

export function useLiveCounts(): LiveCounts {
  const [counts, setCounts] = useState<LiveCounts>({ overdueTasks: 0, activePortals: 0 });

  const fetch_ = useCallback(async () => {
    if (isDemo()) {
      const now = new Date();
      const overdue = MOCK_TASKS.filter(
        (t) => t.status !== "completed" && t.status !== "cancelled" && new Date(t.due_date) < now
      ).length;
      setCounts({ overdueTasks: overdue, activePortals: 5 });
      return;
    }

    try {
      const [tasksRes, clientsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/clients"),
      ]);

      let overdueTasks = 0;
      let activePortals = 0;

      if (tasksRes.ok) {
        const json = await tasksRes.json() as { tasks: Array<{ status: string; due_date: string }> };
        const now = new Date();
        overdueTasks = (json.tasks ?? []).filter(
          (t) => t.status !== "completed" && t.status !== "cancelled" && new Date(t.due_date) < now
        ).length;
      }

      if (clientsRes.ok) {
        const json = await clientsRes.json() as { clients: Array<{ portal_enabled: boolean; portal_status: string }> };
        activePortals = (json.clients ?? []).filter(
          (c) => c.portal_enabled && c.portal_status === "client_active"
        ).length;
      }

      setCounts({ overdueTasks, activePortals });
    } catch {
      // silently keep zeros on error
    }
  }, []);

  useEffect(() => {
    fetch_();
    // Refresh every 60s
    const id = setInterval(fetch_, 60_000);
    return () => clearInterval(id);
  }, [fetch_]);

  return counts;
}
