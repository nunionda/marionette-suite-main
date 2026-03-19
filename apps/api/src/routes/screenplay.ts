import { Hono } from "hono"
import { prisma } from "@marionette/db"
import { AIGateway } from "@marionette/ai-gateway"
import { GeminiProvider } from "@marionette/ai-gateway/providers/gemini.js"
import { NotFoundError, ValidationError } from "../middleware/error-handler.ts"

export const screenplayRoutes = new Hono()

// ─── Singleton AI gateway ───

let gateway: AIGateway | null = null

function getGateway(): AIGateway {
  if (!gateway) {
    gateway = new AIGateway()
    gateway.register("gemini", new GeminiProvider(), true)
  }
  return gateway
}

// ─── System prompts ───

const OUTLINE_SYSTEM_PROMPT = `You are a senior screenwriter creating an 8-sequence film structure.
Given the idea, create a comprehensive outline with:
- Title and logline (use Antigravity High-Concept Formula: ironic setup + tactical detail + universal emotion)
- Genre and tone
- 8 sequences with: sequence name, scene range, key events, turning point
- Core thematic elements
Write in Korean. Format as markdown.`

const CHARACTER_SYSTEM_PROMPT = `You are a character designer for a professional film production.
Based on the outline, create 6-9 main characters. For each:
- name, age, role, cover (public identity)
- persona, motivation, tone (speech style)
- economic_bg, speech_habit
- casting: { actor: "suggestion", reason: "why" }
Return as JSON array.`

const TREATMENT_SYSTEM_PROMPT = `You are a screenplay treatment writer. Based on the outline and characters,
generate scene-by-scene logs for all 8 sequences (~120 scenes total).
Format: S#N. Location - Time: One-line summary of key visual action.
Organize by sequence. Write in Korean.`

const DRAFT_SYSTEM_PROMPT = `You are a professional screenwriter writing in Hollywood Master Scene Format.

CRITICAL: Scene numbers in the screenplay MUST be sequential starting from S#1.
The scene logs from treatment are reference material only — do NOT use their numbering.
Renumber all scenes sequentially: S#1, S#2, S#3, etc.

Format each scene as:
### S#N. LOCATION - TIME
(Camera direction and action in parentheses)
CHARACTER NAME
Dialogue in Korean matching character's tone.

Write exactly 5 scenes per batch. Each scene should be detailed with:
- Clear slug line (location + time)
- Visual action descriptions in parentheses
- Character names in CAPS
- Natural Korean dialogue matching each character's speech style`

// ─── Helper: get or create screenplay record ───

async function getOrCreateScreenplay(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    throw new NotFoundError("Project", projectId)
  }

  const existing = await prisma.screenplay.findUnique({ where: { projectId } })
  if (existing) {
    return existing
  }

  return prisma.screenplay.create({
    data: { projectId },
  })
}

// ─── Routes ───

// GET /:projectId — get or create screenplay record
screenplayRoutes.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    return c.json(screenplay)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch screenplay"
    console.error(`[screenplay GET] ${message}`)
    return c.json({ error: message }, 500)
  }
})

// POST /:projectId/outline — AI generates 8-sequence outline + logline
screenplayRoutes.post("/:projectId/outline", async (c) => {
  const projectId = c.req.param("projectId")

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return c.json({ error: `Project '${projectId}' not found` }, 404)
    }

    const idea = project.idea || project.title
    if (!idea) {
      return c.json({ error: "Project must have an idea or title to generate an outline" }, 400)
    }

    const gw = getGateway()
    const outline = await gw.text(
      `Create a full 8-sequence film outline for this idea:\n\n${idea}`,
      {
        provider: "gemini",
        systemPrompt: OUTLINE_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    )

    if (!outline || outline.trim().length === 0) {
      return c.json({ error: "AI returned empty outline. Please try again." }, 502)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { outline, currentStep: Math.max(screenplay.currentStep, 1) },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay outline] ${message}`)
    return c.json({ error: `Outline generation failed: ${message}` }, 500)
  }
})

// PUT /:projectId/outline — save edited outline
screenplayRoutes.put("/:projectId/outline", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const body = await c.req.json<{ outline: string }>()

    if (!body.outline || typeof body.outline !== "string") {
      return c.json({ error: "outline is required and must be a string" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { outline: body.outline },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay outline PUT] ${message}`)
    return c.json({ error: `Save failed: ${message}` }, 500)
  }
})

// POST /:projectId/characters — AI generates characters from outline
screenplayRoutes.post("/:projectId/characters", async (c) => {
  const projectId = c.req.param("projectId")

  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    if (!screenplay.outline) {
      return c.json({ error: "Outline must exist before generating characters" }, 400)
    }

    const gw = getGateway()
    const charactersRaw = await gw.text(
      `Based on this outline, create the main characters:\n\n${screenplay.outline}`,
      {
        provider: "gemini",
        systemPrompt: CHARACTER_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    )

    if (!charactersRaw || charactersRaw.trim().length === 0) {
      return c.json({ error: "AI returned empty character data. Please try again." }, 502)
    }

    // Attempt to parse as JSON; store raw string if parsing fails
    let characters: unknown
    try {
      const jsonMatch = charactersRaw.match(/\[[\s\S]*\]/)
      characters = jsonMatch ? JSON.parse(jsonMatch[0]) : charactersRaw
    } catch {
      characters = charactersRaw
    }

    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: {
        characters: characters as Record<string, unknown> | Record<string, unknown>[],
        currentStep: Math.max(screenplay.currentStep, 2),
      },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay characters] ${message}`)
    return c.json({ error: `Character generation failed: ${message}` }, 500)
  }
})

// PUT /:projectId/characters — save edited characters
screenplayRoutes.put("/:projectId/characters", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const body = await c.req.json<{ characters: unknown }>()

    if (!body.characters) {
      return c.json({ error: "characters is required" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { characters: body.characters as Record<string, unknown> | Record<string, unknown>[] },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay characters PUT] ${message}`)
    return c.json({ error: `Save failed: ${message}` }, 500)
  }
})

// POST /:projectId/treatment/:sequence — AI generates scene logs for one sequence
screenplayRoutes.post("/:projectId/treatment/:sequence", async (c) => {
  const projectId = c.req.param("projectId")
  const sequence = parseInt(c.req.param("sequence"))

  if (isNaN(sequence) || sequence < 1 || sequence > 8) {
    return c.json({ error: "sequence must be a number between 1 and 8" }, 400)
  }

  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    if (!screenplay.outline) {
      return c.json({ error: "Outline must exist before generating treatment" }, 400)
    }
    if (!screenplay.characters) {
      return c.json({ error: "Characters must exist before generating treatment" }, 400)
    }

    const charactersText = typeof screenplay.characters === "string"
      ? screenplay.characters
      : JSON.stringify(screenplay.characters, null, 2)

    const gw = getGateway()
    const response = await gw.text(
      `Generate scene-by-scene logs for SEQUENCE ${sequence} ONLY based on:

## Outline
${screenplay.outline}

## Characters
${charactersText}

Generate ~15 scenes for Sequence ${sequence} only. Number scenes sequentially starting from ${(sequence - 1) * 15 + 1}.`,
      {
        provider: "gemini",
        systemPrompt: `You are a screenplay treatment writer. Generate scene-by-scene logs for ONE sequence only (~15 scenes).

Return a JSON array where each element has:
- scene_number: integer (sequential)
- sequence: ${sequence}
- sequence_title: string (name of this sequence from the outline)
- location: string (scene location in Korean)
- time_of_day: string (낮/밤/새벽/저녁/심야)
- summary: string (one-line visual action summary in Korean)
- breakdown: { cast: string[], props: string[], location: string[] }

Return ONLY the JSON array. No markdown wrapping.`,
        temperature: 0.5,
      },
    )

    if (!response || response.trim().length === 0) {
      return c.json({ error: "AI returned empty scene logs. Please try again." }, 502)
    }

    // Parse JSON array from response
    let newScenes: Record<string, unknown>[]
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return c.json({ error: "AI response was not a valid JSON array" }, 502)
      }
      newScenes = JSON.parse(jsonMatch[0]) as Record<string, unknown>[]
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 502)
    }

    // Merge with existing scene logs: replace scenes from this sequence, keep others
    let existingScenes: Record<string, unknown>[] = []
    if (screenplay.sceneLogs) {
      try {
        existingScenes = JSON.parse(screenplay.sceneLogs) as Record<string, unknown>[]
      } catch {
        existingScenes = []
      }
    }

    const otherScenes = existingScenes.filter(
      (s) => (s as { sequence?: number }).sequence !== sequence
    )
    const mergedScenes = [...otherScenes, ...newScenes].sort(
      (a, b) => ((a as { scene_number?: number }).scene_number ?? 0) - ((b as { scene_number?: number }).scene_number ?? 0)
    )

    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: {
        sceneLogs: JSON.stringify(mergedScenes),
        currentStep: Math.max(screenplay.currentStep, 3),
      },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay treatment seq${sequence}] ${message}`)
    return c.json({ error: `Treatment generation failed: ${message}` }, 500)
  }
})

// PUT /:projectId/treatment-text — save edited scene logs as text
screenplayRoutes.put("/:projectId/treatment-text", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const body = await c.req.json<{ sceneLogs: string }>()
    if (!body.sceneLogs || typeof body.sceneLogs !== "string") {
      return c.json({ error: "sceneLogs is required and must be a string" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { sceneLogs: body.sceneLogs },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay treatment-text PUT] ${message}`)
    return c.json({ error: `Save failed: ${message}` }, 500)
  }
})

// POST /:projectId/draft — AI writes 5 scenes of screenplay
screenplayRoutes.post("/:projectId/draft", async (c) => {
  const projectId = c.req.param("projectId")

  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    if (!screenplay.outline) {
      return c.json({ error: "Outline must exist before generating draft" }, 400)
    }
    if (!screenplay.characters) {
      return c.json({ error: "Characters must exist before generating draft" }, 400)
    }
    if (!screenplay.sceneLogs) {
      return c.json({ error: "Scene logs must exist before generating draft" }, 400)
    }

    const charactersText = typeof screenplay.characters === "string"
      ? screenplay.characters
      : JSON.stringify(screenplay.characters, null, 2)

    const existingDraft = screenplay.draft ?? ""
    const draftVersion = screenplay.draftVersion

    const gw = getGateway()
    const newScenes = await gw.text(
      `Write scenes S#${(draftVersion - 1) * 5 + 1} through S#${draftVersion * 5} of the screenplay.

IMPORTANT: Scene numbers MUST be S#${(draftVersion - 1) * 5 + 1}, S#${(draftVersion - 1) * 5 + 2}, S#${(draftVersion - 1) * 5 + 3}, S#${(draftVersion - 1) * 5 + 4}, S#${draftVersion * 5}.

## Outline
${screenplay.outline}

## Characters
${charactersText}

## Scene Logs (reference only — do NOT use these scene numbers)
${screenplay.sceneLogs}

## Previously Written Draft
${existingDraft || "(No scenes written yet — start from S#1)"}`,
      {
        provider: "gemini",
        systemPrompt: DRAFT_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    )

    if (!newScenes || newScenes.trim().length === 0) {
      return c.json({ error: "AI returned empty draft scenes. Please try again." }, 502)
    }

    const combinedDraft = existingDraft
      ? `${existingDraft}\n\n${newScenes}`
      : newScenes

    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: {
        draft: combinedDraft,
        draftVersion: draftVersion + 1,
        currentStep: Math.max(screenplay.currentStep, 4),
      },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay draft] ${message}`)
    return c.json({ error: `Draft generation failed: ${message}` }, 500)
  }
})

// POST /:projectId/apply-feedback — AI revises draft based on feedback
screenplayRoutes.post("/:projectId/apply-feedback", async (c) => {
  const projectId = c.req.param("projectId")

  try {
    const body = await c.req.json<{ feedback: string }>()
    if (!body.feedback?.trim()) {
      return c.json({ error: "feedback is required" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    if (!screenplay.draft) {
      return c.json({ error: "Draft must exist before applying feedback" }, 400)
    }

    const charactersText = typeof screenplay.characters === "string"
      ? screenplay.characters
      : JSON.stringify(screenplay.characters, null, 2)

    // Extract first 10 scenes for context (to avoid token limit)
    const draftLines = screenplay.draft.split("\n")
    const draftPreview = draftLines.slice(0, 200).join("\n")

    const gw = getGateway()
    const revisionNotes = await gw.text(
      `Based on this feedback, identify which scenes need changes and provide specific revision instructions.

## Feedback
${body.feedback}

## Draft Preview (first scenes)
${draftPreview}

## Characters
${charactersText}

Return a JSON object with:
- "scenes_to_revise": array of scene numbers (integers) that need changes
- "revision_instructions": specific instructions for each scene
- "general_notes": overall feedback summary

Return ONLY JSON.`,
      {
        provider: "gemini",
        systemPrompt: "You are a screenplay editor analyzing feedback. Identify affected scenes and provide revision instructions. Return JSON only.",
        temperature: 0.5,
      },
    )

    // Store feedback as a note and advance — actual revision happens per-scene
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: {
        draftVersion: screenplay.draftVersion + 1,
      },
    })

    // Parse revision notes for response
    let parsedNotes = { feedback: body.feedback, ai_analysis: revisionNotes }
    try {
      const jsonMatch = revisionNotes.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsedNotes = { feedback: body.feedback, ai_analysis: JSON.parse(jsonMatch[0]) }
    } catch { /* use raw text */ }

    return c.json({ ...updated, revision: parsedNotes })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay apply-feedback] ${message}`)
    return c.json({ error: `Feedback application failed: ${message}` }, 500)
  }
})

// PUT /:projectId/draft — save edited draft
screenplayRoutes.put("/:projectId/draft", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const body = await c.req.json<{ draft: string }>()

    if (!body.draft || typeof body.draft !== "string") {
      return c.json({ error: "draft is required and must be a string" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { draft: body.draft },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay draft PUT] ${message}`)
    return c.json({ error: `Save failed: ${message}` }, 500)
  }
})

// DELETE /:projectId/draft — reset draft (start over)
screenplayRoutes.delete("/:projectId/draft", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { draft: null, draftVersion: 1 },
    })
    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay draft DELETE] ${message}`)
    return c.json({ error: `Reset failed: ${message}` }, 500)
  }
})

// PATCH /:projectId/step — update current step (1-6)
screenplayRoutes.patch("/:projectId/step", async (c) => {
  const projectId = c.req.param("projectId")
  try {
    const body = await c.req.json<{ step: number }>()

    if (typeof body.step !== "number" || body.step < 1 || body.step > 6) {
      return c.json({ error: "step must be a number between 1 and 6" }, 400)
    }

    const screenplay = await getOrCreateScreenplay(projectId)
    const updated = await prisma.screenplay.update({
      where: { id: screenplay.id },
      data: { currentStep: body.step },
    })

    return c.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[screenplay step] ${message}`)
    return c.json({ error: `Step update failed: ${message}` }, 500)
  }
})

// ─── Direction Plan: System prompts ───

const SEQUENCE_ANALYSIS_PROMPT = `You are a Film Script Analyzer. Parse the screenplay draft for the specified sequence and extract scene information.

For each scene in this sequence, extract:
- scene_number: integer
- sequence: the sequence number
- setting: location in Korean
- time_of_day: 낮/밤/새벽/저녁/심야
- camera_angle: the primary camera angle
- action_description: 2-3 sentence visual action summary in Korean
- dialogue: most important dialogue line (Korean), or null

Return ONLY a JSON array of scene objects.`

const CUT_DESIGN_PROMPT = `You are a Cinematographer and Shot Designer. Design 3-5 camera cuts for this scene.

For each cut:
- cut_number: integer (1-based within scene)
- shot_type: WIDE SHOT, MEDIUM SHOT, CLOSE UP, EXTREME CLOSE UP, OVER THE SHOULDER, TWO SHOT, etc.
- camera_angle: Eye level, High angle, Low angle, Bird's eye, Dutch angle, Worm's eye
- camera_movement: Static, Pan left/right, Tilt up/down, Dolly in/out, Crane up/down, Steadicam follow, Handheld
- duration: integer seconds (3-8)
- subject: what/who is in frame (English)
- action: what happens in this cut (English)
- image_prompt: "" (empty, generated in Stage 3)
- video_prompt: "" (empty, generated in Stage 3)

Return ONLY a JSON array of cut objects.`

const PROMPT_GENERATION_PROMPT = `You are a VFX Supervisor creating AI generation prompts.

Generate two prompts:
1. image_prompt: 5-part English prompt: [Subject + Action] + [Environment/Background] + [Camera angle/Composition] + [Lighting/Atmosphere] + [Visual Style]
2. video_prompt: 6-part English prompt: [Camera movement/Shot] + [Subject] + [Action] + [Environment] + [Style/Mood] + [Audio: SFX/BGM description]

Return a JSON object: { "image_prompt": "...", "video_prompt": "..." }`

// ─── Direction Plan: Routes ───

// POST /:projectId/direction-plan/sequence/:seq — Stage 1: Analyze sequence → Scene[] basic info
screenplayRoutes.post("/:projectId/direction-plan/sequence/:seq", async (c) => {
  const projectId = c.req.param("projectId")
  const seq = parseInt(c.req.param("seq"))

  if (isNaN(seq) || seq < 1 || seq > 8) {
    return c.json({ error: "seq must be a number between 1 and 8" }, 400)
  }

  try {
    const screenplay = await getOrCreateScreenplay(projectId)
    if (!screenplay.outline) {
      return c.json({ error: "Outline must exist before analyzing sequences" }, 400)
    }
    if (!screenplay.draft) {
      return c.json({ error: "Draft must exist before analyzing sequences" }, 400)
    }

    const gw = getGateway()
    const response = await gw.text(
      `Analyze SEQUENCE ${seq} from the following screenplay draft and extract scene information.

## Outline
${screenplay.outline}

## Draft
${screenplay.draft}

Extract all scenes belonging to Sequence ${seq}.`,
      {
        provider: "gemini",
        systemPrompt: SEQUENCE_ANALYSIS_PROMPT,
        temperature: 0.5,
      },
    )

    if (!response || response.trim().length === 0) {
      return c.json({ error: "AI returned empty analysis. Please try again." }, 502)
    }

    // Parse JSON array from response
    let newScenes: Record<string, unknown>[]
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return c.json({ error: "AI response was not a valid JSON array" }, 502)
      }
      newScenes = JSON.parse(jsonMatch[0]) as Record<string, unknown>[]
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 502)
    }

    // Merge into project.directionPlan
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return c.json({ error: `Project '${projectId}' not found` }, 404)
    }

    const directionPlan = (project.directionPlan as Record<string, unknown> | null) ?? {
      title: "",
      logline: "",
      genre: "",
      target_audience: "",
      planning_intent: "",
      worldview_settings: "",
      character_settings: "",
      global_audio_concept: "",
      scenes: [],
    }

    const existingScenes = (directionPlan.scenes as Record<string, unknown>[]) ?? []
    const otherScenes = existingScenes.filter(
      (s) => (s as { sequence?: number }).sequence !== seq
    )
    const mergedScenes = [...otherScenes, ...newScenes].sort(
      (a, b) =>
        ((a as { scene_number?: number }).scene_number ?? 0) -
        ((b as { scene_number?: number }).scene_number ?? 0)
    )
    directionPlan.scenes = mergedScenes

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { directionPlan: directionPlan as Record<string, unknown> },
    })

    return c.json({ directionPlan: updatedProject.directionPlan })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[direction-plan sequence ${seq}] ${message}`)
    return c.json({ error: `Sequence analysis failed: ${message}` }, 500)
  }
})

// POST /:projectId/direction-plan/scene/:sceneNumber/cuts — Stage 2: Generate 3-5 cuts for a scene
screenplayRoutes.post("/:projectId/direction-plan/scene/:sceneNumber/cuts", async (c) => {
  const projectId = c.req.param("projectId")
  const sceneNumber = parseInt(c.req.param("sceneNumber"))

  if (isNaN(sceneNumber) || sceneNumber < 1) {
    return c.json({ error: "sceneNumber must be a positive integer" }, 400)
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return c.json({ error: `Project '${projectId}' not found` }, 404)
    }

    const directionPlan = project.directionPlan as Record<string, unknown> | null
    if (!directionPlan || !directionPlan.scenes) {
      return c.json({ error: "Direction plan with scenes must exist before generating cuts" }, 400)
    }

    const scenes = directionPlan.scenes as Record<string, unknown>[]
    const scene = scenes.find(
      (s) => (s as { scene_number?: number }).scene_number === sceneNumber
    )
    if (!scene) {
      return c.json({ error: `Scene ${sceneNumber} not found in direction plan` }, 404)
    }

    const gw = getGateway()
    const response = await gw.text(
      `Design camera cuts for this scene:

Scene Number: ${sceneNumber}
Setting: ${(scene as { setting?: string }).setting ?? ""}
Time of Day: ${(scene as { time_of_day?: string }).time_of_day ?? ""}
Camera Angle: ${(scene as { camera_angle?: string }).camera_angle ?? ""}
Action: ${(scene as { action_description?: string }).action_description ?? ""}
Dialogue: ${(scene as { dialogue?: string | null }).dialogue ?? "None"}`,
      {
        provider: "gemini",
        systemPrompt: CUT_DESIGN_PROMPT,
        temperature: 0.6,
      },
    )

    if (!response || response.trim().length === 0) {
      return c.json({ error: "AI returned empty cut design. Please try again." }, 502)
    }

    let cuts: Record<string, unknown>[]
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return c.json({ error: "AI response was not a valid JSON array" }, 502)
      }
      cuts = JSON.parse(jsonMatch[0]) as Record<string, unknown>[]
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 502)
    }

    // Update scene with cuts
    scene.cuts = cuts

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { directionPlan: directionPlan as Record<string, unknown> },
    })

    return c.json({ directionPlan: updatedProject.directionPlan })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[direction-plan cuts scene ${sceneNumber}] ${message}`)
    return c.json({ error: `Cut generation failed: ${message}` }, 500)
  }
})

// POST /:projectId/direction-plan/scene/:sceneNumber/cut/:cutNumber/prompts — Stage 3: Generate image + video prompts
screenplayRoutes.post("/:projectId/direction-plan/scene/:sceneNumber/cut/:cutNumber/prompts", async (c) => {
  const projectId = c.req.param("projectId")
  const sceneNumber = parseInt(c.req.param("sceneNumber"))
  const cutNumber = parseInt(c.req.param("cutNumber"))

  if (isNaN(sceneNumber) || sceneNumber < 1) {
    return c.json({ error: "sceneNumber must be a positive integer" }, 400)
  }
  if (isNaN(cutNumber) || cutNumber < 1) {
    return c.json({ error: "cutNumber must be a positive integer" }, 400)
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return c.json({ error: `Project '${projectId}' not found` }, 404)
    }

    const directionPlan = project.directionPlan as Record<string, unknown> | null
    if (!directionPlan || !directionPlan.scenes) {
      return c.json({ error: "Direction plan with scenes must exist" }, 400)
    }

    const scenes = directionPlan.scenes as Record<string, unknown>[]
    const scene = scenes.find(
      (s) => (s as { scene_number?: number }).scene_number === sceneNumber
    )
    if (!scene) {
      return c.json({ error: `Scene ${sceneNumber} not found in direction plan` }, 404)
    }

    const cuts = (scene as { cuts?: Record<string, unknown>[] }).cuts
    if (!cuts || cuts.length === 0) {
      return c.json({ error: `Scene ${sceneNumber} has no cuts. Generate cuts first (Stage 2).` }, 400)
    }

    const cut = cuts.find(
      (ct) => (ct as { cut_number?: number }).cut_number === cutNumber
    )
    if (!cut) {
      return c.json({ error: `Cut ${cutNumber} not found in scene ${sceneNumber}` }, 404)
    }

    const gw = getGateway()
    const response = await gw.text(
      `Generate image and video prompts for this camera cut:

Scene Setting: ${(scene as { setting?: string }).setting ?? ""}
Time of Day: ${(scene as { time_of_day?: string }).time_of_day ?? ""}
Shot Type: ${(cut as { shot_type?: string }).shot_type ?? ""}
Camera Angle: ${(cut as { camera_angle?: string }).camera_angle ?? ""}
Camera Movement: ${(cut as { camera_movement?: string }).camera_movement ?? ""}
Duration: ${(cut as { duration?: number }).duration ?? 5} seconds
Subject: ${(cut as { subject?: string }).subject ?? ""}
Action: ${(cut as { action?: string }).action ?? ""}`,
      {
        provider: "gemini",
        systemPrompt: PROMPT_GENERATION_PROMPT,
        temperature: 0.7,
      },
    )

    if (!response || response.trim().length === 0) {
      return c.json({ error: "AI returned empty prompts. Please try again." }, 502)
    }

    let prompts: { image_prompt: string; video_prompt: string }
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return c.json({ error: "AI response was not a valid JSON object" }, 502)
      }
      prompts = JSON.parse(jsonMatch[0]) as { image_prompt: string; video_prompt: string }
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 502)
    }

    // Update cut with prompts
    cut.image_prompt = prompts.image_prompt
    cut.video_prompt = prompts.video_prompt

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { directionPlan: directionPlan as Record<string, unknown> },
    })

    return c.json({ directionPlan: updatedProject.directionPlan })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[direction-plan prompts scene ${sceneNumber} cut ${cutNumber}] ${message}`)
    return c.json({ error: `Prompt generation failed: ${message}` }, 500)
  }
})

// POST /:projectId/direction-plan/scene/:sceneNumber/generate-all — Convenience: cuts + all prompts in one call
screenplayRoutes.post("/:projectId/direction-plan/scene/:sceneNumber/generate-all", async (c) => {
  const projectId = c.req.param("projectId")
  const sceneNumber = parseInt(c.req.param("sceneNumber"))

  if (isNaN(sceneNumber) || sceneNumber < 1) {
    return c.json({ error: "sceneNumber must be a positive integer" }, 400)
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return c.json({ error: `Project '${projectId}' not found` }, 404)
    }

    const directionPlan = project.directionPlan as Record<string, unknown> | null
    if (!directionPlan || !directionPlan.scenes) {
      return c.json({ error: "Direction plan with scenes must exist before generating cuts" }, 400)
    }

    const scenes = directionPlan.scenes as Record<string, unknown>[]
    const scene = scenes.find(
      (s) => (s as { scene_number?: number }).scene_number === sceneNumber
    )
    if (!scene) {
      return c.json({ error: `Scene ${sceneNumber} not found in direction plan` }, 404)
    }

    const gw = getGateway()

    // Stage 2: Generate cuts
    const cutsResponse = await gw.text(
      `Design camera cuts for this scene:

Scene Number: ${sceneNumber}
Setting: ${(scene as { setting?: string }).setting ?? ""}
Time of Day: ${(scene as { time_of_day?: string }).time_of_day ?? ""}
Camera Angle: ${(scene as { camera_angle?: string }).camera_angle ?? ""}
Action: ${(scene as { action_description?: string }).action_description ?? ""}
Dialogue: ${(scene as { dialogue?: string | null }).dialogue ?? "None"}`,
      {
        provider: "gemini",
        systemPrompt: CUT_DESIGN_PROMPT,
        temperature: 0.6,
      },
    )

    if (!cutsResponse || cutsResponse.trim().length === 0) {
      return c.json({ error: "AI returned empty cut design. Please try again." }, 502)
    }

    let cuts: Record<string, unknown>[]
    try {
      const jsonMatch = cutsResponse.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return c.json({ error: "AI cut response was not a valid JSON array" }, 502)
      }
      cuts = JSON.parse(jsonMatch[0]) as Record<string, unknown>[]
    } catch {
      return c.json({ error: "Failed to parse AI cut response as JSON" }, 502)
    }

    // Stage 3: Generate prompts for each cut
    for (const cut of cuts) {
      const promptResponse = await gw.text(
        `Generate image and video prompts for this camera cut:

Scene Setting: ${(scene as { setting?: string }).setting ?? ""}
Time of Day: ${(scene as { time_of_day?: string }).time_of_day ?? ""}
Shot Type: ${(cut as { shot_type?: string }).shot_type ?? ""}
Camera Angle: ${(cut as { camera_angle?: string }).camera_angle ?? ""}
Camera Movement: ${(cut as { camera_movement?: string }).camera_movement ?? ""}
Duration: ${(cut as { duration?: number }).duration ?? 5} seconds
Subject: ${(cut as { subject?: string }).subject ?? ""}
Action: ${(cut as { action?: string }).action ?? ""}`,
        {
          provider: "gemini",
          systemPrompt: PROMPT_GENERATION_PROMPT,
          temperature: 0.7,
        },
      )

      if (promptResponse && promptResponse.trim().length > 0) {
        try {
          const jsonMatch = promptResponse.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const prompts = JSON.parse(jsonMatch[0]) as { image_prompt: string; video_prompt: string }
            cut.image_prompt = prompts.image_prompt
            cut.video_prompt = prompts.video_prompt
          }
        } catch {
          // Continue with empty prompts if parsing fails for this cut
          console.error(`[direction-plan generate-all] Failed to parse prompts for cut ${(cut as { cut_number?: number }).cut_number}`)
        }
      }
    }

    // Save everything at once
    scene.cuts = cuts

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { directionPlan: directionPlan as Record<string, unknown> },
    })

    return c.json({ directionPlan: updatedProject.directionPlan })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[direction-plan generate-all scene ${sceneNumber}] ${message}`)
    return c.json({ error: `Generate-all failed: ${message}` }, 500)
  }
})
