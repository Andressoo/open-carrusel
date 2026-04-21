"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { CreateHubDialog } from "@/components/ui/create-hub-dialog";

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
  capture: "bg-rose-500/10 text-rose-600",
  valley: "bg-amber-500/10 text-amber-600",
  ticket: "bg-violet-500/10 text-violet-600",
  recompra: "bg-blue-500/10 text-blue-600",
  launch: "bg-emerald-500/10 text-emerald-600",
  validate: "bg-pink-500/10 text-pink-600",
  cashflow: "bg-teal-500/10 text-teal-600",
  autority: "bg-indigo-500/10 text-indigo-600",
};

export default function DashboardPage() {
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [goalFilter, setGoalFilter] = useState<string>("");

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

  const visibleSets = sets.filter((s) => {
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
  const withAll3 = sets.filter(
    (s) => s.story.id && s.carousel.id && s.reel.id
  ).length;
  const inProgress = sets.filter((s) => s.status === "draft").length;

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                {project?.icon} {project?.name || "Storu Studio"}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Sets de contenido</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Cada tema = 1 set completo con Historia + Carrusel + Reel coherentes.
                Hacé clic en un set para editar las 3 piezas desde un solo lugar.
              </p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              variant="accent"
              className="gap-2 shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Nuevo set
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total sets" value={total} />
            <StatCard label="Completos (3/3 linkeados)" value={withAll3} accent />
            <StatCard label="En borrador" value={inProgress} />
            <StatCard
              label="Este proyecto"
              value={project?.name || "—"}
              small
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar por tema, marca, CTA…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              <button
                onClick={() => setGoalFilter("")}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  goalFilter === ""
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                Todos
              </button>
              {Object.entries(GOAL_LABEL).map(([k, label]) => {
                const n = sets.filter((s) => s.goal === k).length;
                if (n === 0) return null;
                return (
                  <button
                    key={k}
                    onClick={() => setGoalFilter(k === goalFilter ? "" : k)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                      goalFilter === k
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {label} · {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sets grid */}
          {loading ? (
            <div className="text-sm text-muted-foreground py-20 text-center">Cargando sets…</div>
          ) : visibleSets.length === 0 ? (
            <EmptyState onCreate={() => setShowCreate(true)} hasFilter={!!filter || !!goalFilter} />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleSets.map((s) => (
                <SetCard key={s.id} set={s} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateHubDialog open={showCreate} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function StatCard({ label, value, accent, small }: { label: string; value: string | number; accent?: boolean; small?: boolean }) {
  return (
    <div className={`border rounded-xl p-4 ${accent ? "border-accent/30 bg-accent/5" : "border-border bg-surface/30"}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`font-bold ${small ? "text-sm truncate" : "text-2xl"} ${accent ? "text-accent" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function SetCard({ set }: { set: ContentSet }) {
  const pieces = [
    { key: "story", icon: "📱", label: "Historia", piece: set.story },
    { key: "carousel", icon: "📇", label: "Carrusel", piece: set.carousel },
    { key: "reel", icon: "🎬", label: "Reel", piece: set.reel },
  ];
  const ready = pieces.filter((p) => p.piece.status === "ready" || p.piece.status === "published").length;
  const draft = pieces.filter((p) => p.piece.status === "draft").length;
  const linked = pieces.filter((p) => p.piece.id).length;
  const pct = Math.round((linked / 3) * 100);
  const accent = GOAL_ACCENT[set.goal] || "bg-muted/40 text-muted-foreground";

  return (
    <Link
      href={`/set/${set.id}`}
      className="group border border-border rounded-xl p-5 bg-surface/30 hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all block"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent}`}>
            {GOAL_LABEL[set.goal] || set.goal}
          </span>
          {set.ctaKeyword && (
            <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold tracking-wider">
              {set.ctaKeyword}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-60 group-hover:opacity-100">
          {pct}%
        </span>
      </div>

      <h3 className="font-semibold text-base mb-1 line-clamp-2 leading-snug">{set.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-snug">{set.topic}</p>

      {set.anchorBrand && (
        <div className="text-[11px] text-muted-foreground mb-3">
          📍 <span className="text-foreground">{set.anchorBrand}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 3 pieces summary */}
      <div className="grid grid-cols-3 gap-1.5">
        {pieces.map((p) => {
          const status = p.piece.status;
          const color =
            status === "ready" || status === "published"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : status === "draft"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
              : "bg-muted border-border text-muted-foreground";
          return (
            <div key={p.key} className={`border rounded-lg px-2 py-1.5 text-center ${color}`}>
              <div className="text-sm">{p.icon}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
                {status === "pending" ? "—" : status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>
          {ready > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ready} listas</span>}
          {ready > 0 && draft > 0 && " · "}
          {draft > 0 && <span className="text-amber-600 dark:text-amber-400 font-semibold">{draft} en borrador</span>}
          {ready === 0 && draft === 0 && "Sin piezas"}
        </span>
        <span className="font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Abrir →
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ onCreate, hasFilter }: { onCreate: () => void; hasFilter: boolean }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl py-20 text-center">
      <div className="text-4xl mb-3">✨</div>
      <h3 className="text-lg font-semibold mb-1">
        {hasFilter ? "Ningún set coincide" : "Todavía no hay sets"}
      </h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
        {hasFilter
          ? "Probá cambiar el filtro o buscar otro término."
          : "Cada idea se convierte en 1 set = Historia + Carrusel + Reel. Todo desde una sola idea."}
      </p>
      {!hasFilter && (
        <Button onClick={onCreate} variant="accent" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Crear mi primer set
        </Button>
      )}
    </div>
  );
}
