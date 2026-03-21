import type { ILLMProvider } from "../../creative/infrastructure/llm/ILLMProvider";
import type { MarketLocale } from "../../shared/MarketConfig";
import { getMarketConfig } from "../../shared/MarketConfig";
import type { ScreenplayFeatures } from "../domain/ScreenplayFeatures";
import type { ROITier } from "../domain/PredictionResult";

export class BoxOfficePredictor {
  constructor(private readonly llm: ILLMProvider) {}

  async predictROI(features: ScreenplayFeatures, market: MarketLocale = 'hollywood'): Promise<{ tier: ROITier; predictedMultiplier: number; confidence: number; reasoning: string }> {
    const config = getMarketConfig(market);
    const { tiers } = config.roi;

    const systemPrompt = `You are ${config.prompts.boxOfficeRole}.
Analyze the provided screenplay features (budget, character density, emotional volatility, etc.) and predict its Return on Investment (ROI).

ROI Tiers:
- Flop: Multiplier < ${tiers.flop.max}
- Break-even: ${tiers.breakEven.min} <= Multiplier < ${tiers.breakEven.max}
- Hit: ${tiers.hit.min} <= Multiplier < ${tiers.hit.max}
- Blockbuster: Multiplier >= ${tiers.blockbuster.min}${tiers.blockbuster.admissionsThreshold ? ` (or ${(tiers.blockbuster.admissionsThreshold / 1_000_000).toFixed(0)}M+ admissions)` : ''}

CRITICAL INSTRUCTION: Output ONLY raw JSON matching this schema exactly:
{
  "tier": "Hit",
  "predictedMultiplier": 3.2,
  "confidence": 0.85,
  "reasoning": "Explanation based on provided features..."
}`;

    const userPrompt = `
Screenplay Features:
- Budget: ${features.market?.budget || "Unknown"}
- Scene Count: ${features.metrics.sceneCount}
- Protagonist: ${features.analysis.characterNetwork.characters[0]?.name || "N/A"}
- Emotional Volatility: ${features.analysis.emotionalVolatility.toFixed(2)}
- Dialogue/Action Ratio: ${features.metrics.dialogueToActionRatio.toFixed(2)}
- Top Genres: ${features.market?.genres?.join(", ") || "N/A"}
    `.trim();

    const response = await this.llm.generateText(systemPrompt, userPrompt);
    if (response.error) throw new Error(`LLM Prediction Error: ${response.error}`);

    try {
      const match = response.content.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response.content;
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Failed to parse ROI prediction JSON from LLM: \n${response.content}`);
    }
  }
}
