/**
 * Core types shared across all provider capabilities.
 *
 * Sprint 11a: TEXT only; image/video/audio/voice-clone placeholders defined
 * here so future sprints can extend without breaking imports.
 */

export type Capability = "text" | "image" | "video" | "audio" | "voice-clone";

/**
 * Runtime health — surfaced to UI (`[Provider ✓]` / `[Provider 🔑]` / `[Provider ✗]`).
 *
 * - `ready`          : API key present + last probe succeeded (or local endpoint reachable)
 * - `missing-key`    : BYOK required but env var not set → UI shows 🔑, resolver skips
 * - `unreachable`    : Key present but network/API error → UI shows ✗, resolver falls through
 * - `rate-limited`   : Temporary backoff — resolver prefers siblings until cooldown elapses
 * - `unknown`        : Never probed
 */
export type ProviderHealth =
  | { state: "ready"; lastProbeAt: number }
  | { state: "missing-key"; requiredEnv: string[] }
  | { state: "unreachable"; error: string; lastProbeAt: number }
  | { state: "rate-limited"; retryAt: number }
  | { state: "unknown" };

/**
 * Tier affects fallback-chain ordering:
 *   `top`    — premium/BYOK (Claude Opus, Nano Banana 2, Seedance 2.0)
 *   `free`   — generous free tier (Gemini Free, Groq Free, HF Inference)
 *   `local`  — zero-cost self-host (Ollama, LM Studio, vLLM, llama.cpp)
 */
export type ProviderTier = "top" | "free" | "local";

export interface ProviderMeta {
  /** Stable id used in env vars (`DEFAULT_TEXT_PROVIDER=gemini-3.1-pro`) and UI. */
  id: string;
  /** Human-readable label for UI switcher. */
  label: string;
  capability: Capability;
  tier: ProviderTier;
  /** Arena Elo or benchmark score if available (display-only). */
  benchmarkScore?: number;
  /** Env var names whose absence means `missing-key`. */
  requiredEnv?: string[];
  /** Optional env var that, if set, overrides default baseURL (Ollama/LM Studio). */
  configurableEndpointEnv?: string;
  /** Short description for UI tooltip. */
  description?: string;
}

/**
 * Generic generate request — capability-specific providers narrow it via generics.
 */
export interface BaseGenerateRequest {
  /** Correlates with Marionette paperclipId (project) for cost/usage tracking. */
  projectId?: string;
  /** User-facing label for job-runner progress events. */
  jobLabel?: string;
  /** Timeout in milliseconds (provider may cap below). */
  timeoutMs?: number;
  /** Abort signal — respected by all providers. */
  signal?: AbortSignal;
}

export interface GenerateUsage {
  /** Provider-reported token or unit count (text: tokens, image: images, video: seconds). */
  units: number;
  /** USD cost if provider exposes it; undefined for free/local. */
  costUsd?: number;
}

export interface BaseGenerateResult {
  providerId: string;
  usage?: GenerateUsage;
  /** Arbitrary provider-specific payload surfaced for debugging/logs. */
  raw?: unknown;
}

/** Thrown when no healthy provider matches the requested capability. */
export class NoHealthyProviderError extends Error {
  readonly capability: Capability;
  readonly attempted: string[];
  constructor(capability: Capability, attempted: string[]) {
    super(`No healthy ${capability} provider. Attempted: ${attempted.join(", ") || "none"}`);
    this.name = "NoHealthyProviderError";
    this.capability = capability;
    this.attempted = attempted;
  }
}
