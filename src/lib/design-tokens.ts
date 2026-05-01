/**
 * Design tokens · Storu / BonusPrize · paleta oficial
 * Fuente: brand HTMLs (auth · buttons · cards · checkout · colors · forms)
 *
 * Reglas duras:
 * - Violet ES el accent primario · interactive surfaces, links, focus rings
 * - Yellow ES SOLO para BonusPrize y highlight tokens (NO general accent)
 * - Pink/Cyan ÚNICAMENTE en landing illustrations
 * - Default body: Ink-on-White (18:1) · WCAG AAA
 * - Filled buttons: White-on-Ink (NO yellow-on-ink como tenía antes)
 * - Una sola paleta de saturación por surface (Violet O Yellow, no ambos)
 */

export const TOKENS = {
  // ─── Brand · 3 colores que hacen casi todo ───
  brand: {
    violet: "#5635FD",  // primary accent · interactive
    ink:    "#131217",  // type, default filled button
    yellow: "#F8C644",  // BonusPrize / highlight tokens ONLY
  },

  // ─── Violet states ───
  violet: {
    default: "#5635FD",
    hover:   "#6244FE",
    active:  "#2A02F2",
    tint16:  "rgba(86,53,253,0.16)", // strong tint
    tint10:  "rgba(86,53,253,0.10)",
    tint06:  "rgba(86,53,253,0.06)",
  },

  // ─── Surfaces (warm neutral chrome) ───
  surface: {
    ground: "#EFF3F8", // dashboard page bg
    card:   "#FFFFFF",
    hover:  "#F6F9FC",
    border: "#DFE7EF",
  },

  // ─── Neutral ramp 50→900 ───
  neutral: {
    50:  "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // ─── Status (one solid + one 5% bg) ───
  status: {
    success: { fill: "#22C55E", bg: "#F4FCF7" },
    warning: { fill: "#EAB308", bg: "#FEFBF3" },
    danger:  { fill: "#FF3D32", bg: "#FFF5F5" },
    info:    { fill: "#3B82F6", bg: "#F5F9FF" },
  },

  // ─── Text ───
  text: {
    primary:   "#131217",
    secondary: "#616161",
    tertiary:  "#9E9E9E",
    inverse:   "#FFFFFF",
    accent:    "#5635FD",
  },

  // ─── Spacing scale (4-base) ───
  space: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48, "3xl": 64,
  },

  // ─── Radius ───
  radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },

  // ─── Tipografía ───
  font: {
    sans:    "Inter, system-ui, -apple-system, sans-serif",
    mono:    "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
    display: "Inter Display, Inter, sans-serif",
  },

  size: {
    xs: 11, sm: 13, base: 14, md: 15, lg: 18, xl: 22,
    "2xl": 28, "3xl": 36, "4xl": 48, "5xl": 64,
  },

  weight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 900 },

  leading: { tight: 1.1, snug: 1.25, normal: 1.5, relaxed: 1.65 },

  // ─── Shadows ───
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 12px rgba(19,18,23,0.08)",
    lg: "0 12px 32px rgba(19,18,23,0.12)",
    xl: "0 24px 60px rgba(19,18,23,0.18)",
    violet: "0 12px 32px rgba(86,53,253,0.20)",
  },

  // ─── Animation ───
  ease: {
    out:    "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut:  "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  duration: { instant: "100ms", fast: "150ms", base: "200ms", slow: "300ms", slower: "500ms" },

  // ─── Z-index ───
  z: { base: 1, raised: 10, overlay: 50, modal: 100, palette: 200, tooltip: 300, toast: 400 },

  // ─── Layout ───
  layout: {
    sidebarWidth: 240,
    inspectorWidth: 320,
    topbarHeight: 52,
    bottomDockHeight: 120,
  },

  // ─── Aspect ratios ───
  aspect: {
    square:    "1 / 1",   // post 1080×1080
    portrait:  "4 / 5",   // carrusel 1080×1350
    story:     "9 / 16",  // story/reel 1080×1920
    landscape: "16 / 9",  // youtube 1920×1080
  },
} as const;

// ─── Aliases por uso (semantic) ───
export const SEMANTIC = {
  // El accent primario es VIOLET (NO yellow como tenía antes)
  accent:        TOKENS.brand.violet,
  accentHover:   TOKENS.violet.hover,
  accentActive:  TOKENS.violet.active,
  accentTint:    TOKENS.violet.tint16,
  accentText:    TOKENS.text.inverse, // white on violet

  // Yellow tiene rol limitado · solo BonusPrize y highlights
  highlight:     TOKENS.brand.yellow,
  bonusPrize:    TOKENS.brand.yellow,

  // Ink es default
  fg:            TOKENS.text.primary,
  fgInverse:     TOKENS.text.inverse,
  bg:            TOKENS.surface.card,
  bgGround:      TOKENS.surface.ground,
  border:        TOKENS.surface.border,
} as const;

// ─── Helpers ───
export const cssVar = (path: string) => `var(--storu-${path.replace(/\./g, "-")})`;
export const sp = (key: keyof typeof TOKENS.space) => `${TOKENS.space[key]}px`;
export const rd = (key: keyof typeof TOKENS.radius) => {
  const v = TOKENS.radius[key];
  return typeof v === "number" ? `${v}px` : v;
};

export type Tokens = typeof TOKENS;
