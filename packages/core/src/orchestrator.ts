import { parseFountain } from './script/infrastructure/parser';
import { LLMFactory } from './creative/infrastructure/llm/LLMFactory';
import { CharacterAnalyzer } from './creative/application/CharacterAnalyzer';
import { BeatSheetGenerator } from './creative/application/BeatSheetGenerator';
import { EmotionAnalyzer } from './creative/application/EmotionAnalyzer';
import * as fs from 'fs';
import * as path from 'path';
import { env } from './shared/env';

async function runOrchestration() {
  console.log("🎬 Starting AI Engine Orchestration...");

  // 1. Load the script
  const scriptPath = path.join(__dirname, '../../../data/fight_club_sample.fountain');
  if (!fs.existsSync(scriptPath)) {
    console.error("❌ Script file not found:", scriptPath);
    process.exit(1);
  }
  const scriptText = fs.readFileSync(scriptPath, 'utf8');
  console.log(`✅ Loaded Script: Fight Club Sample (${scriptText.length} characters)`);

  // 2. Parse into Domain Elements
  const elements = parseFountain(scriptText);
  console.log(`✅ Parsed into ${elements.length} structured Scene Elements.`);

  // 3. Initialize Analyzers
  const factory = new LLMFactory();
  const characterAnalyzer = new CharacterAnalyzer();
  // Using Mock provider if Anthropic key is missing to ensure test runs successfully either way
  let provider;
  try {
    if (env.ANTHROPIC_API_KEY) {
      provider = factory.getProvider('anthropic');
      console.log(`✅ Connected to Real LLM: ${provider.name}`);
    } else {
      console.warn("⚠️ No API Key found in .env, falling back to Mock Provider for logic verification...");
      // A quick mock implementation inline for testing without breaking
      provider = {
        name: 'mock',
        generateText: async () => ({
          provider: 'mock',
          model: 'mock',
          latencyMs: 10,
          content: `{ "beats": [{ "act": 1, "name": "Inciting Incident", "sceneStart": 1, "sceneEnd": 3, "description": "Tyler asks Jack to hit him." }], "scenes": [{ "sceneNumber": 1, "score": -5, "dominantEmotion": "Depression", "explanation": "Support group." }, { "sceneNumber": 2, "score": 8, "dominantEmotion": "Excitement", "explanation": "Fight begins." }] }`
        })
      };
    }
  } catch(e) {
    console.error(e);
    process.exit(1);
  }

  const beatGenerator = new BeatSheetGenerator(provider as any);
  const emotionAnalyzer = new EmotionAnalyzer(provider as any);

  console.log("🚀 Executing NLP Analysis Pipeline...");

  // A. Character Analysis (Deterministic)
  const network = characterAnalyzer.analyze("fight_club", elements);
  console.log(`🎭 Extracted ${network.characters.length} characters. Protagonist: ${network.characters[0]?.name}`);

  // B. Beat Sheet & Emotion Analysis (LLM Dependent)
  console.log("🧠 Processing Cognitive Narrative (Beat Sheet)...");
  const beats = await beatGenerator.generate("fight_club", elements);
  
  console.log("❤️ Processing Emotional Graph...");
  const emotion = await emotionAnalyzer.analyze("fight_club", elements);

  // 4. Consolidate & Output
  const finalOutput = {
    scriptId: "fight_club",
    summary: {
      totalElements: elements.length,
      protagonist: network.characters[0]?.name
    },
    characterNetwork: network.characters,
    beatSheet: beats.beats,
    emotionGraph: emotion.scenes
  };

  const outPath = path.join(__dirname, '../../../output/fight_club_orchestration.json');
  fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2));

  console.log(`\n🎉 Orchestration Complete! Results saved to: ${outPath}`);
  console.log(JSON.stringify(finalOutput, null, 2));
}

runOrchestration().catch(err => {
  console.error("🔥 Orchestration Failed:");
  console.error(err);
});
