import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHealth,
  getHealthMatrix,
  invalidateHealth,
  listTextProviders,
  registerTextProvider,
  resolveTextProvider,
} from "../registry";
import type { TextProvider } from "../text/provider";
import { NoHealthyProviderError, type ProviderHealth } from "../types";

function mockProvider(
  id: string,
  tier: "top" | "free" | "local",
  health: ProviderHealth,
): TextProvider {
  return {
    meta: { id, label: id, capability: "text", tier },
    probe: vi.fn(async () => health),
    generate: vi.fn(async () => ({
      providerId: id,
      text: `hello from ${id}`,
    })),
  };
}

describe("resolveTextProvider fallback chain", () => {
  beforeEach(() => {
    invalidateHealth();
    // Replace auto-registered real providers with mocks for this test file.
    // `registerTextProvider` overwrites by id; using known ids from registry.ts
    // ensures we shadow the built-ins.
    for (const p of listTextProviders()) {
      registerTextProvider(mockProvider(p.meta.id, p.meta.tier, { state: "unknown" }));
    }
    invalidateHealth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    invalidateHealth();
  });

  it("prefers explicit `prefer` argument when healthy", async () => {
    registerTextProvider(mockProvider("mock-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("mock-free", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const provider = await resolveTextProvider("mock-free");
    expect(provider.meta.id).toBe("mock-free");
  });

  it("falls through when preferred provider is unhealthy", async () => {
    registerTextProvider(mockProvider("mock-broken", "top", {
      state: "unreachable",
      error: "econn",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("mock-healthy", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const provider = await resolveTextProvider("mock-broken");
    expect(provider.meta.id).toBe("mock-healthy");
  });

  it("respects DEFAULT_TEXT_PROVIDER env var", async () => {
    vi.stubEnv("DEFAULT_TEXT_PROVIDER", "mock-env-default");
    registerTextProvider(mockProvider("mock-env-default", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("mock-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const provider = await resolveTextProvider();
    expect(provider.meta.id).toBe("mock-env-default");
  });

  it("tier order top > free > local when no explicit prefer", async () => {
    // Remove all defaults that may bias the ordering.
    vi.stubEnv("DEFAULT_TEXT_PROVIDER", "");
    registerTextProvider(mockProvider("tier-local", "local", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("tier-free", "free", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("tier-top", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    invalidateHealth();

    const provider = await resolveTextProvider();
    expect(provider.meta.id).toBe("tier-top");
  });

  it("throws NoHealthyProviderError when everything is down", async () => {
    for (const p of listTextProviders()) {
      registerTextProvider(
        mockProvider(p.meta.id, p.meta.tier, {
          state: "missing-key",
          requiredEnv: ["NONE"],
        }),
      );
    }
    invalidateHealth();
    await expect(resolveTextProvider()).rejects.toBeInstanceOf(NoHealthyProviderError);
  });
});

describe("health caching", () => {
  beforeEach(() => invalidateHealth());

  it("caches probe results within TTL", async () => {
    const probe = vi.fn(async (): Promise<ProviderHealth> => ({
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    const provider: TextProvider = {
      meta: { id: "cache-test", label: "c", capability: "text", tier: "free" },
      probe,
      generate: vi.fn(),
    };
    registerTextProvider(provider);

    await getHealth("cache-test");
    await getHealth("cache-test");
    await getHealth("cache-test");
    expect(probe).toHaveBeenCalledTimes(1);
  });

  it("invalidateHealth forces re-probe", async () => {
    const probe = vi.fn(async (): Promise<ProviderHealth> => ({
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider({
      meta: { id: "invalidate-test", label: "i", capability: "text", tier: "free" },
      probe,
      generate: vi.fn(),
    });

    await getHealth("invalidate-test");
    invalidateHealth("invalidate-test");
    await getHealth("invalidate-test");
    expect(probe).toHaveBeenCalledTimes(2);
  });
});

describe("getHealthMatrix", () => {
  it("returns meta + health for all registered text providers", async () => {
    registerTextProvider(mockProvider("matrix-a", "top", {
      state: "ready",
      lastProbeAt: Date.now(),
    }));
    registerTextProvider(mockProvider("matrix-b", "free", {
      state: "missing-key",
      requiredEnv: ["X"],
    }));
    invalidateHealth();

    const matrix = await getHealthMatrix("text");
    const ids = matrix.map((e) => e.meta.id);
    expect(ids).toContain("matrix-a");
    expect(ids).toContain("matrix-b");

    const a = matrix.find((e) => e.meta.id === "matrix-a")!;
    expect(a.health.state).toBe("ready");
    const b = matrix.find((e) => e.meta.id === "matrix-b")!;
    expect(b.health.state).toBe("missing-key");
  });
});
