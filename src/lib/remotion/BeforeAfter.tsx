import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type BeforeAfterProps = {
  beforeLabel: string;
  beforeValue: string;
  afterLabel: string;
  afterValue: string;
  brandName: string;
  tagline: string;
  accentColor: string;
  bgColor: string;
};

export const BeforeAfterSchema = {
  beforeLabel: "ANTES",
  beforeValue: "12% retención",
  afterLabel: "AHORA",
  afterValue: "73% retención",
  brandName: "Tribu Fit",
  tagline: "Reemplazamos mes gratis por propósito",
  accentColor: "#F8C644",
  bgColor: "#0E0D12",
} as const;

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeLabel,
  beforeValue,
  afterLabel,
  afterValue,
  brandName,
  tagline,
  accentColor,
  bgColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps, config: { damping: 14 } });
  const beforeOp = spring({ frame: frame - fps * 1, fps, config: { damping: 14 } });
  const afterOp = spring({ frame: frame - fps * 3, fps, config: { damping: 14 } });
  const taglineOp = spring({ frame: frame - fps * 5, fps, config: { damping: 14 } });
  const brandOp = spring({ frame: frame - fps * 6.5, fps, config: { damping: 14 } });

  const wipeProgress = spring({
    frame: frame - fps * 2.5,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, fontFamily: "Poppins, sans-serif" }}>
      {/* Top title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: accentColor,
          fontSize: 32,
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 800,
          opacity: titleOp,
        }}
      >
        — {brandName} —
      </div>

      {/* BEFORE block · top half */}
      <Sequence from={fps * 1}>
        <div
          style={{
            position: "absolute",
            top: 220,
            left: 60,
            right: 60,
            opacity: beforeOp,
            transform: `translateX(${(1 - beforeOp) * -40}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily: "JetBrains Mono, monospace",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.3em",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {beforeLabel}
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "rgba(255,255,255,0.55)",
              textDecoration: "line-through",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {beforeValue}
          </div>
        </div>
      </Sequence>

      {/* Diagonal wipe divider */}
      <Sequence from={fps * 2}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            transform: `scaleX(${wipeProgress})`,
            transformOrigin: "left center",
            opacity: 0.9,
            boxShadow: `0 0 40px ${accentColor}`,
          }}
        />
      </Sequence>

      {/* AFTER block · bottom half */}
      <Sequence from={fps * 3}>
        <div
          style={{
            position: "absolute",
            bottom: 340,
            left: 60,
            right: 60,
            opacity: afterOp,
            transform: `translateX(${(1 - afterOp) * 40}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily: "JetBrains Mono, monospace",
              color: accentColor,
              letterSpacing: "0.3em",
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            → {afterLabel}
          </div>
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              color: accentColor,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              textShadow: `0 4px 40px ${accentColor}60`,
            }}
          >
            {afterValue}
          </div>
        </div>
      </Sequence>

      {/* Tagline */}
      <Sequence from={fps * 5}>
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 60,
            right: 60,
            opacity: taglineOp,
            transform: `translateY(${(1 - taglineOp) * 20}px)`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 300,
              fontStyle: "italic",
              color: "white",
              lineHeight: 1.25,
              maxWidth: "85%",
            }}
          >
            {tagline}
          </div>
        </div>
      </Sequence>

      {/* Storu watermark */}
      <Sequence from={fps * 6.5}>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: brandOp,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontFamily: "JetBrains Mono, monospace",
              color: `${accentColor}`,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            storu.link · invierte en tus clientes
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
