/**
 * Nano Banana 2 — Gemini 3.1 Flash Image Preview (Arena Elo 1263, April 2026).
 * TOP tier, BYOK.
 *
 * Docs: https://ai.google.dev/api/generate-content
 * Endpoint: v1beta/models/gemini-3.1-flash-image-preview:generateContent
 * Auth: `?key={GOOGLE_AI_STUDIO_KEY}` query param (shared with text Gemini)
 *
 * Response shape: `candidates[].content.parts[]` may include `inlineData: { mimeType, data (base64) }`
 * for generated images OR `text` for the model's narration.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  GeneratedImage,
  ImageGenerateRequest,
  ImageGenerateResult,
  ImageProvider,
  ImageReference,
} from "./provider";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const meta: ProviderMeta = {
  id: "nano-banana-2",
  label: "Nano Banana 2 (Gemini 3.1 Flash Image)",
  capability: "image",
  tier: "top",
  benchmarkScore: 1263,
  requiredEnv: ["GOOGLE_AI_STUDIO_KEY"],
  description: "Google top image model — BYOK.",
};

type InlinePart =
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType: string; fileUri: string } };

function referenceToPart(ref: ImageReference): InlinePart {
  if (ref.kind === "url") {
    return { fileData: { mimeType: "image/*", fileUri: ref.url } };
  }
  if (ref.kind === "dataUrl") {
    const match = /^data:([^;]+);base64,(.*)$/.exec(ref.dataUrl);
    if (!match) throw new Error("Malformed dataUrl reference");
    return { inlineData: { mimeType: match[1]!, data: match[2]! } };
  }
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(ref.bytes).toString("base64")
      : btoa(String.fromCharCode(...ref.bytes));
  return { inlineData: { mimeType: ref.mime, data: base64 } };
}

interface GeminiImagePart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}
interface GeminiImageResponse {
  candidates?: Array<{
    content?: { parts?: GeminiImagePart[] };
    finishReason?: string;
  }>;
  usageMetadata?: { totalTokenCount?: number };
}

export const nanoBananaProvider: ImageProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["GOOGLE_AI_STUDIO_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: ImageGenerateRequest): Promise<ImageGenerateResult> {
    const key = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!key) throw new Error("GOOGLE_AI_STUDIO_KEY not set");

    const model = req.model ?? process.env.NANO_BANANA_MODEL ?? DEFAULT_MODEL;
    const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${key}`;

    const parts: Array<Record<string, unknown>> = [{ text: req.prompt }];
    for (const ref of (req.references ?? []).slice(0, 9)) {
      parts.push(referenceToPart(ref));
    }

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        ...(req.aspectRatio && { imageConfig: { aspectRatio: req.aspectRatio } }),
        ...(req.seed !== undefined && { seed: req.seed }),
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 120_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`NanoBanana2 ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as GeminiImageResponse;

    const images: GeneratedImage[] = [];
    let revisedPrompt: string | undefined;
    for (const candidate of json.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData) {
          const bytes =
            typeof Buffer !== "undefined"
              ? new Uint8Array(Buffer.from(part.inlineData.data, "base64"))
              : Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0));
          images.push({ kind: "bytes", bytes, mime: part.inlineData.mimeType });
        } else if (part.text && !revisedPrompt) {
          revisedPrompt = part.text;
        }
      }
    }

    return {
      providerId: meta.id,
      images,
      revisedPrompt,
      usage: { units: json.usageMetadata?.totalTokenCount ?? images.length },
      raw: json,
    };
  },
};
