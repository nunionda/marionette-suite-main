/**
 * FLUX.1 dev / FLUX.1 schnell — via HuggingFace Inference API.
 * FREE tier default for image generation (Apache 2.0 license, ~300 req/day free).
 *
 * Docs: https://huggingface.co/docs/api-inference/detailed_parameters#text-to-image-task
 * Endpoint: https://api-inference.huggingface.co/models/{repo}
 * Auth: `Authorization: Bearer {HF_TOKEN}`
 *
 * Response: raw binary image bytes (NOT JSON). Use res.arrayBuffer().
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  GeneratedImage,
  ImageGenerateRequest,
  ImageGenerateResult,
  ImageProvider,
} from "./provider";

/**
 * Default repo — FLUX.1 [dev] is the well-balanced open FLUX variant.
 * Override via `FLUX_HF_REPO` env, e.g. "black-forest-labs/FLUX.1-schnell" for 4-step fast.
 */
const DEFAULT_REPO = "black-forest-labs/FLUX.1-dev";
const API_BASE = "https://api-inference.huggingface.co/models";

const meta: ProviderMeta = {
  id: "flux-hf",
  label: "FLUX.1 dev (HF Inference)",
  capability: "image",
  tier: "free",
  requiredEnv: ["HF_TOKEN"],
  description: "FLUX.1 via HuggingFace Inference — free ~300 req/day.",
};

/** Map our aspect ratios to (width, height) — HF Inference takes explicit pixels. */
function aspectToSize(
  aspect?: string,
  fallbackW?: number,
  fallbackH?: number,
): { width: number; height: number } {
  const lookup: Record<string, [number, number]> = {
    "1:1": [1024, 1024],
    "16:9": [1280, 720],
    "9:16": [720, 1280],
    "4:3": [1024, 768],
    "3:4": [768, 1024],
    "21:9": [1536, 640],
    "2.35:1": [1536, 648],
    "1.85:1": [1480, 800],
  };
  if (aspect && lookup[aspect]) return { width: lookup[aspect]![0], height: lookup[aspect]![1] };
  return { width: fallbackW ?? 1024, height: fallbackH ?? 1024 };
}

export const fluxHfProvider: ImageProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const token = process.env.HF_TOKEN;
    if (!token) return { state: "missing-key", requiredEnv: ["HF_TOKEN"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: ImageGenerateRequest): Promise<ImageGenerateResult> {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error("HF_TOKEN not set");

    const repo = req.model ?? process.env.FLUX_HF_REPO ?? DEFAULT_REPO;
    const url = `${API_BASE}/${repo}`;
    const { width, height } = aspectToSize(req.aspectRatio, req.width, req.height);

    const body = {
      inputs: req.prompt,
      parameters: {
        ...(req.negativePrompt && { negative_prompt: req.negativePrompt }),
        width,
        height,
        ...(req.steps !== undefined && { num_inference_steps: req.steps }),
        ...(req.guidance !== undefined && { guidance_scale: req.guidance }),
        ...(req.seed !== undefined && { seed: req.seed }),
      },
      options: {
        // HF returns 503 while loading the model; x-use-cache=false forces fresh
        wait_for_model: true,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 180_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`FluxHF ${res.status}: ${err.slice(0, 400)}`);
    }

    // HF returns raw image bytes — NOT JSON
    const buf = await res.arrayBuffer();
    const mime = res.headers.get("content-type") ?? "image/png";
    const image: GeneratedImage = {
      kind: "bytes",
      bytes: new Uint8Array(buf),
      mime,
      width,
      height,
    };

    return {
      providerId: meta.id,
      images: [image],
      seed: req.seed,
      usage: { units: 1 },
      raw: { repo, mime, bytes: buf.byteLength },
    };
  },
};
