/**
 * Storu Flows · engine secuencial MVP
 *
 * Ejecuta steps en orden, persiste estado tras cada uno, maneja
 * variable interpolation y errores con retry.
 *
 * Pipeline:
 *   loadFlow → createRun → executeRun (loop) → persistState
 *
 * Resumable: si la app se reinicia, podés llamar resumeRun(runId)
 * y retoma desde el último step `completed`.
 */

import { generateId } from "@/lib/utils";
import { readData, writeData } from "@/lib/data";
import type {
  Flow,
  Run,
  Step,
  StepResult,
  StepContext,
  StepHandler,
  Trigger,
  FlowEvent,
} from "./types";

// ─── Storage ───

async function loadFlow(slug: string): Promise<Flow | null> {
  try {
    return await readData<Flow>(`flows/${slug}.json`);
  } catch {
    return null;
  }
}

async function saveRun(run: Run): Promise<void> {
  await writeData(`flow-runs/${run.id}/state.json`, run);
}

async function loadRun(runId: string): Promise<Run | null> {
  try {
    return await readData<Run>(`flow-runs/${runId}/state.json`);
  } catch {
    return null;
  }
}

// ─── Variable interpolation ───
// soporta {{steps.fetch.output.field}} · {{context.foo}} · {{trigger.x}}

const VAR_PATTERN = /\{\{\s*([\w.[\]]+)\s*\}\}/g;

function getPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function resolveTemplate(value: unknown, run: Run): unknown {
  if (typeof value === "string") {
    // Si la string es exactamente {{x}}, retornar el valor crudo (no string)
    const single = value.match(/^\{\{\s*([\w.[\]]+)\s*\}\}$/);
    if (single) {
      return getPath({ steps: stepOutputs(run), context: run.context, trigger: run.triggeredBy.data }, single[1]);
    }
    // Si tiene {{ }} mezcladas con texto, hacer string interpolation
    return value.replace(VAR_PATTERN, (_match, path) => {
      const v = getPath({ steps: stepOutputs(run), context: run.context, trigger: run.triggeredBy.data }, path);
      return v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => resolveTemplate(v, run));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveTemplate(v, run)])
    );
  }
  return value;
}

/** Output de cada step en formato accesible · {steps.<id>.output} */
function stepOutputs(run: Run): Record<string, { output: unknown; status: string }> {
  return Object.fromEntries(
    Object.entries(run.steps).map(([id, r]) => [id, { output: r.output, status: r.status }])
  );
}

// ─── Handler registry ───

const handlers = new Map<string, StepHandler>();

export function registerHandler(handler: StepHandler) {
  handlers.set(handler.type, handler);
}

export function getHandler(type: string): StepHandler | undefined {
  return handlers.get(type);
}

// ─── Run lifecycle ───

export async function createRun(
  flow: Flow,
  trigger: { type: Trigger["type"]; data?: Record<string, unknown> }
): Promise<Run> {
  const run: Run = {
    id: generateId(),
    flowSlug: flow.slug,
    flowVersion: flow.version,
    status: "pending",
    triggeredBy: trigger,
    context: { ...(flow.context || {}) },
    steps: {},
    startedAt: new Date().toISOString(),
  };
  await saveRun(run);
  return run;
}

export async function executeRun(runId: string, onEvent?: (e: FlowEvent) => void): Promise<Run> {
  let run = await loadRun(runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
    return run;
  }

  const flow = await loadFlow(run.flowSlug);
  if (!flow) throw new Error(`Flow not found: ${run.flowSlug}`);

  run.status = "running";
  await saveRun(run);
  onEvent?.({ type: "run.started", runId, flowSlug: flow.slug });

  // Sequential execution · steps in order
  for (const step of flow.steps) {
    const existing = run.steps[step.id];
    if (existing?.status === "completed") continue; // resume: skip done steps

    run = await executeStep(run, step, flow, onEvent);
    await saveRun(run);

    if (run.status === "failed" || run.status === "waiting-approval" || run.status === "waiting-delay") {
      onEvent?.({
        type: "run.waiting",
        runId,
        reason: run.status,
      });
      return run;
    }
  }

  run.status = "completed";
  run.finishedAt = new Date().toISOString();
  await saveRun(run);
  onEvent?.({ type: "run.completed", runId });
  return run;
}

async function executeStep(
  run: Run,
  step: Step,
  flow: Flow,
  onEvent?: (e: FlowEvent) => void
): Promise<Run> {
  const handler = handlers.get(step.type);
  if (!handler) {
    return failStep(run, step, `No handler registered for type: ${step.type}`);
  }

  const result: StepResult = {
    stepId: step.id,
    status: "running",
    startedAt: new Date().toISOString(),
    attempts: (run.steps[step.id]?.attempts || 0) + 1,
  };
  run.steps[step.id] = result;
  run.currentStepId = step.id;
  await saveRun(run);
  onEvent?.({ type: "step.started", runId: run.id, stepId: step.id });

  try {
    const ctx: StepContext = {
      run,
      flow,
      resolveVar: <T>(tpl: string | T) => resolveTemplate(tpl, run) as T,
      checkpoint: async () => { await saveRun(run); },
      log: (level, msg, extra) => {
        // TODO: append a log.jsonl
        console.log(`[run:${run.id}] [${level}] [${step.id}] ${msg}`, extra ?? "");
      },
    };

    const resolvedInput = resolveTemplate(step.in || {}, run);
    result.resolvedInput = resolvedInput;

    const output = await handler.execute(resolvedInput, ctx);

    result.output = output;
    result.status = "completed";
    result.finishedAt = new Date().toISOString();
    onEvent?.({ type: "step.completed", runId: run.id, stepId: step.id, output });
    return run;
  } catch (err) {
    return handleStepError(run, step, err as Error, flow, onEvent);
  }
}

async function handleStepError(
  run: Run,
  step: Step,
  err: Error,
  flow: Flow,
  onEvent?: (e: FlowEvent) => void
): Promise<Run> {
  const result = run.steps[step.id];
  const maxAttempts = step.retry?.maxAttempts ?? flow.maxRetries ?? 0;
  const attempts = result.attempts || 1;

  if (attempts < maxAttempts) {
    // Schedule retry · simple synchronous wait MVP
    const delay = step.retry?.delayMs ?? 1000;
    await new Promise((r) => setTimeout(r, delay));
    return executeStep(run, step, flow, onEvent);
  }

  return failStep(run, step, err.message);
}

function failStep(run: Run, step: Step, message: string): Run {
  const result = run.steps[step.id] || {
    stepId: step.id,
    status: "failed" as const,
    startedAt: new Date().toISOString(),
  };
  result.status = "failed";
  result.error = message;
  result.finishedAt = new Date().toISOString();
  run.steps[step.id] = result;

  const policy = run.steps[step.id]; // unused for now
  void policy;

  run.status = "failed";
  run.error = { stepId: step.id, message };
  run.finishedAt = new Date().toISOString();
  return run;
}

// ─── Public API ───

export async function startFlow(
  flowSlug: string,
  triggerType: Trigger["type"] = "manual",
  triggerData?: Record<string, unknown>,
  onEvent?: (e: FlowEvent) => void
): Promise<Run> {
  const flow = await loadFlow(flowSlug);
  if (!flow) throw new Error(`Flow not found: ${flowSlug}`);
  if (!flow.enabled) throw new Error(`Flow disabled: ${flowSlug}`);

  const run = await createRun(flow, { type: triggerType, data: triggerData });
  return executeRun(run.id, onEvent);
}

export async function getRun(runId: string): Promise<Run | null> {
  return loadRun(runId);
}

export async function listFlows(): Promise<Flow[]> {
  // TODO: implementar lista vía readDir
  return [];
}
