# Storu Studio · Hub Architecture

Unified creative workspace para manejar **carruseles** (Open Carrusel) + **videos** (Editor Pro Max) en **múltiples proyectos/marcas** desde un solo hub.

---

## 1 · Estado actual · qué tenemos

### Open Carrusel (monolito single-project)
- **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4
- **Storage:** 5 JSON files en `/data/` (brand, carousels, templates, style-presets, staged-actions) · async-mutex
- **AI:** Claude CLI subprocess + SSE streaming (`/api/chat`)
- **Export:** Puppeteer PNG + ZIP
- **Limitación clave:** **UN solo `brand.json`**, UN pool de carruseles. No soporta múltiples clientes/proyectos.

### Editor Pro Max (CLI-first video)
- **Stack:** Remotion 4 · React 19 · TypeScript · Zod
- **UI:** Remotion Studio (dev server propio `remotion studio`)
- **25 components · 10 templates · 7 AI skills · 5 pipeline scripts**
- **Storage:** assets en `public/assets/`, composiciones en `src/compositions/`
- **Limitación clave:** **no tiene DB ni UI de proyectos** — cada video es una composición de código, no un registro editable.

### El gap
- Ambos viven en repos/carpetas separadas
- Brand config duplicado · no se comparte entre apps
- Assets (imágenes, fuentes, logos) cada uno por su lado
- Sin nav unificada · cada app tiene su propio dev server
- Cero noción de "proyecto" o "cliente" que agrupe carruseles + videos

---

## 2 · Visión del hub · Storu Studio

Un workspace donde **una marca** (ej: Bonusprize, cliente agencia X, Alik Swimwear) tiene todo en un lugar:

```
Storu Studio
└── Workspace (org o cuenta)
    ├── Proyecto A · Bonusprize
    │   ├── 🎨 Brand (colors, fonts, logos, voice, style presets)
    │   ├── 🖼️ Assets library (compartida entre carruseles y videos)
    │   ├── 📇 Carruseles (50 piezas GTM)
    │   ├── 🎬 Videos (reels, anuncios, tutoriales)
    │   ├── 💬 Chats / sesiones AI (contexto por proyecto)
    │   └── 📦 Templates propios
    ├── Proyecto B · Cliente agencia
    │   └── (misma estructura)
    └── Library global
        ├── Templates oficiales Storu (VS, 3 Campañas, etc.)
        ├── Componentes EPM (25)
        └── Skills AI compartidos
```

Un usuario entra al hub, elige proyecto, y dentro decide si abre **Carruseles** o **Videos**, con el mismo brand config, los mismos assets, el mismo chat.

---

## 3 · Arquitectura técnica

### 3.1 Monorepo con Turborepo + pnpm workspaces

```
storu-studio/
├── apps/
│   ├── hub/                   # Next.js 16 · shell principal
│   │   ├── src/app/
│   │   │   ├── page.tsx                         # dashboard workspaces
│   │   │   ├── p/[projectId]/page.tsx           # dashboard proyecto
│   │   │   ├── p/[projectId]/carousel/[id]/
│   │   │   ├── p/[projectId]/video/[id]/
│   │   │   └── settings/
│   │   └── src/components/nav/SidebarShell.tsx
│   ├── carousel/              # Open Carrusel (como módulo)
│   │   └── embedded = importable
│   └── video/                 # Editor Pro Max (wrapped)
│       └── remotion-player embeddable
├── packages/
│   ├── shared-db/             # SQLite + Drizzle ORM
│   ├── shared-brand/          # BrandConfig type + hooks
│   ├── shared-assets/         # Upload · storage · CDN
│   ├── shared-ai/             # Claude CLI client + session mgmt
│   └── shared-ui/             # Componentes comunes (Button, Card)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 3.2 Migración storage · JSON → SQLite

JSON está bien para un usuario/proyecto, pero multi-project + multi-user necesita relacional.

**Schema mínimo (Drizzle):**

```ts
// packages/shared-db/schema.ts
workspaces (id, name, ownerUserId, createdAt)
projects (id, workspaceId, slug, name, brandConfig json, createdAt)
carousels (id, projectId, name, aspectRatio, slides json, chatSessionId, createdAt)
videos (id, projectId, name, template, compositionProps json, renderedPath, createdAt)
assets (id, projectId, type, path, metadata json, createdAt)
templates (id, scope ['global'|'project'], projectId?, name, schema json)
chat_sessions (id, projectId, module ['carousel'|'video'], messages json)
```

Migración automática: script que lee los 5 JSON actuales y los mete en la DB como un proyecto "Default" del workspace del usuario.

### 3.3 UI shell

**Sidebar persistente:**

```
┌─ Storu Studio ────────────────┐
│ [workspace dropdown]          │
│                               │
│ 📁 Proyectos                  │
│   ├─ Bonusprize ● 50 car / 12 v│
│   ├─ Agencia Distrito         │
│   └─ + Nuevo proyecto         │
│                               │
│ 🎨 Biblioteca                 │
│   ├─ Assets globales          │
│   └─ Templates                │
│                               │
│ ⚙️ Settings                   │
└───────────────────────────────┘
```

**Proyecto dashboard:**

```
┌─ Bonusprize ─────────────────────────────────────────┐
│ 🎨 Brand: Ink/Violet/Yellow · Poppins · @bonusprize │
│                                                      │
│ [📇 Nuevo carrusel] [🎬 Nuevo video] [💬 Chat AI]   │
│                                                      │
│ ─ Recientes ───────────────────────────────          │
│ D01 Provocación · carrusel · hace 2h                 │
│ Reel Restaurantes · video · hace 1d                  │
│ D02 Case Punto G · carrusel · hace 1d                │
│                                                      │
│ ─ Stats ──────────────────────────────────          │
│ 50 carruseles · 8 videos · 240 assets · 15h AI chat  │
└──────────────────────────────────────────────────────┘
```

### 3.4 Integración Editor Pro Max en el hub

EPM ahora corre como **Remotion dev server separado**. Dos opciones:

**Opción A · Wrapper con iframe (rápido, fricción media)**
- El módulo `/p/[id]/video` arranca Remotion Studio en background (puerto 3001)
- Se muestra dentro de un iframe con nav del hub encima
- Compartir brand/assets via filesystem simlinks

**Opción B · Embeber `@remotion/player` (pro, fricción alta)**
- Importar `Player` de `@remotion/player` como componente React
- Reescribir las 10 templates EPM como composiciones exportables
- Render via `@remotion/renderer` backend en la API del hub
- Sin dev server separado

**Recomendación:** Opción B. Integración real, no embed hack.

Flujo nuevo:
```
Usuario abre /p/bonusprize/video/new
→ UI muestra picker de templates (TikTok, Reel, etc.)
→ Selecciona "TikTok Hook + CTA"
→ AI chat: "Hook: 'Deja de rebajar'. Duración 15s."
→ Claude genera composition props + texto
→ Preview con <Player/> en vivo
→ Click Render → API dispara @remotion/renderer → MP4 en public/
```

### 3.5 Shared packages · detalle

**`@storu/shared-brand`**
```ts
export type BrandConfig = {
  name: string
  colors: { ink, violet, yellow, bone, ... }
  fonts: { heading, body, mono }
  logos: { primary, mark, reverse }
  voice: { tone, enemies, taglines }
  styleKeywords: string[]
}

export function useBrand(projectId: string): BrandConfig
```

Usado por carrusel y video · mismo brand source of truth.

**`@storu/shared-assets`**
```ts
export type Asset = {
  id, projectId, type: 'image'|'video'|'font'|'audio',
  path, size, metadata: { dimensions, duration, ... }
}
export function uploadAsset(projectId, file): Promise<Asset>
export function listAssets(projectId, filter): Asset[]
```

Un asset subido para un carrusel aparece también en EPM.

**`@storu/shared-ai`**
```ts
export type ChatSession = {
  id, projectId, module: 'carousel'|'video',
  messages: Message[], 
  contextSnapshot: { brand, recentWork, assets }
}
export function openSession(projectId, module): SessionHandle
```

Un chat de carrusel y de video comparten contexto (brand + assets + historial) · no empiezas cero cada vez.

---

## 4 · Features que desbloquea el hub

### Cross-module flows

**Carrusel → Video**
- Export slide como still frame MP4 de 3s
- Carrusel completo como video con transiciones (slide-to-slide con fade)

**Video → Carrusel**
- Extraer frames del video como slides
- Transcripción Whisper del video → copy base de carrusel
- Thumbnail del video como slide 1 de carrusel

### Multi-project

- Dashboard por cliente con stats
- Brand config por proyecto (agencia con N clientes)
- Export por proyecto (carpeta .zip con todos los assets)
- Templates globales (Storu oficial) + templates propios del proyecto

### Shared asset library

- Subir 1 vez, usar en ambos módulos
- Versionado (v1, v2 de un logo)
- Categorización (logos, product photos, team, events)
- Search con embedding AI

### AI con contexto

- Claude CLI con memoria por proyecto
- "Crea un reel basado en el carrusel D02" → accede al carrusel, extrae copy, genera composition EPM
- "Actualiza el brand color" → propaga a todos los carruseles y videos del proyecto

---

## 5 · Roadmap de migración

### Fase 0 · Decisión (hoy)
- Validar nombre (Storu Studio? Bonusprize Studio? Creator Hub?)
- Definir: ¿self-host o SaaS hosted?
- Confirmar stack monorepo (Turborepo + pnpm)

### Fase 1 · Foundation (semana 1-2)
- Setup monorepo
- Migrar Open Carrusel a `apps/carousel/`
- Migrar Editor Pro Max a `apps/video/`
- Crear `packages/shared-*` mínimos (types + hooks)
- SQLite schema + Drizzle + migration de JSONs

### Fase 2 · Hub shell (semana 3)
- App `apps/hub/` con Next.js
- Sidebar + dashboard proyectos
- Routing `/p/[id]/carousel/[id]` + `/p/[id]/video/[id]`
- Auth mínima (local file-based para solo · o Supabase Auth si multi-user)

### Fase 3 · Integración EPM (semana 4-5)
- Opción B: embeber `@remotion/player`
- API `/api/render` con `@remotion/renderer`
- UI de templates en video module
- Chat AI compartido

### Fase 4 · Cross-flows (semana 6+)
- Carrusel→video (export como MP4 animado)
- Shared asset library con search
- AI con contexto multi-módulo

### Fase 5 · Multi-tenant / SaaS (opcional)
- Workspaces compartidos
- Billing
- Deploy en Vercel + Supabase
- CDN assets en Cloudflare R2

---

## 6 · Stack final propuesto

| Capa | Tecnología | Por qué |
|---|---|---|
| Monorepo | Turborepo + pnpm | Cache builds, múltiples apps |
| Framework hub | Next.js 16 (App Router) | Ya lo usa Open Carrusel |
| Framework video | Remotion 4 (como paquete) | Ya lo usa EPM |
| Language | TypeScript 5 | Ambos apps ya |
| DB | SQLite + Drizzle ORM | Local-first, simple, migratable a Postgres |
| Storage | Filesystem (`/public/`) | Local por ahora, CDN después |
| AI | Claude CLI subprocess + SSE | Ya probado en OC |
| Auth | None local · Supabase Auth cloud | Fácil upgrade |
| UI | Tailwind v4 + shadcn/ui | Modern, consistente |
| Deploy | Local-first, Vercel opcional | No fricción para uso propio |

---

## 7 · Nombre sugerido: **Storu Studio**

Coherente con la marca (Storu es el merchant-facing · Studio es donde se crea el contenido).

Alternativas:
- **Creator OS** (si la audiencia es wider que Storu)
- **Odyssey Studio** (referenciando el logo odysser.svg ya en EPM)
- **Hainrixz Hub** (referenciando el GitHub owner ya visible en EPM)

Mi voto: **Storu Studio** o **Odyssey Studio**. Evitá nombres genéricos tipo "Creator OS".

---

## 8 · Decisiones que necesito de vos

1. **Alcance:** ¿solo uso propio (single user local) o SaaS multi-tenant?
2. **Nombre final:** ¿Storu Studio · Odyssey Studio · otro?
3. **Integración EPM:** Opción A (iframe) o B (embed `<Player/>`)?
4. **Migración:** ¿arranco por Fase 1 (monorepo + shared types) o salto a Fase 2 (hub shell)?
5. **Tiempo:** ¿sprint de 2 semanas para Fase 1+2 o trabajo iterativo de meses?

Con esas 5 respuestas armo el plan de ejecución concreto · repo inicial · primeros 3 commits.
