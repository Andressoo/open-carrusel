"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Wand2, Sparkles, Check, AlertCircle, ArrowRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type GeneratedSet = {
  id: string;
  name: string;
  goal: string;
  ctaKeyword?: string;
  anchorBrand?: string;
};

const PRESETS = [
  {
    label: "20 sets para restaurantes colombianos · horas valle",
    prompt:
      "Generá 20 sets para restaurantes en Colombia enfocados en activar horas valle (martes y miércoles). Cada set debe tener un ángulo distinto: algunos contrarian, otros case study, otros framework. Goal: valley.",
    count: 20,
  },
  {
    label: "15 sets para comercio minorista · subir ticket",
    prompt:
      "Generá 15 sets para comercios minoristas colombianos (ropa, calzado, accesorios) con goal de subir ticket promedio. Mezclar archetypes: listicle, framework, case study, before/after. Incluir ejemplos de bundles, upsell, y diseño de incentivos.",
    count: 15,
  },
  {
    label: "10 sets para spa / belleza · recompra",
    prompt:
      "Generá 10 sets para salones de belleza, spas, y barberías en Colombia enfocados en recompra (membresías, packs de sesiones, fidelización). Goal: recompra.",
    count: 10,
  },
  {
    label: "10 sets manifiesto · contrarian · autoridad",
    prompt:
      "Generá 10 sets con tono manifiesto y contrarian contra prácticas comunes del mercado colombiano (rebajar, pautar sin estrategia, depender de Booking, etc). Goal: autority. Archetypes: provocation, contrarian, manifesto.",
    count: 10,
  },
  {
    label: "12 sets launch · tipo drop cápsula",
    prompt:
      "Generá 12 sets tipo launch de drops o colecciones cápsula para comercios colombianos (moda, joyería, café de especialidad, licores). Urgencia 72h, preventa, lista VIP. Goal: launch.",
    count: 12,
  },
];

type Step = "idle" | "generating" | "done";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(10);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState({ emitted: 0, total: 0 });
  const [generated, setGenerated] = useState<GeneratedSet[]>([]);
  const [errors, setErrors] = useState<Array<{ message: string; name?: string }>>([]);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!prompt.trim() || step === "generating") return;
    setStep("generating");
    setProgress({ emitted: 0, total: count });
    setGenerated([]);
    setErrors([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, count }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        setErrors([{ message: `HTTP ${res.status}` }]);
        setStep("done");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const lines = evt.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const eventName = eventLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim());

          if (eventName === "start") {
            setProgress({ emitted: 0, total: data.count });
          } else if (eventName === "set") {
            setGenerated((prev) => [...prev, data.set]);
            setProgress({ emitted: data.index, total: data.total });
          } else if (eventName === "error") {
            setErrors((prev) => [...prev, data]);
          } else if (eventName === "done") {
            setStep("done");
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setErrors((prev) => [...prev, { message: (e as Error).message }]);
      }
    } finally {
      setStep("done");
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setStep("done");
  };

  const usePreset = (p: typeof PRESETS[0]) => {
    setPrompt(p.prompt);
    setCount(p.count);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-2">
              <Wand2 className="h-3.5 w-3.5" />
              Generador bulk · Claude
            </div>
            <h1 className="text-3xl font-bold">Generá N sets de una</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Describí el tema, público o serie. Claude genera los briefs
              completos (topic, framework, captions, hashtags, experimento) y
              cada set queda listo con su carrusel enganchado · abrís y editás.
            </p>
          </div>

          {/* Presets */}
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Empezá desde un preset
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => usePreset(p)}
                  disabled={step === "generating"}
                  className="text-left border border-border rounded-lg p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold leading-tight">{p.label}</span>
                    <span className="text-[10px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded shrink-0">
                      {p.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {p.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tu pedido
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Generá 20 sets para cafés de especialidad en Bogotá con goal de captar audiencia fría. Mezclá archetypes y frameworks para que cada set sea distinto."
                rows={5}
                disabled={step === "generating"}
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none leading-relaxed"
              />
              <div className="text-[11px] text-muted-foreground mt-1">
                Tip: mencioná ciudades colombianas, rubro, objetivo comercial y
                cuántos sets querés. Default 10, máximo 30 por pedido.
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="w-40">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) =>
                    setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 30))
                  }
                  min={1}
                  max={30}
                  disabled={step === "generating"}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1" />
              {step === "generating" ? (
                <Button onClick={cancel} variant="outline" className="gap-2">
                  Cancelar
                </Button>
              ) : (
                <Button
                  onClick={run}
                  disabled={!prompt.trim()}
                  variant="accent"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generar {count} sets
                </Button>
              )}
            </div>
          </div>

          {/* Progress + results */}
          {(step === "generating" || step === "done") && (
            <div className="mt-8 space-y-4">
              <div className="border border-border rounded-xl p-4 bg-surface/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {step === "generating" ? "Generando…" : "Listo"}
                  </div>
                  <div className="text-sm font-mono font-bold">
                    {progress.emitted} / {progress.total}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                    style={{
                      width: `${progress.total ? (progress.emitted / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                {step === "generating" && (
                  <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    Claude analiza tu pedido, genera briefs, y crea cada set con su carrusel enganchado.
                  </div>
                )}
              </div>

              {generated.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Sets creados · {generated.length}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {generated.map((s, i) => (
                      <Link
                        key={s.id}
                        href={`/set/${s.id}`}
                        className="border border-border rounded-lg p-3 bg-background hover:border-accent/50 hover:bg-accent/5 transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                              #{i + 1}
                            </span>
                            <span className="text-[10px] font-mono text-accent">{s.goal}</span>
                            {s.ctaKeyword && (
                              <span className="text-[10px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold tracking-wider">
                                {s.ctaKeyword}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold truncate leading-tight">{s.name}</div>
                          {s.anchorBrand && (
                            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              📍 {s.anchorBrand}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-destructive mb-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Errores ({errors.length})
                  </div>
                  <ul className="text-[11px] text-destructive/80 space-y-0.5">
                    {errors.slice(0, 5).map((e, i) => (
                      <li key={i}>
                        · {e.name ? `${e.name}: ` : ""}
                        {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === "done" && generated.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                  <Link href="/">
                    <Button variant="accent" className="gap-2">
                      <Check className="h-4 w-4" /> Ver en dashboard ({generated.length})
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="outline" className="gap-2">
                      Agendar todos →
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      setStep("idle");
                      setGenerated([]);
                      setErrors([]);
                      setPrompt("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline ml-auto"
                  >
                    Nuevo pedido
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
