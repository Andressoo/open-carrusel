import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";

export type TypewriterProps = {
  hook: string;
  body: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const TypewriterSchema = {
  hook: "Si no tenés este framework, estás adivinando.",
  body: "Te cuento el framework que uso con comercios en 3 ciudades. Ordena qué campaña lanzar según tu objetivo.",
  cta: "Comentá FRAMEWORK",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

export const Typewriter: React.FC<TypewriterProps> = ({
  hook,
  body,
  cta,
  accentColor,
  bgColor,
  textColor,
  bgImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal-like typing effect
  const charsPerSec = 28;
  const hookChars = Math.min(hook.length, Math.floor((frame / fps) * charsPerSec));
  const bodyStart = fps * 2.5;
  const bodyChars = frame > bodyStart ? Math.min(body.length, Math.floor(((frame - bodyStart) / fps) * charsPerSec)) : 0;
  const ctaStart = fps * 7;
  const ctaT = spring({ frame: frame - ctaStart, fps, config: { damping: 14 } });

  // Cursor blink
  const cursorVisible = Math.floor(frame / 12) % 2 === 0;

  // Noise / parallax bg
  const bgOffset = (frame / fps) * 8;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Animated bg image (slow zoom + pan) */}
      {bgImage && (
        <AbsoluteFill>
          <Img
            src={bgImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(2px) saturate(60%) brightness(0.4)",
              transform: `scale(${1.1 + frame * 0.0006}) translate(${-bgOffset}px, ${-bgOffset / 2}px)`,
              opacity: 0.45,
            }}
          />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bgColor}cc 0%, ${bgColor}88 50%, ${bgColor}ee 100%)` }} />
        </AbsoluteFill>
      )}

      {/* Mono-grid texture */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(90deg, transparent 0px, transparent 50px, rgba(255,255,255,0.025) 50px, rgba(255,255,255,0.025) 51px), repeating-linear-gradient(0deg, transparent 0px, transparent 50px, rgba(255,255,255,0.025) 50px, rgba(255,255,255,0.025) 51px)`,
          pointerEvents: "none",
        }}
      />

      {/* Terminal prompt header */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          color: accentColor,
          fontFamily: "monospace",
          fontSize: 28,
          letterSpacing: 2,
          opacity: 0.7,
        }}
      >
        ~/storu-studio · ./pensarlo.sh
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          gap: 40,
          fontFamily: "monospace",
        }}
      >
        {/* Hook: typing */}
        <div
          style={{
            color: textColor,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
            minHeight: 200,
          }}
        >
          <span style={{ color: accentColor, marginRight: 20 }}>&gt;</span>
          {hook.slice(0, hookChars)}
          {hookChars < hook.length && cursorVisible && (
            <span style={{ color: accentColor }}>▊</span>
          )}
        </div>

        {/* Body: typing after 2.5s */}
        {frame >= bodyStart && (
          <div
            style={{
              color: textColor,
              fontSize: 44,
              fontWeight: 500,
              lineHeight: 1.4,
              opacity: 0.85,
              minHeight: 160,
            }}
          >
            <span style={{ color: accentColor, marginRight: 14 }}>//</span>
            {body.slice(0, bodyChars)}
            {bodyChars > 0 && bodyChars < body.length && cursorVisible && (
              <span style={{ color: accentColor }}>▊</span>
            )}
          </div>
        )}

        {/* CTA appears at 7s */}
        {frame >= ctaStart && (
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: ctaT,
              transform: `translateX(${interpolate(ctaT, [0, 1], [-30, 0])}px)`,
            }}
          >
            <div
              style={{
                background: accentColor,
                color: "#0E0D12",
                padding: "20px 36px",
                fontSize: 42,
                fontWeight: 900,
                borderRadius: 8,
                letterSpacing: -1,
              }}
            >
              {cta}
            </div>
            <div style={{ fontSize: 50, color: accentColor }}>→</div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
