/**
 * Text Document Design Generator — Sprint 2 Scope C
 *
 * Produces structured JSON documents for Track A text-output Design nodes
 * (character_arc, lookbook, visual_world, color_script, set_dressing,
 * shot_list, art_bible).
 *
 * Provider chain (FREE tier only, per LLM API policy):
 *   1. Direct Gemini Free
 *   2. Groq (llama-3.3-70b-versatile)
 *   3. OpenRouter (google/gemini-2.0-flash-001)
 *
 * Mirrors the /refine-image-prompt fallback ladder in ai.ts — deliberately
 * not DRY'd further because each callsite has slightly different parsing
 * needs. This helper is just for structured-JSON design document output.
 */

const KEYS = {
  GEMINI: process.env.GEMINI_API_KEY || '',
  GROQ: process.env.GROQ_API_KEY || '',
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
};

export interface TextGenResult {
  success: boolean;
  text?: string;
  provider?: string;
  error?: string;
}

/**
 * Generate plain text via free-tier provider chain.
 * Returns the raw text on success; the caller is responsible for parsing.
 */
export async function generateText(
  prompt: string,
  system?: string,
): Promise<TextGenResult> {
  const sysPrompt = system || 'You are a precise film pre-production assistant. Respond in the language of the user prompt.';

  // 1. Direct Gemini Free
  if (KEYS.GEMINI) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEYS.GEMINI}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: sysPrompt }] },
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: AbortSignal.timeout(60_000),
        },
      );
      if (res.ok) {
        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { success: true, text, provider: 'gemini-free' };
      }
      console.warn('[textDesigner] Gemini free failed, trying Groq...');
    } catch (e: any) {
      console.warn('[textDesigner] Gemini error:', e.message);
    }
  }

  // 2. Groq free tier
  if (KEYS.GROQ) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEYS.GROQ}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) {
        const data: any = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { success: true, text, provider: 'groq' };
      }
      console.warn('[textDesigner] Groq failed, trying OpenRouter...');
    } catch (e: any) {
      console.warn('[textDesigner] Groq error:', e.message);
    }
  }

  // 3. OpenRouter free models
  if (KEYS.OPENROUTER) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEYS.OPENROUTER}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Cine Script Writer',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) {
        const data: any = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { success: true, text, provider: 'openrouter' };
      }
    } catch (e: any) {
      console.warn('[textDesigner] OpenRouter error:', e.message);
    }
  }

  return {
    success: false,
    error: 'All free-tier text providers failed or are unconfigured',
  };
}

/**
 * Extract the first JSON object/array from an LLM response.
 * Handles:
 *   - ```json\n{...}\n``` code fences
 *   - Bare JSON anywhere in the response
 *   - Plain objects without code fences
 */
export function extractJson(text: string): any | null {
  const trimmed = text.trim();

  // Try fenced ```json blocks first
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      /* fall through */
    }
  }

  // Try raw JSON (first { to last })
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      /* fall through */
    }
  }

  // Try array form
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
    } catch {
      /* fall through */
    }
  }

  return null;
}

// ─── Per-node specialist personas + output schemas ───

interface NodeSpec {
  role: string;
  schema: string;
  example?: string;
}

export const TEXT_DESIGN_NODE_SPECS: Record<string, NodeSpec> = {
  character_arc: {
    role: 'Film script analyst specializing in character psychology and emotional arc transformation. Think like Robert McKee / John Truby.',
    schema: `{
  "characters": [
    {
      "name": "string (Korean or original name from script)",
      "role": "protagonist | antagonist | supporting",
      "wound": "string — the formative psychological wound",
      "externalGoal": "string — what the character consciously wants",
      "internalNeed": "string — what the character actually needs to heal",
      "arc": [
        { "act": 1, "state": "emotional state at act start", "shift": "what event triggers change" },
        { "act": 2, "state": "...", "shift": "..." },
        { "act": 3, "state": "...", "shift": "resolution" }
      ],
      "relationships": [
        { "other": "other character name", "dynamic": "brief description of their bond" }
      ]
    }
  ]
}`,
  },
  lookbook: {
    role: 'Film production designer crafting an investor-ready lookbook (tone document). Think Hannah Beachler / Nathan Crowley.',
    schema: `{
  "tone": ["single-word tone descriptor", "..."],
  "palettes": [
    { "name": "palette name", "hexes": ["#RRGGBB", "..."] }
  ],
  "references": [
    { "artist": "name or film title", "work": "specific work", "why": "what this reference contributes" }
  ],
  "sections": [
    { "title": "section title (e.g. 'Opening World')", "description": "2-3 sentence mood description" }
  ]
}`,
  },
  visual_world: {
    role: 'Visual Development Artist defining the film\'s visual grammar. Think Syd Mead / Dylan Cole.',
    schema: `{
  "palette": [
    { "hex": "#RRGGBB", "role": "primary | secondary | accent | shadow", "emotion": "what this color conveys" }
  ],
  "keyElements": ["iconic visual motif", "..."],
  "tone": "single paragraph describing the overall visual tone",
  "visualGrammar": "single paragraph describing rules (framing, lens, light, texture)"
}`,
  },
  color_script: {
    role: 'Color scripter in the Pixar tradition — mapping scene emotion to color progression. Think Nate Wragg / Lou Romano.',
    schema: `{
  "scenes": [
    {
      "sceneNumber": 1,
      "dominantColor": "#RRGGBB",
      "accentColor": "#RRGGBB",
      "emotion": "primary emotion the scene should evoke",
      "transition": "how color shifts from the previous scene"
    }
  ]
}`,
  },
  set_dressing: {
    role: 'Set Decorator responsible for filling the physical space with character-revealing objects.',
    schema: `{
  "sets": [
    {
      "setName": "location name",
      "hero": ["key object that reveals character", "..."],
      "background": ["supporting atmospheric objects", "..."],
      "atmosphere": "single sentence on mood the dressing creates"
    }
  ]
}`,
  },
  shot_list: {
    role: '1st AD / DP compiling a shot list for on-set execution.',
    schema: `{
  "shots": [
    {
      "sceneNumber": 1,
      "shotNumber": "1A",
      "angle": "wide | medium | close-up | extreme close-up | over-shoulder | ...",
      "lens": "focal length in mm or equivalent description",
      "movement": "static | dolly | handheld | crane | steadicam",
      "note": "brief direction note"
    }
  ]
}`,
  },
  art_bible: {
    role: 'Production designer synthesizing all prior design documents into a single reference bible.',
    schema: `{
  "summary": "one paragraph summary of the film's overall visual approach",
  "chapters": [
    { "title": "World", "content": "synthesized notes from lookbook + visual_world" },
    { "title": "Characters", "content": "synthesized notes from character_design + costume + makeup_hair" },
    { "title": "Spaces", "content": "synthesized notes from set_design + set_dressing + graphic_design" },
    { "title": "Camera", "content": "synthesized notes from storyboard + shot_list" },
    { "title": "Color Progression", "content": "synthesized notes from color_script" }
  ]
}`,
  },
  // ─── Sprint 6 AI Audio specs (Charter #49, #51, #52) ───
  // These nodes produce structured audio-design specifications that external
  // TTS / Foley / music-gen tools (Coqui, Bark, Suno, MusicGen) can consume.
  // Per 무료 LLM API 정책: no audio is synthesized server-side; we only
  // generate the spec. The spec is the valuable artifact — it's what an
  // audio engineer would hand to a producer or a script for a generator.
  adr_dubbing: {
    role: 'Supervising sound editor producing an ADR (Automated Dialogue Replacement) and dubbing plan. Think Skip Lievsay / Ren Klyce workflow — reasoning about line-by-line lip-sync, noisy-location fixes, and international dub constraints.',
    schema: `{
  "lines": [
    {
      "sceneNumber": 1,
      "character": "Korean or original character name from screenplay",
      "originalLine": "dialogue text in source language",
      "reason": "ambient_noise | off_mic | performance_revision | international_dub | pickup_shot",
      "priority": "critical | normal | optional",
      "lipSync": "strict | moderate | loose (how tight the lip match must be)",
      "emotion": "one-word emotion tag the VO must convey",
      "referenceActor": "name of original actor (for voice-matching in same language)",
      "targetLanguages": ["KR", "EN", "JA", ...]
    }
  ],
  "totalLines": 0,
  "sessionPlanHours": 0,
  "notes": "one-paragraph summary of ADR strategy (in original language)"
}`,
  },
  foley: {
    role: 'Foley supervisor producing a per-scene Foley cue sheet. Think Gary Rydstrom workflow — categorizing every on-screen sound into footsteps, cloth, props, and specific hero sounds that need to be performed or designed.',
    schema: `{
  "scenes": [
    {
      "sceneNumber": 1,
      "cues": [
        {
          "cueId": "S1-F01",
          "category": "footsteps | cloth | props | specific",
          "description": "what the audience sees/should hear (e.g. 'keys dropping onto marble counter')",
          "surface": "e.g. 'polished marble' or 'wet asphalt' (for footsteps)",
          "pace": "slow | walking | running | frantic",
          "character": "character name or 'ambient'",
          "recordingHint": "practical suggestion for the Foley artist (e.g. 'record keys on ceramic tile for metallic ring')"
        }
      ]
    }
  ],
  "assetLibraryTags": ["surface tags to pull from library, e.g. 'marble_pad', 'leather_jacket'"],
  "summary": "one-paragraph Foley strategy (in original language)"
}`,
  },
  music_composition: {
    role: 'Film composer drafting a score brief and cue-sheet. Think Jóhann Jóhannsson / Mica Levi workflow — defining thematic material, instrumentation, and per-scene cue placement with emotional intent.',
    schema: `{
  "themes": [
    {
      "name": "theme name (e.g. 'Decoder Motif')",
      "associatedCharacter": "character this theme belongs to (or 'world' / 'antagonist' / 'love')",
      "instrumentation": ["primary instruments, e.g. 'solo cello', 'prepared piano', 'synth pad'"],
      "mode": "major | minor | modal | atonal | microtonal",
      "tempoBpm": 0,
      "emotionalFunction": "one sentence on what this theme does dramatically"
    }
  ],
  "cues": [
    {
      "cueId": "M1",
      "sceneNumber": 1,
      "startTiming": "scene-in / 0:00 / on dialogue start",
      "durationSec": 0,
      "themes": ["names of themes referenced"],
      "intensity": 1,
      "direction": "one-sentence instruction to the composer (e.g. 'slow pulse, sub-bass only, no melodic statement until hero enters')"
    }
  ],
  "overallTone": "one-paragraph score brief (in original language)",
  "referenceScores": ["film title — composer", "..."]
}`,
  },
  // ─── Sprint 3 (#24.10 & #28) ─────────────────────────────────────────────
  lighting_design: {
    role: 'Gaffer / Director of Photography planning scene-by-scene lighting design. Think Roger Deakins / Hoyte van Hoytema — motivated practical sources, color temperature, intensity, and equipment lists.',
    schema: `{
  "scenes": [
    {
      "sceneNumber": 1,
      "setting": "INT. or EXT. — LOCATION NAME",
      "timeOfDay": "DAY | NIGHT | MAGIC HOUR | OVERCAST | DAWN | DUSK",
      "keySource": "type of dominant light source (e.g. 'practical window', 'LED panel', 'HMI through diffusion')",
      "colorTemp": "kelvin value or description (e.g. '3200K warm tungsten', '5600K daylight')",
      "mood": "one-word emotional intent (e.g. 'oppressive', 'ethereal', 'clinical')",
      "equipment": ["lighting fixtures and modifiers (e.g. 'ARRI SkyPanel S60-C', '12x12 silent grid'"],
      "practicals": ["on-screen practical lights visible to camera"],
      "notes": "brief direction for the gaffer and best boy"
    }
  ],
  "overallStrategy": "one paragraph — the film's lighting language and visual philosophy"
}`,
  },
  vfx_previs: {
    role: 'VFX Supervisor creating a previs breakdown for CG/composite shots. Think ILM / Weta Digital workflow — shot-level VFX requirements, complexity tiers, and technical notes for the downstream pipeline.',
    schema: `{
  "shots": [
    {
      "sceneNumber": 1,
      "shotId": "string identifier (e.g. 'SC01-VFX-01')",
      "type": "composite | full_cg | environment_extension | creature | simulation | matte_painting | de_aging | crowd_simulation",
      "complexity": "trivial | moderate | complex | hero",
      "description": "what the audience sees on screen",
      "elements": ["VFX elements required (e.g. 'CG dragon', 'city destruction sim', 'practical + CG hybrid fire')"],
      "referenceStyle": "studio or film reference (e.g. 'ILM — The Mandalorian LED wall', 'Weta — LOTR Helm's Deep crowd sim')",
      "notes": "technical notes for the VFX team and pipeline"
    }
  ],
  "totalShotCount": 0,
  "estimatedDays": 0,
  "overallStrategy": "one paragraph — the VFX approach, technology choices, and pipeline philosophy for this production"
}`,
  },
};

export interface DesignDocumentResult {
  success: boolean;
  doc?: any;
  raw?: string;
  provider?: string;
  error?: string;
}

/**
 * Generate a structured JSON design document for a text-output Track A node.
 *
 * @param nodeId One of TEXT_DESIGN_NODE_SPECS keys.
 * @param context Relevant prior inputs: scene list, character list, screenplay excerpt,
 *                or synthesized prior-asset summaries (for art_bible).
 */
export async function generateDesignDocument(
  nodeId: string,
  context: string,
): Promise<DesignDocumentResult> {
  const spec = TEXT_DESIGN_NODE_SPECS[nodeId];
  if (!spec) {
    return { success: false, error: `Unknown text design node: ${nodeId}` };
  }

  const system = `You are a ${spec.role}

OUTPUT RULES:
1. Respond with ONLY a JSON object matching the schema below.
2. Wrap your JSON in a \`\`\`json ... \`\`\` fenced code block.
3. No prose outside the fence. No schema echoing. No markdown inside values.
4. Use the language of the input (Korean input → Korean values).

SCHEMA:
${spec.schema}`;

  const prompt = `Based on the following context, produce the design document.

CONTEXT:
${context}`;

  const gen = await generateText(prompt, system);
  if (!gen.success || !gen.text) {
    return { success: false, error: gen.error || 'Text generation failed' };
  }

  const doc = extractJson(gen.text);
  if (!doc) {
    return {
      success: false,
      raw: gen.text,
      provider: gen.provider,
      error: 'LLM response did not contain parseable JSON',
    };
  }

  return { success: true, doc, raw: gen.text, provider: gen.provider };
}
