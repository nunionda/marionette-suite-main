import { ILLMProvider } from "../../creative/infrastructure/llm/ILLMProvider";
import { ScriptElement } from "../../script/infrastructure/parser";

export class ContentRatingClassifier {
  constructor(private readonly llm: ILLMProvider) {}

  async classify(scriptId: string, elements: ScriptElement[]): Promise<{ rating: "G" | "PG" | "PG-13" | "R" | "NC-17"; reasons: string[]; confidence: number }> {
    // Collect a sample of dialogue and action for content analysis
    const samplingText = elements
      .filter(e => e.type === "dialogue" || e.type === "action")
      .slice(0, 500) // Sample first 500 elements to avoid context overflow while getting a good gist
      .map(e => e.text)
      .join("\n");

    const systemPrompt = `You are an MPAA rating specialist.
Analyze the script content (violence, profanity, drug use, sexual themes) and predict the appropriate age rating.

Ratings: G, PG, PG-13, R, NC-17.

CRITICAL INSTRUCTION: Output ONLY raw JSON matching this schema exactly:
{
  "rating": "PG-13",
  "reasons": ["Moderate fantasy violence", "Some suggestive themes"],
  "confidence": 0.90
}`;

    const userPrompt = `<script_sample>\n${samplingText}\n</script_sample>`;

    const response = await this.llm.generateText(systemPrompt, userPrompt);
    if (response.error) throw new Error(`LLM Rating Error: ${response.error}`);

    try {
      const match = response.content.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response.content;
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Failed to parse Rating JSON from LLM: \n${response.content}`);
    }
  }
}
