/**
 * Groq — FREE tier host for DeepSeek V3.2 and Llama 4 family.
 *
 * Docs: https://console.groq.com/docs/api-reference (OpenAI-compatible)
 * Endpoint: https://api.groq.com/openai/v1/chat/completions
 * Auth: Bearer {GROQ_API_KEY}
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  TextGenerateRequest,
  TextGenerateResult,
  TextProvider,
} from "./provider";

/**
 * Groq model IDs change frequently. Override via `GROQ_DEFAULT_MODEL` env var.
 * As of 2026-04, `deepseek-r1-distill-llama-70b` is a widely-available free
 * tier option. Run `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`
 * to list what your account can access.
 */
const DEFAULT_MODEL = "deepseek-r1-distill-llama-70b";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const meta: ProviderMeta = {
  id: "groq-deepseek-v3.2",
  label: "DeepSeek V3.2 (Groq)",
  capability: "text",
  tier: "free",
  description: "Groq free tier hosting DeepSeek V3.2 (MIT) — ~90% GPT-5.4 quality.",
  requiredEnv: ["GROQ_API_KEY"],
};

interface OpenAIChatResponse {
  choices?: Array<{
    message?: { role: string; content: string };
    finish_reason?: string;
  }>;
  usage?: { total_tokens?: number };
}

export const groqProvider: TextProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["GROQ_API_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: TextGenerateRequest): Promise<TextGenerateResult> {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not set");

    const messages: Array<{ role: string; content: string }> = [];
    if (req.system) messages.push({ role: "system", content: req.system });
    for (const m of req.messages) messages.push({ role: m.role, content: m.content });

    const body = {
      model: req.model ?? process.env.GROQ_DEFAULT_MODEL ?? DEFAULT_MODEL,
      messages,
      ...(req.temperature !== undefined && { temperature: req.temperature }),
      ...(req.maxTokens !== undefined && { max_tokens: req.maxTokens }),
      ...(req.jsonSchema && { response_format: { type: "json_object" as const } }),
      stream: false,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 60_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Groq ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as OpenAIChatResponse;
    const choice = json.choices?.[0];
    const finishMap: Record<string, TextGenerateResult["finishReason"]> = {
      stop: "stop",
      length: "length",
      content_filter: "content-filter",
      tool_calls: "tool-use",
    };

    return {
      providerId: meta.id,
      text: choice?.message?.content ?? "",
      finishReason: choice?.finish_reason ? finishMap[choice.finish_reason] : undefined,
      usage: { units: json.usage?.total_tokens ?? 0 },
      raw: json,
    };
  },
};
