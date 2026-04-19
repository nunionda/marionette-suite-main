/**
 * HuggingFace LoRA trainer — stub adapter.
 *
 * **This is a placeholder.** Real LoRA training requires either a dedicated
 * HF Space (e.g. `autotrain-advanced`) or an Inference Endpoint with a
 * training container. Both cost money and take 5–30 minutes per run.
 *
 * We lay down the wire-format + auth here so Sprint 13+ engines can
 * consume the interface immediately with the mock trainer, and a future
 * sprint swaps in the real HF roundtrip by only editing `submit()` and
 * `poll()`. The interface contract never changes.
 *
 * Env: HF_TOKEN (shared with ai-providers/image/flux-hf).
 * Reference: https://huggingface.co/docs/autotrain/tasks/dreambooth
 */
import type {
  SoulTrainer,
  TrainerJobStatus,
  TrainerTrainRequest,
} from "./index";

export interface HfLoraOptions {
  /** HF Space or Inference Endpoint URL to POST the training job to. */
  endpoint?: string;
  /** Base model to fine-tune on (e.g. "stabilityai/stable-diffusion-xl-base-1.0"). */
  baseModel?: string;
}

export function createHuggingFaceLoraTrainer(
  opts: HfLoraOptions = {},
): SoulTrainer {
  const endpoint =
    opts.endpoint ?? process.env.HF_LORA_TRAINING_ENDPOINT ?? "";
  const baseModel =
    opts.baseModel ??
    process.env.HF_LORA_BASE_MODEL ??
    "stabilityai/stable-diffusion-xl-base-1.0";

  return {
    provider: "lora",

    async submit(_req: TrainerTrainRequest): Promise<{ jobId: string }> {
      const token = process.env.HF_TOKEN;
      if (!token) throw new Error("HF_TOKEN not set");
      if (!endpoint)
        throw new Error(
          "HF_LORA_TRAINING_ENDPOINT not set — configure a Space or Inference Endpoint.",
        );

      // Real impl sketch:
      //   const form = new FormData();
      //   form.append("base_model", baseModel);
      //   form.append("instance_prompt", `photo of ${req.element.name}`);
      //   for (const ref of req.references) form.append("images", imageToBlob(ref));
      //   const res = await fetch(endpoint, {
      //     method: "POST",
      //     headers: { Authorization: `Bearer ${token}` },
      //     body: form,
      //   });
      //   const { job_id } = await res.json();
      //   return { jobId: job_id };
      void baseModel;
      throw new Error(
        "HuggingFace LoRA trainer is a stub — wire up in a future sprint. " +
          "Use createMockSoulTrainer() for now.",
      );
    },

    async poll(_jobId: string): Promise<TrainerJobStatus> {
      // Real impl: GET `${endpoint}/jobs/${jobId}` → map status → TrainerJobStatus.
      throw new Error("HuggingFace LoRA trainer is a stub.");
    },
  };
}
