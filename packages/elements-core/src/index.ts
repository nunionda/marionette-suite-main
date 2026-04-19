/**
 * @marionette/elements-core — Element domain + store + Soul ID trainer.
 *
 * Layer 2.5 (cross-cutting): sits between ai-providers (Layer 1) and the
 * engines (Layer 3). Elements are the single source of truth for
 * "who/what is in this shot" — engines consume references + identity,
 * pipeline-core engines register usage back here.
 */
export * from "./types";
export {
  createInMemoryElementStore,
  defaultElementStore,
  type ElementStore,
} from "./store/index";
export {
  createMockSoulTrainer,
  trainElement,
  type ImageTrainerProvider,
  type MockSoulTrainerOpts,
  type SoulTrainer,
  type TrainElementOptions,
  type TrainerJobStatus,
  type TrainerTrainRequest,
} from "./soul-trainer/index";
export { createHuggingFaceLoraTrainer } from "./soul-trainer/huggingface-lora";
