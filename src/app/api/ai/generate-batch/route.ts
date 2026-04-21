import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { getClaudePath, isClaudeAvailable } from "@/lib/claude-path";
import { getProjectContext } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600; // up to 10 min for large batches

const SYSTEM = `You are Storu Studio's bulk content generation engine.

The user will describe a theme, audience, or series. You produce a JSON array of N complete ContentSet briefs (N specified or inferred from the prompt, default 10, max 30).

IMPORTANT OUTPUT FORMAT:
- Emit one JSON object per line (NDJSON / JSON Lines format).
- Wrap the entire output in \`\`\`jsonl ... \`\`\` fence for easy parsing.
- Each line must be a complete, valid JSON object matching the ContentSet schema below.
- No prose, no comments, no explanations outside the code fence.

Each ContentSet object:
{
  "name": "Short display name (max 70 chars, descriptive)",
  "topic": "One-liner central theme",
  "goal": "capture|valley|ticket|recompra|launch|validate|cashflow|autority",
  "archetype": "provocation|case-study|contrarian|myth-bust|listicle|framework|vs|step-by-step|data-drop|before-after|story-arc|launch|manifesto",
  "ctaKeyword": "ONE UPPERCASE KEYWORD max 12 chars",
  "anchorBrand": "City or business archetype · null if none",
  "thread": "2-3 sentence narrative arc. State the framework used (AIDA, PAS, BAB, Hook-Story-Offer, SB7, 4P, 4U, FAB, Pattern-Interrupt, Contrast).",
  "experimentPurpose": "Testable purpose · what you're measuring and why it matters",
  "hypothesis": "If X then Y · measurable",
  "kpis": ["3-5 specific KPIs with targets where possible"],
  "sceneDetails": "Location + mood + props + light + tone (Colombian market context)",
  "possibleCaptions": ["5 caption variations in Colombian Spanish, max 220 chars each, following the chosen framework"],
  "hashtags": ["8-10 hashtags without # prefix, mix brand + niche + Colombian city + goal"],
  "pieces": {
    "carousel": {
      "slides": 5,
      "hookText": "Slide 1 headline max 60 chars",
      "insight": "Slide 2-3 insight with concrete example",
      "proofPoint": "Slide 4 case / number / stat",
      "ctaText": "Slide 5 CTA with the keyword"
    }
  }
}

RULES:
- Each set must be distinct · no repetition of topic/archetype across the batch
- Apply Colombian market voice: use real cities (Bogotá, Medellín, Cartagena, Barranquilla, Cali, Bucaramanga, Pereira, Santa Marta). Use "Comentá" form. Reference local businesses naturally.
- Diversify frameworks across the set · don't use AIDA for every item
- Diversify goals unless user specifies one
- Be concrete, not generic. Every ctaKeyword must be memorable and different across sets.
- Emit ONLY the JSON fence with JSON Lines. Nothing else.

Example output format:
\`\`\`jsonl
{"name":"D51 · Provocación · ...","topic":"...","goal":"autority",...}
{"name":"D52 · Case study · ...","topic":"...","goal":"capture",...}
\`\`\`
`;

export async function POST(request: Request) {
  if (!isClaudeAvailable()) {
    return NextResponse.json(
      { error: "Claude CLI not available" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { prompt, count = 10 } = body as { prompt?: string; count?: number };
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const n = Math.min(Math.max(parseInt(String(count)) || 10, 1), 30);
  const projectContext = await getProjectContext();

  const fullPrompt = `${projectContext}\n\n---\n\nUSER REQUEST:\n${prompt}\n\nGenerate exactly ${n} ContentSets as JSON Lines inside a single \`\`\`jsonl fence. No prose before or after the fence.`;

  const claudePath = getClaudePath();
  const args = [
    "-p",
    fullPrompt,
    "--output-format",
    "stream-json",
    "--include-partial-messages",
    "--verbose",
    "--append-system-prompt",
    SYSTEM,
  ];

  // Stream SSE back to client with progress events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("start", { count: n });

      const child = spawn(claudePath, args);
      let fullText = "";
      let setsEmitted = 0;
      const seenSignatures = new Set<string>();

      const persistSet = async (obj: Record<string, unknown>) => {
        const name = obj.name as string;
        const sig = `${name}|${obj.topic}`;
        if (seenSignatures.has(sig)) return;
        seenSignatures.add(sig);
        try {
          const base =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          const setRes = await fetch(`${base}/api/content-sets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: obj.topic,
              goal: obj.goal,
              archetype: obj.archetype,
              name,
              thread: obj.thread,
              ctaKeyword: obj.ctaKeyword,
              anchorBrand: (obj.anchorBrand as string) || undefined,
              experimentPurpose: obj.experimentPurpose,
              hypothesis: obj.hypothesis,
              kpis: obj.kpis,
              sceneDetails: obj.sceneDetails,
              possibleCaptions: obj.possibleCaptions,
              hashtags: obj.hashtags,
              status: "draft",
            }),
          });
          const set = await setRes.json();
          const cRes = await fetch(`${base}/api/carousels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, aspectRatio: "4:5" }),
          });
          const car = await cRes.json();
          await fetch(`${base}/api/content-sets`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: set.id,
              piece: "carousel",
              updates: { id: car.id, status: "draft" },
            }),
          });
          setsEmitted++;
          send("set", {
            index: setsEmitted,
            total: n,
            set: {
              id: set.id,
              name,
              goal: obj.goal,
              ctaKeyword: obj.ctaKeyword,
              anchorBrand: obj.anchorBrand,
            },
          });
        } catch (e) {
          send("error", { message: `Persist fail: ${(e as Error).message}`, name });
        }
      };

      // Extract JSON objects from accumulated text · tolerates fenced / unfenced output
      const tryParseBatch = async (text: string) => {
        // Strategy 1: find jsonl fence
        const fenceMatch = text.match(/```(?:jsonl|json)?\s*([\s\S]*?)```/i);
        const payload = fenceMatch ? fenceMatch[1] : text;

        // Strategy 2: line-by-line JSON objects
        const lines = payload.split("\n");
        for (const line of lines) {
          const t = line.trim();
          if (!t || !t.startsWith("{")) continue;
          try {
            const obj = JSON.parse(t);
            if (obj.name && obj.topic) await persistSet(obj);
          } catch { /* partial line */ }
        }

        // Strategy 3: scan for top-level JSON objects with regex balance
        const matches = payload.matchAll(/\{[\s\S]*?\n\}(?=\s*(?:\{|\n|$))/g);
        for (const m of matches) {
          try {
            const obj = JSON.parse(m[0]);
            if (obj.name && obj.topic) await persistSet(obj);
          } catch { /* skip */ }
        }

        // Strategy 4: array of objects
        try {
          const arrMatch = payload.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrMatch) {
            const arr = JSON.parse(arrMatch[0]);
            if (Array.isArray(arr)) {
              for (const obj of arr) {
                if (obj?.name && obj?.topic) await persistSet(obj);
              }
            }
          }
        } catch { /* skip */ }
      };

      child.stdout.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const rawLine of lines) {
          try {
            const evt = JSON.parse(rawLine);
            if (evt.type === "content_block_delta" && evt.delta?.text) {
              fullText += evt.delta.text;
            } else if (evt.type === "assistant" && evt.message?.content) {
              for (const block of evt.message.content) {
                if (block.type === "text" && block.text) {
                  fullText += block.text;
                }
              }
            }
          } catch {
            /* ignore */
          }
        }
      });

      child.on("close", async () => {
        await tryParseBatch(fullText);
        if (setsEmitted === 0) {
          send("error", {
            message: `Claude respondió pero no se pudo extraer JSON. Texto recibido: ${fullText.slice(0, 500)}`,
          });
        }
        send("done", { emitted: setsEmitted, requested: n });
        controller.close();
      });

      child.on("error", (err) => {
        send("error", { message: err.message });
        controller.close();
      });
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
