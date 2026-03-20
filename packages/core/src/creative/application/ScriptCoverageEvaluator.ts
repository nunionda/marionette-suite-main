import { ILLMProvider } from "../infrastructure/llm/ILLMProvider";
import { ScriptCoverage } from "../domain/ScriptCoverage";
import { ScriptElement } from "../../script/infrastructure/parser";
import { Beat } from "../domain/BeatSheet";
import { SceneEmotion } from "../domain/EmotionGraph";
import { CharacterNode } from "../domain/CharacterNetwork";

export interface CoverageInput {
  beats: Beat[];
  emotions: SceneEmotion[];
  characters: CharacterNode[];
  roi: { tier: string; predictedMultiplier: number; confidence: number; reasoning: string };
  rating: { rating: string; reasons: string[]; confidence: number };
  comps: { title: string; similarityScore: number; sharedTraits: string[] }[];
}

export class ScriptCoverageEvaluator {
  constructor(private readonly llm: ILLMProvider) {}

  async evaluate(scriptId: string, elements: ScriptElement[], input: CoverageInput): Promise<ScriptCoverage> {
    let currentScene = 0;
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

    const condensedScript = condensedLines.join('').slice(0, 100000);

    const analysisContext = JSON.stringify({
      beatSheet: input.beats.map(b => ({ act: b.act, name: b.name, description: b.description })),
      emotionSummary: {
        sceneCount: input.emotions.length,
        avgScore: input.emotions.length > 0
          ? (input.emotions.reduce((s, e) => s + e.score, 0) / input.emotions.length).toFixed(1)
          : 0,
        emotionRange: input.emotions.map(e => e.dominantEmotion).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
      },
      characters: input.characters.slice(0, 10).map(c => ({ name: c.name, role: c.role, lines: c.totalLines })),
      roi: { tier: input.roi.tier, multiplier: input.roi.predictedMultiplier },
      rating: { rating: input.rating.rating, reasons: input.rating.reasons },
      comps: input.comps.map(c => c.title),
    });

    const systemPrompt = `You are a senior Hollywood script coverage analyst (Script Reader) writing an official Studio Script Coverage Report.

Evaluate the screenplay across these 5 categories, each scored 0-100:

1. **Plot Structure & Logic** (3 subcategories):
   - Narrative Structure Completeness: How well does it follow classical storytelling frameworks (Three-Act, Hero's Journey)?
   - Pacing & Scene Flow: Are transitions smooth? Is the action/dialogue ratio appropriate for audience engagement?
   - Conflict Intensity: Are internal/external conflicts well-developed and tension-building?

2. **Character & Dialogue** (2 subcategories):
   - Character Arc: Do protagonist and key characters have clear motivations and undergo meaningful growth?
   - Dialogue Quality & Subtext: Is dialogue authentic, character-specific, and rich with subtext (not expository)?

3. **Theme & Tone** (2 subcategories):
   - Theme Clarity: Is the core message clear and organically revealed?
   - Tone Consistency: Is the emotional tone (drama, humor, suspense) consistent throughout?

4. **Market Appeal & Commercial Potential** (3 subcategories):
   - Genre Fit & Trend Alignment: Does it satisfy genre conventions and current audience preferences?
   - Industry Benchmarking: How does it compare to successful comparable films?
   - Rating Appropriateness: Is the content level appropriate for maximizing target audience reach?

5. **Production Feasibility** (1 subcategory):
   - Budget & Resource Viability: Are VFX demands, locations, and production scale realistic and justified?

Use the provided analysis data as reference context (beat sheet structure, emotion graph summary, character network, ROI prediction, content rating, comparable films).

Verdict rules: overallScore >= 80 → "Recommend", >= 60 → "Consider", < 60 → "Pass"

CRITICAL INSTRUCTION: Output ONLY raw JSON matching this schema exactly:
{
  "title": "Inferred title from screenplay",
  "genre": "Primary genre",
  "logline": "One sentence story summary",
  "synopsis": "3-5 sentence plot summary",
  "categories": [
    {
      "name": "Plot Structure & Logic",
      "score": 75,
      "subcategories": [
        { "name": "Narrative Structure Completeness", "score": 80, "assessment": "Brief analysis..." },
        { "name": "Pacing & Scene Flow", "score": 70, "assessment": "Brief analysis..." },
        { "name": "Conflict Intensity", "score": 75, "assessment": "Brief analysis..." }
      ]
    }
  ],
  "overallScore": 72,
  "verdict": "Consider",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "recommendation": "Final analyst recommendation paragraph..."
}`;

    const userPrompt = `<screenplay>
${condensedScript}
</screenplay>

<analysis_context>
${analysisContext}
</analysis_context>`;

    const response = await this.llm.generateText(systemPrompt, userPrompt);
    if (response.error) {
      throw new Error(`LLM Coverage Error: ${response.error}`);
    }

    try {
      const match = response.content.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response.content;
      const parsed = JSON.parse(jsonStr);

      return {
        scriptId,
        title: parsed.title || scriptId,
        genre: parsed.genre || 'Unknown',
        logline: parsed.logline || '',
        synopsis: parsed.synopsis || '',
        categories: parsed.categories || [],
        overallScore: parsed.overallScore || 0,
        verdict: parsed.verdict || 'Pass',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendation: parsed.recommendation || '',
      };
    } catch (e) {
      throw new Error(`Failed to parse Coverage JSON from LLM:\n${response.content}`);
    }
  }
}
