import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";

export type SplitScreenProps = {
  hook: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  bgImage?: string;
};

export const SplitScreenSchema = {
  hook: "Rebajar vs Diseñar",
  leftLabel: "ANTES",
  leftValue: "Rebaja 30%",
  rightLabel: "AHORA",
  rightValue: "Diseño incentivo",
  cta: "Comentá COMPARA",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
  bgImage: "",
} as const;

export const SplitScreen: React.FC<SplitScreenProps> = ({
  hook,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  cta,
  accentColor,
  bgColor,
  textColor,
  bgImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hookFade = spring({ frame, fps, config: { damping: 14 } });

  // Split slides in from sides at 1s
  const splitT = spring({ frame: frame - fps, fps, config: { damping: 16 } });
  const leftX = interpolate(splitT, [0, 1], [-600, 0]);
  const rightX = interpolate(splitT, [0, 1], [600, 0]);

  // Values fade in at 3s
  const valuesT = spring({ frame: frame - fps * 3, fps, config: { damping: 14 } });

  // CTA at 7s
  const ctaT = spring({ frame: frame - fps * 7, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {bgImage && (
        <AbsoluteFill style={{ opacity: 0.18 }}>
          <Img src={bgImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}

      {/* Hook header */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          padding: "0 60px",
          textAlign: "center",
          color: textColor,
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: -2,
          opacity: hookFade,
          transform: `translateY(${interpolate(hookFade, [0, 1], [-30, 0])}px)`,
          zIndex: 10,
        }}
      >
        {hook}
      </div>

      {/* Left panel */}
      <div
        style={{
          position: "absolute",
          top: 280,
          bottom: 400,
          left: 0,
          width: "50%",
          background: "#ff3b5c",
          transform: `translateX(${leftX}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 40,
          gap: 20,
          clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 4,
            opacity: 0.85,
          }}
        >
          {leftLabel}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#fff",
            textDecoration: "line-through",
            textDecorationThickness: 6,
            lineHeight: 1.1,
            opacity: valuesT,
          }}
        >
          {leftValue}
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          position: "absolute",
          top: 280,
          bottom: 400,
          right: 0,
          width: "50%",
          background: accentColor,
          transform: `translateX(${rightX}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 40,
          gap: 20,
          clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#0E0D12",
            letterSpacing: 4,
            opacity: 0.85,
          }}
        >
          {rightLabel}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#0E0D12",
            lineHeight: 1.1,
            opacity: valuesT,
          }}
        >
          {rightValue}
        </div>
      </div>

      {/* Divider · animated */}
      <div
        style={{
          position: "absolute",
          top: 280,
          bottom: 400,
          left: "50%",
          width: 4,
          background: textColor,
          transform: `translateX(-2px) scaleY(${hookFade})`,
          opacity: 0.9,
          zIndex: 5,
        }}
      />

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `scale(${ctaT}) translateY(${interpolate(ctaT, [0, 1], [40, 0])}px)`,
          opacity: ctaT,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: textColor,
            color: bgColor,
            padding: "24px 48px",
            borderRadius: 80,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: -1,
            boxShadow: `0 20px 50px rgba(0,0,0,0.4)`,
          }}
        >
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
