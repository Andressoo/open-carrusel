/**
 * 51 sets · blueprint detallado con guiones individuales
 *
 * Cada set:
 *   - framework: cómo está estructurado el mensaje (AIDA, PAS, BAB, etc.)
 *   - rationale: por qué ese framework para ese tema
 *   - story: qué dice + por qué lo dice (teaser que abre loop)
 *   - carousel: 5 slides con texto + por qué de cada slide
 *   - reel: hook/body/cta con guión propio + por qué
 *   - ctaFlow: hacia dónde llevan las 3 piezas
 *   - image: Unsplash curado (tema coherente)
 *
 * Inspiración visual (referencias reales):
 *   - @puntoscolombia (storytelling UGC · B-roll PIP)
 *   - @bim_bam_boom (provocación tipográfica minimalista)
 *   - @modernfarmer (case studies con números grandes)
 *   - @julian.shapiro (frameworks 2x2 accionables)
 *   - @thoughtleaderplay (before/after con línea de tiempo)
 *
 * Imágenes Unsplash (rotación curada, URLs directas que no dependen del Source API deprecado)
 */

// Curated Unsplash photos (Colombian/LatAm commerce themes)
export const IMAGES = {
  cafeEspecialidad: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1080&q=80", // café
  panaderia: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1080&q=80", // bread
  barberiaFade: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1080&q=80", // barber
  spaMano: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1080&q=80", // spa
  restauranteMesa: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80", // restaurant
  fitnessStudio: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1080&q=80", // gym
  hotelBoutique: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&q=80", // hotel
  tiendaRopa: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1080&q=80", // retail
  cartagenaCalle: "https://images.unsplash.com/photo-1591017403213-5f56c7a46a03?w=1080&q=80",
  bogotaSkyline: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=1080&q=80",
  medellinBarrio: "https://images.unsplash.com/photo-1589481169991-40ee02888551?w=1080&q=80",
  barranquillaCarnaval: "https://images.unsplash.com/photo-1530532867096-9a3f51e44b6f?w=1080&q=80",
  caliSalsa: "https://images.unsplash.com/photo-1544265566-bd90d8998b4c?w=1080&q=80",
  ejeCafetero: "https://images.unsplash.com/photo-1497515098781-18a33a72d9a8?w=1080&q=80",
  santaMartaPlaya: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80",
  dashboardStats: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80",
  cajaRegistradora: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&q=80",
  mesaConPersonas: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=1080&q=80",
  brainstormNotas: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1080&q=80",
  producto: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&q=80",
  manosTrabajando: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1080&q=80",
  bandejas: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1080&q=80",
  calleColombia: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080&q=80",
  celularUsuario: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=1080&q=80",
  dineroColombiano: "https://images.unsplash.com/photo-1601591876015-fe8894b2a32d?w=1080&q=80",
  redesSociales: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1080&q=80",
  mercadoColombiano: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1080&q=80",
};

export type SlideSpec = { text: string; why: string };

export type SetBlueprint = {
  id: string; // D01
  name: string;
  framework: string;
  frameworkWhy: string;
  city: string;
  goal: string;
  archetype: string;
  ctaKeyword: string;
  anchorBrand: string;
  image: string;
  story: { dynamic: string; text: string; options?: string[]; why: string };
  carousel: { slides: SlideSpec[] };
  reel: { template: string; hook: string; body: string; cta: string; why: string };
  ctaFlow: string;
};

/* ───────────────────────────────────────────────────────────────────
 *  THE 51 SETS
 * ─────────────────────────────────────────────────────────────────── */

export const BLUEPRINT: SetBlueprint[] = [
  // ─── BLOQUE 1 · FUNDACIÓN (D01-D10) — Provocar, educar, posicionar
  {
    id: "D01", name: "D01 · Provocación · Deja de rebajar. Empieza a diseñar.",
    framework: "Pattern-Interrupt + Open Loop",
    frameworkWhy: "El rebajón está tan normalizado en Colombia que cualquier argumento lógico rebota. Hay que romper el automatismo con una pregunta incómoda que no se puede ignorar.",
    city: "Bogotá", goal: "autority", archetype: "Provocación",
    ctaKeyword: "EXPERIMENTO", anchorBrand: "Chapinero · café de especialidad",
    image: IMAGES.cafeEspecialidad,
    story: {
      dynamic: "poll",
      text: "¿Vos seguís rebajando los martes?",
      options: ["Sí, me toca", "No, ya aprendí"],
      why: "Pregunta binaria que obliga a posicionarse. Los que votan 'Sí' están admitiendo dolor · les dispara DM con el carrusel al día siguiente.",
    },
    carousel: {
      slides: [
        { text: "Pará 2 segundos.", why: "Pattern interrupt literal · rompe el scroll y obliga a pausa." },
        { text: "Rebajar no es estrategia. Es hemorragia de margen disfrazada de promoción.", why: "Reframe violento · convierte una práctica normal en un diagnóstico médico." },
        { text: "100 comercios colombianos lo hacen. Todos pierden margen. Ninguno gana cliente nuevo real.", why: "Prueba social negativa · Colombia-específico, sin data gringa." },
        { text: "Diseñá un incentivo con nombre propio. 'Martes de barrio' > '2x1'.", why: "Alternativa concreta y copiable · el nombre crea ritual." },
        { text: "Comentá EXPERIMENTO y te paso 5 ejemplos de clientes reales.", why: "CTA con keyword único · dispara auto-DM sin pedir link en bio." },
      ],
    },
    reel: {
      template: "GlitchIntro", hook: "Pará 2 segundos.",
      body: "Lo que estás haciendo los martes te está sacando plata del bolsillo sin que lo veas.",
      cta: "Comentá EXPERIMENTO.",
      why: "Glitch visual refuerza el interrupt del carrusel. Mismo hook pero en video acelera el loop.",
    },
    ctaFlow: "Story D-1 abre loop (pregunta) → Carrusel D (9am) entrega el reframe + solución → Reel D+2 (6pm) refuerza con pattern interrupt visual. Keyword EXPERIMENTO dispara auto-DM con checklist PDF de 5 incentivos bien nombrados.",
  },

  {
    id: "D02", name: "D02 · Case study · Punto G facturó $1.9M más sin cambiar carta",
    framework: "Hook-Story-Offer",
    frameworkWhy: "El caso es tan concreto y el número tan específico que vale más que 10 argumentos. Russell Brunson: 'facts tell, stories sell'.",
    city: "Medellín", goal: "capture", archetype: "Case study",
    ctaKeyword: "CASO", anchorBrand: "Punto G Gourmet · El Poblado",
    image: IMAGES.restauranteMesa,
    story: {
      dynamic: "qa",
      text: "Caso Medellín · +$1.9M en 60 días sin subir precios. ¿Querés el desglose?",
      why: "Q&A sticker le permite al usuario preguntar cualquier cosa · captura duda específica en vez de respuesta cerrada.",
    },
    carousel: {
      slides: [
        { text: "Punto G Gourmet · El Poblado · $1.9M más en 60 días.", why: "Prueba con nombre, lugar, número y tiempo · 4 anclas que hacen creíble." },
        { text: "No cambiaron la carta. No bajaron precios. No pautaron un peso.", why: "3 negaciones eliminan las explicaciones obvias · fuerza al lector a preguntarse '¿entonces qué?'" },
        { text: "Rediseñaron el martes: combo con nombre ('Martes chef') + lista VIP por WhatsApp.", why: "Revelación concreta · dos palancas, no una, para que funcione." },
        { text: "Tick promedio +59% midweek · recompra 38% → 68% en 8 semanas.", why: "Dos números que refuerzan: uno inmediato (ticket), otro compuesto (recompra)." },
        { text: "Comentá CASO y te paso el playbook Punto G paso a paso.", why: "Keyword específica · curiosidad por el cómo." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "$1.9M",
      body: "Más facturación en 60 días. Misma carta, mismo local, mismo equipo. La única variable: rediseñaron el martes.",
      cta: "Comentá CASO.",
      why: "Stat Drop maximiza el peso del número · el reel vive por la cifra grande, no por storytelling.",
    },
    ctaFlow: "Story Q&A (D-1) calificó dudas → Carrusel D profundiza con cronología → Reel D+2 resume con cifra ancla. Keyword CASO dispara DM con PDF desglose + invitación a llamada 15 min.",
  },

  {
    id: "D03", name: "D03 · Contrarian · Rebajar mata. El drop construye.",
    framework: "Contrast (Old way vs New way)",
    frameworkWhy: "El lector ya sabe rebajar (vieja forma). Mostrar el drop como nueva forma crea contraste binario · fácil de retuitear mentalmente.",
    city: "Cartagena", goal: "autority", archetype: "Contrarian",
    ctaKeyword: "DROP", anchorBrand: "Getsemaní · moda ética",
    image: IMAGES.tiendaRopa,
    story: {
      dynamic: "poll",
      text: "Rebajar vs lanzar un drop. Si tuvieras que elegir una sola vez al mes, ¿cuál?",
      options: ["Rebajar", "Lanzar drop"],
      why: "Falsa dicotomía forzada que los hace pensar en recompra vs descuento como estrategias opuestas.",
    },
    carousel: {
      slides: [
        { text: "Rebajar es hipotecar el mes siguiente.", why: "Metáfora financiera que usan todos los dueños · conecta con P&L real." },
        { text: "Drop es hipotecar 48 horas para hacer un mes.", why: "Misma palabra 'hipotecar' pero invertida · el riesgo se concentra en tiempo, no en margen." },
        { text: "Drop = cantidad limitada + fecha + lista VIP que entra primero.", why: "Fórmula operativa en una frase · ejecutable el mismo día." },
        { text: "Resultado típico: sold-out + lista de espera para el próximo.", why: "Promesa compuesta · el éxito de hoy alimenta el de mañana." },
        { text: "Comentá DROP y te paso el checklist de tu primer drop 48h.", why: "CTA que promete tiempo corto · reduce la fricción mental." },
      ],
    },
    reel: {
      template: "SplitScreen", hook: "Rebajar vs Drop",
      body: "Rebajar destroza margen. Drop construye deseo. Misma plata, decisión opuesta.",
      cta: "Comentá DROP.",
      why: "Split Screen literaliza el contraste · el formato es el mensaje.",
    },
    ctaFlow: "Story poll calibra el sesgo actual → Carrusel explica la diferencia conceptual → Reel resume el contraste. Keyword DROP dispara DM con template Notion de planeación 48h.",
  },

  {
    id: "D04", name: "D04 · Myth bust · El mes gratis es un mito caro.",
    framework: "PAS (Problem-Agitate-Solve)",
    frameworkWhy: "El 'mes gratis' se siente inofensivo pero mata membresías. PAS agita el costo oculto antes de resolver.",
    city: "Barranquilla", goal: "autority", archetype: "Myth bust",
    ctaKeyword: "MITO", anchorBrand: "Riomar · gyms boutique",
    image: IMAGES.fitnessStudio,
    story: {
      dynamic: "quiz",
      text: "Un gym regala el primer mes. ¿Qué pasa después?",
      options: ["Ganan clientes", "Pierden el que pagó", "Bajan percepción", "Todas las anteriores"],
      why: "Quiz con respuesta 'Todas' enseña que el mito tiene múltiples efectos · más educativo que un poll sí/no.",
    },
    carousel: {
      slides: [
        { text: "El 'mes gratis' no es atracción. Es anestesia.", why: "Reframe médico · convierte marketing en síntoma de enfermedad." },
        { text: "Problema 1: el cliente nunca valora lo que no pagó.", why: "Principio psicológico universal · fácil de aceptar." },
        { text: "Problema 2: el que sí paga ve el regalo y pide lo mismo.", why: "Efecto contagio · introduce daño lateral." },
        { text: "Solución: reemplazá el mes gratis por un 'ritual de bienvenida' de 14 días con coach asignado.", why: "Cambia intercambio transaccional por relación." },
        { text: "Comentá MITO y te mando el script de onboarding que usan 12 gyms colombianos.", why: "Keyword clara · promesa de prueba social concreta." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "El mes gratis no atrae.",
      body: "Anestesia la valoración. El cliente no vuelve porque nunca sintió el costo.",
      cta: "Comentá MITO.",
      why: "Typewriter da tono 'revelación' · como leer un diagnóstico que nadie había escrito.",
    },
    ctaFlow: "Story quiz enseña multi-efecto → Carrusel desarma cada efecto → Reel deja la tesis marcada. MITO dispara DM con script onboarding de 14 días + métricas de 12 gyms.",
  },

  {
    id: "D05", name: "D05 · Listicle · 5 errores en tu promo de hoy",
    framework: "4U (Useful · Urgent · Unique · Ultra-specific)",
    frameworkWhy: "Listicle de errores funciona porque es útil (aprendes) + urgente ('hoy') + ultra-específico (tu promo, no 'las promos').",
    city: "Cali", goal: "autority", archetype: "Listicle",
    ctaKeyword: "LISTA", anchorBrand: "Granada · restaurantes fusion",
    image: IMAGES.mesaConPersonas,
    story: {
      dynamic: "poll",
      text: "¿Cuál error cometiste en tu última promo? 1 = descuento plano · 2 = sin keyword · 3 = mismo horario · 4 = sin ancla",
      options: ["1", "2", "3", "4"],
      why: "Poll de 4 opciones equivale a encuesta de diagnóstico · le da al dueño un espejo de su propio error.",
    },
    carousel: {
      slides: [
        { text: "Tu promo de hoy tiene al menos 3 de estos 5 errores.", why: "Acusación suave en lugar de enseñanza · obliga a defensa (y a seguir leyendo)." },
        { text: "1. Descuento plano sin nombre. 2. Sin keyword de comentario. 3. Corre toda la semana.", why: "3 errores de ejecución que todos cometen · inmediato." },
        { text: "4. Sin ancla emocional. 5. Sin horario de franja específica.", why: "2 errores más estratégicos · arma el combo completo." },
        { text: "Uno solo de estos te cuesta 35-50% del ROI real de la promo.", why: "Número grande · justifica el costo de arreglarlo." },
        { text: "Comentá LISTA y te mando la auditoría 5x5 que aplicamos en 40 comercios.", why: "Keyword específica + oferta de herramienta diagnóstica." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "5 errores",
      body: "Tu promo de hoy tiene al menos 3. Uno te cuesta la mitad del ROI.",
      cta: "Comentá LISTA.",
      why: "Stat grande con listicle corto = máximo save rate · el formato invita a revisar después.",
    },
    ctaFlow: "Story poll diagnostica → Carrusel detalla 5 → Reel da urgencia numérica. LISTA dispara DM con auditoría Excel 5x5 editable.",
  },

  {
    id: "D06", name: "D06 · Framework · La matriz de qué campaña lanzar",
    framework: "StoryBrand SB7",
    frameworkWhy: "El dueño es el héroe confundido · Storu es la guía con un mapa (la matriz). SB7 ordena las cartas para que elija con claridad.",
    city: "Bucaramanga", goal: "autority", archetype: "Framework",
    ctaKeyword: "MATRIZ", anchorBrand: "Cabecera · comercios mixtos",
    image: IMAGES.brainstormNotas,
    story: {
      dynamic: "quiz",
      text: "¿En qué cuadrante estás? Margen alto + clientes bajos · margen alto + clientes altos · margen bajo + clientes bajos · margen bajo + clientes altos",
      options: ["MA+CB", "MA+CA", "MB+CB", "MB+CA"],
      why: "Autodiagnóstico que obliga a usar la matriz antes de ver el carrusel · preparación mental.",
    },
    carousel: {
      slides: [
        { text: "Decidir qué campaña lanzar en 30 segundos, no en 3 reuniones.", why: "Promesa de ahorro de tiempo · vende herramienta no conocimiento." },
        { text: "Eje Y: margen por venta. Eje X: clientes/mes.", why: "Dos variables universales · cualquier dueño las conoce." },
        { text: "Cuadrante 1 (alto+alto): lanza drops. Cuadrante 2 (alto+bajo): captura.", why: "Receta específica por cuadrante · elimina parálisis." },
        { text: "C3 (bajo+bajo): framework de incentivo. C4 (bajo+alto): sube ticket.", why: "Completa los 4 · cada dueño encuentra su lugar." },
        { text: "Comentá MATRIZ y te mando el Miro editable + 4 playbooks por cuadrante.", why: "Herramienta tangible · no más teoría." },
      ],
    },
    reel: {
      template: "PosterSlam", hook: "UNA MATRIZ",
      body: "Ordena en 30 segundos qué campaña lanzar según tu margen y tu volumen de clientes.",
      cta: "Comentá MATRIZ.",
      why: "Poster Slam con la palabra 'MATRIZ' gigante transmite autoridad visual · matches el tipo de contenido (framework).",
    },
    ctaFlow: "Story quiz ubica al usuario → Carrusel presenta la matriz → Reel deja la idea. MATRIZ dispara DM con link a Miro + 4 PDFs (uno por cuadrante).",
  },

  {
    id: "D07", name: "D07 · Story arc · El martes que cambió todo",
    framework: "Hook-Story-Offer (narrativa larga)",
    frameworkWhy: "Las story arcs ganan retención completa · ideal para educar sin parecer educativo. El cliente termina aprendiendo el framework sin notarlo.",
    city: "Pereira", goal: "capture", archetype: "Story arc",
    ctaKeyword: "HISTORIA", anchorBrand: "Eje Cafetero · cafeterías",
    image: IMAGES.ejeCafetero,
    story: {
      dynamic: "qa",
      text: "Un café en Pereira cambió su martes. Preguntame lo que quieras del cambio.",
      why: "Q&A abre diálogo · cada pregunta es una señal de intención para el dueño.",
    },
    carousel: {
      slides: [
        { text: "Pereira, martes lluvioso. El dueño mira la caja con 30% menos.", why: "Escena visual · abre la historia como novela." },
        { text: "Pensó en cerrar los martes. Su esposa propuso algo distinto.", why: "Giro narrativo · introduce tensión familiar/emocional." },
        { text: "No bajaron precios. Crearon 'Martes de historias': el cliente cuenta una, gana un tinto.", why: "Solución creativa + elemento humano · memorable." },
        { text: "4 martes después: 3× más clientes, cola en la puerta, 22 reviews nuevas.", why: "Cierre con prueba · números de ficción narrativa realista." },
        { text: "Comentá HISTORIA y te cuento los 7 detalles de cómo lo montaron.", why: "Curiosidad del cómo · el lector quiere la receta detrás." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "Pereira, martes lluvioso.",
      body: "Un dueño pensó en cerrar los martes. Su esposa tenía otra idea. 4 semanas después la cola daba la vuelta.",
      cta: "Comentá HISTORIA.",
      why: "Typewriter lento · te sentís leyendo un cuento · retención alta hasta el CTA.",
    },
    ctaFlow: "Story Q&A = trailer → Carrusel entrega la novela → Reel hace recap cinematográfico. HISTORIA → DM con 7 detalles operativos (horarios, scripts, menú del 'Martes de historias').",
  },

  {
    id: "D08", name: "D08 · Step-by-step · Tu primera campaña en 30 minutos",
    framework: "FAB (Features · Advantages · Benefits)",
    frameworkWhy: "Lo operativo vende mejor cuando se pasa de 'qué hace' (feature) a 'qué te da' (benefit). FAB lo secuencia.",
    city: "Santa Marta", goal: "autority", archetype: "Step-by-step",
    ctaKeyword: "PASOS", anchorBrand: "Rodadero · turismo boutique",
    image: IMAGES.manosTrabajando,
    story: {
      dynamic: "countdown",
      text: "En 30 min tenés tu primera campaña lista. Countdown abajo.",
      why: "Countdown crea compromiso · si están viendo el reloj, ya aceptaron mentalmente ejecutar.",
    },
    carousel: {
      slides: [
        { text: "30 minutos. 5 pasos. Tu primera campaña lanzada hoy.", why: "Promesa cuantificada · bajo riesgo percibido." },
        { text: "Paso 1 (6 min): escribí el objetivo en 1 línea. Qué medir.", why: "Arranque blando · cualquiera puede en 6 min." },
        { text: "Paso 2-3 (12 min): elegí el arquetipo. Redactá el hook del carrusel.", why: "Dos pasos juntos · el más pesado, pero con plantilla resuelve." },
        { text: "Paso 4-5 (12 min): agendá los 3 posts + activá auto-DM con keyword.", why: "Cierra operativo · resultado visible en Meta Suite." },
        { text: "Comentá PASOS y te mando el checklist + los 3 templates que faltan.", why: "Facilita ejecución · cumple la promesa del título." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "30 minutos.",
      body: "Paso 1 a 5. Al final del reel ya sabés qué hacer. Template en DM.",
      cta: "Comentá PASOS.",
      why: "Typewriter aumenta sensación de check-list · cada línea suena como 'item completado'.",
    },
    ctaFlow: "Story countdown crea compromiso → Carrusel entrega los 5 pasos → Reel los refuerza con ritmo. PASOS → DM con checklist PDF + 3 templates de hook.",
  },

  {
    id: "D09", name: "D09 · Case study · Salón Laura · lista de espera",
    framework: "BAB (Before-After-Bridge)",
    frameworkWhy: "Los casos de beauty se prestan perfecto para BAB · antes/después es el lenguaje natural del rubro.",
    city: "Bogotá", goal: "capture", archetype: "Case study",
    ctaKeyword: "SALON", anchorBrand: "Usaquén · salones belleza",
    image: IMAGES.spaMano,
    story: {
      dynamic: "ba",
      text: "Antes: rebaja 30% jueves. Ahora: lista de espera de 12 personas.",
      why: "Antes/Después visual · el formato IG story 'Antes/Después' existe y es altamente compartible.",
    },
    carousel: {
      slides: [
        { text: "Salón Laura · Usaquén · rebajaba 30% los jueves. 8 clientes venían.", why: "Punto de partida con dolor concreto · 30% y 8 clientes = margen destruido." },
        { text: "Reemplazó el descuento por 'Noche de hair stories'. Mismo día, mismo horario.", why: "Puente: cambio operativo simple · reemplazar no agregar." },
        { text: "Cada clienta comparte una historia del pelo mientras le hacen el servicio.", why: "Ritual simple · explica por qué funciona en 1 línea." },
        { text: "12 semanas: lista de espera de 12 + 40% de las nuevas vienen por Story tagueada.", why: "Dos métricas: directa (lista espera) y compuesta (Story UGC gratuita)." },
        { text: "Comentá SALON y te mando cómo montarlo en tu rubro.", why: "Keyword neutra y genérica · adaptable a peluquerías, spas, barberías." },
      ],
    },
    reel: {
      template: "BeforeAfter", hook: "Antes / Ahora",
      body: "De 30% descuento a lista de espera. Mismo salón, mismo equipo, mismo día.",
      cta: "Comentá SALON.",
      why: "BeforeAfter template literal · el wipe diagonal refuerza el mensaje visualmente.",
    },
    ctaFlow: "Story antes/después da el titular → Carrusel cuenta el cambio operativo → Reel comprime. SALON → DM con SOP de 'Noche de hair stories' + template de IG Story Highlight.",
  },

  {
    id: "D10", name: "D10 · Before/After · 12% retención → 73%",
    framework: "BAB + prueba visual",
    frameworkWhy: "Cambio de retención es difícil de creer. El formato before/after con números específicos lo hace tangible.",
    city: "Medellín", goal: "capture", archetype: "Before/After",
    ctaKeyword: "TRANSFORMA", anchorBrand: "Laureles · studios fitness",
    image: IMAGES.fitnessStudio,
    story: {
      dynamic: "poll",
      text: "Tu retención hoy: ¿menos del 20%, entre 20-50%, más del 50%?",
      options: ["<20%", "20-50%", ">50%"],
      why: "Poll de benchmark · cada voto es un dueño identificando su posición real vs el promedio.",
    },
    carousel: {
      slides: [
        { text: "12% → 73% de retención. Mismo local, mismo equipo, 4 meses.", why: "Salto brutal con todos los factores fijos menos uno · obliga a preguntar '¿cuál?'" },
        { text: "Lo que NO hicieron: bajar precio, regalar clase, comprar leads.", why: "3 negaciones eliminan las hipótesis obvias." },
        { text: "Lo que SÍ hicieron: 'Check-in de 60s' cada semana por WhatsApp con coach.", why: "Intervención concreta · barata y replicable." },
        { text: "Métrica clave: cliente que recibe check-in completa 3× más meses de membresía.", why: "Data específica · convierte hábito en inversión cuantificable." },
        { text: "Comentá TRANSFORMA y te mando el script + frecuencia del check-in.", why: "CTA que promete la receta operativa." },
      ],
    },
    reel: {
      template: "BeforeAfter", hook: "12% → 73%",
      body: "Mismo gym, mismo equipo, 4 meses. Una sola intervención: check-in semanal 60s.",
      cta: "Comentá TRANSFORMA.",
      why: "BeforeAfter con números específicos · el template maximiza la diferencia visual.",
    },
    ctaFlow: "Story poll diagnostica → Carrusel revela la única palanca → Reel resume con BA. TRANSFORMA → DM con script WhatsApp + frecuencia + cómo medir.",
  },

  // ─── BLOQUE 2 · APLICACIÓN POR RUBRO (D11-D25)
  {
    id: "D11", name: "D11 · Listicle · 5 campañas para tu café hoy",
    framework: "4U + tactical",
    frameworkWhy: "Dueños de café buscan tácticas ejecutables ya · 4U con lista ataca intención de acción inmediata.",
    city: "Barranquilla", goal: "valley", archetype: "Listicle",
    ctaKeyword: "CAFE", anchorBrand: "Alto Prado · cafés barrio",
    image: IMAGES.cafeEspecialidad,
    story: { dynamic: "poll", text: "¿Cuál de estas 5 tácticas ya probaste en tu café?", options: ["Hora valle", "Combo barrio", "Review + café", "Suscripción"], why: "Benchmark rápido · expone vacíos tácticos." },
    carousel: {
      slides: [
        { text: "5 campañas que podés lanzar esta semana. Cero pauta.", why: "Promesa ejecutable · cero costo extra, baja fricción." },
        { text: "1. Hora valle con nombre: 'Café de las 3' (rito, no descuento).", why: "Primer táctica más fácil · validación del concepto." },
        { text: "2. Combo-barrio: pan + café + mermelada artesanal fijo.", why: "Aumento ticket sin rebaja." },
        { text: "3. Review → café: cliente deja review Google, gana el próximo.", why: "Loop de prueba social gratuita." },
        { text: "Comentá CAFE y te mando las 5 completas + horarios sugeridos.", why: "Contiene 2 más + metadata operativa." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "5 campañas.",
      body: "Cero pauta. 1 semana. Hora valle con nombre. Combo barrio. Review→café. Suscripción mensual. Challenge de 21 días.",
      cta: "Comentá CAFE.",
      why: "Typewriter lista rápido las 5 · sensación checklist.",
    },
    ctaFlow: "Story poll calibra → Carrusel detalla 3 · Reel anuncia 5 · DM entrega las 5 completas con SOP.",
  },

  {
    id: "D12", name: "D12 · Data drop · 100 campañas analizadas",
    framework: "4P (Picture · Promise · Proof · Push)",
    frameworkWhy: "Data cruda sin imagen mental aburre · 4P le mete escena antes de los números.",
    city: "Cali", goal: "capture", archetype: "Data drop",
    ctaKeyword: "DATOS", anchorBrand: "Pacífico · mix comercios",
    image: IMAGES.dashboardStats,
    story: { dynamic: "qa", text: "Analizamos 100 campañas colombianas. Preguntame qué te gustaría saber primero.", why: "Q&A filtra qué data importa realmente al dueño." },
    carousel: {
      slides: [
        { text: "Imaginate 100 dueños, 100 estrategias, 100 resultados medibles.", why: "Picture · instala la magnitud del análisis." },
        { text: "Promesa: al final vas a saber qué funciona en Colombia, no en Estados Unidos.", why: "Promise · diferencia Colombia-específico." },
        { text: "Hallazgo 1: descuento plano genera 3× menos DMs que combo con nombre.", why: "Proof · dato duro con magnitud." },
        { text: "Hallazgo 2: CTA-keyword sube conversión a DM en 4.2×.", why: "Proof · número accionable." },
        { text: "Comentá DATOS y te mando el reporte completo PDF 14 páginas.", why: "Push · deliverable valioso." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "100 campañas",
      body: "Colombia, no gringo. Descuento plano: 3× menos DMs. Combo nombrado: 4× más. Keyword CTA: 4.2× conversión.",
      cta: "Comentá DATOS.",
      why: "StatDrop potencia el peso de la cifra '100' + los ratios.",
    },
    ctaFlow: "Story Q&A calibra duda → Carrusel entrega 2 hallazgos → Reel compila 3. DATOS → PDF 14pp.",
  },

  {
    id: "D13", name: "D13 · Myth bust · Booking no es tu amigo",
    framework: "PAS",
    frameworkWhy: "Hoteles dependen de Booking sin cuestionarlo · PAS hace ver el costo silencioso.",
    city: "Cartagena", goal: "autority", archetype: "Myth bust",
    ctaKeyword: "BOOKING", anchorBrand: "Ciudad Amurallada · hoteles boutique",
    image: IMAGES.hotelBoutique,
    story: { dynamic: "poll", text: "¿Qué % de tus bookings dependen de Booking.com?", options: ["<30%", "30-60%", ">60%"], why: "Cuantifica la dependencia personal." },
    carousel: {
      slides: [
        { text: "Booking.com no es un canal. Es un alquiler.", why: "Reframe · convierte partner en landlord." },
        { text: "Te cobra 15-20% + compite por tu propia marca en Google Ads.", why: "Agita · dos daños simultáneos." },
        { text: "Más grave: 'aprende' quién es tu cliente antes que vos.", why: "Daño estructural · pérdida de datos propios." },
        { text: "Solución: 'Cliente que llega por Booking recibe email para reservar directo la próxima con 10% off.'", why: "Jugada concreta · flip canal prestado a canal propio." },
        { text: "Comentá BOOKING y te mando el email exacto que convierte 18% al canal directo.", why: "Template listo para usar." },
      ],
    },
    reel: {
      template: "GlitchIntro", hook: "Booking no es tu amigo.",
      body: "Te cobra 18%, compite por tu marca, aprende a tu cliente. Hay una salida.",
      cta: "Comentá BOOKING.",
      why: "Glitch transmite malestar/conflicto · match con el tono confrontacional.",
    },
    ctaFlow: "Poll → Carrusel → Reel · BOOKING entrega email flip + métrica 18%.",
  },

  {
    id: "D14", name: "D14 · Framework · Checklist antes de lanzar",
    framework: "SB7",
    frameworkWhy: "Antes de lanzar, el dueño es héroe confundido · checklist lo guía a la victoria con plan claro.",
    city: "Bogotá", goal: "autority", archetype: "Framework",
    ctaKeyword: "CHECKLIST", anchorBrand: "Chicó · retail premium",
    image: IMAGES.brainstormNotas,
    story: { dynamic: "quiz", text: "¿Cuántos ítems chequeás antes de lanzar una campaña?", options: ["0-2", "3-5", "6-10", "+10"], why: "Diagnóstico autoconsciente." },
    carousel: {
      slides: [
        { text: "Si lanzás sin checklist, lanzás a ciegas.", why: "Provocación operativa." },
        { text: "Checklist Storu · 10 ítems · 5 pre-lanzamiento + 5 post.", why: "Estructura clara." },
        { text: "Pre: objetivo medible · CTA-keyword · auto-DM · 3 piezas coherentes · agenda.", why: "Los 5 bloqueadores más comunes." },
        { text: "Post: revisión 72h · ajuste captions · iteración 2 · export report · debrief.", why: "Cierra el loop de aprendizaje." },
        { text: "Comentá CHECKLIST y te mando Notion con los 10 ítems editable.", why: "Herramienta lista." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "10 ítems antes de lanzar.",
      body: "Objetivo · CTA-keyword · auto-DM · 3 piezas coherentes · agenda · debrief 72h. Sin esto, lanzás a ciegas.",
      cta: "Comentá CHECKLIST.",
      why: "Typewriter refuerza sensación de checklist literal.",
    },
    ctaFlow: "Quiz → Carrusel → Reel · CHECKLIST → Notion template.",
  },

  {
    id: "D15", name: "D15 · Contrarian · No vendes café. Vendes ritual.",
    framework: "Contrast",
    frameworkWhy: "Dueños de café están atrapados en 'producto'. Cambiar el marco a 'ritual' abre categoría nueva.",
    city: "Medellín", goal: "autority", archetype: "Contrarian",
    ctaKeyword: "RITUAL", anchorBrand: "El Poblado · cafés terceros",
    image: IMAGES.cafeEspecialidad,
    story: { dynamic: "poll", text: "¿Vos vendés café o vendés ritual?", options: ["Café", "Ritual", "No lo había pensado"], why: "Pregunta provocadora · activa reframe." },
    carousel: {
      slides: [
        { text: "Tu café tiene 40 competidores. Tu ritual, 0.", why: "Cambio categórico · elimina competencia." },
        { text: "Café es producto. Ritual es marca.", why: "Dicotomía clara." },
        { text: "Starbucks no vende café. Vende '15 min de pausa'.", why: "Referente global · prueba conceptual." },
        { text: "Tu ritual: 'Café de las 3' · 'Lunes de lectura' · 'Viernes vinilo'.", why: "Ejemplos accionables." },
        { text: "Comentá RITUAL y te mando 7 rituales copiables con horarios.", why: "Deliverable concreto." },
      ],
    },
    reel: {
      template: "PosterSlam", hook: "NO VENDES CAFÉ",
      body: "Vendés ritual. Starbucks lo sabe. Tu competidor todavía no.",
      cta: "Comentá RITUAL.",
      why: "Poster Slam grita la provocación · máximo impacto tipográfico.",
    },
    ctaFlow: "Poll → Carrusel → Reel · RITUAL entrega catálogo de 7 rituales con SOPs.",
  },

  {
    id: "D16", name: "D16 · Case study · Hotel El Prado triplicó ADR",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Caso hotelero cuantificado con ADR (métrica técnica) genera credibilidad entre dueños del rubro.",
    city: "Barranquilla", goal: "capture", archetype: "Case study",
    ctaKeyword: "ADR", anchorBrand: "Norte · hoteles boutique",
    image: IMAGES.hotelBoutique,
    story: { dynamic: "qa", text: "Hotel en Barranquilla · ADR 3× en 6 meses. Preguntame qué quieras.", why: "Invita dudas técnicas del rubro." },
    carousel: {
      slides: [
        { text: "Hotel El Prado · Barranquilla · ADR pasó de $180K a $520K en 6 meses.", why: "Número ancla + rango reconocible." },
        { text: "No subieron habitaciones. No reformaron. No cambiaron staff.", why: "3 negaciones." },
        { text: "Crearon 3 paquetes con storytelling: 'Carnaval backstage', 'Noche sola', 'Fin de semana sin celular'.", why: "Reveal: packaging narrativo." },
        { text: "Booking.com pasó de 60% a 22% de ocupación · canal directo subió a 58%.", why: "Cambio estructural de canales." },
        { text: "Comentá ADR y te mando los 3 paquetes + pricing + scripts.", why: "Valor tangible por keyword." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "3×",
      body: "ADR triplicado en 6 meses sin reformar. 3 paquetes con nombres + flip a canal directo.",
      cta: "Comentá ADR.",
      why: "StatDrop maximiza la cifra clave · el rubro entiende ADR.",
    },
    ctaFlow: "Q&A → Carrusel → Reel · ADR → 3 packaging templates + pricing sheets.",
  },

  {
    id: "D17", name: "D17 · Provocación · Tu pauta está quemada",
    framework: "Pattern-Interrupt",
    frameworkWhy: "'Pauta quemada' es término propio de la industria · genera identificación inmediata.",
    city: "Bogotá", goal: "autority", archetype: "Provocación",
    ctaKeyword: "PAUTA", anchorBrand: "Chapinero · e-commerce",
    image: IMAGES.celularUsuario,
    story: { dynamic: "poll", text: "¿Tu pauta Meta da menos ROI que hace 6 meses?", options: ["Sí", "No sé", "Ni uso pauta"], why: "Confirma el sesgo que el carrusel va a atacar." },
    carousel: {
      slides: [
        { text: "Tu pauta Meta está quemada. No lo digo yo. Lo dice tu CPA.", why: "Acusación fría." },
        { text: "CPA promedio en Colombia subió 63% en 12 meses. Conversión cayó 28%.", why: "Data colombiana." },
        { text: "La respuesta no es más budget. Es construir audiencia propia.", why: "Contra-intuitivo frente al impulso natural." },
        { text: "Canal propio: WhatsApp Business + auto-DM + email. Cero dependencia Meta.", why: "Tres palancas concretas." },
        { text: "Comentá PAUTA y te mando el audit de tu stack actual + plan de flip.", why: "Valor personalizado." },
      ],
    },
    reel: {
      template: "GlitchIntro", hook: "Tu pauta está quemada.",
      body: "CPA +63%, conversión -28% en Colombia. Más plata no arregla. Más audiencia propia, sí.",
      cta: "Comentá PAUTA.",
      why: "Glitch = sensación que algo se rompe (la pauta).",
    },
    ctaFlow: "Poll → Carrusel → Reel · PAUTA → audit 15-min + flip plan.",
  },

  {
    id: "D18", name: "D18 · Step-by-step · WhatsApp flow 10 min",
    framework: "FAB",
    frameworkWhy: "WhatsApp Business es subutilizado · FAB lo pasa de 'herramienta gratis' (feature) a 'canal directo' (benefit).",
    city: "Cali", goal: "autority", archetype: "Step-by-step",
    ctaKeyword: "WHATSAPP", anchorBrand: "Ciudad Jardín · retail",
    image: IMAGES.celularUsuario,
    story: { dynamic: "countdown", text: "En 10 min tenés tu WhatsApp flow activo.", why: "Compromiso visible." },
    carousel: {
      slides: [
        { text: "Feature: WhatsApp Business es gratis. Lo tenés bajado desde 2020.", why: "Reconoce tenencia." },
        { text: "Advantage: auto-respuesta + catálogo + botón 'reservar' en bio IG.", why: "3 features listadas." },
        { text: "Benefit: clientes reservan a las 11pm sin que vos respondas.", why: "Benefit operativo." },
        { text: "Paso 1-5 en 10 min: setear saludo, catálogo, link en IG, keyword IG auto-DM, testing.", why: "Setup completo." },
        { text: "Comentá WHATSAPP y te mando los mensajes exactos que convierten 34%.", why: "Templates probados." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "10 min. WhatsApp flow.",
      body: "Saludo · catálogo · link IG · auto-DM keyword · testing. Convierte 34% mientras dormís.",
      cta: "Comentá WHATSAPP.",
      why: "Typewriter · cada paso como tick.",
    },
    ctaFlow: "Countdown → Carrusel → Reel · WHATSAPP entrega template pack.",
  },

  {
    id: "D19", name: "D19 · Before/After · El mes que todo cambió",
    framework: "BAB",
    frameworkWhy: "Mensual es la unidad de medida que los dueños sienten en caja · BAB mes a mes resuena.",
    city: "Pereira", goal: "capture", archetype: "Before/After",
    ctaKeyword: "CAMBIO", anchorBrand: "Pinares · comercios mixtos",
    image: IMAGES.dashboardStats,
    story: { dynamic: "ba", text: "Mes anterior vs mes actual. Mirá el gráfico.", why: "Visual directo." },
    carousel: {
      slides: [
        { text: "Antes: enero flojo, caja -18%, dueño pensó cerrar el local.", why: "Punto extremo." },
        { text: "Cambio: implementó 'Jueves de lista VIP' + WhatsApp auto-DM con keyword.", why: "Dos intervenciones." },
        { text: "Resultado feb: caja +22% vs enero · 40 clientes nuevos por DM.", why: "Dos métricas." },
        { text: "Resultado mar: caja +38% · 18 clientes en lista VIP recurrente.", why: "Compuesto." },
        { text: "Comentá CAMBIO y te mando el doc mes a mes + métricas.", why: "Replicable." },
      ],
    },
    reel: {
      template: "BeforeAfter", hook: "Enero vs Marzo",
      body: "Caja -18% → +38% en 8 semanas. Dos intervenciones: lista VIP + auto-DM.",
      cta: "Comentá CAMBIO.",
      why: "BA clásico.",
    },
    ctaFlow: "Story BA → Carrusel cronología → Reel resume · CAMBIO → doc mensual.",
  },

  {
    id: "D20", name: "D20 · Data drop · 20 días, 20 carruseles",
    framework: "4P",
    frameworkWhy: "Autocaso meta-comunicado · Storu mostrando su propio experimento construye autoridad.",
    city: "Bucaramanga", goal: "autority", archetype: "Data drop",
    ctaKeyword: "VEINTE", anchorBrand: "Cañaveral · creadores",
    image: IMAGES.redesSociales,
    story: { dynamic: "poll", text: "¿Cuál crees que rindió mejor: carrusel provocación, case study o framework?", options: ["Provocación", "Case study", "Framework"], why: "Predicción antes del reveal." },
    carousel: {
      slides: [
        { text: "20 días. 20 carruseles. Mismo horario. Mismo público.", why: "Marco experimental." },
        { text: "Promesa: data abierta. Saves, shares, DMs, reach. Sin filtros.", why: "Transparencia radical." },
        { text: "Hallazgo 1: case study con nombre propio = 3.8× más saves que genérico.", why: "Cifra concreta." },
        { text: "Hallazgo 2: provocación sin solución pierde 40% de engagement después del slide 3.", why: "Contra-intuitivo." },
        { text: "Comentá VEINTE y te mando el CSV completo + learnings.", why: "Data cruda en deliverable." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "20 carruseles",
      body: "Case study nombrado gana 3.8× saves. Provocación sin solución pierde 40% retención.",
      cta: "Comentá VEINTE.",
      why: "Stat Drop refuerza los números clave.",
    },
    ctaFlow: "Poll → Carrusel → Reel · VEINTE → CSV + learnings PDF.",
  },

  {
    id: "D21", name: "D21 · Story arc · El brunch que cambió Meira",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Historia larga con personaje nombrado genera memoria episódica · recordable a la semana.",
    city: "Medellín", goal: "capture", archetype: "Story arc",
    ctaKeyword: "BRUNCH", anchorBrand: "Laureles · brunch",
    image: IMAGES.mesaConPersonas,
    story: { dynamic: "qa", text: "¿Cómo un brunch cambió el barrio? Preguntame.", why: "Q&A abre la historia." },
    carousel: {
      slides: [
        { text: "Meira abrió un brunch en Laureles. Los domingos iban 8 personas.", why: "Punto inicial débil." },
        { text: "No bajó precios. Cambió el menú por uno solo: 'Desayuno de abuela'.", why: "Un producto ancla emocional." },
        { text: "Puso lista por WhatsApp · reserva obligatoria · 25 cupos.", why: "Scarcity + fricción buena." },
        { text: "8 semanas · cola de 60 + lista de espera · medios locales lo cubren.", why: "Efecto bola de nieve." },
        { text: "Comentá BRUNCH y te mando el menú exacto + la carta WhatsApp.", why: "Reconstruible." },
      ],
    },
    reel: {
      template: "Typewriter", hook: "Meira, Laureles.",
      body: "Abrió un brunch. Domingos vacíos. Cambió todo por un solo plato: 'Desayuno de abuela'. Hoy hay cola afuera.",
      cta: "Comentá BRUNCH.",
      why: "Typewriter narrativa corta.",
    },
    ctaFlow: "Q&A → Carrusel → Reel · BRUNCH → menu sheet + WhatsApp flow.",
  },

  {
    id: "D22", name: "D22 · Case study · Marcela vendió antes de producir",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Pre-venta valida producto · caso real de artesana local inspira a makers.",
    city: "Cartagena", goal: "cashflow", archetype: "Case study",
    ctaKeyword: "PREVENTA", anchorBrand: "Getsemaní · artesanía",
    image: IMAGES.producto,
    story: { dynamic: "qa", text: "¿Se puede vender algo que no existe aún? Preguntame.", why: "Curiosidad abierta." },
    carousel: {
      slides: [
        { text: "Marcela · Getsemaní · vendió $12M en cartera antes de tener inventario.", why: "Número duro + timing." },
        { text: "Lanzó lista VIP con 3 diseños mockup · 48h de preventa.", why: "Proceso simple." },
        { text: "Solo producía lo pre-vendido · cero inventario muerto.", why: "Eficiencia operativa." },
        { text: "Ahora lanza 1 drop/mes · 100% vendido antes de producir.", why: "Modelo sostenible." },
        { text: "Comentá PREVENTA y te mando los 3 mockups + el copy de WhatsApp.", why: "Plantilla reusable." },
      ],
    },
    reel: {
      template: "StatDrop", hook: "$12M",
      body: "Marcela vendió esto antes de tener inventario. 48h de preventa. Cero plata en stock muerto.",
      cta: "Comentá PREVENTA.",
      why: "StatDrop con la cifra fuerte.",
    },
    ctaFlow: "Q&A → Carrusel → Reel · PREVENTA → mockups + copy WhatsApp.",
  },

  {
    id: "D23", name: "D23 · Contrarian · Juan Valdez no necesita pauta",
    framework: "Contrast",
    frameworkWhy: "Referencia icónica colombiana · todos saben quién es · perfecto para contraste.",
    city: "Bogotá", goal: "autority", archetype: "Contrarian",
    ctaKeyword: "MARCA", anchorBrand: "Multi-ciudad · marcas icónicas",
    image: IMAGES.cafeEspecialidad,
    story: { dynamic: "poll", text: "¿Juan Valdez pauta más o menos que un Starbucks local?", options: ["Más", "Menos", "Igual"], why: "Intuición vs realidad." },
    carousel: {
      slides: [
        { text: "Juan Valdez pauta 5× menos que sus competidores locales.", why: "Claim contrarian." },
        { text: "Antiguo: marca se construye con budget.", why: "Vieja creencia." },
        { text: "Nuevo: marca se construye con historia y consistencia visual.", why: "Nueva tesis." },
        { text: "Pauta de Juan Valdez es PR · no performance. El resto es marca orgánica.", why: "Distinción clave." },
        { text: "Comentá MARCA y te mando 5 marcas colombianas que gastan poco y venden mucho.", why: "Prueba social extendida." },
      ],
    },
    reel: {
      template: "PosterSlam", hook: "JUAN VALDEZ",
      body: "No depende de pauta. Depende de historia. Tu marca también puede.",
      cta: "Comentá MARCA.",
      why: "Poster Slam icónico · respeta la marca referenciada.",
    },
    ctaFlow: "Poll → Carrusel → Reel · MARCA → lista 5 marcas.",
  },

  {
    id: "D24", name: "D24 · Before/After · Retención 18% → 68% en 4 meses",
    framework: "BAB",
    frameworkWhy: "Retención cuantificada en meses es timeline que el dueño pyme puede planear.",
    city: "Santa Marta", goal: "capture", archetype: "Before/After",
    ctaKeyword: "RETENCION", anchorBrand: "Bello Horizonte · suscripciones",
    image: IMAGES.dashboardStats,
    story: { dynamic: "poll", text: "Tu retención actual: ¿menor del 30%, 30-50%, más del 50%?", options: ["<30%", "30-50%", ">50%"], why: "Benchmark." },
    carousel: {
      slides: [
        { text: "Retención 18% → 68%. 4 meses. Mismo producto. Mismo precio.", why: "Salto creíble con factores fijos." },
        { text: "Intervención: check-in mensual en video personalizado (60s) por WhatsApp.", why: "Una sola palanca." },
        { text: "Costo: $0 extra. Tiempo: 30min/semana.", why: "Bajo costo, alto ROI." },
        { text: "Cliente que recibe check-in dura 3.2× más meses.", why: "Retorno duro." },
        { text: "Comentá RETENCION y te mando el script + cadencia.", why: "Plantilla operativa." },
      ],
    },
    reel: {
      template: "BeforeAfter", hook: "18% → 68%",
      body: "Retención en 4 meses. Mismo producto. Intervención: video WhatsApp 60s. Costo: cero.",
      cta: "Comentá RETENCION.",
      why: "Clásico BA con % grande.",
    },
    ctaFlow: "Poll → Carrusel → Reel · RETENCION → script + cadencia.",
  },

  {
    id: "D25", name: "D25 · Case study · Spa Caracol 85% memberships",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Spa es rubro premium · case con % alto de memberships se vende solo.",
    city: "Cali", goal: "recompra", archetype: "Case study",
    ctaKeyword: "SPA", anchorBrand: "Granada · spas boutique",
    image: IMAGES.spaMano,
    story: { dynamic: "qa", text: "Spa en Cali: 85% de memberships. Preguntame cómo lo hicieron.", why: "Q&A abre proceso." },
    carousel: {
      slides: [
        { text: "Spa Caracol · Cali · 85% de ingresos vienen de memberships. Antes era 30%.", why: "Shift estructural." },
        { text: "Crearon 3 tiers: 'Semilla' · 'Fuerza' · 'Luz'. Nombres, no precios.", why: "Anclaje emocional vs racional." },
        { text: "Cada tier incluye 1 ritual mensual fuera del catálogo normal.", why: "Valor exclusivo." },
        { text: "Cliente membership gasta 2.4× más que cliente puntual en 12 meses.", why: "Dato de LTV." },
        { text: "Comentá SPA y te mando las 3 estructuras + pricing + scripts de venta.", why: "Implementable." },
      ],
    },
    reel: {
      template: "PosterSlam", hook: "85%",
      body: "De ingresos por memberships. Tres tiers con nombres emocionales. LTV 2.4× el puntual.",
      cta: "Comentá SPA.",
      why: "Poster Slam icónico con cifra.",
    },
    ctaFlow: "Q&A → Carrusel → Reel · SPA → 3 tiers + scripts.",
  },

  // ─── BLOQUE 3 · ESTRATEGIAS AVANZADAS (D26-D40)
  {
    id: "D26", name: "D26 · Framework · Cómo mascotas duplica LTV",
    framework: "SB7",
    frameworkWhy: "Nicho específico (veterinarias, pet shops) con SB7 donde la 'mascota' es el héroe emocional.",
    city: "Medellín", goal: "recompra", archetype: "Framework",
    ctaKeyword: "MASCOTA", anchorBrand: "Envigado · pet shops",
    image: IMAGES.producto,
    story: { dynamic: "poll", text: "¿Cuántos servicios recurrentes vendés a un mismo cliente de pet?", options: ["1", "2-3", "4-6", "+6"], why: "Diagnóstico de profundidad comercial." },
    carousel: {
      slides: [
        { text: "LTV cliente pet = 2.3× si entra en plan 'vida entera'.", why: "Concepto clave."},
        { text: "Bundle: comida + peluquería + vacuna + chequeo + guardería.", why: "5 servicios · uno solo es suficiente." },
        { text: "El dueño compra por la mascota, no por el precio.", why: "Insight emocional." },
        { text: "Membership anual = 8× acciones de compra vs no membership.", why: "Data operativa." },
        { text: "Comentá MASCOTA y te mando el bundle armable + pricing.", why: "Aplicable." },
      ],
    },
    reel: { template: "Typewriter", hook: "LTV pet: 2.3×", body: "Plan 'vida entera': comida + peluquería + vacuna + chequeo + guardería. El dueño no compra precio, compra emoción.", cta: "Comentá MASCOTA.", why: "Tone listicle." },
    ctaFlow: "Poll → Carrusel → Reel · MASCOTA → bundle sheet.",
  },

  {
    id: "D27", name: "D27 · Step-by-step · Vende empleo, no cursos",
    framework: "FAB",
    frameworkWhy: "Educators venden cursos · nadie venda empleos · reframe categoría.",
    city: "Bogotá", goal: "capture", archetype: "Step-by-step",
    ctaKeyword: "EMPLEO", anchorBrand: "Multi · educación online",
    image: IMAGES.brainstormNotas,
    story: { dynamic: "quiz", text: "¿Tu curso promete empleo o promete conocimiento?", options: ["Empleo", "Conocimiento", "Ambos", "Ninguno"], why: "Diagnóstico posicionamiento." },
    carousel: {
      slides: [
        { text: "Nadie compra un curso. Compran el trabajo que promete.", why: "Reframe."},
        { text: "Paso 1: documentá qué empleo real obtienen los graduados.", why: "Partida concreta." },
        { text: "Paso 2: conseguí 3 testimonios con cargo, empresa, salario.", why: "Proof punto específico." },
        { text: "Paso 3: el hero no es el curso · son los 3 graduados.", why: "Pivote de comunicación." },
        { text: "Comentá EMPLEO y te mando el framework de testimonios.", why: "Template." },
      ],
    },
    reel: { template: "Typewriter", hook: "Vendé empleo, no cursos.", body: "3 testimonios con cargo, empresa, salario. El hero no es el curso. Son los 3 graduados.", cta: "Comentá EMPLEO.", why: "Tone claridad." },
    ctaFlow: "Quiz → Carrusel → Reel · EMPLEO → template.",
  },

  {
    id: "D28", name: "D28 · Case study · Cartagena sale de Booking",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Caso real de hotel dejando Booking · aspiración compartida por muchos hoteleros.",
    city: "Cartagena", goal: "cashflow", archetype: "Case study",
    ctaKeyword: "DIRECTO", anchorBrand: "Bocagrande · hoteles",
    image: IMAGES.hotelBoutique,
    story: { dynamic: "qa", text: "Hotel Cartagena salió de Booking. Preguntame cómo.", why: "Invita dudas." },
    carousel: {
      slides: [
        { text: "Hotel en Bocagrande pasó de 75% Booking a 12% en 9 meses.", why: "Shift dramático."},
        { text: "No subió precio directo · creó email sequence post-estancia.", why: "Tactic simple." },
        { text: "Cada huésped Booking → email con descuento 12% próxima directa.", why: "Flip canal." },
        { text: "Canal directo ahora 58% · margen +27% por no pagar comisión.", why: "Outcome dual." },
        { text: "Comentá DIRECTO y te mando la secuencia de 4 emails exacta.", why: "Plantilla clave." },
      ],
    },
    reel: { template: "StatDrop", hook: "75% → 12%", body: "Booking dependency flip en 9 meses. 4 emails post-estancia. Margen +27%.", cta: "Comentá DIRECTO.", why: "Stat shift." },
    ctaFlow: "Q&A → Carrusel → Reel · DIRECTO → email sequence.",
  },

  {
    id: "D29", name: "D29 · Listicle · 5 formas de vender fitness",
    framework: "4U",
    frameworkWhy: "Fitness saturado · lista acciona con variedad.",
    city: "Barranquilla", goal: "autority", archetype: "Listicle",
    ctaKeyword: "FITNESS", anchorBrand: "Riomar · studios",
    image: IMAGES.fitnessStudio,
    story: { dynamic: "poll", text: "¿Cuál forma ya probaste? 1 = challenge · 2 = duo · 3 = corp · 4 = retreat", options: ["1","2","3","4"], why: "Diagnóstico variedad." },
    carousel: {
      slides: [
        { text: "5 ángulos de venta en fitness. Pasale de 'clase suelta' a 'experiencia'.", why: "Shift categórico."},
        { text: "1. Challenge 21 días con nombre. 2. Duo pricing (dos llegan, uno paga menos).", why: "Dos ideas claras." },
        { text: "3. Corporate lunch 12:15-12:45. 4. Weekend retreat fuera del local.", why: "Dos más ambiciosas." },
        { text: "5. Membership entrenador-con-nombre (no plan, persona).", why: "Último high-ticket." },
        { text: "Comentá FITNESS y te mando pricing + pitch por cada uno.", why: "Ready to use." },
      ],
    },
    reel: { template: "Typewriter", hook: "5 ángulos fitness.", body: "Challenge. Duo. Corp lunch. Retreat. Entrenador-con-nombre. Cada uno rompe el 'clase suelta'.", cta: "Comentá FITNESS.", why: "Listado rápido." },
    ctaFlow: "Poll → Carrusel → Reel · FITNESS → pricing sheet.",
  },

  {
    id: "D30", name: "D30 · Contrarian · Mystery Box venció al descuento",
    framework: "Contrast",
    frameworkWhy: "Mystery Box es formato poco conocido en CO · contrastar vs rebajón es novedoso.",
    city: "Medellín", goal: "autority", archetype: "Contrarian",
    ctaKeyword: "MISTERIO", anchorBrand: "Envigado · retail",
    image: IMAGES.producto,
    story: { dynamic: "poll", text: "¿Qué vendería mejor: 30% off o Mystery Box $80K?", options: ["30% off", "Mystery Box"], why: "Choque intuición." },
    carousel: {
      slides: [
        { text: "Tienda Envigado · Mystery Box vendió 4× más que 30% off mismo mes.", why: "Número duro."},
        { text: "Viejo: bajar precio. Descuento: -30%.", why: "Contraste A." },
        { text: "Nuevo: caja cerrada, precio fijo, 3 productos curados sorpresa.", why: "Contraste B." },
        { text: "Margen Mystery: 52% vs 18% del 30% off.", why: "Economic truth." },
        { text: "Comentá MISTERIO y te mando el pricing + curaduría 3 boxes.", why: "Plantillas." },
      ],
    },
    reel: { template: "SplitScreen", hook: "-30% vs Mystery Box", body: "Mismo mes, misma tienda. Mystery: 4× más unidades. Margen 52% vs 18%.", cta: "Comentá MISTERIO.", why: "Split visual perfecto." },
    ctaFlow: "Poll → Carrusel → Reel · MISTERIO → pricing + curaduría.",
  },

  {
    id: "D31", name: "D31 · Myth bust · Los dueños no negocian cuidado",
    framework: "PAS",
    frameworkWhy: "'Cuidado del cliente' se trata como intangible · hay que mostrar costo concreto de no hacerlo.",
    city: "Cali", goal: "autority", archetype: "Myth bust",
    ctaKeyword: "CUIDADO", anchorBrand: "San Antonio · servicios",
    image: IMAGES.manosTrabajando,
    story: { dynamic: "quiz", text: "¿Qué % de clientes perdidos se hubieran quedado con 1 gesto?", options: ["<10%", "20-40%", "40-70%", ">70%"], why: "Revelar magnitud." },
    carousel: {
      slides: [
        { text: "67% de clientes que se van lo hacen por 'nadie me contactó'.", why: "Data impactante."},
        { text: "El mito: 'son pocos los que se van'. La realidad: 5-15% mensual sin verlo.", why: "Realidad oculta." },
        { text: "Agita: perdiste $4M al año sin darte cuenta.", why: "Pain money." },
        { text: "Solución: 1 mensaje personalizado a cliente inactivo 30 días.", why: "Low-effort big-impact." },
        { text: "Comentá CUIDADO y te mando el template + cadencia.", why: "Operativo." },
      ],
    },
    reel: { template: "Typewriter", hook: "67% se va en silencio.", body: "1 gesto personalizado a los 30 días salva 5-15% de churn. Eso son $4M al año promedio.", cta: "Comentá CUIDADO.", why: "Tono revelación." },
    ctaFlow: "Quiz → Carrusel → Reel · CUIDADO → templates + cadencia.",
  },

  {
    id: "D32", name: "D32 · Case study · Varadero franja valle 3×",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Restaurante Varadero franja valle con 3× prueba que horas no-pico son oro.",
    city: "Cartagena", goal: "valley", archetype: "Case study",
    ctaKeyword: "VALLE", anchorBrand: "Getsemaní · restaurantes",
    image: IMAGES.restauranteMesa,
    story: { dynamic: "qa", text: "Restaurante triplicó franja valle · preguntame cómo.", why: "Invitación." },
    carousel: {
      slides: [
        { text: "Varadero · Cartagena · 3× clientes franja 3-6pm en 10 semanas.", why: "Stat duro."},
        { text: "Franja valle antes: 8 cubiertos. Ahora: 24. Mismo precio.", why: "Números específicos." },
        { text: "Tactic: 'Tarde de ceviche' con reserva + plato único.", why: "Ritual + scarcity." },
        { text: "Marketing: IG Story poll + lista VIP WhatsApp + auto-DM palabra CEVICHE.", why: "3 piezas." },
        { text: "Comentá VALLE y te mando la operación completa.", why: "Full handoff." },
      ],
    },
    reel: { template: "StatDrop", hook: "3× en franja valle", body: "Cartagena · 8 → 24 cubiertos 3-6pm. Ritual + scarcity + auto-DM. Mismo local.", cta: "Comentá VALLE.", why: "StatDrop coherente." },
    ctaFlow: "Q&A → Carrusel → Reel · VALLE → operación completa.",
  },

  {
    id: "D33", name: "D33 · Framework · La fórmula del combo",
    framework: "SB7",
    frameworkWhy: "Combo parece obvio pero nadie lo diseña bien · framework lo vuelve ciencia.",
    city: "Bogotá", goal: "ticket", archetype: "Framework",
    ctaKeyword: "COMBO", anchorBrand: "Chicó · restaurantes casual",
    image: IMAGES.bandejas,
    story: { dynamic: "quiz", text: "¿Tu combo tiene nombre propio o es 'Combo #1'?", options: ["Tiene nombre", "Es #1 o similar", "No tengo combo"], why: "Diagnóstico posicionamiento." },
    carousel: {
      slides: [
        { text: "Combo #1 no sube ticket. Combo 'Domingo de abuela' sí.", why: "Diferencia crítica."},
        { text: "Fórmula: ancla + satélite + ritual + nombre emocional.", why: "4 componentes." },
        { text: "Ancla: producto estrella margen alto. Satélite: algo complementario barato.", why: "Económica." },
        { text: "Ritual: momento del día · nombre: memoria emocional.", why: "Branding 101." },
        { text: "Comentá COMBO y te mando la matriz 4x4 editable + 12 ejemplos.", why: "Herramienta + ideas." },
      ],
    },
    reel: { template: "PosterSlam", hook: "COMBO #1 PIERDE", body: "Ancla + satélite + ritual + nombre emocional. Sin los 4, es descuento disfrazado.", cta: "Comentá COMBO.", why: "Poster Slam firme." },
    ctaFlow: "Quiz → Carrusel → Reel · COMBO → matriz + ejemplos.",
  },

  {
    id: "D34", name: "D34 · Before/After · Cevichería pasó a club privado",
    framework: "BAB",
    frameworkWhy: "Transformación de concepto · misma cocina, modelo opuesto · BAB potente.",
    city: "Cali", goal: "launch", archetype: "Before/After",
    ctaKeyword: "CLUB", anchorBrand: "Pacífico · cevicherías",
    image: IMAGES.restauranteMesa,
    story: { dynamic: "ba", text: "Cevichería abierta vs Club privado · mirá el flip.", why: "BA directo." },
    carousel: {
      slides: [
        { text: "Cevichería abierta en Cali. Mesas vacías martes-miércoles.", why: "Punto débil."},
        { text: "Flip: cerró al público random · creó 'Club del Ceviche' con membresía.", why: "Cambio estructural." },
        { text: "Membership: 70 miembros · $280K/año · 2 entradas/semana + evento mensual.", why: "Unit economics." },
        { text: "De local con mesas sin llenar a waitlist de 40.", why: "Cambio de demanda." },
        { text: "Comentá CLUB y te mando el modelo + pricing + reglas.", why: "Replicable." },
      ],
    },
    reel: { template: "BeforeAfter", hook: "Abierto → Club privado", body: "Cevichería en Cali cerró al público. Creó 'Club del Ceviche'. 70 miembros · waitlist de 40.", cta: "Comentá CLUB.", why: "BA contundente." },
    ctaFlow: "Story BA → Carrusel → Reel · CLUB → modelo + pricing.",
  },

  {
    id: "D35", name: "D35 · Case study · Mayo 10 = Q2 entero",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Día de la Madre en Colombia es brutal · caso real muestra cómo sobre-prepararse.",
    city: "Bogotá", goal: "launch", archetype: "Case study",
    ctaKeyword: "MAYO", anchorBrand: "Multi · comercios retail",
    image: IMAGES.tiendaRopa,
    story: { dynamic: "countdown", text: "Mayo 10 · faltan X días · ¿preparado?", why: "Urgencia concreta." },
    carousel: {
      slides: [
        { text: "Una tienda Bogotá facturó 42% del Q2 en mayo 5-10.", why: "Magnitud concentrada."},
        { text: "Empezó la pre-venta el 15 de abril · 3.5 semanas de runway.", why: "Timeline crítico." },
        { text: "Lista VIP con 300 clientes existentes · primera oferta el 22 abril.", why: "Audiencia propia." },
        { text: "Stock para 6 días · sold-out el 8.", why: "Execution proof." },
        { text: "Comentá MAYO y te mando el calendario + copy por día.", why: "Templa de campaña." },
      ],
    },
    reel: { template: "StatDrop", hook: "42% del Q2", body: "En 5 días. Pre-venta desde abril 15. Lista VIP. Stock para 6 días. Sold-out día 8.", cta: "Comentá MAYO.", why: "Stat duro + timeline." },
    ctaFlow: "Countdown → Carrusel → Reel · MAYO → calendar + copy.",
  },

  {
    id: "D36", name: "D36 · Contrarian · 14 de febrero NO es tu fecha",
    framework: "Contrast",
    frameworkWhy: "Todos atacan San Valentín · contrarian abre espacio libre.",
    city: "Medellín", goal: "autority", archetype: "Contrarian",
    ctaKeyword: "FECHA", anchorBrand: "Multi · retail",
    image: IMAGES.calleColombia,
    story: { dynamic: "poll", text: "¿Vale la pena pautar San Valentín o ya está saturado?", options: ["Vale", "Saturado", "Depende"], why: "Debate." },
    carousel: {
      slides: [
        { text: "14 feb tiene 4000 comercios compitiendo. Tu fecha es otra.", why: "Claim."},
        { text: "Tu calendario propio: 3 fechas no obvias de tu rubro.", why: "Reframe." },
        { text: "Ej café: 'Día internacional del café' 1 oct · menos ruido · 100% nicho.", why: "Ejemplo concreto." },
        { text: "Ej gym: '1 sep' post-vacaciones · momento de decisión real.", why: "Insight temporal." },
        { text: "Comentá FECHA y te mando tu calendario contrarian 2026.", why: "Calendar personalizado." },
      ],
    },
    reel: { template: "Contrast" as string, hook: "14 feb NO", body: "4000 competidores. Tu fecha es otra. 1 oct café. 1 sep gym. Menos ruido, más conversión.", cta: "Comentá FECHA.", why: "Contraste conceptual." },
    ctaFlow: "Poll → Carrusel → Reel · FECHA → calendar 2026.",
  },

  {
    id: "D37", name: "D37 · Contrarian · Black Friday sin descontar",
    framework: "Contrast",
    frameworkWhy: "Black Friday es sinónimo de descuento · hacerlo al revés posiciona premium.",
    city: "Bogotá", goal: "launch", archetype: "Contrarian",
    ctaKeyword: "NEGRO", anchorBrand: "Premium · comercios",
    image: IMAGES.tiendaRopa,
    story: { dynamic: "poll", text: "Black Friday: ¿bajar precios o subir valor?", options: ["Bajar", "Subir valor"], why: "Choque estrategia." },
    carousel: {
      slides: [
        { text: "Mientras todos bajan, vos subís. Black Friday invertido.", why: "Hook contrarian."},
        { text: "Ejemplo: lanzar producto premium exclusivo sólo ese weekend.", why: "Reframe táctico." },
        { text: "Pricing +15% sobre regular · argumento: 'edición limitada'.", why: "Justificación." },
        { text: "Resultado típico: 30-40% de tus mejores clientes compran.", why: "Audience split." },
        { text: "Comentá NEGRO y te mando el playbook anti-descuento.", why: "Guide." },
      ],
    },
    reel: { template: "PosterSlam", hook: "BLACK FRIDAY INVERTIDO", body: "Mientras todos bajan, vos subís. Edición limitada +15%. Tus mejores clientes compran.", cta: "Comentá NEGRO.", why: "Poster con fuerza." },
    ctaFlow: "Poll → Carrusel → Reel · NEGRO → playbook.",
  },

  {
    id: "D38", name: "D38 · Listicle · Q4 corporativo",
    framework: "4U",
    frameworkWhy: "B2B Q4 es terreno específico · lista urgente con tips accionables.",
    city: "Bogotá", goal: "cashflow", archetype: "Listicle",
    ctaKeyword: "DICIEMBRE", anchorBrand: "Corp · servicios B2B",
    image: IMAGES.dashboardStats,
    story: { dynamic: "countdown", text: "Faltan X días para cerrar Q4 con clientes corporativos.", why: "Urgencia." },
    carousel: {
      slides: [
        { text: "Diciembre = nuevo enero para B2B colombiano.", why: "Reframe."},
        { text: "1. Gifting corporativo personalizado (no canasta estándar).", why: "Táctica 1." },
        { text: "2. Cierre fiscal · servicios que entran como gasto deducible.", why: "Táctica 2." },
        { text: "3. Retainer 2026 con descuento por pago anticipado dic 20.", why: "Cashflow trick." },
        { text: "Comentá DICIEMBRE y te mando las 5 tácticas B2B + templates.", why: "Full pack." },
      ],
    },
    reel: { template: "Typewriter", hook: "Diciembre = nuevo enero B2B", body: "Gifting · deducible fiscal · retainer 2026 anticipado. 3 tácticas que pagan Q1 antes de empezar.", cta: "Comentá DICIEMBRE.", why: "Terminal serio." },
    ctaFlow: "Countdown → Carrusel → Reel · DICIEMBRE → 5 tácticas.",
  },

  {
    id: "D39", name: "D39 · Case study · Julio no es solo papelería",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Regreso a clases es obvio para papelerías · abrir para otros rubros es la innovación.",
    city: "Medellín", goal: "capture", archetype: "Case study",
    ctaKeyword: "JULIO", anchorBrand: "Multi · retail niños",
    image: IMAGES.calleColombia,
    story: { dynamic: "qa", text: "¿Qué vende un restaurante en regreso a clases? Preguntame.", why: "Abrir categoría." },
    carousel: {
      slides: [
        { text: "Regreso a clases no es solo papelería. Es momento familiar.", why: "Reframe."},
        { text: "Restaurante Medellín · 'Almuerzo post-matrícula' · +180% cubiertos julio.", why: "Caso concreto." },
        { text: "Gym · 'Renegociate 2026' promo padres · +42% altas julio.", why: "Segundo case." },
        { text: "Peluquería · 'Look primer día' niños · agenda full 3 semanas.", why: "Tercer case." },
        { text: "Comentá JULIO y te mando los 7 casos por rubro.", why: "Pack rubros." },
      ],
    },
    reel: { template: "StatDrop", hook: "+180% cubiertos", body: "Restaurante Medellín en julio. No vende almuerzo. Vende 'post-matrícula'. Gym +42%. Peluquería full.", cta: "Comentá JULIO.", why: "Stat + multi-caso." },
    ctaFlow: "Q&A → Carrusel → Reel · JULIO → 7 casos.",
  },

  {
    id: "D40", name: "D40 · Story arc · Carnaval no es tu problema",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Costa se paraliza por Carnaval · aprovechar en vez de aguantar.",
    city: "Barranquilla", goal: "launch", archetype: "Story arc",
    ctaKeyword: "CARNAVAL", anchorBrand: "Alto Prado · retail costeño",
    image: IMAGES.barranquillaCarnaval,
    story: { dynamic: "qa", text: "¿Barranquilla te paraliza el Carnaval? Preguntame la salida.", why: "Abrir problema." },
    carousel: {
      slides: [
        { text: "Febrero · Barranquilla · todos cierran por Carnaval. Vos no.", why: "Contrarian."},
        { text: "Retail costeño abrió 'Carnaval pre-fiesta' · lookbook específico.", why: "Táctica 1." },
        { text: "Salón belleza · 'Maquillaje Carnaval' con reserva obligatoria.", why: "Táctica 2." },
        { text: "Facturación semana de Carnaval = 22% del mes (antes 4%).", why: "Impact data." },
        { text: "Comentá CARNAVAL y te mando el playbook costeño.", why: "Regional pack." },
      ],
    },
    reel: { template: "Typewriter", hook: "Carnaval no te paraliza.", body: "Costa · febrero · 22% del mes en 4 días. 'Pre-fiesta', 'maquillaje Carnaval', reservas obligatorias.", cta: "Comentá CARNAVAL.", why: "Narrativa costeña." },
    ctaFlow: "Q&A → Carrusel → Reel · CARNAVAL → playbook costa.",
  },

  // ─── BLOQUE 4 · TÁCTICAS OPERATIVAS (D41-D51)
  {
    id: "D41", name: "D41 · Step-by-step · Polls en Stories, 2h",
    framework: "FAB",
    frameworkWhy: "IG poll es gratuito, subutilizado · FAB muestra el valor real.",
    city: "Pereira", goal: "validate", archetype: "Step-by-step",
    ctaKeyword: "POLLS", anchorBrand: "Circunvalar · creadores",
    image: IMAGES.celularUsuario,
    story: { dynamic: "quiz", text: "¿Usás IG polls semanalmente?", options: ["Sí", "A veces", "No"], why: "Diagnóstico uso." },
    carousel: {
      slides: [
        { text: "Un poll bien armado = feedback en 2 horas · gratis.", why: "Promise."},
        { text: "Paso 1: pregunta binaria con dolor implícito.", why: "Técnica 1." },
        { text: "Paso 2: agregá sticker 'pregúntame lo que quieras' abajo.", why: "Profundizar." },
        { text: "Paso 3: respondé a cada votante por DM personalizado en 24h.", why: "Convertir respuesta en relación." },
        { text: "Comentá POLLS y te mando 12 plantillas de polls por rubro.", why: "Deliverable." },
      ],
    },
    reel: { template: "Typewriter", hook: "Poll en 2 horas.", body: "Pregunta binaria con dolor + sticker 'preguntame' + DM personalizado. Feedback gratis, calificado.", cta: "Comentá POLLS.", why: "Tutorial rápido." },
    ctaFlow: "Quiz → Carrusel → Reel · POLLS → 12 plantillas.",
  },

  {
    id: "D42", name: "D42 · Framework · Countdown, palanca urgencia",
    framework: "SB7",
    frameworkWhy: "Countdown es underused en CO · framework lo vuelve sistemático.",
    city: "Bogotá", goal: "launch", archetype: "Framework",
    ctaKeyword: "URGENCIA", anchorBrand: "Multi · creadores",
    image: IMAGES.celularUsuario,
    story: { dynamic: "countdown", text: "Countdown activo 48h · sumate.", why: "Demo en vivo." },
    carousel: {
      slides: [
        { text: "Countdown bien hecho triplica conversión pre-lanzamiento.", why: "Stat claim."},
        { text: "Regla 1: deadline real, no arbitrario.", why: "Autenticidad." },
        { text: "Regla 2: stock/cupos limitados verificables.", why: "Scarcity real." },
        { text: "Regla 3: recordatorios cada 12h con número que baja.", why: "Progreso visible." },
        { text: "Comentá URGENCIA y te mando el flujo de 48h + copy.", why: "Template." },
      ],
    },
    reel: { template: "StatDrop", hook: "3× conversión", body: "Countdown bien hecho. Deadline real. Stock limitado. Updates cada 12h. Sin esto, es teatro.", cta: "Comentá URGENCIA.", why: "Stat impact." },
    ctaFlow: "Countdown → Carrusel → Reel · URGENCIA → 48h flow.",
  },

  {
    id: "D43", name: "D43 · Listicle · Q&A sticker · autoridad gratis",
    framework: "4U",
    frameworkWhy: "Q&A sticker es subutilizado · lista de 5 usos aplica ya.",
    city: "Bucaramanga", goal: "autority", archetype: "Listicle",
    ctaKeyword: "PREGUNTA", anchorBrand: "Floridablanca · creadores",
    image: IMAGES.redesSociales,
    story: { dynamic: "qa", text: "Preguntame cualquier cosa sobre Q&A sticker.", why: "Demostración literal." },
    carousel: {
      slides: [
        { text: "Q&A sticker: autoridad gratis en 24h.", why: "Promesa."},
        { text: "1. 'Pregúntame cualquier cosa' sobre tu oficio.", why: "Abierto amplio." },
        { text: "2. 'Democracia' · pedí que voten qué post hacer.", why: "Co-creación." },
        { text: "3. 'Dolor abierto' · '¿qué te frustra de [nicho]?'.", why: "Research." },
        { text: "Comentá PREGUNTA y te mando los 5 usos + ejemplos.", why: "Full pack." },
      ],
    },
    reel: { template: "Typewriter", hook: "Q&A sticker.", body: "Autoridad gratis. 5 usos: preguntame · democracia · dolor abierto · sorpresa · tema. Engagement 3× vs post.", cta: "Comentá PREGUNTA.", why: "Tone amigable." },
    ctaFlow: "Q&A live → Carrusel → Reel · PREGUNTA → 5 usos pack.",
  },

  {
    id: "D44", name: "D44 · Step-by-step · Link en bio ya no alcanza",
    framework: "FAB",
    frameworkWhy: "Auto-DM por keyword supera link en bio · FAB lo explica sin jerga.",
    city: "Cali", goal: "autority", archetype: "Step-by-step",
    ctaKeyword: "BIO", anchorBrand: "Ciudad Jardín · creadores",
    image: IMAGES.celularUsuario,
    story: { dynamic: "quiz", text: "Link en bio vs auto-DM keyword: ¿cuál convierte más?", options: ["Link bio", "Auto-DM", "Igual"], why: "Debate común." },
    carousel: {
      slides: [
        { text: "Link en bio: 1 click y se pierden 80% en la transición.", why: "Dolor concreto."},
        { text: "Auto-DM keyword: 0 clicks · arranca conversación directa.", why: "Feature clave." },
        { text: "Advantage: te escriben ellos · no tenés que perseguir.", why: "Cambio de rol." },
        { text: "Benefit: 4.2× conversión a DM calificado vs link.", why: "Benefit cuantificado." },
        { text: "Comentá BIO y te mando el setup ManyChat + plantillas.", why: "Stack práctico." },
      ],
    },
    reel: { template: "SplitScreen", hook: "Link bio vs Auto-DM", body: "Link pierde 80% en la transición. Auto-DM por keyword: 4.2× más DMs calificados. Setup: 20 min.", cta: "Comentá BIO.", why: "Split natural." },
    ctaFlow: "Quiz → Carrusel → Reel · BIO → ManyChat setup.",
  },

  {
    id: "D45", name: "D45 · Before/After · Antes/Después es prueba pura",
    framework: "BAB meta",
    frameworkWhy: "Carrusel meta sobre el formato · los creadores aprenden a usarlo viéndolo.",
    city: "Bogotá", goal: "autority", archetype: "Before/After",
    ctaKeyword: "ANTES", anchorBrand: "Multi · creadores",
    image: IMAGES.dashboardStats,
    story: { dynamic: "ba", text: "Antes vs después: post genérico vs post before/after.", why: "Demostración meta." },
    carousel: {
      slides: [
        { text: "Post sin antes/después: 400 saves promedio.", why: "Control."},
        { text: "Post con antes/después claro: 1800 saves promedio. 4.5×.", why: "Treatment." },
        { text: "Fórmula: 1 métrica · 2 puntos temporales · 1 intervención.", why: "Receta." },
        { text: "Clave: el 'puente' (cómo se pasó de A a B) es lo valioso.", why: "Insight." },
        { text: "Comentá ANTES y te mando 8 templates listos.", why: "Stock." },
      ],
    },
    reel: { template: "BeforeAfter", hook: "Post normal → A/D", body: "400 saves → 1800. 4.5×. Fórmula: 1 métrica, 2 puntos, 1 intervención. El puente es lo valioso.", cta: "Comentá ANTES.", why: "BA meta." },
    ctaFlow: "Story BA → Carrusel → Reel · ANTES → 8 templates.",
  },

  {
    id: "D46", name: "D46 · Framework · Mencioná merchants, te mencionan",
    framework: "SB7",
    frameworkWhy: "Network effect local · comunidad construye audiencia compuesta.",
    city: "Santa Marta", goal: "capture", archetype: "Framework",
    ctaKeyword: "MERCHANT", anchorBrand: "Rodadero · comercios multi",
    image: IMAGES.mercadoColombiano,
    story: { dynamic: "poll", text: "¿Cuántos comercios de tu zona tageás en un mes?", options: ["0", "1-3", "4-10", "+10"], why: "Benchmark." },
    carousel: {
      slides: [
        { text: "Tu audiencia suma · la de tu zona multiplica.", why: "Network effect."},
        { text: "Regla 1: tageá 3 comercios/semana que NO son competencia directa.", why: "Cadencia." },
        { text: "Regla 2: hacé post que los hace ver bien · reciprocan.", why: "Valor primero." },
        { text: "Regla 3: historia destacada 'Vecinos' con los 10 tuyos.", why: "Assets compartidos." },
        { text: "Comentá MERCHANT y te mando la plantilla de red local.", why: "Community playbook." },
      ],
    },
    reel: { template: "Typewriter", hook: "Tu zona multiplica.", body: "3 merchants/semana · no competencia · valor primero. Highlight 'Vecinos'. Audiencia compuesta en 60 días.", cta: "Comentá MERCHANT.", why: "Tutorial relaciones." },
    ctaFlow: "Poll → Carrusel → Reel · MERCHANT → community playbook.",
  },

  {
    id: "D47", name: "D47 · Step-by-step · Quiz en Stories · enseña y mide",
    framework: "FAB",
    frameworkWhy: "Quiz duplica uso de poll · enseña + genera data.",
    city: "Cartagena", goal: "autority", archetype: "Step-by-step",
    ctaKeyword: "QUIZ", anchorBrand: "Bocagrande · creadores",
    image: IMAGES.celularUsuario,
    story: { dynamic: "quiz", text: "¿Cuál es la mejor práctica para quizzes IG?", options: ["4 opciones", "Respuesta + explicación", "CTA al final", "Todas"], why: "Demostración meta." },
    carousel: {
      slides: [
        { text: "Quiz > poll. Enseña + mide al mismo tiempo.", why: "Value prop."},
        { text: "Feature: 4 opciones · 1 correcta · explicación al revelar.", why: "Estructura." },
        { text: "Advantage: el que se equivoca aprende · el que acierta se siente smart.", why: "Two win." },
        { text: "Benefit: saves 2.1× · DMs con duda específica · contenido regenerable.", why: "Métrica triple." },
        { text: "Comentá QUIZ y te mando 15 plantillas por rubro.", why: "Bank." },
      ],
    },
    reel: { template: "Typewriter", hook: "Quiz > poll.", body: "4 opciones · 1 correcta · explicación. Saves 2.1×. DMs con duda. Contenido que regenerás semanal.", cta: "Comentá QUIZ.", why: "Tutorial." },
    ctaFlow: "Quiz → Carrusel → Reel · QUIZ → 15 plantillas.",
  },

  {
    id: "D48", name: "D48 · Framework · La matriz final de tu 2026",
    framework: "SB7",
    frameworkWhy: "Matriz anual ayuda a priorizar · meta-framework sobre tu año.",
    city: "Bogotá", goal: "autority", archetype: "Framework",
    ctaKeyword: "YEAR", anchorBrand: "Multi · dueños",
    image: IMAGES.brainstormNotas,
    story: { dynamic: "quiz", text: "¿Ya tenés tu matriz 2026?", options: ["Sí", "No", "¿Qué matriz?"], why: "Diagnóstico." },
    carousel: {
      slides: [
        { text: "4 cuadrantes · 12 meses · 52 experimentos posibles.", why: "Promise."},
        { text: "Ejes: esfuerzo (bajo/alto) · impacto (bajo/alto).", why: "Marco clásico." },
        { text: "Regla: hacé 1 experimento alto-impacto bajo-esfuerzo por mes.", why: "Cadencia sostenible." },
        { text: "Los alto-impacto alto-esfuerzo van a Q3 cuando ya tengas momentum.", why: "Timing." },
        { text: "Comentá YEAR y te mando la matriz + 52 experimentos sugeridos.", why: "Anual delivery." },
      ],
    },
    reel: { template: "PosterSlam", hook: "52 EXPERIMENTOS", body: "1 por semana. Matriz esfuerzo/impacto. Alto-alto van a Q3. Cadencia sostenible · año planeado.", cta: "Comentá YEAR.", why: "Impact poster." },
    ctaFlow: "Quiz → Carrusel → Reel · YEAR → matriz 52-exp.",
  },

  {
    id: "D49", name: "D49 · Data drop · 50 días 50 carruseles",
    framework: "4P",
    frameworkWhy: "Meta-autocaso · Storu documenta su propio experimento.",
    city: "Bogotá", goal: "autority", archetype: "Data drop",
    ctaKeyword: "CINCUENTA", anchorBrand: "Storu",
    image: IMAGES.dashboardStats,
    story: { dynamic: "poll", text: "¿Cuál creés que fue el carrusel que más guardó?", options: ["Provocación", "Case study", "Framework", "Manifiesto"], why: "Predict-reveal." },
    carousel: {
      slides: [
        { text: "50 días. 50 carruseles. 1 experimento.", why: "Marco."},
        { text: "Resultado global: 22K saves · 8K shares · 1.4K DMs calificados.", why: "Numbers." },
        { text: "Top performer: case study nombrado 'Punto G' · 2200 saves.", why: "Winner." },
        { text: "Bottom performer: manifiesto genérico sin caso · 180 saves.", why: "Learner." },
        { text: "Comentá CINCUENTA y te mando el CSV + 5 learnings.", why: "Transparency." },
      ],
    },
    reel: { template: "StatDrop", hook: "22K saves", body: "50 días, 50 carruseles. Top: case study nombrado. Bottom: manifiesto genérico. Ganó la especificidad.", cta: "Comentá CINCUENTA.", why: "StatDrop masivo." },
    ctaFlow: "Poll → Carrusel → Reel · CINCUENTA → CSV + learnings.",
  },

  {
    id: "D50", name: "D50 · Provocación · Esto apenas empieza",
    framework: "Pattern-Interrupt + Manifesto",
    frameworkWhy: "Cierre de serie · combinar provocación con manifiesto pivota a next chapter.",
    city: "Multi", goal: "autority", archetype: "Provocación",
    ctaKeyword: "EMPIEZA", anchorBrand: "Storu",
    image: IMAGES.calleColombia,
    story: { dynamic: "poll", text: "¿Seguís después de 50 carruseles? Sí/No.", options: ["Sí", "No"], why: "Commitment check." },
    carousel: {
      slides: [
        { text: "50 carruseles son el prólogo.", why: "Reframe."},
        { text: "El experimento recién arranca · 2026 va por 200.", why: "Escala." },
        { text: "Comercios colombianos · ciudades nuevas · rubros sin tocar.", why: "Expansión." },
        { text: "Próximos 30 días: 10 sets nuevos · cada lunes.", why: "Cadencia." },
        { text: "Comentá EMPIEZA y te agregamos a la lista prioridad 2026.", why: "Loop al futuro." },
      ],
    },
    reel: { template: "PosterSlam", hook: "ESTO APENAS EMPIEZA", body: "50 carruseles son el prólogo. 2026 va por 200. 10 sets nuevos cada lunes.", cta: "Comentá EMPIEZA.", why: "Slam cierre/apertura." },
    ctaFlow: "Poll → Carrusel → Reel · EMPIEZA → lista prioridad.",
  },

  {
    id: "D51", name: "D51 · Case study · Panadería Barranquilla 18→85",
    framework: "Hook-Story-Offer",
    frameworkWhy: "Ya fue creado en detalle (scripts/create-d51.mjs) · sirve de template para futuros sets.",
    city: "Barranquilla", goal: "valley", archetype: "Case study",
    ctaKeyword: "PANADERIA", anchorBrand: "Pan del Río · Alto Prado",
    image: IMAGES.panaderia,
    story: { dynamic: "qa", text: "Panadería Barranquilla pasó de 18 a 85 clientes un martes. Preguntame.", why: "Q&A abre caso." },
    carousel: {
      slides: [
        { text: "Pan del Río · Alto Prado · pasó de 18 a 85 clientes un martes.", why: "Hook factual con ancla."},
        { text: "Martes muerto no es hecho. Es síntoma.", why: "Reframe del problema." },
        { text: "Reemplazaron 'Martes 2x1' por 'Martes de barrio' (combo con nombre).", why: "Solución narrativa."},
        { text: "4 martes · 4.7× clientes · +38% ticket · 23 reviews · 0 pauta.", why: "Números reales."},
        { text: "Comentá PANADERIA y te mando el playbook exacto.", why: "CTA keyword."},
      ],
    },
    reel: { template: "TikTokHook", hook: "Alto Prado, Barranquilla.", body: "Panadería pasó de 18 a 85 clientes un martes sin rebajar. Te cuento el cambio exacto que hicieron.", cta: "Comentá PANADERIA.", why: "TikTokHook clásico porque el storytelling aguanta hablado."},
    ctaFlow: "Q&A → Carrusel completo (5 slides) → Reel · PANADERIA → DM con playbook Notion + sheet martes + 3 scripts de onboarding.",
  },
];

/**
 * ───────────────────────────────────────────────────────────────────
 *  GUÍA DE PUBLICACIÓN GLOBAL
 * ───────────────────────────────────────────────────────────────────
 *
 * Cadencia: 1 set por semana (o cada 3 días para ritmo acelerado).
 * Cada set: Historia día D-1 (teaser) · Carrusel día D (editorial) ·
 * Reel día D+2 (refuerzo). Auto-DM con keyword activa conversación.
 *
 * Métricas por set (target):
 *   - Saves carrusel > 8% del alcance
 *   - DMs con keyword > 30 / 72h
 *   - Complete rate reel > 60%
 *   - Reach share > 1.5× followers
 *
 * Rotación visual:
 *   - Carrusel: paleta Storu (ink/yellow/violet)
 *   - Reel: template varía según archetype (GlitchIntro · StatDrop ·
 *     SplitScreen · Typewriter · PosterSlam · TikTokHook · BeforeAfter)
 *   - Imagen hero por set (Unsplash curado)
 *
 * Iteración:
 *   - Debrief 72h: qué saves, qué DMs, qué no.
 *   - Ajuste captions en base a comentarios reales.
 *   - Próximo set referencia el mejor-performer del anterior.
 */
