"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Piece = { id: string | null; status: string };
type ContentSet = {
  id: string;
  name: string;
  topic: string;
  goal: string;
  ctaKeyword?: string;
  anchorBrand?: string;
  status?: string;
  publishDate?: string;
  story: Piece;
  carousel: Piece;
  reel: Piece;
};

const GOAL_COLOR: Record<string, string> = {
  capture: "bg-rose-500",
  valley: "bg-amber-500",
  ticket: "bg-violet-500",
  recompra: "bg-blue-500",
  launch: "bg-emerald-500",
  validate: "bg-pink-500",
  cashflow: "bg-teal-500",
  autority: "bg-indigo-500",
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarPage() {
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content-sets")
      .then((r) => r.json())
      .then((d) => {
        setSets(d.sets || []);
        setLoading(false);
      });
  }, []);

  const monthLabel = new Date(monthCursor.year, monthCursor.month, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  // Build calendar grid starting Monday
  const grid = useMemo(() => {
    const first = new Date(monthCursor.year, monthCursor.month, 1);
    const last = new Date(monthCursor.year, monthCursor.month + 1, 0);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const days: Array<{ date: Date | null; key: string; isoDate: string | null }> = [];
    for (let i = 0; i < startWeekday; i++) {
      days.push({ date: null, key: `pad-${i}`, isoDate: null });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(monthCursor.year, monthCursor.month, d);
      const iso = dt.toISOString().slice(0, 10);
      days.push({ date: dt, key: iso, isoDate: iso });
    }
    while (days.length % 7 !== 0) days.push({ date: null, key: `pad-end-${days.length}`, isoDate: null });
    return days;
  }, [monthCursor]);

  // Index sets by date
  const setsByDate = useMemo(() => {
    const map: Record<string, ContentSet[]> = {};
    for (const s of sets) {
      if (!s.publishDate) continue;
      const iso = s.publishDate.slice(0, 10);
      if (!map[iso]) map[iso] = [];
      map[iso].push(s);
    }
    return map;
  }, [sets]);

  const unscheduled = sets.filter((s) => !s.publishDate);
  const selected = selectedDate ? setsByDate[selectedDate] || [] : [];
  const totalScheduled = Object.values(setsByDate).reduce((sum, arr) => sum + arr.length, 0);

  const prev = () => {
    setMonthCursor(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }));
    setSelectedDate(null);
  };
  const next = () => {
    setMonthCursor(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }));
    setSelectedDate(null);
  };
  const goToday = () => {
    const t = new Date();
    setMonthCursor({ year: t.getFullYear(), month: t.getMonth() });
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-5 w-5 text-accent" />
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Calendario de publicación
                </div>
              </div>
              <h1 className="text-2xl font-bold capitalize">{monthLabel}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalScheduled} sets agendados · {unscheduled.length} sin fecha
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button onClick={prev} variant="ghost" size="icon" aria-label="Mes anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={goToday} variant="outline" size="sm">
                Hoy
              </Button>
              <Button onClick={next} variant="ghost" size="icon" aria-label="Mes siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            {/* Calendar grid */}
            <div className="border border-border rounded-xl bg-surface/30 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground text-center py-2 bg-muted/20"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {grid.map((cell) => {
                  if (!cell.date) return <div key={cell.key} className="min-h-[88px] border-r border-b border-border bg-muted/10" />;
                  const list = setsByDate[cell.isoDate || ""] || [];
                  const isToday = cell.isoDate === todayIso;
                  const isSelected = cell.isoDate === selectedDate;
                  return (
                    <button
                      key={cell.key}
                      onClick={() => setSelectedDate(cell.isoDate)}
                      className={`min-h-[88px] border-r border-b border-border text-left p-1.5 transition-colors relative ${
                        isSelected
                          ? "bg-accent/10 ring-2 ring-accent ring-inset"
                          : isToday
                          ? "bg-accent/5"
                          : "hover:bg-surface/60"
                      }`}
                    >
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          isToday ? "text-accent" : ""
                        }`}
                      >
                        {cell.date.getDate()}
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        {list.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className={`w-1.5 h-1.5 rounded-full ${GOAL_COLOR[s.goal] || "bg-muted-foreground"}`}
                            title={s.name}
                          />
                        ))}
                        {list.length > 4 && (
                          <span className="text-[9px] text-muted-foreground font-mono">
                            +{list.length - 4}
                          </span>
                        )}
                      </div>
                      {list.length > 0 && (
                        <div className="absolute bottom-1 right-1 text-[9px] font-mono text-muted-foreground">
                          {list.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {selectedDate ? (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    {new Date(selectedDate).toLocaleDateString("es-CO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · {selected.length} set{selected.length !== 1 ? "s" : ""}
                  </div>
                  <div className="space-y-2">
                    {selected.length === 0 && (
                      <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">
                        Sin sets agendados en este día.
                      </div>
                    )}
                    {selected.map((s) => (
                      <SetMini key={s.id} s={s} />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Tocá un día para ver sus sets
                  </div>
                </div>
              )}

              {unscheduled.length > 0 && (
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    📥 Sin agendar ({unscheduled.length})
                  </div>
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                    {unscheduled.slice(0, 20).map((s) => (
                      <SetMini key={s.id} s={s} compact />
                    ))}
                    {unscheduled.length > 20 && (
                      <div className="text-[11px] text-muted-foreground text-center py-2">
                        +{unscheduled.length - 20} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="border border-border rounded-lg p-3 bg-surface/40">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Goals
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {Object.entries(GOAL_COLOR).map(([k, c]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${c}`} />
                      <span className="capitalize">{k}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center text-sm text-muted-foreground py-10">Cargando…</div>
          )}
        </div>
      </main>
    </div>
  );
}

function SetMini({ s, compact }: { s: ContentSet; compact?: boolean }) {
  const linked = [s.story, s.carousel, s.reel].filter((p) => p.id).length;
  return (
    <Link
      href={`/set/${s.id}`}
      className="flex items-start gap-2 border border-border rounded-lg p-2.5 bg-background hover:border-accent/50 hover:bg-accent/5 transition-colors block"
    >
      <span
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          GOAL_COLOR[s.goal] || "bg-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate leading-tight">{s.name}</div>
        {!compact && s.anchorBrand && (
          <div className="text-[10px] text-muted-foreground truncate">{s.anchorBrand}</div>
        )}
        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
          {s.ctaKeyword && <span className="font-mono text-accent">CTA: {s.ctaKeyword}</span>}
          <span>·</span>
          <span>{linked}/3</span>
        </div>
      </div>
      <Sparkles className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100" />
    </Link>
  );
}
