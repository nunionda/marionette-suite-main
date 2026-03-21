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
  let allowBlankAfterCharacter = false;
  const sceneRegex = /^((INT\.|EXT\.|INT|EXT|EST|I\/E)[. ]|(S#|S\/|씬|씬\/)\s*\d+|제\s*\d+\s*경|\d+\.\s+|○\s*)/i;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i] || "";
    const line = originalLine.trim();

    if (line === "") {
      if (allowBlankAfterCharacter) {
        allowBlankAfterCharacter = false;
      } else {
        currentCharacter = "";
      }
      continue;
    }
    allowBlankAfterCharacter = false;

    // Scene Headings
    if (line.match(sceneRegex) || line.startsWith(".")) {
      const text = line.startsWith(".") ? line.substring(1).trim() : line;
      
      let setting = "";
      let location = "";
      let time = "";
      
      const enMatch = text.match(/^(INT\.|EXT\.|INT|EXT|EST|I\/E)\s+(.*?)(?:\s*-\s*(.*))?$/i);
      const koMatch = text.match(/^((?:S#|S\/|씬|씬\/)\s*\d+|제\s*\d+\s*경|\d+\.)[.,\s]*(.*?)(?:\s*[-–]\s*(.*))?$/i);
      const jpMatch = text.match(/^○?\s*(.*?)(?:\s*[-–]\s*(.*))?$/);

      if (enMatch) {
        setting = enMatch[1] ? enMatch[1].trim() : "";
        location = enMatch[2] ? enMatch[2].trim() : "";
        time = enMatch[3] ? enMatch[3].trim() : "";
      } else if (koMatch) {
        setting = koMatch[1] ? koMatch[1].trim() : "";
        location = koMatch[2] ? koMatch[2].trim() : "";
        time = koMatch[3] ? koMatch[3].trim() : "";
      } else if (jpMatch) {
        setting = "○";
        location = jpMatch[1] ? jpMatch[1].trim() : "";
        time = jpMatch[2] ? jpMatch[2].trim() : "";
      }

      elements.push({ type: "scene_heading", text, metadata: { setting, location, time } });
      currentCharacter = "";
    }
    // Parentheticals
    else if (line.startsWith("(") && line.endsWith(")")) {
      elements.push({ type: "parenthetical", text: line });
    }
    // Transitions
    else if (line.startsWith("<") && line.endsWith(">")) {
      elements.push({ type: "action", text: line });
      currentCharacter = "";
    }
    // Transitions
    else if ((line === line.toUpperCase() && line.endsWith("TO:")) || line.match(/^(FADE IN:|FADE OUT\.|CUT\s+TO\b|디졸브|암전|暗転|フェードイン|フェードアウト|ディゾルブ)/) || /^다시\s+\S+$/.test(line)) {
      elements.push({ type: "transition", text: line });
      currentCharacter = "";
    }
    // Characters
    else {
      // Reject bracketed system messages: [STATUS: ...], [TIMER: D-45], etc.
      const isBracketedMessage = /^\[.*\]$/.test(line) || /^\[.*\]$/.test(line.replace(/\s*\(.*?\)\s*/g, '').trim());
      // Reject lines containing brackets or unmatched closing parens (system/UI text)
      const hasBracketsOrUnmatchedParen = /[\[\]]/.test(line) || (line.endsWith(')') && !line.includes('('));

      const isUppercaseEnglish = !isBracketedMessage && !hasBracketsOrUnmatchedParen && line === line.toUpperCase() && /[A-Z]/.test(line) && !line.match(/[.:?!\]]$/) && !/[가-힣ぁ-んァ-ヴー一-龯]/.test(line);
      const nextLine = i + 1 < lines.length ? (lines[i + 1]?.trim() ?? "") : "";

      // CJK character detection: shorter length, no punctuation, NOT empty next line
      const nameWithoutParens = line.replace(/\s*\(.*?\)\s*/g, '').trim();
      const isCjkNamePattern = !isBracketedMessage && !hasBracketsOrUnmatchedParen && /^[가-힣ぁ-んァ-ヴー一-龯A-Za-z0-9\s]+$/.test(nameWithoutParens) && /[가-힣ぁ-んァ-ヴー一-龯]/.test(nameWithoutParens);
      const wordCount = nameWithoutParens.split(/\s+/).length;
      const hasKoreanParticle = /[이가을를은는도의에서와로들야님오]$/.test(nameWithoutParens);
      // Korean common nouns that should not be character names (check each word individually)
      const koreanCommonWordRe = /^(오전|오후|새벽|저녁|아침|밤|낮|단계|행동|순간|현재|계속|시작|완료)$/;
      const isKoreanCommonWord = nameWithoutParens.split(/\s+/).every(w => koreanCommonWordRe.test(w));
      const isCjkCharacter = isCjkNamePattern && nameWithoutParens.length <= 6 && wordCount <= 2 && !line.match(/[.?!,:;。？！、；\]\)]$/) && !hasKoreanParticle && !isKoreanCommonWord;

      // Short CJK names (≤3 chars) allow a blank line before dialogue (common in Korean PDF screenplays)
      const nextNextLine = i + 2 < lines.length ? (lines[i + 2]?.trim() ?? "") : "";
      const isShortName = nameWithoutParens.length <= 3;
      const hasFollowingContent = nextLine !== "" || (isShortName && nextNextLine !== "");

      if (isUppercaseEnglish || (isCjkCharacter && hasFollowingContent)) {
        elements.push({ type: "character", text: line });
        currentCharacter = line;
        allowBlankAfterCharacter = true;
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
