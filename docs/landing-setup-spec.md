# Landing · bonusprize.co/setup/[nicho]

Página única por nicho (9 variantes) que recibe el tráfico de IG y lo dispara a WhatsApp con UTM.

## URL structure
```
bonusprize.co/setup/restaurantes
bonusprize.co/setup/cafeterias
bonusprize.co/setup/belleza
bonusprize.co/setup/fitness
bonusprize.co/setup/moda
bonusprize.co/setup/mascotas
bonusprize.co/setup/educacion
bonusprize.co/setup/experiencias
bonusprize.co/setup/turismo
```

## Layout (single-page · mobile-first)

```
┌──────────────────────────────┐
│  1. HERO                     │  ← 100vh, hook del carrusel
│     • Logo Storu top-left    │
│     • Headline · niche hook  │
│     • 1 CTA button           │
├──────────────────────────────┤
│  2. INSIGHT                  │  ← 60vh
│     • Pull-quote · verdad    │
├──────────────────────────────┤
│  3. PRODUCT DEMO             │  ← 80vh
│     • Mockup UI campaña      │
│     • 1 ticket + Ubicoin chip│
├──────────────────────────────┤
│  4. CASO REAL                │  ← 70vh
│     • @handle + foto + stat  │
├──────────────────────────────┤
│  5. FORM                     │  ← 90vh
│     • Nombre                 │
│     • WhatsApp (+57)         │
│     • Tipo de negocio select │
│     • Submit → WA deep-link  │
├──────────────────────────────┤
│  6. FOOTER                   │  ← 20vh
│     • BonusPrize + links     │
└──────────────────────────────┘
```

## Form → WhatsApp handoff

**Al submit:**
1. Validar campos (cliente-side)
2. Guardar en DB (`/api/leads`) con:
   - nombre, telefono, negocio, nicho
   - utm_source, utm_medium, utm_campaign, utm_content (de query params)
   - referrer, landing_slug, timestamp
3. Redirect al usuario a WhatsApp deep-link pre-rellenado:

```
https://wa.me/573001234567?text=
  Hola%20Storu,%20soy%20{nombre}%20de%20{negocio}.
  Vi%20el%20reel%20de%20{nicho}%20y%20quiero%20el%20setup%20de%20{kw_activada}.
  UTM%3A%20{utm_campaign}
```

El número de WhatsApp es el de ventas de Storu. El pre-fill elimina fricción + deja tracking claro.

## UTM structure

Link en bio IG por nicho:
```
https://bonusprize.co/setup/restaurantes
  ?utm_source=instagram
  &utm_medium=bio
  &utm_campaign=carousel-v6-restaurantes-1-1
  &utm_content=hook-martes
```

Por reel (separar del carrusel):
```
  utm_campaign=reel-restaurantes-martes
  utm_content=hook-comment-MARTES
```

## Tech stack sugerido

- **Framework:** Next.js (matches carousel stack). 9 páginas estáticas + 1 API route.
- **DB:** Supabase (free tier, PostgreSQL)
- **Form:** React Hook Form + Zod validation
- **Hosting:** Vercel (deploy automático desde GitHub)
- **Analytics:** Plausible o PostHog (privacidad > GA)
- **WhatsApp API:** `wa.me` deep-link (gratis, sin API Cloud — suficiente para lead gen)

## Tiempo estimado

- Plantilla base + primera página (Restaurantes): 6-8h dev
- Otras 8 páginas (swap de data): 1h cada una
- Form + API endpoint + DB: 3h
- QA + deploy: 2h

**Total:** ~20 horas dev · 1 sprint de 2.5 días solo.

## Métricas clave (trackear desde día 1)

| Métrica | Target primera semana |
|---|---|
| Page views totales | 1.500+ |
| Tiempo en página | ≥ 90s |
| Form submit rate | ≥ 8% |
| Form → WhatsApp click | ≥ 95% (debe ser auto) |
| WhatsApp → respuesta manual | ≥ 70% |
| Response → call agendada | ≥ 40% |
| Call → cliente Storu | ≥ 25% |

Conversión esperada funnel full: **carrusel/reel view → cliente firmado = 0.8–1.2%** (industry B2B LATAM).

## Checklist implementación

- [ ] Crear proyecto Next.js + Tailwind
- [ ] Definir spec de data en `/data/niches.ts` (reutilizar de Open Carrusel)
- [ ] Montar 9 páginas dinámicas con `[nicho].tsx`
- [ ] Supabase setup + tabla `leads`
- [ ] `/api/leads` endpoint
- [ ] WhatsApp deep-link generator
- [ ] UTM capture + persistencia
- [ ] Deploy Vercel + custom domain
- [ ] Pixel Meta + evento conversion
- [ ] A/B test slot (hero copy alt)
