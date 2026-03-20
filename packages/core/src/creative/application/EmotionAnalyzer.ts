import { ILLMProvider } from "../infrastructure/llm/ILLMProvider";
import { EmotionGraph } from "../domain/EmotionGraph";
import { ScriptElement } from "../../script/infrastructure/parser";

export class EmotionAnalyzer {
  constructor(private readonly llm: ILLMProvider) {}

  /**
   * Evaluates the emotional valance and tension of the script on a scene-by-scene basis.
   * Leverages large context-window models (e.g. Claude 3.5 Sonnet) to ingest the full screenplay.
   */
  async analyze(scriptId: string, elements: ScriptElement[]): Promise<EmotionGraph> {
    let currentScene = 0;
    
    const condensedScript = elements.map(e => {
      if (e.type === "scene_heading") {
        currentScene++;
        return `\n[Scene ${currentScene}]`;
      }
      return `${e.type === 'character' ? '\n' + e.text + ':' : ' ' + e.text}`;
    }).filter(l => l.trim() !== "").join('').slice(0, 150000); // 150k char limit for generic extraction

    const systemPrompt = `You are a cognitive script analyzer determining the "Emotional Arc" of a story.
Read the script and score the emotional valence of EACH SCENE.
Score ranges from -10 (devastation, extreme negative tension) to +10 (joy, triumph, extreme positive).

CRITICAL INSTRUCTION: Output ONLY raw JSON matching this schema exactly:
{
  "scenes": [
    { "sceneNumber": 1, "score": -5, "dominantEmotion": "Fear", "explanation": "Brief reason..." }
  ]
}`;

    const userPrompt = `<script>\n${condensedScript}\n</script>`;
    
    const response = await this.llm.generateText(systemPrompt, userPrompt);
    if (response.error) throw new Error(`LLM Emotion Analysis Error: ${response.error}`);

    try {
      const match = response.content.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response.content;
      const parsed = JSON.parse(jsonStr);
      
      return {
        scriptId,
        scenes: parsed.scenes || []
      };
    } catch (e) {
      throw new Error(`Failed to parse Emotion JSON from LLM: \n${response.content}`);
    }
  }
}
