"use client";

/**
 * Chat de creación de contenido · multi-turno.
 *
 * El usuario conversa con el agente Storu que tiene tools reales:
 * generar imágenes (IA), crear sets, carruseles, historias y reels.
 * Las imágenes generadas se muestran inline · los sets creados linkean
 * a su editor.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Loader2,
  Wrench,
  CheckCircle,
  ArrowRight,
  ImageIcon,
  User,
  Trash2,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Turn = { role: "user" | "assistant"; content: string };

type StreamItem =
  | { kind: "tool"; name: string; args: unknown }
  | { kind: "tool-result"; output: string; imageUrl?: string; setId?: string }
  | { kind: "text"; text: string };

const SUGGESTIONS = [
  "Generame una imagen de un mostrador de panadería artesanal en Cali, luz de mañana",
  "Creá un set completo para activar los martes de mi pizzería en Medellín",
  "¿Qué framework me recomendás para un caso de estudio de mi spa?",
];

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState<StreamItem[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, streaming]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || running) return;
    setInput("");
    setRunning(true);
    setStreaming([]);

    const history = turns; // snapshot antes de agregar el turno nuevo
    setTurns((t) => [...t, { role: "user", content: message }]);

    const controller = new AbortController();
    abortRef.current = controller;
    const items: StreamItem[] = [];
    let finalText = "";
    let lastSetId: string | undefined;

    const pushItem = (item: StreamItem) => {
      items.push(item);
      setStreaming([...items]);
    };

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: message, history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        finalText = `⚠ Error HTTP ${res.status}: ${t.slice(0, 200)}`;
      } else {
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
            const ev = evLine.slice(6).trim();
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(dataLine.slice(5).trim());
            } catch {
              continue;
            }

            if (ev === "tool") {
              pushItem({ kind: "tool", name: String(data.name || "tool"), args: data.args });
            } else if (ev === "tool-result") {
              const output = String(data.output || "");
              let imageUrl: string | undefined;
              let setId: string | undefined;
              try {
                const parsed = JSON.parse(output);
                if (typeof parsed.imageUrl === "string") imageUrl = parsed.imageUrl;
                if (typeof parsed.setId === "string") {
                  setId = parsed.setId;
                  lastSetId = parsed.setId;
                }
              } catch {
                /* output no-json */
              }
              pushItem({ kind: "tool-result", output, imageUrl, setId });
            } else if (ev === "message") {
              const text = String(data.text || data.content || "");
              if (text) pushItem({ kind: "text", text });
            } else if (ev === "done") {
              if (typeof data.finalText === "string" && data.finalText) {
                finalText = data.finalText;
              }
              if (typeof data.setId === "string") lastSetId = data.setId;
            } else if (ev === "error") {
              finalText = `⚠ ${String(data.message || "Error del agente")}`;
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        finalText = `⚠ ${(e as Error).message}`;
      }
    } finally {
      // Consolidar: el turno assistant guarda el texto final + referencias
      const imageUrls = items
        .filter((i): i is Extract<StreamItem, { kind: "tool-result" }> => i.kind === "tool-result")
        .map((i) => i.imageUrl)
        .filter(Boolean) as string[];

      let content = finalText || items.filter((i) => i.kind === "text").map((i) => (i as { text: string }).text).join("\n") || "(sin respuesta)";
      if (imageUrls.length) {
        content += `\n${imageUrls.map((u) => `[img]${u}`).join("\n")}`;
      }
      if (lastSetId) content += `\n[set]${lastSetId}`;

      setTurns((t) => [...t, { role: "assistant", content }]);
      setStreaming([]);
      setRunning(false);
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setTurns([]);
    setStreaming([]);
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1">
                  <Bot className="h-3.5 w-3.5" /> Chat de creación
                </div>
                <h1 className="text-xl font-bold">
                  Pedile contenido al agente · imágenes, sets, piezas
                </h1>
              </div>
              {turns.length > 0 && (
                <Button onClick={clear} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" /> Limpiar
                </Button>
              )}
            </div>

            {/* Empty state · sugerencias */}
            {turns.length === 0 && !running && (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  El agente puede <b>generar imágenes con IA</b>, crear{" "}
                  <b>sets completos</b> (Historia + Carrusel + Reel) y responder
                  en contexto sobre lo que ya crearon juntos.
                </p>
                <div className="flex flex-col gap-1.5 max-w-lg mx-auto">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:border-accent/50 hover:bg-accent/5 text-left text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversación */}
            {turns.map((t, i) => (
              <TurnBubble key={i} turn={t} />
            ))}

            {/* Stream en vivo */}
            {running && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  el agente está trabajando…
                </div>
                {streaming.map((item, i) => (
                  <StreamRow key={i} item={item} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input fijo abajo */}
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-6 py-3">
            <div className="border border-border rounded-xl bg-surface/40 focus-within:border-accent transition-colors flex items-end gap-2 p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder='Ej: "generame una imagen de…" · "creá un set para…" · "cambiale el hook al reel"'
                disabled={running}
                className="flex-1 bg-transparent outline-none text-sm resize-none px-2 py-1.5 placeholder:text-muted-foreground/60"
              />
              <Button
                onClick={() => send()}
                disabled={!input.trim() || running}
                variant="accent"
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {running ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Enviar
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5 px-1">
              ⏎ enviar · ⇧⏎ nueva línea · el agente recuerda la conversación
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Render de un turno consolidado · parsea [img]url y [set]id embebidos */
function TurnBubble({ turn }: { turn: Turn }) {
  const isUser = turn.role === "user";
  const lines = turn.content.split("\n");
  const textLines: string[] = [];
  const images: string[] = [];
  let setId: string | undefined;
  for (const l of lines) {
    if (l.startsWith("[img]")) images.push(l.slice(5));
    else if (l.startsWith("[set]")) setId = l.slice(5);
    else textLines.push(l);
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent/15 grid place-items-center shrink-0 mt-1">
          <Bot className="h-3.5 w-3.5 text-accent" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-surface/60 border border-border"
        }`}
      >
        <div className="whitespace-pre-wrap">{textLines.join("\n").trim()}</div>
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {images.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={u}
                alt="Imagen generada"
                className="rounded-lg border border-border w-full object-cover"
              />
            ))}
          </div>
        )}
        {setId && (
          <Link
            href={`/set/${setId}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Abrir set creado <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-muted grid place-items-center shrink-0 mt-1">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function StreamRow({ item }: { item: StreamItem }) {
  if (item.kind === "tool") {
    return (
      <div className="border border-border rounded-lg p-2 bg-surface/40 flex items-center gap-2 ml-10">
        <Wrench className="h-3 w-3 text-accent shrink-0" />
        <span className="text-[11px] font-mono">{item.name}</span>
      </div>
    );
  }
  if (item.kind === "tool-result") {
    return (
      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-2 ml-10 flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt="Generada"
            className="rounded-md max-h-32 border border-border"
          />
        ) : (
          <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 truncate">
            {item.output.slice(0, 120)}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="text-xs text-muted-foreground ml-10 italic">
      {item.text.slice(0, 200)}
    </div>
  );
}
