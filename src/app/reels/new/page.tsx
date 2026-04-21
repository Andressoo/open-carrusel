"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Film, Save, ArrowLeft, Play, Zap, Repeat, Download, ArrowRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { TikTokHook } from "@/lib/remotion/TikTokHook";
import { BeforeAfter } from "@/lib/remotion/BeforeAfter";
import { ViralManifesto60s } from "@/lib/remotion/ViralManifesto60s";

const Player = dynamic(
  () => import("@remotion/player").then((m) => m.Player),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[9/16] bg-surface rounded-lg grid place-items-center text-xs text-muted-foreground">
        Cargando player…
      </div>
    ),
  }
);

type Project = { slug: string; name: string; icon?: string };
type TemplateKey = "TikTokHook" | "BeforeAfter" | "ViralManifesto60s";

const templates: Array<{
  key: TemplateKey;
  name: string;
  duration: number;
  icon: React.ReactNode;
  desc: string;
}> = [
  {
    key: "TikTokHook",
    name: "Hook + CTA",
    duration: 10,
    icon: <Zap className="h-4 w-4" />,
    desc: "Hook 0-2s · body 2-6s · CTA 6-10s",
  },
  {
    key: "BeforeAfter",
    name: "Antes/Después",
    duration: 8,
    icon: <Repeat className="h-4 w-4" />,
    desc: "Transformación visual · 8s · wipe",
  },
  {
    key: "ViralManifesto60s",
    name: "Manifesto 60s",
    duration: 60,
    icon: <Film className="h-4 w-4" />,
    desc: "Hook · panorama · reframe · 3 casos · framework · CTA",
  },
];

export default function NewReelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("set");
  const topicParam = searchParams.get("topic");
  const ctaParam = searchParams.get("cta");

  const [project, setProject] = useState<Project | null>(null);
  const [template, setTemplate] = useState<TemplateKey>("TikTokHook");
  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);

  // TikTokHook state (pre-filled from set params if present)
  const [hook, setHook] = useState(topicParam || "Deja de rebajar.");
  const [body, setBody] = useState("Empezá a diseñar incentivos que hagan que el cliente vuelva.");
  const [cta, setCta] = useState(ctaParam ? `Comentá ${ctaParam}` : "Comentá EXPERIMENTO");

  // BeforeAfter state
  const [beforeLabel, setBeforeLabel] = useState("ANTES");
  const [beforeValue, setBeforeValue] = useState("12% retención");
  const [afterLabel, setAfterLabel] = useState("AHORA");
  const [afterValue, setAfterValue] = useState("73% retención");
  const [brandName, setBrandName] = useState("Tribu Fit");
  const [tagline, setTagline] = useState("Reemplazamos mes gratis por propósito");

  // Shared colors
  const [accentColor, setAccentColor] = useState("#F8C644");
  const [bgColor, setBgColor] = useState("#0E0D12");
  const [textColor, setTextColor] = useState("#FFFFFF");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const p = d.projects?.find((x: Project) => x.slug === d.active);
        setProject(p || null);
        fetch("/api/brand")
          .then((r) => r.json())
          .then((brand) => {
            if (brand?.colors?.accent) setAccentColor(brand.colors.accent);
            if (brand?.colors?.primary) setBgColor(brand.colors.primary);
            if (brand?.name) setBrandName(brand.name);
          })
          .catch(() => {});
      });
  }, []);

  const currentTemplate = templates.find((t) => t.key === template)!;
  const durationInFrames = currentTemplate.duration * 30;

  const getProps = () => {
    if (template === "TikTokHook") {
      return { hook, body, cta, accentColor, bgColor, textColor };
    }
    if (template === "ViralManifesto60s") {
      return { accentColor, bgColor };
    }
    return {
      beforeLabel,
      beforeValue,
      afterLabel,
      afterValue,
      brandName,
      tagline,
      accentColor,
      bgColor,
    };
  };

  const getComponent = () => {
    if (template === "TikTokHook") return TikTokHook;
    if (template === "BeforeAfter") return BeforeAfter;
    return ViralManifesto60s;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          props: getProps(),
          duration: currentTemplate.duration,
          fps: 30,
          aspectRatio: "9:16",
        }),
      });
      if (res.ok) {
        const reel = await res.json();
        // Link back to set if arrived from a set
        if (setId && reel.id) {
          await fetch("/api/content-sets", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: setId,
              piece: "reel",
              updates: { id: reel.id, status: "draft" },
            }),
          }).catch(() => {});
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRender = async () => {
    setRendering(true);
    setRenderUrl(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: template,
          inputProps: getProps(),
          reelId: `draft-${template}`,
        }),
      });
      const data = await res.json();
      if (data.url) setRenderUrl(data.url);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar showBack />
      <div className="flex-1 overflow-hidden flex">
        {/* Controls · left */}
        <div className="w-96 border-r border-border overflow-y-auto p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="h-4 w-4 text-accent" />
              <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                Reel editor · Remotion
              </div>
            </div>
            <h1 className="text-xl font-bold">Nuevo reel</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Proyecto: {project?.icon} {project?.name || "…"}
            </p>
          </div>

          {/* Template picker */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTemplate(t.key)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    template === t.key
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-accent">{t.icon}</span>
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields per template */}
          {template === "TikTokHook" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Hook · 0-2s
                </label>
                <textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Body · 2-6s
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  CTA · 6-10s
                </label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Marca
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Antes · label
                  </label>
                  <input
                    type="text"
                    value={beforeLabel}
                    onChange={(e) => setBeforeLabel(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-surface/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Antes · valor
                  </label>
                  <input
                    type="text"
                    value={beforeValue}
                    onChange={(e) => setBeforeValue(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-surface/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Ahora · label
                  </label>
                  <input
                    type="text"
                    value={afterLabel}
                    onChange={(e) => setAfterLabel(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-surface/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Ahora · valor
                  </label>
                  <input
                    type="text"
                    value={afterValue}
                    onChange={(e) => setAfterValue(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-surface/40"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Tagline
                </label>
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent resize-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Acento
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Fondo
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent"
              />
            </div>
            {template === "TikTokHook" && (
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Texto
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            {setId && (
              <div className="text-[11px] font-mono text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 leading-snug">
                🔗 Linkeado al set · se marca &quot;draft&quot; al guardar
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="accent"
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar reel"}
            </Button>
            <Button
              onClick={handleRender}
              disabled={rendering}
              variant="outline"
              className="w-full gap-2"
            >
              {rendering ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Renderizando MP4…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Renderizar MP4
                </>
              )}
            </Button>
            {renderUrl && (
              <a
                href={renderUrl}
                download
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/15"
              >
                <Download className="h-4 w-4" />
                Descargar MP4
              </a>
            )}
            {setId && saved && (
              <Button
                onClick={() => router.push(`/set/${setId}`)}
                variant="outline"
                className="w-full gap-2"
              >
                Volver al set
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Link href={setId ? `/set/${setId}` : "/reels"}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                {setId ? "Volver al set" : "Volver a reels"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview · right */}
        <div className="flex-1 bg-surface/20 grid place-items-center p-8 overflow-auto">
          <div className="max-w-sm w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
              <Player
                component={getComponent()}
                inputProps={getProps() as any}
                durationInFrames={durationInFrames}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                style={{ width: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>
            <div className="text-center mt-3 text-xs text-muted-foreground font-mono tracking-wider">
              1080×1920 · 9:16 · {currentTemplate.duration}s · 30fps ·{" "}
              <span className="text-accent">{currentTemplate.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
