import type { ILLMProvider } from "../../creative/infrastructure/llm/ILLMProvider";
import type { ScriptElement } from "../../script/infrastructure/parser";
import type { MarketLocale } from "../../shared/MarketConfig";
import { getMarketConfig } from "../../shared/MarketConfig";
import { TROPE_DICTIONARY } from "../data/filmCatalog";
import { KOREAN_TROPE_DICTIONARY } from "../data/koreanTropeDictionary";

export interface TropeResult {
  scriptId: string;
  tropes: string[];
}

export class TropeAnalyzer {
  constructor(private provider: ILLMProvider) {}

  /**
   * Uses LLM to identify key narrative tropes from the screenplay.
   * Returns a list of matched tropes from the standard dictionary.
   */
  async analyze(scriptId: string, elements: ScriptElement[], market: MarketLocale = 'hollywood'): Promise<TropeResult> {
    // Build a synopsis from the first ~30 scenes of action + dialogue
    const synopsis = this.buildSynopsis(elements);
    const config = getMarketConfig(market);
    const dictionary = market === 'korean' ? KOREAN_TROPE_DICTIONARY : TROPE_DICTIONARY;

    const systemPrompt = `You are ${config.prompts.tropeAnalystRole}.
Given the following screenplay excerpt, identify 5-10 narrative tropes that best describe this story.

ONLY use tropes from this dictionary:
${dictionary.join(", ")}

Respond with a JSON array of strings. Example: ${market === 'korean' ? '["Revenge Drama (복수극)", "Class Divide (계층 갈등)", "Twist Ending (반전)"]' : '["Revenge", "Anti-Hero", "Twist Ending"]'}
Only output the JSON array, nothing else.`;

    const response = await this.provider.generateText(systemPrompt, synopsis);

    try {
      const parsed = JSON.parse(response.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      if (Array.isArray(parsed)) {
        // Filter to only valid dictionary tropes
        const valid = parsed.filter(
          (t: unknown): t is string =>
            typeof t === "string" &&
            dictionary.some((d) => d.toLowerCase() === (t as string).toLowerCase()),
        );
        return { scriptId, tropes: valid.slice(0, 10) };
      }
    } catch {
      // Parse failure → return empty
    }

    return { scriptId, tropes: [] };
  }

  private buildSynopsis(elements: ScriptElement[]): string {
    const lines: string[] = [];
    let sceneCount = 0;

    for (const el of elements) {
      if (el.type === "scene_heading") {
        sceneCount++;
        if (sceneCount > 30) break;
        lines.push(`\n[${el.text}]`);
      } else if (el.type === "action") {
        lines.push(el.text);
      } else if (el.type === "character") {
        lines.push(`${el.text}:`);
      } else if (el.type === "dialogue") {
        lines.push(`  "${el.text}"`);
      }
    }

    return lines.join("\n").slice(0, 4000); // Cap at 4000 chars
  }
}
