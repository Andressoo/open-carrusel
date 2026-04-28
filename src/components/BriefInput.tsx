"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowUpRight, Loader2, Wand2 } from "lucide-react";
import { COPY } from "@/lib/copy";

const PRESET_IDEAS = [
  "Activar mi pizzería en Cali los martes sin rebajar",
  "Llenar el spa de Medellín en horas valle de la mañana",
  "Vender membresías en mi gym de Barranquilla · post-Carnaval",
  "Levantar mi cafetería de Bogotá los sábados con un drop",
];

export function BriefInput({
  variant = "hero",
}: {
  variant?: "hero" | "compact";
}) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!idea.trim() || submitting) return;
    setSubmitting(true);
    // Pass idea to /brief/new via query param
    const params = new URLSearchParams({ idea: idea.trim() });
    router.push(`/brief/new?${params}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  if (variant === "compact") {
    return (
      <div className="border border-border rounded-xl p-3 bg-surface/30 hover:border-accent/50 focus-within:border-accent transition-colors">
        <div className="flex gap-2 items-start">
          <Sparkles className="h-4 w-4 text-accent shrink-0 mt-1" />
          <textarea
            ref={ref}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder={COPY.home.briefPlaceholder}
            disabled={submitting}
            className="flex-1 bg-transparent outline-none text-sm resize-none placeholder:text-muted-foreground"
          />
          <button
            onClick={submit}
            disabled={!idea.trim() || submitting}
            className="shrink-0 h-8 w-8 rounded-md bg-accent text-accent-foreground grid place-items-center disabled:opacity-30 hover:opacity-90"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-border rounded-2xl bg-surface/40 hover:border-accent/40 focus-within:border-accent/60 focus-within:bg-surface/60 transition-all">
        <textarea
          ref={ref}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={onKey}
          rows={3}
          placeholder={COPY.home.briefPlaceholder}
          disabled={submitting}
          className="w-full bg-transparent outline-none text-base px-5 py-4 resize-none placeholder:text-muted-foreground/70 leading-relaxed"
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <kbd className="font-mono bg-muted/60 px-1.5 py-0.5 rounded">⏎</kbd>
            crear set
            <span className="opacity-40">·</span>
            <kbd className="font-mono bg-muted/60 px-1.5 py-0.5 rounded">⇧⏎</kbd>
            nueva línea
          </div>
          <button
            onClick={submit}
            disabled={!idea.trim() || submitting}
            className="inline-flex items-center gap-2 px-4 h-8 rounded-md bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Iniciando…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {COPY.home.briefSubmit}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset suggestions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground self-center mr-1">
          Probá:
        </span>
        {PRESET_IDEAS.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setIdea(s);
              ref.current?.focus();
            }}
            className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:border-accent/50 hover:bg-accent/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {s.length > 50 ? s.slice(0, 47) + "…" : s}
          </button>
        ))}
      </div>
    </div>
  );
}
