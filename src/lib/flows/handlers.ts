/**
 * Storu Flows · built-in step handlers
 *
 * Registra los handlers de las primitivas core. Los handlers son
 * idempotentes cuando es posible · si no, marcan side-effect.
 *
 * Cada handler hace:
 *   1. valida input (Zod opcional, MVP usa shape simple)
 *   2. ejecuta la acción
 *   3. retorna output que se almacena en run.steps[id].output
 */

import { registerHandler, getHandler } from "./engine";
import type { StepContext } from "./types";
import { generateText } from "@/lib/ai-provider";

// ─── Helper para llamar API interna ───

async function internalApi(path: string, method = "GET", body?: unknown): Promise<unknown> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

// ─── AI · ai.brief ───
registerHandler({
  type: "ai.brief",
  idempotent: false,
  async execute(input: unknown, ctx) {
    const { idea } = input as { idea: string };
    ctx.log("info", `Generando brief para: ${idea.slice(0, 60)}`);
    const result = await internalApi("/api/ai/generate-set", "POST", { idea });
    return result;
  },
});

// ─── AI · ai.batch ───
registerHandler({
  type: "ai.batch",
  idempotent: false,
  async execute(input: unknown, ctx) {
    const { prompt, count = 5 } = input as { prompt: string; count?: number };
    ctx.log("info", `Generando batch de ${count} sets`);
    // ai/generate-batch es streaming SSE · para flow MVP usamos generate-set N veces
    const sets = [];
    for (let i = 0; i < count; i++) {
      const set = await internalApi("/api/ai/generate-set", "POST", {
        idea: `${prompt}\n\nVariación ${i + 1}/${count}`,
      });
      sets.push(set);
      await ctx.checkpoint();
    }
    return { sets, total: sets.length };
  },
});

// ─── AI · ai.agent ───
registerHandler({
  type: "ai.agent",
  idempotent: false,
  async execute(input: unknown, ctx) {
    const { idea } = input as { idea: string };
    ctx.log("info", `Corriendo agente Storu`);
    const { runStoruAgent } = await import("@/lib/storu-agent");
    const projectContext = ctx.run.context.projectContext as string | undefined;
    const result = await runStoruAgent({ idea, projectContext });
    return result;
  },
});

// ─── Vision · vision.analyze (stub · usa OpenRouter Claude Vision) ───
registerHandler({
  type: "vision.analyze",
  idempotent: true,
  async execute(input: unknown, ctx) {
    const { image, prompt } = input as { image: string; prompt?: string };
    ctx.log("info", `Analizando imagen: ${image.slice(0, 60)}`);
    const text = await generateText(
      [
        {
          role: "user",
          content: `${prompt || "Analizá esta foto. Devolvé JSON con: rubro, paleta, mood, props (array), vibe."}\n\nImagen: ${image}`,
        },
      ],
      { maxTokens: 500 }
    );
    try {
      return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    } catch {
      return { raw: text };
    }
  },
});

// ─── API · api.create-set ───
registerHandler({
  type: "api.create-set",
  idempotent: false,
  async execute(input: unknown) {
    return internalApi("/api/content-sets", "POST", input);
  },
});

// ─── API · api.schedule ───
registerHandler({
  type: "api.schedule",
  idempotent: true,
  async execute(input: unknown) {
    const { setId, date } = input as { setId: string; date: string };
    return internalApi("/api/content-sets", "PUT", {
      id: setId,
      updates: { publishDate: date, status: "scheduled" },
    });
  },
});

// ─── API · api.export-zip ───
registerHandler({
  type: "api.export-zip",
  idempotent: true,
  async execute(input: unknown) {
    const { setId } = input as { setId: string };
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/content-sets/${setId}/export`, { method: "POST" });
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    // Devolver tamaño + URL (no el blob entero)
    return {
      contentLength: res.headers.get("content-length"),
      contentType: res.headers.get("content-type"),
      filename: res.headers.get("content-disposition")?.match(/filename="?([^"]+)"?/)?.[1],
    };
  },
});

// ─── Control · cond.branch ───
registerHandler({
  type: "cond.branch",
  idempotent: true,
  async execute(input: unknown, ctx) {
    const { condition } = input as { condition: boolean | string };
    const truthy =
      typeof condition === "boolean"
        ? condition
        : !!condition && condition !== "false" && condition !== "0";
    ctx.log("info", `Condition evaluated to ${truthy}`);
    return { taken: truthy ? "then" : "else", value: truthy };
  },
});

// ─── Control · loop.forEach (MVP · iteración simple) ───
registerHandler({
  type: "loop.forEach",
  idempotent: false,
  async execute(input: unknown, ctx) {
    const { items } = input as { items: unknown[] };
    if (!Array.isArray(items)) {
      throw new Error("loop.forEach requires items to be an array");
    }
    ctx.log("info", `Looping over ${items.length} items`);
    // MVP: ejecuta el step por cada item (el child step se evalúa con item + index en context)
    // En producción, esto debería spawnar sub-runs con su propio scope
    return { iterated: items.length };
  },
});

// ─── Control · wait.delay ───
registerHandler({
  type: "wait.delay",
  idempotent: true,
  async execute(input: unknown, ctx) {
    const { duration } = input as { duration: string };
    // duration: "5s", "30m", "2h", "1d"
    const ms = parseDuration(duration);
    ctx.log("info", `Waiting ${duration} (${ms}ms)`);
    if (ms > 60_000) {
      // Long delays: just record waiting state · engine puede schedularlo via cron
      throw new Error(`Long delays (>1min) require cron scheduler · TODO`);
    }
    await new Promise((r) => setTimeout(r, ms));
    return { waited: duration, startedAt: ctx.run.steps[ctx.run.currentStepId!]?.startedAt };
  },
});

function parseDuration(s: string): number {
  const m = s.match(/^(\d+)\s*([smhd])$/);
  if (!m) throw new Error(`Invalid duration: ${s}`);
  const n = parseInt(m[1]);
  const unit = m[2];
  const mul = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] || 1000;
  return n * mul;
}

// ─── Humano · approval.wait ───
registerHandler({
  type: "approval.wait",
  idempotent: true,
  async execute(_input: unknown, ctx) {
    ctx.log("info", "Waiting for human approval · run will pause");
    // El engine detecta status `waiting-approval` y para
    throw new Error("__WAIT_APPROVAL__");
  },
});

// ─── I/O · notify.email ───
registerHandler({
  type: "notify.email",
  idempotent: true,
  async execute(input: unknown, ctx) {
    const { to, subject, template, data } = input as {
      to: string;
      subject?: string;
      template?: string;
      data?: unknown;
    };
    ctx.log("info", `Sending email to ${to} · template: ${template || "raw"}`);
    // MVP: solo loggea · integración real con Resend/SendGrid en fase B
    return {
      sent: true,
      to,
      subject,
      template,
      data,
      stub: true,
      note: "Email stub · integrar Resend en fase B",
    };
  },
});

// ─── I/O · notify.dm (stub para ManyChat) ───
registerHandler({
  type: "notify.dm",
  idempotent: true,
  async execute(input: unknown, ctx) {
    const { to, template, data } = input as { to: string; template: string; data?: unknown };
    ctx.log("info", `DM to ${to} · template ${template}`);
    return { sent: true, to, template, data, stub: true };
  },
});

// ─── I/O · data.fetch ───
registerHandler({
  type: "data.fetch",
  idempotent: true,
  async execute(input: unknown) {
    const { from, where, limit } = input as {
      from: string;
      where?: Record<string, unknown>;
      limit?: number;
    };
    if (from === "sets") {
      const data = (await internalApi("/api/content-sets")) as { sets: Record<string, unknown>[] };
      let result = data.sets || [];
      if (where) {
        result = result.filter((s) =>
          Object.entries(where).every(([k, v]) => {
            if (typeof v === "string" && v.startsWith(">")) {
              return Number(s[k]) > parseFloat(v.slice(1));
            }
            return s[k] === v;
          })
        );
      }
      if (limit) result = result.slice(0, limit);
      return result;
    }
    throw new Error(`Unknown data source: ${from}`);
  },
});

// ─── Sentinel ───
registerHandler({
  type: "noop",
  idempotent: true,
  async execute() {
    return { noop: true };
  },
});

// ─── Helper de export para verificar inicialización ───
export function listRegisteredHandlers(): string[] {
  const types = [
    "ai.brief", "ai.batch", "ai.agent", "vision.analyze",
    "api.create-set", "api.schedule", "api.export-zip",
    "cond.branch", "loop.forEach", "wait.delay",
    "approval.wait",
    "notify.email", "notify.dm",
    "data.fetch",
    "noop",
  ];
  return types.filter((t) => getHandler(t));
}
