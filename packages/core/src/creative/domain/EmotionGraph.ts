export interface SceneEmotion {
  sceneNumber: number;
  score: number;         // Valance score ranging from -10 (negative/despair) to +10 (positive/joy)
  dominantEmotion: string; // e.g., "Tension", "Relief", "Fear", "Happiness"
  explanation: string;     // Contextual reasoning for the assigned score
}

export interface EmotionGraph {
  scriptId: string;
  scenes: SceneEmotion[];
}
