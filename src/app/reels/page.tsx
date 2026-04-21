"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Video, Sparkles, ExternalLink, Terminal, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { ReelCard } from "@/components/reels/ReelCard";

type Project = {
  slug: string;
  name: string;
  icon?: string;
};

type Reel = {
  id: string;
  template: string;
  props: Record<string, unknown>;
  createdAt: string;
};

export default function ReelsPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [epmRunning, setEpmRunning] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const p = data.projects?.find(
          (x: Project) => x.slug === data.active
        );
        setActiveProject(p || null);
      })
      .catch(() => {});
    fetch("/api/reels")
      .then((r) => r.json())
      .then((d) => setReels(d.reels || []))
      .catch(() => {});
    // Ping EPM on port 3333
    fetch("http://localhost:3333", { mode: "no-cors" })
      .then(() => setEpmRunning(true))
      .catch(() => setEpmRunning(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 grid place-items-center">
                <Film className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Reels & Videos</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Proyecto:{" "}
                  <span className="font-medium text-foreground">
                    {activeProject?.icon} {activeProject?.name || "…"}
                  </span>{" "}
                  · <span className={epmRunning ? "text-green-600" : "text-muted-foreground"}>
                    EPM Studio {epmRunning ? "activo :3333 ✓" : "no detectado"}
                  </span>
                </p>
              </div>
            </div>
            <Link href="/reels/new">
              <Button variant="accent" className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo reel
              </Button>
            </Link>
          </div>

          {reels.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Reels guardados ({reels.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reels.map((r) => (
                  <ReelCard key={r.id} reel={r as never} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 mb-8">
            <div className="border border-border rounded-xl p-6 bg-surface/40">
              <Video className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-lg mb-2">Editor Pro Max</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Motor de video basado en Remotion · 25 componentes · 10 templates ·
                Claude Code driven.
              </p>
              <div className="space-y-1.5 text-xs">
                <div>🎬 TikTok · Instagram Reel · YouTube Short</div>
                <div>🎤 Whisper AI · auto-captions word-level</div>
                <div>✂️ Detección silencios · cortes automáticos</div>
                <div>🎨 7 paletas · 8 gradientes · 5 fuentes</div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-surface/40">
              <Sparkles className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-lg mb-2">Integración Storu Studio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Brand config · memoria AI · assets compartidos entre carruseles y reels
                del mismo proyecto.
              </p>
              <div className="space-y-1.5 text-xs">
                <div>🧠 Memoria del proyecto inyectada en chat AI</div>
                <div>🖼️ Assets del carrusel reutilizables en video</div>
                <div>📇 Export carrusel → MP4 animado (Phase 3)</div>
                <div>🎞️ Frames video → slides carrusel (Phase 3)</div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6 bg-surface/30">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-green-500/15 grid place-items-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  EPM integrado · 2 templates nativos en editor
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Remotion Player embebido en <code className="px-1.5 py-0.5 bg-surface rounded text-xs">/reels/new</code> ·
                  preview en vivo 1080×1920@30fps. Para render MP4 profesional abrí Remotion Studio en{" "}
                  <a
                    href="http://localhost:3333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-accent font-mono text-xs"
                  >
                    localhost:3333
                  </a>.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-accent">⚡</span>
                    <div>
                      <div className="font-semibold">TikTok Hook + CTA</div>
                      <div className="text-muted-foreground">10s · 3 actos · spring anim</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-accent">🔁</span>
                    <div>
                      <div className="font-semibold">Antes / Después</div>
                      <div className="text-muted-foreground">8s · wipe diagonal · stats</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/reels/new">
                    <Button variant="accent" size="sm" className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Crear reel ahora
                    </Button>
                  </Link>
                  <a
                    href="http://localhost:3333"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Remotion Studio :3333
                    </Button>
                  </a>
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      ← Volver al dashboard carruseles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-muted-foreground border-t border-border pt-6">
            <p>
              <strong>Roadmap Fase 3 · integración real:</strong> embed{" "}
              <code className="px-1.5 py-0.5 bg-surface rounded">
                @remotion/player
              </code>{" "}
              como componente · API{" "}
              <code className="px-1.5 py-0.5 bg-surface rounded">/api/render</code> con{" "}
              <code className="px-1.5 py-0.5 bg-surface rounded">
                @remotion/renderer
              </code>{" "}
              · UI picker de templates · chat AI con contexto compartido carrusel+reel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
