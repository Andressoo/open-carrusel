import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
  Img,
} from "remotion";

export type GlitchIntroProps = {
  hook: string;
  body: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const GlitchIntroSchema = {
  hook: "Pará 2 segundos.",
  body: "Lo que te voy a contar te va a doler.",
  cta: "Comentá EXPERIMENTO",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

export const GlitchIntro: React.FC<GlitchIntroProps> = ({
  hook,
  body,
  cta,
  accentColor,
  bgColor,
  textColor,
  bgImage,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Glitch offsets (random jitter in first 18 frames)
  const glitchPhase = frame < 18;
  const glitchX = glitchPhase ? (random(`gx${frame}`) - 0.5) * 40 : 0;
  const glitchY = glitchPhase ? (random(`gy${frame}`) - 0.5) * 12 : 0;
  const glitchHue = glitchPhase ? random(`gh${frame}`) * 20 : 0;

  // Sections
  const showHook = frame < fps * 2;
  const showBody = frame >= fps * 2 && frame < fps * 6;
  const showCta = frame >= fps * 6;

  const bodyT = spring({ frame: frame - fps * 2, fps, config: { damping: 14 } });
  const ctaT = spring({ frame: frame - fps * 6, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* BG image with heavy blur + darken */}
      {bgImage && (
        <AbsoluteFill>
          <Img
            src={bgImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: `blur(28px) saturate(140%) hue-rotate(${glitchHue}deg)`,
              opacity: 0.35,
              transform: `scale(1.15)`,
            }}
          />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bgColor}dd 0%, ${bgColor}aa 50%, ${bgColor}ff 100%)` }} />
        </AbsoluteFill>
      )}

      {/* Scan lines texture */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)`,
          pointerEvents: "none",
        }}
      />

      {/* HOOK · giant glitched text */}
      {showHook && (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <div
            style={{
              position: "relative",
              transform: `translate(${glitchX}px, ${glitchY}px)`,
              textAlign: "center",
            }}
          >
            {/* RGB split shadows for glitch effect */}
            <div
              style={{
                position: "absolute",
                color: "#ff3b5c",
                fontSize: 110,
                fontWeight: 900,
                letterSpacing: -3,
                transform: `translate(${glitchPhase ? -6 : 0}px, 0)`,
                opacity: 0.75,
                mixBlendMode: "screen",
                top: 0,
                left: 0,
                width: "100%",
                lineHeight: 1,
              }}
            >
              {hook}
            </div>
            <div
              style={{
                position: "absolute",
                color: "#3bf0ff",
                fontSize: 110,
                fontWeight: 900,
                letterSpacing: -3,
                transform: `translate(${glitchPhase ? 6 : 0}px, 0)`,
                opacity: 0.7,
                mixBlendMode: "screen",
                top: 0,
                left: 0,
                width: "100%",
                lineHeight: 1,
              }}
            >
              {hook}
            </div>
            <div
              style={{
                position: "relative",
                color: textColor,
                fontSize: 110,
                fontWeight: 900,
                letterSpacing: -3,
                lineHeight: 1,
              }}
            >
              {hook}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* BODY · sliding card */}
      {showBody && (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <div
            style={{
              background: `${accentColor}`,
              color: "#0E0D12",
              padding: "40px 50px",
              borderRadius: 20,
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.15,
              textAlign: "center",
              transform: `translateY(${interpolate(bodyT, [0, 1], [60, 0])}px) rotate(${interpolate(bodyT, [0, 1], [-3, 0])}deg)`,
              opacity: bodyT,
              boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
            }}
          >
            {body}
          </div>
        </AbsoluteFill>
      )}

      {/* CTA · pulsing with arrow */}
      {showCta && (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, flexDirection: "column", gap: 40 }}>
          <div
            style={{
              color: textColor,
              fontSize: 80,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.1,
              letterSpacing: -2,
              transform: `scale(${ctaT})`,
              opacity: ctaT,
            }}
          >
            {cta}
          </div>
          <div
            style={{
              fontSize: 120,
              color: accentColor,
              animation: "bounce 0.6s infinite",
              transform: `translateY(${Math.sin(frame / 6) * 12}px)`,
            }}
          >
            ↓
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
