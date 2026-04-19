import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHealth,
  getHealthMatrix,
  invalidateHealth,
  listVideoProviders,
  registerVideoProvider,
  resolveVideoProvider,
} from "../registry";
import {
  pollUntilDone,
  type VideoGenerateResult,
  type VideoJobStatus,
  type VideoProvider,
} from "../video/provider";
import { NoHealthyProviderError, type ProviderHealth } from "../types";

function mockVideo(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): VideoProvider {
  const result: VideoGenerateResult = {
    providerId: id,
    videos: [{ kind: "url", url: `https://mock/${id}.mp4`, mime: "video/mp4" }],
  };
  return {
    meta: { id, label: id, capability: "video", tier },
    probe: vi.fn(async () => health),
    submit: vi.fn(async () => ({ jobId: `${id}-job` })),
    poll: vi.fn(
      async (): Promise<VideoJobStatus> => ({
        state: "done",
        submittedAt: Date.now() - 100,
        finishedAt: Date.now(),
        result,
      }),
    ),
    async generateBlocking() {
      return result;
    },
  };
}

describe("video registry", () => {
  beforeEach(() => {
    invalidateHealth();
    for (const p of listVideoProviders()) {
      registerVideoProvider(mockVideo(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    invalidateHealth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    invalidateHealth();
  });

  it("tier order top > free > local for video", async () => {
    vi.stubEnv("DEFAULT_VIDEO_PROVIDER", "");
    registerVideoProvider(mockVideo("vid-local", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerVideoProvider(mockVideo("vid-free", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerVideoProvider(mockVideo("vid-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveVideoProvider();
    expect(picked.meta.id).toBe("vid-top");
    expect(picked.meta.capability).toBe("video");
  });

  it("respects DEFAULT_VIDEO_PROVIDER env", async () => {
    vi.stubEnv("DEFAULT_VIDEO_PROVIDER", "vid-forced");
    registerVideoProvider(mockVideo("vid-forced", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerVideoProvider(mockVideo("vid-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveVideoProvider();
    expect(picked.meta.id).toBe("vid-forced");
  });

  it("throws NoHealthyProviderError for video when all down", async () => {
    for (const p of listVideoProviders()) {
      registerVideoProvider(
        mockVideo(p.meta.id, p.meta.tier, {
          state: "missing-key",
          requiredEnv: ["NONE"],
        }),
      );
    }
    invalidateHealth();
    await expect(resolveVideoProvider()).rejects.toBeInstanceOf(NoHealthyProviderError);
  });

  it("capability isolation: shared id keeps separate health across text/image/video", async () => {
    // Register same id "triple" for video (the other capabilities tested elsewhere).
    registerVideoProvider(mockVideo("triple", "free", {
      state: "unreachable",
      error: "video down",
      lastProbeAt: Date.now(),
    }));

    const vHealth = await getHealth("triple", "video");
    expect(vHealth.state).toBe("unreachable");
  });

  it("getHealthMatrix('video') returns only video providers", async () => {
    registerVideoProvider(mockVideo("matrix-video", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const matrix = await getHealthMatrix("video");
    const ids = matrix.map((e) => e.meta.id);
    expect(ids).toContain("matrix-video");
    for (const e of matrix) expect(e.meta.capability).toBe("video");
  });
});

describe("pollUntilDone helper", () => {
  it("returns immediately when state=done on first poll", async () => {
    const result: VideoGenerateResult = {
      providerId: "immediate",
      videos: [],
    };
    const poll = vi.fn(
      async (): Promise<VideoJobStatus> => ({
        state: "done",
        submittedAt: Date.now() - 10,
        finishedAt: Date.now(),
        result,
      }),
    );
    const out = await pollUntilDone({ poll }, "job-1", { pollIntervalMs: 10 });
    expect(out).toEqual(result);
    expect(poll).toHaveBeenCalledTimes(1);
  });

  it("polls repeatedly until done", async () => {
    let calls = 0;
    const result: VideoGenerateResult = { providerId: "slow", videos: [] };
    const poll = vi.fn(async (): Promise<VideoJobStatus> => {
      calls++;
      if (calls < 3) return { state: "running", submittedAt: Date.now() };
      return {
        state: "done",
        submittedAt: Date.now() - 100,
        finishedAt: Date.now(),
        result,
      };
    });
    const out = await pollUntilDone({ poll }, "job-2", { pollIntervalMs: 5 });
    expect(out).toEqual(result);
    expect(calls).toBe(3);
  });

  it("throws on state=failed", async () => {
    const poll = vi.fn(
      async (): Promise<VideoJobStatus> => ({
        state: "failed",
        submittedAt: Date.now(),
        finishedAt: Date.now(),
        error: "boom",
      }),
    );
    await expect(pollUntilDone({ poll }, "job-3")).rejects.toThrow(/boom/);
  });

  it("throws on timeout", async () => {
    const poll = vi.fn(
      async (): Promise<VideoJobStatus> => ({
        state: "running",
        submittedAt: Date.now(),
      }),
    );
    await expect(
      pollUntilDone({ poll }, "job-4", { pollIntervalMs: 2, timeoutMs: 20 }),
    ).rejects.toThrow(/timed out/);
  });
});
