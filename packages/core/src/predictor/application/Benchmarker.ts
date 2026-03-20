import { ScreenplayFeatures } from "../domain/ScreenplayFeatures";
import { SimilarityReport, CompFilm } from "../domain/SimilarityReport";

export class Benchmarker {
  /**
   * Identifies comparable films based on high-level screenplay features.
   * In a production environment, this would query a Vector Database (Pinecone).
   * For Phase 3, we implement the matching logic against a curated mock catalog.
   */
  public findComps(features: ScreenplayFeatures): SimilarityReport {
    // Curated mock catalog of successful films for benchmarking
    const catalog: CompFilm[] = [
      {
        title: "Inception",
        similarityScore: 0,
        sharedTraits: ["High Emotional Volatility", "Multi-layered structure"],
        marketPerformance: { budget: 160000000, revenue: 836800000, roi: 5.23 }
      },
      {
        title: "The Social Network",
        similarityScore: 0,
        sharedTraits: ["Dialogue Heavy", "Rapid Pacing"],
        marketPerformance: { budget: 40000000, revenue: 224900000, roi: 5.62 }
      },
      {
        title: "Mad Max: Fury Road",
        similarityScore: 0,
        sharedTraits: ["Action Heavy", "Visual Narrative"],
        marketPerformance: { budget: 150000000, revenue: 375200000, roi: 2.50 }
      }
    ];

    // Simple heuristic matching logic
    const comps = catalog.map(film => {
      let score = 0;
      
      // Feature 1: Dialogue/Action Ratio
      if (film.title === "The Social Network" && features.metrics.dialogueToActionRatio > 2.0) score += 0.4;
      if (film.title === "Mad Max: Fury Road" && features.metrics.dialogueToActionRatio < 0.5) score += 0.4;
      
      // Feature 2: Emotional Volatility
      if (film.title === "Inception" && features.analysis.emotionalVolatility > 4.0) score += 0.3;
      
      // Feature 3: Budget tier
      if (features.market && Math.abs(features.market.budget - film.marketPerformance.budget) < 50000000) score += 0.2;

      return { ...film, similarityScore: Math.min(score + Math.random() * 0.1, 0.99) };
    });

    return {
      scriptId: features.scriptId,
      topComps: comps.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 2)
    };
  }
}
