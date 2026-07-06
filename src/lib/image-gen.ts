/**
 * Generación de imágenes vía OpenRouter (modalities: ["image","text"]).
 *
 * Modelos de imagen en OpenRouter (2026-07 · ninguno free):
 *   google/gemini-2.5-flash-image        · el más barato (~$0.01-0.03/img)
 *   google/gemini-3.1-flash-lite-image   · calidad/precio medio
 *   google/gemini-3-pro-image            · máxima calidad
 *   openai/gpt-5-image-mini              · alternativa OpenAI
 *
 * La respuesta llega como data-URL base64 en message.images[] · se decodifica
 * y persiste en public/uploads/ai/ para que el resto del sistema (slides,
 * reels bgImage, references) la consuma como URL local estable.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { AIProviderError } from "@/lib/ai-provider";

export type GenerateImageOptions = {
  prompt: string;
  /** Contexto de estilo opcional que se antepone al prompt */
  stylePrefix?: string;
  /** Override del modelo · default OPENROUTER_IMAGE_MODEL o gemini-2.5-flash-image */
  model?: string;
};

export type GeneratedImage = {
  /** URL local servible · /uploads/ai/<file>.png */
  url: string;
  /** Path absoluto en disco */
  filePath: string;
  model: string;
};

const DEFAULT_IMAGE_MODELS = [
  process.env.OPENROUTER_IMAGE_MODEL,
  "google/gemini-2.5-flash-image",
  "google/gemini-3.1-flash-lite-image",
].filter(Boolean) as string[];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function callImageModel(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "X-Title": "Storu Studio",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const is402 = res.status === 402;
    throw new AIProviderError(
      `Image generation failed (${res.status}) on ${model}`,
      errText.slice(0, 400),
      is402
        ? "Los modelos de imagen de OpenRouter no tienen tier free. Cargá créditos en https://openrouter.ai/settings/credits (~$0.03 por imagen con gemini-2.5-flash-image)."
        : "Verificá OPENROUTER_API_KEY y que el modelo siga existiendo (openrouter.ai/models)."
    );
  }

  const data = await res.json();
  const images = data?.choices?.[0]?.message?.images;
  const dataUrl: string | undefined = images?.[0]?.image_url?.url;
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    throw new AIProviderError(
      `Model ${model} returned no image`,
      JSON.stringify(data).slice(0, 400)
    );
  }
  return dataUrl;
}

export async function generateImage(
  opts: GenerateImageOptions
): Promise<GeneratedImage> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AIProviderError(
      "No AI provider configured",
      "OPENROUTER_API_KEY is not set",
      "Agregá OPENROUTER_API_KEY a .env.local"
    );
  }

  const fullPrompt = opts.stylePrefix
    ? `${opts.stylePrefix}\n\n${opts.prompt}`
    : opts.prompt;

  const chain = opts.model
    ? [opts.model]
    : [...new Set(DEFAULT_IMAGE_MODELS)];

  let lastErr: unknown;
  for (const model of chain) {
    try {
      const dataUrl = await callImageModel(apiKey, model, fullPrompt);

      // data:image/png;base64,XXXX → buffer
      const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        throw new AIProviderError("Unexpected image data URL format");
      }
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      const buffer = Buffer.from(match[2], "base64");

      const dir = path.resolve(process.cwd(), "public", "uploads", "ai");
      await mkdir(dir, { recursive: true });
      const filename = `${Date.now()}-${slugify(opts.prompt)}-${crypto
        .randomBytes(3)
        .toString("hex")}.${ext}`;
      const filePath = path.join(dir, filename);
      await writeFile(filePath, buffer);

      return { url: `/uploads/ai/${filename}`, filePath, model };
    } catch (err) {
      lastErr = err;
      // 402 no se resuelve cambiando de modelo (todos los de imagen son pagos)
      if (
        err instanceof AIProviderError &&
        err.message.includes("(402)")
      ) {
        throw err;
      }
      // otros errores (modelo muerto, rate limit) → probar el siguiente
    }
  }
  throw lastErr;
}

/** Prefijo de estilo Storu para imágenes de marca coherentes */
export function storuStylePrefix(context?: string): string {
  return [
    "Fotografía comercial auténtica para redes sociales de un comercio colombiano.",
    "Luz natural cálida, colores vivos pero reales, nada de stock corporativo genérico.",
    "Sin texto sobreimpreso, sin marcas de agua, sin logos.",
    context || "",
  ]
    .filter(Boolean)
    .join(" ");
}
