import { ILLMProvider } from "../infrastructure/llm/ILLMProvider";
import { BeatSheet } from "../domain/BeatSheet";
import { ScriptElement } from "../../script/infrastructure/parser";

export class BeatSheetGenerator {
  constructor(private readonly llm: ILLMProvider) {}

  /**
   * Translates an array of raw script elements into a structurally dense text blocks 
   * and invokes the LLM to output a precise 3-Act Structure Beat Sheet JSON.
   */
  async generate(scriptId: string, elements: ScriptElement[]): Promise<BeatSheet> {
    let currentScene = 0;
    
    // Condense script to preserve token space while maintaining context
    const condensedLines = elements.map(e => {
      if (e.type === "scene_heading") {
        currentScene++;
        return `\n[Scene ${currentScene}] ${e.text}`;
      }
      if (e.type === "character" || e.type === "dialogue" || e.type === "action") {
        return e.type === 'character' ? `\n${e.text}:` : ` ${e.text}`;
      }
      return "";
    }).filter(line => line.trim() !== "");

    // Safety truncate to prevent LLM context overflow bounds (basic chunking)
    const condensedScript = condensedLines.join('').slice(0, 100000);

    const systemPrompt = `You are an expert Hollywood script consultant structurally evaluating a screenplay.
Analyze the provided screenplay text and extract its narrative structure as a traditional 3-Act Beat Sheet.
Identify major turning points (e.g., "Inciting Incident", "Plot Point 1", "Midpoint", "Climax", "Resolution").

CRITICAL INSTRUCTION: You MUST output ONLY raw, valid JSON matching the exact schema below without any markdown fences or extra conversational text.
{
  "beats": [
    {
      "act": 1,
      "name": "Inciting Incident",
      "sceneStart": 1,
      "sceneEnd": 3,
      "description": "Explanation of how this beat triggers the plot."
    }
  ]
}`;

    const userPrompt = `<screenplay>\n${condensedScript}\n</screenplay>`;

    // Execute standard LLM generation
    const response = await this.llm.generateText(systemPrompt, userPrompt);
    
    if (response.error) {
      throw new Error(`LLM Strategy Error: ${response.error}`);
    }

    try {
      // Regex extraction pattern to natively strip out markdown JSON block quotes 
      // if the LLM disobeys the prompt.
      const match = response.content.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response.content;
      const parsed = JSON.parse(jsonStr);
      
      return {
        scriptId,
        beats: parsed.beats || []
      };
    } catch (e) {
      throw new Error(`Failed to parse structured JSON from LLM: \n${response.content}`);
    }
  }
}
