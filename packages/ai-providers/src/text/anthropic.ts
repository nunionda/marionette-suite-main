/**
 * Claude Opus 4.6 Thinking — TOP tier (Arena Elo 1504, April 2026).
 *
 * Docs: https://docs.anthropic.com/en/api/messages
 * Endpoint: https://api.anthropic.com/v1/messages
 * Auth: `x-api-key: {ANTHROPIC_API_KEY}` + `anthropic-version: 2023-06-01`
 *
 * Per CLAUDE.md (script-writer) policy: Anthropic is permitted within remaining
 * credits. Treat as BYOK — registry skips when key absent.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  TextGenerateRequest,
  TextGenerateResult,
  TextProvider,
} from "./provider";

/** Overridable via `ANTHROPIC_DEFAULT_MODEL` env var. */
const DEFAULT_MODEL = "claude-opus-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

const meta: ProviderMeta = {
  id: "anthropic-claude-opus-4.6-thinking",
  label: "Claude Opus 4.6 Thinking",
  capability: "text",
  tier: "top",
  benchmarkScore: 1504,
  requiredEnv: ["ANTHROPIC_API_KEY"],
  description: "Top text model; BYOK — used only when credits available.",
};

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}
interface AnthropicResponse {
  content?: Array<{ type: "text" | "thinking"; text: string }>;
  stop_reason?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export const anthropicProvider: TextProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["ANTHROPIC_API_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: TextGenerateRequest): Promise<TextGenerateResult> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");

    const messages: AnthropicMessage[] = req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body: Record<string, unknown> = {
      model: req.model ?? process.env.ANTHROPIC_DEFAULT_MODEL ?? DEFAULT_MODEL,
      messages,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.temperature !== undefined && { temperature: req.temperature }),
      ...(req.system && { system: req.system }),
      ...(req.thinking && {
        thinking: { type: "enabled", budget_tokens: 2048 },
      }),
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": API_VERSION,
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 120_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as AnthropicResponse;

    // Anthropic may return multiple blocks: `thinking` then `text`. Separate them.
    const textBlocks = json.content?.filter((b) => b.type === "text") ?? [];
    const thinkingBlocks = json.content?.filter((b) => b.type === "thinking") ?? [];

    const finishMap: Record<string, TextGenerateResult["finishReason"]> = {
      end_turn: "stop",
      max_tokens: "length",
      stop_sequence: "stop",
      tool_use: "tool-use",
    };

    return {
      providerId: meta.id,
      text: textBlocks.map((b) => b.text).join("\n"),
      reasoning: thinkingBlocks.length
        ? thinkingBlocks.map((b) => b.text).join("\n")
        : undefined,
      finishReason: json.stop_reason ? finishMap[json.stop_reason] : undefined,
      usage: {
        units:
          (json.usage?.input_tokens ?? 0) + (json.usage?.output_tokens ?? 0),
      },
      raw: json,
    };
  },
};
