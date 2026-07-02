# North Star · Storu Studio

## La goal (una sola)

> **Que cada comercio exporte al menos 1 set por semana.**
>
> Métrica: **sets exportados** — el ZIP que sale del sistema listo para publicar.

Un set creado no vale nada. Un set "ready" tampoco. El valor existe cuando el contenido **sale del sistema hacia Instagram**. El export es el único evento que lo prueba, y ahora queda instrumentado (`exportedAt` + `exportCount` en cada set).

## Por qué los benchmarks anteriores estaban mal

| Benchmark viejo | Problema |
|---|---|
| "52 sets creados" | Vanity · generamos 52 con scripts en una tarde |
| "52 listos para publicar" | Status que nosotros mismos marcamos · no lo valida nadie |
| "50 agendados" | Agendar es gratis · no prueba intención real |
| KPIs de IG (DMs, saves) | No los podemos medir todavía · sin integración Meta |

Todos medían actividad **dentro** del sistema. Ninguno medía si el contenido salía.

## El funnel que sí importa

```
brief → set creado → 3/3 piezas ready → agendado → EXPORTADO
```

`GET /api/metrics` lo calcula en vivo desde los datos:

| Tasa | Definición | Target |
|---|---|---|
| **completion rate** | sets creados que llegan a 3/3 piezas | ≥ 90 % |
| **schedule rate** | sets completos que se agendan | ≥ 80 % |
| **export rate** | sets listos que se exportan · **north star** | ≥ 60 % |

## Benchmarks técnicos (guardrails, no goals)

| Métrica | Target | Cómo se mide hoy |
|---|---|---|
| Brief → set completo (agente) | < 3 min p50 | timestamps createdAt/updatedAt |
| Render MP4 10s | < 30 s p50 | manual · pendiente instrumentar |
| Export ZIP completo | < 90 s p50 | manual · pendiente instrumentar |
| Error rate del agente | < 5 % | eventos `error` en SSE |
| Costo AI por set | < $0.30 USD | usage de OpenRouter |

Guardrails: si se rompen, la goal se vuelve inalcanzable — pero optimizarlos no es la goal.

## Decisiones que se derivan de esto

1. **Todo camino lleva al export.** El botón "Descargar set completo" es la acción más importante de la UI · debe estar visible en cada set.
2. **Un set que lleva 7 días ready sin exportar es un problema**, no un logro. Futuro: surfacear "sets estancados" en el dashboard.
3. **Cuando haya integración Meta**, el north star sube un nivel: de "exportado" a "publicado" y después a "DMs con keyword". La escalera está definida; hoy medimos el peldaño que podemos medir con honestidad.
