import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * 60-second viral manifesto reel · 9:16
 *
 * Arc:
 *  0-3s   HOOK        · provocation that stops scroll
 *  3-12s  TENSION     · 3 stats of the problem
 *  12-22s REFRAME     · the core insight
 *  22-42s PROOF x3    · named cases
 *  42-52s FRAMEWORK   · 10 ways / mechanisms
 *  52-60s CTA         · comment keyword + tagline
 *
 * Todos los textos son props · fallback a defaults Storu generales.
 * Para D52 (La Roca · ritual · 62%) los props se llenan desde el set.
 */

export type CaseProof = {
  brand: string;
  city: string;
  before: string;
  after: string;
  time: string;
  move: string;
};

export type ViralManifesto60sProps = {
  accentColor: string;
  bgColor: string;
  // Hook
  hookContext?: string;       // "— COLOMBIA 2026 —"
  hookLine1?: string;         // "Tu competencia"
  hookLine2?: string;         // "vende lo mismo." (italic)
  hookLine3?: string;         // "Y vende más."
  // Tension stats (3)
  tensionLabel?: string;      // "— EL PANORAMA —"
  tensionStats?: Array<{ big: string; small: string }>;
  // Reframe
  reframeLabel?: string;      // "No es que no vendas."
  reframeItalic?: string;     // "Es que vendés en un solo idioma."
  reframeBody?: string;       // párrafo support
  // Proof cases (3)
  cases?: CaseProof[];
  // Framework
  frameworkLabel?: string;    // "— 10 FORMAS DE VENDER LO MISMO —"
  frameworkHeadline?: string; // "Cada producto tiene 10 idiomas"
  frameworkItems?: string[];  // 10 strings
  // CTA
  ctaLine1?: string;          // "Invierte en tus"
  ctaLine2?: string;          // "clientes."
  ctaSubline?: string;        // "No en alcance."
  ctaKeyword?: string;        // "DISEÑA"
  signature?: string;         // "storu.link · laboratorio de ventas"
};

const DEFAULT_STATS = [
  { big: "$240k", small: "CAC · cliente nuevo Meta" },
  { big: "73%", small: "de merchants bajan precio · mes a mes" },
  { big: "1×", small: "única forma de vender · 99% del mercado" },
];

const DEFAULT_CASES: CaseProof[] = [
  { brand: "PUNTO G GOURMET", city: "Barranquilla", before: "Martes vacíos", after: "+$1.9M midweek", time: "60 días", move: "Campaña por franja" },
  { brand: "ALIK SWIMWEAR", city: "Barranquilla", before: "Rebajas mensuales", after: "Sold out en 36h", time: "1 drop", move: "Drops limitados 48h" },
  { brand: "TRIBU FIT", city: "Barranquilla", before: "12% retención", after: "73% retención", time: "4 meses", move: "Reto 21 días con propósito" },
];

const DEFAULT_FRAMEWORK = [
  "Por franja horaria",
  "Por ocasión",
  "Por cantidad (combo)",
  "Por urgencia (drop)",
  "Por membresía",
  "Por suscripción",
  "Por preventa",
  "Por perfil de cliente",
  "Por regalo (gift)",
  "Por experiencia",
];

export const ViralManifesto60sSchema = {
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  hookContext: "— COLOMBIA 2026 —",
  hookLine1: "Tu competencia",
  hookLine2: "vende lo mismo.",
  hookLine3: "Y vende más.",
  tensionLabel: "— EL PANORAMA —",
  tensionStats: DEFAULT_STATS,
  reframeLabel: "No es que no vendas.",
  reframeItalic: "Es que vendés\nen un solo idioma.",
  reframeBody: "Una sola forma. Una sola franja. Un solo precio. El cliente que dice sí hoy es el 20% del mercado.",
  cases: DEFAULT_CASES,
  frameworkLabel: "— 10 FORMAS DE VENDER LO MISMO —",
  frameworkHeadline: "Cada producto tiene 10 idiomas",
  frameworkItems: DEFAULT_FRAMEWORK,
  ctaLine1: "Invierte en tus",
  ctaLine2: "clientes.",
  ctaSubline: "No en alcance.",
  ctaKeyword: "DISEÑA",
  signature: "storu.link · laboratorio de ventas",
} as const;

const fonts = { heading: "Poppins, sans-serif", mono: "JetBrains Mono, monospace" };

const fadeIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14 } });

export const ViralManifesto60s: React.FC<ViralManifesto60sProps> = ({
  accentColor,
  bgColor,
  hookContext = ViralManifesto60sSchema.hookContext,
  hookLine1 = ViralManifesto60sSchema.hookLine1,
  hookLine2 = ViralManifesto60sSchema.hookLine2,
  hookLine3 = ViralManifesto60sSchema.hookLine3,
  tensionLabel = ViralManifesto60sSchema.tensionLabel,
  tensionStats = DEFAULT_STATS,
  reframeLabel = ViralManifesto60sSchema.reframeLabel,
  reframeItalic = ViralManifesto60sSchema.reframeItalic,
  reframeBody = ViralManifesto60sSchema.reframeBody,
  cases = DEFAULT_CASES,
  frameworkLabel = ViralManifesto60sSchema.frameworkLabel,
  frameworkHeadline = ViralManifesto60sSchema.frameworkHeadline,
  frameworkItems = DEFAULT_FRAMEWORK,
  ctaLine1 = ViralManifesto60sSchema.ctaLine1,
  ctaLine2 = ViralManifesto60sSchema.ctaLine2,
  ctaSubline = ViralManifesto60sSchema.ctaSubline,
  ctaKeyword = ViralManifesto60sSchema.ctaKeyword,
  signature = ViralManifesto60sSchema.signature,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin((frame / fps) * 2) * 0.03 + 1;

  // Defensive: ensure arrays have at least 3 items
  const stats = (tensionStats?.length === 3 ? tensionStats : DEFAULT_STATS) as { big: string; small: string }[];
  const proofCases = (cases?.length === 3 ? cases : DEFAULT_CASES) as CaseProof[];
  const items = (frameworkItems?.length === 10 ? frameworkItems : DEFAULT_FRAMEWORK) as string[];

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, fontFamily: fonts.heading }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}18 0%, transparent 65%)`, transform: `scale(${pulse})` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff0a 1px, transparent 0)`, backgroundSize: "40px 40px" }} />

      {/* Progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: `${(frame / (fps * 60)) * 100}%`, background: accentColor, boxShadow: `0 0 20px ${accentColor}`, zIndex: 10 }} />

      {/* HOOK 0-3s */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
          <div style={{ opacity: fadeIn(frame, fps), transform: `scale(${spring({ frame, fps, from: 0.85, to: 1 })})` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 26, color: accentColor, letterSpacing: "0.28em", fontWeight: 700, marginBottom: 30 }}>{hookContext}</div>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.88, letterSpacing: "-0.04em", color: "white", textTransform: "uppercase" }}>{hookLine1}</div>
            <div style={{ fontSize: 80, fontWeight: 200, fontStyle: "italic", color: accentColor, marginTop: 16, letterSpacing: "-0.02em" }}>{hookLine2}</div>
            <div style={{ fontSize: 80, fontWeight: 900, color: "white", marginTop: 10, textTransform: "uppercase", letterSpacing: "-0.03em" }}>{hookLine3}</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* TENSION 3-12s */}
      <Sequence from={fps * 3} durationInFrames={fps * 9}>
        <AbsoluteFill style={{ padding: "100px 80px", flexDirection: "column" }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 22, color: "rgba(255,255,255,.55)", letterSpacing: "0.28em", fontWeight: 700, marginBottom: 40, opacity: fadeIn(frame - fps * 3, fps) }}>{tensionLabel}</div>
          {stats.map((s, i) => {
            const entry = fadeIn(frame - fps * (3 + 2 + i * 2), fps);
            return (
              <div key={i} style={{ opacity: entry, transform: `translateY(${(1 - entry) * 30}px)`, marginBottom: 40 }}>
                <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 1, color: i === 2 ? accentColor : "white", letterSpacing: "-0.04em" }}>{s.big}</div>
                <div style={{ fontSize: 30, fontWeight: 300, color: "rgba(255,255,255,.75)", marginTop: 8 }}>{s.small}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* REFRAME 12-22s */}
      <Sequence from={fps * 12} durationInFrames={fps * 10}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
          <div style={{ fontSize: 200, lineHeight: 0.8, color: accentColor, fontWeight: 900, letterSpacing: "-0.06em", marginBottom: 20, opacity: fadeIn(frame - fps * 12, fps) }}>&ldquo;</div>
          <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, color: "white", textTransform: "uppercase", letterSpacing: "-0.03em", opacity: fadeIn(frame - fps * 13, fps) }}>{reframeLabel}</div>
          <div style={{ fontSize: 48, fontWeight: 200, fontStyle: "italic", color: accentColor, marginTop: 20, lineHeight: 1.15, whiteSpace: "pre-line", opacity: fadeIn(frame - fps * 15, fps) }}>{reframeItalic}</div>
          <div style={{ fontSize: 30, fontWeight: 300, color: "rgba(255,255,255,.75)", marginTop: 30, lineHeight: 1.35, maxWidth: "90%", opacity: fadeIn(frame - fps * 17, fps) }}>{reframeBody}</div>
        </AbsoluteFill>
      </Sequence>

      {/* PROOF × 3 · 22-42s */}
      {proofCases.map((c, i) => {
        const from = 22 + i * 7;
        return (
          <Sequence key={i} from={fps * from} durationInFrames={fps * 7}>
            <AbsoluteFill style={{ padding: "100px 80px", flexDirection: "column" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 20, color: accentColor, letterSpacing: "0.28em", fontWeight: 800, marginBottom: 16, opacity: fadeIn(frame - fps * from, fps) }}>
                — CASO {String(i + 1).padStart(2, "0")} · {c.city.toUpperCase()} —
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em", opacity: fadeIn(frame - fps * (from + 0.3), fps) }}>{c.brand}</div>
              <div style={{ marginTop: 50, padding: "28px 32px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 24, opacity: fadeIn(frame - fps * (from + 1.2), fps) }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 18, color: "rgba(255,255,255,.5)", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 12 }}>LA JUGADA</div>
                <div style={{ fontSize: 38, fontWeight: 300, fontStyle: "italic", color: accentColor, lineHeight: 1.1 }}>{c.move}</div>
              </div>
              <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 20, opacity: fadeIn(frame - fps * (from + 2.5), fps) }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 18, color: "rgba(255,255,255,.45)", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 8 }}>ANTES</div>
                  <div style={{ fontSize: 38, fontWeight: 500, color: "rgba(255,255,255,.55)", textDecoration: "line-through", lineHeight: 1 }}>{c.before}</div>
                </div>
                <div style={{ fontSize: 80, fontWeight: 900, color: accentColor, opacity: fadeIn(frame - fps * (from + 3), fps) }}>→</div>
                <div style={{ flex: 1.3 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 18, color: accentColor, letterSpacing: "0.2em", fontWeight: 800, marginBottom: 8 }}>AHORA · {c.time.toUpperCase()}</div>
                  <div style={{ fontSize: 60, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em", textShadow: `0 2px 30px ${accentColor}60`, opacity: fadeIn(frame - fps * (from + 3.5), fps) }}>{c.after}</div>
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* FRAMEWORK 42-52s */}
      <Sequence from={fps * 42} durationInFrames={fps * 10}>
        <AbsoluteFill style={{ padding: "100px 60px", flexDirection: "column" }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 22, color: accentColor, letterSpacing: "0.28em", fontWeight: 800, marginBottom: 20, opacity: fadeIn(frame - fps * 42, fps) }}>{frameworkLabel}</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: "white", lineHeight: 0.95, letterSpacing: "-0.03em", textTransform: "uppercase", marginBottom: 40, opacity: fadeIn(frame - fps * 42, fps) }}>{frameworkHeadline}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {items.map((way, i) => {
              const entry = fadeIn(frame - fps * (43 + i * 0.5), fps);
              return (
                <div key={i} style={{ padding: "16px 20px", background: "rgba(255,255,255,.05)", border: `1px solid ${accentColor}40`, borderRadius: 14, fontSize: 24, fontWeight: 700, color: "white", opacity: entry, transform: `translateX(${(1 - entry) * (i % 2 ? 20 : -20)}px)` }}>
                  <span style={{ color: accentColor, marginRight: 10 }}>{String(i + 1).padStart(2, "0")}</span>{way}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CTA 52-60s */}
      <Sequence from={fps * 52} durationInFrames={fps * 8}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 60px" }}>
          <div style={{ fontSize: 76, fontWeight: 900, color: "white", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.03em", opacity: fadeIn(frame - fps * 52, fps) }}>{ctaLine1}</div>
          <div style={{ fontSize: 110, fontWeight: 900, color: accentColor, lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.04em", marginTop: 10, textShadow: `0 4px 40px ${accentColor}80`, opacity: fadeIn(frame - fps * 52.3, fps) }}>{ctaLine2}</div>
          <div style={{ fontSize: 40, fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,.8)", marginTop: 20, opacity: fadeIn(frame - fps * 53, fps) }}>{ctaSubline}</div>
          <div style={{ marginTop: 60, padding: "22px 40px", background: accentColor, color: bgColor, borderRadius: 22, fontSize: 40, fontWeight: 900, letterSpacing: "0.03em", textTransform: "uppercase", boxShadow: `0 20px 60px ${accentColor}60`, opacity: fadeIn(frame - fps * 54, fps), transform: `scale(${spring({ frame: frame - fps * 54, fps, from: 0.9, to: 1 })})` }}>
            💬 Comentá <b style={{ fontWeight: 900 }}>{ctaKeyword}</b>
          </div>
          <div style={{ marginTop: 40, fontFamily: fonts.mono, fontSize: 22, color: accentColor, letterSpacing: "0.28em", fontWeight: 800, opacity: fadeIn(frame - fps * 55, fps) }}>{signature}</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
