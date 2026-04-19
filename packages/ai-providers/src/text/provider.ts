import type {
  BaseGenerateRequest,
  BaseGenerateResult,
  ProviderHealth,
  ProviderMeta,
} from "../types";

/**
 * Minimal chat-style message. Providers normalize their native shapes into this.
 * `system` is separated because some providers (Anthropic) take it out-of-band.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TextGenerateRequest extends BaseGenerateRequest {
  /** System/developer prompt — extracted so Anthropic can pass as `system` param. */
  system?: string;
  messages: ChatMessage[];
  /** Optional model override (else provider uses its default). */
  model?: string;
  /** Sampling. Providers clamp to their supported ranges. */
  temperature?: number;
  maxTokens?: number;
  /** Enable reasoning/thinking mode when provider supports it (Claude Opus, Gemini). */
  thinking?: boolean;
  /** Stream text deltas. If false (default), returns full text at end. */
  stream?: false;
  /** JSON schema — providers that support structured output enforce it. */
  jsonSchema?: Record<string, unknown>;
}

export interface TextGenerateResult extends BaseGenerateResult {
  text: string;
  /** Populated when `thinking: true` and provider exposes it. */
  reasoning?: string;
  finishReason?: "stop" | "length" | "content-filter" | "tool-use" | "error";
}

export interface TextProvider {
  readonly meta: ProviderMeta;
  /**
   * Cheap readiness check — MUST NOT make a paid call. Implementations typically:
   *   - `top`/`free` : verify env key is present, optionally ping a light endpoint
   *   - `local`      : GET {baseURL}/models or /v1/models with short timeout
   * Caching is the registry's responsibility; providers just return current state.
   */
  probe(): Promise<ProviderHealth>;
  generate(req: TextGenerateRequest): Promise<TextGenerateResult>;
}
