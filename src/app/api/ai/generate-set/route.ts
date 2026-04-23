import { NextResponse } from "next/server";
import { getProjectContext } from "@/lib/projects";
import { generateText, AIProviderError } from "@/lib/ai-provider";

export const maxDuration = 120;

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
      "template": "TikTokHook|BeforeAfter|ViralManifesto60s|GlitchIntro|StatDrop|SplitScreen|Typewriter|PosterSlam",
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
    const userPrompt = `${projectContext}\n\n---\n\nMERCHANT IDEA:\n${idea}\n\nGenerate the complete ContentSet brief as JSON. No prose. JSON only.`;

    let text: string;
    try {
      text = await generateText(
        [{ role: "user", content: userPrompt }],
        { system: SYSTEM, maxTokens: 4096, temperature: 0.7 }
      );
    } catch (e) {
      if (e instanceof AIProviderError) {
        return NextResponse.json(
          {
            error: e.message,
            cause: e.cause,
            fix: e.fixInstructions,
          },
          { status: 503 }
        );
      }
      throw e;
    }

    // Extract JSON from response (may be wrapped in ```json fence)
    let jsonStr = text.trim();
    const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) jsonStr = codeMatch[1].trim();
    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) jsonStr = braceMatch[0];

    try {
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(
        {
          error: "Could not parse AI response",
          raw: text.slice(0, 500),
        },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
