import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/data";
import { generateId } from "@/lib/utils";

type Reel = {
  id: string;
  template: string;
  props: Record<string, unknown>;
  duration: number;
  fps: number;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
};

type ReelsStore = { reels: Reel[] };

async function getStore(): Promise<ReelsStore> {
  try {
    return await readData<ReelsStore>("reels.json");
  } catch {
    return { reels: [] };
  }
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template, props, duration, fps, aspectRatio } = body as {
      template?: string;
      props?: Record<string, unknown>;
      duration?: number;
      fps?: number;
      aspectRatio?: string;
    };
    if (!template || !props) {
      return NextResponse.json(
        { error: "template and props required" },
        { status: 400 }
      );
    }
    const store = await getStore();
    const now = new Date().toISOString();
    const reel: Reel = {
      id: generateId(),
      template,
      props,
      duration: duration ?? 10,
      fps: fps ?? 30,
      aspectRatio: aspectRatio ?? "9:16",
      createdAt: now,
      updatedAt: now,
    };
    store.reels.push(reel);
    await writeData("reels.json", store);
    return NextResponse.json(reel, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
