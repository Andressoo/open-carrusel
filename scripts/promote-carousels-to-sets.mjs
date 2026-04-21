#!/usr/bin/env node
/**
 * Promotes the 50 D-carousels into full ContentSets with:
 *  - Rich narrative structure using 10 proven communication frameworks
 *  - Signed experiment (ID, timebox, measurable hypothesis)
 *  - Coherent Story + Carousel + Reel following the assigned framework
 *  - Colombian market context (8 cities rotation)
 *  - Free Unsplash refs with location + product keywords
 *
 * The 10 communication frameworks used (deterministic by archetype):
 *  1. AIDA · Attention → Interest → Desire → Action
 *  2. PAS · Problem → Agitate → Solve
 *  3. BAB · Before → After → Bridge
 *  4. Hook-Story-Offer · Russell Brunson
 *  5. StoryBrand SB7 · Character → Problem → Guide → Plan → Call
 *  6. 4P · Picture → Promise → Proof → Push
 *  7. 4U · Useful · Urgent · Unique · Ultra-specific
 *  8. FAB · Features → Advantages → Benefits
 *  9. Pattern Interrupt + Open Loop (curiosity gap)
 * 10. Contrast · Old way VS New way
 *
 * Usage:
 *   node scripts/promote-carousels-to-sets.mjs [--reset]
 */

const API = process.env.API_BASE || "http://localhost:3000";
const RESET = process.argv.includes("--reset");

// ══════════════════════════════════════════════════════════
//  COLOMBIAN CITIES (rotate for scene variety)
// ══════════════════════════════════════════════════════════

const CO_CITIES = [
  { city: "Bogotá", vibe: "altura 2640m, clima fresco, vibe profesional", hashtag: "bogota", neighborhoods: "Chapinero · Usaquén · Chicó" },
  { city: "Medellín", vibe: "eterna primavera, innovación paisa", hashtag: "medellin", neighborhoods: "El Poblado · Laureles · Envigado" },
  { city: "Cartagena", vibe: "calor caribe, turismo premium, murallas", hashtag: "cartagena", neighborhoods: "Ciudad Amurallada · Getsemaní · Bocagrande" },
  { city: "Barranquilla", vibe: "carnaval, comercio costeño, Río Magdalena", hashtag: "barranquilla", neighborhoods: "Alto Prado · Norte · Riomar" },
  { city: "Cali", vibe: "salsa, gastronomía, clima cálido pacífico", hashtag: "cali", neighborhoods: "Granada · San Antonio · Ciudad Jardín" },
  { city: "Bucaramanga", vibe: "ciudad bonita, santandereano", hashtag: "bucaramanga", neighborhoods: "Cabecera · Cañaveral · Floridablanca" },
  { city: "Pereira", vibe: "Eje Cafetero, pequeño comercio fuerte", hashtag: "pereira", neighborhoods: "Circunvalar · Pinares · Álamos" },
  { city: "Santa Marta", vibe: "Sierra Nevada, turismo eco", hashtag: "santamarta", neighborhoods: "Bello Horizonte · Rodadero · Centro Histórico" },
];

// ══════════════════════════════════════════════════════════
//  10 COMMUNICATION FRAMEWORKS
// ══════════════════════════════════════════════════════════

const FRAMEWORKS = {
  AIDA: {
    name: "AIDA",
    full: "Attention → Interest → Desire → Action",
    why: "Funnel clásico de persuasión publicitaria. Lleva al lector desde captar mirada hasta acción concreta.",
    structure: (ctx) => ({
      attention: `${ctx.hook}`,
      interest: `${ctx.pain} Y acá está lo que casi nadie mide: ${ctx.insight}.`,
      desire: `Imaginate ${ctx.desire} sin depender de pauta, bajar precios, ni rogar reseñas.`,
      action: `${ctx.cta}. Respuesta con el playbook aplicable en 48h.`,
    }),
    storyDynamic: "poll",
  },
  PAS: {
    name: "PAS",
    full: "Problem → Agitate → Solve",
    why: "Acelerador de urgencia. Problema claro, agitación emocional, solución específica.",
    structure: (ctx) => ({
      problem: `${ctx.hook}`,
      agitate: `Mientras lees esto, el comercio del frente ya lo entendió y está capturando clientes que deberían ser tuyos. ${ctx.pain}`,
      solve: `${ctx.insight} · ${ctx.cta}`,
    }),
    storyDynamic: "qa",
  },
  BAB: {
    name: "Before-After-Bridge",
    full: "Before state → After state → Bridge how to cross",
    why: "Ideal para casos transformacionales. Muestra el antes/después y el puente accionable.",
    structure: (ctx) => ({
      before: `Antes: ${ctx.painShort}.`,
      after: `Después (cuando aplicás esto): ${ctx.desireShort}.`,
      bridge: `El puente no es pauta ni descuento. Es ${ctx.insight}. ${ctx.cta}.`,
    }),
    storyDynamic: "ba",
  },
  "Hook-Story-Offer": {
    name: "Hook-Story-Offer",
    full: "Hook viral → Historia real → Offer con keyword",
    why: "Russell Brunson. Viral por construcción: detener scroll, enamorar, convertir.",
    structure: (ctx) => ({
      hook: `${ctx.hook}`,
      story: `Lo probamos con un comercio en ${ctx.city}. Mismo local, misma carta, sin rebajar. Lo único distinto fue: ${ctx.insight}. Resultado: ${ctx.desireShort}.`,
      offer: `${ctx.cta} y te paso el playbook paso a paso.`,
    }),
    storyDynamic: "qa",
  },
  SB7: {
    name: "StoryBrand SB7",
    full: "Character → Problem → Guide → Plan → Success",
    why: "Donald Miller. El cliente es el héroe, tú la guía. Elimina ruido en el mensaje.",
    structure: (ctx) => ({
      character: `Sos dueño de un comercio en ${ctx.city} queriendo que martes valga igual que sábado.`,
      problem: `${ctx.painShort}`,
      guide: `Storu no vende teoría. Analizamos 100+ comercios colombianos y probamos lo que funciona.`,
      plan: `1) Diseñas el incentivo. 2) Lanzás con keyword en 3 piezas coherentes. 3) Medís DMs y recompra.`,
      success: `${ctx.desireShort} · ${ctx.cta}.`,
    }),
    storyDynamic: "quiz",
  },
  "4P": {
    name: "4P",
    full: "Picture → Promise → Proof → Push",
    why: "Henry Hoke. Cinematográfico. Crea una imagen mental vívida antes de pedir acción.",
    structure: (ctx) => ({
      picture: `Martes 8pm en tu local. Afuera llueve, adentro hay lista de espera. Así se ve ${ctx.desireShort}.`,
      promise: `${ctx.hook}`,
      proof: `Casos reales en ${ctx.city}: ${ctx.insight}.`,
      push: `${ctx.cta}. Hoy, no cuando tengás tiempo.`,
    }),
    storyDynamic: "poll",
  },
  "4U": {
    name: "4U",
    full: "Useful · Urgent · Unique · Ultra-specific",
    why: "Michael Masterson. Filtro de headlines. Si el hook no tiene las 4 U, no corta el scroll.",
    structure: (ctx) => ({
      useful: `${ctx.hook} (útil para tu P&L real).`,
      urgent: `Si esperás un mes, pierdes 4 martes y 4 miércoles valle.`,
      unique: `${ctx.insight} — no es rebajar.`,
      ultraSpecific: `Comercios de ${ctx.city} + ${ctx.neighborhoods} lo aplicaron en 72h. ${ctx.cta}.`,
    }),
    storyDynamic: "quiz",
  },
  FAB: {
    name: "FAB",
    full: "Features → Advantages → Benefits",
    why: "Clásico de producto. Pasa de qué es, a qué hace, a qué significa para el cliente.",
    structure: (ctx) => ({
      features: `${ctx.hook} · ${ctx.insight}`,
      advantages: `Vs. rebajar: no erosiona margen. Vs. pauta: no se quema en 2 semanas. Vs. descontar: construye percepción.`,
      benefits: `${ctx.desireShort}. ${ctx.cta}.`,
    }),
    storyDynamic: "poll",
  },
  "Pattern-Interrupt": {
    name: "Pattern Interrupt + Open Loop",
    full: "Romper el scroll + curiosity gap sin resolver",
    why: "Neuro-hack para retención. Rompés expectativa en ms 1 y abrís un loop que obliga a seguir.",
    structure: (ctx) => ({
      interrupt: `${ctx.hook}`,
      openLoop: `Y lo que descubrí al analizar 100 comercios en ${ctx.city} te va a cambiar cómo vendés: no es lo que pensás.`,
      reveal: `${ctx.insight}.`,
      cta: `${ctx.cta} para ver el análisis completo.`,
    }),
    storyDynamic: "qa",
  },
  Contrast: {
    name: "Contrast (Old vs New)",
    full: "Vieja forma que todos hacen VS Nueva que pocos entienden",
    why: "Posicionamiento. El método viejo está roto, el nuevo es obvio una vez lo ves.",
    structure: (ctx) => ({
      oldWay: `Antes: rebajar, pautar, descontar. Costo: margen + percepción + burnout.`,
      newWay: `Ahora: ${ctx.insight}.`,
      why: `${ctx.hook}`,
      proof: `Pruebas en ${ctx.city}: ${ctx.desireShort}. ${ctx.cta}.`,
    }),
    storyDynamic: "poll",
  },
};

// Archetype → Framework mapping (deterministic)
const ARCHETYPE_TO_FRAMEWORK = {
  Provocación: "Pattern-Interrupt",
  "Case study": "Hook-Story-Offer",
  Contrarian: "Contrast",
  "Myth bust": "PAS",
  Listicle: "4U",
  Framework: "SB7",
  VS: "Contrast",
  "Step by step": "FAB",
  "Data drop": "4P",
  "Before/After": "BAB",
  "Story arc": "Hook-Story-Offer",
  Launch: "AIDA",
  Manifesto: "4P",
};

const ARCHETYPE_MAP = {
  Provocación: { goal: "autority", ctaKeyword: "EXPERIMENTO", reelTemplate: "TikTokHook", keywords: ["bold", "provocation"] },
  "Case study": { goal: "capture", ctaKeyword: "CASO", reelTemplate: "BeforeAfter", keywords: ["restaurant", "customer"] },
  Contrarian: { goal: "autority", ctaKeyword: "DROP", reelTemplate: "TikTokHook", keywords: ["contrarian", "different"] },
  "Myth bust": { goal: "autority", ctaKeyword: "MITO", reelTemplate: "TikTokHook", keywords: ["myth", "truth"] },
  Listicle: { goal: "autority", ctaKeyword: "LISTA", reelTemplate: "TikTokHook", keywords: ["list", "tips"] },
  Framework: { goal: "autority", ctaKeyword: "FRAMEWORK", reelTemplate: "TikTokHook", keywords: ["framework", "matrix"] },
  VS: { goal: "validate", ctaKeyword: "COMPARA", reelTemplate: "BeforeAfter", keywords: ["versus", "choice"] },
  "Step by step": { goal: "autority", ctaKeyword: "PASOS", reelTemplate: "TikTokHook", keywords: ["steps", "process"] },
  "Data drop": { goal: "capture", ctaKeyword: "DATOS", reelTemplate: "TikTokHook", keywords: ["data", "analytics"] },
  "Before/After": { goal: "capture", ctaKeyword: "TRANSFORMA", reelTemplate: "BeforeAfter", keywords: ["transformation"] },
  "Story arc": { goal: "capture", ctaKeyword: "HISTORIA", reelTemplate: "TikTokHook", keywords: ["story", "journey"] },
  Launch: { goal: "launch", ctaKeyword: "DROP", reelTemplate: "TikTokHook", keywords: ["launch", "new"] },
  Manifesto: { goal: "autority", ctaKeyword: "MANIFIESTO", reelTemplate: "TikTokHook", keywords: ["manifesto"] },
};

// ══════════════════════════════════════════════════════════
//  CONTENT SYNTHESIS
// ══════════════════════════════════════════════════════════

function detectArchetype(name) {
  const parts = name.split("·").map((p) => p.trim());
  const arche = parts[1] || "Manifesto";
  const label = parts.slice(2).join(" · ");
  const key =
    Object.keys(ARCHETYPE_MAP).find((k) => k.toLowerCase() === arche.toLowerCase()) ||
    Object.keys(ARCHETYPE_MAP).find((k) => arche.toLowerCase().includes(k.toLowerCase().split(" ")[0])) ||
    "Manifesto";
  return { archetype: key, label };
}

function deriveTopic(name) {
  const parts = name.split("·").map((p) => p.trim());
  return parts.slice(2).join(" · ") || parts[parts.length - 1];
}

function narrativeContext(topic, archetype, city) {
  // Pain / insight / desire pools by archetype — colombianized
  const insights = {
    Provocación: "diseñar incentivos específicos (no rebajar) multiplica DMs calificados por 3x",
    "Case study": "publicar el caso real con números concretos genera 4x más guardados",
    Contrarian: "lo que la mayoría hace (rebajar/pautar) está matando tu margen silenciosamente",
    "Myth bust": "la creencia popular es opuesta a la data",
    Listicle: "cinco puntos accionables pesan más que un manual de 30 páginas",
    Framework: "una matriz 2x2 ordena en 30s lo que 3 reuniones no resuelven",
    VS: "cuando compar​ás las dos opciones lado a lado, la elección es obvia",
    "Step by step": "pasos concretos con tiempo definido superan teoría abstracta",
    "Data drop": "la data colombiana dice algo muy distinto a la del mercado gringo",
    "Before/After": "la transformación real en fotos vende sin palabras",
    "Story arc": "una historia con giro se recuerda 20x más que un hecho",
    Launch: "anunciar con countdown y keyword triplica solicitudes pre-lanzamiento",
    Manifesto: "posicionarte con claridad atrae mejor cliente que tratar de venderle a todos",
  };
  const pains = {
    Provocación: "Seguís rebajando los martes porque no sabés qué más hacer.",
    "Case study": "Ves casos de afuera pero ninguno se parece a tu comercio acá.",
    Contrarian: "Estás haciendo lo mismo que todos y compitiendo solo por precio.",
    "Myth bust": "Creés algo porque lo escuchaste 100 veces pero nunca lo testeaste.",
    Listicle: "Tenés 40 tabs abiertos con consejos y ninguno aplicado.",
    Framework: "Decidís a ojo sin un marco claro para elegir dónde apostar.",
    VS: "Sabés que tenés que elegir entre dos caminos y seguís postergando.",
    "Step by step": "Entendés el concepto pero nunca arrancás.",
    "Data drop": "Tomás decisiones con intuición porque nadie publica data local.",
    "Before/After": "Lo estás haciendo bien pero nadie lo ve porque no lo contás.",
    "Story arc": "Tenés historias grandes de tus clientes pero las dejás morir en WhatsApp.",
    Launch: "Lanzás sin tensión previa y el día del drop nadie aparece.",
    Manifesto: "Te falta una frase que resuma por qué debería elegirte a ti.",
  };
  const desires = {
    Provocación: "tu martes se llena sin bajar precio ni pautar",
    "Case study": "tu comercio aparece en casos reales con nombre y números",
    Contrarian: "dejás de competir por precio y empezás a elegir a quién atendés",
    "Myth bust": "tomás decisiones con data, no con opiniones repetidas",
    Listicle: "aplicás 5 puntos concretos y ves el efecto en 30 días",
    Framework: "tenés un marco claro para decidir campañas en minutos",
    VS: "elegís el camino correcto con argumento, no con intuición",
    "Step by step": "completas el paso 1 esta semana y tienes tracción visible",
    "Data drop": "sabés qué funciona en Colombia específicamente para tu nicho",
    "Before/After": "tu historia de transformación se vuelve tu mejor ads",
    "Story arc": "tus clientes generan tu contenido y se sienten protagonistas",
    Launch: "sold-out antes de lanzar con lista VIP esperando",
    Manifesto: "tu comunicación se siente firme y atrae al cliente correcto",
  };

  const pain = pains[archetype] || pains.Manifesto;
  const insight = insights[archetype] || insights.Manifesto;
  const desire = desires[archetype] || desires.Manifesto;

  return {
    hook: topic.replace(/[.!?]$/, ""),
    pain,
    painShort: pain.split(".")[0].toLowerCase(),
    insight,
    desire,
    desireShort: desire,
    city: city.city,
    neighborhoods: city.neighborhoods,
    cta: "Comentá",
  };
}

function buildThread(framework, ctx, ctaKeyword) {
  const f = FRAMEWORKS[framework];
  const parts = f.structure({ ...ctx, cta: `Comentá ${ctaKeyword}` });
  const ordered = Object.entries(parts)
    .map(([k, v]) => `· ${k.toUpperCase()}: ${v}`)
    .join("\n");
  return `Framework: ${f.name} · ${f.full}\n${f.why}\n\n${ordered}`;
}

function buildCaptions(framework, ctx, ctaKeyword) {
  const f = FRAMEWORKS[framework];
  const parts = f.structure({ ...ctx, cta: `Comentá ${ctaKeyword}` });
  const captions = [];

  // Primary caption: full framework condensed
  const firstValue = Object.values(parts)[0];
  const lastValue = Object.values(parts).pop();
  captions.push(`${firstValue}\n\n${lastValue}`);

  // Variation 1: pain-first
  captions.push(
    `${ctx.pain}\n\nLo que casi nadie ve: ${ctx.insight}.\n\nComentá ${ctaKeyword} y te mando el caso aplicable en tu negocio en ${ctx.city}.`
  );

  // Variation 2: proof-first
  captions.push(
    `${ctx.insight} — probado con comercios en ${ctx.city} (${ctx.neighborhoods}).\n\n${ctx.hook}. Comentá ${ctaKeyword} para el playbook.`
  );

  // Variation 3: short & punchy
  captions.push(`${ctx.hook} → Comentá ${ctaKeyword}.`);

  // Variation 4: story format
  captions.push(
    `Martes 8pm en ${ctx.city}.\n\nComercio que aplicó esto: ${ctx.desireShort}.\nComercio que siguió haciendo lo mismo: rebaja, pauta, se quema.\n\n${ctx.hook}. Comentá ${ctaKeyword}.`
  );

  return captions;
}

function buildExperimentSignature(idx, archetype, framework, cta, city) {
  const pad = String(idx + 1).padStart(2, "0");
  return {
    experimentId: `EXP-STORU-${pad}`,
    experimentSignature: `Experimento #${pad} · Framework ${framework} · ${archetype} · ${cta} · ${city.city}`,
    experimentPurpose: `Probar si el framework ${FRAMEWORKS[framework].name} (${FRAMEWORKS[framework].full}) aplicado al arquetipo "${archetype}" genera 2x más DMs calificados con keyword ${cta} vs una pieza genérica, medido en 72h.`,
    hypothesis: `Publicando Historia + Carrusel + Reel en 72h con ${FRAMEWORKS[framework].name} y misma CTA "${cta}", los DMs con keyword duplican y el save rate del carrusel supera 8%.`,
    kpis: [
      `DMs con keyword ${cta} / 72h`,
      `Save rate carrusel (target: >8%)`,
      `Complete rate reel (target: >60%)`,
      `Reach share vs followers (target: >2x)`,
      `Respuestas en Historia (target: >15%)`,
    ],
    timebox: "72 horas desde publicación coordinada",
  };
}

function buildHashtags(keywords, city) {
  const base = ["storu", "comercioscolombia", "experimentos", "incentivos", "pymescolombia", "crecesinpautar", city.hashtag, "colombia"];
  const extra = keywords.map((k) => k.replace(/[^a-z]/g, "")).filter(Boolean);
  return [...new Set([...base, ...extra])].slice(0, 10);
}

function buildReferences(keywords, label, city) {
  const mainKw = encodeURIComponent([...keywords.slice(0, 2), "colombia", city.city.toLowerCase()].join(","));
  const cityKw = encodeURIComponent(`${city.city.toLowerCase()},colombia,streetphotography`);
  const topicKw = encodeURIComponent(keywords[0] || "smallbusiness");
  return [
    { url: `https://source.unsplash.com/1080x1350/?${mainKw}`, type: "inspiration", name: `Ref · ${city.city}` },
    { url: `https://source.unsplash.com/1080x1080/?${cityKw}`, type: "location", name: `Locación · ${city.city}` },
    { url: `https://source.unsplash.com/1080x1350/?${topicKw}`, type: "product", name: `Producto · ${label.slice(0, 30)}` },
  ];
}

// ══════════════════════════════════════════════════════════
//  PER-FORMAT SCRIPTS (mismo tema, distinto guión)
// ══════════════════════════════════════════════════════════
//
//  Rules:
//   - Carousel: profundiza, enseña, prueba con data (lo hace el editor + slides)
//   - Story: teasea, abre loop, pide interacción con 1 tap
//   - Reel: entretiene, pattern interrupt visual, hook 2s + body 4s + CTA 4s
//
//  Los 3 formatos comparten topic, pain, insight, desire, CTA keyword
//  pero usan palabras y estructura distintas.

function buildReelScript(ctx, archetype, framework, ctaKeyword) {
  // Reel hook (0-2s) = pattern interrupt punzante, NO es el título del carrusel
  const reelHooks = {
    Provocación: [
      `Pará 2 segundos.`,
      `Nadie te dice esto:`,
      `Dueños de comercio, 3 segundos.`,
    ],
    "Case study": [
      `${ctx.city}, martes pasado:`,
      `Número real. Sin filtro.`,
      `Un dueño me dijo ayer:`,
    ],
    Contrarian: [
      `Lo que todos hacen está mal.`,
      `Impopular pero cierto:`,
      `No me van a creer esto.`,
    ],
    "Myth bust": [
      `Esto que creés es mentira.`,
      `Mito viejo, ruina nueva:`,
      `Te lo dijeron tus profes. Es falso.`,
    ],
    Listicle: [
      `5 errores que pagás caro.`,
      `Si hacés esto, parás ya.`,
      `Top 5 sin relleno:`,
    ],
    Framework: [
      `Una matriz 2x2 ordena tu semana.`,
      `Esto te ahorra 3 reuniones:`,
      `Si no tenés este framework, estás adivinando.`,
    ],
    VS: [
      `Elegí: A o B. Rápido.`,
      `Dos caminos, uno correcto.`,
      `Esta decisión define tu año.`,
    ],
    "Step by step": [
      `Abrí el reloj. 30 min.`,
      `Paso 1 de 3. Listo?`,
      `Sin teoría. Hacelo conmigo.`,
    ],
    "Data drop": [
      `100 comercios. 1 número.`,
      `Lo que nadie publica:`,
      `Data colombiana, no gringa:`,
    ],
    "Before/After": [
      `Antes: ${ctx.painShort}.`,
      `Mirá esto.`,
      `En 4 meses cambió todo.`,
    ],
    "Story arc": [
      `Te cuento una historia.`,
      `Esto pasó hace 2 semanas en ${ctx.city}.`,
      `Escuchame 30 segundos.`,
    ],
    Launch: [
      `Faltan 72h.`,
      `Aviso: esto se acaba.`,
      `Contador arrancó.`,
    ],
    Manifesto: [
      `En esto creemos:`,
      `Lo decimos una sola vez:`,
      `Leé despacio:`,
    ],
  };

  const hooks = reelHooks[archetype] || reelHooks.Manifesto;
  const hook = hooks[Math.abs(hashCode(ctx.hook)) % hooks.length];

  // Body (2-6s) = condensación de insight + prueba rápida, MUY distinto al carrusel
  const bodies = {
    AIDA: `${capitalize(ctx.insight)}. En ${ctx.city} ya está pasando.`,
    PAS: `${ctx.pain} La mayoría responde rebajando. Hay otra salida: ${ctx.insight}.`,
    BAB: `De ${ctx.painShort} a ${ctx.desireShort} · sin bajar precio.`,
    "Hook-Story-Offer": `Un comercio en ${ctx.city} lo probó 2 semanas. Resultado: ${ctx.desireShort}.`,
    SB7: `Vos el protagonista. Storu la guía. Plan de 3 pasos: diseñás, lanzás, medís.`,
    "4P": `Martes 8pm · lleno sin rebajar. ${capitalize(ctx.insight)}.`,
    "4U": `Útil. Urgente. Único. ${capitalize(ctx.insight)}.`,
    FAB: `${capitalize(ctx.insight)}. No es rebajar. No es pautar. Es diseño de incentivo.`,
    "Pattern-Interrupt": `Lo que descubrí: ${ctx.insight}. Cambia todo.`,
    Contrast: `Vieja forma: rebajar. Nueva forma: ${ctx.insight}.`,
  };

  const body = bodies[framework] || bodies.AIDA;

  // CTA (6-10s) = uniforme pero con urgencia
  const ctas = [
    `Comentá ${ctaKeyword} · te paso el playbook.`,
    `Palabra mágica: ${ctaKeyword}. Comentala.`,
    `Si te sirve, ${ctaKeyword} en comentarios.`,
  ];
  const cta = ctas[Math.abs(hashCode(ctx.hook + archetype)) % ctas.length];

  return { hook, body, cta };
}

function buildStoryScript(ctx, archetype, framework, ctaKeyword) {
  // Story = teaser + loop abierto. No revela, invita a interactuar.
  // Texto corto (max ~80 chars), pregunta directa, alta fricción de scroll.

  const dyn = FRAMEWORKS[framework].storyDynamic;

  const teases = {
    Provocación: [
      `¿Y si rebajar es lo peor que podés hacer?`,
      `Lo que diseñás pesa más que lo que descontás.`,
      `¿Te animás a no rebajar este martes?`,
    ],
    "Case study": [
      `Un comercio en ${ctx.city} hizo esto. Votá qué creés que pasó.`,
      `Caso real · te tiro 2 números y decís si te los creés.`,
      `Pregúntame cualquier cosa del caso.`,
    ],
    Contrarian: [
      `Lo que todos hacen: rebajar. ¿Y vos?`,
      `Popular no siempre = correcto. ¿Coincidís?`,
      `Pregunta incómoda:`,
    ],
    "Myth bust": [
      `Creés esto? Votá. Después te muestro la data.`,
      `Mito vs Realidad. Decime cuál es cuál.`,
      `Test rápido · ¿verdadero o falso?`,
    ],
    Listicle: [
      `5 errores. ¿Cuál te duele más?`,
      `¿En cuál caés sin darte cuenta?`,
      `Votá el error más común de tu calle.`,
    ],
    Framework: [
      `¿En qué cuadrante estás hoy? Tocá abajo.`,
      `Matriz 2x2 · ubicate en 10s.`,
      `Pregúntame qué hacer desde tu cuadrante.`,
    ],
    VS: [
      `A o B. Elegí. Después te muestro.`,
      `Si tuvieras que elegir hoy, ¿cuál?`,
      `Decisión binaria. Go.`,
    ],
    "Step by step": [
      `¿En qué paso estás? Votá.`,
      `Paso 1 lo hiciste hoy? Sí/No.`,
      `Preguntame cualquier cosa del proceso.`,
    ],
    "Data drop": [
      `Un dato colombiano te sorprende? Preguntá.`,
      `Tirame una pregunta sobre la data.`,
      `Preguntame lo que quieras · te respondo con data.`,
    ],
    "Before/After": [
      `Antes / Después · mirá qué pasó.`,
      ctx.hook,
      `Transformación en 4 meses.`,
    ],
    "Story arc": [
      `Te cuento? Preguntame.`,
      `Hay una historia acá. ¿Querés la versión larga?`,
      `Una historia en ${ctx.city}. Preguntame.`,
    ],
    Launch: [
      `Faltan 72h. Sumate.`,
      `Countdown activo. ¿Entrás?`,
      `Drop el sábado · RSVP acá.`,
    ],
    Manifesto: [
      `¿De acuerdo o no?`,
      `Postura firme. Votá.`,
      `Es así o no es?`,
    ],
  };

  const pool = teases[archetype] || teases.Manifesto;
  const text = pool[Math.abs(hashCode(ctx.hook + framework)) % pool.length];

  // Options tailored to dynamic
  let options;
  let correctAnswer;
  if (dyn === "poll") options = ["Sí, coincido", "No estoy de acuerdo"];
  if (dyn === "quiz") {
    options = ["Rebajar", "Pautar", "Diseñar incentivo", "Esperar"];
    correctAnswer = 2;
  }
  if (dyn === "ba") options = undefined;

  return { dynamic: dyn, text, options, correctAnswer };
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return h;
}

function buildSceneDetails(topic, city, framework) {
  const f = FRAMEWORKS[framework];
  return `Framework: ${f.name} (${f.full}).\nLocación: ${city.city}, Colombia (${city.vibe}). Zonas: ${city.neighborhoods}.\nContexto del hook: "${topic}".\nLuz cálida natural, plano medio con espacio para texto, props auténticos colombianos (café, papel kraft, textiles), mood real — nada de stock corporativo.\nPaleta Storu (ink #0E0D12 · violet #5635FD · yellow #F8C644).`;
}

// ══════════════════════════════════════════════════════════
//  API
// ══════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════

async function main() {
  console.log("⏳ Fetching carousels…");
  const { carousels } = await api("/api/carousels");
  const dCarousels = carousels
    .filter((c) => /^D\d{2}/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 50);
  console.log(`✓ Found ${dCarousels.length} D-carousels`);

  const { sets: existingSets } = await api("/api/content-sets");

  if (RESET) {
    console.log("⚠ RESET mode · deleting existing sets tied to D-carousels…");
    const dIds = new Set(dCarousels.map((c) => c.id));
    const toDelete = existingSets.filter((s) => s.carousel?.id && dIds.has(s.carousel.id));
    for (const s of toDelete) {
      try { await api(`/api/content-sets?id=${s.id}`, "DELETE"); }
      catch { /* continue */ }
    }
    console.log(`  ✓ deleted ${toDelete.length} sets`);
  }

  const alreadyLinked = RESET
    ? new Set()
    : new Set(existingSets.filter((s) => s.carousel?.id).map((s) => s.carousel.id));

  let created = 0, skipped = 0, failed = 0;
  const usedFrameworks = {};

  for (let i = 0; i < dCarousels.length; i++) {
    const c = dCarousels[i];
    if (alreadyLinked.has(c.id)) { skipped++; continue; }

    try {
      const { archetype, label } = detectArchetype(c.name);
      const cfg = ARCHETYPE_MAP[archetype];
      const framework = ARCHETYPE_TO_FRAMEWORK[archetype] || "AIDA";
      usedFrameworks[framework] = (usedFrameworks[framework] || 0) + 1;

      const city = CO_CITIES[i % CO_CITIES.length];
      const topic = deriveTopic(c.name);
      const ctx = narrativeContext(topic, archetype, city);
      const sig = buildExperimentSignature(i, archetype, framework, cfg.ctaKeyword, city);

      const thread = buildThread(framework, ctx, cfg.ctaKeyword);
      const captions = buildCaptions(framework, ctx, cfg.ctaKeyword);
      const hashtags = buildHashtags(cfg.keywords, city);
      const references = buildReferences(cfg.keywords, label, city);
      const sceneDetails = buildSceneDetails(topic, city, framework);

      // 1. ContentSet
      const set = await api("/api/content-sets", "POST", {
        name: `${sig.experimentId} · ${c.name}`,
        topic,
        goal: cfg.goal,
        archetype: archetype.toLowerCase().replace(/[^a-z]/g, "-"),
        ctaKeyword: cfg.ctaKeyword,
        anchorBrand: `${city.city} · comercio local`,
        thread,
        experimentPurpose: sig.experimentPurpose,
        hypothesis: sig.hypothesis,
        kpis: [...sig.kpis, `Timebox: ${sig.timebox}`, `Framework: ${FRAMEWORKS[framework].name}`],
        sceneDetails,
        possibleCaptions: captions,
        hashtags,
        references,
        status: "draft",
      });

      // 2. Link carousel
      await api("/api/content-sets", "PUT", {
        id: set.id, piece: "carousel", updates: { id: c.id, status: "draft" },
      });

      // 3. Story with its OWN script (teases, opens loop — doesn't repeat carousel)
      const storyScript = buildStoryScript(ctx, archetype, framework, cfg.ctaKeyword);
      const storyBody = {
        dynamic: storyScript.dynamic,
        text: storyScript.text,
        accentColor: "#F8C644",
        bgColor: "#0E0D12",
        setId: set.id,
      };
      if (storyScript.options) storyBody.options = storyScript.options;
      if (storyScript.correctAnswer != null) storyBody.correctAnswer = storyScript.correctAnswer;
      if (storyScript.dynamic === "countdown") {
        storyBody.targetDate = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      }
      const story = await api("/api/stories", "POST", storyBody);
      await api("/api/content-sets", "PUT", {
        id: set.id, piece: "story", updates: { id: story.id, status: "draft" },
      });

      // 4. Reel with its OWN script (entertains, pattern interrupt — doesn't repeat carousel)
      const reelScript = buildReelScript(ctx, archetype, framework, cfg.ctaKeyword);
      const reelProps =
        cfg.reelTemplate === "TikTokHook"
          ? {
              hook: reelScript.hook,
              body: reelScript.body,
              cta: reelScript.cta,
              accentColor: "#F8C644",
              bgColor: "#0E0D12",
              textColor: "#FFFFFF",
            }
          : {
              beforeLabel: "ANTES",
              beforeValue: ctx.painShort.slice(0, 40),
              afterLabel: "AHORA",
              afterValue: ctx.desireShort.slice(0, 40),
              brandName: `Storu · ${city.city}`,
              tagline: reelScript.hook,
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
        id: set.id, piece: "reel", updates: { id: reel.id, status: "draft" },
      });

      created++;
      console.log(`✓ ${String(created).padStart(2,"0")}/${dCarousels.length - skipped} · ${sig.experimentId} · ${framework.padEnd(18)} · ${c.name.slice(0, 50)}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${c.name.slice(0, 50)} · ${err.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ Created: ${created}`);
  console.log(`⤵ Skipped: ${skipped}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`\nFrameworks used:`);
  Object.entries(usedFrameworks).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => {
    console.log(`  ${f.padEnd(20)} ${n} sets`);
  });
  console.log(`═══════════════════════════════════════`);
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
