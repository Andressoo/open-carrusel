#!/usr/bin/env node
/**
 * Emite un API key para un comercio del marketplace.
 *
 * Uso:
 *   node scripts/issue-api-key.mjs --merchant=cm-1234 --name="Tienda X prod" \
 *        --project=storu-colombia-gtm --env=live --limit=1000
 *
 * Devuelve el token · guardalo, no lo vas a ver otra vez.
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.join("=")];
  })
);

if (!args.merchant || !args.name) {
  console.error("Usage: node scripts/issue-api-key.mjs --merchant=<id> --name=<name> [--project=<slug>] [--env=live|test] [--limit=<N>]");
  process.exit(1);
}

async function resolveActiveProject() {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "projects", "projects.json"), "utf-8");
    const idx = JSON.parse(raw);
    return idx.active || "default";
  } catch {
    return "default";
  }
}

async function main() {
  const env = args.env || "test";
  const projectSlug = args.project || (await resolveActiveProject());
  const rateLimit = args.limit != null ? parseInt(args.limit) : env === "test" ? 50 : 1000;
  const token = `storu_${env}_${crypto.randomBytes(24).toString("base64url")}`;

  const keysFile = path.join(DATA_DIR, "api-keys.json");
  let store = { keys: [] };
  try {
    store = JSON.parse(await fs.readFile(keysFile, "utf-8"));
  } catch { /* empty */ }

  const now = new Date().toISOString();
  const newKey = {
    key: token,
    merchantId: args.merchant,
    name: args.name,
    projectSlug,
    env,
    rateLimit,
    status: "active",
    usage: {
      totalRequests: 0,
      lastUsedAt: null,
      todayRequests: 0,
      todayResetAt: now.slice(0, 10),
    },
    scopes: null, // all scopes
    createdAt: now,
    updatedAt: now,
  };
  store.keys.push(newKey);
  await fs.writeFile(keysFile, JSON.stringify(store, null, 2));

  console.log("✓ API key emitido\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`Token:       ${token}`);
  console.log(`Merchant:    ${args.merchant}`);
  console.log(`Name:        ${args.name}`);
  console.log(`Project:     ${projectSlug}`);
  console.log(`Env:         ${env}`);
  console.log(`Rate limit:  ${rateLimit}/día`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n⚠  GUARDÁ ESTE TOKEN · no se puede recuperar después.\n");
  console.log("Ejemplo curl:\n");
  console.log(`  curl -X POST http://localhost:3000/api/public/v1/sets \\`);
  console.log(`    -H "Authorization: Bearer ${token}" \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"idea":"Activar martes en mi restaurante de Medellín"}'\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
