import { NextResponse } from "next/server";
import archiver from "archiver";
import path from "path";
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { readData } from "@/lib/data";
import { getCarousel } from "@/lib/carousels";
import { exportAllSlides } from "@/lib/export-slides";
import type { ContentSet } from "@/types/content-set";
import {
  resolvePublishOrder,
  formatPublishPlan,
  computeScheduleDates,
} from "@/lib/publish-order";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// cache the Remotion bundle across calls
let cachedBundle: string | null = null;
async function getBundle(): Promise<string> {
  if (cachedBundle) return cachedBundle;
  const entry = path.resolve(process.cwd(), "src/remotion/index.ts");
  cachedBundle = await bundle({ entryPoint: entry, webpackOverride: (c) => c });
  return cachedBundle;
}

type StoryFile = {
  stories: Array<{
    id: string;
    dynamic: string;
    text: string;
    options?: string[];
    correctAnswer?: number;
    targetDate?: string;
    swipeUrl?: string;
    accentColor?: string;
    bgColor?: string;
    setId?: string;
    createdAt: string;
  }>;
};
type ReelFile = {
  reels: Array<{
    id: string;
    template: string;
    props: Record<string, unknown>;
    duration: number;
    fps: number;
    aspectRatio: string;
  }>;
};
type SetFile = { sets: ContentSet[] };

function safeFilename(s: string) {
  return s.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const setsFile = await readData<SetFile>("content-sets.json").catch(
      () => ({ sets: [] })
    );
    const set = (setsFile.sets || []).find((s) => s.id === id);
    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    const warnings: string[] = [];
    const archive = archiver("zip", { zlib: { level: 5 } });
    const chunks: Buffer[] = [];
    archive.on("data", (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve, reject) => {
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);
    });

    // ══════ 1 · CAROUSEL · render all slides as PNG ══════
    if (set.carousel?.id) {
      try {
        const car = await getCarousel(set.carousel.id);
        if (car && car.slides.length) {
          const pngs = await exportAllSlides(car.slides, car.aspectRatio);
          for (const { name, buffer } of pngs) {
            archive.append(buffer, { name: `carrusel/${name}` });
          }
        } else {
          warnings.push("Carrusel existe pero no tiene slides.");
        }
      } catch (e) {
        warnings.push(`Carrusel falló: ${(e as Error).message}`);
      }
    } else {
      warnings.push("Carrusel pendiente · no incluido.");
    }

    // ══════ 2 · REEL · render MP4 via Remotion ══════
    if (set.reel?.id) {
      try {
        const reelsFile = await readData<ReelFile>("reels.json").catch(
          () => ({ reels: [] })
        );
        const reel = (reelsFile.reels || []).find((r) => r.id === set.reel.id);
        if (reel) {
          const outDir = path.resolve(process.cwd(), "public", "renders");
          if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
          const outPath = path.join(
            outDir,
            `export-${set.id.slice(0, 8)}-${Date.now()}.mp4`
          );
          const bundleLocation = await getBundle();
          const comp = await selectComposition({
            serveUrl: bundleLocation,
            id: reel.template,
            inputProps: reel.props as never,
          });
          await renderMedia({
            composition: comp,
            serveUrl: bundleLocation,
            codec: "h264",
            outputLocation: outPath,
            inputProps: reel.props as never,
          });
          const mp4 = await readFile(outPath);
          archive.append(mp4, { name: `reel/reel-${safeFilename(reel.template)}.mp4` });
          archive.append(
            JSON.stringify(reel, null, 2),
            { name: `reel/reel-props.json` }
          );
        } else {
          warnings.push("Reel linkeado pero archivo no encontrado.");
        }
      } catch (e) {
        warnings.push(`Reel falló: ${(e as Error).message}`);
      }
    } else {
      warnings.push("Reel pendiente · no incluido.");
    }

    // ══════ 3 · STORY · JSON + simple PNG preview ══════
    if (set.story?.id) {
      try {
        const storiesFile = await readData<StoryFile>("stories.json").catch(
          () => ({ stories: [] })
        );
        const story = (storiesFile.stories || []).find(
          (s) => s.id === set.story.id
        );
        if (story) {
          archive.append(JSON.stringify(story, null, 2), {
            name: `historia/historia.json`,
          });
          // Also a plain-text script for easy copy to IG Stories app
          const storyText = [
            `Dinámica: ${story.dynamic}`,
            `Texto: ${story.text}`,
            story.options ? `Opciones: ${story.options.join(" · ")}` : "",
            story.correctAnswer != null
              ? `Respuesta correcta: índice ${story.correctAnswer}`
              : "",
            story.targetDate ? `Fecha objetivo: ${story.targetDate}` : "",
            story.swipeUrl ? `Swipe URL: ${story.swipeUrl}` : "",
            `Colores: accent ${story.accentColor || "#F8C644"} · bg ${story.bgColor || "#0E0D12"}`,
          ]
            .filter(Boolean)
            .join("\n");
          archive.append(storyText, { name: `historia/historia.txt` });
        } else {
          warnings.push("Historia linkeada pero archivo no encontrado.");
        }
      } catch (e) {
        warnings.push(`Historia falló: ${(e as Error).message}`);
      }
    } else {
      warnings.push("Historia pendiente · no incluida.");
    }

    // ══════ 4 · CAPTIONS · ready to paste ══════
    const captionsText = [
      `# ${set.name}`,
      ``,
      `Topic: ${set.topic}`,
      set.anchorBrand ? `Ciudad / marca ancla: ${set.anchorBrand}` : "",
      `Goal: ${set.goal} · CTA keyword: ${set.ctaKeyword || "—"}`,
      ``,
      `═══════════════════════════════════════`,
      `HILO NARRATIVO`,
      `═══════════════════════════════════════`,
      set.thread || "—",
      ``,
      `═══════════════════════════════════════`,
      `CAPTIONS CANDIDATAS (${set.possibleCaptions?.length || 0})`,
      `═══════════════════════════════════════`,
      ...(set.possibleCaptions || []).map((c, i) => `\n─── Caption ${i + 1} ───\n${c}`),
      ``,
      `═══════════════════════════════════════`,
      `HASHTAGS (${set.hashtags?.length || 0})`,
      `═══════════════════════════════════════`,
      (set.hashtags || []).map((h) => `#${h.replace(/^#/, "")}`).join(" "),
      ``,
      `═══════════════════════════════════════`,
      `EXPERIMENTO`,
      `═══════════════════════════════════════`,
      set.experimentPurpose ? `Propósito: ${set.experimentPurpose}` : "",
      set.hypothesis ? `Hipótesis: ${set.hypothesis}` : "",
      set.kpis && set.kpis.length
        ? `KPIs:\n${set.kpis.map((k) => `  · ${k}`).join("\n")}`
        : "",
      set.sceneDetails ? `\nEscena: ${set.sceneDetails}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    archive.append(captionsText, { name: `captions.txt` });

    // ══════ 5 · README · instrucciones de publicación ══════
    // Resolver orden dinámico según archetype + goal (o usar el persistido)
    const order =
      set.publishOrder ||
      resolvePublishOrder(set.archetype || "", set.goal);
    const publishPlan = formatPublishPlan(order, set.publishDate?.slice(0, 10));

    const readme = [
      `# ${set.name}`,
      ``,
      `Set completo listo para publicar en Instagram.`,
      ``,
      `## Contenido del ZIP`,
      ``,
      `- \`carrusel/\` — PNGs numerados slide-01.png … slide-NN.png (4:5)`,
      `- \`reel/reel-*.mp4\` — Video vertical 1080×1920 listo para Reels`,
      `- \`historia/historia.json\` — Data de la historia con dinámica`,
      `- \`historia/historia.txt\` — Script plano para copiar a IG`,
      `- \`captions.txt\` — Captions, hashtags, hilo y datos del experimento`,
      ``,
      publishPlan,
      ``,
      `**Keyword única:** \`${set.ctaKeyword || "—"}\` · aparece en las 3 piezas.`,
      ``,
      `## CTA automatizada`,
      ``,
      `Configurá respuesta automática por DM cuando alguien comente la palabra \`${set.ctaKeyword || "KEYWORD"}\` en cualquiera de las 3 piezas.`,
      ``,
      warnings.length ? `\n## ⚠ Advertencias\n\n${warnings.map((w) => `- ${w}`).join("\n")}\n` : "",
      `---`,
      `Generado por Storu Studio · ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");
    archive.append(readme, { name: `README.md` });

    archive.finalize();
    const zipBuffer = await done;

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="set-${safeFilename(set.name)}.zip"`,
        "X-Warnings": warnings.length ? String(warnings.length) : "0",
      },
    });
  } catch (error) {
    console.error("Set export error:", error);
    return NextResponse.json(
      { error: `Export failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
