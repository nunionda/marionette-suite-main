/**
 * VoiceCloneProvider — Professional Voice Cloning (ElevenLabs PVC) and similar.
 *
 * 2-phase pattern like VideoProvider because training takes minutes (ElevenLabs
 * instant voice clone) to hours (ElevenLabs Professional Voice Clone with
 * extensive datasets). Once trained, the voice id produced here is passed to
 * AudioProvider.generate() via `voiceId`.
 *
 * This interface is the twin of the image/Soul-ID pattern (see Sprint 12
 * elements-core) — Marionette treats persistent identities (face, voice) as
 * first-class reusable Elements across the whole pipeline.
 */
import type { BaseGenerateRequest, ProviderHealth, ProviderMeta } from "../types";

export interface VoiceSample {
  /** Source audio — must be clean, ~1 minute per sample recommended. */
  audio:
    | { kind: "url"; url: string }
    | { kind: "dataUrl"; dataUrl: string }
    | { kind: "bytes"; bytes: Uint8Array; mime: string };
  /** Optional label for the sample (helps with debugging training failures). */
  label?: string;
}

export interface VoiceCloneTrainRequest extends BaseGenerateRequest {
  /** Human-readable name — shown in UI voice picker. */
  name: string;
  /** Optional description stored with the voice (accent, tone notes). */
  description?: string;
  /** 1..25 audio samples. ElevenLabs IVC accepts 1, PVC accepts up to 25. */
  samples: VoiceSample[];
  /** BCP-47 language hint. */
  language?: string;
  /** Tier: "instant" (IVC, ~minute) or "professional" (PVC, ~hours). */
  tier?: "instant" | "professional";
}

export type VoiceTrainingStatus =
  | { state: "pending"; submittedAt: number }
  | { state: "training"; submittedAt: number; progress?: number }
  | { state: "done"; submittedAt: number; finishedAt: number; voiceId: string }
  | { state: "failed"; submittedAt: number; finishedAt: number; error: string };

export interface TrainedVoice {
  /** Vendor-native voice id (pass to AudioProvider.generate as voiceId). */
  voiceId: string;
  name: string;
  createdAt: number;
  language?: string;
  /** Provider-specific metadata — owner account, plan tier, etc. */
  raw?: unknown;
}

export interface VoiceCloneProvider {
  readonly meta: ProviderMeta;
  probe(): Promise<ProviderHealth>;
  submit(req: VoiceCloneTrainRequest): Promise<{ jobId: string }>;
  poll(jobId: string): Promise<VoiceTrainingStatus>;
  /** List voices currently trained under this account. */
  list(): Promise<TrainedVoice[]>;
  /** Soft-delete / archive a trained voice. */
  remove?(voiceId: string): Promise<void>;
}
