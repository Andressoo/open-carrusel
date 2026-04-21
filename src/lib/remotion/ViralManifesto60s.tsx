import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * 60-second viral manifesto reel · 9:16
 *
 * Arc:
 *  0-3s   HOOK        · provocation that stops scroll
 *  3-12s  TENSION     · 3 stats of the problem (Colombia 2026)
 *  12-22s REFRAME     · the core insight
 *  22-42s PROOF x3    · named cases (Punto G · Alik · Tribu Fit)
 *  42-52s FRAMEWORK   · 10 ways to sell (rapid fire)
 *  52-60s CTA         · comment keyword · Storu logo
 */

export type ViralManifesto60sProps = {
  accentColor: string;
  bgColor: string;
};

export const ViralManifesto60sSchema = {
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
} as const;

const fonts = { heading: "Poppins, sans-serif", mono: "JetBrains Mono, monospace" };

// Utility — spring that enters and exits
const fadeIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14 } });

export const ViralManifesto60s: React.FC<ViralManifesto60sProps> = ({
  accentColor,
  bgColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin((frame / fps) * 2) * 0.03 + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, fontFamily: fonts.heading }}>
      {/* Persistent ambient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}18 0%, transparent 65%)`,
          transform: `scale(${pulse})`,
        }}
      />
      {/* Dot pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff0a 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Global thin progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: `${(frame / (fps * 60)) * 100}%`,
          background: accentColor,
          boxShadow: `0 0 20px ${accentColor}`,
          zIndex: 10,
        }}
      />

      {/* ═══ 0-3s · HOOK ═══ */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
          <div
            style={{
              opacity: fadeIn(frame, fps),
              transform: `scale(${spring({ frame, fps, from: 0.85, to: 1 })})`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 26,
                color: accentColor,
                letterSpacing: "0.28em",
                fontWeight: 700,
                marginBottom: 30,
              }}
            >
              — COLOMBIA 2026 —
            </div>
            <div
              style={{
                fontSize: 150,
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                color: "white",
                textTransform: "uppercase",
              }}
            >
              Tu competencia
            </div>
            <div
              style={{
                fontSize: 100,
                fontWeight: 200,
                fontStyle: "italic",
                color: accentColor,
                marginTop: 16,
                letterSpacing: "-0.02em",
              }}
            >
              vende lo mismo.
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: "white",
                marginTop: 10,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
              }}
            >
              Y vende más.
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ 3-12s · TENSION (3 stats stagger) ═══ */}
      <Sequence from={fps * 3} durationInFrames={fps * 9}>
        <AbsoluteFill style={{ padding: "100px 80px", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 22,
              color: "rgba(255,255,255,.55)",
              letterSpacing: "0.28em",
              fontWeight: 700,
              marginBottom: 40,
              opacity: fadeIn(frame - fps * 3, fps),
            }}
          >
            — EL PANORAMA —
          </div>

          {[
            { big: "$240k", small: "CAC · cliente nuevo Meta" },
            { big: "73%", small: "de merchants bajan precio · mes a mes" },
            { big: "1×", small: "única forma de vender · 99% del mercado" },
          ].map((s, i) => {
            const entry = fadeIn(frame - fps * (3 + 2 + i * 2), fps);
            return (
              <div
                key={i}
                style={{
                  opacity: entry,
                  transform: `translateY(${(1 - entry) * 30}px)`,
                  marginBottom: 40,
                }}
              >
                <div
                  style={{
                    fontSize: 170,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: i === 2 ? accentColor : "white",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.big}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 300,
                    color: "rgba(255,255,255,.75)",
                    marginTop: 8,
                  }}
                >
                  {s.small}
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* ═══ 12-22s · REFRAME ═══ */}
      <Sequence from={fps * 12} durationInFrames={fps * 10}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
          <div
            style={{
              fontSize: 240,
              lineHeight: 0.8,
              color: accentColor,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              marginBottom: 20,
              opacity: fadeIn(frame - fps * 12, fps),
            }}
          >
            &ldquo;
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              opacity: fadeIn(frame - fps * 13, fps),
            }}
          >
            No es que no vendas.
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 200,
              fontStyle: "italic",
              color: accentColor,
              marginTop: 20,
              lineHeight: 1.15,
              opacity: fadeIn(frame - fps * 15, fps),
            }}
          >
            Es que vendés<br />
            en un solo idioma.
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 300,
              color: "rgba(255,255,255,.75)",
              marginTop: 30,
              lineHeight: 1.35,
              maxWidth: "85%",
              opacity: fadeIn(frame - fps * 17, fps),
            }}
          >
            Una sola forma. Una sola franja. Un solo precio. El cliente que
            dice <b style={{ color: "white", fontWeight: 700 }}>sí</b> hoy es
            el 20% del mercado.
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ 22-42s · PROOF × 3 ═══ */}
      {[
        {
          from: 22,
          brand: "PUNTO G GOURMET",
          city: "Barranquilla",
          before: "Martes vacíos",
          after: "+$1.9M midweek",
          time: "60 días",
          move: "Campaña por franja",
        },
        {
          from: 29,
          brand: "ALIK SWIMWEAR",
          city: "Barranquilla",
          before: "Rebajas mensuales",
          after: "Sold out en 36h",
          time: "1 drop",
          move: "Drops limitados 48h",
        },
        {
          from: 36,
          brand: "TRIBU FIT",
          city: "Barranquilla",
          before: "12% retención",
          after: "73% retención",
          time: "4 meses",
          move: "Reto 21 días con propósito",
        },
      ].map((c, i) => (
        <Sequence
          key={i}
          from={fps * c.from}
          durationInFrames={fps * 7}
        >
          <AbsoluteFill style={{ padding: "100px 80px", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 20,
                color: accentColor,
                letterSpacing: "0.28em",
                fontWeight: 800,
                marginBottom: 16,
                opacity: fadeIn(frame - fps * c.from, fps),
              }}
            >
              — CASO {String(i + 1).padStart(2, "0")} · {c.city.toUpperCase()} —
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                opacity: fadeIn(frame - fps * (c.from + 0.3), fps),
              }}
            >
              {c.brand}
            </div>

            <div
              style={{
                marginTop: 50,
                padding: "28px 32px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 24,
                opacity: fadeIn(frame - fps * (c.from + 1.2), fps),
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 18,
                  color: "rgba(255,255,255,.5)",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                LA JUGADA
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: accentColor,
                  lineHeight: 1.1,
                }}
              >
                {c.move}
              </div>
            </div>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: fadeIn(frame - fps * (c.from + 2.5), fps),
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 18,
                    color: "rgba(255,255,255,.45)",
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  ANTES
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 500,
                    color: "rgba(255,255,255,.55)",
                    textDecoration: "line-through",
                    lineHeight: 1,
                  }}
                >
                  {c.before}
                </div>
              </div>

              <div
                style={{
                  fontSize: 90,
                  fontWeight: 900,
                  color: accentColor,
                  opacity: fadeIn(frame - fps * (c.from + 3), fps),
                }}
              >
                →
              </div>

              <div style={{ flex: 1.3 }}>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 18,
                    color: accentColor,
                    letterSpacing: "0.2em",
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  AHORA · {c.time.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 68,
                    fontWeight: 900,
                    color: "white",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    textShadow: `0 2px 30px ${accentColor}60`,
                    opacity: fadeIn(frame - fps * (c.from + 3.5), fps),
                  }}
                >
                  {c.after}
                </div>
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* ═══ 42-52s · FRAMEWORK (10 ways grid) ═══ */}
      <Sequence from={fps * 42} durationInFrames={fps * 10}>
        <AbsoluteFill style={{ padding: "100px 60px", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 22,
              color: accentColor,
              letterSpacing: "0.28em",
              fontWeight: 800,
              marginBottom: 20,
              opacity: fadeIn(frame - fps * 42, fps),
            }}
          >
            — 10 FORMAS DE VENDER LO MISMO —
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "white",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              marginBottom: 40,
              opacity: fadeIn(frame - fps * 42, fps),
            }}
          >
            Cada producto{" "}
            <span style={{ color: accentColor, fontWeight: 200, fontStyle: "italic" }}>
              tiene 10 idiomas
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {[
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
            ].map((way, i) => {
              const entry = fadeIn(frame - fps * (43 + i * 0.5), fps);
              return (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    background: "rgba(255,255,255,.05)",
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 14,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "white",
                    opacity: entry,
                    transform: `translateX(${(1 - entry) * (i % 2 ? 20 : -20)}px)`,
                  }}
                >
                  <span style={{ color: accentColor, marginRight: 10 }}>0{i === 9 ? "" : i + 1}</span>
                  {way}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ 52-60s · CTA ═══ */}
      <Sequence from={fps * 52} durationInFrames={fps * 8}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "white",
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              opacity: fadeIn(frame - fps * 52, fps),
            }}
          >
            Invierte en tus
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: accentColor,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              marginTop: 10,
              textShadow: `0 4px 40px ${accentColor}80`,
              opacity: fadeIn(frame - fps * 52.3, fps),
            }}
          >
            clientes.
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(255,255,255,.8)",
              marginTop: 20,
              opacity: fadeIn(frame - fps * 53, fps),
            }}
          >
            No en alcance.
          </div>

          <div
            style={{
              marginTop: 70,
              padding: "24px 40px",
              background: accentColor,
              color: bgColor,
              borderRadius: 22,
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              boxShadow: `0 20px 60px ${accentColor}60`,
              opacity: fadeIn(frame - fps * 54, fps),
              transform: `scale(${spring({ frame: frame - fps * 54, fps, from: 0.9, to: 1 })})`,
            }}
          >
            💬 Comentá <b style={{ fontWeight: 900 }}>DISEÑA</b>
          </div>

          <div
            style={{
              marginTop: 40,
              fontFamily: fonts.mono,
              fontSize: 24,
              color: accentColor,
              letterSpacing: "0.28em",
              fontWeight: 800,
              opacity: fadeIn(frame - fps * 55, fps),
            }}
          >
            storu.link · laboratorio de ventas
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
