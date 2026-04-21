import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { mkdir } from "fs/promises";

// Next.js longer timeout for video rendering
export const maxDuration = 300;

let cachedBundle: string | null = null;

async function getBundle(): Promise<string> {
  if (cachedBundle) return cachedBundle;
  const entry = path.resolve(process.cwd(), "src/remotion/index.ts");
  cachedBundle = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => config,
  });
  return cachedBundle;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template, props, reelId } = body as {
      template?: string;
      props?: Record<string, unknown>;
      reelId?: string;
    };
    if (!template) {
      return NextResponse.json({ error: "template required" }, { status: 400 });
    }

    const outDir = path.resolve(process.cwd(), "public", "renders");
    await mkdir(outDir, { recursive: true });
    const filename = `${reelId || template}-${Date.now()}.mp4`;
    const outPath = path.join(outDir, filename);

    const bundleLocation = await getBundle();
    const comp = await selectComposition({
      serveUrl: bundleLocation,
      id: template,
      inputProps: props as never,
    });

    await renderMedia({
      composition: comp,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outPath,
      inputProps: props as never,
    });

    return NextResponse.json({
      success: true,
      url: `/renders/${filename}`,
      filename,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "render failed" },
      { status: 500 }
    );
  }
}
