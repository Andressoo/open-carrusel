import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/data";
import { generateId } from "@/lib/utils";

type Story = {
  id: string;
  /** Tipo de sticker/dynamic · poll, quiz, countdown, qa, slider, ba, swipe */
  dynamic: string;
  /** Texto principal · question o hook */
  text: string;
  /** Para poll/quiz · opciones */
  options?: string[];
  /** Para poll binary · Si/No · Quiz respuesta correcta (index) */
  correctAnswer?: number;
  /** Para countdown · fecha objetivo ISO */
  targetDate?: string;
  /** Para swipe-up · URL destino + UTM */
  swipeUrl?: string;
  /** Visual · color accent */
  accentColor?: string;
  bgColor?: string;
  /** Imagen de fondo · si aplica */
  bgImage?: string;
  /** Set al que pertenece · opcional */
  setId?: string;
  createdAt: string;
  updatedAt: string;
};

type Store = { stories: Story[] };

async function getStore(): Promise<Store> {
  try {
    return await readData<Store>("stories.json");
  } catch {
    return { stories: [] };
  }
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Story>;
    const { dynamic, text } = body;
    if (!dynamic || !text) {
      return NextResponse.json(
        { error: "dynamic and text required" },
        { status: 400 }
      );
    }
    const store = await getStore();
    const now = new Date().toISOString();
    const story: Story = {
      id: generateId(),
      dynamic,
      text,
      options: body.options,
      correctAnswer: body.correctAnswer,
      targetDate: body.targetDate,
      swipeUrl: body.swipeUrl,
      accentColor: body.accentColor || "#F8C644",
      bgColor: body.bgColor || "#0E0D12",
      bgImage: body.bgImage,
      setId: body.setId,
      createdAt: now,
      updatedAt: now,
    };
    store.stories.push(story);
    await writeData("stories.json", store);
    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
