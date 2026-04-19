import { describe, expect, it, beforeEach } from "vitest";
import type {
  CinemaOrchestrator,
  ShotRequest,
} from "@marionette/engine-cinema";
import type { VideoGenerateResult } from "@marionette/ai-providers/video";
import {
  composeMarketingPrompt,
  createMarketingOrchestrator,
  type MarketingBriefRequest,
} from "./orchestrator";
import type { ProductBrief } from "./product-extractor";

function product(): ProductBrief {
  return {
    name: "Nike Pegasus 41",
    description: "A responsive daily trainer.",
    imageUrls: [],
    attributes: { brand: "Nike", color: "Black" },
    warnings: [],
  };
}

/**
 * Stub cinema orchestrator that records the shots it received and returns
 * a fake VideoGenerateResult. Lets us assert on the derived ShotRequest
 * without spinning up the real cinema machinery.
 */
function stubCinema(): CinemaOrchestrator & { seen: ShotRequest[] } {
  const seen: ShotRequest[] = [];
  const result: VideoGenerateResult = {
    providerId: "stub",
    videos: [{ kind: "url", url: "https://stub.test/v.mp4" }],
    seed: 1,
  };
  const c: CinemaOrchestrator & { seen: ShotRequest[] } = {
    seen,
    async buildRequest(shot) {
      seen.push(shot);
      return {
        request: { prompt: shot.prompt },
        usedElementIds: [],
        soulModelIds: [],
        providerId: "stub",
        nodeId: shot.nodeId ?? "stub",
      };
    },
    async submitShot(shot) {
      seen.push(shot);
      return { jobId: `job-${seen.length}`, providerId: "stub", nodeId: shot.nodeId ?? "stub" };
    },
    async generateShot(shot) {
      seen.push(shot);
      return { result, providerId: "stub", nodeId: shot.nodeId ?? "stub" };
    },
  };
  return c;
}

describe("composeMarketingPrompt", () => {
  it("joins name + description + style fragment + attrs + extra", () => {
    const p = composeMarketingPrompt(
      product(),
      "ugc",
      "campaign tagline: run wild",
    );
    expect(p).toContain("Nike Pegasus 41");
    expect(p).toContain("responsive daily trainer");
    expect(p).toContain("user-generated-content"); // from ugc promptFragment
    expect(p).toContain("brand: Nike");
    expect(p).toContain("run wild");
  });
});

describe("MarketingOrchestrator", () => {
  let cinema: ReturnType<typeof stubCinema>;

  beforeEach(() => {
    cinema = stubCinema();
  });

  it("plan() returns 1 shot by default", () => {
    const orch = createMarketingOrchestrator(cinema);
    const shots = orch.plan({
      product: product(),
      style: "ugc",
      platform: "instagram-reel",
    });
    expect(shots).toHaveLength(1);
  });

  it("plan() supports up to 4 variants", () => {
    const orch = createMarketingOrchestrator(cinema);
    const shots = orch.plan({
      product: product(),
      style: "ugc",
      platform: "tiktok",
      variants: 4,
    });
    expect(shots).toHaveLength(4);
    // nodeIds disambiguate v1..v4
    for (let i = 0; i < 4; i++) {
      expect(shots[i]!.nodeId).toContain(`:v${i + 1}`);
    }
  });

  it("plan() clamps variants to [1..4]", () => {
    const orch = createMarketingOrchestrator(cinema);
    expect(
      orch.plan({
        product: product(),
        style: "ugc",
        platform: "tiktok",
        variants: 10,
      }),
    ).toHaveLength(4);
    expect(
      orch.plan({
        product: product(),
        style: "ugc",
        platform: "tiktok",
        variants: 0,
      }),
    ).toHaveLength(1);
  });

  it("plan() applies platform aspect + fps + recommended duration", () => {
    const orch = createMarketingOrchestrator(cinema);
    const [shot] = orch.plan({
      product: product(),
      style: "ugc",
      platform: "youtube-shorts",
    });
    expect(shot!.aspectRatio).toBe("9:16");
    expect(shot!.fps).toBe(30);
    expect(shot!.durationSec).toBe(30); // YT Shorts recommended
  });

  it("plan() clamps durationSec to platform max", () => {
    const orch = createMarketingOrchestrator(cinema);
    const [shot] = orch.plan({
      product: product(),
      style: "cinematic-spot",
      platform: "youtube-shorts",
      durationSec: 300,
    });
    expect(shot!.durationSec).toBe(60); // YT Shorts max
  });

  it("plan() inherits style defaults (camera body, motion, ramp)", () => {
    const orch = createMarketingOrchestrator(cinema);
    const [shot] = orch.plan({
      product: product(),
      style: "cinematic-spot",
      platform: "youtube-16x9",
    });
    expect(shot!.camera?.body).toBe("arri-alexa");
    expect(shot!.motionStack?.[0]?.type).toBe("crane");
    expect(shot!.speedRamp).toBe("impact");
  });

  it("plan() stitches avatar + extra element ids", () => {
    const orch = createMarketingOrchestrator(cinema);
    const [shot] = orch.plan({
      product: product(),
      avatarElementId: "el_avatar_1",
      extraElementIds: ["el_prop_1", "el_prop_2"],
      style: "lifestyle",
      platform: "instagram-reel",
    });
    expect(shot!.elementIds).toEqual([
      "el_avatar_1",
      "el_prop_1",
      "el_prop_2",
    ]);
  });

  it("variants get differentiated seeds when an explicit seed is given", () => {
    const orch = createMarketingOrchestrator(cinema);
    const shots = orch.plan({
      product: product(),
      style: "ugc",
      platform: "tiktok",
      variants: 3,
      seed: 100,
    });
    expect(shots.map((s) => s.seed)).toEqual([100, 100 + 7919, 100 + 7919 * 2]);
  });

  it("generateCampaign runs each shot and returns per-variant results", async () => {
    const orch = createMarketingOrchestrator(cinema);
    const req: MarketingBriefRequest = {
      product: product(),
      style: "ugc",
      platform: "tiktok",
      variants: 2,
    };
    const out = await orch.generateCampaign(req);
    expect(out).toHaveLength(2);
    expect(cinema.seen).toHaveLength(2);
    expect(out[0]!.variantIndex).toBe(0);
    expect(out[1]!.variantIndex).toBe(1);
    expect(out[0]!.platform).toBe("tiktok");
  });

  it("forwards preferProvider to every shot", () => {
    const orch = createMarketingOrchestrator(cinema);
    const shots = orch.plan({
      product: product(),
      style: "ugc",
      platform: "tiktok",
      variants: 3,
      preferProvider: "kling-3.0",
    });
    for (const s of shots) expect(s.preferProvider).toBe("kling-3.0");
  });

  it("sets native audio with music for marketing output", () => {
    const orch = createMarketingOrchestrator(cinema);
    const [shot] = orch.plan({
      product: product(),
      style: "cinematic-spot",
      platform: "youtube-16x9",
    });
    expect(shot!.audio?.native).toBe(true);
    expect(shot!.audio?.include).toContain("music");
  });
});
