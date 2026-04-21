import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { getClaudePath } from "@/lib/claude-path";
import { getProjectContext } from "@/lib/projects";

export const maxDuration = 120;

/**
 * POST /api/ai/generate-set
 *
 * Takes a single-line idea and returns a fully-filled ContentSet brief:
 *  - topic, goal, archetype, name
 *  - thread, ctaKeyword, anchorBrand
 *  - experimentPurpose, hypothesis, kpis
 *  - sceneDetails, possibleCaptions (5), hashtags (10)
 *  - publishSchedule (story, carousel, reel fechas sugeridas)
 *  - publishStrategy (qué publicar primero, cadencia)
 *
 * Uses Claude CLI with project memory injected. Returns structured JSON.
 */

const SYSTEM = `You are Storu Studio's content strategy engine. When given a merchant's idea, you produce a complete Content Set brief that includes 3 coherent pieces (Story + Carousel + Reel) plus caption variants, hashtags, and publication strategy.

CRITICAL OUTPUT FORMAT: Return ONLY valid JSON matching this exact schema:
{
  "name": "Short display name (max 60 chars)",
  "topic": "One-liner central theme",
  "goal": "capture|valley|ticket|recompra|launch|validate|cashflow|autority",
  "archetype": "provocation|case-study|contrarian|myth-bust|listicle|framework|story-arc|step-by-step|data-drop|before-after",
  "ctaKeyword": "ONE UPPERCASE KEYWORD (max 12 chars)",
  "anchorBrand": "Named brand from project memory if applicable, else null",
  "thread": "2-3 sentence narrative arc that connects the 3 pieces",
  "experimentPurpose": "Testable hypothesis with metric",
  "hypothesis": "If X then Y measurable",
  "kpis": ["3-5 specific KPIs to measure"],
  "sceneDetails": "Location, mood, props, lighting, people for the shoot",
  "possibleCaptions": ["5 caption variants under 220 chars each, Spanish Colombian"],
  "hashtags": ["8-12 hashtags without # prefix, mix niche + location + general"],
  "publishStrategy": {
    "order": ["story-first" | "carousel-first" | "reel-first"],
    "cadence": "Daily sequence recommendation",
    "bestDayTime": "Day of week + hour recommendation with reasoning"
  },
  "pieces": {
    "story": {
      "dynamic": "poll|quiz|countdown|qa|swipe|slider|ba",
      "text": "Main question/hook",
      "options": ["2-4 options if poll/quiz", "else null"],
      "angle": "What this story accomplishes in the funnel"
    },
    "carousel": {
      "slides": 5,
      "hookText": "Slide 1 headline max 60 chars",
      "insight": "Slide 2-3 insight",
      "proofPoint": "Slide 4 data/case",
      "ctaText": "Slide 5 CTA with keyword"
    },
    "reel": {
      "template": "TikTokHook|BeforeAfter|ViralManifesto60s",
      "duration": 10,
      "hook": "0-2s hook",
      "body": "2-6s body",
      "cta": "6-10s CTA"
    }
  }
}

Apply project memory to every field: use brand colors, voice, anchor brands from memory. Write in Spanish (Colombian if the project is Colombian). Be concrete, not generic.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea } = body as { idea?: string };
    if (!idea) {
      return NextResponse.json({ error: "idea required" }, { status: 400 });
    }

    const projectContext = await getProjectContext();
    const fullPrompt = `${projectContext}\n\n---\n\nMERCHANT IDEA:\n${idea}\n\nGenerate the complete ContentSet brief as JSON.`;

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

    return new Promise<Response>((resolve) => {
      const child = spawn(claudePath, args);
      let fullText = "";
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill();
          resolve(
            NextResponse.json(
              { error: "timeout · AI took too long (>90s)" },
              { status: 504 }
            )
          );
        }
      }, 90_000);

      child.stdout.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.type === "content_block_delta" && obj.delta?.text) {
              fullText += obj.delta.text;
            } else if (
              obj.type === "assistant" &&
              obj.message?.content
            ) {
              for (const block of obj.message.content) {
                if (block.type === "text" && block.text) {
                  fullText += block.text;
                }
              }
            }
          } catch {
            /* ignore non-json lines */
          }
        }
      });

      child.on("close", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        // Extract JSON from Claude's response · may be wrapped in ```json ... ```
        let jsonStr = fullText.trim();
        const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeMatch) jsonStr = codeMatch[1].trim();
        // Try to find {...} if wrapped in text
        const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];

        try {
          const parsed = JSON.parse(jsonStr);
          resolve(NextResponse.json(parsed));
        } catch (e) {
          resolve(
            NextResponse.json(
              { error: "Could not parse AI response", raw: fullText.slice(0, 500) },
              { status: 500 }
            )
          );
        }
      });

      child.on("error", (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        resolve(
          NextResponse.json(
            { error: "claude CLI failed: " + err.message },
            { status: 500 }
          )
        );
      });
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
