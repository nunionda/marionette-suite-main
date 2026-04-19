/**
 * HuggingFace Inference — HunyuanVideo / LTX-Video / Wan 2.2 / CogVideoX.
 * FREE tier default + fallback for video.
 *
 * HF exposes two relevant endpoints:
 *   - Classic Inference API (`api-inference.huggingface.co/models/{repo}`):
 *     many video models return raw binary bytes or a Serverless Endpoint. Some
 *     are cold (503 while loading).
 *   - Inference Endpoints / Providers routing (`router.huggingface.co/...`):
 *     premium/replicate-style, often via specific provider backends.
 *
 * For portability we only implement the classic Inference API, which is the
 * free tier most users have. Response is **raw mp4/webm bytes**.
 *
 * Unlike fal.ai and Kling, HF Inference is *synchronous* — the request hangs
 * until generation completes. We still expose it through the 2-phase
 * VideoProvider interface by holding the request in memory as the "job".
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import {
  pollUntilDone,
  type VideoAsset,
  type VideoGenerateRequest,
  type VideoGenerateResult,
  type VideoJobStatus,
  type VideoProvider,
} from "./provider";

const API_BASE = "https://api-inference.huggingface.co/models";

export interface HfVideoProviderOptions {
  id: string;
  label: string;
  /** HF repo id, e.g. "tencent/HunyuanVideo" or "Lightricks/LTX-Video". */
  repo: string;
  /** Env var that can override the repo at runtime. */
  repoEnv?: string;
  /** Benchmark score for UI display. */
  benchmarkScore?: number;
  description?: string;
  /** Default resolution hint — HF models differ widely. */
  defaultWidth?: number;
  defaultHeight?: number;
  /** Preferred number of frames (maps to duration via default 24fps). */
  defaultFrames?: number;
}

interface PendingJob {
  submittedAt: number;
  promise: Promise<VideoGenerateResult>;
  resolved?: VideoJobStatus;
}

export function createHfVideoProvider(opts: HfVideoProviderOptions): VideoProvider {
  const meta: ProviderMeta = {
    id: opts.id,
    label: opts.label,
    capability: "video",
    tier: "free",
    benchmarkScore: opts.benchmarkScore,
    requiredEnv: ["HF_TOKEN"],
    description: opts.description,
  };

  const _jobs = new Map<string, PendingJob>();

  async function runRequest(req: VideoGenerateRequest): Promise<VideoGenerateResult> {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error("HF_TOKEN not set");
    const repo = req.model ?? (opts.repoEnv && process.env[opts.repoEnv]) ?? opts.repo;

    const fps = req.fps ?? 24;
    const frames = req.durationSec ? req.durationSec * fps : opts.defaultFrames ?? 120;

    const body = {
      inputs: req.prompt,
      parameters: {
        ...(req.negativePrompt && { negative_prompt: req.negativePrompt }),
        num_frames: frames,
        width: opts.defaultWidth ?? 848,
        height: opts.defaultHeight ?? 480,
        ...(req.seed !== undefined && { seed: req.seed }),
      },
      options: { wait_for_model: true },
    };

    const res = await fetch(`${API_BASE}/${repo}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(req.timeoutMs ?? 10 * 60_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`${opts.id} ${res.status}: ${err.slice(0, 400)}`);
    }

    const mime = res.headers.get("content-type") ?? "video/mp4";
    if (mime.startsWith("application/json")) {
      // HF returned an error as JSON despite 200 status
      const j = await res.json().catch(() => ({}));
      throw new Error(`${opts.id}: unexpected JSON response: ${JSON.stringify(j).slice(0, 300)}`);
    }
    const buf = await res.arrayBuffer();

    const asset: VideoAsset = {
      kind: "bytes",
      bytes: new Uint8Array(buf),
      mime,
      durationSec: req.durationSec,
    };

    return {
      providerId: meta.id,
      videos: [asset],
      seed: req.seed,
      usage: { units: 1 },
      raw: { repo, mime, bytes: buf.byteLength },
    };
  }

  return {
    meta,

    async probe(): Promise<ProviderHealth> {
      const token = process.env.HF_TOKEN;
      if (!token) return { state: "missing-key", requiredEnv: ["HF_TOKEN"] };
      return { state: "ready", lastProbeAt: Date.now() };
    },

    async submit(req: VideoGenerateRequest): Promise<{ jobId: string }> {
      const jobId = `hf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const submittedAt = Date.now();
      const promise = runRequest(req);
      _jobs.set(jobId, { submittedAt, promise });
      // Fire-and-forget completion capture so poll() doesn't hang the fetch
      promise
        .then((result) => {
          const job = _jobs.get(jobId);
          if (job) {
            job.resolved = {
              state: "done",
              submittedAt,
              finishedAt: Date.now(),
              result,
            };
          }
        })
        .catch((err: unknown) => {
          const job = _jobs.get(jobId);
          if (job) {
            job.resolved = {
              state: "failed",
              submittedAt,
              finishedAt: Date.now(),
              error: err instanceof Error ? err.message : String(err),
            };
          }
        });
      return { jobId };
    },

    async poll(jobId: string): Promise<VideoJobStatus> {
      const job = _jobs.get(jobId);
      if (!job) throw new Error(`Unknown jobId: ${jobId}`);
      if (job.resolved) return job.resolved;
      return { state: "running", submittedAt: job.submittedAt };
    },

    async generateBlocking(req, opts) {
      // Skip the job map — directly await the single-request promise
      return runRequest(req);
    },
  };
}

/** HunyuanVideo — free high-quality default for text-to-video. */
export const hunyuanHfProvider = createHfVideoProvider({
  id: "hunyuan-hf",
  label: "HunyuanVideo (HF)",
  repo: "tencent/HunyuanVideo",
  repoEnv: "HUNYUAN_HF_REPO",
  description: "Tencent HunyuanVideo — free via HF Inference.",
  defaultWidth: 848,
  defaultHeight: 480,
  defaultFrames: 120,
});

/** Wan 2.2 — Alibaba free fallback. */
export const wanHfProvider = createHfVideoProvider({
  id: "wan-2.2-hf",
  label: "Wan 2.2 (HF)",
  repo: "Wan-AI/Wan2.2-T2V-A14B",
  repoEnv: "WAN_HF_REPO",
  description: "Alibaba Wan 2.2 — free via HF Inference (fallback).",
  defaultWidth: 832,
  defaultHeight: 480,
  defaultFrames: 120,
});

/** LTX-Video — Lightricks free, very fast. */
export const ltxHfProvider = createHfVideoProvider({
  id: "ltx-video-hf",
  label: "LTX-Video (HF)",
  repo: "Lightricks/LTX-Video",
  repoEnv: "LTX_HF_REPO",
  description: "Lightricks LTX-Video — fast, free via HF Inference.",
  defaultWidth: 768,
  defaultHeight: 512,
  defaultFrames: 121,
});
