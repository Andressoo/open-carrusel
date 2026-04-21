#!/usr/bin/env node
/**
 * Creates D51 end-to-end as a worked example:
 *  - ContentSet with experiment signature + framework + captions + refs
 *  - Carousel with 5 real HTML slides following the Hook-Story-Offer framework
 *  - Coherent Story (Q&A teaser)
 *  - Coherent Reel (TikTokHook template with distinct script)
 *
 * Usage:
 *   node scripts/create-d51.mjs
 */

const API = process.env.API_BASE || "http://localhost:3000";

// ══════ CONTENT · D51 · Case study · Panadería Barranquilla ══════

const EXPERIMENT = {
  id: "EXP-STORU-51",
  carouselName: "D51 · Case study · Panadería en Barranquilla pasó de 18 a 85 clientes/martes",
  framework: "Hook-Story-Offer",
  goal: "valley",
  archetype: "case-study",
  ctaKeyword: "PANADERIA",
  city: "Barranquilla",
  anchorBrand: "Pan del Río · Alto Prado, Barranquilla",
  topic: "Panadería en Barranquilla pasó de 18 a 85 clientes/martes sin rebajar",
};

const NARRATIVE = {
  hook: "Pan del Río pasó de 18 a 85 clientes un martes. Sin rebajar.",
  pain: "Martes muerto · cero tráfico · el dueño pensaba cerrar los martes.",
  insight: "Reemplazaron el 'martes 2x1' por un combo curado (pan + café filtrado + mermelada artesanal) con nombre propio: 'Martes de barrio'.",
  desire: "85 clientes + 23 reviews nuevas de Google en 4 martes · sin un peso en pauta.",
};

const CAPTIONS = [
  `Pan del Río pasó de 18 a 85 clientes un martes.\n\nNo bajaron precios. Diseñaron un ritual.\n\nComentá PANADERIA y te paso el playbook exacto que usaron.`,
  `"Martes muerto" era verdad hasta que dejaron de competir por precio y empezaron a competir por ritual.\n\nAhora: 85 clientes, 23 reviews nuevas, 0 pesos en pauta.\n\nComentá PANADERIA.`,
  `Si tu martes está muerto y pensaste bajar precio: pará.\n\nMirá lo que hicieron en Alto Prado. 4x más clientes, mejor margen. Comentá PANADERIA.`,
  `Caso real Barranquilla · 4 martes · 340% más clientes.\n\nLa única variable: reemplazar "2x1" por un combo con nombre propio.\n\nComentá PANADERIA.`,
  `Historia del martes que cambió todo para una panadería en Alto Prado. Te paso los 5 cambios exactos.\n\nComentá PANADERIA y va al DM.`,
];

const HASHTAGS = [
  "storu", "panaderia", "barranquilla", "pymescolombia", "experimentos",
  "comercioscolombia", "martesvalle", "casorealmayorista", "incentivos", "colombia",
];

function seededPicsum(seed, w, h) {
  const s = encodeURIComponent(String(seed).slice(0, 40));
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

// ══════ CAROUSEL SLIDES ══════

// Storu palette
const INK = "#0E0D12";
const VIOLET = "#5635FD";
const YELLOW = "#F8C644";
const WHITE = "#FFFFFF";

function slideShell(body) {
  return `<style>*{box-sizing:border-box;margin:0;padding:0}.s{width:100%;height:100%;position:relative;font-family:'Poppins',system-ui,sans-serif;overflow:hidden;color:${WHITE}}.mono{font-family:'JetBrains Mono',monospace}</style>${body}`;
}

const SLIDES = [
  // Slide 1 · HOOK (big provocation)
  slideShell(`
<div class="s" style="background:${INK};padding:80px 60px;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div class="mono" style="font-size:22px;color:${YELLOW};letter-spacing:3px;margin-bottom:12px">EXP-STORU-51 · CASE STUDY</div>
    <div style="font-size:14px;color:#888;letter-spacing:2px;text-transform:uppercase">📍 Alto Prado, Barranquilla</div>
  </div>
  <div style="font-size:88px;font-weight:900;line-height:0.95;letter-spacing:-3px">
    De <span style="color:${YELLOW};text-decoration:line-through;text-decoration-thickness:8px">18</span>
    a <span style="color:${YELLOW}">85</span> clientes
    <br><span style="font-size:58px;color:#ccc;font-weight:700">un martes. Sin rebajar.</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end">
    <div style="font-size:20px;color:#888">Pan del Río · martes 8am-1pm</div>
    <div style="background:${YELLOW};color:${INK};padding:12px 20px;border-radius:999px;font-size:18px;font-weight:900">1/5 →</div>
  </div>
</div>`),

  // Slide 2 · INSIGHT (problem + insight)
  slideShell(`
<div class="s" style="background:${VIOLET};padding:80px 60px;display:flex;flex-direction:column;gap:40px;justify-content:center">
  <div class="mono" style="font-size:20px;color:${YELLOW};letter-spacing:3px">EL PROBLEMA</div>
  <div style="font-size:62px;font-weight:900;line-height:1;letter-spacing:-2px">
    "Martes muerto" no<br>es un hecho. Es un<br><span style="background:${YELLOW};color:${INK};padding:4px 14px">síntoma</span>.
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
    <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.15)">
      <div class="mono" style="font-size:14px;color:${YELLOW};letter-spacing:2px;margin-bottom:6px">FALSO</div>
      <div style="font-size:22px;font-weight:700;line-height:1.3">"Los martes no hay gente."</div>
    </div>
    <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.15)">
      <div class="mono" style="font-size:14px;color:${YELLOW};letter-spacing:2px;margin-bottom:6px">CIERTO</div>
      <div style="font-size:22px;font-weight:700;line-height:1.3">No tenés un motivo <i>para</i> ir un martes.</div>
    </div>
  </div>
  <div class="mono" style="text-align:right;font-size:16px;color:${YELLOW};margin-top:10px">2/5 →</div>
</div>`),

  // Slide 3 · REFRAME (the shift)
  slideShell(`
<div class="s" style="background:${INK};padding:80px 60px;display:flex;flex-direction:column;gap:36px;justify-content:center">
  <div class="mono" style="font-size:20px;color:${YELLOW};letter-spacing:3px">EL CAMBIO</div>
  <div style="display:flex;gap:24px;align-items:stretch">
    <div style="flex:1;background:rgba(255,59,92,0.1);border:2px solid #ff3b5c;padding:24px;border-radius:16px">
      <div class="mono" style="font-size:14px;color:#ff3b5c;letter-spacing:2px;margin-bottom:10px">ANTES</div>
      <div style="font-size:36px;font-weight:900;margin-bottom:10px;text-decoration:line-through;text-decoration-thickness:4px;color:#888">"Martes 2x1 en pan"</div>
      <ul style="list-style:none;font-size:16px;color:#aaa;line-height:1.7">
        <li>• Rebaja 50%</li>
        <li>• Margen destrozado</li>
        <li>• 18 clientes/martes</li>
      </ul>
    </div>
    <div style="flex:1;background:${YELLOW};color:${INK};padding:24px;border-radius:16px">
      <div class="mono" style="font-size:14px;letter-spacing:2px;margin-bottom:10px">AHORA</div>
      <div style="font-size:36px;font-weight:900;margin-bottom:10px">"Martes de barrio"</div>
      <ul style="list-style:none;font-size:16px;line-height:1.7;color:${INK}">
        <li>• Combo curado con nombre</li>
        <li>• Pan + café filtrado + mermelada</li>
        <li>• Precio fijo · margen intacto</li>
      </ul>
    </div>
  </div>
  <div style="text-align:center;font-size:28px;font-weight:800;color:${YELLOW};margin-top:10px">
    Mismo producto · distinto marco narrativo
  </div>
  <div class="mono" style="text-align:right;font-size:16px;color:${YELLOW}">3/5 →</div>
</div>`),

  // Slide 4 · PROOF (numbers)
  slideShell(`
<div class="s" style="background:${WHITE};color:${INK};padding:60px 50px;display:flex;flex-direction:column;gap:28px;justify-content:center">
  <div class="mono" style="font-size:20px;color:${VIOLET};letter-spacing:3px">LA DATA · 4 MARTES</div>
  <div style="font-size:48px;font-weight:900;line-height:1;letter-spacing:-2px">
    85 clientes · 23 reviews · 0 pauta.
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:10px">
    <div style="background:${INK};color:${WHITE};padding:24px;border-radius:16px;text-align:center">
      <div style="font-size:64px;font-weight:900;color:${YELLOW};line-height:1">4.7x</div>
      <div class="mono" style="font-size:13px;letter-spacing:2px;margin-top:6px;opacity:0.7">MÁS CLIENTES</div>
    </div>
    <div style="background:${INK};color:${WHITE};padding:24px;border-radius:16px;text-align:center">
      <div style="font-size:64px;font-weight:900;color:${YELLOW};line-height:1">+38%</div>
      <div class="mono" style="font-size:13px;letter-spacing:2px;margin-top:6px;opacity:0.7">TICKET PROMEDIO</div>
    </div>
    <div style="background:${INK};color:${WHITE};padding:24px;border-radius:16px;text-align:center">
      <div style="font-size:64px;font-weight:900;color:${YELLOW};line-height:1">23</div>
      <div class="mono" style="font-size:13px;letter-spacing:2px;margin-top:6px;opacity:0.7">REVIEWS NUEVAS</div>
    </div>
  </div>
  <div style="background:${VIOLET};color:${WHITE};padding:20px 24px;border-radius:14px;display:flex;gap:16px;align-items:center">
    <div style="font-size:40px">📸</div>
    <div style="font-size:15px;line-height:1.4">
      <b>Evidencia en DM:</b> tiquete 1 (martes 4 feb · 18 clientes) vs tiquete 4 (martes 25 feb · 85 clientes). Mismo local · mismo dueño · mismo equipo.
    </div>
  </div>
  <div class="mono" style="text-align:right;font-size:16px;color:${VIOLET}">4/5 →</div>
</div>`),

  // Slide 5 · CTA
  slideShell(`
<div class="s" style="background:${INK};padding:80px 60px;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div class="mono" style="font-size:20px;color:${YELLOW};letter-spacing:3px;margin-bottom:20px">TU TURNO · 5 PASOS</div>
    <div style="font-size:56px;font-weight:900;line-height:1;letter-spacing:-2px">Te paso el playbook exacto.</div>
  </div>
  <div style="background:${VIOLET};padding:30px 24px;border-radius:20px;display:flex;flex-direction:column;gap:16px">
    <ul style="list-style:none;font-size:20px;line-height:1.5;color:${WHITE}">
      <li>✓ Los 5 cambios que hizo Pan del Río</li>
      <li>✓ Plantilla del combo "Martes de barrio" adaptable</li>
      <li>✓ Sheet para medir tus 4 martes</li>
      <li>✓ Scripts para Stories · Reel · carrusel</li>
    </ul>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:18px">
    <div style="font-size:32px;font-weight:800;color:${WHITE};text-align:center">
      Comentá la palabra
    </div>
    <div style="background:${YELLOW};color:${INK};padding:22px 56px;border-radius:999px;font-size:72px;font-weight:900;letter-spacing:-2px;font-family:'JetBrains Mono',monospace;box-shadow:0 20px 50px rgba(248,198,68,0.4)">
      PANADERIA
    </div>
    <div style="font-size:16px;color:#888">y te llega al DM en 10 min.</div>
  </div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:14px;color:#666;letter-spacing:2px">
    <span>STORU · EXPERIMENTOS COMERCIO COLOMBIA</span>
    <span>5/5 ✓</span>
  </div>
</div>`),
];

// ══════ API HELPERS ══════

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} · ${text.slice(0, 200)}`);
  try { return JSON.parse(text); } catch { return text; }
}

// ══════ MAIN ══════

async function main() {
  console.log(`⏳ Creando ${EXPERIMENT.id} · ${EXPERIMENT.carouselName}\n`);

  // 1. Create carousel
  console.log("  1. Carrusel…");
  const carousel = await api("/api/carousels", "POST", {
    name: EXPERIMENT.carouselName,
    aspectRatio: "4:5",
  });
  console.log(`     ✓ id ${carousel.id.slice(0, 8)}`);

  // 2. Add 5 slides
  console.log("  2. Slides (5)…");
  for (let i = 0; i < SLIDES.length; i++) {
    await api(`/api/carousels/${carousel.id}/slides`, "POST", { html: SLIDES[i] });
    console.log(`     ✓ slide ${i + 1}/5`);
  }

  // 3. Create ContentSet
  console.log("  3. ContentSet…");
  const set = await api("/api/content-sets", "POST", {
    name: `${EXPERIMENT.id} · ${EXPERIMENT.carouselName}`,
    topic: EXPERIMENT.topic,
    goal: EXPERIMENT.goal,
    archetype: EXPERIMENT.archetype,
    ctaKeyword: EXPERIMENT.ctaKeyword,
    anchorBrand: EXPERIMENT.anchorBrand,
    thread: `Framework: Hook-Story-Offer (Russell Brunson).\nHistoria teasea con Q&A desde ${EXPERIMENT.city} · Carrusel profundiza con case study real y 3 números ancla · Reel cierra el loop con pattern interrupt y CTA ${EXPERIMENT.ctaKeyword}.\n\nMismo hook en las 3 piezas · tono barranquillero auténtico.`,
    experimentPurpose: `Probar si un case study real con números concretos (4.7x clientes, +38% ticket) publicado en 3 piezas coherentes (Historia + Carrusel + Reel) en 72h genera 2x más DMs calificados con keyword ${EXPERIMENT.ctaKeyword} vs un carrusel genérico sobre horas valle.`,
    hypothesis: `Si publicamos el set completo con framework Hook-Story-Offer desde un caso colombiano nombrado, la tasa de DMs duplica y el save rate del carrusel supera 10%.`,
    kpis: [
      `DMs con keyword ${EXPERIMENT.ctaKeyword} / 72h (target: >40)`,
      `Save rate del carrusel (target: >10%)`,
      `Complete rate del reel (target: >65%)`,
      `Reach share vs followers (target: >2.5x)`,
      `Timebox: 72 horas desde publicación coordinada`,
      `Framework: Hook-Story-Offer`,
    ],
    sceneDetails: `Framework: Hook-Story-Offer.\nLocación: Alto Prado, Barranquilla (carnaval, comercio costeño, Río Magdalena).\nPan del Río los martes 8am-1pm. Tipo café-panadería de barrio.\nLuz cálida natural, plano medio del mostrador con pan recién hecho + mermelada artesanal + café filtrado con V60.\nPropietario visible pero discreto (prop en mano: tiquete impreso del martes antes vs martes 4).\nPaleta Storu (ink ${INK} · violet ${VIOLET} · yellow ${YELLOW}).\nMood real barranquillero, nada corporativo.`,
    possibleCaptions: CAPTIONS,
    hashtags: HASHTAGS,
    references: [
      { url: seededPicsum(`${EXPERIMENT.id}-inspiration`, 1080, 1350), type: "inspiration", name: `Ref · ${EXPERIMENT.city}` },
      { url: seededPicsum(`${EXPERIMENT.id}-location`, 1080, 1080), type: "location", name: `Locación · ${EXPERIMENT.city}` },
      { url: seededPicsum(`${EXPERIMENT.id}-product`, 1080, 1350), type: "product", name: "Producto · combo Martes de barrio" },
      { url: seededPicsum(`${EXPERIMENT.id}-team`, 1080, 1080), type: "team", name: "Equipo · dueño Pan del Río" },
    ],
    status: "draft",
  });
  console.log(`     ✓ id ${set.id.slice(0, 8)}`);

  // 4. Link carousel to set
  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "carousel", updates: { id: carousel.id, status: "draft" },
  });

  // 5. Create Story with its own teaser script
  console.log("  4. Historia (teaser)…");
  const story = await api("/api/stories", "POST", {
    dynamic: "qa",
    text: `Panadería en Barranquilla · pasó de 18 a 85 un martes. ¿Querés el playbook?`,
    accentColor: YELLOW,
    bgColor: INK,
    setId: set.id,
  });
  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "story", updates: { id: story.id, status: "draft" },
  });
  console.log(`     ✓ id ${story.id.slice(0, 8)}`);

  // 6. Create Reel with its own pattern-interrupt script (distinct from carousel)
  console.log("  5. Reel (pattern interrupt distinto al carrusel)…");
  const reel = await api("/api/reels", "POST", {
    template: "TikTokHook",
    props: {
      hook: "Alto Prado, Barranquilla.",
      body: "Panadería pasó de 18 a 85 clientes un martes sin rebajar. Te cuento el cambio exacto que hicieron.",
      cta: `Comentá ${EXPERIMENT.ctaKeyword}`,
      accentColor: YELLOW,
      bgColor: INK,
      textColor: WHITE,
    },
    duration: 10,
    fps: 30,
    aspectRatio: "9:16",
  });
  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "reel", updates: { id: reel.id, status: "draft" },
  });
  console.log(`     ✓ id ${reel.id.slice(0, 8)}`);

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ ${EXPERIMENT.id} creado end-to-end`);
  console.log(`  Set: ${set.id}`);
  console.log(`  → http://localhost:3000/set/${set.id}`);
  console.log(`  Carrusel ${carousel.id.slice(0, 8)} · 5 slides`);
  console.log(`  Historia ${story.id.slice(0, 8)} · Q&A teaser`);
  console.log(`  Reel ${reel.id.slice(0, 8)} · TikTokHook 10s`);
  console.log(`═══════════════════════════════════════`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
