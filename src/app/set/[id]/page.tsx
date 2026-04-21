"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  ArrowRight,
  Layers,
  Film,
  GalleryVertical,
  Plus,
  ExternalLink,
  Target,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Piece = { id: string | null; status: string; outputUrl?: string };
type ContentSet = {
  id: string;
  name: string;
  topic: string;
  goal: string;
  ctaKeyword?: string;
  anchorBrand?: string;
  experimentPurpose?: string;
  sceneDetails?: string;
  possibleCaptions?: string[];
  references?: Array<{ url: string; type: string; name?: string }>;
  status?: string;
  story: Piece;
  carousel: Piece;
  reel: Piece;
  thread?: string;
};

type Tab = "overview" | "story" | "carousel" | "reel";

export default function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<ContentSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch("/api/content-sets")
      .then((r) => r.json())
      .then((d) => {
        const s = d.sets?.find((x: ContentSet) => x.id === id);
        setSet(s || null);
        setLoading(false);
      });
  }, [id]);

  const createCarousel = async () => {
    if (!set) return;
    const res = await fetch("/api/carousels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: set.name, aspectRatio: "4:5" }),
    });
    if (res.ok) {
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
      router.push(`/carousel/${car.id}?set=${set.id}`);
    }
  };

  const goToReel = () => {
    if (!set) return;
    const params = new URLSearchParams({
      set: set.id,
      topic: set.topic,
      cta: set.ctaKeyword || "",
    });
    router.push(`/reels/new?${params}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 grid place-items-center">
          <div className="text-sm text-muted-foreground">Cargando set…</div>
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
    { key: "story" as const, label: "Historia", icon: <GalleryVertical className="h-4 w-4" />, piece: set.story },
    { key: "carousel" as const, label: "Carrusel", icon: <Layers className="h-4 w-4" />, piece: set.carousel },
    { key: "reel" as const, label: "Reel", icon: <Film className="h-4 w-4" />, piece: set.reel },
  ];
  const readyCount = pieces.filter((p) => p.piece.status === "ready" || p.piece.status === "published").length;
  const pct = Math.round((readyCount / 3) * 100);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                🧪 Experimento
              </span>
              <span className="text-[10px] font-mono tracking-wider text-accent uppercase">
                · {set.goal}
              </span>
              {set.ctaKeyword && (
                <span className="text-[10px] font-mono tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                  CTA: {set.ctaKeyword}
                </span>
              )}
              {set.status && (
                <span className="text-[10px] font-mono tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase">
                  {set.status}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{set.name}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{set.topic}</p>
            {set.anchorBrand && (
              <div className="text-xs text-muted-foreground mt-2">
                Marca ancla: <b className="text-foreground">{set.anchorBrand}</b>
              </div>
            )}
          </div>

          {/* Progress + pieces */}
          <div className="border border-border rounded-xl p-5 bg-surface/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                  Línea de contenido · 3 piezas coherentes
                </div>
                <div className="text-xl font-bold mt-0.5">{pct}% completado</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {pieces.map((p) => {
                    const done = p.piece.status === "ready" || p.piece.status === "published";
                    return (
                      <div
                        key={p.key}
                        className={`w-7 h-7 rounded-full border-2 border-background grid place-items-center text-white text-[10px] ${
                          done ? "bg-emerald-500" : p.piece.status === "draft" ? "bg-amber-500" : "bg-muted-foreground/30"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : p.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border flex">
            {(["overview", "story", "carousel", "reel"] as const).map((t) => {
              const labels = { overview: "Overview", story: "📱 Historia", carousel: "📇 Carrusel", reel: "🎬 Reel" };
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "overview" && (
            <div className="space-y-5">
              {set.experimentPurpose && (
                <div className="border border-border rounded-xl p-4 bg-surface/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-accent" />
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Propósito · hipótesis
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{set.experimentPurpose}</p>
                </div>
              )}
              {set.sceneDetails && (
                <div className="border border-border rounded-xl p-4 bg-surface/30">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    🎬 Escena · locación · mood
                  </div>
                  <p className="text-sm leading-relaxed">{set.sceneDetails}</p>
                </div>
              )}
              {set.possibleCaptions && set.possibleCaptions.length > 0 && (
                <div className="border border-border rounded-xl p-4 bg-surface/30">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    ✏️ Captions candidatas
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
              {set.references && set.references.length > 0 && (
                <div className="border border-border rounded-xl p-4 bg-surface/30">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    🖼 Referencias visuales
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {set.references.map((r, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.url} alt={r.name || r.type} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 font-mono uppercase tracking-wider truncate">
                          {r.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {set.thread && (
                <div className="border border-accent/30 bg-accent/5 rounded-xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                    🧵 Hilo conductor
                  </div>
                  <p className="text-sm leading-relaxed">{set.thread}</p>
                </div>
              )}
            </div>
          )}

          {tab === "story" && (
            <PieceTab
              title="Historia · 9:16"
              desc="Poll · quiz · countdown · Q&A · swipe-up. Validación rápida en Stories."
              piece={set.story}
              createLabel="Crear historia"
              createHref={`/stories?set=${set.id}&topic=${encodeURIComponent(set.topic)}&cta=${encodeURIComponent(set.ctaKeyword || "")}`}
              openHref="/stories"
            />
          )}

          {tab === "carousel" && (
            <PieceTab
              title="Carrusel · 4:5"
              desc="Narrativa en slides. Educa · caso de estudio · framework · listicle."
              piece={set.carousel}
              onCreate={createCarousel}
              createLabel="Crear carrusel"
              openHref={set.carousel.id ? `/carousel/${set.carousel.id}` : null}
            />
          )}

          {tab === "reel" && (
            <PieceTab
              title="Reel · 9:16"
              desc="Video vertical con Remotion. Hook + body + CTA · 10s / 60s / custom."
              piece={set.reel}
              onCreate={goToReel}
              createLabel="Crear reel"
              openHref="/reels"
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PieceTab({
  title,
  desc,
  piece,
  createLabel,
  onCreate,
  createHref,
  openHref,
}: {
  title: string;
  desc: string;
  piece: Piece;
  createLabel: string;
  onCreate?: () => void;
  createHref?: string;
  openHref?: string | null;
}) {
  const status = piece.status;
  const statusLabel = {
    pending: "Pendiente",
    draft: "Borrador",
    ready: "Listo",
    published: "Publicado",
  }[status] || status;
  const exists = piece.id !== null || status !== "pending";

  return (
    <div className="border border-border rounded-xl p-6 bg-surface/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            status === "ready" || status === "published"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : status === "draft"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {!exists && (onCreate ? (
          <Button onClick={onCreate} variant="accent" className="gap-2">
            <Sparkles className="h-4 w-4" /> {createLabel}
          </Button>
        ) : createHref ? (
          <Link href={createHref}>
            <Button variant="accent" className="gap-2">
              <Sparkles className="h-4 w-4" /> {createLabel}
            </Button>
          </Link>
        ) : null)}
        {exists && openHref && (
          <Link href={openHref}>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Abrir editor
            </Button>
          </Link>
        )}
        {!exists && !onCreate && !createHref && (
          <div className="text-sm text-muted-foreground">Pronto</div>
        )}
      </div>
    </div>
  );
}
