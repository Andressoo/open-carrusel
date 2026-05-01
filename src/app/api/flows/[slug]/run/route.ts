/**
 * POST /api/flows/[slug]/run
 *
 * Dispara un flow manualmente · returns runId.
 * Ejecución asíncrona · cliente hace polling de /api/flow-runs/[runId].
 *
 * Body opcional: { triggerData: {...} } pasa al run como trigger context.
 */

import { NextResponse } from "next/server";
import { startFlow } from "@/lib/flows/engine";
// Side-effect: registra todos los handlers built-in
import "@/lib/flows/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const triggerData = (body as { triggerData?: Record<string, unknown> }).triggerData;

  try {
    // MVP: ejecuta sincrónicamente · production: spawn worker async
    const run = await startFlow(slug, "manual", triggerData);
    return NextResponse.json(
      {
        runId: run.id,
        status: run.status,
        flowSlug: run.flowSlug,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        steps: Object.fromEntries(
          Object.entries(run.steps).map(([id, r]) => [
            id,
            { status: r.status, error: r.error },
          ])
        ),
        error: run.error,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
