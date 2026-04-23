# Storu API Pública · v1

API REST para que los comercios de tu marketplace consuman Storu desde sus sistemas · cada campaña que crean genera automáticamente un set de contenido listo para publicar.

---

## Autenticación

Todas las requests requieren un Bearer token:

```http
Authorization: Bearer storu_live_<token>
```

Los tokens tienen 2 ambientes:
- `storu_live_*` · producción · billable · rate limit 1000 req/día por default
- `storu_test_*` · sandbox · gratis · rate limit 50 req/día

### Emitir un token

Desde el server admin (tu marketplace llama a Storu internamente):

```bash
node scripts/issue-api-key.mjs \
  --merchant=<merchantId> \
  --name="Tienda X prod" \
  --project=storu-colombia-gtm \
  --env=live \
  --limit=1000
```

Guardá el token · no se puede recuperar después. Revocalos con `revokeApiKey()` en `src/lib/api-keys.ts`.

---

## Endpoints

### 1. `POST /api/public/v1/sets`

Crea un nuevo set de contenido. Dos modos:

#### Modo A · AI generation (recomendado para comercios)

El comercio solo manda la idea · Claude arma todo:

```bash
curl -X POST https://<host>/api/public/v1/sets \
  -H "Authorization: Bearer storu_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Promocionar mi pizzería los martes en Medellín · goal valley"
  }'
```

Respuesta `201 Created`:
```json
{
  "data": {
    "id": "b2ac9f00-...",
    "name": "Pizzería martes valle",
    "topic": "...",
    "goal": "valley",
    "archetype": "case-study",
    "ctaKeyword": "MARTES",
    "thread": "Framework: Hook-Story-Offer · ...",
    "possibleCaptions": [...],
    "hashtags": [...],
    "kpis": [...],
    "story": { "id": null, "status": "pending" },
    "carousel": { "id": null, "status": "pending" },
    "reel": { "id": null, "status": "pending" }
  },
  "meta": {
    "key": { "prefix": "storu_live_AbC...XyZ", "merchantId": "cm-1234", ... }
  }
}
```

#### Modo B · Direct creation

El comercio pasa los campos manualmente (cuando ya tiene copy propio):

```bash
curl -X POST https://<host>/api/public/v1/sets \
  -H "Authorization: Bearer storu_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Pizzería martes",
    "goal": "valley",
    "archetype": "case-study",
    "ctaKeyword": "PIZZA",
    "name": "Martes de pizza",
    "possibleCaptions": ["..."],
    "hashtags": ["pizza", "medellin"]
  }'
```

### 2. `GET /api/public/v1/sets`

Lista los sets del merchant autenticado.

```bash
curl "https://<host>/api/public/v1/sets?status=draft&limit=20" \
  -H "Authorization: Bearer storu_live_..."
```

Query params:
- `status` · filtrar por draft / live / done / archived
- `limit` · max 200, default 50

### 3. `GET /api/public/v1/sets/:id/export`

Descarga el ZIP completo del set (PNGs del carrusel + MP4 del reel + historia JSON + captions.txt + README.md).

```bash
curl "https://<host>/api/public/v1/sets/b2ac9f00-.../export" \
  -H "Authorization: Bearer storu_live_..." \
  -o set.zip
```

Respuesta: binary ZIP.

Headers relevantes:
- `Content-Disposition: attachment; filename="..."`
- `X-Storu-Merchant: cm-1234`

---

## Flujo típico en el marketplace

```
┌──────────────────────────────────────────────────────────────────┐
│ Comercio crea campaña en tu marketplace                          │
│   · topic, goal, audiencia, fechas                               │
└──────────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│ Tu backend llama POST /api/public/v1/sets                        │
│   · manda idea + contexto extra                                  │
│   · recibe set.id                                                │
└──────────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│ [Opcional] comercio edita el set en tu UI custom                 │
│   o redirige a https://<host>/set/<id> para editor nativo Storu  │
└──────────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│ Al lanzar la campaña tu backend descarga                         │
│ GET /api/public/v1/sets/<id>/export                              │
│   · guarda el ZIP · envía al comercio · publica automático       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Scopes (control fino de permisos)

Al emitir un token podés restringir qué endpoints puede llamar:

- `sets:read` · solo GET
- `sets:create` · POST /sets
- `sets:generate` · POST /sets con `idea` (AI)
- `sets:export` · GET /sets/:id/export
- `*` · todos

Por default un token tiene `null` = todos los scopes.

---

## Rate limits

- `test`: 50 req/día
- `live`: 1000 req/día (ajustable por key con `--limit=N`)

Cuando se excede devuelve `429 Too Many Requests` con `X-RateLimit-Reset` header.

El contador se resetea a medianoche UTC · el campo `usage.todayResetAt` muestra el día en curso.

---

## Errores estándar

| Status | Significado |
|--------|-------------|
| 400    | Request malformed · body faltante / inválido |
| 401    | Missing or invalid API key |
| 403    | API key revoked / missing scope |
| 429    | Rate limit exceeded |
| 500    | Internal error (AI gen failed, export failed, etc.) |

Todos devuelven `{ "error": "<reason>" }` JSON.

---

## Webhooks (próximo)

🔲 Roadmap: webhook callbacks cuando:
- Un set está ready (piezas generadas + renderizadas)
- Export falla
- Una keyword se comenta en IG (via Meta webhook upstream)

---

## SDK / client libs (próximo)

🔲 Roadmap:
- `@storu/sdk-js` · npm package con tipos TS
- `@storu/sdk-python` · pip package
- Postman collection
- OpenAPI spec auto-generado

---

## Seguridad

- Tokens se guardan hasheados en producción (TODO)
- HMAC signatures opcionales para webhooks
- CORS: por default no permite · configurable por merchantId
- Logs de cada request con timestamp + keyId + endpoint (no body)
- Revocación instantánea desde `scripts/revoke-api-key.mjs`

---

## Ejemplo end-to-end en Node.js

```javascript
const STORU_KEY = process.env.STORU_KEY;
const STORU_URL = "https://storu.yourdomain.com";

async function createSetForMerchantCampaign(campaign) {
  // 1. Generar el set con AI
  const createRes = await fetch(`${STORU_URL}/api/public/v1/sets`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STORU_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idea: `${campaign.title} para ${campaign.merchantName} en ${campaign.city}. Goal: ${campaign.goal}.`,
    }),
  });
  const { data: set } = await createRes.json();

  // 2. Esperar a que las piezas se generen (poll o webhook)
  await sleep(60_000); // MVP: poll, luego webhook

  // 3. Descargar el ZIP
  const zipRes = await fetch(
    `${STORU_URL}/api/public/v1/sets/${set.id}/export`,
    { headers: { "Authorization": `Bearer ${STORU_KEY}` } }
  );
  const zipBuffer = await zipRes.arrayBuffer();

  // 4. Enviar al comercio via email o subir a su dashboard
  await sendToMerchant(campaign.merchantEmail, zipBuffer);

  return set.id;
}
```

---

## Pricing sugerido (marketplace)

| Plan | Req/día | Sets ilimitados | Precio/mes |
|------|---------|----------------|------------|
| Starter (test) | 50 | ❌ | Free |
| Pro | 300 | ✅ | $19/merchant |
| Business | 1000 | ✅ + custom brand | $49/merchant |
| Enterprise | Custom | ✅ + SLA + webhooks | Custom |

Storu monetiza a vos (1 bill) · vos cobrás al comercio (N bills).
