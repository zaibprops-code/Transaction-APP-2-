import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      const mockResponse = {
        id: `resp-${Date.now()}`,
        role: "assistant",
        content: "AI is running in demo mode. Connect your OpenAI API key in .env.local to enable real AI responses.",
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(mockResponse);
    }

    return NextResponse.json({
      id: `resp-${Date.now()}`,
      role: "assistant",
      content: "AI response would appear here with a real OpenAI API key.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
