/**
 * Local image provider — AUTOMATIC1111 / ComfyUI / SD.Next / InvokeAI.
 *
 * A1111 REST: `POST /sdapi/v1/txt2img` → JSON with base64 images.
 * ComfyUI: workflow JSON POST to `/prompt` + `/view` → more complex; not handled
 * directly here. Use a LiteLLM/A1111-compat shim or swap via createLocalImageProvider.
 *
 * This file exports:
 *   - `createLocalImageProvider()` factory — any OpenAI-image-compatible or A1111 endpoint
 *   - `a1111Provider`   — preconfigured for AUTOMATIC1111 default (:7860)
 *   - `comfyProvider`   — preconfigured stub for ComfyUI (requires /api/txt2img shim)
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  GeneratedImage,
  ImageGenerateRequest,
  ImageGenerateResult,
  ImageProvider,
} from "./provider";

export interface LocalImageProviderOptions {
  id: string;
  label: string;
  /** Base URL WITHOUT trailing slash — txt2img endpoint is appended. */
  baseURL: string;
  /** Relative path appended to baseURL, defaults to `/sdapi/v1/txt2img` (A1111). */
  txt2imgPath?: string;
  defaultModel?: string;
  baseUrlEnv?: string;
  modelEnv?: string;
  apiKeyEnv?: string;
  description?: string;
}

interface A1111Response {
  images?: string[]; // base64 PNGs
  parameters?: Record<string, unknown>;
  info?: string;
}

export function createLocalImageProvider(opts: LocalImageProviderOptions): ImageProvider {
  const meta: ProviderMeta = {
    id: opts.id,
    label: opts.label,
    capability: "image",
    tier: "local",
    configurableEndpointEnv: opts.baseUrlEnv,
    requiredEnv: opts.apiKeyEnv ? [opts.apiKeyEnv] : undefined,
    description: opts.description,
  };

  const txt2imgPath = opts.txt2imgPath ?? "/sdapi/v1/txt2img";

  const resolveBaseUrl = () =>
    (opts.baseUrlEnv && process.env[opts.baseUrlEnv]) || opts.baseURL;
  const resolveModel = () =>
    (opts.modelEnv && process.env[opts.modelEnv]) || opts.defaultModel;

  return {
    meta,

    async probe(): Promise<ProviderHealth> {
      try {
        const res = await fetch(`${resolveBaseUrl()}/sdapi/v1/sd-models`, {
          signal: AbortSignal.timeout(2_000),
        });
        if (!res.ok) {
          return {
            state: "unreachable",
            error: `HTTP ${res.status}`,
            lastProbeAt: Date.now(),
          };
        }
        return { state: "ready", lastProbeAt: Date.now() };
      } catch (e) {
        return {
          state: "unreachable",
          error: e instanceof Error ? e.message : String(e),
          lastProbeAt: Date.now(),
        };
      }
    },

    async generate(req: ImageGenerateRequest): Promise<ImageGenerateResult> {
      const base = resolveBaseUrl();
      const apiKey = opts.apiKeyEnv ? process.env[opts.apiKeyEnv] : undefined;
      const model = req.model ?? resolveModel();

      const body: Record<string, unknown> = {
        prompt: req.prompt,
        ...(req.negativePrompt && { negative_prompt: req.negativePrompt }),
        ...(req.width && { width: req.width }),
        ...(req.height && { height: req.height }),
        ...(req.steps !== undefined && { steps: req.steps }),
        ...(req.guidance !== undefined && { cfg_scale: req.guidance }),
        ...(req.seed !== undefined && { seed: req.seed }),
        ...(model && { override_settings: { sd_model_checkpoint: model } }),
        batch_size: req.count ?? 1,
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      const res = await fetch(`${base}${txt2imgPath}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 300_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(`${opts.id} ${res.status}: ${err.slice(0, 400)}`);
      }
      const json = (await res.json()) as A1111Response;

      const images: GeneratedImage[] = (json.images ?? []).map((b64) => {
        // A1111 returns raw base64 (no data: prefix)
        const bytes =
          typeof Buffer !== "undefined"
            ? new Uint8Array(Buffer.from(b64, "base64"))
            : Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        return { kind: "bytes", bytes, mime: "image/png" };
      });

      return {
        providerId: meta.id,
        images,
        seed: req.seed,
        usage: { units: images.length },
        raw: { info: json.info },
      };
    },
  };
}

/** AUTOMATIC1111 WebUI on default :7860. */
export const a1111Provider = createLocalImageProvider({
  id: "a1111-local",
  label: "AUTOMATIC1111 (local)",
  baseURL: "http://localhost:7860",
  defaultModel: "sd_xl_base_1.0",
  baseUrlEnv: "A1111_BASE_URL",
  modelEnv: "A1111_DEFAULT_MODEL",
  description: "Local SDXL/SD3 via AUTOMATIC1111 WebUI.",
});

/**
 * ComfyUI fallback — assumes a REST shim exposing A1111-compatible `/sdapi/v1/txt2img`
 * (e.g. https://github.com/jovikoreano/ComfyUI-API-Bridge). For native ComfyUI
 * workflow graphs a dedicated provider in a future sprint is preferable.
 */
export const comfyProvider = createLocalImageProvider({
  id: "comfyui-local",
  label: "ComfyUI (local, A1111-compat shim)",
  baseURL: "http://localhost:8188",
  baseUrlEnv: "COMFY_BASE_URL",
  modelEnv: "COMFY_DEFAULT_MODEL",
  description: "Local ComfyUI requiring A1111-compat REST shim.",
});
