import { describe, expect, test } from "bun:test";
import { Benchmarker } from "./Benchmarker";

describe("Benchmarker", () => {
  const benchmarker = new Benchmarker();

  test("should find comparable films based on features", () => {
    const mockFeatures: any = {
      scriptId: "test-script",
      metrics: { dialogueToActionRatio: 3.5 }, // Extremely dialogue heavy
      analysis: { emotionalVolatility: 5.0 }
    };

    const report = benchmarker.findComps(mockFeatures);
    
    expect(report.topComps.length).toBeGreaterThan(0);
    // Should favor The Social Network for dialogue high ratio
    expect(report.topComps[0].title).toBe("The Social Network");
  });
});
