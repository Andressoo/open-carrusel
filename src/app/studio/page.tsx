"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Film, Play, Download } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

// Storu native
import { TikTokHook } from "@/lib/remotion/TikTokHook";
import { BeforeAfter } from "@/lib/remotion/BeforeAfter";
import { ViralManifesto60s } from "@/lib/remotion/ViralManifesto60s";

// EPM templates (unified)
import { TikTokVideo } from "@/epm/templates/social/TikTokVideo";
import { InstagramReel } from "@/epm/templates/social/InstagramReel";
import { YouTubeShort } from "@/epm/templates/social/YouTubeShort";
import { Presentation } from "@/epm/templates/content/Presentation";
import { Testimonial } from "@/epm/templates/content/Testimonial";
import { Announcement } from "@/epm/templates/promo/Announcement";
import { ShowcaseComposition } from "@/epm/compositions/Showcase";
import { BeforeAfterDemo } from "@/epm/compositions/BeforeAfterDemo";

const Player = dynamic(
  () => import("@remotion/player").then((m) => m.Player),
  { ssr: false, loading: () => <div className="aspect-[9/16] bg-surface rounded-lg" /> }
);

type TemplateDef = {
  key: string;
  remotionId: string;
  family: "Storu" | "Social" | "Content" | "Promo";
  name: string;
  desc: string;
  duration: number; // seconds
  fps: number;
  width: number;
  height: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultProps: Record<string, any>;
};

const TEMPLATES: TemplateDef[] = [
  // Storu native
  {
    key: "tiktok-hook",
    remotionId: "TikTokHook",
    family: "Storu",
    name: "Hook + CTA · 10s",
    desc: "Gancho Storu · Hook · body · CTA con keyword",
    duration: 10,
    fps: 30,
    width: 1080,
    height: 1920,
    component: TikTokHook,
    defaultProps: {
      hook: "Deja de rebajar.",
      body: "Empezá a diseñar incentivos que hagan que el cliente vuelva.",
      cta: "Comentá EXPERIMENTO",
      accentColor: "#F8C644",
      bgColor: "#0E0D12",
      textColor: "#FFFFFF",
    },
  },
  {
    key: "before-after",
    remotionId: "BeforeAfter",
    family: "Storu",
    name: "Antes / Después · 8s",
    desc: "Wipe diagonal con valor tachado",
    duration: 8,
    fps: 30,
    width: 1080,
    height: 1920,
    component: BeforeAfter,
    defaultProps: {
      beforeLabel: "ANTES",
      beforeValue: "12% retención",
      afterLabel: "AHORA",
      afterValue: "73% retención",
      brandName: "Tribu Fit",
      tagline: "Reemplazamos mes gratis por propósito",
      accentColor: "#F8C644",
      bgColor: "#0E0D12",
      textColor: "#FFFFFF",
    },
  },
  {
    key: "manifesto",
    remotionId: "ViralManifesto60s",
    family: "Storu",
    name: "Manifesto 60s",
    desc: "Hook · panorama · reframe · 3 casos · framework · CTA",
    duration: 60,
    fps: 30,
    width: 1080,
    height: 1920,
    component: ViralManifesto60s,
    defaultProps: {
      brandName: "Storu",
      tagline: "Invierte en tus clientes, no en alcance",
      accentColor: "#F8C644",
      bgColor: "#0E0D12",
      textColor: "#FFFFFF",
    },
  },
  // EPM · Social
  {
    key: "epm-tiktok",
    remotionId: "EPM_TikTok",
    family: "Social",
    name: "TikTok · EPM",
    desc: "Template social EPM · hook + body + CTA",
    duration: 9,
    fps: 30,
    width: 1080,
    height: 1920,
    component: TikTokVideo,
    defaultProps: {
      hook: "¿Sabías esto?",
      body: "Los martes son tus mejores días si los diseñás.",
      cta: "Comentá MARTES",
    },
  },
  {
    key: "epm-instagram",
    remotionId: "EPM_InstagramReel",
    family: "Social",
    name: "Instagram Reel · EPM",
    desc: "Headline + subtext + brand name",
    duration: 8,
    fps: 30,
    width: 1080,
    height: 1920,
    component: InstagramReel,
    defaultProps: {
      headline: "Tu headline acá",
      subtext: "Texto de apoyo",
      brandName: "Storu",
    },
  },
  {
    key: "epm-youtube",
    remotionId: "EPM_YouTubeShort",
    family: "Social",
    name: "YouTube Short · EPM",
    desc: "Título + subtítulo · vertical",
    duration: 10,
    fps: 30,
    width: 1080,
    height: 1920,
    component: YouTubeShort,
    defaultProps: {
      title: "Título",
      subtitle: "Subtítulo",
    },
  },
  // EPM · Content
  {
    key: "epm-presentation",
    remotionId: "EPM_Presentation",
    family: "Content",
    name: "Presentation · EPM",
    desc: "Slides horizontales · deck animado",
    duration: 15,
    fps: 30,
    width: 1920,
    height: 1080,
    component: Presentation,
    defaultProps: {
      slides: [
        { title: "Intro", body: "Slide uno" },
        { title: "Problema", body: "Qué estamos resolviendo" },
        { title: "Solución", body: "Cómo lo resolvemos" },
      ],
    },
  },
  {
    key: "epm-testimonial",
    remotionId: "EPM_Testimonial",
    family: "Content",
    name: "Testimonial · EPM",
    desc: "Cita · autor · rol",
    duration: 6,
    fps: 30,
    width: 1920,
    height: 1080,
    component: Testimonial,
    defaultProps: {
      quote: "Cambió cómo vendemos los martes.",
      author: "Cliente real",
      role: "Dueño · restaurante",
    },
  },
  // EPM · Promo
  {
    key: "epm-announcement",
    remotionId: "EPM_Announcement",
    family: "Promo",
    name: "Announcement · EPM",
    desc: "Pre-title · title · subtitle · CTA",
    duration: 10,
    fps: 30,
    width: 1920,
    height: 1080,
    component: Announcement,
    defaultProps: {
      preTitle: "Presentamos",
      title: "Algo nuevo",
      subtitle: "El futuro llegó",
      cta: "Conocé más",
    },
  },
  {
    key: "epm-ba",
    remotionId: "EPM_BeforeAfter",
    family: "Promo",
    name: "Before / After · EPM",
    desc: "Horizontal · stats comparison",
    duration: 6,
    fps: 30,
    width: 1920,
    height: 1080,
    component: BeforeAfterDemo,
    defaultProps: {},
  },
  {
    key: "epm-showcase",
    remotionId: "EPM_Showcase",
    family: "Promo",
    name: "Showcase · EPM",
    desc: "Demo showcase full brand",
    duration: 10,
    fps: 30,
    width: 1920,
    height: 1080,
    component: ShowcaseComposition,
    defaultProps: {},
  },
];

const FAMILY_LABELS = {
  Storu: "Storu nativo",
  Social: "Social · EPM",
  Content: "Content · EPM",
  Promo: "Promo · EPM",
} as const;

export default function StudioPage() {
  const [selected, setSelected] = useState<TemplateDef>(TEMPLATES[0]);
  const [rendering, setRendering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const renderMP4 = async () => {
    setRendering(true);
    setDownloadUrl(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: selected.remotionId,
          inputProps: selected.defaultProps,
          reelId: `studio-${selected.key}`,
        }),
      });
      const data = await res.json();
      if (data.url) setDownloadUrl(data.url);
    } finally {
      setRendering(false);
    }
  };

  const families = (Object.keys(FAMILY_LABELS) as Array<keyof typeof FAMILY_LABELS>);

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Studio · Storu + Editor Pro Max</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Film className="h-6 w-6 text-accent" />
            Studio unificado
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            12 templates · Storu nativo + Editor Pro Max · preview con Player · render MP4 directo.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Template catalog */}
          <div className="space-y-4">
            {families.map((fam) => {
              const items = TEMPLATES.filter((t) => t.family === fam);
              if (!items.length) return null;
              return (
                <div key={fam}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    {FAMILY_LABELS[fam]} · {items.length}
                  </div>
                  <div className="space-y-1.5">
                    {items.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => {
                          setSelected(t);
                          setDownloadUrl(null);
                        }}
                        className={`w-full text-left border rounded-lg p-3 transition-colors ${
                          selected.key === t.key
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/40 hover:bg-surface/50"
                        }`}
                      >
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {t.desc}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground/70 mt-1">
                          {t.duration}s · {t.width}×{t.height}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview + render */}
          <div>
            <div className="border border-border rounded-xl p-4 bg-surface/30">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {FAMILY_LABELS[selected.family]}
                  </div>
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.desc}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={renderMP4}
                    variant="accent"
                    disabled={rendering}
                    className="gap-2"
                  >
                    {rendering ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        Renderizando…
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Render MP4
                      </>
                    )}
                  </Button>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/15"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </a>
                  )}
                </div>
              </div>

              <div className="mx-auto" style={{ maxWidth: selected.width > selected.height ? "100%" : 420 }}>
                <Player
                  key={selected.key}
                  component={selected.component}
                  durationInFrames={selected.duration * selected.fps}
                  fps={selected.fps}
                  compositionWidth={selected.width}
                  compositionHeight={selected.height}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  inputProps={selected.defaultProps as any}
                  controls
                  loop
                  autoPlay
                  style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                <div className="border border-border rounded-lg p-2 bg-background">
                  <div className="text-muted-foreground font-mono uppercase tracking-wider text-[9px]">Duración</div>
                  <div className="font-semibold">{selected.duration}s</div>
                </div>
                <div className="border border-border rounded-lg p-2 bg-background">
                  <div className="text-muted-foreground font-mono uppercase tracking-wider text-[9px]">Dimensiones</div>
                  <div className="font-semibold">{selected.width}×{selected.height}</div>
                </div>
                <div className="border border-border rounded-lg p-2 bg-background">
                  <div className="text-muted-foreground font-mono uppercase tracking-wider text-[9px]">ID Remotion</div>
                  <div className="font-mono font-semibold text-[10px]">{selected.remotionId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
