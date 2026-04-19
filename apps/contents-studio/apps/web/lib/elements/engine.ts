/**
 * Elements engine composition root — reuses the cinema singleton store +
 * queue and registers a Soul-ID training job handler.
 *
 * Training is a long-running async operation (minutes to hours on real
 * HF LoRA / Dreambooth endpoints), so it routes through the same job
 * queue as shot generation. The in-memory mock trainer completes in ~20ms
 * — just enough to exercise the full pipeline deterministically.
 *
 * When HF LoRA or Higgsfield Soul 2.0 is wired in a later sprint, we swap
 * `createMockSoulTrainer` for `createHuggingFaceLoraTrainer` (already stubbed
 * in elements-core/soul-trainer) at this exact line. Callers don't change.
 */
import "server-only";

import {
  createMockSoulTrainer,
  trainElement,
  type SoulTrainer,
} from "@marionette/elements-core";
import { getCinemaEngine } from "../cinema/engine";

interface ElementsRegistry {
  trainer: SoulTrainer;
}

declare global {
  // eslint-disable-next-line no-var
  var __marionetteElements: ElementsRegistry | undefined;
}

export interface TrainJobInput {
  elementId: string;
}

export interface TrainJobOutput {
  elementId: string;
  modelId: string;
  provider: string;
  consistencyScore?: number;
}

function build(): ElementsRegistry {
  const cinema = getCinemaEngine();
  // Mock trainer for dev/demo — real HF/Higgsfield adapters slot in here
  // without any caller changing. Bump duration so progress bar is visible
  // for the operator (otherwise it finishes before the first poll).
  const trainer = createMockSoulTrainer({
    provider: "lora",
    mockDurationMs: 8_000,
  });

  cinema.queue.register<TrainJobInput, TrainJobOutput>(
    "elements:train-soul",
    async (input, ctx) => {
      ctx.reportProgress(0.05, "submitting training job");
      const updated = await trainElement(cinema.store, trainer, input.elementId, {
        pollIntervalMs: 500,
        onProgress: (status) => {
          if (status.state === "running" && status.progress !== undefined) {
            ctx.reportProgress(
              0.1 + status.progress * 0.85,
              `training (${Math.round(status.progress * 100)}%)`,
            );
          }
        },
      });
      ctx.reportProgress(0.98, "finalizing");
      if (!updated.identity) {
        throw new Error("Training returned no identity");
      }
      return {
        elementId: updated.id,
        modelId: updated.identity.modelId,
        provider: updated.identity.provider,
        consistencyScore: updated.identity.consistencyScore,
      };
    },
  );

  return { trainer };
}

export function getElementsEngine(): ElementsRegistry {
  if (!globalThis.__marionetteElements) {
    globalThis.__marionetteElements = build();
  }
  return globalThis.__marionetteElements;
}
