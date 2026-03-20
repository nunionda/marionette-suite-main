import { ILLMProvider } from "../../creative/infrastructure/llm/ILLMProvider";
import { ScreenplayFeatures } from "../domain/ScreenplayFeatures";
import { ROITier } from "../domain/PredictionResult";

export class BoxOfficePredictor {
  constructor(private readonly llm: ILLMProvider) {}

  async predictROI(features: ScreenplayFeatures): Promise<{ tier: ROITier; predictedMultiplier: number; confidence: number; reasoning: string }> {
    const systemPrompt = `You are a Hollywood market intelligence AI. 
Analyze the provided screenplay features (budget, character density, emotional volatility, etc.) and predict its Return on Investment (ROI).

ROI Tiers:
- Flop: Multiplier < 1.0
- Break-even: 1.0 <= Multiplier < 2.5
- Hit: 2.5 <= Multiplier < 5.0
- Blockbuster: Multiplier >= 5.0

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
