export type ROITier = "Flop" | "Break-even" | "Hit" | "Blockbuster";

export interface PredictionResult {
  scriptId: string;
  roi: {
    tier: ROITier;
    predictedMultiplier: number; // Revenue / Budget
    confidence: number; // 0 to 1
    reasoning: string;
  };
  mpaaRating: {
    rating: "G" | "PG" | "PG-13" | "R" | "NC-17";
    reasons: string[];
    confidence: number;
  };
}
