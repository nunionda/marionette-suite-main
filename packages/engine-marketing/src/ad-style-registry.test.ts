import { describe, expect, it } from "vitest";
import { AD_STYLES, AD_STYLE_LIST } from "./ad-style-registry";

describe("ad style registry", () => {
  it("ships exactly 9 styles", () => {
    expect(AD_STYLE_LIST).toHaveLength(9);
  });

  it("every style indexed by its own id", () => {
    for (const s of AD_STYLE_LIST) {
      expect(AD_STYLES[s.id].id).toBe(s.id);
    }
  });

  it("every style has a non-empty promptFragment (except no-op styles)", () => {
    for (const s of AD_STYLE_LIST) {
      expect(s.promptFragment.length).toBeGreaterThan(0);
    }
  });

  it("durationRangeSec is [min, max] with min <= max", () => {
    for (const s of AD_STYLE_LIST) {
      expect(s.durationRangeSec[0]).toBeLessThanOrEqual(
        s.durationRangeSec[1],
      );
    }
  });
});
