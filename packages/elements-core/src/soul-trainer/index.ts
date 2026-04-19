/**
 * Soul ID trainer — async orchestration for image identity locks.
 *
 * The training step turns an Element's `references[]` into a persistent
 * `ElementIdentity`. Different vendors offer the same conceptual operation:
 *
 *   - HuggingFace LoRA / Dreambooth  (self-hosted via Spaces / Inference Endpoints)
 *   - Higgsfield Soul 2.0            (managed identity lock)
 *   - textual-inversion              (lightweight alternative)
 *
 * All of these take ≥1 minute, so the interface is async-first — mirroring
 * the `VideoProvider` 2-phase pattern from `@marionette/ai-providers/video`.
 *
 * Voice cloning (ElevenLabs IVC/PVC) is NOT handled here — it lives in
 * `@marionette/ai-providers/voice-clone` because its interface + vendor
 * surface is already covered there. A future `trainElementVoice()` helper
 * can call into that provider the same way this one calls into image
 * trainers, but keeping them separate avoids premature unification.
 */
import type { ImageReference } from "@marionette/ai-providers/image";
import type {
  Element,
  ElementIdentity,
  ElementPatch,
} from "../types";
import type { ElementStore } from "../store/index";

/** Provider id reused inside ElementIdentity.provider. */
export type ImageTrainerProvider =
  | "soul-2.0"
  | "lora"
  | "dreambooth"
  | "textual-inversion";

export interface TrainerTrainRequest {
  /** Element we are training — passed by reference for trainer-side metadata. */
  element: Pick<Element, "id" | "projectId" | "kind" | "name">;
  /** Source samples. Trainer may impose minimum (e.g. Soul 2.0 needs ≥3). */
  references: ImageReference[];
  /** Vendor-native knobs (steps, LR, instance_prompt, etc). Opaque passthrough. */
  params?: Record<string, unknown>;
  /** Optional AbortSignal — if trainer supports cancellation. */
  signal?: AbortSignal;
}

export type TrainerJobStatus =
  | { state: "pending"; submittedAt: number; progress?: number }
  | { state: "running"; submittedAt: number; progress?: number; note?: string }
  | {
      state: "done";
      submittedAt: number;
      finishedAt: number;
      identity: ElementIdentity;
    }
  | {
      state: "failed";
      submittedAt: number;
      finishedAt: number;
      error: string;
    };

export interface SoulTrainer {
  readonly provider: ImageTrainerProvider;
  submit(req: TrainerTrainRequest): Promise<{ jobId: string }>;
  poll(jobId: string): Promise<TrainerJobStatus>;
  /** Optional — some vendors support cancel. */
  cancel?(jobId: string): Promise<void>;
}

/**
 * Workflow helper — runs the full train → poll → patch cycle.
 *
 * Keeps trainer + store decoupled: the trainer produces an
 * `ElementIdentity`, and this function is the *only* place that touches
 * both. Callers (Hub API routes, CinemaOrchestrator) invoke this.
 */
export interface TrainElementOptions {
  /** How often to poll. Default 2s for mock, 15s recommended for real vendors. */
  pollIntervalMs?: number;
  /** Overall timeout before giving up. Default 30 minutes. */
  timeoutMs?: number;
  /** Hook called on each poll — feed a progress bar. */
  onProgress?: (status: TrainerJobStatus) => void;
}

export async function trainElement(
  store: ElementStore,
  trainer: SoulTrainer,
  elementId: string,
  opts: TrainElementOptions = {},
): Promise<Element> {
  const element = await store.get(elementId);
  if (!element) throw new Error(`Element not found: ${elementId}`);
  if (element.references.length === 0) {
    throw new Error(
      `Cannot train element ${elementId} — references[] is empty.`,
    );
  }

  const { jobId } = await trainer.submit({
    element: {
      id: element.id,
      projectId: element.projectId,
      kind: element.kind,
      name: element.name,
    },
    references: element.references,
  });

  const pollIntervalMs = opts.pollIntervalMs ?? 2000;
  const timeoutMs = opts.timeoutMs ?? 30 * 60 * 1000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const status = await trainer.poll(jobId);
    opts.onProgress?.(status);

    if (status.state === "done") {
      const patch: ElementPatch = {
        id: elementId,
        identity: status.identity,
      };
      return store.patch(patch);
    }
    if (status.state === "failed") {
      throw new Error(`Training failed: ${status.error}`);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new Error(`Training timed out after ${timeoutMs}ms (jobId=${jobId})`);
}

/**
 * Mock trainer — simulates a successful run after `mockDurationMs`.
 *
 * Used in tests, smoke scripts, and CinemaOrchestrator integration before
 * the real HF/Higgsfield adapters land. Swapping this for a real trainer
 * is a single-line change at the composition root.
 */
export interface MockSoulTrainerOpts {
  provider?: ImageTrainerProvider;
  mockDurationMs?: number;
  /** If set, fail with this message instead of completing. */
  forceFailure?: string;
}

interface MockJob {
  submittedAt: number;
  finishAt: number;
  req: TrainerTrainRequest;
  failed?: string;
}

export function createMockSoulTrainer(
  opts: MockSoulTrainerOpts = {},
): SoulTrainer {
  const provider = opts.provider ?? "lora";
  const duration = opts.mockDurationMs ?? 20;
  const jobs = new Map<string, MockJob>();

  return {
    provider,

    async submit(req) {
      const jobId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();
      jobs.set(jobId, {
        submittedAt: now,
        finishAt: now + duration,
        req,
        failed: opts.forceFailure,
      });
      return { jobId };
    },

    async poll(jobId) {
      const rec = jobs.get(jobId);
      if (!rec) throw new Error(`Unknown jobId: ${jobId}`);
      const now = Date.now();

      if (now < rec.finishAt) {
        const progress = Math.min(
          1,
          (now - rec.submittedAt) / (rec.finishAt - rec.submittedAt),
        );
        return { state: "running", submittedAt: rec.submittedAt, progress };
      }

      if (rec.failed) {
        return {
          state: "failed",
          submittedAt: rec.submittedAt,
          finishedAt: rec.finishAt,
          error: rec.failed,
        };
      }

      const identity: ElementIdentity = {
        provider,
        modelId: `mock_${provider}_${jobId}`,
        trainingSampleIds: rec.req.references.map((_, i) => `sample_${i}`),
        trained: true,
        consistencyScore: 0.92,
        trainedAt: now,
      };
      return {
        state: "done",
        submittedAt: rec.submittedAt,
        finishedAt: rec.finishAt,
        identity,
      };
    },
  };
}
