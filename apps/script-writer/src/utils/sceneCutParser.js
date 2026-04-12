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
  const { projectTitle = 'Untitled', maxDialoguePerCut = 6 } = options;
  const initials = projectTitle
    .split(/\s+/)
    .map(w => (w[0] || '').toUpperCase())
    .join('')
    .slice(0, 5) || 'PRJ';

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
      current.lines.push({ text: trimmed, type: classifyLine(trimmed, lines) });
      if (isCharacterLine(trimmed)) {
        current.characters.add(trimmed.replace(/\s*\(.*?\)\s*/g, '').trim());
      }
    }
  }
  if (current) rawScenes.push(current);

  // Step 2: Convert to structured scenes with cuts
  const scenes = rawScenes.map((raw, idx) => {
    const sceneNum = idx + 1;
    const slug = `sc${String(sceneNum).padStart(3, '0')}`;
    const displayId = `${initials}_${slug}`;
    const cuts = splitIntoCuts(raw.lines, sceneNum, initials, maxDialoguePerCut);

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

function isCharacterLine(text) {
  const cleaned = text.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned) && !cleaned.match(/[.:?!]$/) && cleaned.length < 30) {
    return true;
  }
  // Korean character names: 2-4 chars, no particles
  if (/^[가-힣]{2,4}$/.test(cleaned)) return true;
  return false;
}

// ─── Cut splitting ───

function splitIntoCuts(lineObjs, sceneNum, initials, maxDialogue) {
  const groups = [[]];
  let dialogueCount = 0;

  for (const obj of lineObjs) {
    if (obj.type === 'transition') {
      if (groups[groups.length - 1].length > 0) groups.push([]);
      groups[groups.length - 1].push(obj);
      groups.push([]);
      dialogueCount = 0;
      continue;
    }

    if (obj.type === 'character' && dialogueCount >= maxDialogue) {
      groups.push([]);
      dialogueCount = 0;
    }

    // Count dialogue-like lines (lines following character lines)
    if (obj.type !== 'character' && obj.type !== 'transition' && obj.type !== 'parenthetical') {
      dialogueCount++;
    }

    groups[groups.length - 1].push(obj);
  }

  const nonEmpty = groups.filter(g => g.length > 0);
  if (nonEmpty.length === 0) {
    return [{
      number: 1,
      slug: 'cut001',
      displayId: `${initials}_sc${String(sceneNum).padStart(3, '0')}_cut001`,
      description: '(empty scene)',
      lineCount: 0,
    }];
  }

  return nonEmpty.map((group, i) => {
    const cutNum = i + 1;
    const desc = group.map(l => l.text).join(' ');
    return {
      number: cutNum,
      slug: `cut${String(cutNum).padStart(3, '0')}`,
      displayId: `${initials}_sc${String(sceneNum).padStart(3, '0')}_cut${String(cutNum).padStart(3, '0')}`,
      description: desc.length > 200 ? desc.slice(0, 197) + '...' : desc,
      lineCount: group.length,
    };
  });
}

function buildSummary(lineObjs) {
  const actions = lineObjs.filter(l => l.type === 'action').map(l => l.text).join(' ');
  return actions.length > 150 ? actions.slice(0, 147) + '...' : actions;
}
