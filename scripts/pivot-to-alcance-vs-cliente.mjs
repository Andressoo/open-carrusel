#!/usr/bin/env node
/**
 * Pivot · Storu thesis fix
 *
 * Tesis correcta: "Invierte en tus clientes, no en alcance."
 * Enemigo correcto: gastar en ALCANCE (impresiones · pauta para
 * desconocidos · followers comprados · vanity).
 *
 * Los 50+ sets existentes atacaban "rebajar" o "pauta Meta" como
 * villano · este script reescribe el ÁNGULO de cada set para que
 * apunte al alcance vs cliente, manteniendo:
 *  - mismo archetype, framework, ciudad, CTA keyword
 *  - mismo carrusel (no toca slides)
 *  - reescribe: thread, captions, story text, reel body/cta-context
 *
 * Re-ejecutable · idempotente.
 *
 * Uso:
 *   node scripts/pivot-to-alcance-vs-cliente.mjs
 */

const API = process.env.API_BASE || "http://localhost:3000";

// ── Vertical detection (Consumo · Producto · Servicio) ──
const VERTICAL_BY_RUBRO = {
  // Consumo
  pizz: "Consumo", restaurant: "Consumo", brunch: "Consumo", cev: "Consumo",
  caf: "Consumo", panad: "Consumo", bar: "Consumo", coffee: "Consumo",
  helad: "Consumo",
  // Producto
  ropa: "Producto", retail: "Producto", joyer: "Producto", moda: "Producto",
  papel: "Producto", drop: "Producto", tienda: "Producto",
  // Servicio
  spa: "Servicio", salon: "Servicio", barber: "Servicio", gym: "Servicio",
  fitness: "Servicio", hotel: "Servicio", booking: "Servicio", masc: "Servicio",
  pet: "Servicio", venta: "Servicio",
};

function detectVertical(set) {
  const text = `${set.name} ${set.topic} ${set.anchorBrand || ""}`.toLowerCase();
  for (const [key, v] of Object.entries(VERTICAL_BY_RUBRO)) {
    if (text.includes(key)) return v;
  }
  return "Consumo"; // fallback más común en Colombia pyme
}

// ── Hooks por archetype con el pivot correcto ──
const PIVOT_HOOKS = {
  Provocación: [
    "Estás invirtiendo en quien no te compra mientras el que sí te ignoras.",
    "Cada peso en alcance es un peso menos para reactivar al que ya volvió.",
    "Tu cliente vale 4× más que un follower comprado.",
    "Pagás para que te vea quien jamás te va a comprar.",
  ],
  "Case study": [
    "Dejó de pagar por alcance · invirtió en clientes · facturó más.",
    "Sin pauta · sin descuento · sin vanity · solo incentivos para los que ya volvieron.",
    "El comercio que invirtió en clientes hizo lo que la pauta no logró en 6 meses.",
    "Mismo presupuesto · cero alcance · todo a clientes que ya volvieron una vez.",
  ],
  Contrarian: [
    "Vieja forma: comprar alcance. Nueva forma: diseñar incentivos.",
    "Mientras tu competencia paga por desconocidos · vos reactivás clientes.",
    "El follower comprado se va. El cliente con incentivo, vuelve.",
    "Lo impopular: invertir donde otros no invierten · en quien ya te eligió.",
  ],
  "Myth bust": [
    "Mito: más alcance = más ventas. Verdad: más cliente reactivado = más ventas.",
    "Te vendieron pauta · te quedaste sin margen · y el cliente igual no volvió.",
    "Vanity metrics no pagan facturas · clientes que vuelven sí.",
    "Followers comprados son humo · cliente con incentivo es caja.",
  ],
  Listicle: [
    "5 incentivos que hacen que tu cliente vuelva · cero pauta.",
    "5 formas de invertir en clientes en lugar de en alcance.",
    "5 experimentos · 72h cada uno · todos sobre clientes que ya volvieron.",
    "Top 5 errores de gastar en alcance · y qué hacer en su lugar.",
  ],
  Framework: [
    "Matriz · alcance vs cliente · dónde está cada peso de tu mes.",
    "Framework para decidir: ¿este peso va a alcance o a cliente?",
    "2 ejes · 4 cuadrantes · 1 sola decisión: dejar de financiar desconocidos.",
    "Si no tenés framework, todo tu presupuesto se va a alcance sin que lo veas.",
  ],
  VS: [
    "Pauta para alcance vs incentivo para cliente · elegí ahora.",
    "$1M en pauta o $1M en lista VIP · uno construye, el otro evapora.",
    "A: comprar audiencia. B: reactivar la que ya tenés · resultados opuestos.",
  ],
  "Step by step": [
    "30 minutos para diseñar tu primer incentivo · cero alcance pagado.",
    "5 pasos para mover plata de alcance a cliente · empezá hoy.",
    "Sin pauta · sin descuento · solo experimento con tus clientes actuales.",
  ],
  "Data drop": [
    "Analizamos 100 comercios colombianos · los que invirtieron en cliente ganaron 3.8×.",
    "Data Colombia 2026: cada peso en alcance rinde 0.3× · cada peso en cliente, 4.2×.",
    "100 casos · 3 patrones · todos confirman: cliente > alcance.",
  ],
  "Before/After": [
    "Antes: 70% del budget en pauta. Después: 70% en cliente. Resultado: 4× más ventas.",
    "Movió la plata de alcance a cliente · 4 meses · misma facturación con la mitad del esfuerzo.",
    "Una sola variable cambió: dejaron de pagar por desconocidos.",
  ],
  "Story arc": [
    "Un dueño dejó de pagar pauta · empezó a llamar a sus clientes · pasó esto.",
    "El día que entendió que su mejor cliente ya estaba en su lista de WhatsApp.",
    "Historia real: gastó 6 meses en pauta · 1 mes en clientes · adiviná cuál ganó.",
  ],
  Launch: [
    "Drop sin pauta · solo lista VIP de clientes que ya volvieron.",
    "Pre-venta a clientes existentes · sold-out antes de tocar Meta.",
    "Lanzar a tu cliente, no a tu alcance · 48h · cupos limitados.",
  ],
  Manifesto: [
    "Invierte en tus clientes, no en alcance.",
    "Esto creemos: el cliente vale más que el desconocido al que perseguís con pauta.",
    "No vendemos audiencia comprada · vendemos cliente reactivado.",
  ],
};

// ── Body por archetype con el pivot correcto ──
const PIVOT_BODIES = {
  Provocación: (ctx) => `${ctx.city} · 70% del comercio gasta en alcance · 30% en cliente. Storu invierte la ecuación · 4× más DMs calificados sin pauta.`,
  "Case study": (ctx) => `Comercio en ${ctx.city} · 6 meses · cero pauta · solo incentivos para clientes que ya volvieron una vez · facturación +62%.`,
  Contrarian: (ctx) => `Vieja forma: pagar para que te vea más gente · alcance evapora margen. Nueva forma: diseñar incentivo para los que YA te eligieron · cliente vuelve solo.`,
  "Myth bust": (ctx) => `El mito: alcance = ventas. La data Colombia 2026: cada peso en alcance rinde 0.3× · cada peso en cliente reactivado, 4.2×. Sin filtros · sin gurú gringo.`,
  Listicle: (ctx) => `5 incentivos accionables esta semana · cero pauta · todos para clientes que ya volvieron al menos una vez en 60 días.`,
  Framework: (ctx) => `Matriz 2x2 · eje X = alcance vs cliente · eje Y = costo · 1 ejercicio te muestra dónde se está yendo tu plata sin que lo veas.`,
  VS: (ctx) => `Lado izquierdo: el camino que toman todos · pauta · alcance · vanity. Lado derecho: el camino que paga · incentivo · cliente · experimento medible.`,
  "Step by step": (ctx) => `Paso 1: lista a tus 50 mejores clientes. Paso 2: diseñá un incentivo con nombre. Paso 3: medí 72h. Paso 4: iterá. Paso 5: escalá lo que funcionó.`,
  "Data drop": (ctx) => `100 comercios colombianos analizados · descuento plano: 0.3× ROI · combo nombrado a clientes existentes: 4.2× ROI · keyword en CTA: 4.7× DMs.`,
  "Before/After": (ctx) => `Antes: 70% del marketing en pauta · 30% en clientes. Después: 30% en pauta · 70% en cliente. Resultado: misma facturación con la mitad del esfuerzo.`,
  "Story arc": (ctx) => `Historia real ${ctx.city}: dueño dejó de pagar pauta por 60 días · empezó a llamar clientes que no volvían hace 90 días · 38% reactivó · sin un peso extra.`,
  Launch: (ctx) => `48h de pre-venta · solo lista VIP de clientes que ya volvieron una vez · cero alcance pagado · cupos limitados · drop sold-out.`,
  Manifesto: (ctx) => `Invertimos en clientes, no en alcance. Diseñamos incentivos, no descuentos. Publicamos experimentos, no promesas. Esta es la línea · y no negociamos.`,
};

// ── Captions por archetype con pivot ──
function buildCaptions(set, vertical, ctx) {
  const archetype = detectArchetype(set.name);
  const cta = set.ctaKeyword || "INVIERTE";
  return [
    `${(PIVOT_HOOKS[archetype] || PIVOT_HOOKS.Manifesto)[0]}\n\nComentá ${cta} · te paso el playbook.`,
    `${ctx.city} · ${vertical}.\n\n${PIVOT_BODIES[archetype]?.(ctx) || PIVOT_BODIES.Manifesto(ctx)}\n\nDejá ${cta} abajo.`,
    `Tu cliente ya volvió una vez. ¿Por qué seguís pagando para que te vean los que no te conocen?\n\n${cta} en los comentarios.`,
    `Alcance: gasto. Cliente: inversión. La diferencia caben en una keyword.\n\nComentá ${cta}.`,
    `"Invierte en tus clientes, no en alcance." · Storu · ${set.anchorBrand || ctx.city} aplicó la tesis · funcionó.\n\n${cta} → DM.`,
  ];
}

// ── Story texts por archetype ──
function buildStoryText(archetype) {
  const opts = {
    Provocación: "¿Cuánto de tu marketing va a gente que jamás te compró?",
    "Case study": "Caso real · cero pauta · solo cliente reactivado. ¿Querés el desglose?",
    Contrarian: "Pauta para alcance vs incentivo para cliente. ¿Cuál elegís?",
    "Myth bust": "¿Más alcance = más ventas? Votá. Después te muestro la data.",
    Listicle: "5 incentivos para tus clientes. ¿Cuál ya probaste?",
    Framework: "Matriz alcance vs cliente. ¿En qué cuadrante estás?",
    VS: "Pauta o lista VIP. Una sola elección este mes.",
    "Step by step": "30 min para tu primer experimento con clientes. ¿Empezamos?",
    "Data drop": "100 comercios analizados. Preguntame qué hallamos.",
    "Before/After": "Antes vs después · cuando movió la plata de alcance a cliente.",
    "Story arc": "Te cuento qué pasó cuando dejó de pagar pauta. Preguntame.",
    Launch: "Drop sin pauta · solo lista VIP. Faltan 72h.",
    Manifesto: "¿De acuerdo o no? \"Invierte en tus clientes, no en alcance.\"",
  };
  return opts[archetype] || opts.Manifesto;
}

function detectArchetype(name) {
  const parts = name.split("·").map((p) => p.trim());
  return parts[2] || parts[1] || "Manifesto";
}

function extractCity(anchorBrand) {
  const cities = ["Bogotá","Medellín","Cartagena","Barranquilla","Cali","Bucaramanga","Pereira","Santa Marta"];
  return cities.find((c) => anchorBrand?.includes(c)) || "Colombia";
}

// ── API helpers ──
async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

// ── Main ──
async function main() {
  console.log("⏳ Fetching sets…");
  const { sets } = await api("/api/content-sets");
  const exp = sets.filter((s) => s.name.startsWith("EXP-STORU-"));
  console.log(`✓ ${exp.length} sets a re-pivotar\n`);

  // Sort for deterministic round-robin within archetype
  exp.sort((a, b) => a.name.localeCompare(b.name));

  let updated = 0;
  let storyUpd = 0;
  let reelUpd = 0;
  const archetypeCounter = {};

  // Get all reels and stories for reference
  const reels = (await api("/api/reels").catch(() => ({ reels: [] }))).reels || [];
  const stories = (await api("/api/stories").catch(() => ({ stories: [] }))).stories || [];
  const reelById = new Map(reels.map((r) => [r.id, r]));
  const storyById = new Map(stories.map((s) => [s.id, s]));

  for (const s of exp) {
    const archetype = detectArchetype(s.name);
    const vertical = detectVertical(s);
    const city = extractCity(s.anchorBrand);
    const idx = (archetypeCounter[archetype] = (archetypeCounter[archetype] || 0) + 1) - 1;
    const ctx = { city, vertical };

    const hooks = PIVOT_HOOKS[archetype] || PIVOT_HOOKS.Manifesto;
    const bodyFn = PIVOT_BODIES[archetype] || PIVOT_BODIES.Manifesto;

    const newHook = hooks[idx % hooks.length];
    const newBody = bodyFn(ctx);
    const newCaptions = buildCaptions(s, vertical, ctx);
    const newStoryText = buildStoryText(archetype);

    // Updated thread
    const newThread = [
      `Vertical: ${vertical} · Ciudad: ${city} · Archetype: ${archetype}`,
      ``,
      `Tesis aplicada: "Invierte en tus clientes, no en alcance."`,
      `Enemigo del set: gastar en ALCANCE (pauta para desconocidos · followers comprados · vanity).`,
      `Solución del set: diseñar incentivo para CLIENTE que ya volvió al menos una vez.`,
      ``,
      `Hook reel: ${newHook}`,
      `Body reel: ${newBody}`,
      `Story teaser: ${newStoryText}`,
      ``,
      `CTA keyword única: ${s.ctaKeyword}`,
      ``,
      `Captions (5 variaciones distintas, todas pivotean alcance vs cliente):`,
      ...newCaptions.map((c, i) => `  ${i + 1}. ${c.split("\n")[0]}`),
    ].join("\n");

    // 1. Update set metadata (thread + captions)
    await api("/api/content-sets", "PUT", {
      id: s.id,
      updates: {
        thread: newThread,
        possibleCaptions: newCaptions,
        sceneDetails: `Vertical: ${vertical} · Ciudad: ${city}.\nLa tesis "Invierte en tus clientes, no en alcance" se ve en los slides: enemigo declarado = pauta a desconocidos, héroe = cliente que ya volvió.\nAttachments: ${(s.references || []).length} referencias visuales.\nFramework narrativo: el del set (${archetype}).\nMood: directo · sin gurú · sin emoji excepto los de la marca.`,
      },
    });
    updated++;

    // 2. Update story text
    if (s.story?.id && storyById.has(s.story.id)) {
      const oldStory = storyById.get(s.story.id);
      const newStory = await api("/api/stories", "POST", {
        dynamic: oldStory.dynamic || "poll",
        text: newStoryText,
        options: oldStory.options,
        accentColor: oldStory.accentColor || "#F8C644",
        bgColor: oldStory.bgColor || "#0E0D12",
        bgImage: oldStory.bgImage,
        setId: s.id,
      });
      await api("/api/content-sets", "PUT", {
        id: s.id,
        piece: "story",
        updates: { id: newStory.id, status: "ready" },
      });
      storyUpd++;
    }

    // 3. Update reel hook + body (preserve template)
    if (s.reel?.id && reelById.has(s.reel.id)) {
      const oldReel = reelById.get(s.reel.id);
      const oldProps = oldReel.props || {};
      // For TikTokHook-family templates use hook/body/cta
      // For BeforeAfter, SplitScreen, etc keep their own structure but rewrite the messaging
      const isHbc = ["TikTokHook", "GlitchIntro", "StatDrop", "Typewriter", "PosterSlam"].includes(oldReel.template);
      const newProps = {
        ...oldProps,
        hook: isHbc ? newHook : oldProps.hook,
        body: isHbc ? newBody : oldProps.body,
        cta: oldProps.cta || `Comentá ${s.ctaKeyword}`,
      };
      const newReel = await api("/api/reels", "POST", {
        template: oldReel.template,
        props: newProps,
        duration: oldReel.duration,
        fps: oldReel.fps,
        aspectRatio: oldReel.aspectRatio,
      });
      await api("/api/content-sets", "PUT", {
        id: s.id,
        piece: "reel",
        updates: { id: newReel.id, status: "ready" },
      });
      reelUpd++;
    }

    if (updated % 10 === 0) console.log(`  · ${updated}/${exp.length}`);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ Sets re-pivotados:    ${updated}`);
  console.log(`✓ Stories reescritas:   ${storyUpd}`);
  console.log(`✓ Reels reescritos:     ${reelUpd}`);
  console.log(`\nDistribución por archetype:`);
  for (const [a, n] of Object.entries(archetypeCounter).sort((a, b) => b[1] - a[1])) {
    console.log(`  · ${a.padEnd(20)} ${n}`);
  }
  console.log(`═══════════════════════════════════════`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
