/**
 * AI provider unificado · OpenRouter por default, Claude CLI como fallback.
 *
 * Elimina la dependencia de que el usuario corra `claude /login` en terminal.
 * Con solo la env var OPENROUTER_API_KEY la app genera sets y briefs.
 *
 * Modelos por default:
 *   - anthropic/claude-sonnet-4.5 (precisión)
 *   - anthropic/claude-haiku-4.5  (velocidad/costo)
 *
 * Fallback chain:
 *   1. OPENROUTER_API_KEY set → usa OpenRouter
 *   2. Claude CLI instalado y logueado → usa subprocess (legacy)
 *   3. Sin nada configurado → error con instrucciones
 */

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIGenerateOptions = {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  fast?: boolean; // usar modelo rápido (haiku)
};

export class AIProviderError extends Error {
  constructor(
    message: string,
    public cause?: string,
    public fixInstructions?: string
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

/**
 * Genera texto completo de una vez (no streaming).
 * Devuelve el string de la respuesta del modelo.
 */
export async function generateText(
  messages: AIMessage[],
  opts: AIGenerateOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new AIProviderError(
      "No AI provider configured",
      "OPENROUTER_API_KEY is not set",
      "Add OPENROUTER_API_KEY=sk-or-... to .env.local (get a key from https://openrouter.ai/keys)"
    );
  }

  const preferredModel = opts.fast
    ? process.env.OPENROUTER_MODEL_FAST || "anthropic/claude-haiku-4.5"
    : process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

  const freeModel = process.env.OPENROUTER_MODEL_FREE || "meta-llama/llama-3.3-70b-instruct:free";
  const autoFallback = process.env.OPENROUTER_AUTO_FALLBACK_FREE !== "false";

  const callModel = async (model: string) => {
    const payload = {
      model,
      messages: opts.system
        ? [{ role: "system", content: opts.system }, ...messages]
        : messages,
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    };
    return fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "Storu Studio",
      },
      body: JSON.stringify(payload),
    });
  };

  let res = await callModel(preferredModel);

  // Auto-fallback to free model on 402 (no credits)
  if (res.status === 402 && autoFallback && preferredModel !== freeModel) {
    console.warn(`[ai-provider] 402 on ${preferredModel}, falling back to free model ${freeModel}`);
    res = await callModel(freeModel);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const is402 = res.status === 402;
    throw new AIProviderError(
      `OpenRouter request failed (${res.status})`,
      errText.slice(0, 500),
      is402
        ? "La cuenta OpenRouter no tiene créditos. Agregá créditos en https://openrouter.ai/settings/credits o configurá un modelo free en OPENROUTER_MODEL_FREE."
        : "Check OPENROUTER_API_KEY is valid at https://openrouter.ai/keys."
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIProviderError(
      "Empty response from AI provider",
      JSON.stringify(data).slice(0, 500)
    );
  }
  return content;
}

/**
 * Streaming version · llama onChunk con cada delta de texto.
 * Ideal para /generate batch y /api/chat.
 */
export async function generateTextStream(
  messages: AIMessage[],
  onChunk: (text: string) => void | Promise<void>,
  opts: AIGenerateOptions = {}
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AIProviderError(
      "No AI provider configured",
      "OPENROUTER_API_KEY is not set",
      "Add OPENROUTER_API_KEY to .env.local"
    );
  }

  const model = opts.fast
    ? process.env.OPENROUTER_MODEL_FAST || "anthropic/claude-haiku-4.5"
    : process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

  const payload = {
    model,
    messages: opts.system
      ? [{ role: "system", content: opts.system }, ...messages]
      : messages,
    max_tokens: opts.maxTokens || 8192,
    temperature: opts.temperature ?? 0.7,
    stream: true,
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "X-Title": "Storu Studio",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new AIProviderError(
      `OpenRouter streaming request failed (${res.status})`,
      errText.slice(0, 500)
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE events (separated by \n\n)
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const lines = part.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === "[DONE]") return;
        try {
          const obj = JSON.parse(jsonStr);
          const delta = obj.choices?.[0]?.delta?.content;
          if (delta) await onChunk(delta);
        } catch { /* ignore parse errors on partial chunks */ }
      }
    }
  }
}

/**
 * Check si el provider está configurado y listo para usar.
 */
export function isAIProviderReady(): { ready: boolean; reason?: string } {
  if (process.env.OPENROUTER_API_KEY) return { ready: true };
  return {
    ready: false,
    reason:
      "OPENROUTER_API_KEY no está configurada. Agregala a .env.local (https://openrouter.ai/keys).",
  };
}
