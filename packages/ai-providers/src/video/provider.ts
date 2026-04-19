/**
 * VideoProvider — generation jobs take MINUTES, not seconds. We model this as
 * an async 2-phase interface:
 *
 *   1. submit(req) -> { jobId }          // fast; registers the job with the vendor
 *   2. poll(jobId) -> status | done      // called by job-runner or smoke test loop
 *
 * The unified ShotGenRequest is the Higgsfield Cinema Studio 3.5 feature
 * matrix: 9 references + first/last frame anchors + camera body + motion stack
 * (max 3 axes) + 8 speed ramp presets + native audio. Providers that don't
 * support a given field must ignore it silently — the orchestrator (Layer 3)
 * will re-request with a richer-capable provider when consistency matters.
 */
import type {
  BaseGenerateRequest,
  BaseGenerateResult,
  ProviderHealth,
  ProviderMeta,
} from "../types";
import type { ImageAspectRatio, ImageReference } from "../image/provider";

/** Industry camera bodies — registry of simulations Higgsfield exposes. */
export type CameraBody =
  | "arri-alexa"
  | "red-komodo"
  | "sony-venice"
  | "blackmagic-ursa"
  | "canon-c500"
  | "phantom-flex" // high-fps slow-mo
  | "iphone-pro" // mobile-style / UGC marketing
  | "unspecified";

export interface CameraSim {
  body?: CameraBody;
  /** Millimeters (e.g. 24, 35, 50, 85). */
  focalMm?: number;
  /** f-stop aperture (e.g. 1.4, 2.8, 8). */
  aperture?: number;
  aspectRatio?: ImageAspectRatio;
}

/** Higgsfield Cinema 3.5 multi-axis motion stack. Up to 3 simultaneous moves. */
export type MotionAxis = {
  type:
    | "dolly"
    | "pan"
    | "tilt"
    | "zoom"
    | "orbit"
    | "crane"
    | "handheld"
    | "whip"
    | "roll"
    | "push-in"
    | "pull-out";
  direction?: "in" | "out" | "left" | "right" | "up" | "down" | "cw" | "ccw";
  /** 0..1 — how aggressive the move is. */
  intensity?: number;
  /** 0..1 — 0 = at start of shot, 1 = at end; defaults to 0 (shot-wide). */
  startAt?: number;
};

/** Higgsfield Cinema Studio 3.5 speed ramp presets (8 total). */
export type SpeedRampPreset =
  | "linear"
  | "auto"
  | "flash-in"
  | "flash-out"
  | "slow-mo"
  | "bullet-time"
  | "impact"
  | "ramp-up";

export interface VideoFrameAnchor {
  /** Reference image to anchor frame-0 or frame-N to. Honored by Seedance 2.0. */
  reference: ImageReference;
  /** Strength of the anchor (Seedance range 0..1). */
  weight?: number;
}

export interface VideoAudioOptions {
  /** When true and provider supports it (Seedance 2.0), include dialogue/SFX/music. */
  native?: boolean;
  /** Optional dialogue transcript. Providers with lip-sync apply per-character. */
  dialogue?: string;
  /** "foley" = ambient + effects; "music" = background score; "all" = both. */
  include?: Array<"foley" | "music" | "dialogue">;
}

export interface VideoGenerateRequest extends BaseGenerateRequest {
  prompt: string;
  negativePrompt?: string;

  /** Higgsfield-style 9-reference pattern for identity/style anchoring. */
  references?: ImageReference[];

  /** Seedance 2.0 first/last frame anchors — exclusive with pure text2video. */
  firstFrame?: VideoFrameAnchor;
  lastFrame?: VideoFrameAnchor;

  camera?: CameraSim;
  /** Max 3 simultaneous axes per Higgsfield 3.5 spec. */
  motionStack?: MotionAxis[];
  speedRamp?: SpeedRampPreset;

  /** 4..15 seconds (Seedance range). Providers may clamp. */
  durationSec?: number;
  fps?: 24 | 30 | 60;
  /** Quality preset — "draft" prefers speed, "final" prefers fidelity. */
  quality?: "draft" | "final";
  seed?: number;

  audio?: VideoAudioOptions;

  /** Provider-specific pass-through — used sparingly, mostly for debug. */
  providerHints?: Record<string, unknown>;

  model?: string;
}

export type VideoJobStatus =
  | { state: "pending"; submittedAt: number }
  | { state: "running"; submittedAt: number; progress?: number /* 0..1 */; etaMs?: number }
  | { state: "done"; submittedAt: number; finishedAt: number; result: VideoGenerateResult }
  | { state: "failed"; submittedAt: number; finishedAt: number; error: string }
  | { state: "canceled"; submittedAt: number; finishedAt: number };

export type VideoAsset =
  | { kind: "url"; url: string; mime?: string; durationSec?: number; width?: number; height?: number }
  | { kind: "bytes"; bytes: Uint8Array; mime: string; durationSec?: number; width?: number; height?: number };

export interface VideoGenerateResult extends BaseGenerateResult {
  videos: VideoAsset[];
  /** Audio track URL/bytes when provider returns it separately (not native). */
  audioTracks?: VideoAsset[];
  seed?: number;
}

/**
 * Video provider interface — 2-phase (submit + poll). A convenience
 * `generateBlocking()` default is provided by each provider by polling its
 * own `poll()` until done, with reasonable timeouts; higher layers that run
 * inside a job-runner should prefer the submit+poll pair directly.
 */
export interface VideoProvider {
  readonly meta: ProviderMeta;
  probe(): Promise<ProviderHealth>;
  submit(req: VideoGenerateRequest): Promise<{ jobId: string }>;
  poll(jobId: string): Promise<VideoJobStatus>;
  /** Optional — not all vendors expose cancel. */
  cancel?(jobId: string): Promise<void>;
  /**
   * Convenience wrapper: submit then poll every `pollIntervalMs` until done or
   * `timeoutMs` reached. Implementations may optimise (e.g. webhook) later.
   */
  generateBlocking(
    req: VideoGenerateRequest,
    opts?: { pollIntervalMs?: number; timeoutMs?: number },
  ): Promise<VideoGenerateResult>;
}

/**
 * Default polling implementation — providers reuse via composition.
 * Extracted so each vendor file stays focused on submit/poll specifics.
 */
export async function pollUntilDone(
  provider: Pick<VideoProvider, "poll">,
  jobId: string,
  opts: { pollIntervalMs?: number; timeoutMs?: number } = {},
): Promise<VideoGenerateResult> {
  const pollInterval = opts.pollIntervalMs ?? 5_000;
  const timeout = opts.timeoutMs ?? 15 * 60_000; // 15 minutes default
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const status = await provider.poll(jobId);
    if (status.state === "done") return status.result;
    if (status.state === "failed") throw new Error(`Video job ${jobId} failed: ${status.error}`);
    if (status.state === "canceled") throw new Error(`Video job ${jobId} canceled`);
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
  throw new Error(`Video job ${jobId} timed out after ${timeout}ms`);
}
