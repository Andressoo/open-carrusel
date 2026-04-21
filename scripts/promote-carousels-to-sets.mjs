#!/usr/bin/env node
/**
 * Promotes the 50 D-carousels into full ContentSets.
 * Each set gets:
 *  - A coherent Story (poll/quiz/countdown) derived from the carousel archetype
 *  - A coherent Reel (TikTokHook template) with the same hook/CTA keyword
 *  - Thread narrative connecting the 3 pieces
 *  - Free reference images (Unsplash keywords)
 *  - experimentPurpose, hypothesis, kpis, scene, captions, hashtags
 *
 * Usage:
 *   node scripts/promote-carousels-to-sets.mjs
 *
 * Requires: dev server running on http://localhost:3000
 */

const API = process.env.API_BASE || "http://localhost:3000";
const RESET = process.argv.includes("--reset");

// Rotating Colombian cities for scene variety
const CO_CITIES = [
  { city: "Bogotá", vibe: "altura 2640m, clima fresco, vibe profesional", hashtag: "bogota" },
  { city: "Medellín", vibe: "eterna primavera, innovación paisa", hashtag: "medellin" },
  { city: "Cartagena", vibe: "calor caribe, turismo premium, murallas", hashtag: "cartagena" },
  { city: "Barranquilla", vibe: "carnaval, comercio costeño, Río Magdalena", hashtag: "barranquilla" },
  { city: "Cali", vibe: "salsa, gastronomía, clima cálido pacífico", hashtag: "cali" },
  { city: "Bucaramanga", vibe: "ciudad bonita, santandereano", hashtag: "bucaramanga" },
  { city: "Pereira", vibe: "Eje Cafetero, pequeño comercio fuerte", hashtag: "pereira" },
  { city: "Santa Marta", vibe: "Sierra Nevada, turismo eco", hashtag: "santamarta" },
];

// ═══════════════════ ARCHETYPE MAPPING ═══════════════════

const ARCHETYPE_MAP = {
  Provocación: {
    goal: "autority",
    ctaKeyword: "EXPERIMENTO",
    storyDynamic: "poll",
    reelTemplate: "TikTokHook",
    keywords: ["bold", "red", "provocation", "stop"],
  },
  "Case study": {
    goal: "capture",
    ctaKeyword: "CASO",
    storyDynamic: "qa",
    reelTemplate: "BeforeAfter",
    keywords: ["restaurant", "customer", "success"],
  },
  Contrarian: {
    goal: "autority",
    ctaKeyword: "DROP",
    storyDynamic: "poll",
    reelTemplate: "TikTokHook",
    keywords: ["contrarian", "different", "flip"],
  },
  "Myth bust": {
    goal: "autority",
    ctaKeyword: "MITO",
    storyDynamic: "quiz",
    reelTemplate: "TikTokHook",
    keywords: ["myth", "truth", "facts"],
  },
  Listicle: {
    goal: "autority",
    ctaKeyword: "LISTA",
    storyDynamic: "quiz",
    reelTemplate: "TikTokHook",
    keywords: ["list", "tips", "checklist"],
  },
  Framework: {
    goal: "autority",
    ctaKeyword: "FRAMEWORK",
    storyDynamic: "quiz",
    reelTemplate: "TikTokHook",
    keywords: ["framework", "strategy", "matrix"],
  },
  VS: {
    goal: "validate",
    ctaKeyword: "COMPARA",
    storyDynamic: "poll",
    reelTemplate: "BeforeAfter",
    keywords: ["versus", "compare", "choice"],
  },
  "Step by step": {
    goal: "autority",
    ctaKeyword: "PASOS",
    storyDynamic: "quiz",
    reelTemplate: "TikTokHook",
    keywords: ["steps", "process", "how-to"],
  },
  "Data drop": {
    goal: "capture",
    ctaKeyword: "DATOS",
    storyDynamic: "qa",
    reelTemplate: "TikTokHook",
    keywords: ["data", "analytics", "numbers"],
  },
  "Before/After": {
    goal: "capture",
    ctaKeyword: "TRANSFORMA",
    storyDynamic: "ba",
    reelTemplate: "BeforeAfter",
    keywords: ["transformation", "before-after"],
  },
  "Story arc": {
    goal: "capture",
    ctaKeyword: "HISTORIA",
    storyDynamic: "qa",
    reelTemplate: "TikTokHook",
    keywords: ["story", "journey", "narrative"],
  },
  Launch: {
    goal: "launch",
    ctaKeyword: "DROP",
    storyDynamic: "countdown",
    reelTemplate: "TikTokHook",
    keywords: ["launch", "new", "drop"],
  },
  Manifesto: {
    goal: "autority",
    ctaKeyword: "MANIFIESTO",
    storyDynamic: "poll",
    reelTemplate: "TikTokHook",
    keywords: ["manifesto", "statement"],
  },
};

function detectArchetype(name) {
  // name format: "D07 · Framework · Matriz 2×2 · elegí la jugada que te toca."
  const parts = name.split("·").map((p) => p.trim());
  if (parts.length < 2) return { archetype: "Manifesto", label: parts[0] || "" };
  const arche = parts[1];
  const label = parts.slice(2).join(" · ");
  // fuzzy match
  const key =
    Object.keys(ARCHETYPE_MAP).find((k) => k.toLowerCase() === arche.toLowerCase()) ||
    Object.keys(ARCHETYPE_MAP).find((k) => arche.toLowerCase().includes(k.toLowerCase().split(" ")[0])) ||
    "Manifesto";
  return { archetype: key, label, fullArche: arche };
}

// ═══════════════════ CONTENT SYNTHESIS ═══════════════════

function deriveTopic(name) {
  // "D07 · Framework · Matriz 2×2 · elegí la jugada que te toca."
  //        1=archetype  2=topic-headline
  const parts = name.split("·").map((p) => p.trim());
  return parts.slice(2).join(" · ") || parts[parts.length - 1];
}

function deriveHookBodyCTA(topic, archetype, ctaKeyword) {
  // Extract hook from topic (usually short punchy phrase)
  const topicClean = topic.replace(/[.!?]$/, "");
  const hook = topicClean.length > 50 ? topicClean.slice(0, 47) + "…" : topicClean;

  const archeTemplates = {
    Provocación: {
      body: "El rebajón destruye margen. El drop construye deseo. Elegí bien.",
      story: `${hook} ¿Seguís rebajando?`,
      storyOptions: ["Sí, ayuda", "No más"],
    },
    "Case study": {
      body: "Un caso real · números reales · aprendelo en 30 segundos.",
      story: `${hook} ¿Te pasa lo mismo?`,
      storyOptions: ["Sí", "No", "A veces"],
    },
    Contrarian: {
      body: "Lo que todos hacen está mal. Te muestro por qué.",
      story: `${hook} ¿Mayoría o minoría con razón?`,
      storyOptions: ["Mayoría", "Minoría con razón"],
    },
    "Myth bust": {
      body: "Creencia popular vs realidad con data. Vas a quedar out.",
      story: `${hook} ¿Mito o verdad?`,
      storyOptions: ["Mito", "Verdad", "A medias", "No sé"],
    },
    Listicle: {
      body: "5 puntos que te llevan a una conclusión accionable.",
      story: `${hook} ¿Cuál te duele más?`,
      storyOptions: ["1", "2", "3", "4"],
    },
    Framework: {
      body: "Matriz que ordena tu decisión en 2 ejes. Simple · ejecutable.",
      story: `${hook} ¿En qué cuadrante estás?`,
      storyOptions: ["Q1", "Q2", "Q3", "Q4"],
    },
    VS: {
      body: "Dos caminos · una decisión. Hoy elegís.",
      story: `${hook}`,
      storyOptions: ["Opción A", "Opción B"],
    },
    "Step by step": {
      body: "Paso 1 → Paso 5. Accionable desde hoy.",
      story: `${hook} ¿En qué paso estás?`,
      storyOptions: ["Paso 1", "Paso 2", "Paso 3", "Paso 4+"],
    },
    "Data drop": {
      body: "La data que cambia cómo ves tu negocio.",
      story: `${hook} ¿Te sorprende la data?`,
      storyOptions: ["Mucho", "Algo", "No"],
    },
    "Before/After": {
      body: "De A a B · transformación real · cómo pasó.",
      story: `${hook} ¿Qué harías primero?`,
      storyOptions: ["Antes", "Ahora"],
    },
    "Story arc": {
      body: "Una historia · un giro · una lección.",
      story: `${hook} ¿Cómo termina?`,
      storyOptions: ["Bien", "Mal", "Sorpresa"],
    },
    Launch: {
      body: "Algo nuevo sale pronto. Contador abajo.",
      story: `${hook} Faltan pocas horas.`,
      storyOptions: [],
    },
    Manifesto: {
      body: "Lo que creemos · lo que construimos · lo que invitamos.",
      story: `${hook}`,
      storyOptions: ["De acuerdo", "En contra"],
    },
  };

  const t = archeTemplates[archetype] || archeTemplates.Manifesto;

  return {
    hook,
    body: t.body,
    cta: `Comentá ${ctaKeyword}`,
    storyText: t.story,
    storyOptions: t.storyOptions,
  };
}

function buildSceneDetails(topic, city) {
  return `Locación: ${city.city}, Colombia (${city.vibe}). Contexto de "${topic}". Luz cálida natural, props minimalistas colombianos (café, arepa, plantas tropicales, textiles wayuu o cumbia según ciudad), plano medio. Paleta Storu (ink #0E0D12 · violet #5635FD · yellow #F8C644). Mood auténtico, nada corporativo, habla colombiana.`;
}

function buildExperiment(topic, goal, city) {
  const goalCopy = {
    autority: "posicionar autoridad y educar a la audiencia colombiana",
    capture: "captar clientes fríos colombianos",
    valley: "activar horas valle de comercios locales",
    ticket: "subir el ticket promedio en pesos colombianos",
    recompra: "generar recompra en clientes existentes",
    launch: "impulsar un lanzamiento en el mercado colombiano",
    validate: "validar una hipótesis con comercios pyme colombianos",
    cashflow: "generar flujo de caja anticipado vía preventa o Bonus Prize",
  };
  return {
    experimentPurpose: `Medir si el hilo "${topic}" ${goalCopy[goal] || "mueve la métrica"} en ${city.city} y otras ciudades colombianas: guardados, compartidos y DMs con la keyword.`,
    hypothesis: `Si publicamos el set completo (Historia + Carrusel + Reel) en 72h con el mismo hook y CTA-keyword, los DMs calificados de comercios colombianos duplican vs carrusel suelto.`,
    kpis: [
      "DMs con keyword / 72h (Colombia)",
      "Save rate del carrusel",
      "Complete rate del reel",
      "Reach share / followers colombianos",
      "CTR a perfil desde Reels",
    ],
  };
}

function buildCaptions(hook, cta, city) {
  const kw = cta.replace("Comentá ", "");
  return [
    `${hook} → ${cta} y te mando el caso.`,
    `Si te pasa en tu negocio en ${city.city}, no sos el único. ${cta}.`,
    `Te ahorro 3 meses de prueba y error. ${cta}.`,
    `Esto no es opinión, es un experimento que ya corrimos con comercios colombianos. ${cta}.`,
    `Comentá ${kw} y te paso el playbook armado para tu ciudad.`,
  ];
}

function buildHashtags(keywords, city) {
  const base = [
    "storu",
    "comercioscolombia",
    "experimentos",
    "incentivos",
    "pymescolombia",
    "crecesinpautar",
    city.hashtag,
    "colombia",
  ];
  const extra = keywords.map((k) => k.replace(/[^a-z]/g, "")).filter(Boolean);
  return [...new Set([...base, ...extra])].slice(0, 10);
}

function buildReferences(keywords, label, city) {
  // Unsplash Source URLs with Colombian context (free, no API key).
  const mainKw = encodeURIComponent(
    [...keywords.slice(0, 2), "colombia", city.city.toLowerCase()].join(",")
  );
  const cityKw = encodeURIComponent(`${city.city.toLowerCase()},colombia`);
  const topicKw = encodeURIComponent(keywords[0] || "smallbusiness");
  return [
    {
      url: `https://source.unsplash.com/1080x1350/?${mainKw}`,
      type: "inspiration",
      name: `Ref principal · ${city.city}`,
    },
    {
      url: `https://source.unsplash.com/1080x1080/?${cityKw}`,
      type: "location",
      name: `Locación · ${city.city}`,
    },
    {
      url: `https://source.unsplash.com/1080x1350/?${topicKw}`,
      type: "product",
      name: `Producto/servicio · ${label.slice(0, 30)}`,
    },
  ];
}

// ═══════════════════ API CALLS ═══════════════════

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} · ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ═══════════════════ MAIN ═══════════════════

async function main() {
  console.log("⏳ Fetching carousels…");
  const { carousels } = await api("/api/carousels");
  const dCarousels = carousels
    .filter((c) => /^D\d{2}/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 50);

  console.log(`✓ Found ${dCarousels.length} D-carousels`);

  const { sets: existingSets } = await api("/api/content-sets");
  const alreadyLinked = new Set(
    existingSets.filter((s) => s.carousel?.id).map((s) => s.carousel.id)
  );

  console.log(`✓ ${alreadyLinked.size} already have sets`);

  // If --reset, delete all existing sets tied to the 50 D-carousels first
  if (RESET) {
    console.log("⚠ RESET mode: deleting existing sets tied to D-carousels…");
    const dIds = new Set(dCarousels.map((c) => c.id));
    const toDelete = existingSets.filter((s) => s.carousel?.id && dIds.has(s.carousel.id));
    for (const s of toDelete) {
      try {
        await api(`/api/content-sets?id=${s.id}`, "DELETE");
      } catch (e) {
        console.error(`  ✗ failed to delete ${s.id}`);
      }
    }
    console.log(`  ✓ deleted ${toDelete.length} sets`);
    alreadyLinked.clear();
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let cityIdx = 0;

  for (const c of dCarousels) {
    if (alreadyLinked.has(c.id)) {
      skipped++;
      continue;
    }

    try {
      const { archetype, label } = detectArchetype(c.name);
      const cfg = ARCHETYPE_MAP[archetype];
      const topic = deriveTopic(c.name);
      const city = CO_CITIES[cityIdx % CO_CITIES.length];
      cityIdx++;

      const { hook, body, cta, storyText, storyOptions } = deriveHookBodyCTA(
        topic,
        archetype,
        cfg.ctaKeyword
      );
      const experiment = buildExperiment(topic, cfg.goal, city);
      const captions = buildCaptions(hook, cta, city);
      const hashtags = buildHashtags(cfg.keywords, city);
      const references = buildReferences(cfg.keywords, label, city);
      const sceneDetails = buildSceneDetails(topic, city);

      const thread = `Historia teasea "${hook}" con ${cfg.storyDynamic} desde ${city.city} · Carrusel profundiza con ${archetype.toLowerCase()} y caso colombiano · Reel cierra el loop con CTA ${cfg.ctaKeyword}. Mismo hook en las 3 piezas · tono colombiano auténtico.`;

      // 1. Create ContentSet
      const set = await api("/api/content-sets", "POST", {
        name: c.name,
        topic,
        goal: cfg.goal,
        archetype: archetype.toLowerCase().replace(/[^a-z]/g, "-"),
        ctaKeyword: cfg.ctaKeyword,
        anchorBrand: `${city.city} · comercio local`,
        thread,
        experimentPurpose: experiment.experimentPurpose,
        hypothesis: experiment.hypothesis,
        kpis: experiment.kpis,
        sceneDetails,
        possibleCaptions: captions,
        hashtags,
        references,
        status: "draft",
      });

      // 2. Link the existing carousel
      await api("/api/content-sets", "PUT", {
        id: set.id,
        piece: "carousel",
        updates: { id: c.id, status: "draft" },
      });

      // 3. Create coherent Story
      const storyBody = {
        dynamic: cfg.storyDynamic,
        text: storyText,
        accentColor: "#F8C644",
        bgColor: "#0E0D12",
        setId: set.id,
      };
      if (["poll", "quiz"].includes(cfg.storyDynamic) && storyOptions.length > 0) {
        storyBody.options = storyOptions;
      }
      if (cfg.storyDynamic === "quiz") storyBody.correctAnswer = 0;
      if (cfg.storyDynamic === "countdown") {
        storyBody.targetDate = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      }
      const story = await api("/api/stories", "POST", storyBody);
      await api("/api/content-sets", "PUT", {
        id: set.id,
        piece: "story",
        updates: { id: story.id, status: "draft" },
      });

      // 4. Create coherent Reel
      const reelProps =
        cfg.reelTemplate === "TikTokHook"
          ? {
              hook,
              body,
              cta,
              accentColor: "#F8C644",
              bgColor: "#0E0D12",
              textColor: "#FFFFFF",
            }
          : {
              beforeLabel: "ANTES",
              beforeValue: "Rebajás",
              afterLabel: "AHORA",
              afterValue: "Diseñás",
              brandName: "Storu",
              tagline: hook,
              accentColor: "#F8C644",
              bgColor: "#0E0D12",
            };
      const reel = await api("/api/reels", "POST", {
        template: cfg.reelTemplate,
        props: reelProps,
        duration: cfg.reelTemplate === "TikTokHook" ? 10 : 8,
        fps: 30,
        aspectRatio: "9:16",
      });
      await api("/api/content-sets", "PUT", {
        id: set.id,
        piece: "reel",
        updates: { id: reel.id, status: "draft" },
      });

      created++;
      console.log(
        `✓ ${created.toString().padStart(2, "0")}/${dCarousels.length - skipped} · ${c.name.slice(0, 60)}`
      );
    } catch (err) {
      failed++;
      console.error(`✗ ${c.name.slice(0, 50)} · ${err.message}`);
    }
  }

  console.log(
    `\n═══════════════════\n✓ Created: ${created}\n⤵ Skipped (already linked): ${skipped}\n✗ Failed: ${failed}\n═══════════════════`
  );
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
