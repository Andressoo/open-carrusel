import { NextResponse } from "next/server";
import {
  getProjectsIndex,
  createProject,
  setActiveProject,
  deleteProject,
} from "@/lib/projects";

export async function GET() {
  const idx = await getProjectsIndex();
  return NextResponse.json(idx);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, description, icon } = body as {
      slug?: string;
      name?: string;
      description?: string;
      icon?: string;
    };
    if (!slug || !name) {
      return NextResponse.json(
        { error: "slug and name required" },
        { status: 400 }
      );
    }
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const project = await createProject(cleanSlug, name, description, icon);
    return NextResponse.json(project, { status: 201 });
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
    const { slug } = body as { slug?: string };
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    await setActiveProject(slug);
    const idx = await getProjectsIndex();
    return NextResponse.json(idx);
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
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    await deleteProject(slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
