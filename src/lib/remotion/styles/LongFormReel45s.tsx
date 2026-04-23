/**
 * LongFormReel45s · Reel de 45 segundos con 5 escenas narrativas.
 *
 * Timeline:
 *   0-6s   Hook · pregunta o statement punzante
 *   6-16s  Problema · contexto con data / dolor
 *   16-26s Insight · la revelación
 *   26-36s Prueba · caso concreto con números
 *   36-45s CTA · keyword + urgencia
 *
 * Diseñado para contenido educacional largo que aguanta retención
 * alta (framework, case study profundo, manifestos densos).
 */

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Sequence,
} from "remotion";

export type LongFormReel45sProps = {
  hook: string;
  problem: string;
  insight: string;
  proof: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const LongFormReel45sSchema = {
  hook: "¿Qué hace que un cliente vuelva cada domingo?",
  problem: "70% de barberías en Pereira compiten por precio. Margen destruido · cliente que se va al más barato.",
  insight: "No es el corte. Es el ritual. El cliente paga más por la experiencia si tiene nombre propio.",
  proof: "Barbería en Pinares subió 62% el ticket en 8 semanas con 'Ritual del domingo' · sin subir precio base.",
  cta: "Comentá RITUAL y te paso el SOP completo al DM.",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

// ─── Scene helpers ───

const fadeInSpring = (frame: number, fps: number, start: number) =>
  spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 110 } });

export const LongFormReel45s: React.FC<LongFormReel45sProps> = ({
  hook,
  problem,
  insight,
  proof,
  cta,
  accentColor,
  bgColor,
  textColor,
  bgImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene boundaries (frame numbers at 30fps)
  const s1End = 6 * fps;
  const s2End = 16 * fps;
  const s3End = 26 * fps;
  const s4End = 36 * fps;

  // Global ambient motion for bg
  const ambient = (frame / fps) * 1.2;
  const bgScale = 1.05 + Math.sin(ambient * 0.3) * 0.02;

  // Chapter indicator
  const chapter =
    frame < s1End ? 1 :
    frame < s2End ? 2 :
    frame < s3End ? 3 :
    frame < s4End ? 4 : 5;

  // Progress dots
  const progressWidth = interpolate(frame, [0, 45 * fps], [0, 100]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* Background image with ambient zoom */}
      {bgImage && (
        <AbsoluteFill>
          <Img
            src={bgImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale})`,
              filter: "brightness(0.35) saturate(110%)",
            }}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${bgColor}ee 0%, ${bgColor}99 50%, ${bgColor}ee 100%)`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Grain texture */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)`,
          pointerEvents: "none",
        }}
      />

      {/* Top chapter indicator */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div
          className="mono"
          style={{
            color: accentColor,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: 4,
          }}
        >
          {String(chapter).padStart(2, "0")} / 05
        </div>
        <div
          style={{
            color: textColor,
            fontSize: 18,
            opacity: 0.6,
            fontFamily: "monospace",
            letterSpacing: 2,
          }}
        >
          STORU
        </div>
      </div>

      {/* Progress bar bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          right: 60,
          height: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            background: accentColor,
            width: `${progressWidth}%`,
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* ═══ ESCENA 1 · HOOK (0-6s) ═══ */}
      <Sequence from={0} durationInFrames={s1End}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <div
            style={{
              transform: `translateY(${interpolate(
                fadeInSpring(frame, fps, 0),
                [0, 1],
                [40, 0]
              )}px)`,
              opacity: fadeInSpring(frame, fps, 0),
              textAlign: "center",
              maxWidth: 960,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: accentColor,
                fontFamily: "monospace",
                letterSpacing: 3,
                marginBottom: 30,
                opacity: 0.8,
              }}
            >
              ESCUCHAME 45 SEGUNDOS
            </div>
            <div
              style={{
                color: textColor,
                fontSize: 88,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -3,
              }}
            >
              {hook}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ ESCENA 2 · PROBLEMA (6-16s) ═══ */}
      <Sequence from={s1End} durationInFrames={s2End - s1End}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <div
            style={{
              transform: `translateX(${interpolate(
                fadeInSpring(frame, fps, s1End),
                [0, 1],
                [-50, 0]
              )}px)`,
              opacity: fadeInSpring(frame, fps, s1End),
              maxWidth: 960,
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "#ff3b5c",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                fontFamily: "monospace",
                marginBottom: 30,
              }}
            >
              EL PROBLEMA
            </div>
            <div
              style={{
                color: textColor,
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: -1,
              }}
            >
              {problem}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ ESCENA 3 · INSIGHT (16-26s) ═══ */}
      <Sequence from={s2End} durationInFrames={s3End - s2End}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <div
            style={{
              transform: `scale(${interpolate(
                fadeInSpring(frame, fps, s2End),
                [0, 1],
                [0.9, 1]
              )})`,
              opacity: fadeInSpring(frame, fps, s2End),
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: accentColor,
                color: bgColor,
                padding: "10px 24px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                fontFamily: "monospace",
                marginBottom: 30,
              }}
            >
              LA REVELACIÓN
            </div>
            <div
              style={{
                color: textColor,
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: -2,
                textShadow: `0 0 40px ${accentColor}33`,
              }}
            >
              {insight}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ ESCENA 4 · PRUEBA (26-36s) ═══ */}
      <Sequence from={s3End} durationInFrames={s4End - s3End}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <div
            style={{
              background: textColor,
              color: bgColor,
              padding: 60,
              borderRadius: 28,
              maxWidth: 900,
              transform: `rotate(${interpolate(
                fadeInSpring(frame, fps, s3End),
                [0, 1],
                [-3, 0]
              )}deg) translateY(${interpolate(
                fadeInSpring(frame, fps, s3End),
                [0, 1],
                [60, 0]
              )}px)`,
              opacity: fadeInSpring(frame, fps, s3End),
              boxShadow: `0 30px 80px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: "#888",
                fontFamily: "monospace",
                letterSpacing: 3,
                marginBottom: 24,
              }}
            >
              CASO REAL · PRUEBA
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: -1,
              }}
            >
              {proof}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ ESCENA 5 · CTA (36-45s) ═══ */}
      <Sequence from={s4End}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: textColor,
              textAlign: "center",
              lineHeight: 1.1,
              letterSpacing: -2,
              opacity: fadeInSpring(frame, fps, s4End),
              transform: `translateY(${interpolate(
                fadeInSpring(frame, fps, s4End),
                [0, 1],
                [30, 0]
              )}px)`,
              maxWidth: 900,
            }}
          >
            {cta}
          </div>
          <div
            style={{
              fontSize: 120,
              color: accentColor,
              transform: `translateY(${Math.sin(frame / 6) * 14}px) scale(${fadeInSpring(
                frame,
                fps,
                s4End + fps
              )})`,
            }}
          >
            ↓
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
