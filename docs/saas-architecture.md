# Storu Studio · SaaS Architecture

Transformación del hub local a producto SaaS multi-tenant unificado y potenciado por capacidades. Documento de referencia para llevar Storu Studio de herramienta interna a plataforma comercial.

---

## 1 · Estado actual (post Fase 3)

✅ Multi-proyecto local con storage por slug
✅ Brand config + memoria AI por proyecto
✅ 3 pilares funcionales: Carruseles · Reels · Historias (stub)
✅ Remotion Player embebido + API render MP4
✅ ProjectSwitcher + navegación unificada
✅ 50 carruseles + 2 reels producidos como proyecto base

**Lo que falta para SaaS:** auth · multi-tenant · billing · team · assets CDN · limits por plan · observability.

---

## 2 · Arquitectura SaaS target

### 2.1 Stack

```
┌─ FRONT ──────────────────────────────────────────┐
│ Next.js 16 (App Router · RSC)                     │
│ Tailwind v4 + shadcn/ui                           │
│ Claude SDK (chat streaming)                       │
│ @remotion/player (preview client-side)            │
└───────────────────────────────────────────────────┘
┌─ BACKEND ────────────────────────────────────────┐
│ Next.js API routes (edge + node)                  │
│ Supabase (auth · postgres · storage · realtime)  │
│ Trigger.dev o Inngest (async jobs · render MP4)   │
│ Cloudflare R2 (assets + renders CDN)              │
│ Stripe (billing + usage-based)                    │
└───────────────────────────────────────────────────┘
┌─ INFRA ──────────────────────────────────────────┐
│ Vercel (host Next.js)                             │
│ Remotion Lambda (render serverless · AWS)         │
│ Resend (email transaccional)                      │
│ PostHog (product analytics)                       │
│ Sentry (errors)                                   │
└───────────────────────────────────────────────────┘
```

### 2.2 Modelo de datos multi-tenant

```sql
-- Auth layer (Supabase nativo)
users (id, email, name, avatar_url, created_at)

-- Organización / billing entity
organizations (
  id, slug, name, plan_id, stripe_customer_id,
  trial_ends_at, created_at
)

-- Pertenencia (multi-org por user)
memberships (
  user_id, org_id, role ['owner','admin','editor','viewer'],
  invited_at, accepted_at
)

-- Proyectos dentro de org (== brand/client)
projects (
  id, org_id, slug, name, icon, archived,
  brand_config jsonb, -- colors, fonts, logos, voice
  memory_md text,     -- concatenated markdown for AI
  created_at
)

-- Asset library compartida por proyecto
assets (
  id, project_id, type ['image','video','font','audio','logo'],
  r2_key, filename, mime, size, metadata jsonb,
  uploaded_by, created_at
)

-- Contenido (polimórfico por type)
contents (
  id, project_id, type ['carousel','reel','story','post'],
  name, data jsonb, -- shape varies by type
  published_at, scheduled_at,
  created_by, created_at, updated_at
)

-- Renders (async jobs)
renders (
  id, content_id, template, props jsonb,
  status ['queued','rendering','done','failed'],
  output_r2_key, duration_ms, cost_cents,
  started_at, completed_at
)

-- AI sessions (chat history)
ai_sessions (
  id, project_id, user_id, module, -- 'carousel'|'reel'|'story'
  messages jsonb[], token_usage, created_at
)

-- Usage tracking para billing
usage_events (
  id, org_id, event_type, quantity,
  metadata jsonb, occurred_at
)
-- event_type: ai_tokens, render_seconds, storage_mb, seat_count
```

### 2.3 Plans & limits

| Plan | Precio | AI tokens/mo | Renders MP4/mo | Storage | Seats | Projects |
|---|---|---|---|---|---|---|
| **Free** | $0 | 50k | 3 | 500MB | 1 | 1 |
| **Starter** | $29/mo | 500k | 50 | 10GB | 3 | 5 |
| **Pro** | $99/mo | 3M | 300 | 100GB | 10 | unlimited |
| **Agency** | $299/mo | 15M | 1500 | 1TB | 30 | unlimited |
| **Enterprise** | custom | unlimited | custom | custom | unlimited | unlimited + SSO + SLA |

**Usage-based overages:** $0.005/1k tokens · $0.50/render · $0.10/GB/mo.

---

## 3 · Capacidades diferenciadoras (lo que te hace SaaS)

### 3.1 AI contextual por proyecto
- Claude sabe la brand sin prompt (memoria `.md` se inyecta)
- Asset search semántico: "usá la foto del logo dark" → embeddings
- Auto-aplicación de brand al generar contenido
- Chat multi-módulo: pedile reel basado en carrusel D01 → genera composition props

### 3.2 Renderer serverless
- Remotion Lambda render jobs en AWS
- Queue con Trigger.dev · progreso realtime vía Supabase channels
- Cache inteligente: mismos props + template = link cacheado
- Variantes automáticas: render 9:16 + 1:1 + 16:9 en paralelo

### 3.3 Template marketplace
- Templates oficiales Storu (los 3 ya creados) + comunidad
- Fork a proyecto propio · customize · share
- Revenue share con creators (70/30)
- Rating + search por nicho

### 3.4 Publish & schedule
- Conectar IG / TikTok / LinkedIn / X via OAuth
- Schedule queue con preview del feed
- Auto-post con caption + hashtags AI-generated
- Analytics: saves, shares, DMs, conversion to WhatsApp

### 3.5 Comunidad + soporte
- Intercom embed
- Storu Academy (cursos cortos)
- Círculo privado (WhatsApp con onboarding automático)
- Weekly office hours

### 3.6 Integraciones
- Zapier · Make · native webhooks
- Shopify / Tienda Nube (auto-pull productos → carrusel)
- WhatsApp Business API (keyword triggers de carruseles → flows)
- Notion / Airtable (content calendar sync)

### 3.7 AI agentes
- **Brand Guardian**: valida cada pieza contra brand rules antes de publicar
- **Copy Director**: rescribe hooks para máxima retención basado en dataset
- **Trend Scout**: detecta trending hooks IG de la última semana por nicho
- **Performance Coach**: analiza métricas post-publish y sugiere iteraciones

---

## 4 · Roadmap de transformación (9 meses)

### Mes 1-2 · Foundation multi-tenant
- [ ] Migrar storage JSON → Postgres via Supabase
- [ ] Auth (magic link + Google + Apple)
- [ ] RLS policies por org/project
- [ ] Assets en Cloudflare R2 (signed URLs)
- [ ] Billing Stripe + webhook → limits enforcement
- [ ] Onboarding flow (org + first project + sample content)

### Mes 3-4 · Renderer prod-grade
- [ ] Remotion Lambda deploy en AWS
- [ ] Trigger.dev job queue
- [ ] Realtime render progress (Supabase channels)
- [ ] Variant rendering (paralelo 9:16 / 1:1 / 16:9)
- [ ] Custom fonts upload + sync al bundle

### Mes 5-6 · Product surface
- [ ] Template marketplace (gallery + fork + share)
- [ ] Asset library con AI search (OpenAI embeddings)
- [ ] Publishing: IG + TikTok OAuth + schedule
- [ ] Analytics dashboard
- [ ] Team roles + permissions UI

### Mes 7-8 · AI agents
- [ ] Brand Guardian validación pre-publish
- [ ] Copy Director hook optimization
- [ ] Trend Scout (scraping + embedding de trending IG hooks)
- [ ] Performance Coach con feedback loop

### Mes 9 · Launch
- [ ] Landing + pricing page
- [ ] Docs + video walkthroughs
- [ ] Founding member pricing (primeros 100 founders lifetime 50% off)
- [ ] PR campaign con 20 marcas ancla de los 50 carruseles
- [ ] ProductHunt launch

---

## 5 · Migración del código actual

### 5.1 Lo que queda (reutilizable 100%)
- `src/lib/remotion/*` → templates
- `src/components/reels/*` → UI cards
- `src/app/reels/*` → editor pages
- `src/components/layout/ProjectSwitcher.tsx` → ya multi-proyecto
- `src/components/ui/create-hub-dialog.tsx` → 4-pillar picker

### 5.2 Lo que se refactoriza
- `src/lib/data.ts` → `src/lib/db.ts` con Drizzle ORM hitting Supabase
- `src/lib/projects.ts` → CRUD via Supabase con RLS
- `src/app/api/*` → todos los endpoints ahora reciben `orgId` del JWT
- Chat AI → tokens tracked en `usage_events` antes de responder

### 5.3 Lo que se agrega
- Layer de auth (middleware Next.js check JWT Supabase)
- Billing UI (/settings/billing)
- Organization switcher (encima del ProjectSwitcher)
- Publishing module (/publish)
- Analytics module (/analytics)
- Admin panel (/admin) para ownership

---

## 6 · Monetización · estimación Y1

| Mes | Free signups | Paid conv | MRR | ARR |
|---|---|---|---|---|
| 1 (launch) | 200 | 5% = 10 | $500 | $6k |
| 3 | 800 | 8% = 64 | $3.2k | $38k |
| 6 | 2,500 | 10% = 250 | $12.5k | $150k |
| 9 | 5,500 | 12% = 660 | $33k | $400k |
| 12 | 12,000 | 13% = 1,560 | $78k | **$940k** |

**Assumptions:**
- Ticket promedio $50/mo (mix Starter $29 / Pro $99 / Agency $299)
- Churn mensual 5% post trial
- CAC $40 (orgánico IG + content marketing)
- LTV $600 (12 meses avg retention)
- LTV/CAC ratio 15× (saludable para SaaS)

---

## 7 · Moat real (por qué no te copian)

1. **Data network effect:** cada merchant que publica con Storu entrena el sistema para sugerir mejor a los próximos. Trend Scout + Copy Director mejoran con volumen.

2. **Brand memory compounding:** cada proyecto acumula memoria (ya vimos 6 meses con Storu Colombia GTM). Un merchant de 12 meses tiene tanto contexto que moverse a otra tool pierde todo.

3. **Template ecosystem:** 100+ templates comunitarios nichados por industria CO/LATAM que nadie más tiene.

4. **Integration depth:** WhatsApp + IG + Shopify + Tienda Nube nativos para LATAM. Competencia gringa (Canva, Adobe Express) no cubre esto.

5. **Community moat:** Círculo privado con 500 merchants activos. Es el moat más caro de copiar.

---

## 8 · Decisiones blocker que necesito de vos

1. **Nombre legal:** Storu Studio · Bonus Studio · algo nuevo?
2. **Geografía inicial:** solo Colombia · LATAM · global desde day 1?
3. **Plan de precios:** confirmás los tiers o ajustás?
4. **Founding model:** primeros N usuarios lifetime deal vs. 14-day trial?
5. **Stack cloud:** Vercel + Supabase + R2 como propongo, o preferís otra combo (AWS full / Railway / Render)?
6. **Timing:** arrancás la migración ahora (Mes 1 del roadmap) o esperás validar con N clientes más en modo local?

Con esas 6 respuestas te armo el plan de ejecución quincenal + deploy inicial de staging en Vercel.

---

## 9 · Siguiente commit sugerido

```bash
# Fase 4 · auth + multi-tenant foundation
git checkout -b feat/saas-foundation

# 1. npm install next-auth @supabase/supabase-js drizzle-orm
# 2. Setup Supabase project + schema
# 3. Migrate JSON → DB script
# 4. Middleware auth check
# 5. Org switcher UI
# 6. Billing Stripe integration
```

Con luz verde arranco ese próximo PR.
