/**
 * Kling 3.0 — Kuaishou (Arena Elo 1100, multi-shot coherence, April 2026).
 * TOP B tier, BYOK via Kling direct API. Free tier: 66 daily credits (watermarked).
 *
 * Docs: https://docs.qingque.cn/s/home/eZQApbK76fUrqvgs15fAbL-CMP
 * Endpoint: https://api-beijing.klingai.com/v1/videos/text2video (POST submit)
 *           /v1/videos/text2video/{taskId}                      (GET poll)
 *
 * Auth: JWT (iss=access_key, exp=+30min, signed with HS256 using secret_key).
 * We sign locally with Web Crypto to avoid a jose/jsonwebtoken dependency.
 */
import type { ProviderHealth, ProviderMeta } from "../types";
import {
  pollUntilDone,
  type VideoAsset,
  type VideoGenerateRequest,
  type VideoJobStatus,
  type VideoProvider,
} from "./provider";
import type { ImageReference } from "../image/provider";

const API_BASE = "https://api-beijing.klingai.com";

const meta: ProviderMeta = {
  id: "kling-3.0",
  label: "Kling 3.0 (direct)",
  capability: "video",
  tier: "top",
  benchmarkScore: 1100,
  requiredEnv: ["KLING_ACCESS_KEY", "KLING_SECRET_KEY"],
  description: "Kuaishou Kling 3.0 — multi-shot coherence. BYOK or free 66 daily credits.",
};

function base64url(input: Uint8Array | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));
  return b64.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function signKlingJwt(accessKey: string, secretKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 }),
  );
  const data = `${header}.${payload}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64url(new Uint8Array(signature))}`;
}

async function refToImagePayload(ref: ImageReference): Promise<string> {
  if (ref.kind === "url") return ref.url;
  if (ref.kind === "dataUrl") {
    const m = /^data:[^;]+;base64,(.*)$/.exec(ref.dataUrl);
    return m ? m[1]! : ref.dataUrl;
  }
  return typeof Buffer !== "undefined"
    ? Buffer.from(ref.bytes).toString("base64")
    : btoa(String.fromCharCode(...ref.bytes));
}

interface KlingSubmitResponse {
  code: number;
  message?: string;
  data?: { task_id: string };
}
interface KlingStatusResponse {
  code: number;
  data?: {
    task_id: string;
    task_status: "submitted" | "processing" | "succeed" | "failed";
    task_status_msg?: string;
    task_result?: {
      videos?: Array<{ url: string; duration?: string }>;
    };
  };
}

const _submittedAt = new Map<string, number>();

export const klingProvider: VideoProvider = {
  meta,

  async probe(): Promise<ProviderHealth> {
    const access = process.env.KLING_ACCESS_KEY;
    const secret = process.env.KLING_SECRET_KEY;
    if (!access || !secret) {
      return { state: "missing-key", requiredEnv: ["KLING_ACCESS_KEY", "KLING_SECRET_KEY"] };
    }
    return { state: "ready", lastProbeAt: Date.now() };
  },

  async submit(req: VideoGenerateRequest): Promise<{ jobId: string }> {
    const access = process.env.KLING_ACCESS_KEY;
    const secret = process.env.KLING_SECRET_KEY;
    if (!access || !secret) throw new Error("KLING keys not set");

    const token = await signKlingJwt(access, secret);

    const body: Record<string, unknown> = {
      model_name: req.model ?? process.env.KLING_MODEL ?? "kling-v3",
      prompt: req.prompt,
      ...(req.negativePrompt && { negative_prompt: req.negativePrompt }),
      duration: String(req.durationSec ?? 5),
      aspect_ratio: req.camera?.aspectRatio ?? "16:9",
      mode: req.quality === "final" ? "pro" : "std",
      cfg_scale: 0.5,
    };

    if (req.firstFrame) body.image = await refToImagePayload(req.firstFrame.reference);
    if (req.lastFrame) body.image_tail = await refToImagePayload(req.lastFrame.reference);

    if (req.motionStack?.length) {
      const primary = req.motionStack[0]!;
      const presetMap: Record<string, string> = {
        "push-in": "forward_up",
        "pull-out": "right_turn_forward",
        "orbit": "left_turn_forward",
        "pan": "horizontal",
        "tilt": "vertical",
        "roll": "pan_up",
      };
      const preset = presetMap[primary.type];
      if (preset) body.camera_control = { type: preset };
    }

    const res = await fetch(`${API_BASE}/v1/videos/text2video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: req.signal ?? AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Kling submit ${res.status}: ${err.slice(0, 400)}`);
    }
    const json = (await res.json()) as KlingSubmitResponse;
    if (json.code !== 0 || !json.data?.task_id) {
      throw new Error(`Kling submit failed: ${json.message ?? JSON.stringify(json)}`);
    }
    _submittedAt.set(json.data.task_id, Date.now());
    return { jobId: json.data.task_id };
  },

  async poll(jobId: string): Promise<VideoJobStatus> {
    const access = process.env.KLING_ACCESS_KEY;
    const secret = process.env.KLING_SECRET_KEY;
    if (!access || !secret) throw new Error("Kling keys missing");
    const submittedAt = _submittedAt.get(jobId) ?? Date.now();

    const token = await signKlingJwt(access, secret);
    const res = await fetch(`${API_BASE}/v1/videos/text2video/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Kling poll ${res.status}`);
    const json = (await res.json()) as KlingStatusResponse;

    const status = json.data?.task_status;
    if (status === "submitted") return { state: "pending", submittedAt };
    if (status === "processing") return { state: "running", submittedAt };
    if (status === "failed") {
      return {
        state: "failed",
        submittedAt,
        finishedAt: Date.now(),
        error: json.data?.task_status_msg ?? "failed",
      };
    }
    const videos: VideoAsset[] = (json.data?.task_result?.videos ?? []).map((v) => ({
      kind: "url" as const,
      url: v.url,
      durationSec: v.duration ? Number(v.duration) : undefined,
    }));
    return {
      state: "done",
      submittedAt,
      finishedAt: Date.now(),
      result: {
        providerId: meta.id,
        videos,
        raw: json.data,
      },
    };
  },

  async generateBlocking(req, opts) {
    const { jobId } = await this.submit(req);
    return pollUntilDone(this, jobId, opts);
  },
};
