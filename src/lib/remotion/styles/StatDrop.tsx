import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";

export type StatDropProps = {
  hook: string;
  body: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const StatDropSchema = {
  hook: "3x",
  body: "Más DMs calificados sin bajar precio.",
  cta: "Comentá DATOS",
  accentColor: "#F8C644",
  bgColor: "#5635FD",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

export const StatDrop: React.FC<StatDropProps> = ({
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

  // Stat zoom-in explosion
  const statScale = spring({ frame, fps, from: 0.1, to: 1, config: { damping: 10, stiffness: 120 } });
  const statRotate = interpolate(frame, [0, fps * 0.6], [-20, 0], { extrapolateRight: "clamp" });

  // Body slides in
  const bodyT = spring({ frame: frame - fps * 2.5, fps, config: { damping: 16 } });

  // CTA floats up
  const ctaT = spring({ frame: frame - fps * 6, fps, config: { damping: 14 } });

  // Ambient rotation
  const ambient = (frame / fps) * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Radial gradient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(ambient) * 15}% ${50 + Math.cos(ambient) * 15}%, ${accentColor}55, transparent 60%)`,
        }}
      />

      {/* Bg image muted */}
      {bgImage && (
        <AbsoluteFill style={{ opacity: 0.15, mixBlendMode: "overlay" }}>
          <Img src={bgImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}

      {/* Main stat · giant */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 80,
          gap: 40,
        }}
      >
        {frame < fps * 2.5 && (
          <div
            style={{
              fontSize: 380,
              fontWeight: 900,
              color: accentColor,
              transform: `scale(${statScale}) rotate(${statRotate}deg)`,
              lineHeight: 0.9,
              letterSpacing: -12,
              textShadow: `0 0 80px ${accentColor}88, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {hook}
          </div>
        )}

        {frame >= fps * 2.5 && frame < fps * 6 && (
          <>
            <div
              style={{
                fontSize: 260,
                fontWeight: 900,
                color: accentColor,
                lineHeight: 0.9,
                letterSpacing: -10,
                textShadow: `0 0 60px ${accentColor}66`,
              }}
            >
              {hook}
            </div>
            <div
              style={{
                fontSize: 54,
                fontWeight: 800,
                color: textColor,
                textAlign: "center",
                maxWidth: 900,
                opacity: bodyT,
                transform: `translateY(${interpolate(bodyT, [0, 1], [40, 0])}px)`,
                lineHeight: 1.2,
              }}
            >
              {body}
            </div>
          </>
        )}

        {frame >= fps * 6 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 30,
              transform: `translateY(${interpolate(ctaT, [0, 1], [60, 0])}px)`,
              opacity: ctaT,
            }}
          >
            <div
              style={{
                fontSize: 200,
                fontWeight: 900,
                color: accentColor,
                lineHeight: 0.9,
                letterSpacing: -8,
              }}
            >
              {hook}
            </div>
            <div
              style={{
                background: accentColor,
                color: "#0E0D12",
                padding: "22px 40px",
                borderRadius: 80,
                fontSize: 46,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: `0 16px 40px ${accentColor}66`,
              }}
            >
              {cta}
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* Grain */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
