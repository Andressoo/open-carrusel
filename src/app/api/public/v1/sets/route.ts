/**
 * POST /api/public/v1/sets
 *   Crea un set para un comercio externo.
 *   Headers: Authorization: Bearer storu_<env>_<token>
 *   Body: { idea?: string, count?: number, prompt?: string }
 *         Si se pasa `idea` + `count` opcional, usa Claude CLI para generar.
 *         Si se pasa data directa (topic/goal/...), la crea sin AI.
 *
 * GET /api/public/v1/sets?status=draft&limit=50
 *   Lista sets del merchant autenticado.
 */

import { NextResponse } from "next/server";
import { validateAndConsumeApiKey, redactKey } from "@/lib/api-keys";
import { readData, writeData } from "@/lib/data";
import { generateId } from "@/lib/utils";
import type { ContentSet } from "@/types/content-set";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function err(reason: string, status: number) {
  return NextResponse.json({ error: reason, status }, { status });
}

type Store = { sets: ContentSet[] };

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const res = await validateAndConsumeApiKey(auth, "sets:read");
  if (!res.valid) return err(res.reason, res.status);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  const store = await readData<Store>("content-sets.json").catch(() => ({ sets: [] }));
  // merchants solo ven sets de su projectSlug
  const filtered = (store.sets || [])
    .filter((s) => !status || s.status === status)
    .slice(0, limit);

  return NextResponse.json({
    data: filtered.map((s) => ({
      id: s.id,
      name: s.name,
      topic: s.topic,
      goal: s.goal,
      archetype: s.archetype,
      ctaKeyword: s.ctaKeyword,
      status: s.status,
      publishDate: s.publishDate,
      publishOrder: s.publishOrder,
      createdAt: s.createdAt,
    })),
    meta: {
      merchantId: res.key.merchantId,
      returned: filtered.length,
      rateLimit: {
        remaining: res.key.rateLimit != null ? res.key.rateLimit - res.key.usage.todayRequests : null,
        resetAt: res.key.usage.todayResetAt,
      },
    },
  });
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const res = await validateAndConsumeApiKey(auth, "sets:create");
  if (!res.valid) return err(res.reason, res.status);

  const body = await request.json().catch(() => ({}));

  // Path 1: AI generation (si viene `idea`)
  if (body.idea) {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const aiRes = await fetch(`${base}/api/ai/generate-set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: body.idea }),
    });
    if (!aiRes.ok) return err("AI generation failed", 500);
    const brief = await aiRes.json();

    // persist the brief as a ContentSet
    const store = await readData<Store>("content-sets.json").catch(() => ({ sets: [] as ContentSet[] }));
    const now = new Date().toISOString();
    const set: ContentSet = {
      id: generateId(),
      name: brief.name || "Set sin nombre",
      topic: brief.topic || body.idea,
      goal: brief.goal || "capture",
      archetype: brief.archetype,
      ctaKeyword: brief.ctaKeyword,
      anchorBrand: brief.anchorBrand,
      thread: brief.thread,
      experimentPurpose: brief.experimentPurpose,
      hypothesis: brief.hypothesis,
      kpis: brief.kpis,
      sceneDetails: brief.sceneDetails,
      possibleCaptions: brief.possibleCaptions,
      hashtags: brief.hashtags,
      story: { id: null, type: "story", status: "pending" },
      carousel: { id: null, type: "carousel", status: "pending" },
      reel: { id: null, type: "reel", status: "pending" },
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    store.sets.push(set);
    await writeData("content-sets.json", store);

    return NextResponse.json({ data: set, meta: { key: redactKey(res.key) } }, { status: 201 });
  }

  // Path 2: direct creation (sin AI)
  if (!body.topic || !body.goal) {
    return err("Missing required: topic and goal (or provide `idea` for AI gen)", 400);
  }

  const store = await readData<Store>("content-sets.json").catch(() => ({ sets: [] as ContentSet[] }));
  const now = new Date().toISOString();
  const set: ContentSet = {
    id: generateId(),
    name: body.name || body.topic,
    topic: body.topic,
    goal: body.goal,
    archetype: body.archetype,
    ctaKeyword: body.ctaKeyword,
    anchorBrand: body.anchorBrand,
    thread: body.thread,
    experimentPurpose: body.experimentPurpose,
    hypothesis: body.hypothesis,
    kpis: body.kpis,
    sceneDetails: body.sceneDetails,
    possibleCaptions: body.possibleCaptions,
    hashtags: body.hashtags,
    references: body.references,
    story: { id: null, type: "story", status: "pending" },
    carousel: { id: null, type: "carousel", status: "pending" },
    reel: { id: null, type: "reel", status: "pending" },
    status: "draft",
    publishDate: body.publishDate,
    createdAt: now,
    updatedAt: now,
  };
  store.sets.push(set);
  await writeData("content-sets.json", store);

  return NextResponse.json({ data: set, meta: { key: redactKey(res.key) } }, { status: 201 });
}
