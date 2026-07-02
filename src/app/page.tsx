"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Sparkles, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BriefInput } from "@/components/BriefInput";
import { COPY } from "@/lib/copy";

type Project = { slug: string; name: string; icon?: string };
type Piece = { id: string | null; status: string };
type ContentSet = {
  id: string;
  topic: string;
  goal: string;
  name: string;
  ctaKeyword?: string;
  anchorBrand?: string;
  story: Piece;
  carousel: Piece;
  reel: Piece;
  status?: string;
  publishDate?: string;
  exportedAt?: string;
  createdAt: string;
};

const GOAL_LABEL: Record<string, string> = {
  capture: "Captar",
  valley: "Horas valle",
  ticket: "Subir ticket",
  recompra: "Recompra",
  launch: "Launch",
  validate: "Validar",
  cashflow: "Cashflow",
  autority: "Autoridad",
};

const GOAL_ACCENT: Record<string, string> = {
  capture: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  valley: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  ticket: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  recompra: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  launch: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  validate: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  cashflow: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  autority: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
};

export default function HomePage() {
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [goalFilter, setGoalFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/content-sets").then((r) => r.json()).catch(() => ({ sets: [] })),
      fetch("/api/projects").then((r) => r.json()).catch(() => null),
    ]).then(([s, p]) => {
      setSets(s.sets || []);
      if (p?.projects && p?.active) {
        setProject(p.projects.find((x: Project) => x.slug === p.active) || null);
      }
      setLoading(false);
    });
  }, []);

  const visible = sets.filter((s) => {
    if (goalFilter && s.goal !== goalFilter) return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q) ||
      (s.anchorBrand || "").toLowerCase().includes(q) ||
      (s.ctaKeyword || "").toLowerCase().includes(q)
    );
  });

  const total = sets.length;
  const ready = sets.filter(
    (s) => s.story.id && s.carousel.id && s.reel.id
  ).length;
  const scheduled = sets.filter((s) => s.publishDate).length;
  const exported = sets.filter((s) => s.exportedAt).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero · brief input */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              {project && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  {project.icon} {project.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {COPY.brand.tagline}
            </h1>
            <p className="text-base text-muted-foreground mb-6 max-w-2xl">
              {COPY.brand.description}
            </p>
            <BriefInput variant="hero" />
          </section>

          {/* Stats row */}
          {total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat label={COPY.home.stats.total} value={total} />
              <Stat label={COPY.home.stats.ready} value={ready} />
              <Stat label={COPY.home.stats.scheduled} value={scheduled} />
              <Stat label={COPY.home.stats.exported} value={exported} accent />
            </div>
          )}

          {/* Filter bar */}
          {total > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar tema, marca, CTA…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
                <FilterPill active={!goalFilter} onClick={() => setGoalFilter("")}>
                  {COPY.common.all}
                </FilterPill>
                {Object.entries(GOAL_LABEL).map(([k, label]) => {
                  const n = sets.filter((s) => s.goal === k).length;
                  if (n === 0) return null;
                  return (
                    <FilterPill
                      key={k}
                      active={goalFilter === k}
                      onClick={() => setGoalFilter(k === goalFilter ? "" : k)}
                    >
                      {label} <span className="opacity-60 ml-1 text-[9px]">{n}</span>
                    </FilterPill>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sets grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {COPY.home.title}
                {visible.length !== total && (
                  <span className="text-muted-foreground/60 ml-2">
                    {visible.length} / {total}
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground py-20 text-center">
                {COPY.common.loading}
              </div>
            ) : visible.length === 0 ? (
              <EmptyState hasFilter={!!filter || !!goalFilter} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map((s) => (
                  <SetCard key={s.id} set={s} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-3 ${
        accent ? "border-accent/30 bg-accent/5" : "border-border bg-surface/30"
      }`}
    >
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </div>
      <div
        className={`font-bold ${small ? "text-sm truncate" : "text-2xl"} ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SetCard({ set }: { set: ContentSet }) {
  const pieces = [
    { key: "story", icon: "📱", label: "Hist", piece: set.story },
    { key: "carousel", icon: "📇", label: "Carr", piece: set.carousel },
    { key: "reel", icon: "🎬", label: "Reel", piece: set.reel },
  ];
  const linked = pieces.filter((p) => p.piece.id).length;
  const ready = pieces.filter((p) => p.piece.status === "ready" || p.piece.status === "published").length;
  const pct = Math.round((linked / 3) * 100);
  const goalAccent = GOAL_ACCENT[set.goal] || "bg-muted text-muted-foreground";

  return (
    <Link
      href={`/set/${set.id}`}
      className="group border border-border rounded-xl p-4 bg-surface/30 hover:border-accent hover:shadow-md hover:-translate-y-px transition-all block"
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${goalAccent}`}>
            {GOAL_LABEL[set.goal] || set.goal}
          </span>
          {set.ctaKeyword && (
            <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded font-bold">
              {set.ctaKeyword}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-accent transition-colors">
          {pct}%
        </span>
      </div>

      <h3 className="font-semibold text-[15px] leading-snug mb-1 line-clamp-2">{set.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-snug">{set.topic}</p>

      {set.anchorBrand && (
        <div className="text-[11px] text-muted-foreground mb-2.5 flex items-center gap-1">
          <span>📍</span>
          <span className="text-foreground/80 truncate">{set.anchorBrand}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Pieces row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {pieces.map((p) => {
            const status = p.piece.status;
            const dot =
              status === "ready" || status === "published"
                ? "bg-emerald-500"
                : status === "draft"
                ? "bg-amber-500"
                : "bg-muted-foreground/30";
            return (
              <div key={p.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{p.icon}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              </div>
            );
          })}
        </div>
        {ready > 0 && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {ready} listas
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl py-16 text-center">
      <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
      <h3 className="text-base font-semibold mb-1">
        {hasFilter ? "Ningún set coincide" : COPY.home.empty.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        {hasFilter
          ? "Probá cambiar el filtro o buscar otro término."
          : COPY.home.empty.body}
      </p>
      {!hasFilter && (
        <Link
          href="/brief/new"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          {COPY.home.empty.cta}
        </Link>
      )}
    </div>
  );
}
