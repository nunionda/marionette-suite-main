/**
 * A basic Fountain screenplay parser.
 * Fountain is a simple markup format for screenplays.
 */

export interface ScriptElement {
  type: "scene_heading" | "character" | "dialogue" | "action" | "transition" | "parenthetical";
  text: string;
  metadata?: {
    setting?: string;
    location?: string;
    time?: string;
  };
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
      const text = line.startsWith(".") ? line.substring(1).trim() : line;
      
      let setting = "";
      let location = "";
      let time = "";
      
      // Parse e.g. "INT. BRICK'S PATIO - DAY"
      const match = text.match(/^(INT\.|EXT\.|INT|EXT|EST|I\/E)\s+(.*?)(?:\s*-\s*(.*))?$/i);
      if (match) {
        setting = match[1] ? match[1].trim() : "";
        location = match[2] ? match[2].trim() : "";
        time = match[3] ? match[3].trim() : "";
      }

      elements.push({ 
        type: "scene_heading", 
        text,
        metadata: { setting, location, time }
      });
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
