/**
 * GET /api/metrics
 *
 * Benchmarks del producto calculados desde los datos reales.
 * North star: sets EXPORTADOS (contenido que salió del sistema hacia
 * publicación) · no sets creados (vanity).
 *
 * Funnel: brief → set creado → 3/3 piezas ready → agendado → exportado.
 * Cada etapa con conteo + tasa de conversión vs la etapa anterior.
 */

import { NextResponse } from "next/server";
import { readData } from "@/lib/data";
import type { ContentSet } from "@/types/content-set";

export const dynamic = "force-dynamic";

type SetWithMetrics = ContentSet & {
  exportedAt?: string;
  exportCount?: number;
};

type Store = { sets: SetWithMetrics[] };

const TARGETS = {
  completionRate: 0.9, // % de sets creados que llegan a 3/3 ready
  scheduleRate: 0.8, // % de sets ready que se agendan
  exportRate: 0.6, // % de sets ready que se exportan (north star proxy)
};

export async function GET() {
  const store = await readData<Store>("content-sets.json").catch(
    () => ({ sets: [] as SetWithMetrics[] })
  );
  const sets = store.sets || [];

  const created = sets.length;
  const complete = sets.filter(
    (s) => s.story?.id && s.carousel?.id && s.reel?.id
  ).length;
  const ready = sets.filter(
    (s) =>
      ["ready", "published"].includes(s.story?.status || "") &&
      ["ready", "published"].includes(s.carousel?.status || "") &&
      ["ready", "published"].includes(s.reel?.status || "")
  ).length;
  const scheduled = sets.filter((s) => s.publishDate).length;
  const exported = sets.filter((s) => s.exportedAt).length;
  const totalExports = sets.reduce((sum, s) => sum + (s.exportCount || 0), 0);

  const rate = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) / 100 : null;

  const completionRate = rate(complete, created);
  const scheduleRate = rate(scheduled, complete);
  const exportRate = rate(exported, ready || complete);

  return NextResponse.json({
    northStar: {
      metric: "sets exportados",
      description:
        "Un set exportado = contenido que salió del sistema listo para publicar. Es el proxy de valor real · un set que nunca se exporta nunca se publicó.",
      value: exported,
      totalExports,
    },
    funnel: {
      created,
      complete,
      ready,
      scheduled,
      exported,
    },
    rates: {
      completionRate: {
        value: completionRate,
        target: TARGETS.completionRate,
        ok: completionRate != null && completionRate >= TARGETS.completionRate,
        meaning: "sets creados que llegan a 3/3 piezas",
      },
      scheduleRate: {
        value: scheduleRate,
        target: TARGETS.scheduleRate,
        ok: scheduleRate != null && scheduleRate >= TARGETS.scheduleRate,
        meaning: "sets completos que se agendan",
      },
      exportRate: {
        value: exportRate,
        target: TARGETS.exportRate,
        ok: exportRate != null && exportRate >= TARGETS.exportRate,
        meaning: "sets listos que se exportan (north star)",
      },
    },
    generatedAt: new Date().toISOString(),
  });
}
