# Storu Studio · Arquitectura y Roadmap

Documento de referencia para entender qué es el producto hoy, cómo está construido por dentro, qué puede y no puede hacer, y hacia dónde evoluciona.

---

## 1. Para el usuario final · Qué resuelve y cómo

### Problema que soluciona
El comercio pyme colombiano produce contenido de forma caótica: el carrusel va un día, la historia otro, el reel nunca, y cada pieza habla de cosas distintas. Eso mata la coherencia, el recall y la conversión.

### Solución de Storu
**1 idea = 1 set coherente = Historia + Carrusel + Reel + Captions + Hashtags + Calendario.**

Cada set tiene:
- un framework de comunicación asignado (AIDA, PAS, BAB, Hook-Story-Offer, SB7, 4P, 4U, FAB, Pattern-Interrupt, Contrast)
- una ciudad colombiana como anchor
- una CTA-keyword única (la palabra mágica que dispara auto-DM)
- un experimento firmado con hipótesis y KPIs medibles a 72h

### Flujo del usuario · end-to-end

```
┌──────────────────────────────────────────────────────────────┐
│ 1. ESCRIBO UNA IDEA                                          │
│    "Quiero llenar mi restaurante los martes en Barranquilla" │
│                                                              │
│    → /generate (Claude CLI genera N sets en batch)           │
│    → /create (AI magic en el CreateHubDialog)                │
│    → Manual desde dashboard                                  │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. AI ARMA EL BRIEF COMPLETO                                 │
│    - Framework asignado + por qué                            │
│    - Topic, goal, archetype, CTA-keyword                     │
│    - Thread narrativo                                        │
│    - 5 captions + 10 hashtags                                │
│    - Referencias visuales                                    │
│    - Carrusel 5 slides con guión por slide                   │
│    - Historia con dinámica apropiada (poll/quiz/qa/bigger)   │
│    - Reel con guión propio (hook ≠ carrusel slide 1)         │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. EDITO CADA PIEZA DENTRO DEL SET                           │
│    /set/[id]                                                 │
│    - Tab Overview: thread, captions, hashtags, refs          │
│    - Tab Historia: 7 dinámicas + preview 9:16 vivo           │
│    - Tab Carrusel: 5+ slides con editor HTML + chat Claude   │
│    - Tab Reel: 8 templates Remotion + Player preview         │
│                                                              │
│    Marco "ready" cada pieza cuando está lista.               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. AGENDO FECHA                                              │
│    - Botón "Agendar" en /set/[id]                            │
│    - Vista calendario /calendar mes con todos los sets       │
│    - Auto-schedule bulk (scripts/auto-schedule-sets.mjs)     │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. EXPORTO ZIP LISTO PARA PUBLICAR                           │
│    /api/content-sets/[id]/export                             │
│    - carrusel/slide-1.png … slide-5.png (4:5 Instagram)      │
│    - reel/reel-<template>.mp4 (1080×1920 Remotion render)    │
│    - historia/historia.json + historia.txt                   │
│    - captions.txt con 5 variaciones + hashtags + KPIs        │
│    - README.md con orden de publicación sugerido             │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. PUBLICO EN IG SIGUIENDO EL ORDEN                          │
│    Día D-1  · Historia teasea (abre loop)                    │
│    Día D    · Carrusel editorial (profundiza)                │
│    Día D+2  · Reel refuerzo (pattern interrupt)              │
│    → Todos con misma CTA-keyword                             │
│    → Auto-DM pre-configurado responde en 10 min              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura interna

### Stack
- **Next.js 16** (App Router, Turbopack) con React 19 y TypeScript
- **Tailwind v4** + shadcn/ui para UI
- **Remotion 4.0.440** (Player client-side + renderer/bundler server-side)
- **Claude CLI** como subproceso (spawn) para AI con streaming SSE
- **Puppeteer** para exportar slides HTML a PNG
- **Almacenamiento:** JSON files en `/data/` con async-mutex + atomic writes (no DB externa, todo local)

### Estructura del repo

```
open-carrusel/
├── src/
│   ├── app/                      Next.js routes
│   │   ├── page.tsx              Dashboard (sets grid)
│   │   ├── set/[id]/page.tsx     Editor unificado Historia/Carrusel/Reel
│   │   ├── carousel/[id]/        Editor profundo de carrusel (chat + DnD)
│   │   ├── generate/             Bulk AI generator
│   │   ├── calendar/             Vista mes
│   │   ├── studio/               Catálogo de 12 templates (Storu + EPM)
│   │   └── api/
│   │       ├── chat/             Claude CLI stream SSE para editor carrusel
│   │       ├── content-sets/     CRUD de sets + /[id]/export (ZIP)
│   │       ├── carousels/        CRUD + /[id]/export PNG
│   │       ├── stories/          CRUD historias
│   │       ├── reels/            CRUD reels (props + template)
│   │       ├── render/           Remotion renderer → MP4
│   │       ├── ai/
│   │       │   ├── generate-set/    1 idea → 1 set brief
│   │       │   └── generate-batch/  N ideas → N sets streaming
│   │       ├── brand/            Config de marca
│   │       └── projects/         Multi-proyecto (isolation por slug)
│   │
│   ├── lib/
│   │   ├── data.ts               async-mutex + atomic JSON writes + project routing
│   │   ├── carousels.ts          CRUD + version history
│   │   ├── chat-system-prompt.ts Dynamic system prompt con brand context
│   │   ├── slide-html.ts         wrapSlideHtml() · contrato render preview/export
│   │   ├── claude-path.ts        Portable Claude CLI discovery
│   │   ├── projects.ts           Multi-tenant projects con memory injection
│   │   ├── remotion/             3 templates Storu nativos
│   │   │   ├── TikTokHook.tsx
│   │   │   ├── BeforeAfter.tsx
│   │   │   ├── ViralManifesto60s.tsx
│   │   │   └── styles/           5 templates visuales nuevos
│   │   │       ├── GlitchIntro.tsx
│   │   │       ├── StatDrop.tsx
│   │   │       ├── SplitScreen.tsx
│   │   │       ├── Typewriter.tsx
│   │   │       └── PosterSlam.tsx
│   │   └── export-slides.ts      Puppeteer PNG export
│   │
│   ├── epm/                      Editor Pro Max absorbido (25 comp + 9 templates)
│   └── remotion/Root.tsx         Registra las 12 compositions
│
├── data/
│   ├── projects/
│   │   └── [slug]/
│   │       ├── content-sets.json
│   │       ├── carousels.json
│   │       ├── stories.json
│   │       ├── reels.json
│   │       └── memory/brand-context.md  ← se inyecta en prompts AI
│
├── docs/
│   ├── sets-blueprint.ts         Spec detallado de 51 sets (fuente de verdad)
│   └── arquitectura-y-roadmap.md Este documento
│
└── scripts/
    ├── promote-carousels-to-sets.mjs   50 carousels → 50 ContentSets
    ├── apply-blueprint.mjs             Aplica blueprint al DB
    ├── distinct-reel-copy.mjs          Garantiza reels distintos
    ├── diversify-reels.mjs             Rotación de 8 templates
    ├── auto-schedule-sets.mjs          Distribuye fechas en calendario
    ├── complete-sets.mjs               Fix imágenes + marca ready
    └── create-d51.mjs                  Ejemplo end-to-end desde cero
```

### Flujo de datos

```
Usuario ──▶ Next.js page ──▶ /api/... ──▶ data.ts (mutex) ──▶ /data/[slug]/*.json
                                                    │
                                                    ▼
                                             getProjectContext()
                                                    │
                                                    ▼
                              Claude CLI subprocess (spawn) con system prompt
                                                    │
                                                    ▼
                                       stream-json SSE back to UI
```

### Por qué JSON local y no DB
- Zero-setup: `git clone` + `npm install` + `npm run dev` y arranca
- Portabilidad total: copiás la carpeta `/data/` y tenés todo
- Multi-proyecto por filesystem (`/data/projects/storu-colombia-gtm/…`)
- Async-mutex evita race conditions en writes concurrentes
- Escalará a Supabase/Postgres cuando haya un segundo usuario real

---

## 3. Capacidades actuales · qué PODEMOS producir hoy

### Formatos editables end-to-end

| Formato | Editor | Preview | Export | Estado |
|---|---|---|---|---|
| **Carrusel** 4:5 | `/carousel/[id]` HTML editor + chat Claude + DnD slides | iframe sandbox | PNG via Puppeteer | ✅ Full |
| **Historia** 9:16 | `/set/[id]` tab inline | React preview | JSON + txt | ✅ Full |
| **Reel** 9:16 | `/set/[id]` tab inline (8 templates) | Remotion Player vivo | MP4 via Remotion renderer | ✅ Full |
| **Post** 1:1 | — | — | — | ⏳ Pendiente |
| **Blog** | — | — | — | ⏳ Pendiente |

### Set completo (3 piezas + meta)
- Thread narrativo con framework + justificación
- 5 captions variaciones (distintas frases)
- 10 hashtags (ciudad + nicho + brand)
- experimentPurpose + hypothesis + 5 KPIs con targets
- sceneDetails con locación + mood + props
- 3 referencias visuales (hero 4:5, square 1:1, story 9:16)
- ctaKeyword propia por set
- publishDate agendada
- status por pieza (pending/draft/ready/published)

### Generación bulk via Claude CLI
- `/generate` chat con prompt + count (1-30)
- SSE streaming con progreso set-by-set
- 5 presets por nicho (restaurantes, retail, spa, manifesto, launch)
- Cada set persiste inmediatamente al DB + crea carrusel vacío enlazado

### Export completo a ZIP
- Un click en `/set/[id]` → ZIP con todo listo para publicar
- PNGs del carrusel + MP4 del reel + JSON historia + captions.txt + README

### Multi-proyecto
- Switcher de proyectos en TopBar
- Memory injection por proyecto (brand colors, voice, anchor brands)
- Isolation total: cada proyecto tiene su `/data/projects/[slug]/`

---

## 4. Limitaciones actuales · lo honesto

### Imágenes
| Capacidad | Estado |
|---|---|
| Stock photos Unsplash (URLs curadas) | ✅ |
| Stock Pexels/Pixabay API | ❌ No integrado |
| Generación con DALL-E / Gemini / Ideogram | ❌ No integrado |
| Subida manual de usuario | ✅ `/api/upload` |
| Remoción de fondo | ❌ (EPM tiene `@imgly/background-removal-node` pero no usado) |
| Edición intra-slide | ❌ Las imágenes se referencian por URL, no se componen |

### Video (Reels)
| Capacidad | Estado |
|---|---|
| 8 templates Remotion con efectos | ✅ (TikTokHook, GlitchIntro, StatDrop, SplitScreen, Typewriter, PosterSlam, BeforeAfter, ViralManifesto60s) |
| bgImage como fondo animado | ✅ |
| Animaciones por composition (spring, interpolate) | ✅ |
| Voice-over AI (ElevenLabs, OpenAI TTS) | ❌ |
| Captions auto-generados estilo CapCut/TikTok | ❌ |
| Música de fondo con sincronización | ❌ |
| UGC talking-head con video real de presenter | ❌ |
| B-roll inserts PIP | ❌ (diseñado pero no implementado) |
| Transiciones entre sets | ❌ |
| Export con marca de agua | ❌ |

### Narrativa / estrategia
| Capacidad | Estado |
|---|---|
| 10 frameworks de comunicación (AIDA, PAS, BAB, etc.) | ✅ Mapeados y usados |
| 8 goals comerciales (capture, valley, ticket, recompra, launch, validate, cashflow, autority) | ✅ |
| Thread coherente entre 3 piezas | ✅ |
| A/B testing automático de variantes | ❌ |
| Analytics de performance por set | ❌ (dashboard mock, sin tracking real) |
| Aprendizaje de qué funcionó → retro-alimenta siguientes sets | ❌ |

### Consumidor / mercado
| Capacidad | Estado |
|---|---|
| Memory injection de brand context en cada prompt | ✅ |
| 8 ciudades colombianas con vibe específico | ✅ |
| Voice adaptation Colombia (tuteo, modismos) | ✅ (manual en prompts) |
| Buyer persona deep analysis | ❌ |
| Competitive landscape scraping | ❌ |
| Detección de tendencia (trending audio, hashtags del momento) | ❌ |

### Editorial
| Capacidad | Estado |
|---|---|
| Chat AI para iterar carrusel | ✅ `/api/chat` SSE streaming |
| Chat AI para iterar reel | ❌ Editor es form-based |
| Chat AI para iterar historia | ❌ Editor es form-based |
| Undo/redo historial | ✅ Solo carrusel |
| Colaboración multi-usuario | ❌ |

### Integraciones
| Capacidad | Estado |
|---|---|
| Publicación automática a Instagram/Meta | ❌ Export manual solamente |
| Auto-DM real (ManyChat/wA) | ❌ Config manual fuera de la app |
| WhatsApp Business API | ❌ |
| Google Drive/Dropbox sync | ❌ |
| CRM (HubSpot/Pipedrive) | ❌ |

---

## 5. Cómo mejorar · desde foto + contexto detallado → piezas

Hoy el flujo es "idea texto → AI genera brief → editor manual". La visión siguiente es:

### V2 · Input enriquecido

```
Foto del local real + contexto detallado → AI produce set altamente personalizado
```

**Qué cambiar:**

1. **Upload de foto en `/generate`**
   - El usuario sube 1-5 fotos del local, producto, equipo
   - El backend las analiza con Claude 4 Vision (multimodal)
   - Extrae: paleta real, tipografía observada, vibe, props disponibles
   - Las usa como referencias en los slides del carrusel + bgImage del reel

2. **Contexto estructurado**
   ```
   {
     rubro: "cafetería especialidad",
     ubicación: "Chapinero, Bogotá",
     horario-pico: "8-11am y 3-5pm",
     cliente-ideal: "profesionales 28-42 años, $5-8M/mes",
     competencia-directa: "3 cafés en 4 cuadras",
     dolor-actual: "martes y miércoles vacíos, margen quemado por 2x1",
     fortaleza: "barista ganó tercer puesto torneo nacional 2025",
     evidencia-disponible: "fotos producto, testimonios clientes, ticket diario"
   }
   ```
   Esto alimenta un prompt mucho más rico que produce captions, hooks y hashtags altamente específicos.

3. **Reference gallery**
   - Usuario sube 5-10 referencias visuales (screenshots de cuentas que le gustan)
   - Claude Vision las describe: "minimalista tipográfico amarillo/negro, mucho blanco, tipografía serif headline"
   - Esa descripción entra al prompt del editor de slides

### V2 · Output mejorado

- **Imagen hero generada**: cada set genera una imagen hero coherente usando DALL-E 3 / Ideogram / Gemini 2.5 Flash Image con el contexto
- **Voice-over del reel**: audio TTS con voz colombiana (ElevenLabs) con el guión del reel
- **Captions en el video**: burned-in con ritmo tipo CapCut/TikTok
- **Thumbnails del reel**: frame específico seleccionado como portada

---

## 6. Cómo hoy se crea un reel desde cero

### Pipeline actual

```
1. Usuario abre /set/[id] · tab Reel
2. Elige template de 8: TikTokHook · GlitchIntro · StatDrop ·
   SplitScreen · Typewriter · PosterSlam · BeforeAfter · ViralManifesto60s
3. Escribe hook / body / cta (pre-llenados desde el set)
4. Setea colores (accent / bg / text)
5. Opcional: URL de imagen de fondo (Unsplash, picsum, upload)
6. Click "Guardar" → persiste props en /api/reels
7. Click "Render MP4"
   → POST /api/render
   → Remotion bundle cache (1ra vez 15-30s, despues instant)
   → selectComposition(template, inputProps)
   → renderMedia() con codec h264
   → MP4 a /public/renders/[filename].mp4
   → URL de descarga
```

### Templates Remotion por dentro

Cada template es un componente React con:
- `AbsoluteFill` fondo
- `useCurrentFrame()` + `useVideoConfig()` para timing
- `spring()` / `interpolate()` para animaciones
- Opcional `<Img src={bgImage}>` con filtros CSS
- Composición de timeline por `Sequence` o condicionales por frame

Ejemplo · `StatDrop.tsx`:
```tsx
const statScale = spring({ frame, fps, from: 0.1, to: 1 });
const bodyT = spring({ frame: frame - fps * 2.5, fps });
// 0-2.5s: stat grande entrando
// 2.5-6s: stat + body subtitle
// 6-10s: stat + CTA pill
```

### Limitaciones del render actual
- No soporta video input (solo imágenes estáticas como bg)
- No soporta audio (música/voice-over)
- Renders son server-side pesados (~5-30s por MP4 de 10s)
- No paralelización multi-reel
- No hay preview durante render (se espera al final)

---

## 7. Narrativa visual coherente · cómo se construye

### Por set, hoy:

1. **Framework** (1 de 10) se asigna al arquetipo (Provocación → Pattern-Interrupt, Case study → Hook-Story-Offer, etc.)
2. **Thread** se escribe: "Historia teasea con [dynamic] → Carrusel profundiza con [archetype] → Reel cierra con [template]. Mismo hook: '[hook]'."
3. **Historia** usa dinámica apropiada al framework (poll para binary, quiz para multi-opción, qa para open loop, countdown para launch)
4. **Carrusel** sigue 5 slides estructurados: Hook / Problema / Reframe / Proof / CTA
5. **Reel** tiene guión propio: Hook punzante ≠ carrusel slide 1 + Body con ángulo nuevo + CTA con keyword

### Coherencia visual

- **Paleta** Storu unificada (ink `#0E0D12`, yellow `#F8C644`, violet `#5635FD`)
- **CTA-keyword** idéntica en las 3 piezas
- **bgImage** del reel y hero del set son misma foto (crop distinto por aspect)
- **Referencias** (3 por set, tipos: hero / square / story) alimentan los editores

### Qué falta para coherencia real

- Los slides del carrusel aún son HTML crudo · no imagen generada con Figma/Canva real
- El reel no muestra la imagen del carrusel ni viceversa
- La historia es abstracta (polls sin visual rico)

---

## 8. Estrategia comercial intrínseca · cómo se diseña

Cada set es un **experimento** con:

### Framework de decisión (8 goals → 13 archetypes → 10 frameworks)

```
Goal (qué querés)                 Archetype (formato)          Framework (cómo convence)
─────────────────                 ─────────────────            ────────────────────────
capture   (nuevos clientes)       case-study, data-drop        Hook-Story-Offer, 4P
valley    (horas valle)           case-study, step-by-step     Hook-Story-Offer, BAB
ticket    (ticket promedio)       framework, case-study        SB7, FAB
recompra  (clientes existentes)   before-after, framework      BAB, SB7
launch    (lanzamiento nuevo)     launch, countdown            AIDA, 4P
validate  (testear idea)          vs, contrarian               Contrast, PAS
cashflow  (flujo de caja)         case-study, launch           Hook-Story-Offer
autority  (posicionar)            provocación, manifesto       Pattern-Interrupt
```

### KPIs medibles por set (72h timebox)

- DMs con keyword / 72h (target: >30)
- Save rate del carrusel (target: >8%)
- Complete rate del reel (target: >60%)
- Reach share vs followers (target: >1.5×)
- Respuestas en historia (target: >15%)

Hoy esto está **en el brief como meta**, no conectado a métricas reales.

### Entendimiento del consumidor

- Memory file `brand-context.md` se inyecta en cada prompt AI
- Contiene: voice Storu, brand colors, 20 anchor brands colombianas, calendario colombiano (Día de la Madre, Carnaval, Día del Padre, julio Q3, octubre Halloween, Black Friday, diciembre gifting)
- Las 8 ciudades tienen "vibe" asociado para ajustar el tono
- No hay buyer persona deep · hay perfiles implícitos en los 8 goals

---

## 9. Plan multi-agente · laboratorio mágico

### Arquitectura propuesta

```
┌─────────────────────────────────────────────────────────────┐
│  ORQUESTADOR (Claude Sonnet)                                │
│  Recibe: foto + contexto estructurado + idea libre          │
│  Output: Plan JSON con tareas paralelas                     │
└─────────────────────────────────────────────────────────────┘
                               │
        ┌──────────┬──────────┴──────────┬──────────┐
        ▼          ▼                     ▼          ▼
┌──────────┐ ┌──────────┐         ┌──────────┐ ┌──────────┐
│ AGENTE   │ │ AGENTE   │         │ AGENTE   │ │ AGENTE   │
│ BRIEF    │ │ VISUAL   │         │ COPY     │ │ STRATEGY │
├──────────┤ ├──────────┤         ├──────────┤ ├──────────┤
│ Framework│ │ Análisis │         │ 5 captions│ │ KPIs     │
│ Thread   │ │ foto     │         │ Hook reel │ │ Hipótesis│
│ Goal     │ │ Paleta   │         │ Historia  │ │ Timebox  │
│ Archetype│ │ Ref img  │         │ CTAs      │ │ Goal mix │
└──────────┘ └──────────┘         └──────────┘ └──────────┘
        │          │                     │          │
        └──────────┴──────────┬──────────┴──────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENTE EDITORIAL (por pieza)                               │
├────────────────────┬───────────────────┬────────────────────┤
│ SLIDE AGENT        │ STORY AGENT       │ REEL AGENT         │
│ 5 slides HTML      │ Text + options    │ Template + props   │
│ Puppeteer PNG      │ Preview 9:16      │ Remotion MP4       │
└────────────────────┴───────────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENTE QA (valida coherencia)                              │
│  - Hook reel ≠ carrusel slide 1                             │
│  - CTA keyword consistente                                  │
│  - Paleta respeta brand                                     │
│  - Framework aplicado correctamente                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ENSAMBLADO FINAL + editor humano                           │
│  Set aparece en dashboard · editable pieza por pieza        │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologías base

- **Orchestrator:** Claude Agent SDK con `@anthropic-ai/sdk` v0.x — permite spawning paralelo de agentes con herramientas específicas.
- **Agentes especialistas:** cada uno con system prompt distinto + toolset específico (ej: Visual Agent tiene acceso a file reads de uploads, Copy Agent tiene acceso a memory brand-context, Reel Agent puede invocar Remotion renderer).
- **Sincronización:** queue interna con estado compartido (JSON en `/data/jobs/[jobId]/state.json`).
- **UI:** la existente `/generate` pero con vista tipo kanban mostrando el progreso de cada agente por set.

### Multi-agente para bulk

Para generar **10 sets en paralelo con calidad alta**:

1. Orchestrator divide el pedido en 10 jobs independientes
2. Spawnea 10 instancias de agentes especialistas en paralelo (limitado por rate limit Claude)
3. Cada job corre su pipeline: Brief → Visual → Copy → Strategy → Editorial (Slide+Story+Reel) → QA
4. UI muestra progress bar por job + cards mientras se completan
5. Al final: 10 sets ready-to-publish, cada uno editable individualmente

### Costos y tiempos estimados

Por set de alta calidad:
- **AI tokens:** ~30-50K input + ~10-20K output por set = ~$0.15-0.30 USD
- **Render MP4 10s:** ~15-30s en CPU local M1/M2
- **Render PNGs 5 slides:** ~5-10s (Puppeteer)
- **Total tiempo por set:** 90-180 segundos
- **Paralelizado 10 sets:** ~3-5 minutos (bounded por rate limit Claude)

---

## 10. Roadmap sugerido (orden de prioridad)

### Fase 1 · Foundation (done)
- ✅ Arquitectura sets-first
- ✅ 51 sets con blueprint detallado
- ✅ Editor unificado `/set/[id]`
- ✅ Calendario + scheduling
- ✅ Export ZIP end-to-end
- ✅ 8 templates Remotion + paletas
- ✅ Bulk AI `/generate`

### Fase 2 · Input enriquecido (next)
- 🔲 Upload multi-foto en CreateHubDialog
- 🔲 Claude Vision analiza fotos → paleta + props extraídos
- 🔲 Contexto estructurado (formulario guiado)
- 🔲 Reference gallery para estilo visual

### Fase 3 · Imagen generativa
- 🔲 Integrar Gemini 2.5 Flash Image (free tier generoso)
- 🔲 Hero image generada por set coherente con brand
- 🔲 Imágenes para slides del carrusel específicas al contenido
- 🔲 bgImage del reel generado, no Unsplash

### Fase 4 · Audio + video rico
- 🔲 TTS voice-over colombiano (ElevenLabs v2)
- 🔲 Música de fondo (royalty-free con sync)
- 🔲 Captions burned-in estilo CapCut
- 🔲 B-roll PIP para reels UGC
- 🔲 Talking-head con video real del usuario

### Fase 5 · Multi-agente orquestado
- 🔲 Agent SDK para paralelización
- 🔲 UI kanban de progreso multi-set
- 🔲 QA agent automático
- 🔲 Retry + fallback por agente

### Fase 6 · Integraciones reales
- 🔲 Publicación directa Meta Graph API
- 🔲 ManyChat auto-DM real
- 🔲 Analytics IG via API + feedback loop
- 🔲 A/B testing automático

### Fase 7 · Nuevos formatos
- 🔲 Post cuadrado 1:1 (editor)
- 🔲 Blog post (texto largo + hero image + social snippets)
- 🔲 Newsletter email HTML
- 🔲 LinkedIn post adaptado
- 🔲 TikTok con música trending

---

## TL;DR · una página

**Qué es Storu hoy:** una app local (Next.js) que te deja generar y editar **sets completos de contenido IG** (Historia + Carrusel + Reel coherentes) a partir de una idea, con un framework de comunicación asignado, captions colombianos, hashtags, KPIs medibles y calendario. Podés exportar cada set como ZIP listo para publicar.

**Cómo está hecho:** Next.js 16 + React 19 + Tailwind v4 (UI); Remotion (reels); Puppeteer (PNG); Claude CLI como subproceso (AI); JSON files con async-mutex (storage). 51 sets de ejemplo ya blueprinted, cada uno con framework, guión por pieza y rationale.

**Qué puede hoy:** generar briefs con AI, editar las 3 piezas inline, renderizar MP4, exportar ZIP, agendar fechas, bulk-generate N sets.

**Qué no puede hoy:** generar imágenes (solo stock curado), audio/voice-over, UGC real, publicación automática, analytics reales, multi-agente paralelo.

**Próximo salto:** input multimodal (foto + contexto) → agente orquestador reparte trabajo a especialistas (brief, visual, copy, strategy, editorial, QA) → 10 sets de calidad en 3-5 min, cada uno editable pieza por pieza, listo para publicar sin salir de la app.
