"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Workflow, Play, Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

type RunResult = {
  runId: string;
  status: string;
  flowSlug: string;
  startedAt: string;
  finishedAt?: string;
  steps: Record<string, { status: string; error?: string }>;
  error?: { stepId: string; message: string };
};

const STARTER_FLOWS = [
  {
    slug: "weekly-content-machine",
    name: "Máquina semanal · 5 sets cada lunes",
    description:
      "Cron lunes 9am → genera 5 sets para tu rubro inspirados en los que rindieron mejor → email summary.",
    triggers: ["cron 0 9 * * 1", "manual"],
    steps: 3,
    bestFor: "Comercios que quieren content production en piloto automático",
  },
];

export default function FlowsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runFlow = async (slug: string) => {
    setRunning(slug);
    setErrors((e) => ({ ...e, [slug]: "" }));
    try {
      const res = await fetch(`/api/flows/${slug}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [slug]: data.error || `HTTP ${res.status}` }));
      } else {
        setResults((r) => ({ ...r, [slug]: data }));
      }
    } catch (e) {
      setErrors((er) => ({ ...er, [slug]: (e as Error).message }));
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1">
              <Workflow className="h-3.5 w-3.5" />
              Flows · automation layer
            </div>
            <h1 className="text-2xl font-bold mb-1">Máquinas de contenido</h1>
            <p className="text-sm text-muted-foreground">
              Cada flow encadena steps automatizados disparados por triggers
              (cron · webhook · evento · upload). MVP: solo manual + cron.
            </p>
          </div>

          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3 mb-6 text-xs text-amber-700 dark:text-amber-400">
            ⚠ <b>MVP scaffold</b> · engine secuencial sin scheduling persistente.
            Para production: spawn worker async + cron real (Vercel Cron / GH Actions / Inngest).
            Ver <code className="px-1 bg-background rounded">docs/storu-flows.md</code> para arquitectura completa.
          </div>

          <div className="space-y-3">
            {STARTER_FLOWS.map((f) => {
              const result = results[f.slug];
              const error = errors[f.slug];
              const isRunning = running === f.slug;

              return (
                <div
                  key={f.slug}
                  className="border border-border rounded-xl p-5 bg-surface/30"
                >
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight">{f.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                    </div>
                    <Button
                      onClick={() => runFlow(f.slug)}
                      disabled={isRunning}
                      variant="accent"
                      size="sm"
                      className="gap-2"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Corriendo…
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          Ejecutar
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                    {f.triggers.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-muted/40 font-mono">
                        {t}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                      {f.steps} steps
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground italic">{f.bestFor}</div>

                  {error && (
                    <div className="mt-3 border border-destructive/30 bg-destructive/5 rounded-lg p-2 text-xs flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <span className="font-mono">{error}</span>
                    </div>
                  )}

                  {result && (
                    <div className="mt-3 border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Run {result.runId.slice(0, 8)} · {result.status}
                      </div>
                      <div className="space-y-1">
                        {Object.entries(result.steps).map(([id, s]) => (
                          <div
                            key={id}
                            className="flex items-center gap-2 text-[11px] font-mono"
                          >
                            {s.status === "completed" && (
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                            )}
                            {s.status === "failed" && (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                            {!["completed", "failed"].includes(s.status) && (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                            <span className="font-semibold">{id}</span>
                            <span className="text-muted-foreground">· {s.status}</span>
                            {s.error && (
                              <span className="text-destructive truncate">· {s.error.slice(0, 80)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {result.error && (
                        <div className="text-[11px] text-destructive mt-2 font-mono">
                          ✗ Error en step <b>{result.error.stepId}</b>: {result.error.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Flows planeados (próximo)
            </h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0" />
                <div>
                  <b>Reactivación 30d</b> · webhook Stripe payment_succeeded → wait 30d →
                  si no volvió a comprar, generá set personalizado con incentivo.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0" />
                <div>
                  <b>Foto a set</b> · upload en /assets/storefront → Claude Vision analiza →
                  agente Storu propone set · approval humano → schedule lunes.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0" />
                <div>
                  <b>DM por keyword</b> · webhook ManyChat comment.keyword → log conversion →
                  send template DM al usuario que comentó.
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← Volver a Sets
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
