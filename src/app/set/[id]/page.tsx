"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  Layers,
  Film,
  GalleryVertical,
  ExternalLink,
  Target,
  Save,
  Play,
  Download,
  Plus,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { TikTokHook } from "@/lib/remotion/TikTokHook";
import { BeforeAfter } from "@/lib/remotion/BeforeAfter";
import { ViralManifesto60s } from "@/lib/remotion/ViralManifesto60s";
import { GlitchIntro } from "@/lib/remotion/styles/GlitchIntro";
import { StatDrop } from "@/lib/remotion/styles/StatDrop";
import { SplitScreen } from "@/lib/remotion/styles/SplitScreen";
import { Typewriter } from "@/lib/remotion/styles/Typewriter";
import { PosterSlam } from "@/lib/remotion/styles/PosterSlam";

const Player = dynamic(() => import("@remotion/player").then((m) => m.Player), {
  ssr: false,
  loading: () => <div className="aspect-[9/16] bg-surface rounded-lg" />,
});

type Piece = { id: string | null; status: string };
type ContentSet = {
  id: string;
  name: string;
  topic: string;
  goal: string;
  ctaKeyword?: string;
  anchorBrand?: string;
  experimentPurpose?: string;
  hypothesis?: string;
  kpis?: string[];
  sceneDetails?: string;
  possibleCaptions?: string[];
  hashtags?: string[];
  references?: Array<{ url: string; type: string; name?: string }>;
  status?: string;
  publishDate?: string;
  story: Piece;
  carousel: Piece;
  reel: Piece;
  thread?: string;
};

type Story = {
  id: string;
  dynamic: string;
  text: string;
  options?: string[];
  accentColor?: string;
  bgColor?: string;
  setId?: string;
};

type Reel = {
  id: string;
  template: string;
  props: Record<string, unknown>;
  duration: number;
  fps: number;
  aspectRatio: string;
};

type Carousel = {
  id: string;
  name: string;
  slides: Array<{ id: string; html: string }>;
  aspectRatio: string;
};

type Tab = "overview" | "story" | "carousel" | "reel";

export default function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<ContentSet | null>(null);
  const [storyData, setStoryData] = useState<Story | null>(null);
  const [reelData, setReelData] = useState<Reel | null>(null);
  const [carouselData, setCarouselData] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  const reload = async () => {
    const d = await fetch("/api/content-sets").then((r) => r.json());
    const s = (d.sets || []).find((x: ContentSet) => x.id === id);
    setSet(s || null);
    if (s?.story?.id) {
      const stories = await fetch("/api/stories").then((r) => r.json());
      setStoryData((stories.stories || []).find((x: Story) => x.id === s.story.id) || null);
    } else {
      setStoryData(null);
    }
    if (s?.reel?.id) {
      const reels = await fetch("/api/reels").then((r) => r.json());
      setReelData((reels.reels || []).find((x: Reel) => x.id === s.reel.id) || null);
    } else {
      setReelData(null);
    }
    if (s?.carousel?.id) {
      const carousels = await fetch("/api/carousels").then((r) => r.json());
      setCarouselData((carousels.carousels || []).find((x: Carousel) => x.id === s.carousel.id) || null);
    } else {
      setCarouselData(null);
    }
  };

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
          Cargando set…
        </div>
      </div>
    );
  }
  if (!set) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">Set no encontrado</div>
            <Link href="/">
              <Button variant="outline" size="sm">Volver al dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pieces = [
    { key: "story" as const, label: "Historia", icon: <GalleryVertical className="h-4 w-4" />, piece: set.story, exists: !!storyData },
    { key: "carousel" as const, label: "Carrusel", icon: <Layers className="h-4 w-4" />, piece: set.carousel, exists: !!carouselData },
    { key: "reel" as const, label: "Reel", icon: <Film className="h-4 w-4" />, piece: set.reel, exists: !!reelData },
  ];
  const readyCount = pieces.filter((p) => p.piece.status === "ready" || p.piece.status === "published").length;
  const linkedCount = pieces.filter((p) => p.piece.id).length;
  const pct = Math.round((linkedCount / 3) * 100);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">← Volver a sets</Link>
            </div>
            <div className="flex items-center gap-2">
              <ScheduleButton set={set} onSaved={reload} />
              <ExportSetButton setId={set.id} />
            </div>
          </div>

          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                🧪 Experimento · {set.goal}
              </span>
              {set.ctaKeyword && (
                <span className="text-[10px] font-mono tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                  CTA: {set.ctaKeyword}
                </span>
              )}
              {set.anchorBrand && (
                <span className="text-[10px] font-mono tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  📍 {set.anchorBrand}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{set.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{set.topic}</p>
          </div>

          {/* Progress */}
          <div className="border border-border rounded-xl p-4 bg-surface/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                Línea coherente · {linkedCount}/3 piezas · {readyCount} listas
              </div>
              <div className="text-sm font-bold">{pct}%</div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border flex sticky top-0 bg-background z-10">
            {(["overview", "story", "carousel", "reel"] as const).map((t) => {
              const labels = {
                overview: "Overview",
                story: "📱 Historia",
                carousel: "📇 Carrusel",
                reel: "🎬 Reel",
              };
              const status =
                t === "overview"
                  ? ""
                  : t === "story"
                  ? set.story.status
                  : t === "carousel"
                  ? set.carousel.status
                  : set.reel.status;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                    tab === t
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[t]}
                  {status && status !== "pending" && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        status === "ready" || status === "published"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "overview" && <OverviewTab set={set} />}
          {tab === "story" && (
            <StoryInlineEditor set={set} story={storyData} onSaved={reload} />
          )}
          {tab === "carousel" && (
            <CarouselInlinePanel set={set} carousel={carouselData} onSaved={reload} />
          )}
          {tab === "reel" && (
            <ReelInlineEditor set={set} reel={reelData} onSaved={reload} />
          )}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════ SCHEDULE BUTTON ═══════════════════

function ScheduleButton({ set, onSaved }: { set: ContentSet; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(set.publishDate ? set.publishDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/content-sets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: set.id,
          updates: { publishDate: date || null, status: date ? "scheduled" : "draft" },
        }),
      });
      setOpen(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const formatted = set.publishDate
    ? new Date(set.publishDate).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen((v) => !v)}
        variant={formatted ? "accent" : "outline"}
        size="sm"
        className="gap-2"
      >
        📅 {formatted ? `Agendada ${formatted}` : "Agendar"}
      </Button>
      {open && (
        <div
          className="absolute right-0 mt-2 p-4 border border-border rounded-xl bg-background shadow-xl z-20 min-w-[280px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Fecha de publicación
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent mb-2"
          />
          <div className="text-[11px] text-muted-foreground mb-3 leading-snug">
            Historia día D · Carrusel D+1 · Reel D+3
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} variant="accent" size="sm" className="flex-1 gap-1">
              <Check className="h-3.5 w-3.5" />
              {saving ? "…" : "Agendar"}
            </Button>
            {set.publishDate && (
              <Button
                onClick={() => {
                  setDate("");
                  save();
                }}
                variant="ghost"
                size="sm"
              >
                Quitar
              </Button>
            )}
            <Button onClick={() => setOpen(false)} variant="ghost" size="sm">
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════ EXPORT BUTTON ═══════════════════

function ExportSetButton({ setId }: { setId: string }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch(`/api/content-sets/${setId}/export`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Export falló (${res.status})`);
        return;
      }
      const cd = res.headers.get("content-disposition") || "";
      const fnMatch = /filename="?([^"]+)"?/.exec(cd);
      const filename = fnMatch?.[1] || `set-${setId.slice(0, 8)}.zip`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message || "network error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-[11px] text-destructive">{error}</span>
      )}
      <Button
        onClick={handleExport}
        disabled={exporting}
        variant="accent"
        size="sm"
        className="gap-2"
      >
        {exporting ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Exportando…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Descargar set completo (ZIP)
          </>
        )}
      </Button>
    </div>
  );
}

// ═══════════════════ OVERVIEW ═══════════════════

function OverviewTab({ set }: { set: ContentSet }) {
  return (
    <div className="space-y-4">
      {set.thread && (
        <div className="border border-accent/30 bg-accent/5 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            🧵 Hilo conductor
          </div>
          <p className="text-sm leading-relaxed">{set.thread}</p>
        </div>
      )}
      {set.experimentPurpose && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-accent" />
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Propósito
            </div>
          </div>
          <p className="text-sm leading-relaxed">{set.experimentPurpose}</p>
          {set.hypothesis && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              <b>Hipótesis:</b> {set.hypothesis}
            </p>
          )}
        </div>
      )}
      {set.kpis && set.kpis.length > 0 && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            📊 KPIs
          </div>
          <ul className="text-sm space-y-1">
            {set.kpis.map((k, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {set.sceneDetails && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            🎬 Escena
          </div>
          <p className="text-sm leading-relaxed">{set.sceneDetails}</p>
        </div>
      )}
      {set.possibleCaptions && set.possibleCaptions.length > 0 && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            ✏️ Captions candidatas ({set.possibleCaptions.length})
          </div>
          <ul className="space-y-1.5">
            {set.possibleCaptions.map((c, i) => (
              <li key={i} className="text-sm border-l-2 border-accent/50 pl-3 py-0.5 italic">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {set.hashtags && set.hashtags.length > 0 && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            # Hashtags ({set.hashtags.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {set.hashtags.map((h, i) => (
              <span key={i} className="text-[11px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
                #{h.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </div>
      )}
      {set.references && set.references.length > 0 && (
        <div className="border border-border rounded-xl p-4 bg-surface/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            🖼 Referencias ({set.references.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {set.references.map((r, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.name || r.type}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] px-1 py-0.5 font-mono uppercase tracking-wider truncate">
                  {r.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════ STORY INLINE EDITOR ═══════════════════

const STORY_DYNAMICS = [
  { key: "poll", label: "Poll Sí/No", defaults: ["Sí", "No"] },
  { key: "quiz", label: "Quiz 4 opciones", defaults: ["A", "B", "C", "D"] },
  { key: "slider", label: "Emoji slider", defaults: [] },
  { key: "countdown", label: "Countdown", defaults: [] },
  { key: "qa", label: "Q&A sticker", defaults: [] },
  { key: "swipe", label: "Swipe-up", defaults: [] },
  { key: "ba", label: "Antes/Después", defaults: [] },
] as const;

function StoryInlineEditor({
  set,
  story,
  onSaved,
}: {
  set: ContentSet;
  story: Story | null;
  onSaved: () => void;
}) {
  const [dynamicKey, setDynamicKey] = useState(story?.dynamic || "poll");
  const [text, setText] = useState(story?.text || set.topic);
  const [options, setOptions] = useState<string[]>(story?.options || ["Sí", "No"]);
  const [accentColor, setAccentColor] = useState(story?.accentColor || "#F8C644");
  const [bgColor, setBgColor] = useState(story?.bgColor || "#0E0D12");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = STORY_DYNAMICS.find((d) => d.key === dynamicKey) || STORY_DYNAMICS[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        dynamic: dynamicKey,
        text,
        accentColor,
        bgColor,
        setId: set.id,
      };
      if (["poll", "quiz"].includes(dynamicKey)) body.options = options;

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const newStory = await res.json();
      await fetch("/api/content-sets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: set.id,
          piece: "story",
          updates: { id: newStory.id, status: "draft" },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReady = async () => {
    await fetch("/api/content-sets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: set.id,
        piece: "story",
        updates: { id: set.story.id, status: "ready" },
      }),
    });
    onSaved();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Dinámica
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STORY_DYNAMICS.map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  setDynamicKey(d.key);
                  if (d.defaults.length) setOptions([...d.defaults]);
                }}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition-colors ${
                  dynamicKey === d.key
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Texto · pregunta u hook
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent resize-none"
          />
        </div>

        {["poll", "quiz"].includes(dynamicKey) && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Opciones
            </label>
            <div className="space-y-1.5">
              {options.map((o, i) => (
                <input
                  key={i}
                  type="text"
                  value={o}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-border rounded bg-surface/40"
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
              Acento
            </label>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full h-8 rounded border border-border cursor-pointer bg-transparent"
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
              className="w-full h-8 rounded border border-border cursor-pointer bg-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            variant="accent"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando…" : saved ? "✓ Guardado" : story ? "Guardar nueva versión" : "Crear historia"}
          </Button>
          {story && set.story.status === "draft" && (
            <Button onClick={handleMarkReady} variant="outline" className="gap-2">
              <Check className="h-4 w-4" /> Marcar como lista
            </Button>
          )}
        </div>

        {set.ctaKeyword && (
          <div className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-3">
            💡 CTA del set: <code className="font-mono font-bold text-accent ml-1">{set.ctaKeyword}</code>
          </div>
        )}
      </div>

      {/* Preview */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Preview 9:16
        </div>
        <StoryPreview
          dynamic={dynamicKey}
          text={text}
          options={options}
          accentColor={accentColor}
          bgColor={bgColor}
        />
      </div>
    </div>
  );
}

function StoryPreview({
  dynamic,
  text,
  options,
  accentColor,
  bgColor,
}: {
  dynamic: string;
  text: string;
  options: string[];
  accentColor: string;
  bgColor: string;
}) {
  return (
    <div
      className="aspect-[9/16] rounded-xl overflow-hidden shadow-xl flex flex-col items-center justify-center p-5 text-center text-white"
      style={{ background: bgColor }}
    >
      <div className="text-[9px] font-mono uppercase tracking-widest mb-3" style={{ color: accentColor }}>
        {dynamic}
      </div>
      <div className="text-lg font-bold leading-snug mb-5">{text}</div>

      {(dynamic === "poll" || dynamic === "quiz") && (
        <div className="grid grid-cols-2 gap-1.5 w-full">
          {options.slice(0, 4).map((o, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "#ffffff22",
                color: "#fff",
                border: `1px solid ${accentColor}55`,
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
      {dynamic === "slider" && (
        <div className="w-full space-y-1.5">
          <div className="flex justify-between text-xl"><span>😩</span><span>😊</span></div>
          <div className="h-1.5 rounded-full" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}aa)` }} />
        </div>
      )}
      {dynamic === "countdown" && (
        <div className="text-4xl font-mono font-black px-5 py-3 rounded-xl" style={{ background: `${accentColor}22`, color: accentColor }}>
          72h
        </div>
      )}
      {dynamic === "qa" && (
        <div className="w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground" style={{ background: "#ffffff18", border: `1px solid ${accentColor}55` }}>
          Escribí tu respuesta…
        </div>
      )}
      {dynamic === "swipe" && (
        <div className="mt-3 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: accentColor, color: "#000" }}>
          Swipe ↑
        </div>
      )}
      {dynamic === "ba" && (
        <div className="w-full grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <div className="py-2 rounded-lg opacity-60" style={{ background: "#ffffff18" }}>ANTES</div>
          <div className="py-2 rounded-lg font-bold" style={{ background: accentColor, color: "#000" }}>AHORA</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════ CAROUSEL INLINE PANEL ═══════════════════

function CarouselInlinePanel({
  set,
  carousel,
  onSaved,
}: {
  set: ContentSet;
  carousel: Carousel | null;
  onSaved: () => void;
}) {
  const createCarousel = async () => {
    const res = await fetch("/api/carousels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: set.name, aspectRatio: "4:5" }),
    });
    if (!res.ok) return;
    const car = await res.json();
    await fetch("/api/content-sets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: set.id,
        piece: "carousel",
        updates: { id: car.id, status: "draft" },
      }),
    });
    onSaved();
    window.location.href = `/carousel/${car.id}?set=${set.id}`;
  };

  const markReady = async () => {
    if (!carousel) return;
    await fetch("/api/content-sets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: set.id,
        piece: "carousel",
        updates: { id: carousel.id, status: "ready" },
      }),
    });
    onSaved();
  };

  if (!carousel) {
    return (
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
        <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Sin carrusel todavía</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Creá uno y lo abrimos en el editor con chat AI. Queda linkeado a este set.
        </p>
        <Button onClick={createCarousel} variant="accent" className="gap-2">
          <Plus className="h-4 w-4" /> Crear carrusel · {set.name}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-lg">{carousel.name}</h3>
          <p className="text-xs text-muted-foreground">
            {carousel.slides.length} slides · {carousel.aspectRatio}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/carousel/${carousel.id}?set=${set.id}`}>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Editor completo
            </Button>
          </Link>
          {set.carousel.status === "draft" && (
            <Button onClick={markReady} variant="accent" className="gap-2">
              <Check className="h-4 w-4" /> Marcar como listo
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {carousel.slides.slice(0, 10).map((slide, i) => (
          <div
            key={slide.id}
            className="aspect-[4/5] border border-border rounded-lg overflow-hidden bg-surface/40 relative"
          >
            <iframe
              srcDoc={slide.html}
              sandbox=""
              title={`Slide ${i + 1}`}
              className="w-full h-full border-0 pointer-events-none"
              scrolling="no"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════ REEL INLINE EDITOR ═══════════════════

const REEL_TEMPLATES = [
  { key: "TikTokHook", label: "Hook + CTA", duration: 10, kind: "hbc" },
  { key: "GlitchIntro", label: "Glitch", duration: 10, kind: "hbc" },
  { key: "StatDrop", label: "Stat Drop", duration: 10, kind: "hbc" },
  { key: "Typewriter", label: "Typewriter", duration: 10, kind: "hbc" },
  { key: "PosterSlam", label: "Poster Slam", duration: 10, kind: "hbc" },
  { key: "SplitScreen", label: "Split Screen", duration: 10, kind: "split" },
  { key: "BeforeAfter", label: "Antes/Después", duration: 8, kind: "ba" },
  { key: "ViralManifesto60s", label: "Manifesto 60s", duration: 60, kind: "manifesto" },
] as const;

function ReelInlineEditor({
  set,
  reel,
  onSaved,
}: {
  set: ContentSet;
  reel: Reel | null;
  onSaved: () => void;
}) {
  const existingProps = (reel?.props || {}) as Record<string, string>;
  const [template, setTemplate] = useState<string>(reel?.template || "TikTokHook");
  const [hook, setHook] = useState(existingProps.hook || set.topic);
  const [bgImage, setBgImage] = useState(existingProps.bgImage || "");
  const [leftLabel] = useState(existingProps.leftLabel || "ANTES");
  const [leftValue, setLeftValue] = useState(existingProps.leftValue || "Rebajar");
  const [rightLabel] = useState(existingProps.rightLabel || "AHORA");
  const [rightValue, setRightValue] = useState(existingProps.rightValue || "Diseñar");
  const [body, setBody] = useState(
    existingProps.body || (set.possibleCaptions?.[0] ?? "Experimento real, resultado medible.")
  );
  const [cta, setCta] = useState(
    existingProps.cta || (set.ctaKeyword ? `Comentá ${set.ctaKeyword}` : "Comentá EXPERIMENTO")
  );
  const [beforeValue, setBeforeValue] = useState(existingProps.beforeValue || "Antes");
  const [afterValue, setAfterValue] = useState(existingProps.afterValue || "Ahora");
  const [brandName, setBrandName] = useState(existingProps.brandName || set.anchorBrand || "Storu");
  const [tagline, setTagline] = useState(existingProps.tagline || set.topic);
  const [accentColor, setAccentColor] = useState(existingProps.accentColor || "#F8C644");
  const [bgColor, setBgColor] = useState(existingProps.bgColor || "#0E0D12");
  const [textColor, setTextColor] = useState(existingProps.textColor || "#FFFFFF");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);

  const currentTpl = REEL_TEMPLATES.find((t) => t.key === template) || REEL_TEMPLATES[0];

  const getProps = useMemo(() => {
    return () => {
      const hbc = { hook, body, cta, accentColor, bgColor, textColor, bgImage: bgImage || undefined };
      switch (template) {
        case "TikTokHook":
          return { hook, body, cta, accentColor, bgColor, textColor };
        case "GlitchIntro":
        case "StatDrop":
        case "Typewriter":
        case "PosterSlam":
          return hbc;
        case "SplitScreen":
          return {
            hook,
            leftLabel,
            leftValue,
            rightLabel,
            rightValue,
            cta,
            accentColor,
            bgColor,
            textColor,
            bgImage: bgImage || undefined,
          };
        case "BeforeAfter":
          return {
            beforeLabel: "ANTES",
            beforeValue,
            afterLabel: "AHORA",
            afterValue,
            brandName,
            tagline,
            accentColor,
            bgColor,
          };
        default:
          return { brandName, tagline, accentColor, bgColor, textColor };
      }
    };
  }, [template, hook, body, cta, beforeValue, afterValue, brandName, tagline, accentColor, bgColor, textColor, bgImage, leftValue, rightValue, leftLabel, rightLabel]);

  const getComponent = () => {
    switch (template) {
      case "GlitchIntro": return GlitchIntro;
      case "StatDrop": return StatDrop;
      case "SplitScreen": return SplitScreen;
      case "Typewriter": return Typewriter;
      case "PosterSlam": return PosterSlam;
      case "BeforeAfter": return BeforeAfter;
      case "ViralManifesto60s": return ViralManifesto60s;
      case "TikTokHook":
      default: return TikTokHook;
    }
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
          duration: currentTpl.duration,
          fps: 30,
          aspectRatio: "9:16",
        }),
      });
      if (!res.ok) return;
      const newReel = await res.json();
      await fetch("/api/content-sets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: set.id,
          piece: "reel",
          updates: { id: newReel.id, status: "draft" },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
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
          reelId: `set-${set.id.slice(0, 8)}`,
        }),
      });
      const d = await res.json();
      if (d.url) setRenderUrl(d.url);
    } finally {
      setRendering(false);
    }
  };

  const markReady = async () => {
    if (!reel) return;
    await fetch("/api/content-sets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: set.id,
        piece: "reel",
        updates: { id: reel.id, status: "ready" },
      }),
    });
    onSaved();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Template · 8 estilos disponibles
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {REEL_TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTemplate(t.key)}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition-colors ${
                  template === t.key
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {currentTpl.kind === "hbc" ? (
          <div className="space-y-3">
            <Field label="Hook (0-2s)">
              <textarea value={hook} onChange={(e) => setHook(e.target.value)} rows={2} className={fieldCls} />
            </Field>
            <Field label="Body (2-6s)">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={fieldCls} />
            </Field>
            <Field label="CTA (6-10s)">
              <input value={cta} onChange={(e) => setCta(e.target.value)} className={fieldCls} />
            </Field>
            <Field label="Imagen de fondo (opcional · URL)">
              <input
                value={bgImage}
                onChange={(e) => setBgImage(e.target.value)}
                placeholder="https://picsum.photos/seed/.../1080/1920"
                className={fieldCls}
              />
            </Field>
          </div>
        ) : currentTpl.kind === "split" ? (
          <div className="space-y-3">
            <Field label="Hook superior">
              <input value={hook} onChange={(e) => setHook(e.target.value)} className={fieldCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Panel izquierdo · valor">
                <input value={leftValue} onChange={(e) => setLeftValue(e.target.value)} className={fieldCls} />
              </Field>
              <Field label="Panel derecho · valor">
                <input value={rightValue} onChange={(e) => setRightValue(e.target.value)} className={fieldCls} />
              </Field>
            </div>
            <Field label="CTA">
              <input value={cta} onChange={(e) => setCta(e.target.value)} className={fieldCls} />
            </Field>
            <Field label="Imagen de fondo (opcional)">
              <input value={bgImage} onChange={(e) => setBgImage(e.target.value)} className={fieldCls} />
            </Field>
          </div>
        ) : currentTpl.kind === "ba" ? (
          <div className="space-y-3">
            <Field label="Marca / contexto">
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className={fieldCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Antes · valor">
                <input value={beforeValue} onChange={(e) => setBeforeValue(e.target.value)} className={fieldCls} />
              </Field>
              <Field label="Ahora · valor">
                <input value={afterValue} onChange={(e) => setAfterValue(e.target.value)} className={fieldCls} />
              </Field>
            </div>
            <Field label="Tagline">
              <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className={fieldCls} />
            </Field>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Marca">
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className={fieldCls} />
            </Field>
            <Field label="Tagline">
              <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className={fieldCls} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <ColorPicker label="Acento" value={accentColor} onChange={setAccentColor} />
          <ColorPicker label="Fondo" value={bgColor} onChange={setBgColor} />
          <ColorPicker label="Texto" value={textColor} onChange={setTextColor} />
        </div>

        <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
          <Button onClick={handleSave} disabled={saving} variant="accent" className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Guardando…" : saved ? "✓ Guardado" : reel ? "Guardar nueva versión" : "Crear reel"}
          </Button>
          <Button onClick={handleRender} disabled={rendering} variant="outline" className="gap-2">
            {rendering ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Renderizando…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Render MP4
              </>
            )}
          </Button>
          {renderUrl && (
            <a
              href={renderUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/15"
            >
              <Download className="h-4 w-4" /> Descargar
            </a>
          )}
          {reel && set.reel.status === "draft" && (
            <Button onClick={markReady} variant="outline" className="gap-2">
              <Check className="h-4 w-4" /> Marcar como listo
            </Button>
          )}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Preview 1080×1920 · {currentTpl.duration}s
        </div>
        <div className="rounded-xl overflow-hidden shadow-xl bg-black">
          <Player
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={getComponent() as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputProps={getProps() as any}
            durationInFrames={currentTpl.duration * 30}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            style={{ width: "100%" }}
            controls
            loop
            autoPlay
          />
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent resize-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded border border-border cursor-pointer bg-transparent"
      />
    </div>
  );
}
