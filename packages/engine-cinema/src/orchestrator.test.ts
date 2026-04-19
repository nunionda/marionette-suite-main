import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import type {
  VideoGenerateRequest,
  VideoGenerateResult,
  VideoJobStatus,
  VideoProvider,
} from "@marionette/ai-providers/video";
import type { ProviderMeta } from "@marionette/ai-providers";
import {
  createCinemaOrchestrator,
  type CinemaOrchestrator,
} from "./orchestrator";

/**
 * Fake video provider — captures the submitted request so tests can assert
 * on it. Completes immediately in generateBlocking.
 */
function createFakeProvider(id = "fake-video"): VideoProvider & {
  lastRequest: VideoGenerateRequest | null;
  submitCalls: number;
} {
  const meta: ProviderMeta = {
    id,
    label: "Fake Video",
    capability: "video",
    tier: "free",
  };
  let lastRequest: VideoGenerateRequest | null = null;
  let submitCalls = 0;

  const result: VideoGenerateResult = {
    providerId: id,
    videos: [{ kind: "url", url: "https://fake.test/out.mp4" }],
    seed: 42,
  };

  const provider: VideoProvider & {
    lastRequest: VideoGenerateRequest | null;
    submitCalls: number;
  } = {
    meta,
    lastRequest,
    submitCalls,
    async probe() {
      return { state: "ready", lastProbeAt: Date.now() };
    },
    async submit(req) {
      lastRequest = req;
      submitCalls++;
      provider.lastRequest = req;
      provider.submitCalls = submitCalls;
      return { jobId: `fake-${submitCalls}` };
    },
    async poll(jobId): Promise<VideoJobStatus> {
      return {
        state: "done",
        submittedAt: Date.now(),
        finishedAt: Date.now(),
        result,
      };
    },
    async generateBlocking(req) {
      lastRequest = req;
      submitCalls++;
      provider.lastRequest = req;
      provider.submitCalls = submitCalls;
      return result;
    },
  };
  return provider;
}

describe("CinemaOrchestrator", () => {
  let store: ElementStore;
  let fake: ReturnType<typeof createFakeProvider>;
  let orch: CinemaOrchestrator;

  beforeEach(() => {
    store = createInMemoryElementStore();
    fake = createFakeProvider();
    orch = createCinemaOrchestrator({
      store,
      resolveProvider: async () => fake,
    });
  });

  async function makeJane() {
    return store.create({
      projectId: "proj-28",
      kind: "character",
      name: "Jane",
      references: [
        { kind: "url", url: "j1" },
        { kind: "url", url: "j2" },
      ],
      attributes: {},
      tags: [],
    });
  }

  it("buildRequest composes prompt from camera + motion + ramp", async () => {
    const jane = await makeJane();
    const built = await orch.buildRequest({
      sceneId: "s1",
      shotId: "sh1",
      prompt: "Jane walks down a neon-lit alley",
      elementIds: [jane.id],
      camera: { body: "arri-alexa", focalMm: 50 },
      motionStack: [{ type: "dolly", direction: "in", intensity: 0.8 }],
      speedRamp: "impact",
    });

    expect(built.request.prompt).toContain("Jane walks down a neon-lit alley");
    expect(built.request.prompt).toContain("ARRI Alexa 35");
    expect(built.request.prompt).toContain("50mm lens");
    expect(built.request.prompt).toContain("dolly-in");
    expect(built.request.prompt).toContain("impact");

    expect(built.request.references).toHaveLength(2);
    expect(built.request.camera?.body).toBe("arri-alexa");
    expect(built.request.camera?.focalMm).toBe(50);
    expect(built.request.providerHints?.ramp_curve).toBe("impact");
    expect(built.usedElementIds).toEqual([jane.id]);
    expect(built.nodeId).toBe("cinema:s1:sh1");
  });

  it("derives deterministic seed from elements when not provided", async () => {
    const jane = await makeJane();
    const a = await orch.buildRequest({
      prompt: "shot A",
      elementIds: [jane.id],
    });
    const b = await orch.buildRequest({
      prompt: "shot B",
      elementIds: [jane.id],
    });
    expect(a.request.seed).toBeDefined();
    expect(a.request.seed).toBe(b.request.seed);
  });

  it("honors explicit seed override", async () => {
    const jane = await makeJane();
    const built = await orch.buildRequest({
      prompt: "p",
      elementIds: [jane.id],
      seed: 12345,
    });
    expect(built.request.seed).toBe(12345);
  });

  it("submitShot records usedIn on every element", async () => {
    const jane = await makeJane();
    const result = await orch.submitShot({
      sceneId: "scene-7",
      shotId: "shot-3",
      prompt: "Jane enters",
      elementIds: [jane.id],
    });
    expect(result.jobId).toMatch(/^fake-/);
    expect(result.providerId).toBe("fake-video");

    const updated = await store.get(jane.id);
    expect(updated?.usedIn).toHaveLength(1);
    expect(updated?.usedIn[0]!.nodeId).toBe("cinema:scene-7:shot-3");
    expect(updated?.usedIn[0]!.sceneId).toBe("scene-7");
    expect(updated?.usedIn[0]!.shotId).toBe("shot-3");
  });

  it("generateShot returns provider result + records usage", async () => {
    const jane = await makeJane();
    const { result, providerId } = await orch.generateShot({
      sceneId: "s1",
      shotId: "sh1",
      prompt: "p",
      elementIds: [jane.id],
    });
    expect(result.videos[0]!.kind).toBe("url");
    expect(providerId).toBe("fake-video");
    const updated = await store.get(jane.id);
    expect(updated?.usedIn).toHaveLength(1);
  });

  it("rejects motion stack overflow before hitting provider", async () => {
    await expect(
      orch.buildRequest({
        prompt: "p",
        motionStack: [
          { type: "dolly" },
          { type: "pan" },
          { type: "tilt" },
          { type: "zoom" },
        ],
      }),
    ).rejects.toThrow(/motion stack/i);
    expect(fake.submitCalls).toBe(0);
  });

  it("passes prefer to resolveProvider", async () => {
    const resolve = vi.fn(async () => fake);
    const o = createCinemaOrchestrator({ store, resolveProvider: resolve });
    await o.buildRequest({ prompt: "p", preferProvider: "kling-3.0" });
    expect(resolve).toHaveBeenCalledWith("kling-3.0");
  });

  it("forwards soulModelIds from trained elements to providerHints", async () => {
    const jane = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j" }],
      identity: {
        provider: "soul-2.0",
        modelId: "soul_jane_42",
        trainingSampleIds: [],
        trained: true,
      },
      attributes: {},
      tags: [],
    });
    const built = await orch.buildRequest({
      prompt: "p",
      elementIds: [jane.id],
    });
    expect(built.request.providerHints?.soulModelIds).toEqual([
      "soul_jane_42",
    ]);
    expect(built.request.prompt).toContain("soul_jane_42");
    expect(built.soulModelIds).toEqual(["soul_jane_42"]);
  });

  it("defaults nodeId when scene/shot omitted", async () => {
    const built = await orch.buildRequest({ prompt: "p" });
    expect(built.nodeId).toBe("cinema:scene?:shot?");
  });

  it("accepts aspectRatio at the shot level", async () => {
    const built = await orch.buildRequest({
      prompt: "p",
      aspectRatio: "21:9",
    });
    expect(built.request.camera?.aspectRatio).toBe("21:9");
  });
});
