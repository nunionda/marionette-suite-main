/**
 * AudioProvider — text-to-speech and simple audio generation.
 *
 * Separated from video because:
 *   - TTS responses are synchronous (seconds, not minutes)
 *   - Voice IDs (trained/cloned voices) form a distinct capability, modeled
 *     in voice-clone/provider.ts
 *
 * Marionette Cinema Studio 3.5 uses this layer for ADR/dubbing dialogue,
 * narrator lines, and foley/music stubs. Seedance 2.0's NATIVE audio path
 * bypasses this layer — it runs inside VideoProvider.
 */
import type {
  BaseGenerateRequest,
  BaseGenerateResult,
  ProviderHealth,
  ProviderMeta,
} from "../types";

export type AudioFormat = "mp3" | "wav" | "ogg" | "pcm_16000" | "pcm_22050" | "pcm_44100";

export interface AudioGenerateRequest extends BaseGenerateRequest {
  /** Text to synthesize. */
  text: string;
  /**
   * Voice id — format is provider-specific (e.g. "Rachel" for ElevenLabs,
   * "en_US-lessac-medium" for Piper). Layer 3 orchestrators translate an
   * abstract voice selection into the right id per provider.
   */
  voiceId?: string;
  /** Model variant (e.g. "eleven_turbo_v3"). */
  model?: string;
  /** BCP-47 language hint (e.g. "ko", "en-US"). */
  language?: string;
  /** 0..1 — how stable (high = monotone, low = emotive). */
  stability?: number;
  /** 0..1 — how closely to match the voice's natural similarity. */
  similarityBoost?: number;
  /** 0..2 — overall speaking rate multiplier. */
  speed?: number;
  format?: AudioFormat;
  /** Seed for reproducibility when supported. */
  seed?: number;
}

export type AudioAsset =
  | { kind: "url"; url: string; mime?: string; durationSec?: number }
  | { kind: "bytes"; bytes: Uint8Array; mime: string; durationSec?: number };

export interface AudioGenerateResult extends BaseGenerateResult {
  audio: AudioAsset;
  /** Per-phoneme alignment if the provider supports it (useful for lip-sync). */
  alignment?: Array<{ char: string; startMs: number; endMs: number }>;
}

export interface AudioProvider {
  readonly meta: ProviderMeta;
  probe(): Promise<ProviderHealth>;
  generate(req: AudioGenerateRequest): Promise<AudioGenerateResult>;
  /**
   * Optional — list available voice ids. Expected to be cheap (cached).
   * Returns vendor-native ids the caller can pass as `voiceId`.
   */
  listVoices?(): Promise<Array<{ id: string; name: string; language?: string; gender?: string }>>;
}
