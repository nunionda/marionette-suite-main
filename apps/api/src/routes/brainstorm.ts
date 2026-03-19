import { Hono } from "hono"
import { AIGateway } from "@marionette/ai-gateway"
import { GeminiProvider } from "@marionette/ai-gateway/providers/gemini.js"

export const brainstormRoutes = new Hono()

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

const IDEA_GENERATION_PROMPT = `You are a Creative Director at Marionette Studio, an AI-driven film & video production company.

Given a seed idea, format, genres, and target audience, generate 3-5 UNIQUE and compelling concept variations.

Each concept MUST include:
- title: A catchy Korean title (English subtitle okay)
- logline: A compelling one-line pitch using the Antigravity High-Concept Formula:
  [Ironic setup that grabs attention] + [Tactical detail that grounds it] + [Universal emotion that makes it resonate]
- genres: Array of genre tags in Korean
- tone: 1-2 sentence description of visual/narrative tone in Korean
- synopsis: 3-4 sentence story summary in Korean
- moodKeywords: 5-7 visual mood keywords in English (for future AI image generation)

Return ONLY a JSON array of concept objects. No markdown wrapping, no explanation.

Important: Each concept should be DISTINCTLY different — vary the genre blend, tone, setting, and narrative approach. Push creative boundaries.`

const CONCEPT_REFINEMENT_PROMPT = `You are a senior Development Executive at Marionette Studio.

Take the selected concept and expand it into a fully developed project pitch.

Return a JSON object with these fields:
1. logline: Refined, polished version of the logline (Korean, 1-2 sentences)
2. synopsis: Full 1-page synopsis (Korean, 8-12 paragraphs covering beginning/middle/end)
3. characters: Array of 3-5 main characters, each with:
   - name: Korean name
   - role: Role in the story (주인공, 적대자, 조력자, etc.)
   - description: 2-3 sentence character description in Korean
4. themes: Array of 3-5 thematic keywords (Korean)
5. comparables: "A meets B" style comparison with known works (Korean)

Return ONLY a JSON object. No markdown wrapping.`

const SECTION_REGENERATION_PROMPT = `You are a creative writing assistant at Marionette Studio.

Based on the following concept context, regenerate ONLY the requested section.

Rules:
- If section is "logline": Return a single compelling logline string in Korean
- If section is "synopsis": Return a full 1-page synopsis string in Korean
- If section is "characters": Return a JSON array of {name, role, description} objects
- If section is "themes": Return a JSON array of theme keyword strings in Korean
- If section is "comparables": Return a single "A meets B" string in Korean

Return ONLY the regenerated content in the appropriate format. No markdown wrapping.`

// ─── POST /generate-ideas ───

brainstormRoutes.post("/generate-ideas", async (c) => {
  const body = await c.req.json<{
    format: string
    genres: string[]
    seed: string
    targetAudience: string
  }>()

  if (!body.seed?.trim()) {
    return c.json({ error: "seed idea is required" }, 400)
  }

  const userPrompt = `Format: ${body.format || "영화"}
Genres: ${(body.genres || []).join(", ") || "자유"}
Target Audience: ${body.targetAudience || "전체관람가"}

Seed Idea: "${body.seed}"

Generate 3-5 unique concept variations based on this seed idea.`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: IDEA_GENERATION_PROMPT,
      temperature: 0.8,
    })

    // Parse JSON array from response
    const arrayMatch = response.match(/\[[\s\S]*\]/)
    if (!arrayMatch) {
      return c.json({ error: "Failed to parse AI response as JSON array" }, 500)
    }

    const concepts = JSON.parse(arrayMatch[0]) as Record<string, unknown>[]

    // Add IDs if not present
    const conceptsWithIds = concepts.map((concept) => ({
      id: crypto.randomUUID(),
      ...concept,
    }))

    return c.json({ concepts: conceptsWithIds })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `Idea generation failed: ${message}` }, 500)
  }
})

// ─── POST /refine-concept ───

brainstormRoutes.post("/refine-concept", async (c) => {
  const body = await c.req.json<{
    title: string
    logline: string
    genres: string[]
    tone: string
    synopsis: string
  }>()

  if (!body.title?.trim()) {
    return c.json({ error: "title is required" }, 400)
  }

  const userPrompt = `Concept to expand:

Title: ${body.title}
Logline: ${body.logline}
Genres: ${(body.genres || []).join(", ")}
Tone: ${body.tone}
Synopsis: ${body.synopsis}

Expand this concept into a full project pitch.`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: CONCEPT_REFINEMENT_PROMPT,
      temperature: 0.7,
    })

    const objMatch = response.match(/\{[\s\S]*\}/)
    if (!objMatch) {
      return c.json({ error: "Failed to parse AI response as JSON object" }, 500)
    }

    const expanded = JSON.parse(objMatch[0])
    return c.json({ expanded })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `Concept refinement failed: ${message}` }, 500)
  }
})

// ─── POST /generate-logline ───

brainstormRoutes.post("/generate-logline", async (c) => {
  const body = await c.req.json<{
    context: string
    section: string
  }>()

  if (!body.context?.trim()) {
    return c.json({ error: "context is required" }, 400)
  }

  const validSections = ["logline", "synopsis", "characters", "themes", "comparables"]
  if (!validSections.includes(body.section)) {
    return c.json({ error: `section must be one of: ${validSections.join(", ")}` }, 400)
  }

  const userPrompt = `Context:
${body.context}

Section to regenerate: ${body.section}`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: SECTION_REGENERATION_PROMPT,
      temperature: 0.7,
    })

    // For characters/themes, parse as JSON; for others, return raw string
    if (body.section === "characters" || body.section === "themes") {
      const arrMatch = response.match(/\[[\s\S]*\]/)
      if (arrMatch) {
        return c.json({ result: JSON.parse(arrMatch[0]) })
      }
    }

    // Return cleaned string
    const cleaned = response.replace(/```[a-z]*\n?|\n?```/g, "").trim()
    return c.json({ result: cleaned })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `Section regeneration failed: ${message}` }, 500)
  }
})
