import { describe, expect, test } from "bun:test";
import { Benchmarker } from "./Benchmarker";

describe("Benchmarker", () => {
  const benchmarker = new Benchmarker();

  test("should find comparable films using cosine similarity from 50+ catalog", () => {
    const mockFeatures: any = {
      scriptId: "test-script",
      metrics: {
        dialogueToActionRatio: 3.5,
        sceneCount: 60,
        characterCount: 12,
        averageWordsPerDialogue: 15,
      },
      analysis: { emotionalVolatility: 5.0 },
    };

    const report = benchmarker.findComps(mockFeatures);

    // Should return top 5 comps from 50+ catalog
    expect(report.topComps.length).toBe(5);
    expect(report.scriptId).toBe("test-script");

    // All scores should be between 0 and 1
    for (const comp of report.topComps) {
      expect(comp.similarityScore).toBeGreaterThan(0);
      expect(comp.similarityScore).toBeLessThanOrEqual(1);
      expect(comp.sharedTraits.length).toBeGreaterThan(0);
      expect(comp.marketPerformance.budget).toBeGreaterThan(0);
    }

    // High dialogue ratio should favor dialogue-heavy films
    const dialogueHeavyFilms = report.topComps.filter((c) =>
      c.sharedTraits.includes("Dialogue Heavy"),
    );
    expect(dialogueHeavyFilms.length).toBeGreaterThan(0);
  });

  test("should boost similarity when tropes overlap", () => {
    const mockFeatures: any = {
      scriptId: "test-trope",
      metrics: {
        dialogueToActionRatio: 1.0,
        sceneCount: 40,
        characterCount: 8,
        averageWordsPerDialogue: 12,
      },
      analysis: { emotionalVolatility: 3.0 },
    };

    const allWithout = benchmarker.findComps(mockFeatures);
    const allWithTropes = benchmarker.findComps(mockFeatures, ["Revenge", "Anti-Hero"]);

    // Verify trope matching produces valid results
    expect(allWithTropes.topComps.length).toBe(5);
    expect(allWithout.topComps.length).toBe(5);

    // Top score with tropes should be >= top score without
    expect(allWithTropes.topComps[0]!.similarityScore).toBeGreaterThanOrEqual(
      allWithout.topComps[0]!.similarityScore,
    );
  });
});
