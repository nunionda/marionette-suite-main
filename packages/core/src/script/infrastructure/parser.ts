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
  const sceneRegex = /^((INT\.|EXT\.|INT|EXT|EST|I\/E)[. ]|(S#|S\/|씬|씬\/)\s*\d+|제\s*\d+\s*경)/i;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i] || "";
    const line = originalLine.trim();

    if (line === "") {
      currentCharacter = "";
      continue;
    }

    // Scene Headings
    if (line.match(sceneRegex) || line.startsWith(".")) {
      const text = line.startsWith(".") ? line.substring(1).trim() : line;
      
      let setting = "";
      let location = "";
      let time = "";
      
      const enMatch = text.match(/^(INT\.|EXT\.|INT|EXT|EST|I\/E)\s+(.*?)(?:\s*-\s*(.*))?$/i);
      const koMatch = text.match(/^((?:S#|S\/|씬|씬\/)\s*\d+|제\s*\d+\s*경)[.,\s]*(.*?)(?:\s*-\s*(.*))?$/i);
      
      if (enMatch) {
        setting = enMatch[1] ? enMatch[1].trim() : "";
        location = enMatch[2] ? enMatch[2].trim() : "";
        time = enMatch[3] ? enMatch[3].trim() : "";
      } else if (koMatch) {
        setting = koMatch[1] ? koMatch[1].trim() : "";
        location = koMatch[2] ? koMatch[2].trim() : "";
        time = koMatch[3] ? koMatch[3].trim() : "";
      }

      elements.push({ type: "scene_heading", text, metadata: { setting, location, time } });
      currentCharacter = "";
    }
    // Parentheticals
    else if (line.startsWith("(") && line.endsWith(")")) {
      elements.push({ type: "parenthetical", text: line });
    }
    // Transitions
    else if ((line === line.toUpperCase() && line.endsWith("TO:")) || line.match(/^(FADE IN:|FADE OUT\.|CUT TO:|디졸브|암전)/)) {
      elements.push({ type: "transition", text: line });
      currentCharacter = "";
    }
    // Characters
    else {
      const isUppercaseEnglish = line === line.toUpperCase() && /[A-Z]/.test(line) && !line.match(/[.:?!]$/);
      const nextLine = i + 1 < lines.length ? (lines[i + 1]?.trim() ?? "") : "";
      
      // Korean character detection: shorter length, no punctuation, NOT empty next line
      const nameWithoutParens = line.replace(/\s*\(.*?\)\s*/g, '').trim();
      const isKoreanNamePattern = /^[가-힣A-Za-z0-9\s]+$/.test(nameWithoutParens) && /[가-힣A-Za-z]/.test(nameWithoutParens);
      const wordCount = nameWithoutParens.split(/\s+/).length;
      const isKoreanCharacter = isKoreanNamePattern && nameWithoutParens.length <= 8 && wordCount <= 2 && !line.match(/[.?!,:;]$/);
      
      if (isUppercaseEnglish || (isKoreanCharacter && nextLine !== "")) {
        elements.push({ type: "character", text: line });
        currentCharacter = line;
      }
      // Dialogue
      else if (currentCharacter !== "") {
        elements.push({ type: "dialogue", text: line });
      }
      // Action
      else {
        elements.push({ type: "action", text: line });
      }
    }
  }

  return elements;
}
