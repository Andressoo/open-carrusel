/**
 * POST /api/ai/generate-image
 * Body: { prompt: string, style?: "storu" | "raw", model?: string }
 * → { url, model } · la imagen queda en /uploads/ai/ lista para usarse
 *   en slides, references o bgImage de reels.
 */

import { NextResponse } from "next/server";
import { generateImage, storuStylePrefix } from "@/lib/image-gen";
import { AIProviderError } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { prompt, style = "storu", model } = body as {
    prompt?: string;
    style?: "storu" | "raw";
    model?: string;
  };

  if (!prompt || prompt.trim().length < 5) {
    return NextResponse.json(
      { error: "prompt required (min 5 chars)" },
      { status: 400 }
    );
  }

  try {
    const image = await generateImage({
      prompt: prompt.trim(),
      stylePrefix: style === "storu" ? storuStylePrefix() : undefined,
      model,
    });
    return NextResponse.json({ url: image.url, model: image.model });
  } catch (err) {
    if (err instanceof AIProviderError) {
      return NextResponse.json(
        { error: err.message, cause: err.cause, fix: err.fixInstructions },
        { status: err.message.includes("(402)") ? 402 : 502 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
