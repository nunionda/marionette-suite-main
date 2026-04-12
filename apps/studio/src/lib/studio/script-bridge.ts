/**
 * Script Bridge — converts parsed screenplay elements into Studio scene/cut structure.
 *
 * Handles two input flows (hybrid):
 *   Flow A: script-writer generated screenplay text → parseFountain → ScriptElement[]
 *   Flow B: external PDF/MD import via cine-analysis-system → ScriptElement[]
 *
 * Both flows converge here → SceneMeta[] + CutMeta[]
 *
 * Reference:
 *   - cine-analysis-system/packages/core/src/script/infrastructure/parser.ts (ScriptElement)
 *   - studio/src/lib/studio/types.ts (SceneMeta, CutMeta)
 *   - studio/src/lib/studio/naming.ts (slug/displayId conventions)
 */

import type { SceneMeta, SceneDetail, CutMeta } from './types';
import {
  makeSceneSlug,
  makeCutSlug,
  makeSceneDisplayId,
  makeCutDisplayId,
} from './naming';

// ─── Input type (mirrors cine-analysis-system ScriptElement) ───

export interface ScriptElement {
  type: 'scene_heading' | 'character' | 'dialogue' | 'action' | 'transition' | 'parenthetical';
  text: string;
  metadata?: {
    setting?: string;
    location?: string;
    time?: string;
  };
}

// ─── Intermediate: a scene with its raw elements ───

interface ParsedScene {
  number: number;
  heading: string;
  setting: string;   // INT. / EXT.
  location: string;
  timeOfDay: string;
  elements: ScriptElement[];
  characters: Set<string>;
}

// ─── Configuration ───

export interface BridgeOptions {
  /** Project initials for displayId generation (e.g. 'TDK') */
  initials: string;
  /** Project ID for linking */
  projectId: string;
  /** Sequence/Act assignment strategy */
  sequenceStrategy?: 'auto' | 'none';
  /** Target cut duration in seconds (default: 4) */
  cutDurationSeconds?: 3 | 4 | 5;
  /** Max dialogue lines per cut before splitting (default: 6) */
  maxDialoguePerCut?: number;
}

// ─── Main conversion function ───

/**
 * Convert ScriptElement[] (from Fountain parser) into SceneMeta[] with embedded cuts.
 *
 * Cutting strategy:
 *   1. Each scene_heading starts a new scene
 *   2. Within a scene, cuts are split by:
 *      - Transition elements (CUT TO:, FADE IN:, etc.)
 *      - Character change after dialogue block (new speaker = potential cut point)
 *      - Action blocks > 3 lines (visual shift = cut point)
 *      - Max dialogue lines threshold
 */
export function convertToScenes(
  elements: ScriptElement[],
  options: BridgeOptions,
): SceneDetail[] {
  const {
    initials,
    projectId,
    cutDurationSeconds = 4,
    maxDialoguePerCut = 6,
  } = options;

  // Step 1: Group elements by scene_heading
  const parsedScenes = groupByScene(elements);

  // Step 2: Convert each parsed scene to SceneDetail with cuts
  return parsedScenes.map((parsed) => {
    const sceneSlug = makeSceneSlug(parsed.number);
    const displayId = makeSceneDisplayId(initials, parsed.number);
    const cuts = splitIntoCuts(parsed, initials, cutDurationSeconds, maxDialoguePerCut);

    return {
      id: `${projectId}-${sceneSlug}`,
      slug: sceneSlug,
      displayId,
      number: parsed.number,
      sequenceId: assignSequence(parsed.number, parsedScenes.length),
      title: parsed.heading,
      location: parsed.location || parsed.heading,
      timeOfDay: parsed.timeOfDay || '',
      summary: buildSceneSummary(parsed),
      coverImageUrl: '',
      cutCount: cuts.length,
      completedCutCount: 0,
      status: 'pending' as const,
      characters: Array.from(parsed.characters),
      durationSeconds: cuts.length * cutDurationSeconds,
      cuts,
    };
  });
}

// ─── Step 1: Group elements by scene heading ───

function groupByScene(elements: ScriptElement[]): ParsedScene[] {
  const scenes: ParsedScene[] = [];
  let current: ParsedScene | null = null;

  for (const el of elements) {
    if (el.type === 'scene_heading') {
      if (current) scenes.push(current);
      current = {
        number: scenes.length + 1,
        heading: el.text,
        setting: el.metadata?.setting || '',
        location: el.metadata?.location || '',
        timeOfDay: el.metadata?.time || '',
        elements: [],
        characters: new Set(),
      };
    } else if (current) {
      current.elements.push(el);
      if (el.type === 'character') {
        // Strip parenthetical annotations from character name
        const name = el.text.replace(/\s*\(.*?\)\s*/g, '').trim();
        current.characters.add(name);
      }
    }
    // Elements before first scene heading are ignored (title page, etc.)
  }

  if (current) scenes.push(current);
  return scenes;
}

// ─── Step 2: Split scene elements into cuts ───

function splitIntoCuts(
  scene: ParsedScene,
  initials: string,
  cutDuration: 3 | 4 | 5,
  maxDialogue: number,
): CutMeta[] {
  const cutGroups: ScriptElement[][] = [[]];
  let dialogueCount = 0;
  let lastCharacter = '';

  for (const el of scene.elements) {
    const currentGroup = cutGroups[cutGroups.length - 1]!;

    // Transition always forces a new cut
    if (el.type === 'transition') {
      if (currentGroup.length > 0) cutGroups.push([]);
      cutGroups[cutGroups.length - 1]!.push(el);
      cutGroups.push([]);
      dialogueCount = 0;
      lastCharacter = '';
      continue;
    }

    // Long action block (>3 lines) = visual shift → new cut
    if (el.type === 'action' && el.text.split('\n').length > 3 && currentGroup.length > 0) {
      cutGroups.push([]);
      dialogueCount = 0;
    }

    // Character change after sustained dialogue → potential cut
    if (el.type === 'character') {
      const name = el.text.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (lastCharacter && name !== lastCharacter && dialogueCount >= maxDialogue) {
        cutGroups.push([]);
        dialogueCount = 0;
      }
      lastCharacter = name;
    }

    if (el.type === 'dialogue') {
      dialogueCount++;
      // Max dialogue threshold → force split
      if (dialogueCount > maxDialogue && currentGroup.length > 0) {
        cutGroups.push([]);
        dialogueCount = 1;
      }
    }

    cutGroups[cutGroups.length - 1]!.push(el);
  }

  // Filter out empty groups
  const nonEmpty = cutGroups.filter(g => g.length > 0);

  // Ensure at least 1 cut per scene
  if (nonEmpty.length === 0) {
    return [{
      id: `${scene.number}-cut001`,
      slug: makeCutSlug(1),
      displayId: makeCutDisplayId(initials, scene.number, 1),
      number: 1,
      sceneId: `sc${String(scene.number).padStart(3, '0')}`,
      duration: cutDuration,
      status: 'pending',
      description: scene.heading,
    }];
  }

  return nonEmpty.map((group, i) => {
    const cutNum = i + 1;
    return {
      id: `${scene.number}-${makeCutSlug(cutNum)}`,
      slug: makeCutSlug(cutNum),
      displayId: makeCutDisplayId(initials, scene.number, cutNum),
      number: cutNum,
      sceneId: makeSceneSlug(scene.number),
      duration: cutDuration,
      status: 'pending' as const,
      description: buildCutDescription(group),
    };
  });
}

// ─── Helpers ───

function buildSceneSummary(scene: ParsedScene): string {
  const actions = scene.elements
    .filter(e => e.type === 'action')
    .map(e => e.text)
    .join(' ');
  // First 150 chars of action text as summary
  return actions.length > 150 ? actions.slice(0, 147) + '...' : actions;
}

function buildCutDescription(elements: ScriptElement[]): string {
  const parts: string[] = [];
  for (const el of elements) {
    if (el.type === 'character') parts.push(`[${el.text}]`);
    else if (el.type === 'dialogue') parts.push(el.text);
    else if (el.type === 'action') parts.push(el.text);
  }
  const joined = parts.join(' ');
  return joined.length > 200 ? joined.slice(0, 197) + '...' : joined;
}

function assignSequence(sceneNumber: number, totalScenes: number): string {
  // Simple 3-act structure: Act1 (25%), Act2 (50%), Act3 (25%)
  const ratio = sceneNumber / totalScenes;
  if (ratio <= 0.25) return 'act-1';
  if (ratio <= 0.75) return 'act-2';
  return 'act-3';
}

// ─── Fountain parser (lightweight, for self-contained use in studio) ───
// Full parser lives in cine-analysis-system. This is a minimal version
// for direct text input without requiring the external package.

const SCENE_HEADING_RE = /^((INT\.|EXT\.|INT|EXT|EST|I\/E)[. ]|(S#|S\/|씬)\s*\d+|제\s*\d+\s*경|\d+\.\s+)/i;
const TRANSITION_RE = /^(FADE IN:|FADE OUT\.|CUT\s+TO\b|디졸브|암전)/i;

export function parseScreenplayText(text: string): ScriptElement[] {
  const lines = text.split('\n');
  const elements: ScriptElement[] = [];
  let currentCharacter = '';

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line) { currentCharacter = ''; continue; }

    if (SCENE_HEADING_RE.test(line)) {
      const match = line.match(/^(INT\.|EXT\.|INT|EXT|EST|I\/E)\s+(.*?)(?:\s*-\s*(.*))?$/i);
      elements.push({
        type: 'scene_heading',
        text: line,
        metadata: {
          setting: match?.[1]?.trim() || '',
          location: match?.[2]?.trim() || '',
          time: match?.[3]?.trim() || '',
        },
      });
      currentCharacter = '';
    } else if (TRANSITION_RE.test(line)) {
      elements.push({ type: 'transition', text: line });
      currentCharacter = '';
    } else if (line.startsWith('(') && line.endsWith(')')) {
      elements.push({ type: 'parenthetical', text: line });
    } else if (
      line === line.toUpperCase() &&
      /[A-Z]/.test(line) &&
      !line.match(/[.:?!]$/) &&
      line.length < 30
    ) {
      elements.push({ type: 'character', text: line });
      currentCharacter = line;
    } else if (currentCharacter) {
      elements.push({ type: 'dialogue', text: line });
    } else {
      elements.push({ type: 'action', text: line });
    }
  }

  return elements;
}

// ─── Convenience: text → scenes in one call ───

export function screenplayToScenes(
  screenplayText: string,
  options: BridgeOptions,
): SceneDetail[] {
  const elements = parseScreenplayText(screenplayText);
  return convertToScenes(elements, options);
}

// ─── Stats helper for UI ───

export interface SceneBreakdownStats {
  totalScenes: number;
  totalCuts: number;
  totalCharacters: number;
  estimatedDurationMinutes: number;
  actBreakdown: { act1: number; act2: number; act3: number };
}

export function calculateStats(scenes: SceneDetail[]): SceneBreakdownStats {
  const totalCuts = scenes.reduce((sum, s) => sum + s.cuts.length, 0);
  const allChars = new Set(scenes.flatMap(s => s.characters));
  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return {
    totalScenes: scenes.length,
    totalCuts,
    totalCharacters: allChars.size,
    estimatedDurationMinutes: Math.round(totalDuration / 60),
    actBreakdown: {
      act1: scenes.filter(s => s.sequenceId === 'act-1').length,
      act2: scenes.filter(s => s.sequenceId === 'act-2').length,
      act3: scenes.filter(s => s.sequenceId === 'act-3').length,
    },
  };
}
