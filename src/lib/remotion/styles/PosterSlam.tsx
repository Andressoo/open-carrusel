import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";

export type PosterSlamProps = {
  hook: string;
  body: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const PosterSlamSchema = {
  hook: "ESTO APENAS EMPIEZA",
  body: "50 experimentos en 50 días con comercios colombianos.",
  cta: "Comentá MANIFIESTO",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

export const PosterSlam: React.FC<PosterSlamProps> = ({
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

  // Big dramatic slam on hook · scale from 3 to 1 with bounce
  const slam = spring({ frame, fps, from: 3.2, to: 1, config: { damping: 8, stiffness: 140, mass: 1.2 } });
  const hookShake = frame < fps * 0.5 ? Math.sin(frame * 2) * 6 : 0;

  const bodyT = spring({ frame: frame - fps * 3, fps, config: { damping: 14 } });
  const ctaT = spring({ frame: frame - fps * 7, fps, config: { damping: 12 } });

  // BG zoom
  const bgScale = interpolate(frame, [0, fps * 10], [1.1, 1.35]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* Zoomed bg image */}
      {bgImage && (
        <AbsoluteFill>
          <Img
            src={bgImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale}) rotate(-2deg)`,
              filter: "brightness(0.4) saturate(130%) contrast(120%)",
            }}
          />
          <AbsoluteFill style={{ background: `linear-gradient(135deg, ${accentColor}33 0%, transparent 50%, ${bgColor}aa 100%)` }} />
        </AbsoluteFill>
      )}

      {/* Diagonal accent stripe */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-20%",
          right: "-20%",
          height: 180,
          background: accentColor,
          transform: `rotate(-8deg) scaleX(${spring({ frame, fps, config: { damping: 14 } })})`,
          zIndex: 1,
          boxShadow: `0 10px 30px ${accentColor}44`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          zIndex: 3,
        }}
      >
        {frame < fps * 3 && (
          <div
            style={{
              transform: `scale(${slam}) translate(${hookShake}px, ${hookShake}px)`,
              textAlign: "center",
              fontSize: 130,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: -4,
              color: textColor,
              textShadow: `6px 6px 0 ${bgColor}, 12px 12px 40px rgba(0,0,0,0.8)`,
              textTransform: "uppercase",
            }}
          >
            {hook}
          </div>
        )}

        {frame >= fps * 3 && frame < fps * 7 && (
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <div
              style={{
                fontSize: 90,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: -3,
                color: textColor,
                textShadow: `4px 4px 0 ${bgColor}`,
                textTransform: "uppercase",
                marginBottom: 40,
              }}
            >
              {hook}
            </div>
            <div
              style={{
                background: accentColor,
                color: "#0E0D12",
                padding: "30px 36px",
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.2,
                opacity: bodyT,
                transform: `translateY(${interpolate(bodyT, [0, 1], [40, 0])}px) rotate(${interpolate(bodyT, [0, 1], [-2, 0])}deg)`,
              }}
            >
              {body}
            </div>
          </div>
        )}

        {frame >= fps * 7 && (
          <div
            style={{
              textAlign: "center",
              transform: `scale(${ctaT})`,
              opacity: ctaT,
            }}
          >
            <div
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: textColor,
                marginBottom: 40,
                letterSpacing: -3,
                lineHeight: 1,
              }}
            >
              ↓
            </div>
            <div
              style={{
                display: "inline-block",
                background: accentColor,
                color: "#0E0D12",
                padding: "30px 60px",
                fontSize: 72,
                fontWeight: 900,
                borderRadius: 100,
                letterSpacing: -2,
                transform: `rotate(${-2 + Math.sin(frame / 10) * 2}deg)`,
                boxShadow: `0 20px 50px ${accentColor}88`,
              }}
            >
              {cta}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
