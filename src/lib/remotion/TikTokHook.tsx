import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type TikTokHookProps = {
  hook: string;
  body: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
};

export const TikTokHookSchema = {
  hook: "Deja de rebajar.",
  body: "Empezá a diseñar incentivos que hagan que el cliente vuelva.",
  cta: "Comentá EXPERIMENTO",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
  textColor: "#FFFFFF",
} as const;

export const TikTokHook: React.FC<TikTokHookProps> = ({
  hook,
  body,
  cta,
  accentColor,
  bgColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hookOpacity = spring({ frame, fps, config: { damping: 12 } });
  const hookScale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 14 },
  });

  const bodyStart = Math.floor(fps * 2);
  const bodyProgress = spring({
    frame: frame - bodyStart,
    fps,
    config: { damping: 14 },
  });

  const ctaStart = Math.floor(fps * 3);
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    config: { damping: 14 },
  });

  const bgPulse = Math.sin((frame / fps) * 1.5) * 0.02 + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, fontFamily: "Poppins, sans-serif" }}>
      {/* Animated radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accentColor}22 0%, transparent 60%)`,
          transform: `scale(${bgPulse})`,
        }}
      />

      {/* Grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${textColor}08 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "8%",
          width: 80,
          height: 6,
          backgroundColor: accentColor,
          borderRadius: 4,
        }}
      />

      {/* HOOK - 0-2s */}
      <Sequence from={0} durationInFrames={fps * 10}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 72px",
            opacity: hookOpacity,
            transform: `scale(${hookScale})`,
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: textColor,
              textTransform: "uppercase",
              textShadow: "0 4px 32px rgba(0,0,0,.5)",
              maxWidth: "90%",
            }}
          >
            {hook}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* BODY - 2-6s */}
      <Sequence from={bodyStart} durationInFrames={fps * 4}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 72px",
            opacity: bodyProgress,
            transform: `translateY(${(1 - bodyProgress) * 40}px)`,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.25,
              color: accentColor,
              maxWidth: "85%",
            }}
          >
            {body}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CTA - 6s+ */}
      <Sequence from={ctaStart}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: ctaProgress,
          }}
        >
          <div
            style={{
              backgroundColor: accentColor,
              color: bgColor,
              padding: "28px 48px",
              borderRadius: 20,
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              boxShadow: `0 20px 60px ${accentColor}60`,
              transform: `scale(${ctaProgress})`,
            }}
          >
            {cta}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Bottom Storu watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          textAlign: "center",
          color: `${textColor}80`,
          fontSize: 22,
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        storu.link · laboratorio de ventas
      </div>
    </AbsoluteFill>
  );
};
