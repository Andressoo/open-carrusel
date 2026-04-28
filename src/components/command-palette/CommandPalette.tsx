"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Calendar, Layers, Bot, Wand2, Settings, Upload, Plus, ChevronRight } from "lucide-react";
import { COPY } from "@/lib/copy";

type Cmd = {
  id: string;
  section: keyof typeof COPY.palette.sections;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  action: () => void | Promise<void>;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ─── Comandos disponibles ───
  const commands = useMemo<Cmd[]>(
    () => [
      // CREAR
      {
        id: "new-set-brief",
        section: "create",
        label: "Crear set desde idea",
        description: "Brief al agente · 1 set",
        shortcut: "⏎",
        icon: <Sparkles className="h-4 w-4" />,
        keywords: ["nuevo", "crear", "set", "brief", "idea"],
        action: () => router.push("/brief/new"),
      },
      {
        id: "new-batch",
        section: "create",
        label: "Crear batch de sets",
        description: "5-30 sets variados",
        shortcut: "⌘⇧B",
        icon: <Wand2 className="h-4 w-4" />,
        keywords: ["batch", "varios", "muchos", "bulk"],
        action: () => router.push("/generate"),
      },
      {
        id: "new-asset",
        section: "create",
        label: "Subir asset",
        description: "Logo, foto, screenshot",
        shortcut: "U",
        icon: <Upload className="h-4 w-4" />,
        keywords: ["upload", "subir", "imagen", "logo", "foto"],
        action: () => router.push("/assets?upload=1"),
      },
      // NAVEGAR
      {
        id: "go-sets",
        section: "navigate",
        label: "Ir a Sets",
        shortcut: "G S",
        icon: <Layers className="h-4 w-4" />,
        keywords: ["sets", "home", "dashboard"],
        action: () => router.push("/"),
      },
      {
        id: "go-brief",
        section: "navigate",
        label: "Ir a Brief",
        shortcut: "G B",
        icon: <Bot className="h-4 w-4" />,
        keywords: ["brief", "agente", "agent"],
        action: () => router.push("/brief/new"),
      },
      {
        id: "go-calendar",
        section: "navigate",
        label: "Ir a Calendario",
        shortcut: "G C",
        icon: <Calendar className="h-4 w-4" />,
        keywords: ["calendario", "calendar", "agenda", "fechas"],
        action: () => router.push("/calendar"),
      },
      {
        id: "go-templates",
        section: "navigate",
        label: "Ir a Estilos / Templates",
        shortcut: "G T",
        icon: <Wand2 className="h-4 w-4" />,
        keywords: ["templates", "estilos", "remotion", "studio"],
        action: () => router.push("/studio"),
      },
      {
        id: "go-assets",
        section: "navigate",
        label: "Ir a Assets",
        icon: <Upload className="h-4 w-4" />,
        keywords: ["assets", "library", "uploads"],
        action: () => router.push("/assets"),
      },
      // PROYECTO
      {
        id: "settings",
        section: "project",
        label: "Ajustes del espacio",
        shortcut: "⌘,",
        icon: <Settings className="h-4 w-4" />,
        keywords: ["settings", "ajustes", "config"],
        action: () => router.push("/brand"),
      },
    ],
    [router]
  );

  // ─── Filtro fuzzy simple ───
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.description || ""} ${(c.keywords || []).join(" ")}`.toLowerCase();
      return q
        .split(/\s+/)
        .every((token) => haystack.includes(token));
    });
  }, [commands, query]);

  // ─── Reset al abrir / cerrar ───
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ─── Reset activeIdx cuando cambia la lista ───
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // ─── Scroll into view del item activo ───
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // ─── Keyboard navigation ───
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[activeIdx];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIdx, onClose]);

  if (!open) return null;

  // ─── Group by section preserving order ───
  const sections = filtered.reduce<Record<string, Cmd[]>>((acc, cmd) => {
    (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
    return acc;
  }, {});

  let runningIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={COPY.palette.placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono bg-muted/40 px-1.5 py-0.5 rounded text-muted-foreground">
            esc
          </kbd>
        </div>

        {/* Commands list */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {COPY.palette.empty}
            </div>
          ) : (
            Object.entries(sections).map(([section, items]) => (
              <div key={section} className="mb-1">
                <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {COPY.palette.sections[section as keyof typeof COPY.palette.sections]}
                </div>
                {items.map((cmd) => {
                  const idx = runningIdx++;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={cmd.id}
                      data-cmd-idx={idx}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
                        active ? "bg-accent/10 text-accent-foreground" : ""
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-md grid place-items-center shrink-0 ${
                          active ? "bg-accent/20 text-accent" : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] font-mono bg-muted/30 px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {active && <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-muted/40 rounded">↑↓</kbd> navegar</span>
            <span><kbd className="px-1 py-0.5 bg-muted/40 rounded">⏎</kbd> seleccionar</span>
          </span>
          <span>{filtered.length} acción{filtered.length !== 1 ? "es" : ""}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Provider · escucha cmd+k global ───

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      if (cmdKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
