"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Bot, Send, Sparkles, ArrowRight, Wrench, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Event =
  | { kind: "start"; idea: string }
  | { kind: "tool"; name: string; args: unknown; id: string }
  | { kind: "tool-result"; id: string; output: string }
  | { kind: "message"; id: string; text: string }
  | { kind: "reasoning"; id: string; text: string }
  | { kind: "done"; setId?: string; finalText: string }
  | { kind: "error"; message: string; fix?: string };

export default function AgentPage() {
  const [idea, setIdea] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!idea.trim() || running) return;
    setRunning(true);
    setEvents([]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const text = await res.text();
        setEvents((e) => [...e, { kind: "error", message: `HTTP ${res.status}: ${text.slice(0, 200)}` }]);
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
          setEvents((e) => [...e, { kind: eventName, ...data } as Event]);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setEvents((ev) => [...ev, { kind: "error", message: (e as Error).message }]);
      }
    } finally {
      setRunning(false);
    }
  };

  const doneEvent = events.find((e) => e.kind === "done") as
    | Extract<Event, { kind: "done" }>
    | undefined;
  const errorEvent = events.find((e) => e.kind === "error") as
    | Extract<Event, { kind: "error" }>
    | undefined;

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1">
              <Bot className="h-3.5 w-3.5" /> Agente Storu · OpenRouter + tools
            </div>
            <h1 className="text-2xl font-bold">Chatea con el agente</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Describí una idea · el agente llama las tools en orden: elige imagen · crea set · crea carrusel · crea historia · crea reel. Todo con scripts coherentes.
            </p>
          </div>

          <div className="relative">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej: Activar mi pizzería en Cali los martes · competir sin rebajar"
              rows={4}
              disabled={running}
              className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none leading-relaxed pr-32"
            />
            <Button
              onClick={run}
              disabled={!idea.trim() || running}
              variant="accent"
              className="absolute bottom-3 right-3 gap-2"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Corriendo…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Ejecutar agente
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {events.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tool calls en tiempo real
              </div>
              <div className="space-y-1.5">
                {events.map((e, i) => (
                  <EventRow key={i} event={e} />
                ))}
              </div>
            </div>
          )}

          {errorEvent && (
            <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-destructive mb-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Error
              </div>
              <div className="text-sm">{errorEvent.message}</div>
              {errorEvent.fix && (
                <div className="text-[11px] mt-2 p-2 bg-background rounded border border-border">
                  💡 {errorEvent.fix}
                </div>
              )}
            </div>
          )}

          {doneEvent?.setId && (
            <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Set creado
              </div>
              {doneEvent.finalText && (
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {doneEvent.finalText}
                </div>
              )}
              <Link href={`/set/${doneEvent.setId}`}>
                <Button variant="accent" size="sm" className="gap-2">
                  Abrir set en editor <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  if (event.kind === "start") {
    return (
      <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 px-3">
        <Loader2 className="h-3 w-3 animate-spin" />
        Iniciando agente…
      </div>
    );
  }
  if (event.kind === "tool") {
    return (
      <div className="border border-border rounded-lg p-2.5 bg-surface/40 flex items-start gap-2">
        <Wrench className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold font-mono">{event.name}</div>
          <pre className="text-[10px] font-mono text-muted-foreground mt-1 whitespace-pre-wrap break-words line-clamp-5">
            {JSON.stringify(event.args, null, 2).slice(0, 400)}
          </pre>
        </div>
      </div>
    );
  }
  if (event.kind === "tool-result") {
    return (
      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-2 flex items-start gap-2 ml-5">
        <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
        <pre className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap break-words flex-1 line-clamp-3">
          {(event.output || "").slice(0, 200)}
        </pre>
      </div>
    );
  }
  if (event.kind === "message") {
    return (
      <div className="border border-accent/20 bg-accent/5 rounded-lg p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">Respuesta</div>
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
