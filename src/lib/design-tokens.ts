/**
 * Design tokens centralizados.
 * Usar siempre estas constantes en lugar de hardcodear valores.
 *
 * Brand-first: colores Storu (yellow/violet/ink) son la base.
 * Cualquier override de marca por proyecto pasa por brand-context.md.
 */

export const TOKENS = {
  // ─── Colores brand ───
  brand: {
    yellow: "#F8C644",
    violet: "#5635FD",
    ink: "#0E0D12",
    cream: "#F5EDE0",
  },

  // ─── Sistema (Tailwind vars) ───
  bg: {
    canvas: "var(--background)",
    surface: "var(--surface)",
    surfaceHover: "var(--surface-2, var(--muted))",
    overlay: "rgba(14, 13, 18, 0.85)",
  },

  fg: {
    high: "var(--foreground)",
    medium: "var(--muted-foreground)",
    low: "var(--muted-foreground-2, var(--muted-foreground))",
    inverse: "var(--background)",
  },

  border: {
    subtle: "var(--border)",
    strong: "var(--border, rgba(255,255,255,0.18))",
    accent: "var(--accent)",
  },

  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },

  // ─── Spacing escala ───
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },

  // ─── Radius ───
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },

  // ─── Tipografía ───
  font: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
    display: "Inter Display, Inter, sans-serif",
  },

  text: {
    xs: 11,
    sm: 13,
    base: 14,
    md: 15,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 36,
    "4xl": 48,
    "5xl": 64,
  },

  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  leading: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },

  // ─── Shadows ───
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 12px 32px rgba(0,0,0,0.12)",
    xl: "0 24px 60px rgba(0,0,0,0.18)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.04)",
  },

  // ─── Animation ───
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  duration: {
    instant: "100ms",
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // ─── Z-index ───
  z: {
    base: 1,
    raised: 10,
    overlay: 50,
    modal: 100,
    palette: 200,
    tooltip: 300,
    toast: 400,
  },

  // ─── Layout dimensions ───
  layout: {
    sidebarWidth: 240,
    inspectorWidth: 320,
    topbarHeight: 52,
    bottomDockHeight: 120,
  },

  // ─── Aspect ratios para piezas ───
  aspect: {
    square: "1 / 1",        // post 1080×1080
    portrait: "4 / 5",      // carrusel 1080×1350
    story: "9 / 16",        // story/reel 1080×1920
    landscape: "16 / 9",    // youtube 1920×1080
  },
} as const;

// ─── Helpers ───

/** Genera CSS var name a partir de una key de TOKENS */
export const cssVar = (path: string) => `var(--storu-${path.replace(/\./g, "-")})`;

/** Aplica spacing como string CSS (px) */
export const sp = (key: keyof typeof TOKENS.space) => `${TOKENS.space[key]}px`;

/** Aplica radius como string CSS (px o keyword) */
export const rd = (key: keyof typeof TOKENS.radius) => {
  const v = TOKENS.radius[key];
  return typeof v === "number" ? `${v}px` : v;
};

export type Tokens = typeof TOKENS;
