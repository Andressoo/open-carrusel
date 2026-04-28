"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Wrench,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

type Mode = "single" | "batch" | "photo";

type AgentEvent =
  | { kind: "start"; idea: string }
  | { kind: "tool"; name: string; args: unknown; id: string }
  | { kind: "tool-result"; id: string; output: string }
  | { kind: "message"; id: string; text: string }
  | { kind: "reasoning"; id: string; text: string }
  | { kind: "done"; setId?: string; finalText: string }
  | { kind: "error"; message: string; fix?: string };

function BriefContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdea = searchParams.get("idea") || "";

  const [mode, setMode] = useState<Mode>("single");
  const [idea, setIdea] = useState(initialIdea);
  const [count, setCount] = useState(10);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-run if URL has ?idea
  useEffect(() => {
    if (initialIdea && !running && events.length === 0) {
      setIdea(initialIdea);
      // Small delay so React updates state
      const t = setTimeout(() => run(), 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdea]);

  const run = async () => {
    if (!idea.trim() || running) return;
    setRunning(true);
    setEvents([]);
    const controller = new AbortController();
    abortRef.current = controller;

    const endpoint =
      mode === "batch" ? "/api/ai/generate-batch" : "/api/agent/chat";
    const body =
      mode === "batch"
        ? { prompt: idea, count }
        : { idea };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const text = await res.text();
        setEvents((e) => [
          ...e,
          { kind: "error", message: `HTTP ${res.status}: ${text.slice(0, 200)}` },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const raw of parts) {
          const lines = raw.split("\n");
          const evLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!evLine || !dataLine) continue;
          const eventName = evLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim());
          setEvents((e) => [...e, { kind: eventName, ...data } as AgentEvent]);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setEvents((ev) => [
          ...ev,
          { kind: "error", message: (e as Error).message },
        ]);
      }
    } finally {
      setRunning(false);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setRunning(false);
  };

  const doneEvent = events.find((e) => e.kind === "done") as
    | Extract<AgentEvent, { kind: "done" }>
    | undefined;
  const errorEvent = events.find((e) => e.kind === "error") as
    | Extract<AgentEvent, { kind: "error" }>
    | undefined;
  const setEvents_count = events.filter((e) => e.kind === "tool-result").length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-block mb-3"
            >
              {COPY.set.backToSets}
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1">
              <Bot className="h-3.5 w-3.5" />
              {COPY.brief.title}
            </div>
            <h1 className="text-2xl font-bold">{COPY.brief.subtitle}</h1>
          </div>

          {/* Mode tabs */}
          <div className="border border-border rounded-xl p-1 bg-muted/30 flex gap-1 mb-4">
            {(Object.keys(COPY.brief.modes) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={running}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === m
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div>{COPY.brief.modes[m].label}</div>
                <div className="text-[10px] font-normal opacity-70 mt-0.5">
                  {COPY.brief.modes[m].desc}
                </div>
              </button>
            ))}
          </div>

          {/* Photo mode notice */}
          {mode === "photo" && (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3 mb-4 text-xs flex items-start gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <b>Próximo:</b> upload de fotos + análisis con Claude Vision. Por ahora usá el modo &quot;1 set&quot; o &quot;Batch&quot;.
              </div>
            </div>
          )}

          {/* Brief input */}
          <div className="space-y-3 mb-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={COPY.brief.inputPlaceholder}
              rows={5}
              disabled={running || mode === "photo"}
              className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none leading-relaxed"
            />

            {mode === "batch" && (
              <div className="flex items-center gap-3 text-sm">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 30))}
                  min={1}
                  max={30}
                  disabled={running}
                  className="w-20 px-3 py-1.5 border border-border rounded-md bg-surface/40 outline-none focus:border-accent text-sm"
                />
                <span className="text-[11px] text-muted-foreground">1-30 sets</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground flex-1">
                {COPY.brief.toolHint}
              </p>
              {running ? (
                <Button onClick={cancel} variant="outline" size="sm" className="gap-2">
                  {COPY.brief.cancelBtn}
                </Button>
              ) : (
                <Button
                  onClick={run}
                  disabled={!idea.trim() || mode === "photo"}
                  variant="accent"
                  className="gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {COPY.brief.submit}
                </Button>
              )}
            </div>
          </div>

          {/* Events stream */}
          {events.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {running ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {COPY.agent.thinking}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    {setEvents_count} eventos
                  </>
                )}
              </div>
              <div className="space-y-1.5">
                {events.map((e, i) => (
                  <EventRow key={i} event={e} />
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {errorEvent && (
            <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive mb-1.5">
                <AlertCircle className="h-4 w-4" />
                {COPY.common.error}
              </div>
              <div className="text-sm">{errorEvent.message}</div>
              {(errorEvent.message.includes("Insufficient credits") ||
                errorEvent.message.includes("402")) && (
                <div className="text-[11px] mt-3 p-3 bg-background rounded border border-border">
                  💡 <b>Cuenta sin créditos OpenRouter.</b> Cargá en{" "}
                  <a
                    className="text-accent underline"
                    href="https://openrouter.ai/settings/credits"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    openrouter.ai/settings/credits
                  </a>{" "}
                  o configurá <code className="font-mono">OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free</code> en .env.local.
                </div>
              )}
            </div>
          )}

          {/* Success state */}
          {doneEvent?.setId && (
            <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                {COPY.agent.done}
              </div>
              {doneEvent.finalText && (
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {doneEvent.finalText}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/set/${doneEvent.setId}`)}
                  variant="accent"
                  className="gap-2"
                >
                  Abrir set <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => {
                    setEvents([]);
                    setIdea("");
                  }}
                  variant="outline"
                >
                  Otro set
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EventRow({ event }: { event: AgentEvent }) {
  if (event.kind === "start") {
    return (
      <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 px-3">
        <Loader2 className="h-3 w-3 animate-spin" />
        {COPY.agent.starting}
      </div>
    );
  }
  if (event.kind === "tool") {
    return (
      <div className="border border-border rounded-lg p-2.5 bg-surface/40 flex items-start gap-2">
        <Wrench className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold font-mono">{event.name}</div>
          <pre className="text-[10px] font-mono text-muted-foreground mt-1 whitespace-pre-wrap break-words line-clamp-3">
            {JSON.stringify(event.args, null, 2).slice(0, 300)}
          </pre>
        </div>
      </div>
    );
  }
  if (event.kind === "tool-result") {
    return (
      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-2 flex items-start gap-2 ml-5">
        <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
        <pre className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap break-words flex-1 line-clamp-2">
          {(event.output || "").slice(0, 200)}
        </pre>
      </div>
    );
  }
  if (event.kind === "message") {
    return (
      <div className="border border-accent/20 bg-accent/5 rounded-lg p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">
          Respuesta
        </div>
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{event.text}</div>
      </div>
    );
  }
  if (event.kind === "reasoning") {
    return (
      <div className="text-[11px] italic text-muted-foreground px-3 border-l-2 border-border ml-2">
        💭 {event.text}
      </div>
    );
  }
  return null;
}

export default function BriefPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Cargando…</div>}>
      <BriefContent />
    </Suspense>
  );
}
