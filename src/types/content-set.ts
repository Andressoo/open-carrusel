/**
 * ContentSet · una idea de contenido = 3 piezas coherentes
 *
 * Un ContentSet agrupa Story + Carousel + Reel que comparten:
 *  - Tema central (topic)
 *  - Hook / ángulo narrativo
 *  - Voz de marca (del proyecto activo)
 *  - Paleta y brand visual
 *  - CTA keyword (para comentario → DM)
 *  - Hilo conductor narrativo (cada pieza continúa la otra)
 *
 * Orden de consumo sugerido (no obligatorio):
 *   1. Story · polling/teaser que valida
 *   2. Carousel · desarrollo educativo/case study
 *   3. Reel · viral hook + proof condensado
 *
 * Reglas de coherencia:
 *  - Las 3 piezas deben compartir topic + goal + brand
 *  - Colores consistentes entre piezas
 *  - CTA keyword uniforme (ej: "MARTES", "DROP", "RETO")
 *  - Si una pieza menciona marca ancla (ej: Punto G) las otras deben respetar
 *  - Dimensiones específicas por formato (safe zones aplicadas)
 */

import type { Carousel } from "./carousel";

export type ContentSetPiece = {
  /** Referencia al contenido real · si existe */
  id: string | null;
  type: "story" | "carousel" | "reel";
  /** Estado de producción */
  status: "pending" | "draft" | "ready" | "published";
  /** Fecha publicación programada */
  scheduledAt?: string;
  /** URL o path al contenido renderizado */
  outputUrl?: string;
};

export type ContentSet = {
  id: string;
  /** Tema central · one-liner */
  topic: string;
  /** Objetivo comercial · "capture" | "valley" | "launch" | etc. */
  goal: string;
  /** Archetype narrativo · "contrarian" | "case-study" | "framework" | etc. */
  archetype?: string;
  /** Nombre display del set */
  name: string;
  /** Hilo conductor · descripción corta del thread narrativo */
  thread?: string;
  /** CTA keyword común · "MARTES" · "DROP" · etc. */
  ctaKeyword?: string;
  /** Marca ancla referenciada · si aplica */
  anchorBrand?: string;
  /** Las 3 piezas del set */
  story: ContentSetPiece;
  carousel: ContentSetPiece;
  reel: ContentSetPiece;
  createdAt: string;
  updatedAt: string;
};

/**
 * Estado del set · porcentaje completado (0-100)
 */
export function setCompletion(set: ContentSet): number {
  const pieces = [set.story, set.carousel, set.reel];
  const ready = pieces.filter(
    (p) => p.status === "ready" || p.status === "published"
  ).length;
  return Math.round((ready / 3) * 100);
}

/**
 * ¿Está listo para publicar? · al menos 2 de 3 piezas en ready
 */
export function isSetPublishable(set: ContentSet): boolean {
  const pieces = [set.story, set.carousel, set.reel];
  return pieces.filter((p) => p.status === "ready").length >= 2;
}
