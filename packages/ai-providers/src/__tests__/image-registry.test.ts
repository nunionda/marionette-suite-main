import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHealth,
  getHealthMatrix,
  invalidateHealth,
  listImageProviders,
  listTextProviders,
  registerImageProvider,
  registerTextProvider,
  resolveImageProvider,
  resolveTextProvider,
} from "../registry";
import type { ImageProvider } from "../image/provider";
import type { TextProvider } from "../text/provider";
import { NoHealthyProviderError, type ProviderHealth } from "../types";

function mockImage(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): ImageProvider {
  return {
    meta: { id, label: id, capability: "image", tier },
    probe: vi.fn(async () => health),
    generate: vi.fn(async () => ({
      providerId: id,
      images: [{ kind: "url", url: `https://mock/${id}.png` } as const],
    })),
  };
}

function mockText(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): TextProvider {
  return {
    meta: { id, label: id, capability: "text", tier },
    probe: vi.fn(async () => health),
    generate: vi.fn(async () => ({ providerId: id, text: `from ${id}` })),
  };
}

describe("image registry", () => {
  beforeEach(() => {
    invalidateHealth();
    // shadow built-ins with unknown-health mocks so tier ordering is deterministic
    for (const p of listImageProviders()) {
      registerImageProvider(mockImage(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    for (const p of listTextProviders()) {
      registerTextProvider(mockText(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    invalidateHealth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    invalidateHealth();
  });

  it("resolves image provider with tier order top > free > local", async () => {
    vi.stubEnv("DEFAULT_IMAGE_PROVIDER", "");
    registerImageProvider(mockImage("img-local", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerImageProvider(mockImage("img-free", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerImageProvider(mockImage("img-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveImageProvider();
    expect(picked.meta.id).toBe("img-top");
    expect(picked.meta.capability).toBe("image");
  });

  it("respects DEFAULT_IMAGE_PROVIDER env (distinct from text default)", async () => {
    vi.stubEnv("DEFAULT_IMAGE_PROVIDER", "img-special");
    vi.stubEnv("DEFAULT_TEXT_PROVIDER", "text-special");
    registerImageProvider(mockImage("img-special", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerImageProvider(mockImage("img-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const picked = await resolveImageProvider();
    expect(picked.meta.id).toBe("img-special");
  });

  it("throws NoHealthyProviderError for image when all down", async () => {
    for (const p of listImageProviders()) {
      registerImageProvider(
        mockImage(p.meta.id, p.meta.tier, {
          state: "missing-key",
          requiredEnv: ["NONE"],
        }),
      );
    }
    invalidateHealth();
    await expect(resolveImageProvider()).rejects.toBeInstanceOf(NoHealthyProviderError);
  });
});

describe("capability isolation", () => {
  /**
   * Regression guard: registering a provider with id "shared" for BOTH text and
   * image must not cause the health cache to overwrite across capabilities.
   * The cacheKey uses `{capability}::{id}` to guarantee isolation.
   */
  beforeEach(() => invalidateHealth());

  it("same provider id across capabilities keeps separate health", async () => {
    const textHealth: ProviderHealth = {
      state: "ready",
      lastProbeAt: Date.now(),
    };
    const imageHealth: ProviderHealth = {
      state: "unreachable",
      error: "image endpoint down",
      lastProbeAt: Date.now(),
    };
    registerTextProvider(mockText("shared", "free", textHealth));
    registerImageProvider(mockImage("shared", "free", imageHealth));

    const t = await getHealth("shared", "text");
    const i = await getHealth("shared", "image");

    expect(t.state).toBe("ready");
    expect(i.state).toBe("unreachable");
  });

  it("getHealthMatrix dispatches per capability", async () => {
    registerTextProvider(mockText("dispatch-t", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerImageProvider(mockImage("dispatch-i", "top", {
      state: "missing-key",
      requiredEnv: ["X"],
    }));
    invalidateHealth();

    const textMatrix = await getHealthMatrix("text");
    const imageMatrix = await getHealthMatrix("image");

    const textIds = textMatrix.map((e) => e.meta.id);
    const imageIds = imageMatrix.map((e) => e.meta.id);
    expect(textIds).toContain("dispatch-t");
    expect(textIds).not.toContain("dispatch-i");
    expect(imageIds).toContain("dispatch-i");
    expect(imageIds).not.toContain("dispatch-t");
  });

  it("invalidateHealth without capability purges from all namespaces", async () => {
    const probeT = vi.fn(async (): Promise<ProviderHealth> => ({
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    const probeI = vi.fn(async (): Promise<ProviderHealth> => ({
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider({
      meta: { id: "purge", label: "p", capability: "text", tier: "free" },
      probe: probeT,
      generate: vi.fn(),
    });
    registerImageProvider({
      meta: { id: "purge", label: "p", capability: "image", tier: "free" },
      probe: probeI,
      generate: vi.fn(),
    });

    await getHealth("purge", "text");
    await getHealth("purge", "image");
    expect(probeT).toHaveBeenCalledTimes(1);
    expect(probeI).toHaveBeenCalledTimes(1);

    invalidateHealth("purge"); // no capability = purge all namespaces

    await getHealth("purge", "text");
    await getHealth("purge", "image");
    expect(probeT).toHaveBeenCalledTimes(2);
    expect(probeI).toHaveBeenCalledTimes(2);
  });

  it("text and image resolvers don't return each other", async () => {
    vi.stubEnv("DEFAULT_TEXT_PROVIDER", "");
    vi.stubEnv("DEFAULT_IMAGE_PROVIDER", "");
    registerTextProvider(mockText("only-text", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerImageProvider(mockImage("only-image", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const text = await resolveTextProvider();
    const image = await resolveImageProvider();

    expect(text.meta.capability).toBe("text");
    expect(image.meta.capability).toBe("image");
    expect(text.meta.id).not.toBe(image.meta.id);
  });
});
