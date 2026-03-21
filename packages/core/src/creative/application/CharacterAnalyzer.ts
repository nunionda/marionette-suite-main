import type { ScriptElement } from "../../script/infrastructure/parser";
import type {
  CharacterNetwork,
  CharacterNode,
  CharacterEdge,
  DiversityMetrics,
} from "../domain/CharacterNetwork";

export class CharacterAnalyzer {
  /**
   * Deterministically analyzes the structural presence of characters throughout the screenplay.
   * Includes SNA edges, voice scoring, and diversity metrics.
   */
  public analyze(scriptId: string, elements: ScriptElement[]): CharacterNetwork {
    // ---------- Pass 1: collect per-character stats + scene tracking ----------
    const characterStats = new Map<
      string,
      { lines: number; words: number; wordSet: Set<string>; scenes: Set<number>; dialogues: string[] }
    >();
    let currentCharacter = "";
    let currentScene = 0;

    // Track which characters appear in each scene (for edge computation)
    const sceneCharacters = new Map<number, Set<string>>();
    // Track sequential dialogue pairs per scene (for exchange counting)
    const dialoguePairs: { scene: number; from: string; to: string }[] = [];
    let previousSpeaker = "";

    for (const el of elements) {
      if (el.type === "scene_heading") {
        currentScene++;
        currentCharacter = "";
        previousSpeaker = "";
      } else if (el.type === "character") {
        currentCharacter = el.text.replace(/\s*\(.*?\)\s*/g, "").trim();
        // Register character in scene
        if (currentScene > 0) {
          if (!sceneCharacters.has(currentScene)) {
            sceneCharacters.set(currentScene, new Set());
          }
          sceneCharacters.get(currentScene)!.add(currentCharacter);
        }
      } else if (el.type === "dialogue" && currentCharacter) {
        const stats = characterStats.get(currentCharacter) || {
          lines: 0,
          words: 0,
          wordSet: new Set<string>(),
          scenes: new Set<number>(),
          dialogues: [],
        };
        stats.lines += 1;
        const words = el.text.split(/\s+/).filter((w) => w.length > 0);
        stats.words += words.length;
        for (const w of words) stats.wordSet.add(w.toLowerCase());
        if (currentScene > 0) stats.scenes.add(currentScene);
        stats.dialogues.push(el.text);
        characterStats.set(currentCharacter, stats);

        // Dialogue exchange: A speaks then B speaks = 1 exchange
        if (previousSpeaker && previousSpeaker !== currentCharacter && currentScene > 0) {
          dialoguePairs.push({ scene: currentScene, from: previousSpeaker, to: currentCharacter });
        }
        previousSpeaker = currentCharacter;
      } else if (el.type === "action") {
        currentCharacter = "";
      }
    }

    // ---------- Pass 2: build CharacterNode[] ----------
    const sortedEntries = Array.from(characterStats.entries()).sort(
      (a, b) => b[1].lines - a[1].lines,
    );

    const totalDialogueWords = sortedEntries.reduce((s, [, v]) => s + v.words, 0);

    const characters: CharacterNode[] = sortedEntries.map(([name, stats], index) => {
      let role: CharacterNode["role"] = "Minor";
      if (index === 0) role = "Protagonist";
      else if (index === 1) role = "Antagonist";
      else if (index <= 5) role = "Supporting";

      const avgWordsPerLine = stats.lines > 0 ? +(stats.words / stats.lines).toFixed(1) : 0;
      const vocabularyRichness = stats.words > 0 ? +(stats.wordSet.size / stats.words).toFixed(3) : 0;

      return {
        name,
        totalLines: stats.lines,
        totalWords: stats.words,
        role,
        avgWordsPerLine,
        vocabularyRichness,
        sceneAppearances: Array.from(stats.scenes).sort((a, b) => a - b),
      };
    });

    // ---------- Pass 3: voice score ----------
    // voiceScore = how different this character's dialogue style is from the cast average
    if (characters.length > 1) {
      const avgWPL =
        characters.reduce((s, c) => s + (c.avgWordsPerLine ?? 0), 0) / characters.length;
      const avgVR =
        characters.reduce((s, c) => s + (c.vocabularyRichness ?? 0), 0) / characters.length;

      for (const c of characters) {
        const wplDeviation = Math.abs((c.avgWordsPerLine ?? 0) - avgWPL);
        const vrDeviation = Math.abs((c.vocabularyRichness ?? 0) - avgVR);
        // Normalize: higher deviation = more unique voice
        const rawScore = wplDeviation * 3 + vrDeviation * 100;
        c.voiceScore = Math.min(100, Math.round(rawScore));
      }
    } else {
      for (const c of characters) c.voiceScore = 50;
    }

    // ---------- Pass 4: edges (co-appearance + dialogue exchanges) ----------
    const edgeMap = new Map<string, { weight: number; exchanges: number }>();

    const edgeKey = (a: string, b: string) => (a < b ? `${a}||${b}` : `${b}||${a}`);

    // Co-appearance edges
    for (const [, chars] of sceneCharacters) {
      const arr = Array.from(chars);
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const key = edgeKey(arr[i], arr[j]);
          const edge = edgeMap.get(key) || { weight: 0, exchanges: 0 };
          edge.weight++;
          edgeMap.set(key, edge);
        }
      }
    }

    // Dialogue exchanges
    for (const pair of dialoguePairs) {
      const key = edgeKey(pair.from, pair.to);
      const edge = edgeMap.get(key) || { weight: 0, exchanges: 0 };
      edge.exchanges++;
      edgeMap.set(key, edge);
    }

    const edges: CharacterEdge[] = Array.from(edgeMap.entries())
      .map(([key, val]) => {
        const parts = key.split("||");
        return {
          source: parts[0]!,
          target: parts[1]!,
          weight: val.weight,
          dialogueExchanges: val.exchanges,
        };
      })
      .sort((a, b) => b.weight - a.weight);

    // ---------- Pass 5: diversity metrics ----------
    const diversityMetrics: DiversityMetrics | undefined =
      characters.length >= 3
        ? (() => {
            const top1Pct =
              totalDialogueWords > 0
                ? +((characters[0]!.totalWords / totalDialogueWords) * 100).toFixed(1)
                : 0;
            const top3Words = characters.slice(0, 3).reduce((s, c) => s + c.totalWords, 0);
            const top3Pct =
              totalDialogueWords > 0
                ? +((top3Words / totalDialogueWords) * 100).toFixed(1)
                : 0;

            // Centrality = edge count per character
            const edgeCounts = new Map<string, number>();
            for (const e of edges) {
              edgeCounts.set(e.source, (edgeCounts.get(e.source) || 0) + e.weight);
              edgeCounts.set(e.target, (edgeCounts.get(e.target) || 0) + e.weight);
            }
            const sorted = Array.from(edgeCounts.values()).sort((a, b) => b - a);
            const centralityGap = sorted.length >= 2 ? sorted[0]! - sorted[1]! : 0;

            return { speakingRoleDistribution: { top1Pct, top3Pct }, centralityGap };
          })()
        : undefined;

    return { scriptId, characters, edges, diversityMetrics };
  }
}
