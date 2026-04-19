/**
 * Seedance 2.0 — ByteDance (Arena Elo 1222, native audio, April 2026).
 * TOP A tier, BYOK via fal.ai queue API.
 *
 * Docs:  https://fal.ai/models/fal-ai/bytedance/seedance/v2/text-to-video
 * Queue: https://queue.fal.run/{model}       (POST to submit)
 *        https://queue.fal.run/{model}/requests/{id}/status  (GET to poll)
 *        https://queue.fal.run/{model}/requests/{id}         (GET to fetch result)
 * Auth: `Authorization: Key {FAL_KEY}`
 *
 * Seedance distinguishes feature via the model endpoint:
 *   fal-ai/bytedance/seedance/v2/text-to-video       (text only)
 *   fal-ai/bytedance/seedance/v2/image-to-video      (+ first frame)
 *   fal-ai/bytedance/seedance/v2/reference-to-video  (+ 9 refs)
 *
 * We pick the endpoint automatically based on request shape.
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
import type { ImageReference } from "../image/provider";

const FAL_QUEUE_BASE = "https://queue.fal.run";

function pickModel(req: VideoGenerateRequest): string {
  if (process.env.SEEDANCE_MODEL) return process.env.SEEDANCE_MODEL;
  const hasRefs = (req.references?.length ?? 0) > 0;
  const hasFirstOrLast = !!(req.firstFrame || req.lastFrame);
  if (hasRefs) return "fal-ai/bytedance/seedance/v2/reference-to-video";
  if (hasFirstOrLast) return "fal-ai/bytedance/seedance/v2/image-to-video";
  return "fal-ai/bytedance/seedance/v2/text-to-video";
}

const meta: ProviderMeta = {
  id: "seedance-2.0",
  label: "Seedance 2.0 (fal.ai)",
  capability: "video",
  tier: "top",
  benchmarkScore: 1222,
  requiredEnv: ["FAL_KEY"],
  description: "ByteDance Seedance 2.0 via fal.ai — native audio, 9-ref, first/last anchors.",
};

async function refToUrl(ref: ImageReference): Promise<string> {
  if (ref.kind === "url") return ref.url;
  if (ref.kind === "dataUrl") return ref.dataUrl;
  // For bytes, inline as data URL (fal.ai accepts this)
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(ref.bytes).toString("base64")
      : btoa(String.fromCharCode(...ref.bytes));
  return `data:${ref.mime};base64,${base64}`;
}

interface FalQueueSubmitResponse {
  request_id: string;
  response_url?: string;
  status_url?: string;
  cancel_url?: string;
}
interface FalQueueStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  logs?: Array<{ message: string }>;
  queue_position?: number;
}
interface FalVideoPayload {
  video?: { url: string; content_type?: string; file_size?: number };
  audio?: { url: string; content_type?: string };
  seed?: number;
}

/** We keep submit-time metadata for accurate job status reporting. */
const _submittedAt = new Map<string, { ts: number; model: string }>();

export const seedanceProvider: VideoProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const key = process.env.FAL_KEY;
    if (!key) return { state: "missing-key", requiredEnv: ["FAL_KEY"] };
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async submit(req: VideoGenerateRequest): Promise<{ jobId: string }> {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY not set");

    const model = req.model ?? pickModel(req);
    const url = `${FAL_QUEUE_BASE}/${model}`;

    // fal.ai input schema — fields map to Seedance v2 parameters
    const input: Record<string, unknown> = {
      prompt: req.prompt,
      ...(req.negativePrompt && { negative_prompt: req.negativePrompt }),
      ...(req.durationSec && { duration: req.durationSec }),
      ...(req.seed !== undefined && { seed: req.seed }),
      ...(req.camera?.aspectRatio && { aspect_ratio: req.camera.aspectRatio }),
      ...(req.audio?.native && { generate_audio: true }),
    };

    if (req.references?.length) {
      input.reference_image_urls = await Promise.all(
        req.references.slice(0, 9).map(refToUrl),
      );
    }
    if (req.firstFrame) {
      input.image_url = await refToUrl(req.firstFrame.reference);
    }
    if (req.lastFrame) {
      input.end_image_url = await refToUrl(req.lastFrame.reference);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${key}`,
      },
      body: JSON.stringify({ input }),
      signal: req.signal ?? AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Seedance submit ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as FalQueueSubmitResponse;
    if (!json.request_id) throw new Error("Seedance: no request_id in response");

    _submittedAt.set(json.request_id, { ts: Date.now(), model });
    return { jobId: json.request_id };
  },

  async poll(jobId: string): Promise<VideoJobStatus> {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY not set");
    const rec = _submittedAt.get(jobId);
    if (!rec) throw new Error(`Unknown jobId: ${jobId}`);

    const statusUrl = `${FAL_QUEUE_BASE}/${rec.model}/requests/${jobId}/status`;
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!statusRes.ok) throw new Error(`Seedance status ${statusRes.status}`);
    const status = (await statusRes.json()) as FalQueueStatusResponse;

    const submittedAt = rec.ts;
    if (status.status === "IN_QUEUE") return { state: "pending", submittedAt };
    if (status.status === "IN_PROGRESS") return { state: "running", submittedAt };
    if (status.status === "CANCELLED") {
      return { state: "canceled", submittedAt, finishedAt: Date.now() };
    }
    if (status.status === "FAILED") {
      const err = status.logs?.map((l) => l.message).join("; ") ?? "failed";
      return { state: "failed", submittedAt, finishedAt: Date.now(), error: err };
    }
    // COMPLETED — fetch actual payload
    const resultUrl = `${FAL_QUEUE_BASE}/${rec.model}/requests/${jobId}`;
    const resultRes = await fetch(resultUrl, {
      headers: { Authorization: `Key ${key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!resultRes.ok) throw new Error(`Seedance result ${resultRes.status}`);
    const payload = (await resultRes.json()) as FalVideoPayload;

    const videos: VideoAsset[] = payload.video
      ? [{ kind: "url", url: payload.video.url, mime: payload.video.content_type }]
      : [];
    const audioTracks: VideoAsset[] | undefined = payload.audio
      ? [{ kind: "url", url: payload.audio.url, mime: payload.audio.content_type }]
      : undefined;

    return {
      state: "done",
      submittedAt,
      finishedAt: Date.now(),
      result: {
        providerId: meta.id,
        videos,
        audioTracks,
        seed: payload.seed,
        raw: payload,
      },
    };
  },

  async cancel(jobId: string): Promise<void> {
    const key = process.env.FAL_KEY;
    const rec = _submittedAt.get(jobId);
    if (!key || !rec) return;
    await fetch(`${FAL_QUEUE_BASE}/${rec.model}/requests/${jobId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Key ${key}` },
    }).catch(() => void 0);
  },

  async generateBlocking(req, opts) {
    const { jobId } = await this.submit(req);
    return pollUntilDone(this, jobId, opts);
  },
};
