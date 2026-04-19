import { describe, expect, it } from "vitest";
import {
  PLATFORM_LIST,
  PLATFORM_SPECS,
  clampDuration,
} from "./platform-publisher";

describe("platform publisher", () => {
  it("ships 9 platforms", () => {
    expect(PLATFORM_LIST).toHaveLength(9);
  });

  it("vertical platforms all use 9:16", () => {
    const vertical = ["instagram-reel", "tiktok", "youtube-shorts", "generic-vertical"] as const;
    for (const id of vertical) {
      expect(PLATFORM_SPECS[id].aspectRatio).toBe("9:16");
    }
  });

  it("horizontal platforms use 16:9", () => {
    const horizontal = ["youtube-16x9", "x-twitter", "linkedin", "generic-horizontal"] as const;
    for (const id of horizontal) {
      expect(PLATFORM_SPECS[id].aspectRatio).toBe("16:9");
    }
  });

  it("clampDuration enforces platform max", () => {
    // YouTube Shorts max 60s.
    expect(clampDuration("youtube-shorts", 120)).toBe(60);
    expect(clampDuration("youtube-shorts", 30)).toBe(30);
  });

  it("recommendedDurationSec never exceeds max", () => {
    for (const spec of PLATFORM_LIST) {
      expect(spec.recommendedDurationSec).toBeLessThanOrEqual(
        spec.maxDurationSec,
      );
    }
  });
});
