/**
 * POST /api/agent/chat
 *
 * Body: { idea: string }
 * Returns SSE stream:
 *   event: tool · data: {name, args}
 *   event: message · data: {text}
 *   event: done · data: {setId, finalText}
 *   event: error · data: {message}
 */

import { NextResponse } from "next/server";
import { runStoruAgent, type ChatTurn } from "@/lib/storu-agent";
import { getProjectContext } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

const MAX_HISTORY_TURNS = 20;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { idea, history } = body as { idea?: string; history?: ChatTurn[] };
  if (!idea || idea.length < 5) {
    return NextResponse.json({ error: "idea required" }, { status: 400 });
  }

  const safeHistory: ChatTurn[] = Array.isArray(history)
    ? history
        .filter(
          (t) =>
            t &&
            (t.role === "user" || t.role === "assistant") &&
            typeof t.content === "string"
        )
        .slice(-MAX_HISTORY_TURNS)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 4000) }))
    : [];

  const projectContext = await getProjectContext();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            )
          );
        } catch {
          /* controller may be closed */
        }
      };

      send("start", { idea });

      try {
        await runStoruAgent({
          idea,
          projectContext,
          history: safeHistory,
          onEvent: async (e) => {
            if (e.type === "item") {
              // Narrow item types for UI
              const item = e.data as { type?: string; name?: string; arguments?: unknown; output?: string; id?: string; content?: string };
              if (item.type === "function_call") {
                send("tool", {
                  name: item.name,
                  args: item.arguments,
                  id: item.id,
                });
              } else if (item.type === "function_call_output") {
                send("tool-result", {
                  id: item.id,
                  output: item.output,
                });
              } else if (item.type === "message") {
                send("message", {
                  id: item.id,
                  text: item.content,
                });
              } else if (item.type === "reasoning") {
                send("reasoning", {
                  id: item.id,
                  text: item.content,
                });
              }
            } else if (e.type === "done") {
              send("done", e.data);
            } else if (e.type === "error") {
              send("error", e.data);
            }
          },
        });
      } catch (err) {
        send("error", { message: (err as Error).message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
