import { NextResponse } from "next/server";
import { getProjectContext } from "@/lib/projects";
import { generateTextStream, AIProviderError } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

const SYSTEM = `You are Storu Studio's bulk content generation engine.

The user will describe a theme, audience, or series. You produce N complete ContentSet briefs (N specified or inferred from the prompt, default 10, max 30).

IMPORTANT OUTPUT FORMAT:
- Emit JSON Lines (NDJSON) inside a single \`\`\`jsonl fence.
- Each line must be a complete, valid JSON object.
- No prose, no comments, no explanations outside the code fence.

Each ContentSet object:
{
  "name": "Short display name (max 70 chars)",
  "topic": "One-liner central theme",
  "goal": "capture|valley|ticket|recompra|launch|validate|cashflow|autority",
  "archetype": "provocation|case-study|contrarian|myth-bust|listicle|framework|vs|step-by-step|data-drop|before-after|story-arc|launch|manifesto",
  "ctaKeyword": "ONE UPPERCASE KEYWORD max 12 chars",
  "anchorBrand": "City or business archetype · null if none",
  "thread": "2-3 sentence narrative arc with framework name",
  "experimentPurpose": "Testable purpose · what to measure",
  "hypothesis": "If X then Y · measurable",
  "kpis": ["3-5 specific KPIs with targets"],
  "sceneDetails": "Location + mood + props + light + tone (Colombian)",
  "possibleCaptions": ["5 caption variations in Colombian Spanish, max 220 chars"],
  "hashtags": ["8-10 hashtags without # prefix"]
}

RULES:
- Each set distinct · no repetition of topic/archetype across the batch.
- Colombian market: use real cities (Bogotá, Medellín, Cartagena, Barranquilla, Cali, Bucaramanga, Pereira, Santa Marta).
- Diversify frameworks across the batch (AIDA, PAS, BAB, Hook-Story-Offer, SB7, 4P, 4U, FAB, Pattern-Interrupt, Contrast).
- Every ctaKeyword unique across the batch.
- Use "Comentá" (voseo) or "Comentá" style · Colombian.

Output ONLY the \`\`\`jsonl fence with JSON Lines.`;

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, count = 10 } = body as { prompt?: string; count?: number };
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const n = Math.min(Math.max(parseInt(String(count)) || 10, 1), 30);
  const projectContext = await getProjectContext();
  const userPrompt = `${projectContext}\n\n---\n\nUSER REQUEST:\n${prompt}\n\nGenerate exactly ${n} distinct ContentSets as JSON Lines inside a single \`\`\`jsonl fence. No prose before or after the fence.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("start", { count: n });

      let fullText = "";
      let setsEmitted = 0;
      const seen = new Set<string>();

      const persistSet = async (obj: Record<string, unknown>) => {
        const name = obj.name as string;
        if (!name || seen.has(name)) return;
        seen.add(name);

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
          send("error", {
            message: `Persist fail: ${(e as Error).message}`,
            name,
          });
        }
      };

      const tryParseBatch = async (text: string) => {
        const fenceMatch = text.match(/```(?:jsonl|json)?\s*([\s\S]*?)```/i);
        const payload = fenceMatch ? fenceMatch[1] : text;

        // Line-by-line parsing
        for (const line of payload.split("\n")) {
          const t = line.trim();
          if (!t || !t.startsWith("{")) continue;
          try {
            const obj = JSON.parse(t);
            if (obj.name && obj.topic) await persistSet(obj);
          } catch {
            /* partial line */
          }
        }

        // Also try array format
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
        } catch {
          /* skip */
        }
      };

      try {
        await generateTextStream(
          [{ role: "user", content: userPrompt }],
          (chunk) => {
            fullText += chunk;
          },
          { system: SYSTEM, maxTokens: 8192, temperature: 0.7 }
        );

        await tryParseBatch(fullText);

        if (setsEmitted === 0) {
          send("error", {
            message: `No se pudo extraer JSON de la respuesta. Texto: ${fullText.slice(0, 500)}`,
          });
        }
        send("done", { emitted: setsEmitted, requested: n });
      } catch (e) {
        if (e instanceof AIProviderError) {
          send("error", {
            message: `AI provider: ${e.message}`,
            fix: e.fixInstructions,
          });
        } else {
          send("error", { message: (e as Error).message });
        }
        send("done", { emitted: setsEmitted, requested: n });
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
