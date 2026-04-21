import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { Mutex } from "async-mutex";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PROJECTS_INDEX = path.join(DATA_DIR, "projects.json");
const mutexes = new Map<string, Mutex>();

function getMutex(filename: string): Mutex {
  let mutex = mutexes.get(filename);
  if (!mutex) {
    mutex = new Mutex();
    mutexes.set(filename, mutex);
  }
  return mutex;
}

/**
 * Resolve the project-scoped file path if projects.json exists.
 * Falls back to legacy /data/[file] for backwards compatibility.
 */
async function resolveFilePath(filename: string): Promise<string> {
  // Project-agnostic files stay at root
  if (filename === "projects.json") return path.join(DATA_DIR, filename);
  try {
    const raw = await readFile(PROJECTS_INDEX, "utf-8");
    const idx = JSON.parse(raw) as { active: string };
    if (idx?.active) {
      return path.join(DATA_DIR, "projects", idx.active, filename);
    }
  } catch {
    // projects.json missing → legacy mode
  }
  return path.join(DATA_DIR, filename);
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readData<T>(filename: string): Promise<T> {
  const filePath = await resolveFilePath(filename);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Data file not found: ${filename}`);
    }
    if (err instanceof SyntaxError) {
      throw new Error(`Data file corrupted: ${filename} — ${err.message}`);
    }
    throw err;
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  const mutex = getMutex(filename);
  await mutex.runExclusive(async () => {
    await ensureDataDir();
    const filePath = await resolveFilePath(filename);
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = filePath + ".tmp";
    await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    await rename(tmpPath, filePath);
  });
}

export async function readDataSafe<T>(filename: string, fallback: T): Promise<T> {
  try {
    return await readData<T>(filename);
  } catch {
    return fallback;
  }
}
