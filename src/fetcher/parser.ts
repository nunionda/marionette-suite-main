/**
 * A basic Fountain screenplay parser.
 * Fountain is a simple markup format for screenplays.
 */

export interface ScriptElement {
  type: "scene_heading" | "character" | "dialogue" | "action" | "transition" | "parenthetical";
  text: string;
}

export function parseFountain(script: string): ScriptElement[] {
  const lines = script.split("\n");
  const elements: ScriptElement[] = [];

  let currentCharacter = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? "";

    if (line === "") {
      currentCharacter = "";
      continue;
    }

    // Scene Headings
    if (line.match(/^(INT|EXT|EST|I\/E)[. ]/i) || line.startsWith(".")) {
      elements.push({ type: "scene_heading", text: line.startsWith(".") ? line.substring(1).trim() : line });
      currentCharacter = "";
    }
    // Character Names (Simple heuristic: uppercase and no punctuation)
    else if (line === line.toUpperCase() && !line.match(/[.:?!]$/) && !line.match(/^(INT|EXT|EST|I\/E)[. ]/i)) {
      elements.push({ type: "character", text: line });
      currentCharacter = line;
    }
    // Parentheticals
    else if (line.startsWith("(") && line.endsWith(")")) {
      elements.push({ type: "parenthetical", text: line });
    }
    // Transitions (Simple heuristic: uppercase and ends with TO:)
    else if (line === line.toUpperCase() && line.endsWith("TO:")) {
      elements.push({ type: "transition", text: line });
      currentCharacter = "";
    }
    // Dialogue (if we have a current character)
    else if (currentCharacter !== "") {
      elements.push({ type: "dialogue", text: line });
    }
    // Action
    else {
      elements.push({ type: "action", text: line });
    }
  }

  return elements;
}
