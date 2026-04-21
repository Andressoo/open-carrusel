"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Layers,
  Film,
  GalleryVertical,
  Sparkles,
  TrendingUp,
  Calendar,
  Zap,
  Download,
  Wand2,
  Palette,
  Target,
  Users,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { CreateHubDialog } from "@/components/ui/create-hub-dialog";
import type { Carousel } from "@/types/carousel";
import type { BrandConfig } from "@/types/brand";

type Project = { slug: string; name: string; icon?: string; description?: string };
type Reel = { id: string; template: string; props: Record<string, unknown>; duration: number; aspectRatio: string; createdAt: string };
type ContentSet = {
  id: string;
  topic: string;
  goal: string;
  name: string;
  ctaKeyword?: string;
  experimentPurpose?: string;
  anchorBrand?: string;
  story: { id: string | null; status: string };
  carousel: { id: string | null; status: string };
  reel: { id: string | null; status: string };
  status?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/carousels").then((r) => r.json()).catch(() => ({ carousels: [] })),
      fetch("/api/reels").then((r) => r.json()).catch(() => ({ reels: [] })),
      fetch("/api/content-sets").then((r) => r.json()).catch(() => ({ sets: [] })),
      fetch("/api/brand").then((r) => r.json()).catch(() => null),
      fetch("/api/projects").then((r) => r.json()).catch(() => null),
    ])
      .then(([c, r, s, b, p]) => {
        setCarousels(c.carousels || []);
        setReels(r.reels || []);
        setSets(s.sets || []);
        setBrand(b);
        if (p?.projects && p?.active) {
          setProject(p.projects.find((x: Project) => x.slug === p.active) || null);
        }
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      label: "Carruseles",
      value: carousels.length,
      icon: <Layers className="h-4 w-4" />,
      accent: "bg-rose-500/10 text-rose-600",
      href: null,
    },
    {
      label: "Reels",
      value: reels.length,
      icon: <Film className="h-4 w-4" />,
      accent: "bg-amber-500/10 text-amber-600",
      href: "/reels",
    },
    {
      label: "Historias",
      value: 0,
      icon: <GalleryVertical className="h-4 w-4" />,
      accent: "bg-violet-500/10 text-violet-600",
      href: "/stories",
    },
    {
      label: "Asistentes AI",
      value: 4,
      icon: <Sparkles className="h-4 w-4" />,
      accent: "bg-emerald-500/10 text-emerald-600",
      href: null,
    },
  ];

  const skills = [
    {
      icon: <Wand2 className="h-5 w-5" />,
      name: "Design Director",
      desc: "Genera carruseles brand-aligned en segundos. Aplica tu paleta, fuentes y voz automáticamente.",
      color: "from-rose-500/20 to-rose-500/5",
      badge: "Activo",
    },
    {
      icon: <Film className="h-5 w-5" />,
      name: "Video Engineer",
      desc: "Crea reels con Remotion: hooks virales, before/after, manifestos 60s. Preview en vivo + export MP4.",
      color: "from-amber-500/20 to-amber-500/5",
      badge: "Activo",
    },
    {
      icon: <Target className="h-5 w-5" />,
      name: "Copy Strategist",
      desc: "Escribe hooks, CTAs y copy por arquetipo viral con memoria de tu marca.",
      color: "from-violet-500/20 to-violet-500/5",
      badge: "Activo",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      name: "Brand Guardian",
      desc: "Valida cada pieza contra las reglas de marca antes de publicar.",
      color: "from-emerald-500/20 to-emerald-500/5",
      badge: "Próximamente",
    },
  ];

  const useCases = [
    {
      category: "Restaurantes",
      title: "Llenar horas valle",
      desc: "Campaña por franja con ticket escalonado",
      metric: "+59% revenue midweek",
      emoji: "🍽",
    },
    {
      category: "Moda",
      title: "Drops limitados",
      desc: "Urgencia real sin quemar margen",
      metric: "Sold out 36h · 0% descuento",
      emoji: "👗",
    },
    {
      category: "Fitness",
      title: "Reemplazá el mes gratis",
      desc: "Reto 21 días convierte a anual",
      metric: "12% → 73% retención",
      emoji: "💪",
    },
    {
      category: "Belleza",
      title: "Primera visita premium",
      desc: "Transformación completa + foto",
      metric: "97% recompra 30d",
      emoji: "💇‍♀️",
    },
    {
      category: "Turismo",
      title: "Salí de Booking",
      desc: "Paquetes narrativos por ocasión",
      metric: "ADR +3.2× · 72% directo",
      emoji: "🏨",
    },
    {
      category: "Cafeterías",
      title: "Brunch weekend",
      desc: "Ticket 4× vs café solo",
      metric: "+$2.6M revenue sábado",
      emoji: "☕",
    },
  ];

  const recentCarousels = [...carousels].slice(0, 6);
  const recentReels = [...reels].slice(0, 4);
  const recentSets = [...sets].reverse().slice(0, 6);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <CreateHubDialog open={showCreate} onClose={() => setShowCreate(false)} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
          {/* Hero */}
          <section>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
                  Laboratorio de ventas · Storu Studio
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {project?.icon} {project?.name || "Tu proyecto"}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  {project?.description || "Proyecto en blanco — creá tu primera pieza para empezar"}
                </p>
                {brand?.name && brand.colors && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Brand:</span>
                    <span className="text-xs font-semibold">{brand.name}</span>
                    <div className="flex gap-1">
                      {[brand.colors.primary, brand.colors.secondary, brand.colors.accent].filter(Boolean).map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-md border border-border"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={() => setShowCreate(true)} variant="accent" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear pieza
              </Button>
            </div>
          </section>

          {/* Stats row */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s) => {
                const inner = (
                  <div className="border border-border rounded-xl p-4 hover:border-accent/50 hover:shadow-sm transition-all cursor-pointer bg-surface/30 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg grid place-items-center ${s.accent}`}>
                        {s.icon}
                      </div>
                      {s.href && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="text-3xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                );
                return s.href ? (
                  <Link key={s.label} href={s.href} className="group block">
                    {inner}
                  </Link>
                ) : (
                  <div key={s.label} className="group">{inner}</div>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-3">
              Crear
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Layers className="h-5 w-5" />, label: "Carrusel", desc: "Historia en slides", onClick: () => setShowCreate(true) },
                { icon: <Film className="h-5 w-5" />, label: "Reel", desc: "Video vertical 9:16", href: "/reels/new" },
                { icon: <GalleryVertical className="h-5 w-5" />, label: "Historia", desc: "Poll · quiz · countdown", href: "/stories" },
                { icon: <MessageSquare className="h-5 w-5" />, label: "Chat AI", desc: "Pedile cualquier cosa", onClick: () => setShowCreate(true) },
              ].map((a) => {
                const content = (
                  <div className="border border-border rounded-xl p-4 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer bg-surface/30 h-full">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent grid place-items-center mb-3">
                      {a.icon}
                    </div>
                    <div className="font-semibold text-sm">{a.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
                  </div>
                );
                return a.href ? (
                  <Link key={a.label} href={a.href}>{content}</Link>
                ) : (
                  <div key={a.label} onClick={a.onClick}>{content}</div>
                );
              })}
            </div>
          </section>

          {/* Skills / AI capabilities */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                Asistentes AI · skills
              </h2>
              <div className="text-xs text-muted-foreground">
                Con memoria del proyecto activo
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {skills.map((s) => (
                <div
                  key={s.name}
                  className={`border border-border rounded-xl p-5 bg-gradient-to-br ${s.color} relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-lg bg-background grid place-items-center text-foreground shadow-sm">
                      {s.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        s.badge === "Activo"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <div className="font-semibold mb-1">{s.name}</div>
                  <p className="text-sm text-muted-foreground leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Casos de uso */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                Casos de uso · plantillas por nicho
              </h2>
              <Link href="#" className="text-xs text-muted-foreground hover:text-accent">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {useCases.map((u) => (
                <div
                  key={u.title}
                  className="border border-border rounded-xl p-4 bg-surface/30 hover:border-accent/50 transition-colors cursor-pointer group"
                  onClick={() => setShowCreate(true)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{u.emoji}</span>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
                      {u.category}
                    </span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{u.title}</div>
                  <div className="text-xs text-muted-foreground mb-3 leading-snug">
                    {u.desc}
                  </div>
                  <div className="text-xs font-semibold text-accent flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {u.metric}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Content Sets · experimentos activos */}
          {recentSets.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Experimentos · 1 idea = 3 piezas
                </h2>
                <span className="text-xs text-muted-foreground">
                  {sets.length} sets en este proyecto
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {recentSets.map((s) => {
                  const statusCounts = [s.story, s.carousel, s.reel].reduce(
                    (acc, p) => {
                      acc[p.status] = (acc[p.status] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  );
                  const readyCount =
                    (statusCounts.ready || 0) + (statusCounts.published || 0);
                  const pct = Math.round((readyCount / 3) * 100);
                  return (
                    <div
                      key={s.id}
                      className="border border-border rounded-xl p-4 bg-surface/30 hover:border-accent/50 transition-all block"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Link href={`/set/${s.id}`} className="flex-1 min-w-0 hover:opacity-90">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                              🧪 {s.goal}
                            </span>
                            {s.ctaKeyword && (
                              <span className="text-[10px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold tracking-wider">
                                CTA: {s.ctaKeyword}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {s.topic}
                          </p>
                        </Link>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-accent">{pct}%</div>
                          <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                            completado
                          </div>
                        </div>
                      </div>
                      {s.anchorBrand && (
                        <div className="text-[10px] text-muted-foreground mb-3">
                          Marca ancla: <b className="text-foreground">{s.anchorBrand}</b>
                        </div>
                      )}
                      {/* Progress bar */}
                      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {/* 3 pieces */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { key: "story", label: "Historia", icon: "📱", piece: s.story, href: "/stories" },
                            { key: "carousel", label: "Carrusel", icon: "📇", piece: s.carousel, href: s.carousel.id ? `/carousel/${s.carousel.id}` : null },
                            { key: "reel", label: "Reel", icon: "🎬", piece: s.reel, href: "/reels" },
                          ] as const
                        ).map((p) => {
                          const status = p.piece.status;
                          const statusColor =
                            status === "ready" || status === "published"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : status === "draft"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : "bg-muted border-border text-muted-foreground";
                          const inner = (
                            <div
                              className={`border rounded-lg p-2 text-center ${statusColor} transition-colors hover:opacity-80`}
                            >
                              <div className="text-base mb-0.5">{p.icon}</div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider">
                                {p.label}
                              </div>
                              <div className="text-[9px] font-mono mt-0.5 opacity-75">
                                {status === "pending" ? "pendiente" : status}
                              </div>
                            </div>
                          );
                          return p.href ? (
                            <Link key={p.key} href={p.href}>
                              {inner}
                            </Link>
                          ) : (
                            <div key={p.key}>{inner}</div>
                          );
                        })}
                      </div>
                      <Link
                        href={`/set/${s.id}`}
                        className="mt-3 block text-center text-[11px] font-semibold text-accent hover:underline"
                      >
                        Abrir set →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Contenido reciente · carruseles */}
          {recentCarousels.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                  Carruseles recientes
                </h2>
                <span className="text-xs text-muted-foreground">
                  {carousels.length} en total
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentCarousels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/carousel/${c.id}`)}
                    className="text-left border border-border rounded-xl p-3 hover:border-accent/50 hover:shadow-sm transition-all bg-surface/30 group"
                  >
                    <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden relative">
                      {c.slides?.[0]?.html && (
                        <iframe
                          sandbox=""
                          srcDoc={c.slides[0].html}
                          className="w-full h-full scale-[0.25] origin-top-left pointer-events-none"
                          style={{ width: "400%", height: "400%" }}
                        />
                      )}
                    </div>
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{c.aspectRatio}</span>
                      <span>·</span>
                      <span>{c.slides?.length || 0} slides</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Reels recientes */}
          {recentReels.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                  Reels recientes
                </h2>
                <Link href="/reels" className="text-xs text-muted-foreground hover:text-accent">
                  Ver todos →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentReels.map((r) => (
                  <Link
                    key={r.id}
                    href="/reels"
                    className="border border-border rounded-xl p-3 hover:border-accent/50 transition-colors bg-surface/30"
                  >
                    <div className="aspect-[9/16] bg-black rounded-lg mb-3 grid place-items-center text-white/40 text-[10px] font-mono relative overflow-hidden">
                      <Film className="h-8 w-8 text-amber-500/70" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-[9px] font-mono text-white/70 truncate">
                          {r.template}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold truncate">
                      {String(r.props?.hook || r.props?.brandName || "Reel")}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {r.duration}s · {r.aspectRatio}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Empty state · if no content */}
          {!loading && carousels.length === 0 && reels.length === 0 && (
            <section className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 grid place-items-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Proyecto vacío · creá tu primera pieza</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Storu Studio usa tu brand, memoria y asistentes AI para generar contenido que convierte. Elegí qué querés crear primero.
              </p>
              <Button onClick={() => setShowCreate(true)} variant="accent" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear pieza
              </Button>
            </section>
          )}

          {/* Footer stats */}
          <section className="border-t border-border pt-6 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {carousels.length + reels.length} piezas en este proyecto
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  1 seat
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  AI chat disponible
                </span>
              </div>
              <div className="font-mono">Storu Studio · v0.4 · Fase 3 ✓</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
