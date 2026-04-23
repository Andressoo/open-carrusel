/**
 * Define el orden de publicación óptimo para un set según su estrategia.
 *
 * La secuencia no es fija (H→C→R). Cambia según:
 *  - archetype del set (provocación vs case study vs launch)
 *  - goal comercial (capture vs recompra vs launch)
 *  - framework narrativo (Pattern-Interrupt vs Hook-Story-Offer)
 *  - tipo de foto/evidencia disponible (cuando tengamos análisis visual)
 *
 * Estrategias base (4 variantes):
 *
 *   H → C → R    Teaser loop → Editorial → Recap viral
 *                Clásico para education, frameworks, case studies.
 *
 *   C → H → R    Editorial first → Engagement → Amplify
 *                Cuando el carrusel ES el contenido (manifesto, provocación).
 *
 *   R → H → C    Viral top-of-funnel → Filtro → Conversión profunda
 *                Launches, story-arcs, before/after emocionales.
 *
 *   R → C → H    Descubrimiento → Convertir → Interactivo
 *                Campañas con foco viral + conversión rápida.
 */

export type PieceKind = "story" | "carousel" | "reel";

export type PublishStep = {
  piece: PieceKind;
  dayOffset: number; // 0 = día D, -1 = día antes, etc.
  timeOfDay: string; // "09:00", "18:00"
  role: string; // qué función cumple en el flujo
  reason: string; // por qué en esta posición
};

export type PublishOrder = {
  strategyCode: string; // "HCR", "CHR", "RHC", "RCH"
  strategyName: string;
  rationale: string;
  timeboxDays: number;
  steps: PublishStep[];
};

// ─────────────────────────────────────────────────────────────
//  STRATEGIES · 4 patrones probados
// ─────────────────────────────────────────────────────────────

const STRATEGIES: Record<string, PublishOrder> = {
  HCR: {
    strategyCode: "HCR",
    strategyName: "Historia → Carrusel → Reel",
    rationale:
      "Teaser primero (abre loop + califica interés) · profundidad al día siguiente (carrusel editorial) · amplificación viral en D+2 (reel con pattern interrupt).",
    timeboxDays: 4,
    steps: [
      {
        piece: "story",
        dayOffset: -1,
        timeOfDay: "18:00",
        role: "Teaser · calibra interés · abre loop",
        reason:
          "La historia con poll/quiz/QA actúa como filtro suave. Los que interactúan entran con intención al carrusel del día siguiente.",
      },
      {
        piece: "carousel",
        dayOffset: 0,
        timeOfDay: "09:00",
        role: "Editorial · profundiza con framework + caso",
        reason:
          "El carrusel es el contenido principal. Entrega la lección completa que la historia prometió.",
      },
      {
        piece: "reel",
        dayOffset: 2,
        timeOfDay: "18:00",
        role: "Amplificación · pattern interrupt para audiencia fría",
        reason:
          "El reel llega 48h después para reforzar recall y alcanzar audiencia no-follower vía push de IG.",
      },
    ],
  },

  CHR: {
    strategyCode: "CHR",
    strategyName: "Carrusel → Historia → Reel",
    rationale:
      "El carrusel ES la provocación principal · historia genera debate en la comunidad existente · reel amplía la postura a audiencia fría.",
    timeboxDays: 4,
    steps: [
      {
        piece: "carousel",
        dayOffset: 0,
        timeOfDay: "09:00",
        role: "Postura principal · declaración fuerte",
        reason:
          "Cuando el contenido es manifesto o provocación, el carrusel necesita llegar primero sin teaser que diluya el impacto.",
      },
      {
        piece: "story",
        dayOffset: 0,
        timeOfDay: "18:00",
        role: "Debate · activa engagement con la postura",
        reason:
          "La historia del mismo día toma la provocación y la convierte en pregunta abierta a la comunidad. Comentarios entran calientes.",
      },
      {
        piece: "reel",
        dayOffset: 2,
        timeOfDay: "20:00",
        role: "Viral · lleva la postura a audiencia fría",
        reason:
          "El reel amplifica la provocación ya validada por el engagement de la historia. Ritmo noche alto reach.",
      },
    ],
  },

  RHC: {
    strategyCode: "RHC",
    strategyName: "Reel → Historia → Carrusel",
    rationale:
      "Reel viral top-of-funnel captura audiencia fría · historia filtra interesados con pregunta emocional · carrusel convierte con profundidad.",
    timeboxDays: 5,
    steps: [
      {
        piece: "reel",
        dayOffset: 0,
        timeOfDay: "19:00",
        role: "Hook viral · capta audiencia nueva",
        reason:
          "Launch y story-arc necesitan alcance fuera de followers. El reel es el único formato con distribución algorítmica agresiva.",
      },
      {
        piece: "story",
        dayOffset: 1,
        timeOfDay: "11:00",
        role: "Filtro · convierte curiosos en leads",
        reason:
          "24h después, la historia captura a los que vieron el reel y quieren más. Countdown o lista VIP funciona acá.",
      },
      {
        piece: "carousel",
        dayOffset: 3,
        timeOfDay: "09:00",
        role: "Conversión · profundidad para la audiencia calificada",
        reason:
          "El carrusel cierra la venta con el detalle completo, ya con una audiencia que pasó por dos filtros antes.",
      },
    ],
  },

  RCH: {
    strategyCode: "RCH",
    strategyName: "Reel → Carrusel → Historia",
    rationale:
      "Descubrimiento viral · conversión rápida con carrusel · historia para comunidad que ya compró o reservó.",
    timeboxDays: 3,
    steps: [
      {
        piece: "reel",
        dayOffset: 0,
        timeOfDay: "19:00",
        role: "Viral · captura ancha",
        reason:
          "Campaña con urgencia requiere alcance máximo día 1. Reel distribuye a no-followers en horas pico.",
      },
      {
        piece: "carousel",
        dayOffset: 1,
        timeOfDay: "12:00",
        role: "Conversión · el detalle que convierte",
        reason:
          "24h después el carrusel llega a los que recuerdan el reel · conversión directa con CTA-keyword.",
      },
      {
        piece: "story",
        dayOffset: 2,
        timeOfDay: "19:00",
        role: "Retención · comunidad que reserva",
        reason:
          "Historia cierra con la lista VIP de los que ya compraron · prueba social + scarcity para próximos.",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  MAPPING · archetype → estrategia
// ─────────────────────────────────────────────────────────────

const ARCHETYPE_TO_STRATEGY: Record<string, string> = {
  // H → C → R (teaser → edit → amplify) · educational
  "case-study": "HCR",
  framework: "HCR",
  "data-drop": "HCR",
  listicle: "HCR",
  "step-by-step": "HCR",
  "myth-bust": "HCR",
  "step-by-step ": "HCR", // tolerancia espacios

  // C → H → R (postura first) · provocación fuerte
  provocación: "CHR",
  manifesto: "CHR",
  contrarian: "CHR",
  vs: "CHR",

  // R → H → C (viral → filter → convert) · emocional/visual
  "story-arc": "RHC",
  "before-after": "RHC",

  // R → C → H (viral → convert → retain) · launch urgente
  launch: "RCH",
};

// ─────────────────────────────────────────────────────────────
//  API
// ─────────────────────────────────────────────────────────────

/**
 * Calcula el orden óptimo de publicación para un set.
 *
 * @param archetype - ej "case-study", "provocación"
 * @param goal - ej "launch", "autority" (override según urgencia)
 * @param photoHints - en V2 cuando tengamos Vision (video→RHC, productos→HCR, etc.)
 */
export function resolvePublishOrder(
  archetype: string,
  goal?: string,
  _photoHints?: { hasVideo?: boolean; hasProduct?: boolean; hasPerson?: boolean }
): PublishOrder {
  // Goal override · launches siempre van R-first aunque archetype diga otra cosa
  if (goal === "launch" || goal === "cashflow") {
    return STRATEGIES.RCH;
  }

  const code =
    ARCHETYPE_TO_STRATEGY[archetype?.toLowerCase?.() || ""] || "HCR";
  return STRATEGIES[code];
}

/**
 * Calcula las fechas reales a partir de un publishDate "ancla" (día D).
 * Devuelve los steps con dates concretas en formato ISO.
 */
export function computeScheduleDates(
  order: PublishOrder,
  anchorDate: string // YYYY-MM-DD = día D
): Array<PublishStep & { date: string; iso: string }> {
  const [y, m, d] = anchorDate.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));

  return order.steps.map((step) => {
    const dt = new Date(base);
    dt.setUTCDate(dt.getUTCDate() + step.dayOffset);
    const [hh, mm] = step.timeOfDay.split(":").map(Number);
    dt.setUTCHours(hh, mm, 0, 0);
    const iso = dt.toISOString();
    const date = iso.slice(0, 10);
    return { ...step, date, iso };
  });
}

/**
 * Genera un texto legible del plan de publicación para README del ZIP.
 */
export function formatPublishPlan(
  order: PublishOrder,
  anchorDate?: string
): string {
  const lines: string[] = [];
  lines.push(`## Plan de publicación · ${order.strategyName}`);
  lines.push(``);
  lines.push(`**Por qué este orden:** ${order.rationale}`);
  lines.push(``);

  const steps = anchorDate
    ? computeScheduleDates(order, anchorDate)
    : order.steps.map((s) => ({ ...s, date: "", iso: "" }));

  steps.forEach((step, i) => {
    const label =
      step.piece === "story"
        ? "📱 Historia"
        : step.piece === "carousel"
        ? "📇 Carrusel"
        : "🎬 Reel";
    const offset =
      step.dayOffset === 0
        ? "Día D"
        : step.dayOffset > 0
        ? `Día D+${step.dayOffset}`
        : `Día D${step.dayOffset}`;
    const dateStr = step.date ? ` · ${step.date}` : "";
    lines.push(
      `**${i + 1}. ${label}** · ${offset} · ${step.timeOfDay}${dateStr}`
    );
    lines.push(`   - Rol: ${step.role}`);
    lines.push(`   - Razón: ${step.reason}`);
    lines.push(``);
  });

  lines.push(`**Timebox total:** ${order.timeboxDays} días`);
  return lines.join("\n");
}

export { STRATEGIES };
