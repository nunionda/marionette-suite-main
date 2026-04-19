/**
 * Local TTS — XTTS-v2 / Coqui / Piper / OpenVoice.
 *
 * We support the common "OpenAI-compatible audio.speech" endpoint shape that
 * LiteLLM, vLLM-audio, and several Coqui shims expose:
 *   POST {baseURL}/v1/audio/speech
 *   Body: { model, input, voice, response_format, speed }
 *   Response: raw audio bytes
 *
 * The factory `createLocalAudioProvider()` also accepts a custom path/bodyShape
 * for Piper's own HTTP API when needed.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  AudioAsset,
  AudioGenerateRequest,
  AudioGenerateResult,
  AudioProvider,
} from "./provider";

export interface LocalAudioProviderOptions {
  id: string;
  label: string;
  /** Base URL without trailing slash (e.g. http://localhost:5002). */
  baseURL: string;
  /** Path appended to baseURL. Defaults to `/v1/audio/speech` (OpenAI shape). */
  speechPath?: string;
  defaultVoice?: string;
  defaultModel?: string;
  baseUrlEnv?: string;
  voiceEnv?: string;
  modelEnv?: string;
  apiKeyEnv?: string;
  description?: string;
}

export function createLocalAudioProvider(opts: LocalAudioProviderOptions): AudioProvider {
  const meta: ProviderMeta = {
    id: opts.id,
    label: opts.label,
    capability: "audio",
    tier: "local",
    configurableEndpointEnv: opts.baseUrlEnv,
    requiredEnv: opts.apiKeyEnv ? [opts.apiKeyEnv] : undefined,
    description: opts.description,
  };

  const speechPath = opts.speechPath ?? "/v1/audio/speech";

  const resolveBaseUrl = () =>
    (opts.baseUrlEnv && process.env[opts.baseUrlEnv]) || opts.baseURL;
  const resolveVoice = () =>
    (opts.voiceEnv && process.env[opts.voiceEnv]) || opts.defaultVoice || "default";
  const resolveModel = () =>
    (opts.modelEnv && process.env[opts.modelEnv]) || opts.defaultModel || "default";

  return {
    meta,

    async probe(): Promise<ProviderHealth> {
      try {
        const res = await fetch(`${resolveBaseUrl()}/v1/models`, {
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

    async generate(req: AudioGenerateRequest): Promise<AudioGenerateResult> {
      const base = resolveBaseUrl();
      const voice = req.voiceId ?? resolveVoice();
      const model = req.model ?? resolveModel();
      const apiKey = opts.apiKeyEnv ? process.env[opts.apiKeyEnv] : undefined;

      const body: Record<string, unknown> = {
        model,
        input: req.text,
        voice,
        response_format: req.format ?? "mp3",
        ...(req.speed !== undefined && { speed: req.speed }),
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      const res = await fetch(`${base}${speechPath}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 120_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(`${opts.id} ${res.status}: ${err.slice(0, 400)}`);
      }
      const mime = res.headers.get("content-type") ?? "audio/mpeg";
      const buf = await res.arrayBuffer();
      const asset: AudioAsset = {
        kind: "bytes",
        bytes: new Uint8Array(buf),
        mime,
      };
      return {
        providerId: meta.id,
        audio: asset,
        usage: { units: req.text.length },
        raw: { voice, model, bytes: buf.byteLength },
      };
    },
  };
}

/** Coqui XTTS-v2 via a typical OpenAI-compat shim (LiteLLM). */
export const xttsProvider = createLocalAudioProvider({
  id: "xtts-local",
  label: "XTTS-v2 (local)",
  baseURL: "http://localhost:5002",
  defaultVoice: "default",
  defaultModel: "xtts_v2",
  baseUrlEnv: "XTTS_BASE_URL",
  voiceEnv: "XTTS_DEFAULT_VOICE",
  modelEnv: "XTTS_DEFAULT_MODEL",
  description: "Coqui XTTS-v2 local — multilingual cloning-capable free TTS.",
});

/** Piper — lightweight on-device TTS. Uses the same OpenAI shape when fronted by LiteLLM. */
export const piperProvider = createLocalAudioProvider({
  id: "piper-local",
  label: "Piper (local)",
  baseURL: "http://localhost:5003",
  defaultVoice: "en_US-lessac-medium",
  defaultModel: "piper",
  baseUrlEnv: "PIPER_BASE_URL",
  voiceEnv: "PIPER_DEFAULT_VOICE",
  modelEnv: "PIPER_DEFAULT_MODEL",
  description: "Piper local TTS — fast, ~20 voices, great for offline dev.",
});
