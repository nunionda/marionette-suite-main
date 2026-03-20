import { ScriptElement } from "../../script/infrastructure/parser";
import { CharacterNetwork, CharacterNode } from "../domain/CharacterNetwork";

export class CharacterAnalyzer {
  
  /**
   * Deterministically analyzes the structural presence of characters throughout the screenplay.
   * Operates mathematically on parsed nodes instead of using an LLM to guarantee perfect accuracy.
   */
  public analyze(scriptId: string, elements: ScriptElement[]): CharacterNetwork {
    const characterStats = new Map<string, { lines: number, words: number }>();
    let currentCharacter = "";

    for (const el of elements) {
      if (el.type === "character") {
        // Remove parentheticals next to names e.g. "JOHN (V.O.)" -> "JOHN"
        currentCharacter = el.text.replace(/\s*\(.*?\)\s*/g, '').trim();
      } else if (el.type === "dialogue" && currentCharacter) {
        const stats = characterStats.get(currentCharacter) || { lines: 0, words: 0 };
        stats.lines += 1;
        // Basic word count split
        stats.words += el.text.split(/\s+/).filter(w => w.length > 0).length;
        characterStats.set(currentCharacter, stats);
      } else if (el.type === "scene_heading" || el.type === "action") {
        // Reset character to prevent action lines bleeding into dialogue counts
        currentCharacter = "";
      }
    }

    // Sort by total lines spoken to determine hierarchical rank
    const sortedEntries = Array.from(characterStats.entries()).sort((a, b) => b[1].lines - a[1].lines);

    const characters: CharacterNode[] = sortedEntries.map(([name, stats], index) => {
      let role: CharacterNode["role"] = "Minor";
      
      // Benchmarking heuristics for Hollywood roles based on line distribution
      if (index === 0) role = "Protagonist";
      else if (index === 1) role = "Antagonist"; // 2nd highest talker is often the antagonist/co-lead
      else if (index <= 5) role = "Supporting";

      return {
        name,
        totalLines: stats.lines,
        totalWords: stats.words,
        role
      };
    });

    return {
      scriptId,
      characters
    };
  }
}
