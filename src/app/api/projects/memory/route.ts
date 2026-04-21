import { NextResponse } from "next/server";
import {
  getActiveProjectSlug,
  listMemoryFiles,
  readMemory,
  writeMemory,
  getProjectContext,
} from "@/lib/projects";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("project") || (await getActiveProjectSlug());
  const file = url.searchParams.get("file");
  if (file) {
    const content = await readMemory(slug, file);
    return NextResponse.json({ slug, file, content });
  }
  if (url.searchParams.get("context") === "1") {
    const context = await getProjectContext(slug);
    return NextResponse.json({ slug, context });
  }
  const files = await listMemoryFiles(slug);
  return NextResponse.json({ slug, files });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { project, file, content } = body as {
      project?: string;
      file?: string;
      content?: string;
    };
    const slug = project || (await getActiveProjectSlug());
    if (!file || content === undefined) {
      return NextResponse.json(
        { error: "file and content required" },
        { status: 400 }
      );
    }
    await writeMemory(slug, file, content);
    return NextResponse.json({ success: true, slug, file });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
