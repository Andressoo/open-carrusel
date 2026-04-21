"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GalleryVertical,
  MessageCircleQuestion,
  Timer,
  Sparkles,
  Layers,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

type Project = {
  slug: string;
  name: string;
  icon?: string;
};

const storyFormats = [
  {
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    title: "Poll dinámico",
    desc: "Sí/No binario con framing que revela dolor. Validar hipótesis en 2 horas.",
    example: '"¿Tu martes duele?" → 300+ respuestas',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Emoji slider",
    desc: "Intensidad 1-10 con emojis. Mide qué tanto importa el tema.",
    example: "¿Cuánto duele tu hora lenta? 😩 ← → 😊",
  },
  {
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    title: "Quiz educativo",
    desc: "Pregunta framework con 4 opciones · respuesta con explicación · link deep-dive.",
    example: "¿Qué campaña si tenés horas lentas? · 32% engagement",
  },
  {
    icon: <Timer className="h-5 w-5" />,
    title: "Countdown",
    desc: "Compromiso + urgencia. Drop 48-72h · evento RSVP · launch tease · cierre 4h.",
    example: "Sold out 36h · 210 VIPs activados",
  },
  {
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    title: "Q&A sticker",
    desc: "Autoridad gratis. 5 tipos: pregúntame, democracia, dolor abierto, sorpresa, tema.",
    example: "73 preguntas / 24h · 12 DMs calificados",
  },
  {
    icon: <GalleryVertical className="h-5 w-5" />,
    title: "Antes/Después series",
    desc: "3-5 Stories en Highlight guardable. Transformación visual vende sin palabras.",
    example: "38 DMs por Highlight · tasa 2.8×",
  },
  {
    icon: <GalleryVertical className="h-5 w-5" />,
    title: "Swipe-up + UTM",
    desc: "Cada Story con UTM único. Landing específica por nicho. Pixel Meta retargeting.",
    example: "CTR 4.2× · conversión 6× vs link en bio",
  },
];

export default function StoriesPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

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
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 grid place-items-center">
                <GalleryVertical className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Historias IG</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Proyecto activo:{" "}
                  <span className="font-medium text-foreground">
                    {activeProject?.icon} {activeProject?.name || "…"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 border-2 border-dashed border-border rounded-xl p-5 bg-surface/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold mb-1">Módulo en construcción</div>
                <p className="text-muted-foreground">
                  El editor de historias dinámicas (polls, quizzes, countdowns) será
                  parte de Storu Studio Phase 4. Mientras tanto, usá las plantillas
                  below como briefs para producir en Canva/Figma/IG directo.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">7 formatos de historia</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {storyFormats.map((s, i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-5 bg-surface/40 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 grid place-items-center text-accent">
                    {s.icon}
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-snug">
                  {s.desc}
                </p>
                <div className="text-xs font-mono text-accent/80 bg-accent/5 rounded px-2 py-1.5 border border-accent/10">
                  {s.example}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Layers className="h-3.5 w-3.5" /> Volver a carruseles
              </Button>
            </Link>
            <Link href="/reels">
              <Button variant="ghost" size="sm">
                Reels →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
