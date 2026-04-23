/**
 * GET /api/public/v1/sets/:id/export
 *   Devuelve el ZIP completo del set (carrusel PNGs + reel MP4 +
 *   historia JSON + captions.txt + README.md).
 *   Consume el mismo código que /api/content-sets/[id]/export pero
 *   autenticado con API key.
 */

import { NextResponse } from "next/server";
import { validateAndConsumeApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = request.headers.get("authorization") || "";
  const res = await validateAndConsumeApiKey(auth, "sets:export");
  if (!res.valid) {
    return NextResponse.json({ error: res.reason }, { status: res.status });
  }

  // Reuse the internal export route by forwarding
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const internal = await fetch(`${base}/api/content-sets/${id}/export`, {
    method: "POST",
  });
  if (!internal.ok) {
    return NextResponse.json(
      { error: `Export failed: ${internal.status}` },
      { status: internal.status }
    );
  }

  const blob = await internal.arrayBuffer();
  return new Response(blob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition":
        internal.headers.get("content-disposition") ||
        `attachment; filename="set-${id}.zip"`,
      "X-Storu-Merchant": res.key.merchantId,
    },
  });
}
