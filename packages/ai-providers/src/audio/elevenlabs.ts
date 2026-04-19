/**
 * ElevenLabs v3 — TOP tier TTS + Professional Voice Cloning (April 2026).
 *
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 * Endpoint: https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 * Auth: `xi-api-key: {ELEVENLABS_API_KEY}`
 *
 * Free tier: 10k credits/month, watermark, non-commercial. Paid Creator ($22/m)
 * removes watermark + adds Professional Voice Cloning (PVC). Policy-wise we
 * treat this as BYOK — registry only activates if the user's key works.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  AudioAsset,
  AudioGenerateRequest,
  AudioGenerateResult,
  AudioProvider,
} from "./provider";

const API_BASE = "https://api.elevenlabs.io/v1";
/** Default voice — "Rachel" is a stock ElevenLabs voice id, accessible on free tier. */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL = "eleven_multilingual_v2";

const meta: ProviderMeta = {
  id: "elevenlabs-v3",
  label: "ElevenLabs v3",
  capability: "audio",
  tier: "top",
  requiredEnv: ["ELEVENLABS_API_KEY"],
  description: "ElevenLabs v3 TTS + PVC. BYOK; free tier watermarked 10k credits/mo.",
};

interface VoiceListResponse {
  voices?: Array<{
    voice_id: string;
    name: string;
    labels?: { language?: string; gender?: string; accent?: string };
  }>;
}

function formatToMime(format?: string): string {
  if (!format) return "audio/mpeg";
  if (format.startsWith("mp3")) return "audio/mpeg";
  if (format.startsWith("wav")) return "audio/wav";
  if (format.startsWith("ogg")) return "audio/ogg";
  if (format.startsWith("pcm")) return "audio/pcm";
  return "audio/mpeg";
}

/** Map our AudioFormat to ElevenLabs output_format query param. */
function formatToEleven(format?: string): string {
  const map: Record<string, string> = {
    mp3: "mp3_44100_128",
    wav: "pcm_44100",
    ogg: "pcm_44100",
    pcm_16000: "pcm_16000",
    pcm_22050: "pcm_22050",
    pcm_44100: "pcm_44100",
  };
  return format ? (map[format] ?? "mp3_44100_128") : "mp3_44100_128";
}

export const elevenLabsProvider: AudioProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["ELEVENLABS_API_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async generate(req: AudioGenerateRequest): Promise<AudioGenerateResult> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error("ELEVENLABS_API_KEY not set");

    const voiceId = req.voiceId ?? process.env.ELEVENLABS_DEFAULT_VOICE ?? DEFAULT_VOICE_ID;
    const model = req.model ?? process.env.ELEVENLABS_DEFAULT_MODEL ?? DEFAULT_MODEL;
    const outputFormat = formatToEleven(req.format);
    const url = `${API_BASE}/text-to-speech/${voiceId}?output_format=${outputFormat}`;

    const body = {
      text: req.text,
      model_id: model,
      ...(req.language && { language_code: req.language }),
      voice_settings: {
        ...(req.stability !== undefined && { stability: req.stability }),
        ...(req.similarityBoost !== undefined && { similarity_boost: req.similarityBoost }),
        ...(req.speed !== undefined && { speed: req.speed }),
      },
      ...(req.seed !== undefined && { seed: req.seed }),
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": key,
        Accept: formatToMime(req.format),
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 120_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 400)}`);
    }

    const mime = res.headers.get("content-type") ?? formatToMime(req.format);
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
      raw: { voiceId, model, bytes: buf.byteLength },
    };
  },

  async listVoices() {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API_BASE}/voices`, {
      headers: { "xi-api-key": key },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as VoiceListResponse;
    return (json.voices ?? []).map((v) => ({
      id: v.voice_id,
      name: v.name,
      language: v.labels?.language,
      gender: v.labels?.gender,
    }));
  },
};
