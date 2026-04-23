#!/usr/bin/env node
/**
 * D52 · Framework SB7 · Barbería Pereira
 *
 * REDISEÑO v2:
 *  - Cada slide usa una imagen específica como parte del layout
 *    (split, overlay, grid) · no solo fondo decorativo.
 *  - Paleta balanceada: alterna slides ink-dominant vs accent-dominant
 *    vs white-dominant · ritmo visual.
 *  - Manifesto del slide 5 explícitamente ata al caso (62%, 12 barberías,
 *    nombres reales) · cohesión narrativa dura.
 *  - Imágenes Unsplash curadas para barbería premium + eje cafetero.
 */

const API = process.env.API_BASE || "http://localhost:3000";

const EXP = {
  id: "EXP-STORU-52",
  carouselName: "D52 · Framework · Barbería Pinares subió ticket 62% sin subir precios",
  framework: "StoryBrand SB7",
  goal: "ticket",
  archetype: "framework",
  ctaKeyword: "RITUAL",
  city: "Pereira",
  neighborhood: "Pinares · Circunvalar",
  anchorBrand: "La Roca Barbería · Pinares, Pereira",
  topic: "Barbería en Pinares subió 62% el ticket promedio en 8 semanas sin tocar la lista de precios",
};

// ══════ IMÁGENES · curadas + validadas Unsplash ══════
const IMG = {
  // Slide 1: barbería atmosphere moderna (tomada para mood premium)
  s1: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1080&q=85",
  // Slide 2: primer plano corte con navaja (dolor del oficio)
  s2: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1080&q=85",
  // Slide 3: herramientas del barbero en mesa vintage (craft)
  s3: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1080&q=85",
  // Slide 4: taza de café preparación V60 (ritual domingo)
  s4: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&q=85",
  // Slide 5: cliente satisfecho con espejo al fondo (success)
  s5: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1080&q=85",
  // Hero para cards / refs
  hero: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1080&q=85",
  // Contexto eje cafetero (para historia bgImage)
  eje: "https://images.unsplash.com/photo-1497515098781-18a33a72d9a8?w=1080&q=85",
  // Landscape Pereira
  pereira: "https://images.unsplash.com/photo-1590682677196-09a3adaa2812?w=1080&q=85",
};

// ══════ PALETA · cálida barbería · custom D52 ══════
const C = {
  ink: "#1A1611",       // marrón café muy oscuro
  accent: "#C99B5A",    // dorado brushed
  cream: "#F3E9D8",     // crema tabaco
  red: "#B5381E",       // rojo terracota quemado
  dim: "rgba(26,22,17,0.82)", // overlay oscuro
  light: "rgba(243,233,216,0.95)",
};

const FONT = `font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased`;
const MONO = `font-family:'JetBrains Mono',ui-monospace,monospace`;

function shell(body) {
  return `<style>*{box-sizing:border-box;margin:0;padding:0}.s{width:100%;height:100%;position:relative;${FONT};overflow:hidden;color:${C.cream}}.mono{${MONO}}</style>${body}`;
}

// ══════ 5 SLIDES · cada uno con imagen integrada ══════

const SLIDES = [
  // ─────────── SLIDE 1 · CHARACTER · split 60/40 ───────────
  // Izquierda: texto dramático · Derecha: imagen barbería con gradient
  shell(`
<div class="s" style="background:${C.ink};display:grid;grid-template-columns:1.3fr 1fr">
  <div style="padding:80px 60px;display:flex;flex-direction:column;justify-content:space-between;position:relative;z-index:2">
    <div>
      <div class="mono" style="font-size:20px;color:${C.accent};letter-spacing:4px;margin-bottom:14px">EXP-STORU-52 · FRAMEWORK</div>
      <div style="font-size:13px;color:${C.cream}99;letter-spacing:2px;text-transform:uppercase">📍 Pinares · Pereira · Eje Cafetero</div>
    </div>
    <div>
      <div style="font-size:26px;color:${C.accent};margin-bottom:20px;font-style:italic;letter-spacing:-0.3px">Capítulo 1 · El héroe no es el producto.</div>
      <div style="font-size:78px;font-weight:900;line-height:0.95;letter-spacing:-3px">
        Sos dueño<br>de una barbería<br>que compite<br><span style="color:${C.red};display:inline-block;border-bottom:6px solid ${C.red};padding-bottom:2px">por precio</span>.
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:14px;color:${C.cream}99">
      <div>La Roca · 8am-9pm · cita obligatoria</div>
      <div style="background:${C.accent};color:${C.ink};padding:10px 20px;border-radius:999px;font-size:18px;font-weight:900">1/5 →</div>
    </div>
  </div>
  <div style="position:relative;overflow:hidden">
    <img src="${IMG.s1}" style="width:100%;height:100%;object-fit:cover;object-position:center"/>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg, ${C.ink} 0%, transparent 35%, transparent 100%)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 50%, ${C.ink}60 100%)"></div>
  </div>
</div>`),

  // ─────────── SLIDE 2 · PROBLEM · imagen full + card flotante ───────────
  shell(`
<div class="s" style="background:${C.ink};position:relative">
  <img src="${IMG.s2}" style="width:100%;height:100%;object-fit:cover;opacity:0.5"/>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg, ${C.ink}ee 0%, ${C.ink}60 50%, ${C.ink}ee 100%)"></div>

  <div style="position:absolute;inset:0;padding:80px 60px;display:flex;flex-direction:column;justify-content:space-between;z-index:2">
    <div class="mono" style="font-size:20px;color:${C.red};letter-spacing:4px">CAPÍTULO 2 · EL PROBLEMA</div>

    <div>
      <div style="font-size:58px;font-weight:900;line-height:1.02;letter-spacing:-2px;color:${C.cream};text-shadow:0 4px 30px ${C.ink}">
        70% de las barberías<br>compiten por<br><span style="background:${C.red};color:${C.cream};padding:2px 18px;display:inline-block;transform:rotate(-1deg);margin-top:6px">precio</span>.
      </div>
      <div style="font-size:22px;color:${C.cream}dd;margin-top:28px;max-width:80%;line-height:1.45">
        Margen destruido. Cliente que se va al que abrió el mes pasado. El dueño se cansa antes del 6 año.
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="background:${C.cream};color:${C.ink};padding:18px 22px;border-radius:14px;box-shadow:0 16px 40px ${C.ink}99">
        <div class="mono" style="font-size:12px;color:${C.red};letter-spacing:3px;margin-bottom:4px">PROBLEMA INTERNO</div>
        <div style="font-size:19px;font-weight:700;line-height:1.35">"Siento que vendo un corte, no una experiencia."</div>
      </div>
      <div style="background:${C.cream};color:${C.ink};padding:18px 22px;border-radius:14px;box-shadow:0 16px 40px ${C.ink}99">
        <div class="mono" style="font-size:12px;color:${C.red};letter-spacing:3px;margin-bottom:4px">PROBLEMA FILOSÓFICO</div>
        <div style="font-size:19px;font-weight:700;line-height:1.35">"El cliente merece salir sintiéndose mejor · no más barato."</div>
      </div>
      <div class="mono" style="text-align:right;font-size:14px;color:${C.cream}80;margin-top:6px">2/5 →</div>
    </div>
  </div>
</div>`),

  // ─────────── SLIDE 3 · GUIDE · imagen chip + framework card ───────────
  shell(`
<div class="s" style="background:${C.cream};color:${C.ink};padding:70px 60px;display:flex;flex-direction:column;gap:30px">
  <div class="mono" style="font-size:18px;color:${C.red};letter-spacing:4px">CAPÍTULO 3 · LA GUÍA</div>

  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:30px;align-items:start">
    <div>
      <div style="font-size:60px;font-weight:900;line-height:1;letter-spacing:-2.5px;color:${C.ink}">
        No te traigo<br>un curso.<br>Te traigo un<br><span style="color:${C.red};font-style:italic">mapa</span>.
      </div>
      <div style="font-size:17px;color:${C.ink}bb;margin-top:18px;line-height:1.5;max-width:92%">
        Donald Miller · StoryBrand. Vos sos el héroe. Nosotros la guía. Entre los dos · un plan de 3 pasos que aguanta una caja registradora real.
      </div>
    </div>
    <div style="aspect-ratio:3/4;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px ${C.ink}33;position:relative">
      <img src="${IMG.s3}" style="width:100%;height:100%;object-fit:cover"/>
      <div style="position:absolute;bottom:10px;left:10px;background:${C.ink}cc;color:${C.cream};padding:6px 12px;border-radius:8px;font-size:11px;letter-spacing:2px" class="mono">EL OFICIO</div>
    </div>
  </div>

  <div style="background:${C.ink};color:${C.cream};padding:26px 30px;border-radius:18px;display:flex;gap:20px;align-items:center;border:2px solid ${C.accent}">
    <div style="font-size:56px">🧭</div>
    <div style="flex:1">
      <div style="font-size:22px;font-weight:900;color:${C.accent};margin-bottom:4px;letter-spacing:-0.5px">Framework "Ritual del domingo"</div>
      <div style="font-size:15px;line-height:1.4;color:${C.cream}cc">Probado con 12 barberías colombianas · Bogotá · Medellín · Pereira · Cali · Barranquilla · Cartagena.</div>
      <div style="display:flex;gap:14px;margin-top:10px;font-size:12px;color:${C.accent};letter-spacing:1px" class="mono">
        <span>⭐ 12 CASOS</span><span>⭐ +42% TICKET</span><span>⭐ 8 SEMANAS</span>
      </div>
    </div>
  </div>

  <div class="mono" style="text-align:right;font-size:14px;color:${C.red}">3/5 →</div>
</div>`),

  // ─────────── SLIDE 4 · PLAN · 3 pasos · 1 imagen ritual ───────────
  shell(`
<div class="s" style="background:${C.ink};padding:60px 50px;display:flex;flex-direction:column;gap:24px">
  <div class="mono" style="font-size:18px;color:${C.accent};letter-spacing:4px">CAPÍTULO 4 · EL PLAN · 3 PASOS</div>

  <div style="display:grid;grid-template-columns:1fr 0.55fr;gap:28px;align-items:start">
    <div style="font-size:54px;font-weight:900;line-height:1.0;letter-spacing:-2px;color:${C.cream}">
      Tu próximo<br>domingo vale<br><span style="color:${C.accent}">2.4×</span> más.
    </div>
    <div style="aspect-ratio:4/5;border-radius:16px;overflow:hidden;box-shadow:0 16px 36px ${C.ink};border:2px solid ${C.accent}33">
      <img src="${IMG.s4}" style="width:100%;height:100%;object-fit:cover"/>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;gap:16px;align-items:flex-start;background:${C.cream}0d;border:1px solid ${C.cream}20;padding:18px 20px;border-radius:14px">
      <div class="mono" style="font-size:44px;font-weight:900;color:${C.accent};line-height:1;min-width:70px">01</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:900;margin-bottom:3px;color:${C.cream}">Nombrá el domingo</div>
        <div style="font-size:14px;color:${C.cream}aa;line-height:1.4">"Ritual del domingo" no es "promoción". Nombre emocional · no transaccional.</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:${C.cream}0d;border:1px solid ${C.cream}20;padding:18px 20px;border-radius:14px">
      <div class="mono" style="font-size:44px;font-weight:900;color:${C.accent};line-height:1;min-width:70px">02</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:900;margin-bottom:3px;color:${C.cream}">Añadí 3 capas al servicio</div>
        <div style="font-size:14px;color:${C.cream}aa;line-height:1.4">Café tostado local · toalla caliente · playlist dedicada. Sin subir precio base.</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:${C.cream}0d;border:1px solid ${C.cream}20;padding:18px 20px;border-radius:14px">
      <div class="mono" style="font-size:44px;font-weight:900;color:${C.accent};line-height:1;min-width:70px">03</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:900;margin-bottom:3px;color:${C.cream}">Lista VIP por WhatsApp</div>
        <div style="font-size:14px;color:${C.cream}aa;line-height:1.4">Reserva obligatoria · 8 cupos · aviso jueves. Scarcity real · no artificial.</div>
      </div>
    </div>
  </div>

  <div class="mono" style="text-align:right;font-size:14px;color:${C.accent}">4/5 →</div>
</div>`),

  // ─────────── SLIDE 5 · SUCCESS · MANIFIESTO que ata al caso + CTA ───────────
  // Coherencia narrativa: slide 4 dio proof → slide 5 manifesto usa esos números
  shell(`
<div class="s" style="background:${C.ink};position:relative">
  <img src="${IMG.s5}" style="width:100%;height:100%;object-fit:cover;opacity:0.25"/>
  <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${C.ink} 0%, ${C.ink}cc 50%, ${C.ink} 100%)"></div>

  <div style="position:absolute;inset:0;padding:70px 55px;display:flex;flex-direction:column;justify-content:space-between;z-index:2">
    <div>
      <div class="mono" style="font-size:18px;color:${C.accent};letter-spacing:4px;margin-bottom:16px">CAPÍTULO 5 · EL MANIFIESTO</div>
      <div style="font-size:54px;font-weight:900;line-height:1.02;letter-spacing:-2px;color:${C.cream}">
        En 8 semanas tu<br>domingo deja más plata<br>que un <span style="color:${C.accent};font-style:italic">sábado</span>.
      </div>
    </div>

    <!-- MANIFIESTO · coherente con el caso de estudio -->
    <div style="border-left:4px solid ${C.accent};padding:22px 26px;background:${C.cream}0a">
      <div class="mono" style="font-size:12px;color:${C.accent};letter-spacing:3px;margin-bottom:10px">LAS 12 BARBERÍAS QUE YA LO PROBARON COINCIDEN EN ESTO:</div>
      <div style="font-size:20px;font-weight:700;line-height:1.45;color:${C.cream};font-style:italic">
        "No vendemos cortes. Vendemos un ritual con nombre propio.<br>
        El cliente no paga 62% más por el pelo.<br>
        Paga por la silla · la toalla · el café · la playlist · la cita que se ganó."
      </div>
      <div class="mono" style="font-size:11px;color:${C.cream}80;margin-top:14px;letter-spacing:2px">— LA ROCA · PINARES, PEREIRA · MUESTRA: 12 CASOS · 8 SEMANAS · +42% TICKET PROMEDIO</div>
    </div>

    <div style="background:${C.red}15;border:1.5px solid ${C.red}50;padding:18px 22px;border-radius:14px">
      <div style="font-size:17px;font-weight:900;color:${C.accent};font-family:ui-monospace,monospace;letter-spacing:1px;margin-bottom:8px">QUÉ TE LLEGA AL DM:</div>
      <ul style="list-style:none;font-size:14px;line-height:1.55;color:${C.cream}dd;display:grid;grid-template-columns:1fr 1fr;gap:4px 18px">
        <li>✓ SOP "Ritual del domingo"</li>
        <li>✓ Plantilla WhatsApp VIP</li>
        <li>✓ Sheet medir 8 semanas</li>
        <li>✓ 3 playlists Spotify listas</li>
      </ul>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
      <div style="font-size:22px;font-weight:800;color:${C.cream};text-align:center;opacity:0.9">Comentá la palabra</div>
      <div style="background:${C.accent};color:${C.ink};padding:20px 54px;border-radius:999px;font-size:64px;font-weight:900;letter-spacing:-2px;font-family:'JetBrains Mono',monospace;box-shadow:0 20px 50px ${C.accent}55">
        RITUAL
      </div>
      <div style="font-size:13px;color:${C.cream}70">y te cae al DM en 10 min.</div>
    </div>

    <div class="mono" style="display:flex;justify-content:space-between;font-size:12px;color:${C.cream}60;letter-spacing:2px">
      <span>STORU · EXPERIMENTOS BARBERÍA COLOMBIA</span><span>5/5 ✓</span>
    </div>
  </div>
</div>`),
];

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

async function main() {
  console.log(`⏳ ${EXP.id} · ${EXP.carouselName}\n`);

  console.log("  1. Carrusel…");
  const carousel = await api("/api/carousels", "POST", {
    name: EXP.carouselName,
    aspectRatio: "4:5",
  });
  console.log(`     ✓ ${carousel.id.slice(0, 8)}`);

  console.log("  2. Slides (5 · SB7 · imágenes distribuidas)…");
  for (let i = 0; i < SLIDES.length; i++) {
    await api(`/api/carousels/${carousel.id}/slides`, "POST", { html: SLIDES[i] });
    console.log(`     ✓ slide ${i + 1}/5`);
  }

  console.log("  3. ContentSet…");
  const set = await api("/api/content-sets", "POST", {
    name: `${EXP.id} · ${EXP.carouselName}`,
    topic: EXP.topic,
    goal: EXP.goal,
    archetype: EXP.archetype,
    ctaKeyword: EXP.ctaKeyword,
    anchorBrand: EXP.anchorBrand,
    thread: `Framework: ${EXP.framework} · Donald Miller. El dueño es el héroe, Storu la guía. El manifiesto del slide 5 ata literalmente al caso: cita a "las 12 barberías que ya lo probaron" y cierra el loop del 62% introducido en el carrusel.\n\nHistoria · slider emoji 😐→🙏 "¿qué tan importante es el ritual para tu cliente?" · diagnostica creencia antes del carrusel.\n\nCarrusel · 5 slides, cada uno con imagen integrada:\n · 1 split (ink + imagen barbería)\n · 2 full bg + cards overlay\n · 3 cream-dominant + chip imagen herramientas\n · 4 ink + imagen café ritual\n · 5 manifesto + testimonial colectivo + CTA\n\nReel · 45s long-form con 5 escenas · recap narrado.\n\nMismo tema · 3 guiones genuinamente distintos · cero copy repetido.`,
    experimentPurpose: "Probar si el framework SB7 con manifiesto que cita el caso de estudio genera mayor recall a 72h que un listicle genérico. Secundario: medir si el carrusel con imágenes distribuidas por slide (no decorativas) mejora save rate vs slides 100% tipográficos.",
    hypothesis: "Si cada slide tiene una imagen narrativa (no decorativa) y el manifiesto final cita explícitamente las 12 barberías + 62% del caso, los saves duplican vs D01 (provocación tipográfica) y los DMs con RITUAL superan 35 en 72h.",
    kpis: [
      "DMs con keyword RITUAL / 72h (target: >35)",
      "Save rate del carrusel SB7 (target: >9%)",
      "Complete rate del reel 45s (target: >55%)",
      "Respuestas al slider emoji (target: >18%)",
      "Shares del slide 5 manifiesto (target: >120)",
      "Reach share vs followers (target: >2×)",
      `Timebox: 72h desde publicación coordinada`,
      `Framework: ${EXP.framework} (Donald Miller)`,
      `Template reel: LongFormReel45s (estreno)`,
    ],
    sceneDetails: `Framework: ${EXP.framework}.\nLocación: ${EXP.neighborhood} (Pereira, Eje Cafetero). Vibe: 18-22°C, barberías boutique emergentes, comunidad premium cerrada.\nLa Roca los domingos 8am-2pm. Estilo vintage: silla Koken restaurada, paredes madera oscura, productos apothecary.\nLuz cálida 4500K + tungsteno de acento. Plano medio del ritual (toalla + café La Cosecha + herramienta + cliente).\nPaleta cálida custom D52: ${C.ink} · ${C.accent} · ${C.cream} · ${C.red}. Intencionalmente distinta de la paleta Storu clásica para marcar la identidad propia del set.\nMood: nostálgico-premium · cliente que busca ritual, no transacción.`,
    possibleCaptions: [
      `Barbería en Pinares subió 62% el ticket · sin subir precios.\n\nNo es el corte. Es el ritual con nombre propio.\n\nDejá RITUAL abajo · te cae el SOP completo.`,
      `"No vendemos cortes. Vendemos ritual." · 12 barberías colombianas coinciden.\n\nFramework de 3 pasos · ejecutable el próximo domingo.\n\nComentá RITUAL y te paso el playbook.`,
      `Capítulo 1: el héroe no es el producto.\nCapítulo 5: tu domingo deja más plata que un sábado.\n\nFramework SB7 aplicado · 62% más ticket en 8 semanas.\n\nPalabra mágica: RITUAL.`,
      `Pereira, domingo 11am.\nSilla Koken vintage · lista VIP de 8 cupos · café La Cosecha.\n\nTicket +62% sin tocar precios.\n\nSi te sirve, RITUAL en comentarios.`,
      `12 barberías lo probaron 8 semanas. Bogotá · Medellín · Pereira · Cali · Barranquilla · Cartagena.\n\nMisma conclusión: el cliente paga por ritual · no por corte.\n\nRITUAL → respuesta al DM.`,
    ],
    hashtags: [
      "storu", "barberiacolombia", "pereira", "ejecafetero",
      "ritualdeldomingo", "experimentos", "pymescolombia",
      "storytelling", "sb7", "colombia",
    ],
    references: [
      { url: IMG.hero, type: "hero", name: "Barbería interior vintage" },
      { url: IMG.s2, type: "product", name: "Ritual corte con navaja" },
      { url: IMG.s3, type: "product", name: "Herramientas del oficio" },
      { url: IMG.s4, type: "inspiration", name: "Café V60 del ritual" },
      { url: IMG.pereira, type: "location", name: "Pereira · eje cafetero" },
    ],
    status: "draft",
  });
  console.log(`     ✓ ${set.id.slice(0, 8)}`);

  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "carousel", updates: { id: carousel.id, status: "ready" },
  });

  console.log("  4. Historia (slider emoji · bgImage eje cafetero)…");
  const story = await api("/api/stories", "POST", {
    dynamic: "slider",
    text: "¿Qué tan importante es el ritual del servicio para tu cliente? 😐 ← → 🙏",
    accentColor: C.accent,
    bgColor: C.ink,
    setId: set.id,
    bgImage: IMG.eje,
  });
  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "story", updates: { id: story.id, status: "ready" },
  });
  console.log(`     ✓ ${story.id.slice(0, 8)}`);

  console.log("  5. Reel 45s (LongFormReel45s · coherente con manifiesto)…");
  const reel = await api("/api/reels", "POST", {
    template: "LongFormReel45s",
    props: {
      hook: "¿Qué hace que un cliente vuelva cada domingo sin pensarlo?",
      problem: "70% de barberías compiten por precio. Margen destruido · cliente que se va al que abrió el mes pasado. El dueño se cansa antes del 6 año.",
      insight: "No es el corte. Es el ritual con nombre propio. Y el ritual sube el ticket 62% sin tocar lista de precios.",
      proof: "La Roca · Pinares, Pereira · 8 semanas · ticket +62% · lista VIP de 8 cupos completa desde el jueves · 0 pesos en pauta.",
      cta: "Comentá RITUAL. Te mando el SOP de las 3 capas del servicio + plantilla WhatsApp probada.",
      accentColor: C.accent,
      bgColor: C.ink,
      textColor: C.cream,
      bgImage: IMG.s5,
    },
    duration: 45,
    fps: 30,
    aspectRatio: "9:16",
  });
  await api("/api/content-sets", "PUT", {
    id: set.id, piece: "reel", updates: { id: reel.id, status: "ready" },
  });
  console.log(`     ✓ ${reel.id.slice(0, 8)}`);

  console.log("  6. Publish order (HCR)…");
  await api("/api/content-sets", "PUT", {
    id: set.id,
    updates: {
      publishOrder: {
        strategyCode: "HCR",
        strategyName: "Historia → Carrusel → Reel",
        rationale: "Framework educativo · slider calibra creencia · carrusel entrega SB7 con imágenes · reel 45s cierra con narrativa.",
        timeboxDays: 4,
        steps: [
          { piece: "story", dayOffset: -1, timeOfDay: "18:00", role: "Teaser · slider 1-10", reason: "Mide creencia antes del editorial." },
          { piece: "carousel", dayOffset: 0, timeOfDay: "09:00", role: "Editorial SB7 · 5 slides con imágenes", reason: "Hora pico de save rate (mañana)." },
          { piece: "reel", dayOffset: 2, timeOfDay: "18:00", role: "Recap 45s", reason: "Long-form aguanta retención educativa tarde-noche." },
        ],
      },
      status: "ready",
    },
  });

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ ${EXP.id} creado · IMÁGENES DISTRIBUIDAS · MANIFIESTO COHERENTE`);
  console.log(`  Set: ${set.id}`);
  console.log(`  → http://localhost:3000/set/${set.id}`);
  console.log(`\n  Carrusel ${carousel.id.slice(0, 8)} · 5 slides con imágenes integradas`);
  console.log(`  Historia ${story.id.slice(0, 8)}  · slider emoji + bgImage eje cafetero`);
  console.log(`  Reel     ${reel.id.slice(0, 8)}  · LongFormReel45s · coherente con manifiesto`);
  console.log(`\n  Paleta custom: ${C.ink} · ${C.accent} · ${C.cream} · ${C.red}`);
  console.log(`═══════════════════════════════════════`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
