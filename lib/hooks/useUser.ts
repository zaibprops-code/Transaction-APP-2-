"use client";

import { useEffect, useState } from "react";
import { isDemo } from "@/lib/utils";
import type { Profile } from "@/types";

const DEMO_USER: Profile = {
  id: "user-1",
  org_id: "org-1",
  role: "team_coordinator",
  full_name: "Sarah Mitchell",
  email: "sarah@closetrack.co",
  avatar_url: undefined,
  title: "Lead Transaction Coordinator",
  phone: "(555) 234-5678",
  preferences: {},
  created_at: "2024-01-15T00:00:00Z",
};

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo()) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { setLoading(false); return; }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data) {
          setUser({
            id: data.id as string,
            org_id: data.org_id as string,
            role: data.role as Profile["role"],
            full_name: data.full_name as string,
            email: data.email as string,
            avatar_url: data.avatar_url as string | undefined,
            title: data.title as string | undefined,
            phone: data.phone as string | undefined,
            preferences: (data.preferences as Record<string, unknown>) ?? {},
            created_at: data.created_at as string,
          });
        }
      } catch {
        // silently fail — component will show fallback
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading };
}
