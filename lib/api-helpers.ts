import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrgId } from "@/lib/services/profiles";

export type AuthContext = {
  userId: string;
  orgId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

/** Authenticate a request and return userId + orgId + supabase client. */
export async function requireAuth(): Promise<{ ctx: AuthContext; error: null } | { ctx: null; error: NextResponse }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ctx: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const orgId = await getMyOrgId(supabase);
  if (!orgId) {
    return { ctx: null, error: NextResponse.json({ error: "No organization found" }, { status: 403 }) };
  }

  return { ctx: { userId: user.id, orgId, supabase }, error: null };
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
