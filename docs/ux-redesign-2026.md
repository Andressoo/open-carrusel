# Storu Studio · UX Redesign 2026

Documento de referencia para el rediseño completo del producto basado en el skill `content-creator`. Decide cómo se navega, cómo se ve, cómo se habla y cómo se opera.

---

## 1. Benchmark · qué le robamos a quién

| Producto | Patrón que vale la pena | Aplicación a Storu |
|---|---|---|
| **Linear** | Cmd+K palette + atajos en todo · velocidad keyboard-first | Cmd+K universal (crear set, navegar, search assets, export) |
| **Figma** | 3-pane workspace (sidebar · canvas · inspector) · libraries compartidas | `/set/[id]` con sidebar piezas + canvas preview + inspector props |
| **Notion** | Block-based + slash command + workspace switcher | Brief intake como chat blocks · `/` para insertar elementos |
| **Vercel / v0** | Chat AI a la izquierda · preview vivo a la derecha · "deploy" un click | Brief → preview vivo del set mientras el agente trabaja |
| **CapCut** | Timeline abajo · preview centro · asset library lateral | Slides como filmstrip horizontal · reel timeline en `/set/[id]` Reel tab |
| **Canva** | Templates como entry point · "magic resize" · search por estilo | `/templates` con catálogo · "magic resize" para adaptar a 1:1 / 4:5 / 9:16 |
| **Cursor** | Diff inline · accept/reject AI changes · history | Versiones del set con diff cuando AI itera |
| **Stripe Dashboard** | Side nav fijo · breadcrumbs · "test mode" toggle | Sidebar fijo · environment toggle (test/live para API pública) |
| **Descript** | "Compose" mode unifica audio/video/text · transcripción editable | Brief crea set unificado · cualquier campo editable inline |
| **Arc Browser** | Spaces (proyectos) · tabs efímeros · command bar | Project switcher en topbar · briefs efímeros · cmd+k bar |

### 3 patrones non-negociables a adoptar

1. **Brief antes que pixel.** El comercio nunca empieza eligiendo un template · empieza describiendo el problema. La UI conduce a eso.
2. **Cmd+K es la API humana.** Cualquier acción del producto debe ser invocable desde el comando. Velocidad gana.
3. **3-pane workspace para edición seria.** Cuando estás dentro de un set, querés ver lista + preview + inspector simultáneo, no tabs.

---

## 2. Nueva Information Architecture

```
                          ┌───────────────────┐
                          │   TopBar fijo     │
                          │ logo · proj · cmd+k · profile │
                          └───────────────────┘
                                   │
   ┌───────────────────────────────┴────────────────────────────────┐
   ▼                                                                ▼
┌────────────┐                                              ┌────────────┐
│  Sidebar   │                                              │ Inspector  │
│  (left)    │                Canvas                        │  (right)   │
│            │              (center)                        │            │
│  Sets      │                                              │  Props     │
│  Briefs    │   /  (workspace home)                        │  Brand     │
│  Assets    │   /set/[id]                                  │  AI suggs  │
│  Brand     │   /brief/new                                 │  Export    │
│  Calend.   │   /assets                                    │            │
│  Renders   │   /brand                                     │            │
│  Settings  │   /calendar                                  │            │
│            │                                              │            │
└────────────┘                                              └────────────┘
                                   │
                          ┌───────────────────┐
                          │ Bottom dock        │
                          │ filmstrip / timeline│
                          └───────────────────┘
```

### Routes consolidadas

| Ruta | Qué es | Reemplaza |
|---|---|---|
| `/` | Workspace home · sets recientes + brief input + cmd+k hint | `/` actual + create dialog |
| `/brief/new` | Brief intake conversacional (agente) | `/agent` + `/generate` |
| `/set/[id]` | Editor 3-pane unificado (overview / story / carrusel / reel) | `/set/[id]` actual |
| `/assets` | Library: uploads · generadas · Unsplash favs · video stock | nada (nuevo) |
| `/brand` | Brand tokens (colors · fonts · voice · ciudades) | parte de project memory |
| `/calendar` | Vista mes/semana de publicaciones agendadas | `/calendar` actual |
| `/renders` | Historial de exports MP4/PNG/ZIP con re-download | parte de Studio |
| `/templates` | Catálogo de templates (carousel + reel + story) | `/studio` actual |
| `/api-keys` | Admin de keys del marketplace (solo owner) | nada (nuevo) |

### Routes eliminadas / fusionadas

- `/agent` + `/generate` → fusionados en `/brief/new` (mismo flow, modos different speed)
- `/studio` → renombrado a `/templates`
- `/reels/new`, `/stories/`, etc. → fusionados dentro de `/set/[id]` tabs

---

## 3. Lenguaje · cómo hablamos

### Términos del dominio

| Término viejo | Término nuevo | Razón |
|---|---|---|
| "Carrusel" | **Set** (cuando contiene 3 piezas) o **Carrusel** (cuando es solo eso) | Diferenciar paquete de pieza |
| "ContentSet" | **Set** | Más corto, mismo concepto |
| "Story / Carrusel / Reel" | **Pieza** (genérico) o nombre específico | "Pieza" para acciones genéricas |
| "Idea" | **Brief** | Más operacional, alineado con skill |
| "Generate" | **Crear set** | Acción clara |
| "Template" | **Estilo** (en reel) o **Plantilla** (en carrusel) | Distinguir motion vs layout |
| "Render" | **Export** | Universal · usuarios entienden |
| "Project" | **Espacio** (workspace) | Más natural, menos engineering-speak |
| "API key" | **Token de marketplace** | Contexto del usuario |
| "Memory" | **Contexto de marca** | Más intuitivo |

### Voz

- **Colombiana directa** · voseo opcional, "vos" preferido para tono cercano · "comentá" en CTAs
- **Operacional** · sin metáforas · "Crear set", "Exportar MP4", "Agendar publicación"
- **Honesta** · si algo falta, decir "todavía no", no "próximamente"
- **Cero emojis** en chrome del producto · sí en CTAs cuando aporta (📍 ubicación, 💡 tip)

### Microcopy patterns

```
Acción primaria:    Verbo + objeto · "Crear set", "Exportar reel"
Acción secundaria:  Verbo solo · "Cancelar", "Volver", "Editar"
Estado vacío:       "Todavía no hay [X]" + CTA acción
Loading:            "[Verbo]ndo..." (Generando, Renderizando, Exportando)
Éxito:              ✓ + acción pasada · "✓ Set creado"
Error:              "No se pudo [acción]" + razón breve + acción de recovery
Tooltip:            5 palabras max · "Atajo: Cmd+K"
```

---

## 4. Componentes visuales · sistema de diseño

### Tokens

```typescript
// src/lib/design-tokens.ts
export const TOKENS = {
  // Colores · 3 niveles de oscuridad para depth
  bg: {
    canvas: "var(--background)",      // fondo más oscuro
    panel: "var(--surface)",          // sidebars, cards
    raised: "var(--surface-2)",       // overlays, modals
  },
  // Acentos
  accent: {
    primary: "#F8C644",   // Storu yellow
    secondary: "#5635FD", // Storu violet
    success: "#10B981",
    warning: "#F59E0B",
    danger:  "#EF4444",
  },
  // Texto
  fg: {
    high: "var(--foreground)",
    med: "var(--muted-foreground)",
    low: "var(--muted-foreground-2)",
  },
  // Bordes
  border: {
    subtle: "var(--border)",
    strong: "var(--border-strong)",
    accent: "var(--accent)",
  },
  // Spacing · escala 4
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48 },
  // Radius
  radius: { sm: 6, md: 10, lg: 14, full: 9999 },
  // Typography
  font: {
    sans: "Inter, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
    display: "Inter Display, Inter, sans-serif",
  },
  // Sizes
  text: {
    xs: 11, sm: 13, base: 14, md: 15, lg: 18, xl: 22, "2xl": 28, "3xl": 36,
  },
  // Animation
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  duration: { fast: "120ms", base: "200ms", slow: "320ms" },
};
```

### Componentes clave (nuevos / refactorizados)

- `<WorkspaceShell>` — layout 3-pane con sidebar + canvas + inspector
- `<CommandPalette>` — cmd+k overlay, fuzzy search, acciones globales
- `<TopBar>` — minimal: logo · proj switcher · cmd+k pill · avatar
- `<BriefInput>` — textarea + presets + AI suggest, replace de "create dialog"
- `<SetCard>` — preview compacto + status pieces + quick actions
- `<PieceTab>` — segmented control entre Story/Carousel/Reel adentro de un set
- `<Inspector>` — panel lateral con properties contextual a la pieza activa
- `<Filmstrip>` — slides del carrusel como thumbnails horizontales
- `<EmptyState>` — icono grande + mensaje + CTA · pattern reusable
- `<DiffView>` — antes/después cuando AI propone cambio · accept/reject

---

## 5. Flow principal · idea a publicación

### Antes (fragmentado)

```
/ → Click Crear → Dialog 3 steps → /carousel/[id] o /set/[id]
                                          ↓
                       Editor diferente por tipo de pieza
                                          ↓
                       Tab /reels para ver reels separados
                                          ↓
                       Tab /stories para historias
                                          ↓
                       /calendar para agendar
                                          ↓
                       Click export por pieza individualmente
```

### Después (unificado)

```
/ → BriefInput prominente · escribís idea o cmd+k "/brief"
       ↓
   Agente AI corre tools (visible en panel) → set creado en 60s
       ↓
   /set/[id] · 3-pane workspace
   ┌─────────────┬───────────────────┬─────────────┐
   │ Pieces      │  Preview vivo     │ Inspector   │
   │             │                    │             │
   │ Historia ✓  │  [Reel preview]   │ Hook        │
   │ Carrusel ✓  │  con Player       │ Body        │
   │ Reel ✓      │  controls         │ CTA         │
   │             │                    │ Color       │
   │ Acciones:   │  Filmstrip        │ Image       │
   │ Agendar     │  abajo            │             │
   │ Export ZIP  │                    │ AI suggest  │
   └─────────────┴───────────────────┴─────────────┘
```

### Estados de un set

```
draft → ready → scheduled → published → archived
  │       │         │           │
  AI      Marc.    Fecha      IG OK
  init    todo     set        manual
          ready    next D-1
```

Cada transición tiene un trigger visible en `/set/[id]` · no escondido.

---

## 6. Cmd+K palette · catálogo de comandos

Acciones que van al palette (todas accesibles via search):

```
CREAR
  Nuevo set desde idea           ⏎
  Nuevo set manual                ⌘N
  Nuevo brief                     B
  Subir asset                     U

NAVEGAR
  Ir a Sets                       G S
  Ir a Brand                      G B
  Ir a Calendario                 G C
  Ir a Templates                  G T
  Volver atrás                    Esc

EDITAR (cuando hay set abierto)
  Cambiar a Historia              1
  Cambiar a Carrusel              2
  Cambiar a Reel                  3
  Marcar pieza como ready         R
  Agendar fecha                   A
  Renderizar MP4                  ⌘R
  Exportar ZIP                    ⌘E

AI
  Pedir variante de hook          V H
  Pedir variante de CTA           V C
  Generar imagen hero             G I
  Re-render con otro estilo       S

PROYECTO
  Cambiar de espacio              ⌘⇧P
  Settings                        ⌘,
  Logout                          ⌘Q
```

---

## 7. Onboarding · primer uso

3 pasos obligatorios para un comercio nuevo:

1. **Crear espacio** · nombre + ciudad + rubro
2. **Brand básico** · 3 colores + logo (opcional) + voz (1 frase)
3. **Primer brief** · texto de la primera idea (incluso una palabra)

Después de paso 3, el agente corre y produce el primer set en vivo · usuario ve el flow completo en su primer minuto.

---

## 8. Stripe + monetización integrada

Layer encima del producto:

| Plan | Precio | Quota | Features |
|---|---|---|---|
| **Free** | $0 | 3 sets/mes · 0 renders MP4 | Editor + export PNG |
| **Solo** | $19/mes | 30 sets/mes · 30 renders MP4 | Todo + agendar + brand |
| **Marketplace** | $49/mes/merchant | 300 sets/mes · sin límite render | API pública + multi-tenant |
| **Custom** | a medida | sin límite | + SLA + webhooks + branding white-label |

Onboarding incluye selección de plan · si Free, gating en quota visible (no truco). Stripe checkout integrado vía MCP.

---

## 9. Anti-patrones que NO repetimos

- ✗ Diálogo modal para crear cosas (Linear no usa modales · panel inline o nueva ruta)
- ✗ Mostrar "ContentSet" como término · usar **Set**
- ✗ Tabs en topbar para cambiar entre Stories/Reels/Carousels (todo dentro de Set ahora)
- ✗ Botón "Generar" sin context · siempre adjacent a brief input
- ✗ Esconder estado de loading detrás de un spinner genérico · usar status text + tool calls visibles
- ✗ Forzar al usuario a inventar nombres de set · AI sugiere, usuario edita inline
- ✗ Confirmar antes de cada acción · trust the user, undo a 3s

---

## 10. Roadmap del rediseño · qué hacemos primero

### Phase 1 · IA + foundation (2 semanas)
- [x] UX research doc (este)
- [ ] `src/lib/design-tokens.ts` con todo centralizado
- [ ] `<WorkspaceShell>` 3-pane component
- [ ] `<CommandPalette>` cmd+k functional
- [ ] Nueva home `/` con BriefInput hero
- [ ] Refactor `/set/[id]` a 3-pane

### Phase 2 · Copy + microcopy (3 días)
- [ ] Strings file `src/lib/copy.ts` centralizado
- [ ] Reemplazar todos los textos hardcoded
- [ ] Empty states reutilizables
- [ ] Loading states con texto contextual

### Phase 3 · Brief intake unificado (1 semana)
- [ ] Fusionar `/agent` + `/generate` → `/brief/new`
- [ ] Modos: rápido (1 set) / batch (N sets) / multimodal (foto+contexto)
- [ ] Tool calls visibles + accept/reject inline

### Phase 4 · Asset library (1 semana)
- [ ] Upload bulk drag-drop
- [ ] Library tab en sidebar
- [ ] Drag from library to canvas
- [ ] Search semántico (cuando haya gen images)

### Phase 5 · Onboarding + Stripe (1 semana)
- [ ] First-run wizard 3 pasos
- [ ] Stripe products + checkout
- [ ] Quota gating en backend
- [ ] Pricing page público

### Phase 6 · Pulido + perf (continuo)
- [ ] Skeleton screens en cada loading
- [ ] Optimistic updates en mutaciones
- [ ] Cmd+K analytics (qué buscan)
- [ ] A11y audit completo
