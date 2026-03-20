import { BoxOfficeData } from "../../market/domain/BoxOfficeData";
import { BeatSheet } from "../../creative/domain/BeatSheet";
import { EmotionGraph } from "../../creative/domain/EmotionGraph";
import { CharacterNetwork } from "../../creative/domain/CharacterNetwork";

export interface ScreenplayFeatures {
  scriptId: string;
  
  // Quantitative Metrics (Deterministic)
  metrics: {
    sceneCount: number;
    characterCount: number;
    dialogueLineCount: number;
    actionLineCount: number;
    dialogueToActionRatio: number; // Ratio of dialogue lines to action lines
    averageWordsPerDialogue: number;
  };

  // Market Context (Phase 1)
  market?: BoxOfficeData;

  // Creative/Cognitive Insights (Phase 2)
  analysis: {
    characterNetwork: CharacterNetwork;
    beatSheet: BeatSheet;
    emotionGraph: EmotionGraph;
    emotionalVolatility: number; // Variance in emotional scores
  };
}
