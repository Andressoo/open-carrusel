"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Layers,
  Image as ImageIcon,
  Film,
  Circle,
  Square,
  Smartphone,
  GalleryVertical,
  Sparkles,
  MessageCircleQuestion,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Pillar = "carousel" | "post" | "reel" | "story";

type FormatOption = {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  aspectRatio?: "1:1" | "4:5" | "9:16";
  onActivate: () => Promise<void> | void;
  disabled?: boolean;
  badge?: string;
};

const pillarMeta: Record<
  Pillar,
  { label: string; icon: React.ReactNode; description: string }
> = {
  carousel: {
    label: "Carrusel",
    icon: <Layers className="h-5 w-5" />,
    description: "Historia en slides · ideal para casos, frameworks, educación",
  },
  post: {
    label: "Post",
    icon: <ImageIcon className="h-5 w-5" />,
    description: "Una sola imagen · hook corto · máximo impacto visual",
  },
  reel: {
    label: "Reel",
    icon: <Film className="h-5 w-5" />,
    description: "Video vertical · hooks virales · TikTok · Reel · Short",
  },
  story: {
    label: "Historia",
    icon: <GalleryVertical className="h-5 w-5" />,
    description: "Stories IG 9:16 · polls · Q&A · countdown · quiz",
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateHubDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [pillar, setPillar] = useState<Pillar>("carousel");
  const [creating, setCreating] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPillar("carousel");
      setNameInput("");
      setSelectedFormatId(null);
      setCreating(false);
    }
  }, [open]);

  const createCarousel = async (aspectRatio: "1:1" | "4:5" | "9:16") => {
    const name = nameInput.trim() || "Nuevo carrusel";
    setCreating(true);
    try {
      const res = await fetch("/api/carousels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, aspectRatio }),
      });
      if (res.ok) {
        const data = await res.json();
        onClose();
        router.push(`/carousel/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const formats: Record<Pillar, FormatOption[]> = {
    carousel: [
      {
        id: "car-1-1",
        name: "Cuadrado 1:1",
        desc: "1080×1080 · feed clásico IG",
        icon: <Square className="h-5 w-5" />,
        aspectRatio: "1:1",
        onActivate: () => createCarousel("1:1"),
      },
      {
        id: "car-4-5",
        name: "Portrait 4:5",
        desc: "1080×1350 · máxima visibilidad feed",
        icon: <Layers className="h-5 w-5" />,
        aspectRatio: "4:5",
        badge: "Recomendado",
        onActivate: () => createCarousel("4:5"),
      },
      {
        id: "car-9-16",
        name: "Story-style 9:16",
        desc: "1080×1920 · formato historia para swipe",
        icon: <Smartphone className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => createCarousel("9:16"),
      },
      {
        id: "car-vs",
        name: "Formato VS (Livy)",
        desc: "Comparación binaria · hamburguesa vs bowl",
        icon: <Circle className="h-5 w-5" />,
        aspectRatio: "4:5",
        onActivate: () => createCarousel("4:5"),
        badge: "Livy",
      },
      {
        id: "car-3camp",
        name: "3 Campañas paralelas",
        desc: "Múltiples estrategias · Enohfit-style",
        icon: <Sparkles className="h-5 w-5" />,
        aspectRatio: "4:5",
        onActivate: () => createCarousel("4:5"),
        badge: "Livy",
      },
      {
        id: "car-lab",
        name: "Laboratorio educativo",
        desc: "Data · framework · insights medibles",
        icon: <Circle className="h-5 w-5" />,
        aspectRatio: "4:5",
        onActivate: () => createCarousel("4:5"),
        badge: "Livy",
      },
    ],
    post: [
      {
        id: "post-1-1",
        name: "Cuadrado 1:1",
        desc: "Hook visual · una sola imagen",
        icon: <Square className="h-5 w-5" />,
        aspectRatio: "1:1",
        onActivate: () => createCarousel("1:1"),
      },
      {
        id: "post-4-5",
        name: "Portrait 4:5",
        desc: "Máxima ocupación feed",
        icon: <ImageIcon className="h-5 w-5" />,
        aspectRatio: "4:5",
        onActivate: () => createCarousel("4:5"),
      },
    ],
    reel: [
      {
        id: "reel-hook",
        name: "Hook + CTA · 15s",
        desc: "Gancho viral · TikTok/Reel/Short",
        icon: <Film className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
      {
        id: "reel-case",
        name: "Caso real · 30s",
        desc: "Antes/después · merchant story",
        icon: <Film className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
      {
        id: "reel-anatomy",
        name: "Anatomía campaña · 45s",
        desc: "Deep-dive · estructura Livy F4",
        icon: <Sparkles className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
      {
        id: "reel-tiktok",
        name: "TikTok · 1080×1920",
        desc: "Hook-body-CTA template EPM",
        icon: <Smartphone className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
      {
        id: "reel-yt",
        name: "YouTube Short",
        desc: "Particle effects · 1080×1920",
        icon: <Film className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
      {
        id: "reel-talking",
        name: "Talking head + auto-captions",
        desc: "Whisper AI · silence detection",
        icon: <MessageCircleQuestion className="h-5 w-5" />,
        onActivate: () => router.push("/reels"),
      },
    ],
    story: [
      {
        id: "story-poll",
        name: "Poll dinámico",
        desc: "Sí/No · validar hipótesis en 2h",
        icon: <MessageCircleQuestion className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
      {
        id: "story-quiz",
        name: "Quiz educativo",
        desc: "Pregunta framework + respuesta",
        icon: <Sparkles className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
      {
        id: "story-countdown",
        name: "Countdown · urgencia",
        desc: "Drop · evento · launch",
        icon: <Timer className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
      {
        id: "story-qa",
        name: "Q&A sticker",
        desc: "Autoridad · construir comunidad",
        icon: <MessageCircleQuestion className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
      {
        id: "story-ba",
        name: "Antes/Después",
        desc: "Transformación visual · Highlight",
        icon: <GalleryVertical className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
      {
        id: "story-swipe",
        name: "Swipe-up link · UTM",
        desc: "Funnel a landing con tracking",
        icon: <GalleryVertical className="h-5 w-5" />,
        aspectRatio: "9:16",
        onActivate: () => router.push("/stories"),
      },
    ],
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Crear nuevo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elegí qué querés producir y en qué formato
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Pillar tabs */}
        <div className="grid grid-cols-4 border-b border-border">
          {(Object.keys(pillarMeta) as Pillar[]).map((p) => {
            const meta = pillarMeta[p];
            const active = p === pillar;
            return (
              <button
                key={p}
                onClick={() => setPillar(p)}
                className={`py-4 px-3 flex flex-col items-center gap-1.5 transition-colors border-b-2 ${
                  active
                    ? "border-accent text-foreground bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <div className={active ? "text-accent" : ""}>{meta.icon}</div>
                <div className="font-semibold text-sm">{meta.label}</div>
              </button>
            );
          })}
        </div>

        {/* Context desc */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {pillarMeta[pillar].description}
          </p>
        </div>

        {/* Name input (only for carousel/post — reels/stories go to their module) */}
        {(pillar === "carousel" || pillar === "post") && (
          <div className="px-6 pb-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Nombre (opcional) · ej: D01 · Provocación · Alik Swimwear"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent"
            />
          </div>
        )}

        {/* Format grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {formats[pillar].map((f) => (
              <button
                key={f.id}
                onClick={async () => {
                  if (creating) return;
                  setSelectedFormatId(f.id);
                  await f.onActivate();
                }}
                disabled={creating || f.disabled}
                className="text-left border border-border rounded-xl p-4 hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                {f.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-accent text-accent-foreground rounded-full uppercase tracking-wide">
                    {f.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-accent/10 grid place-items-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent">{f.icon}</span>
                </div>
                <div className="font-semibold text-sm mb-1">{f.name}</div>
                <div className="text-xs text-muted-foreground leading-snug">
                  {f.desc}
                </div>
                {f.aspectRatio && (
                  <div className="text-[10px] font-mono text-muted-foreground mt-2 tracking-wide">
                    {f.aspectRatio}
                  </div>
                )}
                {selectedFormatId === f.id && creating && (
                  <div className="absolute inset-0 bg-background/80 rounded-xl grid place-items-center">
                    <div className="text-xs text-accent font-semibold">Creando…</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-surface/20">
          💡 Todo se guarda en el proyecto activo. Cambiá de proyecto en el selector
          superior.
        </div>
      </div>
    </div>
  );
}
