import type {
  BaseGenerateRequest,
  BaseGenerateResult,
  ProviderHealth,
  ProviderMeta,
} from "../types";

/**
 * Aspect ratio presets common across Higgsfield / LTX / Runway / Seedance.
 * Providers that can't honor the exact ratio should pick the closest supported.
 */
export type ImageAspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "21:9"
  | "2.35:1"
  | "1.85:1";

/**
 * Reference image slot — mirrors Higgsfield's "up to 9 references" pattern.
 * Either a remote URL, a base64 data URL, or a raw Uint8Array buffer.
 */
export type ImageReference =
  | { kind: "url"; url: string; weight?: number }
  | { kind: "dataUrl"; dataUrl: string; weight?: number }
  | { kind: "bytes"; bytes: Uint8Array; mime: string; weight?: number };

export interface ImageGenerateRequest extends BaseGenerateRequest {
  prompt: string;
  /** Optional negative prompt — providers that don't support it ignore. */
  negativePrompt?: string;
  /** Up to 9 reference images (Higgsfield Soul ID / identity-lock pattern). */
  references?: ImageReference[];
  /** Model override (each provider has its own default). */
  model?: string;
  aspectRatio?: ImageAspectRatio;
  /** Target width in pixels — providers may clamp to their supported sizes. */
  width?: number;
  height?: number;
  /** Number of candidates to return (provider may cap below). */
  count?: number;
  /** Sampling seed for reproducibility (provider may ignore). */
  seed?: number;
  /** Style preset tag — Higgsfield Soul 2.0 has 20+ curated presets. */
  stylePreset?: string;
  /** 1..100 (provider clamps). */
  steps?: number;
  /** Guidance scale (CFG). */
  guidance?: number;
}

/** Single generated image — either inline bytes or a remote URL. */
export type GeneratedImage =
  | { kind: "url"; url: string; mime?: string; width?: number; height?: number }
  | { kind: "bytes"; bytes: Uint8Array; mime: string; width?: number; height?: number };

export interface ImageGenerateResult extends BaseGenerateResult {
  images: GeneratedImage[];
  /** Provider's revised prompt, if it does prompt rewriting (DALL-E, Imagen). */
  revisedPrompt?: string;
  /** Seed actually used (useful for reproducibility when caller omitted seed). */
  seed?: number;
}

export interface ImageProvider {
  readonly meta: ProviderMeta;
  probe(): Promise<ProviderHealth>;
  generate(req: ImageGenerateRequest): Promise<ImageGenerateResult>;
}
