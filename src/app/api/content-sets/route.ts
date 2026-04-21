import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/data";
import { generateId } from "@/lib/utils";
import type { ContentSet } from "@/types/content-set";

type Store = { sets: ContentSet[] };

async function getStore(): Promise<Store> {
  try {
    return await readData<Store>("content-sets.json");
  } catch {
    return { sets: [] };
  }
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ContentSet>;
    const { topic, goal, name } = body;

    if (!topic || !goal) {
      return NextResponse.json(
        { error: "topic and goal required" },
        { status: 400 }
      );
    }

    const store = await getStore();
    const now = new Date().toISOString();
    const set: ContentSet = {
      id: generateId(),
      topic,
      goal,
      archetype: body.archetype,
      name: name || topic,
      thread: body.thread,
      ctaKeyword: body.ctaKeyword,
      anchorBrand: body.anchorBrand,
      experimentPurpose: body.experimentPurpose,
      hypothesis: body.hypothesis,
      kpis: body.kpis,
      sceneDetails: body.sceneDetails,
      paletteOverride: body.paletteOverride,
      possibleCaptions: body.possibleCaptions,
      hashtags: body.hashtags,
      references: body.references,
      publishDate: body.publishDate,
      status: body.status || "draft",
      story: { id: null, type: "story", status: "pending" },
      carousel: { id: null, type: "carousel", status: "pending" },
      reel: { id: null, type: "reel", status: "pending" },
      createdAt: now,
      updatedAt: now,
    };
    store.sets.push(set);
    await writeData("content-sets.json", store);
    return NextResponse.json(set, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, piece, updates } = body as {
      id?: string;
      piece?: "story" | "carousel" | "reel";
      updates?: Partial<ContentSet["story"]> & Partial<ContentSet>;
    };
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const store = await getStore();
    const idx = store.sets.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const set = store.sets[idx];
    if (piece) {
      set[piece] = { ...set[piece], ...(updates as ContentSet["story"]) };
    } else {
      Object.assign(set, updates);
    }
    set.updatedAt = new Date().toISOString();
    await writeData("content-sets.json", store);
    return NextResponse.json(set);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const store = await getStore();
    store.sets = store.sets.filter((s) => s.id !== id);
    await writeData("content-sets.json", store);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
