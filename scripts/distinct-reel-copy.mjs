#!/usr/bin/env node
/**
 * Regenera el copy de cada reel para que sea GENUINAMENTE distinto del
 * carrusel y de la historia:
 *  - Hook del reel ≠ primer slide del carrusel
 *  - Body abre un ángulo nuevo (no repite el insight del carrusel)
 *  - CTA rota entre 10 formatos distintos (no todos son "Comentá X")
 *
 * Ejemplo (D01):
 *   Carrusel slide 1: "Pará 2 segundos."
 *   Reel hook ANTES:   "Pará 2 segundos."  ← REPITE
 *   Reel hook AHORA:  "Esto te saca plata sin que lo veas."  ← ÁNGULO NUEVO
 *   CTA ANTES:         "Comentá EXPERIMENTO."
 *   CTA AHORA:         "Dejá EXPERIMENTO abajo · te llega al DM."  ← VARIACIÓN
 *
 * Usage:
 *   node scripts/distinct-reel-copy.mjs
 */

const API = process.env.API_BASE || "http://localhost:3000";

// 10 estilos de CTA · rotación determinista
const CTA_STYLES = [
  (kw) => `Dejá ${kw} abajo · te llega al DM.`,
  (kw) => `Palabra mágica: ${kw}. Escribila.`,
  (kw) => `Si te sirve, ${kw} en comentarios.`,
  (kw) => `Escribí ${kw} y te respondo hoy.`,
  (kw) => `${kw} · una palabra · cero fricción.`,
  (kw) => `Comentá ${kw}. Va al DM en 10 min.`,
  (kw) => `${kw} → respuesta directa por mensaje.`,
  (kw) => `Tocá el comentario. Palabra: ${kw}.`,
  (kw) => `${kw} abajo y te paso todo por DM.`,
  (kw) => `Dale ${kw} en los comentarios.`,
];

// Hook styles distintos del carrusel · abren ángulos nuevos
const HOOK_GENERATORS = {
  Provocación: (ctx) => [
    `Esto te saca plata sin que lo veas.`,
    `Te lo digo una vez y no lo repito.`,
    `El negocio del frente ya lo entendió.`,
    `3 segundos · y cambia como vendés.`,
  ],
  "Case study": (ctx) => [
    `${ctx.city}, caso real. Mirá esto.`,
    `Dueño de local me llamó ayer.`,
    `Un caso tapa 10 argumentos. Este es ese.`,
    `No lo inventé · pasó en ${ctx.city}.`,
  ],
  Contrarian: (ctx) => [
    `La mayoría está equivocada. Yo lo era también.`,
    `Si te indigna, escuchame hasta el final.`,
    `Lo impopular se volvió el único camino.`,
    `Pregunta incómoda: ¿y si estás en la calle equivocada?`,
  ],
  "Myth bust": (ctx) => [
    `Creíste esto · tus profes también.`,
    `El dato rompe el mito en 9 segundos.`,
    `Lo que te dijeron era marketing, no verdad.`,
    `Revisé la data · la creencia popular está muerta.`,
  ],
  Listicle: (ctx) => [
    `5 movidas · cero rebaja · ejecutables hoy.`,
    `Si vas en el 3, ya ganaste.`,
    `Top 5 sin relleno. Si duele, era necesario.`,
    `No es teoría · son 5 cosas que arrancás hoy.`,
  ],
  Framework: (ctx) => [
    `Una matriz te ahorra 3 reuniones.`,
    `Si no tenés esto, estás adivinando.`,
    `Ordená tu año en 30 segundos.`,
    `Dos ejes · cuatro cuadrantes · una decisión.`,
  ],
  VS: (ctx) => [
    `A o B · elegís ahora · sin volver atrás.`,
    `Mirá bien los dos lados antes de elegir.`,
    `Una decisión · un año distinto.`,
    `El que no elige, pierde.`,
  ],
  "Step by step": (ctx) => [
    `Abrí el reloj · 30 min · vamos.`,
    `Sin teoría · hacelo junto conmigo.`,
    `Paso 1 antes de que termine el reel.`,
    `Si lo hacés ahora, sale. Si lo pospones, no.`,
  ],
  "Data drop": (ctx) => [
    `Data colombiana · no gringa · no gurú.`,
    `Números fríos · tiran abajo 3 mitos.`,
    `100 casos · 1 patrón claro.`,
    `Si la data te sorprende, es porque era mito.`,
  ],
  "Before/After": (ctx) => [
    `Mismo local · distinto resultado.`,
    `Una sola variable cambió todo.`,
    `Antes sufría · ahora respira.`,
    `El puente entre ambos cabe en un reel.`,
  ],
  "Story arc": (ctx) => [
    `Te cuento algo que pasó hace 2 semanas.`,
    `Escuchame 30 segundos · vale la historia.`,
    `Historia corta · final real.`,
    `Un lunes cualquiera · un cambio grande.`,
  ],
  Launch: (ctx) => [
    `72 horas · después se va.`,
    `Lista VIP cerrada pronto.`,
    `Si estás pensando entrar · ahora.`,
    `Drop arranca · cuenta regresiva ya.`,
  ],
  Manifesto: (ctx) => [
    `Lo digo una vez · leé despacio.`,
    `Esta es nuestra postura · firma.`,
    `Si coincidís, sumate · si no, pasá.`,
    `No negocio esto · es línea firme.`,
  ],
};

// Body generators · 4 variaciones por arquetipo (se rotan por hash del nombre)
const BODY_GENERATORS = {
  Provocación: (ctx) => [
    `${ctx.city} · comercios que rebajan pierden 4× más margen que los que diseñan. No lo digo yo · la data de 100 locales.`,
    `Los martes los mata el descuento · los revive el ritual. Tu calle lo va a ver primero en vos o en el del frente.`,
    `Si tu promo de hoy no tiene nombre propio · ya perdió. Los clientes compran rituales, no porcentajes.`,
    `Rebajar es hipotecar el margen del mes siguiente. Diseñá una vez · cobrás 4 meses.`,
  ],
  "Case study": (ctx, bp) => [
    `${bp.anchorBrand?.split("·")[0].trim() || ctx.city} lo probó 8 semanas. Mismo local · mismo equipo · un solo cambio específico. El número cae en 2 segundos.`,
    `Caso real · fechas reales · dueño con nombre. No es teoría · es un comercio en ${ctx.city} que pasó la prueba en 2 meses.`,
    `Lo medimos antes, durante y después. El efecto no fue suerte · fue protocolo. Te paso el protocolo.`,
    `${ctx.city}, cliente nuevo nos mandó caja registradora antes y después. Diferencia no vino de pauta · vino de diseño.`,
  ],
  Contrarian: (ctx) => [
    `Vieja forma: competir por precio. Nueva forma: construir ritual. ${ctx.city} tiene 4000 competidores en precio · casi 0 en ritual.`,
    `Todos siguen el manual del 2018. El 2018 se acabó · el CPA subió 63% · el manual ya no sirve.`,
    `El consejo popular te cuesta margen · el dato real te lo devuelve. Colombia necesita menos copia de gurús gringos.`,
    `Si hacés lo mismo que el del frente, competís por precio. Diferenciarte tampoco es más flashy · es más útil.`,
  ],
  "Myth bust": (ctx) => [
    `El mito dura porque nadie lo midió. Nosotros sí · 12 comercios en ${ctx.city} · data pública al DM.`,
    `Lo repetimos hasta creerlo · después la caja dice otra cosa. Números duros · sin corrección política.`,
    `Mes gratis no atrae · anestesia. Booking no es canal · es alquiler. Rebajar no es promoción · es hemorragia.`,
    `El marketing viejo vendía esto como verdad. Los datos del 2024-2026 dicen lo contrario · tan simple.`,
  ],
  Listicle: (ctx) => [
    `5 tácticas · 7 días de ejecución · 0 pauta. Si hacés 3 de las 5, tu próxima promo rinde 2.8× mejor.`,
    `Top 5 aplicables hoy: horario valle con nombre, combo-barrio, review-trade, suscripción chica, challenge 21 días.`,
    `5 puntos · cada uno ejecutable en 1 hora. Si ya usás 3, pasá al siguiente carrusel · si no, empezá por el #1.`,
    `Lista corta · ejemplos reales · métrica por cada ítem. Guarda esto · volvés en 3 meses.`,
  ],
  Framework: (ctx) => [
    `Dos ejes: margen y volumen. Cuatro cuadrantes · cuatro tácticas distintas. Te ubicás en 30 segundos.`,
    `Una matriz reemplaza 3 reuniones confundidas. Esta te dice qué campaña lanzar según tu realidad, no la del libro.`,
    `Framework ≠ teoría. Es un filtro de decisión. Si la promo no cumple los 4 puntos, no sale del draft.`,
    `Tenemos 10 frameworks probados con data colombiana. Este ordena prioridades · los otros 9 salen uno por semana.`,
  ],
  VS: (ctx) => [
    `Rebajar cuesta margen hoy. Drop cuesta 48h de foco. Elegí con qué querés quedarte · no podés con los dos.`,
    `A la izquierda: el camino que todos toman. A la derecha: el que casi nadie · y los resultados lo dicen.`,
    `Dos opciones · un año distinto. La decisión se toma en 30 segundos · se vive 12 meses.`,
    `Si tuvieras que defender solo una en un directorio, ¿cuál? Ahí está la que de verdad te importa.`,
  ],
  "Step by step": (ctx) => [
    `5 pasos · 30 minutos · primera campaña lista. Empezá con paso 1: objetivo en una línea. Lo demás viene solo.`,
    `Sin teoría · sin fluff. Abrís IG, WhatsApp, Notion · te guío en paralelo · al final del reel tenés el setup.`,
    `Cronómetro arriba · 5 acciones · checkpoints claros. Si pasaste el paso 3 ya valió.`,
    `Este workflow lo hicieron 200 comercios. Tiempo promedio: 28 minutos. No necesitás más herramientas de las que ya tenés.`,
  ],
  "Data drop": (ctx) => [
    `100 casos · 3 patrones: naming (×3.8 saves), CTA-keyword (×4.2 DMs), cadencia 72h (×2.1 reach). Colombia-específico.`,
    `Data de 6 ciudades · 8 rubros · 12 meses. Sin promoted posts · sin ediciones. Número crudo al DM.`,
    `Medimos lo que nadie mide: DMs calificados por keyword. Los descubrimientos van a cambiar cómo postees.`,
    `Ratios concretos · no opiniones. Si tu número está debajo del promedio, el problema es la táctica · no el mercado.`,
  ],
  "Before/After": (ctx) => [
    `Antes: el ticket promedio pegado. Después: una intervención chica movió la aguja 4 meses seguidos. El cómo cabe en 2 slides.`,
    `Foto antes · foto después · 4 meses entre medio. Una sola variable cambió · la mostramos en el carrusel.`,
    `18% a 73% no es suerte · es protocolo. El protocolo dura 60 segundos en reel · 5 slides en carrusel.`,
    `Mismo local · mismo equipo · mismo precio. Lo único que cambió fue cómo hablan con el cliente inactivo.`,
  ],
  "Story arc": (ctx) => [
    `Un dueño en ${ctx.city} pensó en cerrar un día fijo. Su equipo propuso algo distinto · funcionó en 4 semanas · hoy es el día más rentable.`,
    `Historia corta: martes lluvioso · caja vacía · idea improbable · cola en la puerta 2 meses después.`,
    `Cada negocio tiene su 'martes que cambió todo'. Te cuento el nuestro · después contame el tuyo.`,
    `Personajes reales · decisiones chicas · resultado grande. El clic fue entender al cliente antes que al producto.`,
  ],
  Launch: (ctx) => [
    `48 horas de pre-venta · lista VIP · cupos limitados. Sin pauta · sin rebaja · con tensión real. La primera aplicación ya está lista.`,
    `Drop sábado 8pm. Lista VIP cerró ayer. Si ves esto, estás en el borde · deciden los primeros 40.`,
    `Countdown es palanca · la urgencia no es truco si el cupo es real. Esta vez el cupo es 70 personas y pico.`,
    `Pre-venta · producción · entrega · feedback. 4 fases · 10 días · el producto sale hecho por sus primeros clientes.`,
  ],
  Manifesto: (ctx) => [
    `Invertimos en clientes, no en alcance. Diseñamos incentivos, no descontamos. Publicamos experimentos, no promesas.`,
    `Creemos que el comercio colombiano necesita menos gurú y más data local · menos rebaja y más ritual.`,
    `Cada línea de este perfil es postura firme. Si te hace click, sumate. Si te incomoda, también está bien.`,
    `Trabajamos para que tu martes valga lo mismo que tu sábado. Eso pide diseño · no suerte · ni pauta.`,
  ],
};

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function detectArchetype(name) {
  const parts = name.split("·").map(p => p.trim());
  return parts[2] || parts[1] || "Manifesto";
}

function extractCity(anchorBrand) {
  const cities = ["Bogotá","Medellín","Cartagena","Barranquilla","Cali","Bucaramanga","Pereira","Santa Marta"];
  return cities.find(c => anchorBrand?.includes(c)) || "Colombia";
}

async function main() {
  console.log("⏳ Fetching sets + reels + carousels…");
  const [{ sets }, { reels }, { carousels }] = await Promise.all([
    api("/api/content-sets"),
    api("/api/reels"),
    api("/api/carousels"),
  ]);

  const reelById = new Map(reels.map(r => [r.id, r]));
  const carouselById = new Map(carousels.map(c => [c.id, c]));

  const expSets = sets.filter(s => s.name.startsWith("EXP-STORU-") && s.reel?.id);
  console.log(`✓ ${expSets.length} sets a procesar\n`);

  let updated = 0;
  const ctaStyleCount = {};
  // Round-robin counters per archetype (guarantee variation use)
  const archeCounter = {};

  // Sort for deterministic round-robin
  expSets.sort((a, b) => a.name.localeCompare(b.name));

  for (const s of expSets) {
    const archetype = detectArchetype(s.name);
    const city = extractCity(s.anchorBrand);
    const ctx = { city };
    const idx = (archeCounter[archetype] = (archeCounter[archetype] || 0) + 1) - 1;

    const hooks = (HOOK_GENERATORS[archetype] || HOOK_GENERATORS.Manifesto)(ctx);
    const hook = hooks[idx % hooks.length];

    const bodies = (BODY_GENERATORS[archetype] || BODY_GENERATORS.Manifesto)(ctx, s);
    const body = bodies[idx % bodies.length];

    // CTA uses hash for variety across archetypes (not per-archetype counter)
    const ctaIdx = (hash(s.name) + idx) % CTA_STYLES.length;
    const cta = CTA_STYLES[ctaIdx](s.ctaKeyword || "EXPERIMENTO");
    ctaStyleCount[`style-${ctaIdx}`] = (ctaStyleCount[`style-${ctaIdx}`] || 0) + 1;

    const oldReel = reelById.get(s.reel.id);
    if (!oldReel) continue;

    const newProps = {
      ...oldReel.props,
      hook,
      body,
      cta,
    };

    const newReel = await api("/api/reels", "POST", {
      template: oldReel.template,
      props: newProps,
      duration: oldReel.duration,
      fps: oldReel.fps,
      aspectRatio: oldReel.aspectRatio,
    });
    await api("/api/content-sets", "PUT", {
      id: s.id, piece: "reel",
      updates: { id: newReel.id, status: "ready" },
    });
    updated++;
    if (updated % 10 === 0) console.log(`  · ${updated}/${expSets.length}`);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ Reels reescritos: ${updated}`);
  console.log(`\nDistribución CTA styles:`);
  for (let i = 0; i < CTA_STYLES.length; i++) {
    const count = ctaStyleCount[`style-${i}`] || 0;
    console.log(`  ${i}: ${count} reels  (ej: "${CTA_STYLES[i]("EXPERIMENTO")}")`);
  }
  console.log(`═══════════════════════════════════════`);
}

main().catch(e => { console.error(e); process.exit(1); });
