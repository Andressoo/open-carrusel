# Storu Flows · Automation Layer

Especificación de la capa de automatización que convierte Storu en una **máquina de contenido reactiva** ante eventos del comercio.

---

## Por qué

Hoy Storu hace acciones puntuales (crear set, renderizar reel, exportar ZIP). Lo que falta es la capa que las **encadena en automatismos disparados por eventos del negocio** · sin que el comercio tenga que abrir la app.

Inspiración: Zapier · Make · n8n · Inngest · Temporal · GitHub Actions.

---

## 3 primitivas que cubren el 95% de casos

```
TRIGGER → FLOW (steps) → ACTIONS
```

### 1. Trigger · qué arranca un flow

| Tipo | Ejemplo |
|------|---------|
| `cron` | Cada lunes 9am genera 5 sets para esta semana |
| `webhook` | Stripe `payment_succeeded` · IG keyword commented |
| `event` | Set publicado · render completado · DM recibido |
| `manual` | Usuario click "ejecutar ahora" |
| `upload` | Foto nueva en `/public/uploads/storefront/` |

### 2. Step · unidad atómica · 12 tipos cubren todo

**AI**
- `ai.brief` · convierte idea en set brief
- `ai.batch` · genera N sets variados
- `ai.agent` · corre agente Storu con tools
- `vision.analyze` · Claude Vision sobre foto

**API interna**
- `api.create-set` · crea ContentSet
- `api.create-piece` · crea story/carousel/reel
- `api.schedule` · agenda fecha
- `api.render` · MP4 reel
- `api.export-zip` · ZIP completo

**Control**
- `cond.branch` · if/else basado en data
- `loop.forEach` · iterar array
- `wait.delay` · sleep N min/h/d
- `wait.until` · espera condición (cron-like)

**Humano**
- `approval.wait` · gate · espera click + timeout

**I/O**
- `notify.email` · email merchant
- `notify.dm` · DM auto-respuesta IG via ManyChat
- `notify.webhook` · POST a URL externa
- `data.fetch` · query a sets/reels/etc
- `data.write` · update state

### 3. Flow · DAG de steps con context compartido

```typescript
type Flow = {
  slug: string;
  name: string;
  triggers: Trigger[];
  context?: Record<string, unknown>; // input default
  steps: Step[]; // se ejecutan en orden, con dependencias por id
  errorPolicy?: "stop" | "continue" | "retry";
  maxRetries?: number;
};
```

Cada step puede referenciar outputs de steps anteriores con `{{steps.id.output.field}}` · sintaxis tipo Handlebars.

---

## Run · una ejecución del flow

```typescript
type Run = {
  id: string;
  flowSlug: string;
  status: "pending" | "running" | "waiting-approval" | "completed" | "failed" | "cancelled";
  triggeredBy: { type: Trigger["type"]; data?: unknown };
  context: Record<string, unknown>; // inicial + outputs acumulados
  steps: Record<string, StepResult>;
  startedAt: string;
  finishedAt?: string;
  error?: { stepId: string; message: string };
};

type StepResult = {
  status: "pending" | "running" | "skipped" | "completed" | "failed" | "waiting";
  startedAt?: string;
  finishedAt?: string;
  input?: unknown; // resolved variables
  output?: unknown;
  error?: string;
};
```

**Resumable:** si el proceso muere, se relee `state.json` y se retoma desde el último step `completed`. Cada step debe ser idempotente o usar idempotency keys (UUIDs en outputs).

---

## Almacenamiento

```
data/
├── flows/
│   └── [slug]/
│       └── definition.json    # spec
├── flow-runs/
│   └── [runId]/
│       ├── state.json         # status + outputs
│       └── log.jsonl          # append-only audit log
```

Mismo patrón async-mutex que `data.ts` actual.

---

## Arquitectura del runtime

```
┌─────────────────────────────────────────────────────────────┐
│  TRIGGERS (entry points)                                     │
│  src/app/api/webhooks/[slug]/route.ts                        │
│  src/app/api/cron/route.ts (called by Vercel/GH Actions)     │
│  src/lib/flows/event-bus.ts (in-process pub/sub)             │
│  src/app/api/flows/[slug]/run/route.ts (manual)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FLOW ENGINE                                                 │
│  src/lib/flows/engine.ts                                     │
│  · loadFlow(slug)                                            │
│  · createRun(flow, trigger) → runId                          │
│  · executeRun(runId) async                                   │
│      while (hasNext) {                                       │
│        step = pickNext()                                     │
│        ctx = resolveVars(step.in, run.context)               │
│        result = await handler[step.type](ctx)                │
│        run.context[step.id] = result                         │
│        await persistState()                                  │
│      }                                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP HANDLERS REGISTRY                                      │
│  src/lib/flows/handlers/{ai,api,control,human,io}.ts         │
│  Cada handler:                                               │
│    inputSchema: ZodSchema                                    │
│    execute: (input, ctx) => Promise<output>                  │
│    idempotent?: boolean                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Ejemplos canónicos

### Ejemplo 1 · Máquina semanal de contenido

```json
{
  "slug": "weekly-content-machine",
  "name": "Genera 5 sets cada lunes y agenda martes-sábado",
  "triggers": [
    { "type": "cron", "expression": "0 9 * * 1", "timezone": "America/Bogota" }
  ],
  "context": {
    "rubro": "barbería",
    "city": "Pereira"
  },
  "steps": [
    {
      "id": "fetch-best",
      "type": "data.fetch",
      "in": { "from": "sets", "where": { "saveRate": ">10%" }, "limit": 3 },
      "comment": "trae los 3 sets de mayor performance histórico"
    },
    {
      "id": "generate",
      "type": "ai.batch",
      "in": {
        "prompt": "Generá 5 sets para {{context.rubro}} en {{context.city}} inspirados en estos casos: {{steps.fetch-best.output}}. Cada set debe atacar 'gastar en alcance' y proponer un incentivo concreto.",
        "count": 5
      }
    },
    {
      "id": "review",
      "type": "approval.wait",
      "in": { "channel": "in-app", "timeout": "24h", "fallback": "auto-approve" }
    },
    {
      "id": "schedule",
      "type": "loop.forEach",
      "items": "{{steps.generate.output.sets}}",
      "step": {
        "type": "api.schedule",
        "in": { "setId": "{{item.id}}", "date": "{{addDays(now, index * 1 + 1)}}" }
      }
    },
    {
      "id": "summary",
      "type": "notify.email",
      "in": {
        "to": "{{context.merchantEmail}}",
        "subject": "5 sets nuevos · agendados",
        "template": "weekly-summary",
        "data": { "sets": "{{steps.generate.output.sets}}" }
      }
    }
  ]
}
```

### Ejemplo 2 · Reactivación 30 días

```json
{
  "slug": "reactivation-30d",
  "triggers": [
    { "type": "webhook", "source": "stripe", "event": "payment_intent.succeeded" }
  ],
  "steps": [
    { "id": "tag", "type": "data.write", "in": { "customer": "{{trigger.customer}}", "lastBought": "{{now}}" } },
    { "id": "wait", "type": "wait.delay", "in": { "duration": "30d" } },
    { "id": "check", "type": "data.fetch", "in": { "customer": "{{trigger.customer}}", "boughtAfter": "{{steps.wait.startedAt}}" } },
    {
      "id": "branch",
      "type": "cond.branch",
      "in": { "condition": "{{steps.check.output.empty}}" },
      "then": [
        { "type": "ai.agent", "in": { "idea": "Set para reactivar cliente · compró 1 vez hace 30d · NO volvió · oferta personalizada con incentivo (no descuento)" } },
        { "type": "notify.dm", "in": { "to": "{{trigger.customer.handle}}", "setId": "{{previous.setId}}" } }
      ],
      "else": [
        { "type": "data.write", "in": { "metric": "retained_30d", "customerId": "{{trigger.customer.id}}" } }
      ]
    }
  ]
}
```

### Ejemplo 3 · Foto a set

```json
{
  "slug": "photo-to-set",
  "triggers": [
    { "type": "upload", "pathPattern": "/public/uploads/storefront/*" }
  ],
  "steps": [
    {
      "id": "vision",
      "type": "vision.analyze",
      "in": {
        "image": "{{trigger.file}}",
        "prompt": "Analizá esta foto del local. Extraé: rubro · paleta dominante · mood · 3 props visibles · vibe (premium/casual/familiar)"
      }
    },
    {
      "id": "agent",
      "type": "ai.agent",
      "in": {
        "idea": "Set para activar este local. Vertical: {{steps.vision.output.vertical}}. Mood: {{steps.vision.output.mood}}. Props: {{steps.vision.output.props}}. Atacá alcance vs cliente."
      }
    },
    {
      "id": "review",
      "type": "approval.wait",
      "in": { "context": "Foto subida activó este flow · revisá el set propuesto" }
    },
    {
      "id": "schedule",
      "type": "api.schedule",
      "in": { "setId": "{{steps.agent.output.setId}}", "date": "next-monday-10am" }
    }
  ]
}
```

### Ejemplo 4 · DM por keyword IG

```json
{
  "slug": "keyword-dm",
  "triggers": [
    { "type": "webhook", "source": "manychat", "event": "comment.keyword" }
  ],
  "steps": [
    { "id": "find", "type": "data.fetch", "in": { "set.ctaKeyword": "{{trigger.keyword}}" } },
    { "id": "track", "type": "data.write", "in": { "metric": "dm_keyword_match", "setId": "{{steps.find.output.id}}", "user": "{{trigger.user}}" } },
    { "id": "send", "type": "notify.dm", "in": { "to": "{{trigger.user}}", "template": "{{steps.find.output.set.dmTemplate}}" } }
  ]
}
```

---

## Multi-agente coordinado

Cuando un flow requiere razonamiento profundo, el step `ai.agent` puede spawnar **sub-agentes especializados** en paralelo:

```typescript
// src/lib/flows/handlers/ai-agent.ts
export async function handleAIAgent(input, ctx) {
  const coordinator = createAgent("coordinator");
  const subAgents = {
    analyst: createAgent("analyst", { tools: [dataFetch, computeMetrics] }),
    research: createAgent("research", { tools: [webSearch, scrapeCompetitor] }),
    vision: createAgent("vision", { tools: [analyzeImage] }),
    brief: createAgent("brief", { tools: [createSet, generateCaptions] }),
    editor: createAgent("editor", { tools: [refineCopy, suggestVariants] }),
  };

  // Coordinator decide qué sub-agentes correr en paralelo
  const plan = await coordinator.plan(input);
  const results = await Promise.all(
    plan.parallel.map((task) => subAgents[task.agent].run(task.input))
  );
  return coordinator.synthesize(results);
}
```

Cada sub-agente:
- system prompt focalizado en su rol
- tools propias del rol
- contexto reducido (no ve el de los otros)
- resultado tipado que el coordinator integra

---

## API endpoints

```
GET    /api/flows                    · lista flows
POST   /api/flows                    · crea flow
GET    /api/flows/:slug              · detalle
PUT    /api/flows/:slug              · update
DELETE /api/flows/:slug              · elimina (soft)

POST   /api/flows/:slug/run          · ejecuta manualmente · returns runId
GET    /api/flows/:slug/runs         · lista runs del flow

GET    /api/flow-runs/:runId         · estado actual + outputs
GET    /api/flow-runs/:runId/log     · log streaming SSE
POST   /api/flow-runs/:runId/cancel  · cancela
POST   /api/flow-runs/:runId/approve · resume después de approval

POST   /api/webhooks/:slug           · trigger por webhook externo
POST   /api/cron                     · invocado por Vercel Cron / GH Actions
```

---

## UI

```
/flows                 · lista flows con status (active/paused) + último run
/flows/new             · crear desde template o JSON crudo
/flows/[slug]          · editor visual o JSON
/flows/[slug]/runs     · historial de runs
/flow-runs/[runId]     · run detail · steps con status · logs en vivo · approve
```

Visual editor (fase D del roadmap) usa React Flow library con nodos arrastrables y edges entre steps.

---

## Roadmap implementación

| Fase | Duración | Entregable |
|------|----------|------------|
| **A** | 1 semana | Engine + 6 handlers + storage + manual trigger + UI lista runs |
| **B** | 1 semana | Webhooks + cron + event bus + approval inline |
| **C** | 2 semanas | Multi-agente coordinado + vision integration + memory |
| **D** | 1 semana | Visual builder (React Flow) + templates marketplace |

---

## Decisiones técnicas pendientes

1. **Event bus:** in-process (simple, no escala) vs Redis pub/sub vs PostgreSQL LISTEN/NOTIFY (cuando migremos a Supabase)
2. **Cron worker:** Vercel Cron (simple) vs Inngest (sofisticado, retries automáticos) vs cron job en Mac mini servidor (cero costo)
3. **Approval channel:** in-app dashboard vs email link mágico vs Slack/WhatsApp Business
4. **Idempotency:** UUIDs en step outputs · idempotency keys en API calls · DLQ para steps que fallan tras retries
5. **Backpressure:** rate limit por flow · queue cuando el agente saturado de tokens
6. **Multi-tenant:** flow scope = projectSlug (cada espacio sus flows) · API key valida tenant
