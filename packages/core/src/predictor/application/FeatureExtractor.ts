import { ScriptElement } from "../../script/infrastructure/parser";
import { ScreenplayFeatures } from "../domain/ScreenplayFeatures";
import { BoxOfficeData } from "../../market/domain/BoxOfficeData";
import { CharacterNetwork } from "../../creative/domain/CharacterNetwork";
import { BeatSheet } from "../../creative/domain/BeatSheet";
import { EmotionGraph } from "../../creative/domain/EmotionGraph";

export class FeatureExtractor {
  public extract(
    scriptId: string,
    elements: ScriptElement[],
    analysis: {
      characterNetwork: CharacterNetwork;
      beatSheet: BeatSheet;
      emotionGraph: EmotionGraph;
    },
    market?: BoxOfficeData
  ): ScreenplayFeatures {
    const sceneCount = elements.filter(e => e.type === "scene_heading").length;
    const dialogueLines = elements.filter(e => e.type === "dialogue");
    const actionLines = elements.filter(e => e.type === "action");
    
    const dialogueLineCount = dialogueLines.length;
    const actionLineCount = actionLines.length;
    const dialogueToActionRatio = actionLineCount > 0 ? dialogueLineCount / actionLineCount : dialogueLineCount;

    const totalDialogueWords = dialogueLines.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0);
    const averageWordsPerDialogue = dialogueLineCount > 0 ? totalDialogueWords / dialogueLineCount : 0;

    // Calculate emotional volatility (standard deviation/variance of emotional scores)
    const scores = analysis.emotionGraph.scenes.map(s => s.score);
    const emotionalVolatility = this.calculateVolatility(scores);

    return {
      scriptId,
      metrics: {
        sceneCount,
        characterCount: analysis.characterNetwork.characters.length,
        dialogueLineCount,
        actionLineCount,
        dialogueToActionRatio,
        averageWordsPerDialogue
      },
      market,
      analysis: {
        ...analysis,
        emotionalVolatility
      }
    };
  }

  private calculateVolatility(scores: number[]): number {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }
}
