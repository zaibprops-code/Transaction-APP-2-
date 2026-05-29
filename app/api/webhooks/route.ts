import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  // Webhook handling would go here
  // e.g., Stripe billing events, Supabase realtime events

  return NextResponse.json({ received: true });
}
