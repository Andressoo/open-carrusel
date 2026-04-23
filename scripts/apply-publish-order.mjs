#!/usr/bin/env node
/**
 * Calcula y guarda el publishOrder para cada set existente según su
 * archetype + goal. Usa la misma lógica que src/lib/publish-order.ts
 * pero inline en JS (evita import TS).
 */

const API = process.env.API_BASE || "http://localhost:3000";

const STRATEGIES = {
  HCR: {
    strategyCode: "HCR",
    strategyName: "Historia → Carrusel → Reel",
    rationale: "Teaser primero (abre loop + califica interés) · profundidad al día siguiente (carrusel editorial) · amplificación viral en D+2 (reel con pattern interrupt).",
    timeboxDays: 4,
    steps: [
      { piece: "story", dayOffset: -1, timeOfDay: "18:00", role: "Teaser · calibra interés · abre loop", reason: "La historia con poll/quiz/QA actúa como filtro suave. Los que interactúan entran con intención al carrusel del día siguiente." },
      { piece: "carousel", dayOffset: 0, timeOfDay: "09:00", role: "Editorial · profundiza con framework + caso", reason: "El carrusel es el contenido principal. Entrega la lección completa que la historia prometió." },
      { piece: "reel", dayOffset: 2, timeOfDay: "18:00", role: "Amplificación · pattern interrupt para audiencia fría", reason: "El reel llega 48h después para reforzar recall y alcanzar audiencia no-follower vía push de IG." },
    ],
  },
  CHR: {
    strategyCode: "CHR",
    strategyName: "Carrusel → Historia → Reel",
    rationale: "El carrusel ES la provocación principal · historia genera debate en la comunidad existente · reel amplía la postura a audiencia fría.",
    timeboxDays: 4,
    steps: [
      { piece: "carousel", dayOffset: 0, timeOfDay: "09:00", role: "Postura principal · declaración fuerte", reason: "Cuando el contenido es manifesto o provocación, el carrusel necesita llegar primero sin teaser que diluya el impacto." },
      { piece: "story", dayOffset: 0, timeOfDay: "18:00", role: "Debate · activa engagement con la postura", reason: "La historia del mismo día toma la provocación y la convierte en pregunta abierta a la comunidad. Comentarios entran calientes." },
      { piece: "reel", dayOffset: 2, timeOfDay: "20:00", role: "Viral · lleva la postura a audiencia fría", reason: "El reel amplifica la provocación ya validada por el engagement de la historia. Ritmo noche alto reach." },
    ],
  },
  RHC: {
    strategyCode: "RHC",
    strategyName: "Reel → Historia → Carrusel",
    rationale: "Reel viral top-of-funnel captura audiencia fría · historia filtra interesados con pregunta emocional · carrusel convierte con profundidad.",
    timeboxDays: 5,
    steps: [
      { piece: "reel", dayOffset: 0, timeOfDay: "19:00", role: "Hook viral · capta audiencia nueva", reason: "Launch y story-arc necesitan alcance fuera de followers. El reel es el único formato con distribución algorítmica agresiva." },
      { piece: "story", dayOffset: 1, timeOfDay: "11:00", role: "Filtro · convierte curiosos en leads", reason: "24h después, la historia captura a los que vieron el reel y quieren más. Countdown o lista VIP funciona acá." },
      { piece: "carousel", dayOffset: 3, timeOfDay: "09:00", role: "Conversión · profundidad para la audiencia calificada", reason: "El carrusel cierra la venta con el detalle completo, ya con una audiencia que pasó por dos filtros antes." },
    ],
  },
  RCH: {
    strategyCode: "RCH",
    strategyName: "Reel → Carrusel → Historia",
    rationale: "Descubrimiento viral · conversión rápida con carrusel · historia para comunidad que ya compró o reservó.",
    timeboxDays: 3,
    steps: [
      { piece: "reel", dayOffset: 0, timeOfDay: "19:00", role: "Viral · captura ancha", reason: "Campaña con urgencia requiere alcance máximo día 1. Reel distribuye a no-followers en horas pico." },
      { piece: "carousel", dayOffset: 1, timeOfDay: "12:00", role: "Conversión · el detalle que convierte", reason: "24h después el carrusel llega a los que recuerdan el reel · conversión directa con CTA-keyword." },
      { piece: "story", dayOffset: 2, timeOfDay: "19:00", role: "Retención · comunidad que reserva", reason: "Historia cierra con la lista VIP de los que ya compraron · prueba social + scarcity para próximos." },
    ],
  },
};

const ARCHETYPE_MAP = {
  "case-study": "HCR", framework: "HCR", "data-drop": "HCR",
  listicle: "HCR", "step-by-step": "HCR", "myth-bust": "HCR",
  "provocación": "CHR", provocacion: "CHR", manifesto: "CHR",
  contrarian: "CHR", vs: "CHR",
  "story-arc": "RHC", "before-after": "RHC", "before/after": "RHC",
  launch: "RCH",
};

function resolve(archetype, goal) {
  if (goal === "launch" || goal === "cashflow") return STRATEGIES.RCH;
  const key = (archetype || "").toLowerCase();
  return STRATEGIES[ARCHETYPE_MAP[key] || "HCR"];
}

async function api(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method, headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function main() {
  console.log("⏳ Fetching sets…");
  const { sets } = await api("/api/content-sets", "GET");
  const exp = sets.filter(s => s.name.startsWith("EXP-STORU-"));
  console.log(`✓ ${exp.length} sets · asignando orden\n`);

  const distrib = {};
  for (const s of exp) {
    const order = resolve(s.archetype, s.goal);
    distrib[order.strategyCode] = (distrib[order.strategyCode] || 0) + 1;
    await api("/api/content-sets", "PUT", {
      id: s.id,
      updates: { publishOrder: order },
    });
  }

  console.log(`✓ ${exp.length} sets actualizados\n`);
  console.log("Distribución de estrategias:");
  for (const [code, n] of Object.entries(distrib)) {
    const strat = STRATEGIES[code];
    console.log(`  ${code}  ${strat.strategyName.padEnd(38)} · ${n} sets`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
