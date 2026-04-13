/**
 * Analysis Engine — extracts structured data from screenplay text.
 *
 * Implements the script_analysis and production_breakdown nodes
 * from the Production Design pipeline.
 *
 * Uses sceneCutParser (already proven with Beat Savior) as the base parser,
 * then extracts additional structured data for pipeline nodes.
 */

interface SceneData {
  number: number;
  slug: string;
  heading: string;
  setting: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  cutCount: number;
  summary: string;
}

interface AnalysisResult {
  scenes: SceneData[];
  characters: CharacterProfile[];
  locations: LocationProfile[];
  stats: {
    totalScenes: number;
    totalCuts: number;
    totalCharacters: number;
    estimatedMinutes: number;
    actBreakdown: { act1: number; act2: number; act3: number };
  };
}

interface CharacterProfile {
  name: string;
  sceneCount: number;
  firstAppearance: number;
  lastAppearance: number;
  sceneNumbers: number[];
  dialogueCount: number;
  type: 'lead' | 'supporting' | 'minor';
}

interface LocationProfile {
  name: string;
  setting: string; // INT. or EXT.
  frequency: number;
  sceneNumbers: number[];
  timeOfDay: string[];
}

interface ProductionBreakdown {
  locations: LocationProfile[];
  cast: CharacterProfile[];
  estimatedShootingDays: number;
  uniqueLocations: number;
  nightScenes: number;
  exteriorScenes: number;
  dialogueHeavyScenes: number[];
  actionHeavyScenes: number[];
}

/**
 * Run script analysis on screenplay text.
 * Equivalent to cine-analysis-system's parseFountain + CharacterAnalyzer.
 */
export async function analyzeScript(screenplayText: string, projectTitle?: string): Promise<AnalysisResult> {
  // Use the existing sceneCutParser
  const { parseScreenplayToScenes } = await import("../../../src/utils/sceneCutParser.js");
  const parsed = parseScreenplayToScenes(screenplayText, { projectTitle });

  // Extract character profiles
  const charMap = new Map<string, CharacterProfile>();
  for (const scene of parsed.scenes) {
    for (const charName of scene.characters) {
      const existing = charMap.get(charName);
      if (existing) {
        existing.sceneCount++;
        existing.sceneNumbers.push(scene.number);
        existing.lastAppearance = scene.number;
        // Count dialogue cuts as proxy for dialogue count
        existing.dialogueCount += scene.cuts.filter((c: any) => c.type === 'dialogue').length;
      } else {
        charMap.set(charName, {
          name: charName,
          sceneCount: 1,
          firstAppearance: scene.number,
          lastAppearance: scene.number,
          sceneNumbers: [scene.number],
          dialogueCount: scene.cuts.filter((c: any) => c.type === 'dialogue').length,
          type: 'minor',
        });
      }
    }
  }

  // Classify character types based on scene count
  const characters = Array.from(charMap.values());
  const maxScenes = Math.max(...characters.map(c => c.sceneCount), 1);
  for (const c of characters) {
    const ratio = c.sceneCount / maxScenes;
    if (ratio > 0.3) c.type = 'lead';
    else if (ratio > 0.1) c.type = 'supporting';
  }
  characters.sort((a, b) => b.sceneCount - a.sceneCount);

  // Extract location profiles
  const locMap = new Map<string, LocationProfile>();
  for (const scene of parsed.scenes) {
    const key = (scene.location || 'UNKNOWN').toUpperCase();
    const existing = locMap.get(key);
    if (existing) {
      existing.frequency++;
      existing.sceneNumbers.push(scene.number);
      if (scene.timeOfDay && !existing.timeOfDay.includes(scene.timeOfDay)) {
        existing.timeOfDay.push(scene.timeOfDay);
      }
    } else {
      locMap.set(key, {
        name: scene.location || 'UNKNOWN',
        setting: scene.setting || '',
        frequency: 1,
        sceneNumbers: [scene.number],
        timeOfDay: scene.timeOfDay ? [scene.timeOfDay] : [],
      });
    }
  }
  const locations = Array.from(locMap.values()).sort((a, b) => b.frequency - a.frequency);

  return {
    scenes: parsed.scenes.map((s: any) => ({
      number: s.number,
      slug: s.slug,
      heading: s.heading,
      setting: s.setting,
      location: s.location,
      timeOfDay: s.timeOfDay,
      characters: s.characters,
      cutCount: s.cutCount,
      summary: s.summary || '',
    })),
    characters,
    locations,
    stats: parsed.stats,
  };
}

/**
 * Run production breakdown analysis.
 * Equivalent to cine-analysis-system's ProductionAnalyzer.
 */
export async function analyzeProduction(analysisResult: AnalysisResult): Promise<ProductionBreakdown> {
  const { scenes, characters, locations } = analysisResult;

  const nightScenes = scenes.filter(s =>
    s.timeOfDay && (s.timeOfDay.includes('밤') || s.timeOfDay.includes('야간') || s.timeOfDay.toLowerCase().includes('night'))
  ).length;

  const exteriorScenes = scenes.filter(s =>
    s.setting === 'EXT.' || s.setting === 'EXT'
  ).length;

  // Dialogue-heavy scenes: >60% dialogue cuts
  const dialogueHeavyScenes = scenes
    .filter(s => s.cutCount > 0)
    .filter(s => {
      // Approximate: if characters > 1 and cutCount is significant
      return s.characters.length >= 2;
    })
    .map(s => s.number);

  // Action-heavy scenes: few characters, many cuts
  const actionHeavyScenes = scenes
    .filter(s => s.cutCount > 20 && s.characters.length <= 2)
    .map(s => s.number);

  // Rough shooting days estimate: ~3 scenes per day for film
  const estimatedShootingDays = Math.ceil(scenes.length / 3);

  return {
    locations,
    cast: characters,
    estimatedShootingDays,
    uniqueLocations: locations.length,
    nightScenes,
    exteriorScenes,
    dialogueHeavyScenes,
    actionHeavyScenes,
  };
}
