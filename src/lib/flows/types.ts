/**
 * Storu Flows · type contract
 *
 * Define qué es un Flow, sus Steps, Triggers y Runs.
 * Archivo único · todos los handlers + engine importan desde acá.
 */

// ─────────────────────────────────────────────────────────────
//  TRIGGERS
// ─────────────────────────────────────────────────────────────

export type CronTrigger = {
  type: "cron";
  expression: string; // "0 9 * * 1" Monday 9am
  timezone?: string; // "America/Bogota"
};

export type WebhookTrigger = {
  type: "webhook";
  source: "stripe" | "manychat" | "instagram" | "custom";
  event: string; // "payment_succeeded" · "comment.keyword"
  filterExpression?: string; // ej "{{body.amount > 50000}}"
};

export type EventTrigger = {
  type: "event";
  name: string; // "set.created" · "set.published" · "render.completed"
};

export type ManualTrigger = {
  type: "manual";
};

export type UploadTrigger = {
  type: "upload";
  pathPattern: string; // "/public/uploads/storefront/*"
};

export type Trigger =
  | CronTrigger
  | WebhookTrigger
  | EventTrigger
  | ManualTrigger
  | UploadTrigger;

// ─────────────────────────────────────────────────────────────
//  STEPS · 13 tipos
// ─────────────────────────────────────────────────────────────

export type StepType =
  // AI
  | "ai.brief"
  | "ai.batch"
  | "ai.agent"
  | "vision.analyze"
  // API interna
  | "api.create-set"
  | "api.create-piece"
  | "api.schedule"
  | "api.render"
  | "api.export-zip"
  // Control
  | "cond.branch"
  | "loop.forEach"
  | "wait.delay"
  | "wait.until"
  // Humano
  | "approval.wait"
  // I/O
  | "notify.email"
  | "notify.dm"
  | "notify.webhook"
  | "data.fetch"
  | "data.write"
  // Sentinel
  | "noop";

/**
 * Un step en la definition · puede tener `step` (single) o `steps` (block)
 * para tipos compositivos como cond.branch / loop.forEach.
 */
export type Step = {
  id: string;
  type: StepType;
  comment?: string; // doc inline para humanos
  in?: Record<string, unknown>; // input · soporta {{vars}}
  retry?: { maxAttempts: number; delayMs: number };
  /** Para cond.branch */
  then?: Step[];
  else?: Step[];
  /** Para loop.forEach */
  items?: string; // "{{steps.x.output.list}}"
  step?: Step; // step a iterar (se le pasa item + index en context)
};

export type Flow = {
  slug: string; // unique
  name: string;
  description?: string;
  enabled: boolean;
  triggers: Trigger[];
  /** Context inicial (env-like) · accesible como {{context.X}} en steps */
  context?: Record<string, unknown>;
  steps: Step[];
  errorPolicy?: "stop" | "continue" | "retry-then-stop";
  maxRetries?: number;
  /** Scope · cada flow vive en un proyecto Storu */
  projectSlug?: string;
  createdAt: string;
  updatedAt: string;
  version: number; // incrementa con cada update · runs viejos siguen su versión
};

// ─────────────────────────────────────────────────────────────
//  RUN · una ejecución
// ─────────────────────────────────────────────────────────────

export type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "waiting"; // approval.wait, wait.delay

export type StepResult = {
  stepId: string;
  status: StepStatus;
  startedAt?: string;
  finishedAt?: string;
  /** Input resuelto (con vars expandidas) */
  resolvedInput?: unknown;
  /** Output del step · accesible como {{steps.<id>.output}} */
  output?: unknown;
  error?: string;
  /** Si está esperando, qué espera */
  waitingFor?: { type: "approval" | "delay" | "condition"; until?: string };
  attempts?: number;
};

export type RunStatus =
  | "pending"
  | "running"
  | "waiting-approval"
  | "waiting-delay"
  | "completed"
  | "failed"
  | "cancelled";

export type Run = {
  id: string;
  flowSlug: string;
  flowVersion: number;
  status: RunStatus;
  triggeredBy: {
    type: Trigger["type"];
    data?: Record<string, unknown>;
    userId?: string;
  };
  /** Context acumulado · arranca con flow.context, se enriquece con outputs */
  context: Record<string, unknown>;
  /** Resultados de cada step ejecutado · keyed por step.id */
  steps: Record<string, StepResult>;
  /** Cursor · qué step toca después */
  currentStepId?: string;
  startedAt: string;
  finishedAt?: string;
  error?: { stepId: string; message: string };
};

// ─────────────────────────────────────────────────────────────
//  HANDLER CONTRACT
// ─────────────────────────────────────────────────────────────

export type StepContext = {
  run: Run;
  flow: Flow;
  /** Helpers para resolver variables · ya hace {{steps.x.output}} → valor real */
  resolveVar: <T = unknown>(template: string | T) => T;
  /** Persiste estado parcial (después de operaciones largas) */
  checkpoint: () => Promise<void>;
  /** Logger */
  log: (level: "info" | "warn" | "error", msg: string, extra?: unknown) => void;
};

export type StepHandler<I = unknown, O = unknown> = {
  type: StepType;
  /** Si es true, repetir el step no causa side-effects duplicados */
  idempotent: boolean;
  execute: (input: I, ctx: StepContext) => Promise<O>;
};

// ─────────────────────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────────────────────

export type FlowEvent =
  | { type: "run.started"; runId: string; flowSlug: string }
  | { type: "step.started"; runId: string; stepId: string }
  | { type: "step.completed"; runId: string; stepId: string; output?: unknown }
  | { type: "step.failed"; runId: string; stepId: string; error: string }
  | { type: "run.completed"; runId: string }
  | { type: "run.failed"; runId: string; error: string }
  | { type: "run.waiting"; runId: string; reason: string };
