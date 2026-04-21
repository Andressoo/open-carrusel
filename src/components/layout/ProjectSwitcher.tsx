"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, Plus, FolderOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Project = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
};

type Props = {
  onProjectChange?: (slug: string) => void;
};

export function ProjectSwitcher({ onProjectChange }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        setActive(data.active || "");
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSwitch = async (slug: string) => {
    if (slug === active) {
      setOpen(false);
      return;
    }
    await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setActive(slug);
    setOpen(false);
    onProjectChange?.(slug);
    // Reload page to refresh carousels/brand for new project
    window.location.reload();
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, icon: newIcon }),
    });
    if (res.ok) {
      setNewName("");
      setNewIcon("📁");
      setCreating(false);
      load();
      // Auto-switch to new project
      handleSwitch(slug);
    }
  };

  const activeProject = projects.find((p) => p.slug === active);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="gap-2 px-2.5 h-9 max-w-[240px]"
      >
        <span className="text-base">{activeProject?.icon || "📁"}</span>
        <span className="font-medium text-sm truncate">
          {activeProject?.name || "Seleccionar proyecto"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Proyectos
          </div>
          <div className="max-h-80 overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p.slug}
                onClick={() => handleSwitch(p.slug)}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-surface transition-colors text-left"
              >
                <span className="text-lg shrink-0">{p.icon || "📁"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  {p.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {p.description}
                    </div>
                  )}
                </div>
                {p.slug === active && (
                  <Check className="h-4 w-4 text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border">
            {creating ? (
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value.slice(0, 2))}
                    className="w-12 px-2 py-1.5 text-center text-base border border-border rounded bg-surface"
                    placeholder="📁"
                  />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") {
                        setCreating(false);
                        setNewName("");
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2.5 py-1.5 text-sm border border-border rounded bg-surface outline-none focus:border-accent"
                    placeholder="Nombre del proyecto…"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className="flex-1 h-8"
                  >
                    Crear
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                    }}
                    className="h-8"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-surface transition-colors text-sm text-left"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo proyecto…</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
