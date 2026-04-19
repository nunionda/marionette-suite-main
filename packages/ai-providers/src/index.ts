/**
 * @marionette/ai-providers — Layer 1 of the 4-Layer AI architecture.
 *
 * Provides a swappable provider registry for TEXT / IMAGE / VIDEO / AUDIO / VOICE-CLONE
 * generation. Upper layers (pipeline-core, engines/*) consume this through typed
 * interfaces and never hard-code specific vendors.
 *
 * Sprint 11a scope: TEXT only.
 *   - Top (BYOK): Claude Opus 4.6 Thinking
 *   - Free 1 (default): Gemini 3.1 Pro Preview
 *   - Free 2 (fallback): DeepSeek V3.2 via Groq
 *   - Local (extensible): Ollama / LM Studio / any OpenAI-compatible endpoint
 */

export * from "./types";
export * from "./registry";
export * as text from "./text";
export * as image from "./image";
