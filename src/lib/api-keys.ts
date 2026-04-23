/**
 * API keys para que comercios del marketplace consuman Storu desde sus sistemas.
 *
 * Cada comercio recibe 1-N API keys. Cada key:
 *  - tiene un dueño (merchantId del marketplace)
 *  - apunta a un proyecto específico (memory brand aislada)
 *  - tiene rate limit (requests por día)
 *  - trackea uso (req count, último uso)
 *  - puede revocarse
 *
 * Se almacenan en /data/api-keys.json con async-mutex.
 * Formato del token: `storu_live_<32-char-random>` para prod,
 *                    `storu_test_<32-char-random>` para sandbox.
 */

import crypto from "crypto";
import { readData, writeData } from "@/lib/data";

export type ApiKey = {
  /** El token que el comercio envía como Bearer. Unique. */
  key: string;
  /** Id del comercio en tu marketplace (externalId) */
  merchantId: string;
  /** Nombre descriptivo (ej: "Tienda La Esquina · producción") */
  name: string;
  /** Slug del proyecto Storu que usa (brand memory, sets scope) */
  projectSlug: string;
  /** Ambiente · live (billable) vs test (sandbox free) */
  env: "live" | "test";
  /** Rate limit · máximo de requests por día (null = sin límite) */
  rateLimit: number | null;
  /** Status · active / revoked */
  status: "active" | "revoked";
  /** Uso acumulado */
  usage: {
    totalRequests: number;
    lastUsedAt: string | null;
    todayRequests: number;
    todayResetAt: string;
  };
  /** Qué endpoints puede llamar · si null = todos */
  scopes: Array<
    | "sets:read"
    | "sets:create"
    | "sets:generate"
    | "sets:export"
    | "*"
  > | null;
  createdAt: string;
  updatedAt: string;
};

type Store = { keys: ApiKey[] };

async function getStore(): Promise<Store> {
  try {
    return await readData<Store>("api-keys.json");
  } catch {
    return { keys: [] };
  }
}

function generateToken(env: "live" | "test"): string {
  const random = crypto.randomBytes(24).toString("base64url");
  return `storu_${env}_${random}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Crea un nuevo API key para un comercio */
export async function createApiKey(input: {
  merchantId: string;
  name: string;
  projectSlug: string;
  env?: "live" | "test";
  rateLimit?: number | null;
  scopes?: ApiKey["scopes"];
}): Promise<ApiKey> {
  const store = await getStore();
  const now = new Date().toISOString();
  const env = input.env || "test";
  const key: ApiKey = {
    key: generateToken(env),
    merchantId: input.merchantId,
    name: input.name,
    projectSlug: input.projectSlug,
    env,
    rateLimit: input.rateLimit ?? (env === "test" ? 50 : 1000),
    status: "active",
    usage: {
      totalRequests: 0,
      lastUsedAt: null,
      todayRequests: 0,
      todayResetAt: today(),
    },
    scopes: input.scopes || null,
    createdAt: now,
    updatedAt: now,
  };
  store.keys.push(key);
  await writeData("api-keys.json", store);
  return key;
}

/** Lista todas las keys (para UI admin, nunca expuesto via API pública) */
export async function listApiKeys(): Promise<ApiKey[]> {
  const store = await getStore();
  return store.keys;
}

/** Revoca una key */
export async function revokeApiKey(keyStr: string): Promise<boolean> {
  const store = await getStore();
  const k = store.keys.find((x) => x.key === keyStr);
  if (!k) return false;
  k.status = "revoked";
  k.updatedAt = new Date().toISOString();
  await writeData("api-keys.json", store);
  return true;
}

/**
 * Valida un Bearer token y retorna la key (o null si inválida/rate-limited).
 * También incrementa el contador de uso y resetea contadores diarios si cambió el día.
 */
export type ApiScope = "sets:read" | "sets:create" | "sets:generate" | "sets:export" | "*";

export async function validateAndConsumeApiKey(
  token: string,
  requiredScope?: ApiScope
): Promise<{ valid: true; key: ApiKey } | { valid: false; reason: string; status: number }> {
  if (!token) return { valid: false, reason: "Missing Authorization header", status: 401 };
  const clean = token.replace(/^Bearer\s+/i, "").trim();
  if (!clean) return { valid: false, reason: "Empty Bearer token", status: 401 };

  const store = await getStore();
  const k = store.keys.find((x) => x.key === clean);
  if (!k) return { valid: false, reason: "Invalid API key", status: 401 };
  if (k.status !== "active") return { valid: false, reason: "API key revoked", status: 403 };

  // Reset daily counter if new day
  const now = new Date().toISOString();
  if (k.usage.todayResetAt !== today()) {
    k.usage.todayRequests = 0;
    k.usage.todayResetAt = today();
  }

  // Rate limit check
  if (k.rateLimit != null && k.usage.todayRequests >= k.rateLimit) {
    return {
      valid: false,
      reason: `Rate limit exceeded · ${k.rateLimit} requests/day`,
      status: 429,
    };
  }

  // Scope check
  if (requiredScope && k.scopes && !k.scopes.includes("*") && !k.scopes.includes(requiredScope)) {
    return {
      valid: false,
      reason: `Missing scope '${requiredScope}'`,
      status: 403,
    };
  }

  // Consume
  k.usage.todayRequests++;
  k.usage.totalRequests++;
  k.usage.lastUsedAt = now;
  k.updatedAt = now;
  await writeData("api-keys.json", store);

  return { valid: true, key: k };
}

/** Summary público de una key (para mostrar en UI sin leakear el token entero) */
export function redactKey(k: ApiKey) {
  return {
    prefix: k.key.slice(0, 15) + "…" + k.key.slice(-4),
    merchantId: k.merchantId,
    name: k.name,
    projectSlug: k.projectSlug,
    env: k.env,
    status: k.status,
    rateLimit: k.rateLimit,
    usage: k.usage,
    scopes: k.scopes,
    createdAt: k.createdAt,
  };
}
