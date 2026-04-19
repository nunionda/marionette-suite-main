/**
 * Local OpenAI-compatible provider — Ollama / LM Studio / vLLM / llama.cpp / LiteLLM.
 *
 * Both Ollama (`http://localhost:11434/v1`) and LM Studio (`http://localhost:1234/v1`)
 * expose the OpenAI `/chat/completions` spec. Rather than duplicate code we expose:
 *
 *   - `createLocalProvider({ id, label, baseURL, defaultModel })` — factory for any
 *     OpenAI-compatible endpoint the operator wants to add at runtime.
 *   - `ollamaProvider`   — preconfigured instance bound to `OLLAMA_BASE_URL`
 *   - `lmStudioProvider` — preconfigured instance bound to `LM_STUDIO_BASE_URL`
 *
 * UI switching:
 *   The UI Provider Switcher writes `DEFAULT_TEXT_PROVIDER` and (for local)
 *   `LOCAL_TEXT_BASE_URL` + `LOCAL_TEXT_MODEL` to a runtime config store. The
 *   registry re-resolves on each request, so changes take effect immediately
 *   without restart.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  TextGenerateRequest,
  TextGenerateResult,
  TextProvider,
} from "./provider";

interface OpenAIChatResponse {
  choices?: Array<{
    message?: { role: string; content: string };
    finish_reason?: string;
  }>;
  usage?: { total_tokens?: number };
}

export interface LocalProviderOptions {
  /** Stable id, e.g. "ollama", "lm-studio", "vllm-local". */
  id: string;
  label: string;
  /** Base URL WITHOUT trailing slash, including `/v1` suffix. */
  baseURL: string;
  /** Model name the server exposes (e.g. `qwen3:14b`, `deepseek-v3.2-q4`). */
  defaultModel: string;
  /** Optional env var that overrides baseURL at runtime. */
  baseUrlEnv?: string;
  /** Optional env var that overrides defaultModel at runtime. */
  modelEnv?: string;
  /** Optional bearer token env var (LM Studio may require none; LiteLLM does). */
  apiKeyEnv?: string;
  /** Benchmark display score, if any. */
  benchmarkScore?: number;
  description?: string;
}

export function createLocalProvider(opts: LocalProviderOptions): TextProvider {
  const meta: ProviderMeta = {
    id: opts.id,
    label: opts.label,
    capability: "text",
    tier: "local",
    benchmarkScore: opts.benchmarkScore,
    configurableEndpointEnv: opts.baseUrlEnv,
    requiredEnv: opts.apiKeyEnv ? [opts.apiKeyEnv] : undefined,
    description: opts.description,
  };

  function resolveBaseUrl(): string {
    return (opts.baseUrlEnv && process.env[opts.baseUrlEnv]) || opts.baseURL;
  }
  function resolveModel(): string {
    return (opts.modelEnv && process.env[opts.modelEnv]) || opts.defaultModel;
  }

  return {
    meta,

    async probe(): Promise<ProviderHealth> {
      const base = resolveBaseUrl();
      try {
        const res = await fetch(`${base}/models`, {
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

    async generate(req: TextGenerateRequest): Promise<TextGenerateResult> {
      const base = resolveBaseUrl();
      const model = req.model ?? resolveModel();
      const apiKey = opts.apiKeyEnv ? process.env[opts.apiKeyEnv] : undefined;

      const messages: Array<{ role: string; content: string }> = [];
      if (req.system) messages.push({ role: "system", content: req.system });
      for (const m of req.messages) messages.push({ role: m.role, content: m.content });

      const body = {
        model,
        messages,
        ...(req.temperature !== undefined && { temperature: req.temperature }),
        ...(req.maxTokens !== undefined && { max_tokens: req.maxTokens }),
        stream: false,
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 300_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(`${opts.id} ${res.status}: ${err.slice(0, 400)}`);
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
}

/** Preconfigured Ollama instance. Switch model/endpoint via OLLAMA_* env vars. */
export const ollamaProvider = createLocalProvider({
  id: "ollama",
  label: "Ollama (local)",
  baseURL: "http://localhost:11434/v1",
  defaultModel: "qwen3:14b",
  baseUrlEnv: "OLLAMA_BASE_URL",
  modelEnv: "OLLAMA_DEFAULT_MODEL",
  description: "Local LLM via Ollama — OpenAI-compatible /v1 API.",
});

/** Preconfigured LM Studio instance. Switch via LM_STUDIO_* env vars. */
export const lmStudioProvider = createLocalProvider({
  id: "lm-studio",
  label: "LM Studio (local)",
  baseURL: "http://localhost:1234/v1",
  defaultModel: "local-model",
  baseUrlEnv: "LM_STUDIO_BASE_URL",
  modelEnv: "LM_STUDIO_DEFAULT_MODEL",
  description: "Local LLM via LM Studio — OpenAI-compatible /v1 API.",
});
