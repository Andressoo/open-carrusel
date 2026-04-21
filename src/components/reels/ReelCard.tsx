"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TikTokHook } from "@/lib/remotion/TikTokHook";
import { BeforeAfter } from "@/lib/remotion/BeforeAfter";
import { ViralManifesto60s } from "@/lib/remotion/ViralManifesto60s";

const Player = dynamic(
  () => import("@remotion/player").then((m) => m.Player),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[9/16] bg-black rounded-lg grid place-items-center">
        <div className="text-white/30 text-xs font-mono">cargando…</div>
      </div>
    ),
  }
);

type Reel = {
  id: string;
  template: string;
  props: Record<string, unknown>;
  duration: number;
  fps: number;
  aspectRatio: string;
  createdAt: string;
};

type Props = { reel: Reel };

const COMPONENTS = {
  TikTokHook,
  BeforeAfter,
  ViralManifesto60s,
} as const;

export function ReelCard({ reel }: Props) {
  const Component = COMPONENTS[reel.template as keyof typeof COMPONENTS];
  const durationInFrames = (reel.duration || 10) * (reel.fps || 30);
  const hookText =
    (reel.props.hook as string | undefined) ||
    (reel.props.brandName as string | undefined) ||
    reel.template;
  const subText =
    (reel.props.cta as string | undefined) ||
    (reel.props.tagline as string | undefined) ||
    `${reel.duration}s · ${reel.aspectRatio}`;

  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setRendering(true);
    setError(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: reel.template,
          props: reel.props,
          reelId: reel.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setRenderUrl(data.url);
        // Trigger automatic download
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setError(data.error || "Render falló");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-3 bg-surface/40 hover:bg-surface/60 transition-colors group">
      <div className="rounded-lg overflow-hidden bg-black mb-3 shadow-lg">
        {Component ? (
          <Player
            component={Component}
            inputProps={reel.props as never}
            durationInFrames={durationInFrames}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={reel.fps || 30}
            style={{ width: "100%" }}
            controls
            loop
          />
        ) : (
          <div className="aspect-[9/16] grid place-items-center text-white/50 text-xs font-mono">
            Template no encontrado: {reel.template}
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 px-1 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{hookText}</div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {subText}
          </div>
        </div>
        <div className="text-xs font-mono text-accent shrink-0 bg-accent/10 px-2 py-0.5 rounded-md">
          {reel.duration}s
        </div>
      </div>
      <div className="flex gap-1.5 px-1">
        <Button
          onClick={handleDownload}
          disabled={rendering}
          variant="accent"
          size="sm"
          className="flex-1 gap-1.5 h-8 text-xs"
        >
          {rendering ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Renderizando…
            </>
          ) : renderUrl ? (
            <>
              <Download className="h-3 w-3" />
              Descargar de nuevo
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              Descargar MP4
            </>
          )}
        </Button>
        <a
          href="http://localhost:3333"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en Remotion Studio para edición avanzada"
        >
          <Button variant="outline" size="sm" className="h-8 px-2">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
      {error && (
        <div className="mt-2 px-2 py-1.5 bg-destructive/10 text-destructive text-[10px] rounded-md">
          {error}
        </div>
      )}
      <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">
        {reel.template} · {reel.aspectRatio}
      </div>
    </div>
  );
}
