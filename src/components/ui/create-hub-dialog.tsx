"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Layers,
  Image as ImageIcon,
  Film,
  GalleryVertical,
  Sparkles,
  MessageCircleQuestion,
  Timer,
  TrendingUp,
  Users,
  DollarSign,
  Repeat,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  Check,
  Wand2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ════════════ TIPOS ════════════

type Goal = {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  accent: string; // tailwind bg class
  recommend: Format[]; // formats that work best for this goal
};

type Format = {
  id: string;
  type: "carousel" | "post" | "reel" | "story";
  label: string;
  desc: string;
  duration?: string;
  aspectRatio?: "1:1" | "4:5" | "9:16";
  icon: React.ReactNode;
  example?: string;
  bestFor?: string[]; // goal ids it's best for
};

// ════════════ DATOS ════════════

const GOALS: Goal[] = [
  {
    id: "capture",
    label: "Captar nuevos clientes",
    desc: "Atraer audiencia fría que aún no te conoce.",
    icon: <Users className="h-5 w-5" />,
    accent: "bg-rose-500/10 text-rose-600",
    recommend: [],
  },
  {
    id: "valley",
    label: "Llenar horas/días valle",
    desc: "Activar franjas con baja demanda sin bajar precio.",
    icon: <Clock className="h-5 w-5" />,
    accent: "bg-amber-500/10 text-amber-600",
    recommend: [],
  },
  {
    id: "ticket",
    label: "Subir ticket promedio",
    desc: "Incrementar lo que cada cliente gasta por compra.",
    icon: <TrendingUp className="h-5 w-5" />,
    accent: "bg-violet-500/10 text-violet-600",
    recommend: [],
  },
  {
    id: "recompra",
    label: "Generar recompra",
    desc: "Que clientes existentes vuelvan más seguido.",
    icon: <Repeat className="h-5 w-5" />,
    accent: "bg-blue-500/10 text-blue-600",
    recommend: [],
  },
  {
    id: "launch",
    label: "Lanzar algo nuevo",
    desc: "Producto · colección · experiencia · servicio.",
    icon: <Zap className="h-5 w-5" />,
    accent: "bg-emerald-500/10 text-emerald-600",
    recommend: [],
  },
  {
    id: "validate",
    label: "Validar idea con audiencia",
    desc: "Testear hipótesis en horas, no semanas.",
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    accent: "bg-pink-500/10 text-pink-600",
    recommend: [],
  },
  {
    id: "cashflow",
    label: "Generar flujo de caja",
    desc: "Cash hoy · consumo después (Bonus Prize · preventa).",
    icon: <DollarSign className="h-5 w-5" />,
    accent: "bg-teal-500/10 text-teal-600",
    recommend: [],
  },
  {
    id: "autority",
    label: "Construir autoridad",
    desc: "Educar · posicionar · diferenciarte del commodity.",
    icon: <Target className="h-5 w-5" />,
    accent: "bg-indigo-500/10 text-indigo-600",
    recommend: [],
  },
];

const FORMATS: Format[] = [
  // Carouseles
  {
    id: "car-case",
    type: "carousel",
    label: "Caso de estudio",
    desc: "Antes/Después de un cliente real con data concreta.",
    aspectRatio: "4:5",
    icon: <Layers className="h-5 w-5" />,
    example: "Punto G Gourmet · +59% midweek en 60 días",
    bestFor: ["autority", "capture"],
  },
  {
    id: "car-framework",
    type: "carousel",
    label: "Framework educativo",
    desc: "Matriz 2×2 · checklist · guía para tomar decisiones.",
    aspectRatio: "4:5",
    icon: <Target className="h-5 w-5" />,
    example: "4 estrategias de ventas según tu objetivo",
    bestFor: ["autority"],
  },
  {
    id: "car-listicle",
    type: "carousel",
    label: "5 errores / 5 formas",
    desc: "Listicle save-worthy con punto accionable cada slide.",
    aspectRatio: "4:5",
    icon: <Layers className="h-5 w-5" />,
    example: "5 errores en tu promo de hoy",
    bestFor: ["autority", "capture"],
  },
  {
    id: "car-vs",
    type: "carousel",
    label: "VS · comparación",
    desc: "Dos caminos, una decisión. Hamburguesa vs Bowl.",
    aspectRatio: "4:5",
    icon: <Layers className="h-5 w-5" />,
    example: "Rebajar vs. Diseñar incentivos",
    bestFor: ["autority", "validate"],
  },
  {
    id: "car-launch",
    type: "carousel",
    label: "Launch · producto nuevo",
    desc: "3-5 slides con hook + features + CTA a preventa.",
    aspectRatio: "4:5",
    icon: <Zap className="h-5 w-5" />,
    example: "Drop colección · 48h",
    bestFor: ["launch", "cashflow"],
  },
  // Posts
  {
    id: "post-stat",
    type: "post",
    label: "Stat shock",
    desc: "Un número impactante que detiene el scroll.",
    aspectRatio: "1:1",
    icon: <ImageIcon className="h-5 w-5" />,
    example: "73% de restaurantes bajan precio midweek",
    bestFor: ["autority", "capture"],
  },
  {
    id: "post-quote",
    type: "post",
    label: "Quote · manifiesto",
    desc: "Frase corta y punzante · alta shareability.",
    aspectRatio: "1:1",
    icon: <ImageIcon className="h-5 w-5" />,
    example: '"No compres por comprar. Compra para ganar."',
    bestFor: ["autority"],
  },
  {
    id: "post-announce",
    type: "post",
    label: "Anuncio",
    desc: "Lanzamiento · apertura · fecha especial.",
    aspectRatio: "4:5",
    icon: <ImageIcon className="h-5 w-5" />,
    example: "Nueva sede · Abrimos el 15",
    bestFor: ["launch"],
  },
  // Reels
  {
    id: "reel-hook",
    type: "reel",
    label: "Hook + CTA · 10s",
    desc: "Gancho viral corto para TikTok/Reel/Short.",
    duration: "10s",
    aspectRatio: "9:16",
    icon: <Zap className="h-5 w-5" />,
    example: "Deja de rebajar. Empieza a diseñar.",
    bestFor: ["capture", "validate"],
  },
  {
    id: "reel-ba",
    type: "reel",
    label: "Antes/Después · 8s",
    desc: "Transformación visual con wipe diagonal.",
    duration: "8s",
    aspectRatio: "9:16",
    icon: <Repeat className="h-5 w-5" />,
    example: "12% retención → 73% retención",
    bestFor: ["autority", "capture"],
  },
  {
    id: "reel-manifesto",
    type: "reel",
    label: "Manifiesto 60s",
    desc: "Hook · panorama · casos · framework · CTA.",
    duration: "60s",
    aspectRatio: "9:16",
    icon: <Film className="h-5 w-5" />,
    example: "Por qué diseñar nuevas formas de vender",
    bestFor: ["autority", "capture"],
  },
  // Stories
  {
    id: "story-poll",
    type: "story",
    label: "Poll binario",
    desc: "Sí/No con framing que revela dolor · research gratis.",
    aspectRatio: "9:16",
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    example: '"¿Tu martes duele?"',
    bestFor: ["validate"],
  },
  {
    id: "story-quiz",
    type: "story",
    label: "Quiz educativo",
    desc: "Pregunta framework · respuesta con explicación.",
    aspectRatio: "9:16",
    icon: <Sparkles className="h-5 w-5" />,
    example: "¿Qué campaña lanzar si tenés horas valle?",
    bestFor: ["autority", "validate"],
  },
  {
    id: "story-countdown",
    type: "story",
    label: "Countdown · urgencia",
    desc: "Drop · evento · launch con compromiso RSVP.",
    aspectRatio: "9:16",
    icon: <Timer className="h-5 w-5" />,
    example: "Drop sábado 8pm · 72h",
    bestFor: ["launch", "cashflow"],
  },
];

// ════════════ COMPONENT ════════════

type Step = "ai-idea" | "ai-preview" | "goal" | "format" | "brief" | "creating";

type AIBrief = {
  name: string;
  topic: string;
  goal: string;
  archetype?: string;
  ctaKeyword?: string;
  anchorBrand?: string | null;
  thread?: string;
  experimentPurpose?: string;
  hypothesis?: string;
  kpis?: string[];
  sceneDetails?: string;
  possibleCaptions?: string[];
  hashtags?: string[];
  publishStrategy?: {
    order?: string | string[];
    cadence?: string;
    bestDayTime?: string;
  };
  pieces?: {
    story?: { dynamic?: string; text?: string; options?: string[]; angle?: string };
    carousel?: { slides?: number; hookText?: string; insight?: string; proofPoint?: string; ctaText?: string };
    reel?: { template?: string; duration?: number; hook?: string; body?: string; cta?: string };
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateHubDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("ai-idea");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [format, setFormat] = useState<Format | null>(null);
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  /** Mode: 'set' = 1 Story + 1 Carousel + 1 Reel coherent line (default)
             'single' = only the chosen format */
  const [mode, setMode] = useState<"set" | "single">("set");
  const [ctaKeyword, setCtaKeyword] = useState("");

  // ═══ Experiment fields (only surface in set mode) ═══
  const [experimentPurpose, setExperimentPurpose] = useState("");
  const [sceneDetails, setSceneDetails] = useState("");
  const [possibleCaption, setPossibleCaption] = useState("");
  const [anchorBrand, setAnchorBrand] = useState("");
  const [references, setReferences] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);

  // ═══ AI Magic mode ═══
  const [aiIdea, setAiIdea] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiBrief, setAiBrief] = useState<AIBrief | null>(null);
  const [aiPublishDate, setAiPublishDate] = useState("");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("ai-idea");
        setGoal(null);
        setFormat(null);
        setTopic("");
        setName("");
        setCtaKeyword("");
        setExperimentPurpose("");
        setSceneDetails("");
        setPossibleCaption("");
        setAnchorBrand("");
        setReferences([]);
        setMode("set");
        setCreating(false);
        setAiIdea("");
        setAiLoading(false);
        setAiError("");
        setAiBrief(null);
        setAiPublishDate("");
      }, 200);
    }
  }, [open]);

  // ═══ AI generate ═══
  const generateFromIdea = async () => {
    if (!aiIdea.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/generate-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: aiIdea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "AI falló");
        return;
      }
      setAiBrief(data as AIBrief);
      setStep("ai-preview");
    } catch (err) {
      setAiError((err as Error).message || "network error");
    } finally {
      setAiLoading(false);
    }
  };

  const confirmAIBrief = async () => {
    if (!aiBrief) return;
    setCreating(true);
    try {
      const setRes = await fetch("/api/content-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiBrief.topic,
          goal: aiBrief.goal,
          archetype: aiBrief.archetype,
          name: aiBrief.name,
          thread: aiBrief.thread,
          ctaKeyword: aiBrief.ctaKeyword,
          anchorBrand: aiBrief.anchorBrand || undefined,
          experimentPurpose: aiBrief.experimentPurpose,
          hypothesis: aiBrief.hypothesis,
          kpis: aiBrief.kpis,
          sceneDetails: aiBrief.sceneDetails,
          possibleCaptions: aiBrief.possibleCaptions,
          hashtags: aiBrief.hashtags,
          publishDate: aiPublishDate || undefined,
          status: "draft",
        }),
      });
      const set = await setRes.json();
      onClose();
      router.push(`/set/${set.id}?ai=1`);
    } finally {
      setCreating(false);
    }
  };

  const handleUploadRef = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setReferences((prev) => [
            ...prev,
            { url: data.url, type, name: file.name },
          ]);
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const recommendedFormats = goal
    ? FORMATS.filter((f) => f.bestFor?.includes(goal.id))
    : [];
  const otherFormats = goal
    ? FORMATS.filter((f) => !f.bestFor?.includes(goal.id))
    : FORMATS;

  const proceed = async () => {
    if (!format || !goal) return;
    setCreating(true);

    try {
      const pieceName =
        name.trim() ||
        (topic.trim() && `${goal.label} · ${topic}`) ||
        `${format.label} · ${new Date().toLocaleDateString()}`;

      // ═══ SET MODE ═══ Create ContentSet + all 3 pieces linked
      if (mode === "set") {
        // 1. Create ContentSet with all experiment fields
        const setRes = await fetch("/api/content-sets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            goal: goal.id,
            archetype: format.id,
            name: pieceName,
            ctaKeyword: ctaKeyword.trim().toUpperCase() || undefined,
            thread: `Línea coherente: ${topic} · ${goal.label}`,
            experimentPurpose: experimentPurpose.trim() || undefined,
            sceneDetails: sceneDetails.trim() || undefined,
            possibleCaptions: possibleCaption.trim()
              ? [possibleCaption.trim()]
              : undefined,
            anchorBrand: anchorBrand.trim() || undefined,
            references: references.length ? references : undefined,
            status: "draft",
          }),
        });
        const set = await setRes.json();

        // 2. Create the primary piece (the format the user picked)
        if (format.type === "carousel" || format.type === "post") {
          const aspectRatio = format.aspectRatio || "4:5";
          const cRes = await fetch("/api/carousels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: pieceName, aspectRatio }),
          });
          if (cRes.ok) {
            const car = await cRes.json();
            // Link carousel to set
            await fetch("/api/content-sets", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: set.id,
                piece: "carousel",
                updates: { id: car.id, status: "draft" },
              }),
            });
            onClose();
            router.push(
              `/carousel/${car.id}?goal=${goal.id}&format=${format.id}&topic=${encodeURIComponent(topic)}&set=${set.id}`
            );
          }
        } else if (format.type === "reel") {
          onClose();
          router.push(
            `/reels/new?goal=${goal.id}&format=${format.id}&topic=${encodeURIComponent(topic)}&set=${set.id}&cta=${encodeURIComponent(ctaKeyword)}`
          );
        } else if (format.type === "story") {
          onClose();
          router.push(
            `/stories?goal=${goal.id}&format=${format.id}&set=${set.id}`
          );
        }
        return;
      }

      // ═══ SINGLE MODE ═══ Only create the chosen piece (legacy)
      if (format.type === "carousel" || format.type === "post") {
        const aspectRatio = format.aspectRatio || "4:5";
        const res = await fetch("/api/carousels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: pieceName, aspectRatio }),
        });
        if (res.ok) {
          const data = await res.json();
          onClose();
          router.push(
            `/carousel/${data.id}?goal=${goal.id}&format=${format.id}&topic=${encodeURIComponent(topic)}`
          );
        }
      } else if (format.type === "reel") {
        onClose();
        router.push(
          `/reels/new?goal=${goal.id}&format=${format.id}&topic=${encodeURIComponent(topic)}`
        );
      } else if (format.type === "story") {
        onClose();
        router.push(`/stories?goal=${goal.id}&format=${format.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  const steps: Array<{ id: Step; label: string }> = [
    { id: "goal", label: "Objetivo" },
    { id: "format", label: "Formato" },
    { id: "brief", label: "Brief" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header · steps indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">Crear nueva pieza</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Empezamos por qué querés lograr · el formato sale solo
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className={`flex items-center gap-2 ${step.startsWith("ai-") ? "hidden" : ""}`}>
            {steps.map((s, i) => {
              const active = s.id === step;
              const done = i < currentIdx;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      active
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : done
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : done
                          ? "bg-emerald-500 text-white"
                          : "bg-muted-foreground/30 text-background"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-px ${
                        done ? "bg-emerald-500/50" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ═══ STEP 0 · AI IDEA ═══ */}
          {step === "ai-idea" && (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono tracking-wider text-accent uppercase mb-1 flex items-center gap-1.5">
                    <Wand2 className="h-3 w-3" /> Modo AI
                  </div>
                  <h3 className="text-lg font-semibold">Describí la idea · el AI arma el set</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    1 idea → Historia + Carrusel + Reel · captions · hashtags · estrategia de publicación.
                    Hereda tu brand y memoria del proyecto.
                  </p>
                </div>
                <button
                  onClick={() => setStep("goal")}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline shrink-0 mt-1"
                >
                  Prefiero modo manual →
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  placeholder="Ej: Quiero activar mi restaurante en Barranquilla los martes con una promo de cena para parejas. La gente dice que martes es muerto, quiero demostrar lo contrario con un caso real."
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none leading-relaxed"
                  autoFocus
                  disabled={aiLoading}
                />
                <div className="absolute bottom-2 right-3 text-[10px] font-mono text-muted-foreground">
                  {aiIdea.length} chars
                </div>
              </div>

              {aiError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  {aiError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {[
                  "Activar martes con cena para parejas · restaurante BAQ",
                  "Llenar spa un jueves 3-6pm · paquete relax",
                  "Lanzar nueva colección · drop 48h cápsula",
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setAiIdea(s)}
                    disabled={aiLoading}
                    className="text-left border border-border rounded-lg p-2.5 hover:border-accent/50 hover:bg-accent/5 transition-colors text-muted-foreground leading-snug"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-[11px] text-muted-foreground">
                  {aiLoading ? "⏳ Claude analizando · benchmarks · memoria del proyecto…" : "Toma ~20-40s · genera brief completo"}
                </div>
                <Button
                  onClick={generateFromIdea}
                  variant="accent"
                  disabled={!aiIdea.trim() || aiLoading}
                  className="gap-2"
                >
                  {aiLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar set completo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ═══ STEP 0b · AI PREVIEW ═══ */}
          {step === "ai-preview" && aiBrief && (
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs font-mono tracking-wider text-accent uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Brief generado
                </div>
                <h3 className="text-lg font-semibold">{aiBrief.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{aiBrief.topic}</p>
              </div>

              {/* Metadata pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                  🎯 {aiBrief.goal}
                </span>
                {aiBrief.archetype && (
                  <span className="px-2 py-1 rounded-full bg-violet-500/10 text-violet-600 font-semibold">
                    🧬 {aiBrief.archetype}
                  </span>
                )}
                {aiBrief.ctaKeyword && (
                  <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold">
                    📣 {aiBrief.ctaKeyword}
                  </span>
                )}
                {aiBrief.anchorBrand && (
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                    🏷 {aiBrief.anchorBrand}
                  </span>
                )}
              </div>

              {/* Thread narrative */}
              {aiBrief.thread && (
                <div className="border border-border rounded-xl p-3 bg-muted/20">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Hilo narrativo</div>
                  <div className="text-sm leading-relaxed">{aiBrief.thread}</div>
                </div>
              )}

              {/* Experiment */}
              {(aiBrief.experimentPurpose || aiBrief.hypothesis || aiBrief.kpis?.length) && (
                <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    🧪 Experimento
                  </div>
                  {aiBrief.experimentPurpose && (
                    <div className="text-xs"><b>Propósito:</b> {aiBrief.experimentPurpose}</div>
                  )}
                  {aiBrief.hypothesis && (
                    <div className="text-xs"><b>Hipótesis:</b> {aiBrief.hypothesis}</div>
                  )}
                  {aiBrief.kpis && aiBrief.kpis.length > 0 && (
                    <div className="text-xs">
                      <b>KPIs:</b>
                      <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                        {aiBrief.kpis.map((k, i) => <li key={i}>{k}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Pieces preview */}
              {aiBrief.pieces && (
                <div className="grid grid-cols-3 gap-2">
                  {aiBrief.pieces.story && (
                    <div className="border border-border rounded-xl p-3 bg-background">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">📱 Historia</div>
                      <div className="text-[11px] font-semibold mb-1">{aiBrief.pieces.story.dynamic}</div>
                      <div className="text-xs leading-snug">{aiBrief.pieces.story.text}</div>
                      {aiBrief.pieces.story.options && aiBrief.pieces.story.options.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {aiBrief.pieces.story.options.map((o, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted/60 rounded">{o}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {aiBrief.pieces.carousel && (
                    <div className="border border-border rounded-xl p-3 bg-background">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">📇 Carrusel</div>
                      <div className="text-[11px] font-semibold mb-1">{aiBrief.pieces.carousel.slides || 5} slides</div>
                      <div className="text-xs leading-snug line-clamp-3">{aiBrief.pieces.carousel.hookText}</div>
                    </div>
                  )}
                  {aiBrief.pieces.reel && (
                    <div className="border border-border rounded-xl p-3 bg-background">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">🎬 Reel</div>
                      <div className="text-[11px] font-semibold mb-1">{aiBrief.pieces.reel.template} · {aiBrief.pieces.reel.duration}s</div>
                      <div className="text-xs leading-snug line-clamp-3">{aiBrief.pieces.reel.hook}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Captions */}
              {aiBrief.possibleCaptions && aiBrief.possibleCaptions.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Captions candidatas</div>
                  <div className="space-y-1.5">
                    {aiBrief.possibleCaptions.slice(0, 5).map((c, i) => (
                      <div key={i} className="text-xs border border-border rounded-lg p-2 bg-background leading-snug">
                        <span className="font-mono text-[10px] text-muted-foreground mr-1">{i + 1}.</span>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {aiBrief.hashtags && aiBrief.hashtags.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Hashtags</div>
                  <div className="flex flex-wrap gap-1">
                    {aiBrief.hashtags.map((h, i) => (
                      <span key={i} className="text-[11px] font-mono px-2 py-0.5 bg-accent/10 text-accent rounded">
                        #{h.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish strategy + schedule */}
              {aiBrief.publishStrategy && (
                <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">📅 Estrategia de publicación</div>
                  {aiBrief.publishStrategy.order && (
                    <div className="text-xs"><b>Orden:</b> {Array.isArray(aiBrief.publishStrategy.order) ? aiBrief.publishStrategy.order.join(" → ") : aiBrief.publishStrategy.order}</div>
                  )}
                  {aiBrief.publishStrategy.cadence && (
                    <div className="text-xs"><b>Cadencia:</b> {aiBrief.publishStrategy.cadence}</div>
                  )}
                  {aiBrief.publishStrategy.bestDayTime && (
                    <div className="text-xs"><b>Mejor momento:</b> {aiBrief.publishStrategy.bestDayTime}</div>
                  )}
                  <div className="pt-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Fecha objetivo de publicación
                    </label>
                    <input
                      type="date"
                      value={aiPublishDate}
                      onChange={(e) => setAiPublishDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 1 · GOAL ═══ */}
          {step === "goal" && (
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-1">
                  Paso 1
                </div>
                <h3 className="text-lg font-semibold">¿Qué querés lograr hoy?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Elegí un objetivo comercial · te recomendamos el mejor formato.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGoal(g);
                      setStep("format");
                    }}
                    className="text-left border border-border rounded-xl p-4 hover:border-accent hover:bg-accent/5 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${g.accent}`}
                      >
                        {g.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center justify-between">
                          <span>{g.label}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-snug">
                          {g.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 2 · FORMAT ═══ */}
          {step === "format" && goal && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`px-3 py-1 rounded-full ${goal.accent} flex items-center gap-2 text-xs font-semibold`}
                >
                  {goal.icon}
                  {goal.label}
                </div>
              </div>

              {/* Mode toggle · SET (default) vs SINGLE */}
              <div className="border border-border rounded-xl p-1 bg-muted/30 flex gap-1">
                <button
                  onClick={() => setMode("set")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    mode === "set"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Set completo
                  <span className="text-[10px] font-mono opacity-70">
                    3 piezas coherentes
                  </span>
                </button>
                <button
                  onClick={() => setMode("single")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === "single"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pieza única
                </button>
              </div>
              {mode === "set" && (
                <div className="border border-accent/30 bg-accent/5 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 grid place-items-center shrink-0">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold mb-1">1 idea = 3 piezas</div>
                    <div className="text-muted-foreground leading-snug">
                      Storu genera <b className="text-foreground">Historia + Carrusel + Reel</b>{" "}
                      coherentes entre sí · mismo tema · mismo hook · misma CTA keyword ·
                      misma paleta · hilo narrativo conectado.
                    </div>
                    <div className="text-muted-foreground mt-1.5 leading-snug">
                      Elegí por dónde arrancar · las otras 2 quedan en{" "}
                      <b className="text-foreground">pending</b> para completar cuando quieras.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-1">
                  Paso 2
                </div>
                <h3 className="text-lg font-semibold">
                  {mode === "set" ? "¿Por dónde empezamos?" : "Elegí el formato"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "set"
                    ? "Cualquier pieza es buen punto de partida · las otras 2 se crean después."
                    : "Recomendados primero · después todos los otros."}
                </p>
              </div>

              {/* Recommended */}
              {recommendedFormats.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wand2 className="h-3 w-3 text-accent" />
                    Recomendados para este objetivo
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {recommendedFormats.map((f) => (
                      <FormatCard
                        key={f.id}
                        format={f}
                        onClick={() => {
                          setFormat(f);
                          setStep("brief");
                        }}
                        highlighted
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Others grouped by type */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Otros formatos
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {otherFormats.map((f) => (
                    <FormatCard
                      key={f.id}
                      format={f}
                      onClick={() => {
                        setFormat(f);
                        setStep("brief");
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3 · BRIEF ═══ */}
          {step === "brief" && goal && format && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`px-3 py-1 rounded-full ${goal.accent} flex items-center gap-2 text-xs font-semibold`}
                >
                  {goal.icon}
                  {goal.label}
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <div className="px-3 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-2 text-xs font-semibold">
                  {format.icon}
                  {format.label}
                  {format.duration && <span className="opacity-60">· {format.duration}</span>}
                  {format.aspectRatio && <span className="opacity-60">· {format.aspectRatio}</span>}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-1">
                  Paso 3
                </div>
                <h3 className="text-lg font-semibold">Dame un brief corto</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Con esto el AI arranca · puedes ajustar todo en el editor después.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Tema / producto / servicio
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={format.example || "¿De qué va esta pieza?"}
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    autoFocus
                  />
                  <div className="text-[11px] text-muted-foreground mt-1.5">
                    Ejemplo: <span className="italic">{format.example || "Cena entre semana en mi restaurante"}</span>
                  </div>
                </div>

                {(format.type === "carousel" || format.type === "post") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Nombre de la pieza <span className="opacity-50">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="D51 · Nuevo carrusel"
                      className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                )}

                {mode === "set" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        CTA Keyword · comment-to-DM
                      </label>
                      <input
                        type="text"
                        value={ctaKeyword}
                        onChange={(e) =>
                          setCtaKeyword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                        }
                        placeholder="MARTES · DROP · RETO · EXPERIMENTO"
                        className="w-full px-4 py-2.5 text-sm font-mono border border-border rounded-lg bg-surface/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 uppercase tracking-wider"
                      />
                      <div className="text-[11px] text-muted-foreground mt-1.5">
                        La misma palabra va a aparecer en las 3 piezas · los seguidores
                        comentan esta palabra y reciben auto-respuesta por DM.
                      </div>
                    </div>

                    {/* Experimento · propósito */}
                    <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-accent/15 text-accent grid place-items-center text-xs">
                          🧪
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Al final son experimentos</div>
                          <div className="text-[11px] text-muted-foreground">
                            Definí propósito · escena · captions · referencias. El AI los usa para coherencia.
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Propósito del experimento · qué vas a medir
                        </label>
                        <textarea
                          value={experimentPurpose}
                          onChange={(e) => setExperimentPurpose(e.target.value)}
                          placeholder="Hipótesis: si publicamos un caso de uso real, la tasa de DMs con keyword MARTES duplica vs. un carrusel genérico."
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Escena · locación · mood · props
                        </label>
                        <textarea
                          value={sceneDetails}
                          onChange={(e) => setSceneDetails(e.target.value)}
                          placeholder="Restaurante en Barranquilla, martes 7pm. Plato principal con plating gourmet. Luz cálida candlelit. Mesa con 2 comensales."
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                            Marca ancla · opcional
                          </label>
                          <input
                            type="text"
                            value={anchorBrand}
                            onChange={(e) => setAnchorBrand(e.target.value)}
                            placeholder="Punto G Gourmet"
                            className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                            Caption candidata
                          </label>
                          <input
                            type="text"
                            value={possibleCaption}
                            onChange={(e) => setPossibleCaption(e.target.value)}
                            placeholder="¿Por qué tu martes vale igual que tu sábado?"
                            className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                          />
                        </div>
                      </div>

                      {/* Reference images upload */}
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Referencias visuales · logos · fotos producto · inspiración
                        </label>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {references.map((r, i) => (
                            <div
                              key={i}
                              className="relative group rounded-lg border border-border overflow-hidden w-16 h-16 bg-surface"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={r.url}
                                alt={r.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 font-mono uppercase tracking-wider truncate">
                                {r.type}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setReferences((prev) => prev.filter((_, j) => j !== i))
                                }
                                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground w-4 h-4 rounded-full text-[9px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { type: "logo", label: "📎 Logo" },
                            { type: "product", label: "📦 Producto" },
                            { type: "team", label: "👥 Equipo" },
                            { type: "location", label: "📍 Locación" },
                            { type: "inspiration", label: "✨ Inspiración" },
                          ].map((b) => (
                            <label
                              key={b.type}
                              className="text-[11px] font-semibold px-2.5 py-1.5 border border-border rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                            >
                              {b.label}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadRef(e, b.type)}
                                multiple
                              />
                            </label>
                          ))}
                          {uploading && (
                            <span className="text-[11px] text-muted-foreground self-center">
                              Subiendo…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Preview de qué va a hacer */}
                <div className="border border-dashed border-accent/30 rounded-xl p-4 bg-accent/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 grid place-items-center shrink-0">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold mb-2">Qué va a pasar ahora</div>
                      {mode === "set" ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["story", "carousel", "reel"] as const).map((t) => {
                              const isPrimary = format.type === t || (format.type === "post" && t === "carousel");
                              return (
                                <div
                                  key={t}
                                  className={`rounded-lg p-2 text-[10px] text-center font-mono uppercase tracking-wider ${
                                    isPrimary
                                      ? "bg-accent text-accent-foreground font-bold"
                                      : "bg-background border border-border text-muted-foreground"
                                  }`}
                                >
                                  {t === "story" ? "📱" : t === "carousel" ? "📇" : "🎬"}{" "}
                                  {t}
                                  <div className="text-[9px] mt-0.5 opacity-75 normal-case">
                                    {isPrimary ? "ahora" : "pending"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-0.5 leading-relaxed pt-1">
                            <li>✓ Set coherente · misma idea · 3 piezas conectadas</li>
                            <li>✓ AI hereda brand · colores · voice del proyecto</li>
                            <li>
                              ✓ Empezamos por el <b className="text-foreground">{format.type}</b> ·
                              las otras 2 quedan listas para completar
                            </li>
                            {ctaKeyword && (
                              <li>
                                ✓ CTA uniforme:{" "}
                                <code className="px-1.5 py-0.5 bg-surface rounded text-[10px] font-bold">
                                  {ctaKeyword}
                                </code>
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                          <li>
                            ✓ Creamos una pieza <b>{format.type}</b>{" "}
                            {format.aspectRatio && (
                              <span>
                                en{" "}
                                <code className="px-1 py-0.5 bg-surface rounded text-[10px]">
                                  {format.aspectRatio}
                                </code>
                              </span>
                            )}
                          </li>
                          <li>✓ AI tiene memoria de tu brand · colores · fuentes · voice</li>
                          <li>✓ Abrimos el editor con el contexto de tu brief</li>
                          <li>✓ Podés iterar con chat AI hasta que quede como querés</li>
                          <li>✓ Export directo a imagen/video cuando esté listo</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer · navigation */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-surface/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === "ai-idea") {
                onClose();
              } else if (step === "ai-preview") {
                setStep("ai-idea");
              } else if (step === "goal") {
                setStep("ai-idea");
              } else if (step === "format") {
                setStep("goal");
              } else if (step === "brief") {
                setStep("format");
              }
            }}
            className="gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {step === "ai-idea" ? "Cancelar" : "Atrás"}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {step === "ai-idea" && "Escribí tu idea · AI genera el set"}
            {step === "ai-preview" && (
              <>
                <button
                  onClick={() => { setAiBrief(null); setStep("ai-idea"); }}
                  className="text-xs underline text-muted-foreground hover:text-foreground mr-2"
                  disabled={creating}
                >
                  Re-generar
                </button>
                <Button
                  onClick={confirmAIBrief}
                  variant="accent"
                  disabled={creating}
                  className="gap-2"
                >
                  {creating ? "Creando…" : (
                    <>
                      <Check className="h-4 w-4" />
                      Crear set con este brief
                    </>
                  )}
                </Button>
              </>
            )}
            {step === "goal" && "Elegí un objetivo para continuar"}
            {step === "format" && "Elegí un formato para continuar"}
            {step === "brief" && (
              <Button
                onClick={proceed}
                variant="accent"
                disabled={creating}
                className="gap-2"
              >
                {creating ? (
                  "Creando…"
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Crear con AI
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════ FORMAT CARD ════════════

function FormatCard({
  format,
  onClick,
  highlighted,
}: {
  format: Format;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left border rounded-xl p-4 transition-all group relative ${
        highlighted
          ? "border-accent/50 bg-accent/5 hover:bg-accent/10 hover:shadow-md"
          : "border-border hover:border-accent/40 hover:bg-surface/50"
      }`}
    >
      {highlighted && (
        <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 bg-accent text-accent-foreground rounded-full uppercase tracking-wide">
          Recomendado
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${
            highlighted ? "bg-accent/15 text-accent" : "bg-muted/40 text-foreground/70"
          }`}
        >
          {format.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-semibold text-sm">{format.label}</span>
            {format.duration && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {format.duration}
              </span>
            )}
            {format.aspectRatio && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {format.aspectRatio}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground leading-snug mb-1.5">
            {format.desc}
          </div>
          {format.example && (
            <div className="text-[11px] font-mono text-muted-foreground/70 italic truncate">
              Ej: {format.example}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
