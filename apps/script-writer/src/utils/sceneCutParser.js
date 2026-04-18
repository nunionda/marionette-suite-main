/**
 * Scene/Cut Parser for script-writer
 *
 * Parses screenplay text (from ProjectDetail SCREENPLAY tab)
 * into structured scene[] with cut[] for studio node flow integration.
 *
 * This is the script-writer side of the bridge.
 * Studio side: studio/src/lib/studio/script-bridge.ts
 *
 * Supports both:
 *   - English format: INT./EXT. LOCATION - TIME
 *   - Korean format: S#1, 씬1, 제1경, 1. LOCATION
 */

const SCENE_HEADING_RE = /^((INT\.|EXT\.|INT|EXT|EST|I\/E)[. ]|(S#|S\/|씬)\s*\d+|제\s*\d+\s*경|\d+\.\s+)/i;
const TRANSITION_RE = /^(FADE IN:|FADE OUT\.|CUT\s+TO\b|디졸브|암전)/i;

/**
 * Parse screenplay text into scene/cut structure.
 * @param {string} text - Raw screenplay text from SCREENPLAY tab
 * @param {object} options
 * @param {string} options.projectTitle - For generating initials
 * @param {number} [options.maxDialoguePerCut=6] - Max dialogue lines before cut split
 * @returns {{ scenes: Array, stats: object }}
 */
export function parseScreenplayToScenes(text, options = {}) {
  const { projectTitle = 'Untitled' } = options;
  const initials = projectTitle
    .split(/\s+/)
    .map(w => (w[0] || '').toUpperCase())
    .join('')
    .slice(0, 5) || 'PRJ';

  // ─── A/V Script detection (markdown table format) ───
  // Commercial scripts use: | 시간 | Visual | Audio |
  if (isAVScriptTable(text)) {
    return parseAVScriptTable(text, initials);
  }

  // ─── YouTube/Markdown timecode script detection ───
  // YouTube scripts use: **[0:00-0:05]** or [0:00-0:05] headers with descriptions
  if (isYouTubeTimecodeScript(text)) {
    return parseYouTubeTimecodeScript(text, initials);
  }

  const lines = text.split('\n');
  const rawScenes = [];
  let current = null;

  // Step 1: Group lines by scene heading
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (SCENE_HEADING_RE.test(trimmed)) {
      if (current) rawScenes.push(current);
      const match = trimmed.match(/^(INT\.|EXT\.|INT|EXT|EST|I\/E)\s+(.*?)(?:\s*-\s*(.*))?$/i);
      current = {
        heading: trimmed,
        setting: match?.[1] || '',
        location: match?.[2] || trimmed,
        timeOfDay: match?.[3] || '',
        lines: [],
        characters: new Set(),
      };
    } else if (current) {
      const prevType = current.lines.length > 0 ? current.lines[current.lines.length - 1].type : null;
      let type;

      if (isCharacterLine(trimmed)) {
        // Check if it's inline dialogue format (e.g. "설희  대사내용")
        const hasInlineDialogue = /^[가-힣]{2,4}\s{2,}.+/.test(trimmed) || /^[A-Z][a-zA-Z]+\s{2,}.+/.test(trimmed);
        if (hasInlineDialogue) {
          // Split into character + dialogue
          const charName = extractCharacterName(trimmed);
          const dialogueText = extractDialogueText(trimmed);
          current.characters.add(charName);
          current.lines.push({ text: charName, type: 'character' });
          if (dialogueText && dialogueText !== charName) {
            current.lines.push({ text: dialogueText, type: 'dialogue' });
          }
          continue; // already pushed, skip the push below
        }
        type = 'character';
        current.characters.add(trimmed.replace(/\s*\(.*?\)\s*/g, '').trim());
      } else if (prevType === 'character' || prevType === 'dialogue' || prevType === 'parenthetical') {
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          type = 'parenthetical';
        } else if (TRANSITION_RE.test(trimmed)) {
          type = 'transition';
        } else {
          type = 'dialogue';
        }
      } else {
        type = classifyLine(trimmed);
      }
      current.lines.push({ text: trimmed, type });
    }
  }
  if (current) rawScenes.push(current);

  // Step 2: Convert to structured scenes with cuts
  const scenes = rawScenes.map((raw, idx) => {
    const sceneNum = idx + 1;
    const slug = `sc${String(sceneNum).padStart(3, '0')}`;
    const displayId = `${initials}_${slug}`;
    const cuts = splitIntoCuts(raw.lines, sceneNum, initials);

    return {
      number: sceneNum,
      slug,
      displayId,
      heading: raw.heading,
      setting: raw.setting,
      location: raw.location,
      timeOfDay: raw.timeOfDay,
      characters: Array.from(raw.characters),
      summary: buildSummary(raw.lines),
      cuts,
      cutCount: cuts.length,
    };
  });

  // Step 3: Stats
  const totalCuts = scenes.reduce((sum, s) => sum + s.cutCount, 0);
  const allChars = new Set(scenes.flatMap(s => s.characters));

  return {
    scenes,
    stats: {
      totalScenes: scenes.length,
      totalCuts,
      totalCharacters: allChars.size,
      estimatedMinutes: Math.round((totalCuts * 4) / 60), // ~4s per cut
      actBreakdown: {
        act1: scenes.filter((_, i) => i / scenes.length <= 0.25).length,
        act2: scenes.filter((_, i) => i / scenes.length > 0.25 && i / scenes.length <= 0.75).length,
        act3: scenes.filter((_, i) => i / scenes.length > 0.75).length,
      },
    },
  };
}

// ─── Line classification ───

function classifyLine(text) {
  if (TRANSITION_RE.test(text)) return 'transition';
  if (text.startsWith('(') && text.endsWith(')')) return 'parenthetical';
  if (isCharacterLine(text)) return 'character';
  return 'action'; // dialogue detection requires context (follows character)
}

// Non-character patterns to reject
const NOT_CHARACTER_RE = /^\[.*\]$|^\[.*|^SUPER:|^STAGE\s+\d|^PART\s+[A-Z]|^[A-Z]\.\s|^—\s|^S#\d|^\d+\.|^FADE|^CUT|인터커팅|완료\]|→|경고|보고/;

function isCharacterLine(text) {
  const cleaned = text.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Reject system messages, markers, and structural elements
  if (NOT_CHARACTER_RE.test(cleaned)) return false;
  if (/[\[\]{}]/.test(cleaned)) return false; // brackets = system message
  if (cleaned.includes(':') && cleaned.length > 15) return false; // "STAGE 3: ..." patterns
  if (cleaned.startsWith('—') || cleaned.endsWith('—')) return false;

  // English ALL CAPS character name (short, no punctuation)
  if (cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned) && !cleaned.match(/[.:?!]$/) && cleaned.length < 20) {
    return true;
  }
  // Korean character names: 2-4 chars, standalone (no particles, no verbs)
  if (/^[가-힣]{2,4}$/.test(cleaned)) {
    // Reject common nouns/roles that aren't character names
    if (/[을를의에서와로]$/.test(cleaned)) return false; // particles
    if (/[다고며면서]$/.test(cleaned)) return false; // verb endings
    return true;
  }
  // Korean inline dialogue format: "설희  (지문) 대사" or "은서  대사"
  if (/^[가-힣]{2,4}\s{2,}/.test(text)) {
    const name = text.match(/^([가-힣]{2,4})\s{2,}/)?.[1];
    if (name && NOT_CHARACTER_RE.test(name)) return false;
    return true;
  }
  // English name with inline dialogue: "RYAN  (sipping) dialogue"
  if (/^[A-Z][a-z]+\s{2,}/.test(text) || /^[A-Z]{2,}\s{2,}/.test(text)) {
    const name = text.match(/^([A-Za-z]+)\s{2,}/)?.[1];
    if (name && /^(SUPER|STAGE|PART|FADE|CUT|THE|INT|EXT)$/i.test(name)) return false;
    return true;
  }
  return false;
}

// Extract character name from inline dialogue format
function extractCharacterName(text) {
  // Korean: "설희  (지문) 대사" → "설희"
  const koMatch = text.match(/^([가-힣]{2,4})\s{2,}/);
  if (koMatch) return koMatch[1];
  // English: "RYAN  (sipping) dialogue" → "RYAN"
  const enMatch = text.match(/^([A-Z][a-zA-Z]+)\s{2,}/);
  if (enMatch) return enMatch[1].toUpperCase();
  return text.replace(/\s*\(.*?\)\s*/g, '').trim();
}

// Extract dialogue text from inline format
function extractDialogueText(text) {
  // "설희  (지문) 대사" → "대사"
  const match = text.match(/^[가-힣A-Za-z]+\s{2,}(?:\(.*?\)\s*)?(.+)$/);
  return match ? match[1].trim() : text;
}

// ─── Cut splitting ───
// 업계 기준 (나무위키/StudioBinder/MasterClass):
//   - 장편영화: 100씬 × 평균 12~25컷 = 1,200~2,500 컷
//   - 지문(action): 마침표(.) 하나 = 최소 1컷 (카메라 앵글/구도 변화)
//   - 대사(dialogue): 인물 대사 1턴 = 1컷 (화자 전환 = 리버스 샷)
//   - 전환(transition): CUT TO, INSERT, POV 등 = 명시적 컷 경계
//   - 괄호 지문(parenthetical): 동일 컷 내 연기 지시 (컷 분리 안 함)

function splitIntoCuts(lineObjs, sceneNum, initials) {
  const cuts = [];
  let cutNum = 0;
  let lastSpeaker = '';
  let isInDialogue = false;

  const pushCut = (text, type) => {
    cutNum++;
    cuts.push({
      number: cutNum,
      slug: `cut${String(cutNum).padStart(3, '0')}`,
      displayId: `${initials}_sc${String(sceneNum).padStart(3, '0')}_cut${String(cutNum).padStart(3, '0')}`,
      description: text.length > 200 ? text.slice(0, 197) + '...' : text,
      type,
      lineCount: 1,
    });
  };

  for (const obj of lineObjs) {
    const text = obj.text.trim();
    if (!text) continue;

    // Transition = explicit cut boundary
    if (obj.type === 'transition') {
      pushCut(text, 'transition');
      isInDialogue = false;
      lastSpeaker = '';
      continue;
    }

    // Character name = start of dialogue turn
    if (obj.type === 'character') {
      const speaker = text.replace(/\s*\(.*?\)\s*/g, '').trim();
      lastSpeaker = speaker;
      isInDialogue = true;
      continue; // character line itself is not a cut — the dialogue that follows is
    }

    // Parenthetical = stage direction within same cut, skip
    if (obj.type === 'parenthetical') {
      continue;
    }

    // Dialogue line = 1 cut per dialogue turn (speaker's full speech)
    if (isInDialogue && lastSpeaker) {
      pushCut(`[${lastSpeaker}] ${text}`, 'dialogue');
      // Stay in dialogue mode — next character line will set new speaker
      // But if next line is action, isInDialogue will be reset below
      continue;
    }

    // Action line = split by sentences (each sentence ≈ 1 shot)
    isInDialogue = false;
    lastSpeaker = '';

    // Split action text by sentence boundaries (마침표, 온점)
    const sentences = text
      .split(/(?<=[.。!?])\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) continue;

    for (const sentence of sentences) {
      // Skip very short fragments (under 5 chars, likely artifacts)
      if (sentence.length < 5) continue;
      pushCut(sentence, 'action');
    }
  }

  // Ensure at least 1 cut per scene
  if (cuts.length === 0) {
    return [{
      number: 1,
      slug: 'cut001',
      displayId: `${initials}_sc${String(sceneNum).padStart(3, '0')}_cut001`,
      description: '(establishing shot)',
      type: 'action',
      lineCount: 0,
    }];
  }

  return cuts;
}

function buildSummary(lineObjs) {
  const actions = lineObjs.filter(l => l.type === 'action').map(l => l.text).join(' ');
  return actions.length > 150 ? actions.slice(0, 147) + '...' : actions;
}

// ─── A/V Script Table Parser ───
// Parses markdown table format: | 시간 | Visual | Audio |
// Each row = 1 cut, entire script = 1 scene (commercial/YouTube are single-scene)

function isAVScriptTable(text) {
  // Detect markdown table with time + visual columns
  return /\|\s*시간\s*\|/.test(text) || /\|\s*\d+:\d+/.test(text);
}

function parseAVScriptTable(text, initials) {
  const lines = text.split('\n');
  const cuts = [];
  let cutNum = 0;

  for (const line of lines) {
    // Skip header row and separator row
    if (/\|\s*시간\s*\|/.test(line)) continue;
    if (/\|[-\s]+\|/.test(line)) continue;

    // Parse data rows: | time | visual | audio |
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 2) continue;

    const timeCode = cells[0] || '';
    const visual = (cells[1] || '').replace(/<br>/g, ' ').replace(/\*\*/g, '').replace(/\[카메라 앵글:\s*/g, '[').trim();
    const audio = (cells[2] || '').replace(/<br>/g, ' ').replace(/\*\*/g, '').trim();

    if (!timeCode.match(/\d+:\d+/)) continue; // Must have timecode

    cutNum++;

    // Extract VO text for dialogue detection
    const voMatch = audio.match(/VO:\s*"?([^"]+)"?/);
    const hasVO = voMatch && voMatch[1] && !voMatch[1].includes('없음');
    const type = hasVO ? 'dialogue' : 'action';

    // Build description from visual + audio
    let description = visual;
    if (hasVO) description += ` — VO: "${voMatch[1]}"`;

    // Parse duration from timecode
    const timeMatch = timeCode.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/);
    let duration = 4;
    if (timeMatch) {
      const start = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      const end = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
      duration = end - start;
    }

    cuts.push({
      number: cutNum,
      slug: `cut${String(cutNum).padStart(3, '0')}`,
      displayId: `${initials}_sc001_cut${String(cutNum).padStart(3, '0')}`,
      description: description.length > 200 ? description.slice(0, 197) + '...' : description,
      type,
      lineCount: 1,
      duration,
      timeCode,
      audioNote: audio,
    });
  }

  // Wrap all cuts in a single scene
  const scene = {
    number: 1,
    slug: 'sc001',
    displayId: `${initials}_sc001`,
    heading: 'A/V SCRIPT',
    setting: '',
    location: 'Various',
    timeOfDay: '',
    characters: [],
    summary: cuts.slice(0, 3).map(c => c.description).join('. ').slice(0, 150),
    cuts,
    cutCount: cuts.length,
  };

  return {
    scenes: [scene],
    stats: {
      totalScenes: 1,
      totalCuts: cuts.length,
      totalCharacters: 0,
      estimatedMinutes: Math.round(cuts.reduce((s, c) => s + (c.duration || 4), 0) / 60),
      actBreakdown: { act1: 1, act2: 0, act3: 0 },
    },
  };
}

// ─── YouTube Timecode Script Parser ───
// Parses markdown scripts with **[0:00-0:05]** SECTION_NAME headers
// Each timecode block = 1 cut

function isYouTubeTimecodeScript(text) {
  // Detect [M:SS-M:SS] or **[M:SS-M:SS]** patterns (at least 2 occurrences)
  const matches = text.match(/\*?\*?\[?\d+:\d{2}\s*[-–]\s*\d+:\d{2}\]?\*?\*?/g);
  return matches && matches.length >= 2;
}

function parseYouTubeTimecodeScript(text, initials) {
  const lines = text.split('\n');
  const cuts = [];
  let cutNum = 0;
  let currentBlock = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match timecode headers: **[0:00-0:02]** SECTION or [0:00-0:02] SECTION
    const tcMatch = trimmed.match(/\*?\*?\[?(\d+):(\d{2})\s*[-–]\s*(\d+):(\d{2})\]?\*?\*?\s*(.*)/);
    if (tcMatch) {
      // Save previous block
      if (currentBlock && currentBlock.lines.length > 0) {
        cutNum++;
        const desc = currentBlock.lines.join(' ').replace(/\*\*/g, '').replace(/\*\s*/g, '').trim();
        cuts.push({
          number: cutNum,
          slug: `cut${String(cutNum).padStart(3, '0')}`,
          displayId: `${initials}_sc001_cut${String(cutNum).padStart(3, '0')}`,
          description: desc.length > 200 ? desc.slice(0, 197) + '...' : desc,
          type: desc.toLowerCase().includes('vo:') || desc.includes('대사') ? 'dialogue' : 'action',
          duration: currentBlock.duration,
          timeCode: currentBlock.timeCode,
        });
      }

      const startSec = parseInt(tcMatch[1]) * 60 + parseInt(tcMatch[2]);
      const endSec = parseInt(tcMatch[3]) * 60 + parseInt(tcMatch[4]);
      const sectionName = tcMatch[5].replace(/\*\*/g, '').replace(/[()]/g, '').trim();
      currentBlock = {
        timeCode: `${tcMatch[1]}:${tcMatch[2]}-${tcMatch[3]}:${tcMatch[4]}`,
        duration: Math.max(endSec - startSec, 1),
        lines: sectionName ? [sectionName] : [],
      };
      continue;
    }

    // Collect content lines for current block
    if (currentBlock && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      // Clean markdown formatting
      const cleaned = trimmed
        .replace(/^\*\s+/, '') // bullet points
        .replace(/\*\*/g, '') // bold
        .replace(/\*\s*/, '') // italics
        .replace(/^[-·•]\s*/, '') // list markers
        .trim();
      if (cleaned.length > 5) {
        currentBlock.lines.push(cleaned);
      }
    }
  }

  // Save last block
  if (currentBlock && currentBlock.lines.length > 0) {
    cutNum++;
    const desc = currentBlock.lines.join(' ').replace(/\*\*/g, '').trim();
    cuts.push({
      number: cutNum,
      slug: `cut${String(cutNum).padStart(3, '0')}`,
      displayId: `${initials}_sc001_cut${String(cutNum).padStart(3, '0')}`,
      description: desc.length > 200 ? desc.slice(0, 197) + '...' : desc,
      type: desc.toLowerCase().includes('vo:') || desc.includes('대사') ? 'dialogue' : 'action',
      duration: currentBlock.duration,
      timeCode: currentBlock.timeCode,
    });
  }

  if (cuts.length === 0) {
    cuts.push({
      number: 1, slug: 'cut001', displayId: `${initials}_sc001_cut001`,
      description: '(YouTube script - no timecodes detected)', type: 'action', duration: 30,
    });
  }

  return {
    scenes: [{
      number: 1, slug: 'sc001', displayId: `${initials}_sc001`,
      heading: 'YOUTUBE SCRIPT', setting: '', location: 'Various', timeOfDay: '',
      characters: [], summary: cuts.slice(0, 3).map(c => c.description).join('. ').slice(0, 150),
      cuts, cutCount: cuts.length,
    }],
    stats: {
      totalScenes: 1, totalCuts: cuts.length, totalCharacters: 0,
      estimatedMinutes: Math.round(cuts.reduce((s, c) => s + (c.duration || 4), 0) / 60),
      actBreakdown: { act1: 1, act2: 0, act3: 0 },
    },
  };
}
