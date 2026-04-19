/**
 * Gemini 3.1 Pro Preview — FREE tier default (Arena Elo 1493, April 2026).
 *
 * Docs: https://ai.google.dev/api/generate-content
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Auth: `?key={GOOGLE_AI_STUDIO_KEY}` query param
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  TextGenerateRequest,
  TextGenerateResult,
  TextProvider,
} from "./provider";

/** Overridable via `GEMINI_DEFAULT_MODEL` env var. */
const DEFAULT_MODEL = "gemini-3.1-pro-preview";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const meta: ProviderMeta = {
  id: "gemini-3.1-pro",
  label: "Gemini 3.1 Pro",
  capability: "text",
  tier: "free",
  benchmarkScore: 1493,
  requiredEnv: ["GOOGLE_AI_STUDIO_KEY"],
  description: "Google free tier, 60 rpm — Marionette default text provider.",
};

interface GeminiPart {
  text: string;
}
interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

function mapFinishReason(r: string | undefined): TextGenerateResult["finishReason"] {
  switch (r) {
    case "STOP":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "SAFETY":
    case "RECITATION":
      return "content-filter";
    default:
      return undefined;
  }
}

export const geminiProvider: TextProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["GOOGLE_AI_STUDIO_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: TextGenerateRequest): Promise<TextGenerateResult> {
    const key = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!key) throw new Error("GOOGLE_AI_STUDIO_KEY not set");

    const model = req.model ?? process.env.GEMINI_DEFAULT_MODEL ?? DEFAULT_MODEL;
    const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${key}`;

    // Gemini expects system prompt as systemInstruction, user/assistant turns as contents[].
    const contents: GeminiContent[] = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        ...(req.temperature !== undefined && { temperature: req.temperature }),
        ...(req.maxTokens !== undefined && { maxOutputTokens: req.maxTokens }),
        ...(req.jsonSchema && {
          responseMimeType: "application/json",
          responseSchema: req.jsonSchema,
        }),
      },
    };
    if (req.system) body.systemInstruction = { parts: [{ text: req.system }] };
    // Gemini "thinking" flag maps to thinking-mode models; callers should pass
    // the thinking-capable model id via req.model for now (API still evolving).

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 60_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Gemini ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as GeminiResponse;
    const first = json.candidates?.[0];
    const text = first?.content?.parts?.map((p) => p.text).join("") ?? "";

    return {
      providerId: meta.id,
      text,
      finishReason: mapFinishReason(first?.finishReason),
      usage: {
        units: json.usageMetadata?.totalTokenCount ?? 0,
      },
      raw: json,
    };
  },
};
