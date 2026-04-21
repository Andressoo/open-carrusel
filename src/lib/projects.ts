import { readFile, writeFile, mkdir, readdir, rm } from "fs/promises";
import path from "path";
import { Mutex } from "async-mutex";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PROJECTS_DIR = path.join(DATA_DIR, "projects");
const PROJECTS_INDEX = path.join(DATA_DIR, "projects.json");
const mutexes = new Map<string, Mutex>();

function getMutex(key: string): Mutex {
  let m = mutexes.get(key);
  if (!m) {
    m = new Mutex();
    mutexes.set(key, m);
  }
  return m;
}

export type Project = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
};

export type ProjectsIndex = {
  active: string;
  projects: Project[];
};

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true });
}

export async function getProjectsIndex(): Promise<ProjectsIndex> {
  try {
    const raw = await readFile(PROJECTS_INDEX, "utf-8");
    return JSON.parse(raw);
  } catch {
    const fallback: ProjectsIndex = {
      active: "default",
      projects: [
        {
          slug: "default",
          name: "Nuevo proyecto",
          description: "Proyecto en blanco",
          icon: "📁",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    await writeProjectsIndex(fallback);
    return fallback;
  }
}

export async function writeProjectsIndex(idx: ProjectsIndex): Promise<void> {
  const mutex = getMutex("index");
  await mutex.runExclusive(async () => {
    await ensureDir(DATA_DIR);
    const tmp = PROJECTS_INDEX + ".tmp";
    await writeFile(tmp, JSON.stringify(idx, null, 2), "utf-8");
    const { rename } = await import("fs/promises");
    await rename(tmp, PROJECTS_INDEX);
  });
}

export async function getActiveProjectSlug(): Promise<string> {
  const idx = await getProjectsIndex();
  return idx.active;
}

export function getProjectDir(slug: string): string {
  return path.join(PROJECTS_DIR, slug);
}

export async function ensureProjectDir(slug: string): Promise<void> {
  const dir = getProjectDir(slug);
  await ensureDir(dir);
  await ensureDir(path.join(dir, "memory"));
  await ensureDir(path.join(dir, "chats"));
}

/**
 * Read data file scoped to active project.
 * Used by carousels.ts, brand.ts etc. (migration from /data/[file] to /data/projects/[slug]/[file])
 */
export async function readProjectData<T>(filename: string, fallback?: T): Promise<T> {
  const slug = await getActiveProjectSlug();
  const filePath = path.join(getProjectDir(slug), filename);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT" && fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export async function writeProjectData<T>(filename: string, data: T): Promise<void> {
  const slug = await getActiveProjectSlug();
  await ensureProjectDir(slug);
  const mutex = getMutex(`${slug}:${filename}`);
  await mutex.runExclusive(async () => {
    const filePath = path.join(getProjectDir(slug), filename);
    const tmp = filePath + ".tmp";
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    const { rename } = await import("fs/promises");
    await rename(tmp, filePath);
  });
}

export async function createProject(
  slug: string,
  name: string,
  description?: string,
  icon?: string
): Promise<Project> {
  const idx = await getProjectsIndex();
  if (idx.projects.find((p) => p.slug === slug)) {
    throw new Error(`Project slug already exists: ${slug}`);
  }
  const project: Project = {
    slug,
    name,
    description,
    icon: icon || "📁",
    createdAt: new Date().toISOString(),
  };
  idx.projects.push(project);
  await writeProjectsIndex(idx);
  await ensureProjectDir(slug);
  // Seed empty files
  const dir = getProjectDir(slug);
  const seeds: Array<[string, object]> = [
    ["brand.json", {
      name: name,
      colors: { primary: "#0E0D12", secondary: "#5635FD", accent: "#F8C644", background: "#FFFFFF", surface: "#F3EFE6" },
      fonts: { heading: "Poppins", body: "Poppins" },
      customFonts: [],
      logoPath: null,
      styleKeywords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }],
    ["carousels.json", { carousels: [] }],
    ["templates.json", { templates: [] }],
    ["style-presets.json", { presets: [] }],
    ["staged-actions.json", { staged: [] }],
  ];
  for (const [fname, content] of seeds) {
    const fp = path.join(dir, fname);
    await writeFile(fp, JSON.stringify(content, null, 2), "utf-8");
  }
  // Seed memory file
  await writeFile(
    path.join(dir, "memory", "brand-context.md"),
    `# ${name} · Brand Memory\n\nEste archivo lo lee Claude al abrir este proyecto. Agregá aquí contexto de marca, tono, casos, decisiones.\n\n## Identidad\n\n- \n\n## Paleta\n\n- Primary: #0E0D12\n- Accent: #F8C644\n\n## Voz de marca\n\n- \n\n## Enemigos\n\n- \n\n## Casos / marcas ancla\n\n- \n`,
    "utf-8"
  );
  return project;
}

export async function setActiveProject(slug: string): Promise<void> {
  const idx = await getProjectsIndex();
  const project = idx.projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Project not found: ${slug}`);
  idx.active = slug;
  await writeProjectsIndex(idx);
}

export async function deleteProject(slug: string): Promise<void> {
  if (slug === "default") throw new Error("Cannot delete default project");
  const idx = await getProjectsIndex();
  idx.projects = idx.projects.filter((p) => p.slug !== slug);
  if (idx.active === slug) idx.active = "default";
  await writeProjectsIndex(idx);
  try {
    await rm(getProjectDir(slug), { recursive: true, force: true });
  } catch {}
}

export async function listMemoryFiles(slug: string): Promise<string[]> {
  const dir = path.join(getProjectDir(slug), "memory");
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

export async function readMemory(slug: string, filename: string): Promise<string> {
  const fp = path.join(getProjectDir(slug), "memory", filename);
  try {
    return await readFile(fp, "utf-8");
  } catch {
    return "";
  }
}

export async function writeMemory(slug: string, filename: string, content: string): Promise<void> {
  const mutex = getMutex(`memory:${slug}:${filename}`);
  await mutex.runExclusive(async () => {
    await ensureProjectDir(slug);
    const memDir = path.join(getProjectDir(slug), "memory");
    await ensureDir(memDir);
    await writeFile(path.join(memDir, filename), content, "utf-8");
  });
}

/**
 * Get full project context for AI (brand + memory concatenated).
 * Injected into Claude system prompt.
 */
export async function getProjectContext(slug?: string): Promise<string> {
  const s = slug || (await getActiveProjectSlug());
  const dir = getProjectDir(s);
  const parts: string[] = [];
  parts.push(`# Proyecto activo: ${s}`);
  try {
    const brand = await readFile(path.join(dir, "brand.json"), "utf-8");
    parts.push(`\n## Brand config\n\`\`\`json\n${brand}\n\`\`\``);
  } catch {}
  const memFiles = await listMemoryFiles(s);
  for (const f of memFiles) {
    const content = await readMemory(s, f);
    if (content) parts.push(`\n## Memory: ${f}\n\n${content}`);
  }
  return parts.join("\n");
}
