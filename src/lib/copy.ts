/**
 * Strings centralizados · todo el copy del producto en un lugar.
 * Permite consistencia, traducción futura y A/B fácil.
 *
 * Voz: colombiana directa, voseo, operacional, sin emoji excepto CTAs.
 */

export const COPY = {
  // ─── Brand ───
  brand: {
    name: "Storu Studio",
    tagline: "El laboratorio de contenido del comercio colombiano",
    description:
      "1 idea · 1 set coherente · Historia + Carrusel + Reel listos para publicar.",
  },

  // ─── Navegación ───
  nav: {
    home: "Sets",
    brief: "Brief",
    assets: "Assets",
    brand: "Marca",
    calendar: "Calendario",
    templates: "Estilos",
    renders: "Exports",
    settings: "Ajustes",
  },

  // ─── Cmd+K ───
  palette: {
    placeholder: "Buscar acción · navegar · crear...",
    empty: "Nada que coincida. Probá otra palabra.",
    sections: {
      create: "Crear",
      navigate: "Ir a",
      edit: "Editar set",
      ai: "Pedir al agente",
      project: "Espacio",
    },
    hint: "⌘K",
  },

  // ─── Home ───
  home: {
    title: "Sets",
    subtitle: "Cada idea · 1 set coherente con Historia, Carrusel y Reel.",
    briefPlaceholder:
      "Describí una idea · ej: \"activar martes en mi pizzería de Cali\"",
    briefSubmit: "Crear set",
    briefHint: "⏎ para crear · ⌘+⇧+B para batch de varios sets",
    empty: {
      title: "Todavía no hay sets",
      body: "Cada idea es un set: Historia que teasea, Carrusel que profundiza, Reel que cierra. Empezá con una frase.",
      cta: "Crear primer set",
    },
    stats: {
      total: "Sets totales",
      ready: "Listos para publicar",
      scheduled: "Agendados",
      exported: "Exportados · north star",
      thisProject: "En este espacio",
    },
  },

  // ─── Brief intake ───
  brief: {
    title: "Brief · creá un set",
    subtitle: "Contale al agente qué querés. El resto lo arma.",
    modes: {
      single: { label: "1 set", desc: "Idea → set único · ~60s" },
      batch:  { label: "Batch", desc: "Idea → 5-30 sets variados · 3-5min" },
      photo:  { label: "Con fotos", desc: "Subí 1-5 fotos del local · contexto enriquecido" },
    },
    inputPlaceholder: "Activar mi negocio los martes sin rebajar...",
    submit: "Pasarle al agente",
    submitting: "El agente está trabajando…",
    cancelBtn: "Cancelar",
    toolHint: "Vas a ver cada herramienta que llama el agente en tiempo real",
  },

  // ─── Set workspace ───
  set: {
    backToSets: "← Sets",
    pieces: {
      story: "Historia",
      carousel: "Carrusel",
      reel: "Reel",
    },
    status: {
      pending:   "Pendiente",
      draft:     "Borrador",
      ready:     "Listo",
      scheduled: "Agendado",
      published: "Publicado",
    },
    actions: {
      schedule: "Agendar",
      scheduled: "Agendada",
      export: "Exportar ZIP",
      exporting: "Empacando…",
      markReady: "Marcar listo",
      markedReady: "✓ Listo",
      render: "Renderizar MP4",
      rendering: "Renderizando…",
      download: "Descargar",
      duplicate: "Duplicar set",
      archive: "Archivar",
      delete: "Eliminar",
    },
    inspector: {
      title: "Propiedades",
      brandTokens: "Marca",
      hook: "Hook",
      body: "Body",
      cta: "CTA",
      colors: "Colores",
      bgImage: "Imagen de fondo",
      template: "Estilo",
      duration: "Duración",
      duration_unit: "s",
      aiSuggest: "Pedirle variante al agente",
    },
    overview: {
      thread: "Hilo narrativo",
      experiment: "Experimento",
      hypothesis: "Hipótesis",
      kpis: "KPIs",
      scene: "Escena",
      captions: "Captions candidatas",
      hashtags: "Hashtags",
      references: "Referencias visuales",
      publishOrder: "Plan de publicación",
    },
    emptyPiece: {
      story: "Sin historia. Crear teaser que abra loop.",
      carousel: "Sin carrusel. Generar editorial 5 slides.",
      reel: "Sin reel. Elegir estilo + escribir guión.",
    },
    notFound: {
      title: "Set no encontrado",
      body: "Pudo haberse archivado o eliminado.",
      cta: "Volver a Sets",
    },
  },

  // ─── Asset library ───
  assets: {
    title: "Assets",
    subtitle: "Logos, fotos del local, screenshots, productos. Todo en un lugar.",
    upload: "Subir",
    uploading: "Subiendo…",
    empty: {
      title: "Sin assets todavía",
      body: "Subí logo, fotos del local, capturas. Después arrastrás al editor.",
    },
    types: {
      logo: "Logo",
      product: "Producto",
      team: "Equipo",
      location: "Locación",
      inspiration: "Inspiración",
    },
  },

  // ─── Calendar ───
  calendar: {
    title: "Calendario",
    subtitle: "Cuándo sale cada set y por qué orden.",
    today: "Hoy",
    monthLabel: (m: string, y: number | string) => `${m} ${y}`,
    selectDate: "Tocá un día para ver sets",
    unscheduled: "Sin agendar",
    legend: "Goals",
  },

  // ─── Generic ───
  common: {
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    saving: "Guardando…",
    saved: "✓ Guardado",
    delete: "Eliminar",
    edit: "Editar",
    open: "Abrir",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    loading: "Cargando…",
    error: "No se pudo completar",
    retry: "Reintentar",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    all: "Todos",
    none: "Ninguno",
    yes: "Sí",
    no: "No",
  },

  // ─── Errores ───
  errors: {
    aiNotConfigured: {
      title: "AI no configurada",
      body: "Falta OPENROUTER_API_KEY en .env.local. Conseguí una en openrouter.ai/keys.",
    },
    aiNoCredits: {
      title: "Cuenta sin créditos",
      body: "Tu cuenta OpenRouter no tiene créditos. Cargá en openrouter.ai/settings/credits.",
    },
    network: "Error de red. Intentá de nuevo.",
    notFound: "No se encontró lo que buscás.",
    timeout: "El agente tardó más de lo esperado. Probá de nuevo.",
  },

  // ─── Mensajes del agente ───
  agent: {
    starting: "Inicializando agente…",
    thinking: "Pensando…",
    callingTool: (name: string) => `Llamando ${name}…`,
    toolDone: (name: string) => `✓ ${name}`,
    finalizing: "Finalizando set…",
    done: "✓ Set creado",
  },
};

export type Copy = typeof COPY;
