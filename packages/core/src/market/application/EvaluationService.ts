import type { BoxOfficeData } from "../domain/BoxOfficeData";

export interface EvaluationResult {
  roiPercentage: number;
  netProfit: number;
  isHit: boolean;
  message: string;
}

export class EvaluationService {
  /**
   * Calculates Return on Investment (ROI) and classifies the financial success.
   * Uses the standard Hollywood heuristic: A movie needs to make roughly 2.5x its production 
   * budget at the global box office to break even (accounting for P&A and theater cuts).
   */
  public evaluateROI(data: BoxOfficeData): EvaluationResult {
    if (data.budget <= 0) {
      throw new Error(`Cannot evaluate ROI: Invalid/zero budget for movie "${data.title}"`);
    }

    const netProfit = data.revenue - data.budget;
    const roiPercentage = (netProfit / data.budget) * 100;
    
    // Hollywood Break-Even Rule of Thumb
    const breakEvenPoint = data.budget * 2.5;
    const isHit = data.revenue >= breakEvenPoint;

    let message = "Flop (Failed to reach 2.5x break-even multiplier)";
    if (isHit) {
      message = data.revenue >= data.budget * 5 ? "Blockbuster (5x+ return)" : "Hit (Profitable)";
    } else if (data.revenue >= data.budget) {
      message = "Underperformed (Made production budget back, but lost on marketing)";
    }

    return {
      roiPercentage,
      netProfit,
      isHit,
      message
    };
  }
}
