import { BoxOfficePredictor } from './BoxOfficePredictor.js';
import type { PredictionResult } from '../domain/PredictionResult.js';

export type RiskLevel = "STABLE" | "CAUTION" | "CRITICAL" | "HALTED";

export interface RiskAuditResult {
  reportId: string;
  divergenceIndex: number; // 0 (Aligned) to 1 (Extreme Divergence)
  commercialScore: number; // 0 to 100
  budgetRisk: number;     // 0 to 1 probability of overrun
  kellyAllocation: {
    vfx: number;
    cast: number;
    marketing: number;
    contingency: number;
  };
  status: RiskLevel;
  findings: string[];
}

/**
 * RiskAuditor
 * Industrial-grade risk assessment engine for cinematic projects.
 * Maps Quant trading philosophies (Kelly Fraction, Stop-loss) to Creative Assets.
 */
export class RiskAuditor {
  constructor(private predictor: BoxOfficePredictor) {}

  /**
   * Performs a comprehensive risk audit on a project's analysis data.
   */
  async audit(prediction: PredictionResult, screenplayFeatures: any): Promise<RiskAuditResult> {
    const commercialScore = this.calculateCommercialScore(prediction);
    const divergenceIndex = this.calculateDivergence(screenplayFeatures);
    const budgetRisk = this.estimateBudgetRisk(screenplayFeatures, prediction);
    
    // Apply Kelly Fraction logic for resource allocation
    const kellyAllocation = this.calculateKellyAllocation(prediction.roi.predictedMultiplier);

    const status = this.determineRiskStatus(divergenceIndex, commercialScore, budgetRisk);

    return {
      reportId: prediction.scriptId,
      divergenceIndex,
      commercialScore,
      budgetRisk,
      kellyAllocation,
      status,
      findings: this.generateFindings(divergenceIndex, commercialScore, budgetRisk)
    };
  }

  private calculateCommercialScore(p: PredictionResult): number {
    // Convert ROI tier and multiplier to a 0-100 score
    const baseScores = { "Flop": 10, "Break-even": 40, "Hit": 75, "Blockbuster": 95 };
    const score = baseScores[p.roi.tier as keyof typeof baseScores] || 0;
    return score * 0.8 + (p.roi.confidence * 20);
  }

  private calculateDivergence(features: any): number {
    // Placeholder for semantic comparison logic
    // In a real scenario, this would compare against DECODE_World_Bible.md
    return (features?.tropeDensity || 0) > 0.7 ? 0.6 : 0.2;
  }

  private estimateBudgetRisk(features: any, p: PredictionResult): number {
    // High scene count + low ROI prediction = High Budget Risk
    if ((features?.sceneCount || 0) > 150 && p.roi.tier === "Flop") return 0.85;
    return 0.3;
  }

  private calculateKellyAllocation(multiplier: number) {
    // Simplified Kelly: (bp - q) / b
    // where b is the odds (multiplier - 1), p is probability, q is 1-p
    const p = 0.6; // Average historical success probability
    const b = Math.max(multiplier - 1, 0.1);
    const q = 1 - p;
    const f = Math.max((p * b - q) / b, 0.05); // Kelly fraction
    
    // Allocate based on the fraction and project type
    return {
      vfx: 0.4 * (1 + f),
      cast: 0.3 * (1 - f/2),
      marketing: 0.2 * (1 - f/2),
      contingency: 0.1
    };
  }

  private determineRiskStatus(div: number, comm: number, budget: number): RiskLevel {
    if (div > 0.8 || budget > 0.9) return "HALTED";
    if (div > 0.5 || comm < 30) return "CRITICAL";
    if (div > 0.3 || budget > 0.5) return "CAUTION";
    return "STABLE";
  }

  private generateFindings(div: number, comm: number, budget: number): string[] {
    const findings: string[] = [];
    if (div > 0.5) findings.push("High Creative Divergence detected: Blueprint integrity compromised.");
    if (comm < 40) findings.push("Low Commercial Score: High risk of financial underperformance.");
    if (budget > 0.7) findings.push("Budget Overrun Risk: Production scale exceeds predicted returns.");
    return findings;
  }
}
