"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GalleryVertical,
  MessageCircleQuestion,
  Timer,
  Sparkles,
  Layers,
  Save,
  ArrowRight,
  Check,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Project = { slug: string; name: string; icon?: string };

type Story = {
  id: string;
  dynamic: string;
  text: string;
  options?: string[];
  accentColor?: string;
  bgColor?: string;
  setId?: string;
  createdAt: string;
};

const DYNAMICS = [
  {
    key: "poll",
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    title: "Poll · Sí/No",
    desc: "Validación binaria · 2h → 200+ votos",
    needs: ["text"],
    defaultOptions: ["Sí", "No"],
  },
  {
    key: "quiz",
    icon: <Sparkles className="h-5 w-5" />,
    title: "Quiz · 4 opciones",
    desc: "Pregunta framework con respuesta correcta",
    needs: ["text", "options", "correctAnswer"],
    defaultOptions: ["Opción A", "Opción B", "Opción C", "Opción D"],
  },
  {
    key: "slider",
    icon: <Sparkles className="h-5 w-5" />,
    title: "Emoji slider",
    desc: "Intensidad 1-10 · mide qué tanto duele",
    needs: ["text"],
  },
  {
    key: "countdown",
    icon: <Timer className="h-5 w-5" />,
    title: "Countdown",
    desc: "Drop · evento · urgencia",
    needs: ["text", "targetDate"],
  },
  {
    key: "qa",
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    title: "Q&A sticker",
    desc: "Autoridad gratis · 73 preguntas/24h promedio",
    needs: ["text"],
  },
  {
    key: "swipe",
    icon: <GalleryVertical className="h-5 w-5" />,
    title: "Swipe-up + UTM",
    desc: "Link con tracking · retarget pixel",
    needs: ["text", "swipeUrl"],
  },
  {
    key: "ba",
    icon: <GalleryVertical className="h-5 w-5" />,
    title: "Antes/Después",
    desc: "Transformación visual para Highlight",
    needs: ["text"],
  },
] as const;

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setId = searchParams.get("set");
  const topicParam = searchParams.get("topic");
  const ctaParam = searchParams.get("cta");

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Creator form state
  const [dynamicKey, setDynamicKey] = useState<string>("poll");
  const [text, setText] = useState(topicParam || "¿Tu martes duele?");
  const [options, setOptions] = useState<string[]>(["Sí", "No"]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [targetDate, setTargetDate] = useState("");
  const [swipeUrl, setSwipeUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#F8C644");
  const [bgColor, setBgColor] = useState("#0E0D12");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = useMemo(
    () => DYNAMICS.find((d) => d.key === dynamicKey) || DYNAMICS[0],
    [dynamicKey]
  );

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const p = d.projects?.find((x: Project) => x.slug === d.active);
        setActiveProject(p || null);
      })
      .catch(() => {});
    fetch("/api/brand")
      .then((r) => r.json())
      .then((b) => {
        if (b?.colors?.accent) setAccentColor(b.colors.accent);
        if (b?.colors?.primary) setBgColor(b.colors.primary);
      })
      .catch(() => {});
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => {
        const mine = setId ? (d.stories || []).filter((s: Story) => s.setId === setId) : d.stories || [];
        setStories(mine);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setId]);

  // Reset options when dynamic changes to preset
  useEffect(() => {
    if ("defaultOptions" in selected && selected.defaultOptions) {
      setOptions([...selected.defaultOptions]);
    }
  }, [dynamicKey, selected]);

  const needs = (f: string) => selected.needs.includes(f as never);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        dynamic: dynamicKey,
        text,
        accentColor,
        bgColor,
      };
      if (needs("options")) body.options = options;
      if (needs("correctAnswer")) body.correctAnswer = correctAnswer;
      if (needs("targetDate") && targetDate) body.targetDate = targetDate;
      if (needs("swipeUrl") && swipeUrl) body.swipeUrl = swipeUrl;
      if (dynamicKey === "poll") body.options = options;
      if (setId) body.setId = setId;

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const story = await res.json();

      if (setId && story.id) {
        await fetch("/api/content-sets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: setId,
            piece: "story",
            updates: { id: story.id, status: "draft" },
          }),
        }).catch(() => {});
      }

      setSaved(true);
      setStories((prev) => [story, ...prev]);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-accent/10 grid place-items-center">
                <GalleryVertical className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Historias</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proyecto:{" "}
                  <span className="font-medium text-foreground">
                    {activeProject?.icon} {activeProject?.name || "…"}
                  </span>
                  {setId && (
                    <span className="ml-2 text-accent font-mono">
                      · linkeado al set {setId.slice(0, 8)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            {/* Creator · left */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Dinámica
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {DYNAMICS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDynamicKey(d.key)}
                      className={`text-left border rounded-lg p-3 transition-colors ${
                        dynamicKey === d.key
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-accent">{d.icon}</span>
                        <span className="text-sm font-semibold">{d.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {d.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-surface/30 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Texto · pregunta u hook
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:border-accent resize-none"
                  />
                </div>

                {needs("options") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Opciones ({options.length})
                    </label>
                    <div className="space-y-1.5">
                      {options.map((o, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          {needs("correctAnswer") && (
                            <button
                              onClick={() => setCorrectAnswer(i)}
                              className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0 transition-colors ${
                                correctAnswer === i
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                              }`}
                              title="Marcar como correcta"
                            >
                              {correctAnswer === i ? <Check className="h-3 w-3" /> : i + 1}
                            </button>
                          )}
                          <input
                            type="text"
                            value={o}
                            onChange={(e) => {
                              const next = [...options];
                              next[i] = e.target.value;
                              setOptions(next);
                            }}
                            className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background"
                          />
                          {options.length > 2 && (
                            <button
                              onClick={() => setOptions(options.filter((_, j) => j !== i))}
                              className="text-muted-foreground hover:text-destructive text-xs px-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {options.length < 4 && (
                        <button
                          onClick={() => setOptions([...options, `Opción ${options.length + 1}`])}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          + Agregar opción
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {dynamicKey === "poll" && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Opciones poll
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {options.slice(0, 2).map((o, i) => (
                        <input
                          key={i}
                          type="text"
                          value={o}
                          onChange={(e) => {
                            const next = [...options];
                            next[i] = e.target.value;
                            setOptions(next);
                          }}
                          className="px-3 py-1.5 text-sm border border-border rounded bg-background"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {needs("targetDate") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Fecha objetivo
                    </label>
                    <input
                      type="datetime-local"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background"
                    />
                  </div>
                )}

                {needs("swipeUrl") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      URL destino (con UTM)
                    </label>
                    <input
                      type="url"
                      value={swipeUrl}
                      onChange={(e) => setSwipeUrl(e.target.value)}
                      placeholder="https://tu-sitio.com?utm_source=ig&utm_medium=story"
                      className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
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
              </div>

              {ctaParam && (
                <div className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-3">
                  💡 CTA sugerida del set: <code className="font-mono font-bold text-accent ml-1">{ctaParam}</code>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  variant="accent"
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar historia"}
                </Button>
                {setId && saved && (
                  <Button
                    onClick={() => router.push(`/set/${setId}`)}
                    variant="outline"
                    className="gap-2"
                  >
                    Volver al set
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Preview · right */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Preview 9:16
              </div>
              <StoryPreview
                dynamic={dynamicKey}
                text={text}
                options={options}
                accentColor={accentColor}
                bgColor={bgColor}
                correctAnswer={needs("correctAnswer") ? correctAnswer : undefined}
                targetDate={targetDate}
              />
            </div>
          </div>

          {/* Recent stories */}
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {setId ? "Historias de este set" : "Historias recientes"} · {stories.length}
            </h2>
            {loading ? (
              <div className="text-xs text-muted-foreground">Cargando…</div>
            ) : stories.length === 0 ? (
              <div className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">
                Todavía no hay historias. Creá la primera arriba.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {stories.slice(0, 8).map((s) => (
                  <div key={s.id} className="border border-border rounded-lg overflow-hidden bg-surface/30">
                    <div
                      className="aspect-[9/16] p-4 flex flex-col justify-center items-center text-center text-white"
                      style={{ background: s.bgColor || "#0E0D12" }}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: s.accentColor }}>
                        {s.dynamic}
                      </div>
                      <div className="text-sm font-semibold leading-snug line-clamp-4">
                        {s.text}
                      </div>
                      {s.options && s.options.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap justify-center">
                          {s.options.slice(0, 4).map((o, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: s.accentColor, color: "#000" }}
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground p-2 border-t border-border">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Layers className="h-3.5 w-3.5" /> Volver al home
              </Button>
            </Link>
          </div>
        </div>
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
  correctAnswer,
  targetDate,
}: {
  dynamic: string;
  text: string;
  options: string[];
  accentColor: string;
  bgColor: string;
  correctAnswer?: number;
  targetDate?: string;
}) {
  const countdown = targetDate
    ? Math.max(0, Math.round((new Date(targetDate).getTime() - Date.now()) / 1000 / 3600))
    : null;
  return (
    <div
      className="aspect-[9/16] rounded-xl overflow-hidden shadow-xl flex flex-col items-center justify-center p-6 text-center text-white"
      style={{ background: bgColor }}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: accentColor }}>
        {dynamic}
      </div>
      <div className="text-xl font-bold leading-snug mb-6">{text}</div>

      {(dynamic === "poll" || dynamic === "quiz") && options.length > 0 && (
        <div className={`grid ${options.length <= 2 ? "grid-cols-2" : "grid-cols-2"} gap-2 w-full`}>
          {options.map((o, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                correctAnswer === i ? "ring-2 ring-emerald-400" : ""
              }`}
              style={{
                background: correctAnswer === i ? "#10b98133" : "#ffffff22",
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
        <div className="w-full space-y-2">
          <div className="flex justify-between text-2xl">
            <span>😩</span>
            <span>😊</span>
          </div>
          <div
            className="h-2 rounded-full"
            style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)` }}
          />
        </div>
      )}

      {dynamic === "countdown" && (
        <div
          className="text-5xl font-mono font-black px-6 py-4 rounded-xl"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {countdown != null ? `${countdown}h` : "00:00"}
        </div>
      )}

      {dynamic === "qa" && (
        <div className="w-full">
          <div
            className="px-3 py-3 rounded-lg text-sm text-muted-foreground"
            style={{ background: "#ffffff18", border: `1px solid ${accentColor}55` }}
          >
            Escribí tu respuesta…
          </div>
        </div>
      )}

      {dynamic === "swipe" && (
        <div
          className="mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ background: accentColor, color: "#000" }}
        >
          Swipe ↑
        </div>
      )}

      {dynamic === "ba" && (
        <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="py-3 rounded-lg opacity-60" style={{ background: "#ffffff18" }}>ANTES</div>
          <div className="py-3 rounded-lg font-bold" style={{ background: accentColor, color: "#000" }}>AHORA</div>
        </div>
      )}
    </div>
  );
}
