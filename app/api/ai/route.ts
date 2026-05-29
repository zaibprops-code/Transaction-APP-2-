import { NextRequest } from "next/server";
import { buildContext } from "@/lib/ai/context";
import { getDemoResponse } from "@/lib/ai/demo-responses";

function isLiveMode() {
  return (
    (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your-")) ||
    (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-"))
  );
}

function encodeSSE(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

async function streamTokens(controller: ReadableStreamDefaultController, text: string) {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? "" : " ") + words[i];
    controller.enqueue(encodeSSE({ type: "token", content: chunk }));
    await new Promise((r) => setTimeout(r, 12 + Math.random() * 8));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: Array<{ role: string; content: string }>;
      context?: string;
      deal_id?: string;
      pathname?: string;
    };

    const { messages, deal_id, pathname = "/dashboard" } = body;
    const userMessage = messages[messages.length - 1]?.content ?? "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (isLiveMode()) {
            const systemContext = buildContext(pathname, deal_id);

            if (
              process.env.ANTHROPIC_API_KEY &&
              !process.env.ANTHROPIC_API_KEY.includes("your-")
            ) {
              const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.ANTHROPIC_API_KEY,
                  "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                  model: "claude-sonnet-4-6",
                  max_tokens: 2048,
                  system: systemContext,
                  stream: true,
                  messages: messages.map((m) => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: m.content,
                  })),
                }),
              });

              const reader = response.body?.getReader();
              const decoder = new TextDecoder();

              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  const lines = decoder.decode(value).split("\n");
                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      try {
                        const data = JSON.parse(line.slice(6)) as {
                          type: string;
                          delta?: { type: string; text?: string };
                        };
                        if (
                          data.type === "content_block_delta" &&
                          data.delta?.type === "text_delta"
                        ) {
                          controller.enqueue(
                            encodeSSE({ type: "token", content: data.delta.text ?? "" })
                          );
                        }
                      } catch {
                        // skip malformed SSE lines
                      }
                    }
                  }
                }
              }
            }
          } else {
            // Demo mode — intelligent pre-built responses
            const demoResponse = getDemoResponse(userMessage);

            if (demoResponse.toolCalls) {
              for (const tc of demoResponse.toolCalls) {
                controller.enqueue(
                  encodeSSE({ type: "tool_call", tool: tc.tool, result: tc.result })
                );
                await new Promise((r) => setTimeout(r, 300));
              }
            }

            await streamTokens(controller, demoResponse.content);
          }

          controller.enqueue(encodeSSE({ type: "done" }));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encodeSSE({
              type: "error",
              message: err instanceof Error ? err.message : "Unknown error",
            })
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
