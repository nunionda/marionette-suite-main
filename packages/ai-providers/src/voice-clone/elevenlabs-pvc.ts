/**
 * ElevenLabs Voice Cloning — IVC (free/starter) + PVC (Creator+).
 *
 * Docs: https://elevenlabs.io/docs/api-reference/voices/add
 * Endpoints:
 *   POST {base}/voices/add              — Instant Voice Clone (synchronous, returns voice_id)
 *   POST {base}/voices/pvc              — Professional Voice Clone (async job; polling)
 *   GET  {base}/voices                  — list
 *   DELETE {base}/voices/{voice_id}     — remove
 *
 * Note: Free tier does NOT permit voice cloning — ElevenLabs returns 401.
 * The provider reports `ready` when key is present but the operator must have
 * Starter+/Creator+ for actual cloning to succeed.
 *
 * We model IVC as a pseudo-async job for interface uniformity: submit() does
 * the synchronous call and caches the result; poll() returns `done` immediately.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import type {
  TrainedVoice,
  VoiceCloneProvider,
  VoiceCloneTrainRequest,
  VoiceSample,
  VoiceTrainingStatus,
} from "./provider";

const API_BASE = "https://api.elevenlabs.io/v1";

const meta: ProviderMeta = {
  id: "elevenlabs-pvc",
  label: "ElevenLabs Voice Clone (IVC + PVC)",
  capability: "voice-clone",
  tier: "top",
  requiredEnv: ["ELEVENLABS_API_KEY"],
  description:
    "ElevenLabs voice cloning — IVC available on Starter+, PVC on Creator+. BYOK.",
};

interface ElevenAddVoiceResponse {
  voice_id: string;
  requires_verification?: boolean;
}
interface ElevenListVoicesResponse {
  voices?: Array<{
    voice_id: string;
    name: string;
    category?: string;
    labels?: { language?: string };
    available_for_tiers?: string[];
  }>;
}

/** Convert one sample into a FormData-ready Blob. */
function sampleToBlob(sample: VoiceSample): { blob: Blob; filename: string } {
  const label = sample.label ?? "sample";
  if (sample.audio.kind === "bytes") {
    // Node's Blob signature accepts ArrayBuffer but not ArrayBufferView.
    // Copy into a fresh Uint8Array (guaranteed non-shared) and cast .buffer
    // to ArrayBuffer to satisfy TypeScript's narrower type.
    const buf = new Uint8Array(sample.audio.bytes).buffer as ArrayBuffer;
    const blob = new Blob([buf], { type: sample.audio.mime });
    return { blob, filename: `${label}.${sample.audio.mime.split("/")[1] ?? "mp3"}` };
  }
  throw new Error("elevenlabs-pvc: VoiceSample.audio must be kind=bytes for upload");
}

interface Record_ {
  submittedAt: number;
  resolved?: VoiceTrainingStatus;
  tier: "instant" | "professional";
}

const _jobs = new Map<string, Record_>();

export const elevenLabsPvcProvider: VoiceCloneProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["ELEVENLABS_API_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async submit(req: VoiceCloneTrainRequest): Promise<{ jobId: string }> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error("ELEVENLABS_API_KEY not set");

    const tier = req.tier ?? "instant";
    const jobId = `pvc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const submittedAt = Date.now();
    _jobs.set(jobId, { submittedAt, tier });

    if (tier === "instant") {
      // IVC is synchronous — perform the call now, stash the result, return jobId.
      const form = new FormData();
      form.append("name", req.name);
      if (req.description) form.append("description", req.description);
      for (const sample of req.samples) {
        const { blob, filename } = sampleToBlob(sample);
        form.append("files", blob, filename);
      }
      try {
        const res = await fetch(`${API_BASE}/voices/add`, {
          method: "POST",
          headers: { "xi-api-key": key },
          body: form,
          signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 120_000),
        });
        if (!res.ok) {
          const err = await res.text().catch(() => "");
          _jobs.set(jobId, {
            submittedAt,
            tier,
            resolved: {
              state: "failed",
              submittedAt,
              finishedAt: Date.now(),
              error: `${res.status}: ${err.slice(0, 400)}`,
            },
          });
          return { jobId };
        }
        const json = (await res.json()) as ElevenAddVoiceResponse;
        _jobs.set(jobId, {
          submittedAt,
          tier,
          resolved: {
            state: "done",
            submittedAt,
            finishedAt: Date.now(),
            voiceId: json.voice_id,
          },
        });
      } catch (e) {
        _jobs.set(jobId, {
          submittedAt,
          tier,
          resolved: {
            state: "failed",
            submittedAt,
            finishedAt: Date.now(),
            error: e instanceof Error ? e.message : String(e),
          },
        });
      }
      return { jobId };
    }

    // Professional Voice Clone — async. Not yet implemented; left as a guarded
    // no-op to keep the registry consistent until the operator upgrades.
    _jobs.set(jobId, {
      submittedAt,
      tier,
      resolved: {
        state: "failed",
        submittedAt,
        finishedAt: Date.now(),
        error:
          "PVC async flow is not yet wired — use tier='instant' or upgrade this provider.",
      },
    });
    return { jobId };
  },

  async poll(jobId: string): Promise<VoiceTrainingStatus> {
    const rec = _jobs.get(jobId);
    if (!rec) throw new Error(`Unknown voice-clone jobId: ${jobId}`);
    if (rec.resolved) return rec.resolved;
    return { state: "pending", submittedAt: rec.submittedAt };
  },

  async list(): Promise<TrainedVoice[]> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return [];
    const res = await fetch(`${API_BASE}/voices`, {
      headers: { "xi-api-key": key },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as ElevenListVoicesResponse;
    return (json.voices ?? [])
      .filter((v) => v.category === "cloned" || v.category === "professional")
      .map((v) => ({
        voiceId: v.voice_id,
        name: v.name,
        createdAt: 0,
        language: v.labels?.language,
        raw: v,
      }));
  },

  async remove(voiceId: string): Promise<void> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return;
    await fetch(`${API_BASE}/voices/${voiceId}`, {
      method: "DELETE",
      headers: { "xi-api-key": key },
      signal: AbortSignal.timeout(10_000),
    }).catch(() => void 0);
  },
};
