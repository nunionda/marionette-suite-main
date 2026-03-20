import { ILLMProvider, LLMResponse } from './ILLMProvider';

export class MockProvider implements ILLMProvider {
  name = 'mock';

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    console.log("🛠️ MockProvider: Generating dummy response...");
    
    let content = "{}";

    if (systemPrompt.includes("3-Act")) {
      content = JSON.stringify({
        beats: [
          { act: 1, name: "Inciting Incident", sceneStart: 1, sceneEnd: 5, description: "Sample Start" }
        ]
      });
    } else if (systemPrompt.includes("Emotional Arc") || systemPrompt.includes("valence")) {
      content = JSON.stringify({
        scenes: [
          { sceneNumber: 1, score: 5, dominantEmotion: "Joy", explanation: "Mock joy" }
        ]
      });
    } else if (systemPrompt.includes("market intelligence")) {
      content = JSON.stringify({
        tier: "Hit",
        predictedMultiplier: 3.5,
        confidence: 0.8,
        reasoning: "Mock reasoning"
      });
    } else if (systemPrompt.includes("MPAA")) {
      content = JSON.stringify({
        rating: "PG-13",
        reasons: ["Mock violence"],
        confidence: 0.9
      });
    }

    return {
      provider: 'mock',
      model: 'mock-v1',
      content,
      latencyMs: 100
    };
  }
}
