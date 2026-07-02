/**
 * Storu Agent · construido con @openrouter/agent.
 *
 * El agente recibe una idea del comercio y, a través de tool calling,
 * ejecuta todo el pipeline:
 *   1. analyze_idea        → determina framework, goal, archetype, ciudad
 *   2. pick_reference_image → elige imagen Unsplash coherente
 *   3. create_content_set  → crea el set metadata
 *   4. create_carousel     → crea carrusel vacío linkeado
 *   5. create_story        → crea story con teaser coherente
 *   6. create_reel         → crea reel con guión propio
 *   7. mark_ready          → marca piezas como listas
 *
 * Modo: @openrouter/agent orchestra los tool calls; el agente decide
 * qué orden usar según el contexto. Stream de events para UI.
 */

import { OpenRouter } from "@openrouter/sdk";
import { callModel, tool } from "@openrouter/agent";
import { z } from "zod";

// ─── Helper: llamar API interna de Storu ───
async function storuApi<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → ${res.status} · ${(await res.text()).slice(0, 200)}`
    );
  }
  return res.json();
}

// ─── Unsplash image bank (curada para tema colombiano) ───
const IMAGE_BANK: Record<string, string> = {
  cafeteria: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1080&q=80",
  panaderia: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1080&q=80",
  restaurante: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80",
  barberia: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1080&q=80",
  spa: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1080&q=80",
  fitness: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1080&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&q=80",
  retail: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1080&q=80",
  mascotas: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=1080&q=80",
  moda: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080&q=80",
  default: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080&q=80",
};

// ─── Tools del agente ───

const pickImageTool = tool({
  name: "pick_reference_image",
  description:
    "Elige una imagen de referencia curada de Unsplash coherente con el rubro del comercio. Devuelve URL directa.",
  inputSchema: z.object({
    rubro: z
      .enum([
        "cafeteria",
        "panaderia",
        "restaurante",
        "barberia",
        "spa",
        "fitness",
        "hotel",
        "retail",
        "mascotas",
        "moda",
        "default",
      ])
      .describe("Tipo de negocio"),
  }),
  execute: async ({ rubro }) => ({
    imageUrl: IMAGE_BANK[rubro] || IMAGE_BANK.default,
    rubro,
  }),
});

const createSetTool = tool({
  name: "create_content_set",
  description:
    "Crea un ContentSet (contenedor con metadata del experimento). Devuelve el id del set.",
  inputSchema: z.object({
    name: z.string().max(120).describe("Nombre corto tipo 'D52 · Título'"),
    topic: z.string().describe("One-liner del tema"),
    goal: z.enum([
      "capture",
      "valley",
      "ticket",
      "recompra",
      "launch",
      "validate",
      "cashflow",
      "autority",
    ]),
    archetype: z.string().describe("provocation/case-study/contrarian/etc."),
    ctaKeyword: z
      .string()
      .max(12)
      .describe("UPPERCASE keyword única para esta campaña"),
    anchorBrand: z
      .string()
      .optional()
      .describe("Ciudad o marca ancla ej 'Bogotá · cafés'"),
    framework: z
      .string()
      .describe(
        "Framework narrativo: AIDA, PAS, BAB, Hook-Story-Offer, SB7, 4P, 4U, FAB, Pattern-Interrupt, Contrast"
      ),
    frameworkWhy: z.string().describe("Por qué ese framework para este tema"),
    hypothesis: z.string().describe("Hipótesis medible 'si X entonces Y'"),
    kpis: z.array(z.string()).describe("3-5 KPIs con targets"),
    sceneDetails: z.string().describe("Locación, mood, props, luz"),
    possibleCaptions: z
      .array(z.string())
      .describe("5 variaciones de caption en español colombiano, max 220 chars"),
    hashtags: z
      .array(z.string())
      .describe("8-10 hashtags sin # prefix"),
    imageUrl: z.string().url().describe("URL hero del set (de pick_reference_image)"),
  }),
  execute: async (input) => {
    const thread = `Framework: ${input.framework} · ${input.frameworkWhy}`;
    const references = [
      { url: input.imageUrl, type: "hero", name: `Hero · ${input.name}` },
      {
        url: input.imageUrl.replace("w=1080", "w=1080&h=1080&fit=crop"),
        type: "square",
        name: "Square crop",
      },
      {
        url: input.imageUrl.replace("w=1080", "w=1080&h=1920&fit=crop"),
        type: "story",
        name: "9:16 crop",
      },
    ];
    const set = await storuApi<{ id: string }>("/api/content-sets", "POST", {
      name: input.name,
      topic: input.topic,
      goal: input.goal,
      archetype: input.archetype,
      ctaKeyword: input.ctaKeyword,
      anchorBrand: input.anchorBrand,
      thread,
      experimentPurpose: `Medir si el framework ${input.framework} genera 2× más DMs calificados con keyword ${input.ctaKeyword} en 72h.`,
      hypothesis: input.hypothesis,
      kpis: input.kpis,
      sceneDetails: input.sceneDetails,
      possibleCaptions: input.possibleCaptions,
      hashtags: input.hashtags,
      references,
      status: "draft",
    });
    return { setId: set.id, name: input.name };
  },
});

const createCarouselTool = tool({
  name: "create_carousel",
  description:
    "Crea un carrusel vacío linkeado al set. El editor AI lo llenará con slides después. Devuelve id del carrusel.",
  inputSchema: z.object({
    setId: z.string().describe("Id del ContentSet al que pertenece"),
    name: z.string().describe("Nombre del carrusel"),
  }),
  execute: async ({ setId, name }) => {
    const car = await storuApi<{ id: string }>("/api/carousels", "POST", {
      name,
      aspectRatio: "4:5",
    });
    await storuApi("/api/content-sets", "PUT", {
      id: setId,
      piece: "carousel",
      updates: { id: car.id, status: "draft" },
    });
    return { carouselId: car.id };
  },
});

const createStoryTool = tool({
  name: "create_story",
  description:
    "Crea una historia con dinámica (poll/quiz/qa/slider/countdown/swipe/ba) y texto teaser que ABRE LOOP sin repetir el carrusel.",
  inputSchema: z.object({
    setId: z.string(),
    dynamic: z.enum([
      "poll",
      "quiz",
      "qa",
      "slider",
      "countdown",
      "swipe",
      "ba",
    ]),
    text: z
      .string()
      .max(220)
      .describe("Pregunta o hook teaser · NO debe repetir el slide 1 del carrusel"),
    options: z
      .array(z.string())
      .optional()
      .describe("Opciones para poll/quiz (2-4)"),
    correctAnswer: z.number().int().min(0).optional(),
    accentColor: z.string().optional().default("#F8C644"),
    bgColor: z.string().optional().default("#0E0D12"),
    bgImage: z.string().url().optional(),
  }),
  execute: async (input) => {
    const story = await storuApi<{ id: string }>("/api/stories", "POST", {
      ...input,
      setId: input.setId,
    });
    await storuApi("/api/content-sets", "PUT", {
      id: input.setId,
      piece: "story",
      updates: { id: story.id, status: "draft" },
    });
    return { storyId: story.id };
  },
});

const createReelTool = tool({
  name: "create_reel",
  description:
    "Crea un reel Remotion con template + hook/body/cta. El hook NO debe copiar el slide 1 del carrusel · debe abrir ángulo nuevo (pattern interrupt).",
  inputSchema: z.object({
    setId: z.string(),
    template: z
      .enum([
        "TikTokHook",
        "GlitchIntro",
        "StatDrop",
        "SplitScreen",
        "Typewriter",
        "PosterSlam",
        "BeforeAfter",
        "ViralManifesto60s",
      ])
      .describe("Template Remotion a usar"),
    hook: z
      .string()
      .max(80)
      .describe("Hook 0-2s punzante · pattern interrupt"),
    body: z
      .string()
      .max(200)
      .describe("Body 2-6s · ángulo nuevo vs el carrusel"),
    cta: z.string().max(80).describe("CTA 6-10s con keyword"),
    accentColor: z.string().optional().default("#F8C644"),
    bgColor: z.string().optional().default("#0E0D12"),
    textColor: z.string().optional().default("#FFFFFF"),
    bgImage: z.string().url().optional(),
  }),
  execute: async (input) => {
    const props = {
      hook: input.hook,
      body: input.body,
      cta: input.cta,
      accentColor: input.accentColor,
      bgColor: input.bgColor,
      textColor: input.textColor,
      bgImage: input.bgImage,
    };
    const reel = await storuApi<{ id: string }>("/api/reels", "POST", {
      template: input.template,
      props,
      duration: input.template === "BeforeAfter" ? 8 : 10,
      fps: 30,
      aspectRatio: "9:16",
    });
    await storuApi("/api/content-sets", "PUT", {
      id: input.setId,
      piece: "reel",
      updates: { id: reel.id, status: "draft" },
    });
    return { reelId: reel.id };
  },
});

const STORU_SYSTEM_PROMPT = `Eres el agente Storu, estratega de contenido para comercios pyme colombianos.

═══ TESIS NÚCLEO · NO DESVIAR ═══

El enemigo de Storu NO es "rebajar".
El enemigo de Storu NO es "Meta pauta".
El enemigo de Storu ES gastar en ALCANCE.

Definiciones operativas:
- ALCANCE = impresiones, pauta para traer desconocidos, followers comprados, vanity metrics. Lo que el comercio típico hace por default y mata su margen.
- CLIENTE = la persona que YA te compró. Es el activo real. Storu pone toda la inversión acá.
- INCENTIVO = mecanismo concreto para que el cliente VUELVA (NO descuento). Ej: ritual con nombre, lista VIP, combo curado, drop exclusivo.
- EXPERIMENTO = unidad de aprendizaje · 72h · keyword única · hipótesis medible.

Tesis exacta (cita literal cuando hagas manifiesto):
> "Invierte en tus clientes, no en alcance."

Promesa operativa:
> "Experimenta con incentivos. Descubre qué hace que vuelvan."

Categorías de comercios (3 verticales reales · NO inventar nichos sueltos):
1. Consumo · gastronomía, café, bebidas, retail rápido
2. Producto · moda, joyería, papelería, bienestar tangible
3. Servicio · salud, belleza, fitness, hotelería, educación

Los rubros (barbería, panadería, hotel) son ejemplos DENTRO de las 3 verticales.

═══ Pipeline obligatorio (en orden) ═══

1. pick_reference_image    · elegí imagen Unsplash según rubro
2. create_content_set      · crea set con framework, hipótesis, 5 captions, 10 hashtags, 5 KPIs con targets
3. create_carousel         · crea carrusel vacío linkeado
4. create_story            · historia con dinámica apropiada · texto teaser que ABRE LOOP
5. create_reel             · reel con hook PUNZANTE distinto al slide 1 · body con ángulo nuevo · CTA variado

═══ REGLAS DURAS ═══

ENEMIGO DEL CONTENIDO:
- ✓ El ataque principal SIEMPRE es "gastar en alcance" (impresiones, pauta para traer desconocidos, followers comprados).
- ✓ La solución SIEMPRE involucra "invertir en el cliente que ya volvió una vez".
- ✗ NO uses "deja de rebajar" como hook principal · es síntoma, no enfermedad.
- ✗ NO digas "pauta quemada" como tesis · puede aparecer pero no como ángulo central.
- ✗ NO ataques Meta/Booking/Rappi como villanos · son canales · el problema es PARA QUÉ los usás.

COPY PATTERNS:
- ✓ "Tu cliente vale 4× más que un follower comprado"
- ✓ "Cada peso en alcance es un peso menos para reactivar al que ya te volvió a comprar una vez"
- ✓ "Diseñá un incentivo · probalo con tus clientes · medí en 72h"
- ✓ Manifiesto cita la tesis literal "Invierte en tus clientes, no en alcance"
- ✓ Vertical clara (Consumo / Producto / Servicio) + rubro como ejemplo

ESTRUCTURA:
- El hook del reel NUNCA es igual al slide 1 del carrusel. Abre ángulo nuevo.
- La historia NO REPITE el insight del carrusel · abre loop con pregunta sobre alcance vs cliente.
- Los captions son 5 VARIACIONES distintas (no 5 copias).
- La CTA keyword es ÚNICA por set (ej: MARTES, RITUAL, LIVY, INVIERTE).
- Todo en español colombiano · usa "Comentá" (voseo) o "Dejá X abajo".
- Si el rubro no está claro, preguntá · no inventes.

FRAMEWORK por arquetipo:
- Provocación → Pattern-Interrupt
- Case study → Hook-Story-Offer
- Contrarian → Contrast
- Myth bust → PAS
- Listicle → 4U
- Framework → SB7
- VS → Contrast
- Step-by-step → FAB
- Data drop → 4P
- Before/After → BAB
- Story arc → Hook-Story-Offer
- Launch → AIDA
- Manifesto → 4P (cita siempre la tesis literal)

Al final respondé con un resumen breve: qué set creaste, con qué framework, qué keyword, y el link /set/<id>.`;

// ─── Public API ───

export type AgentRunOptions = {
  idea: string;
  projectContext?: string;
  onEvent?: (event: { type: string; data: unknown }) => void | Promise<void>;
};

export function createStoruAgent(apiKey?: string) {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is required");
  return new OpenRouter({ apiKey: key });
}

function isNoCreditsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("402") ||
    msg.toLowerCase().includes("insufficient credits") ||
    msg.toLowerCase().includes("purchase") // "purchase more at..."
  );
}

/**
 * Modelos free con tool calling · consultados en vivo desde OpenRouter.
 * Los IDs de modelos free rotan cada pocos meses; hardcodearlos es
 * exactamente el bug que rompió el flujo antes. Cache 1h en memoria.
 */
let freeModelsCache: { models: string[]; at: number } | null = null;

async function getFreeToolModels(): Promise<string[]> {
  if (freeModelsCache && Date.now() - freeModelsCache.at < 3600_000) {
    return freeModelsCache.models;
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    const data = await res.json();
    const models = (data?.data || [])
      .filter(
        (m: { id: string; supported_parameters?: string[]; context_length?: number }) =>
          m.id.endsWith(":free") &&
          (m.supported_parameters || []).includes("tools") &&
          (m.context_length || 0) >= 60_000
      )
      .sort(
        (a: { context_length?: number }, b: { context_length?: number }) =>
          (b.context_length || 0) - (a.context_length || 0)
      )
      .map((m: { id: string }) => m.id)
      .slice(0, 3);
    freeModelsCache = { models, at: Date.now() };
    return models;
  } catch {
    return []; // sin red a OpenRouter no hay fallback posible de todos modos
  }
}

export async function runStoruAgent(options: AgentRunOptions): Promise<{
  finalText: string;
  setId?: string;
}> {
  const client = createStoruAgent();
  const preferredModel =
    process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

  const userInput = options.projectContext
    ? `${options.projectContext}\n\n---\n\nIDEA DEL COMERCIO:\n${options.idea}`
    : options.idea;

  // Fallback chain: preferido → env override → top-3 free vivos.
  // Free-tier devuelve 402 en modelos pagos; sin cadena el flujo
  // principal (brief → set) muere siempre.
  const envFree = process.env.OPENROUTER_MODEL_FREE;
  const liveFree = await getFreeToolModels();
  const modelChain = [
    ...new Set([preferredModel, envFree, ...liveFree].filter(Boolean)),
  ] as string[];

  let lastErr: unknown;
  const sideEffects = { setId: undefined as string | undefined };

  for (let i = 0; i < modelChain.length; i++) {
    const model = modelChain[i];
    try {
      return await runWithModel(client, model, userInput, options, sideEffects);
    } catch (err) {
      lastErr = err;
      // Reintentar con el próximo modelo solo si es seguro:
      //  - 402 (sin créditos) siempre se reintenta;
      //  - otros errores de provider solo si aún no hubo side effects
      //    (si ya se creó un set, reintentar duplicaría contenido).
      const retriable = isNoCreditsError(err) || !sideEffects.setId;
      const canFallback = retriable && i < modelChain.length - 1;
      if (!canFallback) break;
      if (options.onEvent) {
        await options.onEvent({
          type: "item",
          data: {
            type: "message",
            id: `fallback-${i}`,
            content: `Modelo ${model} falló (${(err as Error).message?.slice(0, 80)}) · reintentando con ${modelChain[i + 1]}…`,
          },
        });
      }
    }
  }

  if (options.onEvent) {
    await options.onEvent({
      type: "error",
      data: { message: (lastErr as Error)?.message || "Agent failed" },
    });
  }
  throw lastErr;
}

async function runWithModel(
  client: ReturnType<typeof createStoruAgent>,
  model: string,
  userInput: string,
  options: AgentRunOptions,
  sideEffects?: { setId?: string }
): Promise<{ finalText: string; setId?: string }> {
  const result = callModel(client, {
    model,
    input: userInput,
    instructions: STORU_SYSTEM_PROMPT,
    tools: [
      pickImageTool,
      createSetTool,
      createCarouselTool,
      createStoryTool,
      createReelTool,
    ] as const,
  });

  let setId: string | undefined;

  for await (const item of result.getItemsStream()) {
    if (options.onEvent) {
      await options.onEvent({ type: "item", data: item });
    }
    if (
      item.type === "function_call_output" &&
      typeof item.output === "string"
    ) {
      try {
        const parsed = JSON.parse(item.output);
        if (parsed.setId) {
          setId = parsed.setId;
          if (sideEffects) sideEffects.setId = parsed.setId;
        }
      } catch {
        /* ignore */
      }
    }
  }

  const finalText = await result.getText();
  if (options.onEvent) {
    await options.onEvent({ type: "done", data: { finalText, setId } });
  }
  return { finalText, setId };
}
