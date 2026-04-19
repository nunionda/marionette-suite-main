import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHealth,
  getHealthMatrix,
  invalidateHealth,
  listAudioProviders,
  listVoiceCloneProviders,
  registerAudioProvider,
  registerVoiceCloneProvider,
  resolveAudioProvider,
  resolveVoiceCloneProvider,
} from "../registry";
import type { AudioProvider } from "../audio/provider";
import type { VoiceCloneProvider } from "../voice-clone/provider";
import { NoHealthyProviderError, type ProviderHealth } from "../types";

function mockAudio(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): AudioProvider {
  return {
    meta: { id, label: id, capability: "audio", tier },
    probe: vi.fn(async () => health),
    generate: vi.fn(async () => ({
      providerId: id,
      audio: { kind: "url" as const, url: `https://mock/${id}.mp3`, mime: "audio/mpeg" },
    })),
  };
}

function mockVoiceClone(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): VoiceCloneProvider {
  return {
    meta: { id, label: id, capability: "voice-clone", tier },
    probe: vi.fn(async () => health),
    submit: vi.fn(async () => ({ jobId: `${id}-train` })),
    poll: vi.fn(async () => ({
      state: "done" as const,
      submittedAt: Date.now() - 100,
      finishedAt: Date.now(),
      voiceId: `voice-${id}`,
    })),
    list: vi.fn(async () => []),
  };
}

describe("audio registry", () => {
  beforeEach(() => {
    invalidateHealth();
    for (const p of listAudioProviders()) {
      registerAudioProvider(mockAudio(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    invalidateHealth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    invalidateHealth();
  });

  it("tier order top > free > local for audio", async () => {
    vi.stubEnv("DEFAULT_AUDIO_PROVIDER", "");
    registerAudioProvider(mockAudio("aud-local", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerAudioProvider(mockAudio("aud-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveAudioProvider();
    expect(picked.meta.id).toBe("aud-top");
    expect(picked.meta.capability).toBe("audio");
  });

  it("respects DEFAULT_AUDIO_PROVIDER env", async () => {
    vi.stubEnv("DEFAULT_AUDIO_PROVIDER", "aud-picked");
    registerAudioProvider(mockAudio("aud-picked", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerAudioProvider(mockAudio("aud-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveAudioProvider();
    expect(picked.meta.id).toBe("aud-picked");
  });

  it("throws NoHealthyProviderError for audio when all down", async () => {
    for (const p of listAudioProviders()) {
      registerAudioProvider(
        mockAudio(p.meta.id, p.meta.tier, { state: "missing-key", requiredEnv: ["NONE"] }),
      );
    }
    invalidateHealth();
    await expect(resolveAudioProvider()).rejects.toBeInstanceOf(NoHealthyProviderError);
  });

  it("getHealthMatrix('audio') returns only audio providers", async () => {
    registerAudioProvider(mockAudio("matrix-aud", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();
    const matrix = await getHealthMatrix("audio");
    for (const e of matrix) expect(e.meta.capability).toBe("audio");
    expect(matrix.map((e) => e.meta.id)).toContain("matrix-aud");
  });
});

describe("voice-clone registry", () => {
  beforeEach(() => {
    invalidateHealth();
    for (const p of listVoiceCloneProviders()) {
      registerVoiceCloneProvider(mockVoiceClone(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    invalidateHealth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    invalidateHealth();
  });

  it("resolves voice-clone provider", async () => {
    registerVoiceCloneProvider(mockVoiceClone("vc-ready", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();
    const picked = await resolveVoiceCloneProvider();
    expect(picked.meta.capability).toBe("voice-clone");
  });

  it("respects DEFAULT_VOICE_CLONE_PROVIDER env", async () => {
    vi.stubEnv("DEFAULT_VOICE_CLONE_PROVIDER", "vc-forced");
    registerVoiceCloneProvider(mockVoiceClone("vc-forced", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerVoiceCloneProvider(mockVoiceClone("vc-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();
    const picked = await resolveVoiceCloneProvider();
    expect(picked.meta.id).toBe("vc-forced");
  });

  it("capability isolation: audio and voice-clone for same id don't collide", async () => {
    registerAudioProvider(mockAudio("dual", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerVoiceCloneProvider(mockVoiceClone("dual", "free", {
      state: "missing-key",
      requiredEnv: ["X"],
    }));

    const a = await getHealth("dual", "audio");
    const v = await getHealth("dual", "voice-clone");
    expect(a.state).toBe("ready");
    expect(v.state).toBe("missing-key");
  });
});
