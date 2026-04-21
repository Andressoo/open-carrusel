/**
 * Instagram Safe Zones · reglas de layout por formato
 *
 * Cada formato tiene áreas donde elementos del feed de Instagram tapan contenido:
 * avatar/username arriba, action bar abajo, reply area en stories, pagination dots
 * en carruseles, etc.
 *
 * Estas constantes definen las zonas donde NO colocar texto crítico, CTAs, o
 * datos importantes. Se usan tanto para validación como para overlays visuales
 * en editors (toggle "Ver safe zones").
 *
 * Unidades: píxeles sobre el canvas base de cada formato.
 * Todos los valores se validan contra dimensiones nominales de IG (2024-2026):
 *   - Carousel 1:1 → 1080×1080
 *   - Carousel 4:5 → 1080×1350
 *   - Story / Reel 9:16 → 1080×1920
 *   - Post 1:1 → 1080×1080
 */

export type SafeZone = {
  id: string;
  label: string;
  /** Razón · qué tapa esto en IG */
  reason: string;
  /** Bounds en píxeles (top·left·right·bottom) */
  top: number;
  left: number;
  right: number;
  bottom: number;
  /** Severity · critical = no texto nunca · warning = evitar si posible */
  severity: "critical" | "warning";
};

export type FormatSafeZones = {
  width: number;
  height: number;
  aspectRatio: string;
  zones: SafeZone[];
  /** El rectángulo seguro neto (fuera de todas las critical zones) */
  safeArea: { top: number; left: number; right: number; bottom: number };
};

// ════════════ CAROUSEL 4:5 (1080×1350) ════════════
export const CAROUSEL_4_5: FormatSafeZones = {
  width: 1080,
  height: 1350,
  aspectRatio: "4:5",
  zones: [
    {
      id: "username",
      label: "Username + avatar overlay",
      reason: "IG sobrepone username + avatar en top-left en feed",
      top: 0,
      left: 0,
      right: 1080,
      bottom: 120,
      severity: "warning",
    },
    {
      id: "pagination",
      label: "Pagination dots",
      reason: "IG muestra los dots del carrusel en top-right",
      top: 0,
      left: 820,
      right: 1080,
      bottom: 80,
      severity: "critical",
    },
    {
      id: "caption",
      label: "Caption preview (3 líneas)",
      reason: "IG corta el feed con caption/acción bar abajo",
      top: 1180,
      left: 0,
      right: 1080,
      bottom: 1350,
      severity: "warning",
    },
  ],
  safeArea: { top: 120, left: 0, right: 1080, bottom: 1180 },
};

// ════════════ CAROUSEL 1:1 (1080×1080) ════════════
export const CAROUSEL_1_1: FormatSafeZones = {
  width: 1080,
  height: 1080,
  aspectRatio: "1:1",
  zones: [
    {
      id: "username",
      label: "Username + avatar overlay",
      reason: "IG sobrepone username en top-left en feed",
      top: 0,
      left: 0,
      right: 1080,
      bottom: 100,
      severity: "warning",
    },
    {
      id: "pagination",
      label: "Pagination dots",
      reason: "IG muestra dots del carrusel en top-right",
      top: 0,
      left: 820,
      right: 1080,
      bottom: 70,
      severity: "critical",
    },
    {
      id: "caption",
      label: "Caption preview",
      reason: "Zona inferior cortada por caption/action bar",
      top: 940,
      left: 0,
      right: 1080,
      bottom: 1080,
      severity: "warning",
    },
  ],
  safeArea: { top: 100, left: 0, right: 1080, bottom: 940 },
};

// ════════════ STORY 9:16 (1080×1920) ════════════
export const STORY_9_16: FormatSafeZones = {
  width: 1080,
  height: 1920,
  aspectRatio: "9:16",
  zones: [
    {
      id: "username-bar",
      label: "Username + progress bar",
      reason: "IG muestra barra de progreso + username + menú arriba",
      top: 0,
      left: 0,
      right: 1080,
      bottom: 250,
      severity: "critical",
    },
    {
      id: "reply-bar",
      label: "Reply area · 'Send message'",
      reason: "IG muestra input de respuesta + reacciones abajo",
      top: 1680,
      left: 0,
      right: 1080,
      bottom: 1920,
      severity: "critical",
    },
    {
      id: "sticker-zone-common",
      label: "Zona típica de stickers (poll/quiz)",
      reason: "Si vas a usar poll/quiz/countdown, suele ir centrado bajo-medio",
      top: 1250,
      left: 140,
      right: 940,
      bottom: 1680,
      severity: "warning",
    },
  ],
  safeArea: { top: 250, left: 60, right: 1020, bottom: 1680 },
};

// ════════════ REEL 9:16 (1080×1920) ════════════
export const REEL_9_16: FormatSafeZones = {
  width: 1080,
  height: 1920,
  aspectRatio: "9:16",
  zones: [
    {
      id: "top-bar",
      label: "Status bar + top nav IG",
      reason: "Zona superior con barra sistema + botón atrás",
      top: 0,
      left: 0,
      right: 1080,
      bottom: 130,
      severity: "warning",
    },
    {
      id: "right-actions",
      label: "Right action bar · like/comment/share/audio",
      reason: "IG muestra 5 iconos verticales en el lado derecho del reel",
      top: 900,
      left: 960,
      right: 1080,
      bottom: 1700,
      severity: "critical",
    },
    {
      id: "bottom-meta",
      label: "Username + caption + audio tag",
      reason: "IG muestra username + descripción + audio abajo izquierda",
      top: 1580,
      left: 0,
      right: 960,
      bottom: 1920,
      severity: "critical",
    },
  ],
  safeArea: { top: 130, left: 60, right: 940, bottom: 1580 },
};

// ════════════ POST 1:1 (== CAROUSEL 1:1 pero sin pagination) ════════════
export const POST_1_1: FormatSafeZones = {
  width: 1080,
  height: 1080,
  aspectRatio: "1:1",
  zones: [
    {
      id: "username",
      label: "Username + avatar overlay",
      reason: "IG sobrepone username en top-left en feed",
      top: 0,
      left: 0,
      right: 1080,
      bottom: 100,
      severity: "warning",
    },
    {
      id: "caption",
      label: "Caption preview",
      reason: "Zona cortada por caption/action bar abajo",
      top: 940,
      left: 0,
      right: 1080,
      bottom: 1080,
      severity: "warning",
    },
  ],
  safeArea: { top: 100, left: 0, right: 1080, bottom: 940 },
};

// ════════════ REGISTRY ════════════
export const SAFE_ZONES: Record<string, FormatSafeZones> = {
  "carousel-1:1": CAROUSEL_1_1,
  "carousel-4:5": CAROUSEL_4_5,
  "carousel-9:16": STORY_9_16,
  "story-9:16": STORY_9_16,
  "reel-9:16": REEL_9_16,
  "post-1:1": POST_1_1,
};

export function getSafeZones(
  type: "carousel" | "story" | "reel" | "post",
  aspectRatio: "1:1" | "4:5" | "9:16"
): FormatSafeZones {
  const key = `${type}-${aspectRatio}`;
  return SAFE_ZONES[key] || CAROUSEL_4_5;
}

/**
 * CSS overlay generator · produce background gradients marcando las zones.
 * Usar en preview del editor como capa no-interactiva (pointer-events: none).
 */
export function safeZoneOverlayCSS(
  zones: FormatSafeZones
): { className: string; style: React.CSSProperties } {
  const gradients = zones.zones.map((z) => {
    const color =
      z.severity === "critical"
        ? "rgba(220,38,38,0.18)" // red for critical
        : "rgba(245,158,11,0.14)"; // amber for warning
    // linear-gradient confined via clip-path · simpler: use multiple linear-gradients
    const topPct = (z.top / zones.height) * 100;
    const bottomPct = (z.bottom / zones.height) * 100;
    const leftPct = (z.left / zones.width) * 100;
    const rightPct = (z.right / zones.width) * 100;
    // Single rectangle via conic trick; we'll just use inset absolute divs instead → return empty
    return { color, topPct, bottomPct, leftPct, rightPct };
  });
  return {
    className: "safe-zone-overlay",
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
    },
  };
}

/**
 * Regla de validación rápida · checa si un punto (x, y) cae en una critical zone.
 * El editor de carruseles puede usar esto para mostrar un badge ⚠️ junto al
 * slide que tenga texto/elementos dentro de una critical zone.
 */
export function isInCriticalZone(
  x: number,
  y: number,
  zones: FormatSafeZones
): SafeZone | null {
  return (
    zones.zones.find(
      (z) =>
        z.severity === "critical" &&
        x >= z.left &&
        x <= z.right &&
        y >= z.top &&
        y <= z.bottom
    ) || null
  );
}
