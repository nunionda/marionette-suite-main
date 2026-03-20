import { Hono } from "hono"
import { AIGateway } from "@marionette/ai-gateway"
import { GeminiProvider } from "@marionette/ai-gateway/providers/gemini.js"
import { ValidationError, AppError } from "../middleware/error-handler.ts"

export const loglineRoutes = new Hono()

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

const LOGLINE_GENERATE_PROMPT = `You are a Logline Specialist at Marionette Studio, an AI-driven film & video production company.

You use the Antigravity High-Concept Formula to craft compelling loglines:
[아이러니한 설정 (Ironic Setup)] + [전술적 디테일 (Tactical Detail)] + [보편적 감정 (Universal Emotion)]

Given an idea, format, and genre, generate TWO versions:

1. Category A - Cold Catch: 1-2 sentences, under 50 characters. Grabs an investor in 5 seconds.
2. Category B - Extended Pitch: 3-4 sentences showing story depth.

Also identify the core elements:
- irony: The unexpected contradiction in the premise
- stakes: The consequence level (global or family survival)
- visual: The instant mental image the logline creates

Return ONLY a JSON object with these fields:
{
  "coldCatch": "...",
  "extendedPitch": "...",
  "irony": "...",
  "stakes": "...",
  "visual": "..."
}

Write all content in Korean. No markdown wrapping.`

const LOGLINE_ANALYZE_PROMPT = `You are a Script Development Executive at Marionette Studio.

Analyze the given logline using these 4 quality criteria, scoring each from 0 to 10:

1. irony (아이러니): Does it contain an unexpected contradiction?
2. stakes (스테이크): Are the consequences at global or survival level?
3. visual (비주얼): Does it instantly create a mental image?
4. pacing (페이싱): Does it have fast, urgent rhythm?

Also provide:
- feedback: 2-3 sentences of constructive feedback in Korean
- improved: A rewritten improved version of the logline in Korean

Return ONLY a JSON object:
{
  "scores": { "irony": number, "stakes": number, "visual": number, "pacing": number },
  "feedback": "...",
  "improved": "..."
}

No markdown wrapping.`

const LOGLINE_VARIATIONS_PROMPT = `You are a Creative Writer at Marionette Studio.

Given a logline and a style direction, generate exactly 3 variations of the logline in Korean.

Style directions:
- darker: Make it grittier, more intense, higher stakes
- lighter: Make it more hopeful, warm, or humorous
- more_ironic: Amplify the ironic contradiction
- more_emotional: Deepen the emotional resonance

Return ONLY a JSON object:
{
  "variations": ["variation1", "variation2", "variation3"]
}

No markdown wrapping.`

// ─── POST /generate ───

loglineRoutes.post("/generate", async (c) => {
  const body = await c.req.json<{
    idea: string
    format: string
    genre: string
  }>()

  if (!body.idea?.trim()) {
    throw new ValidationError("idea is required")
  }

  const userPrompt = `Format: ${body.format || "영화"}
Genre: ${body.genre || "자유"}

Idea: "${body.idea}"

Generate a Cold Catch (Category A) and Extended Pitch (Category B) logline for this idea.`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: LOGLINE_GENERATE_PROMPT,
      temperature: 0.8,
    })

    const objMatch = response.match(/\{[\s\S]*\}/)
    if (!objMatch) {
      throw new AppError("Failed to parse AI response as JSON object", 500, "INTERNAL_SERVER_ERROR")
    }

    const result = JSON.parse(objMatch[0]) as {
      coldCatch: string
      extendedPitch: string
      irony: string
      stakes: string
      visual: string
    }
    return c.json(result)
  } catch (err) {
    if (err instanceof AppError) throw err
    const message = err instanceof Error ? err.message : String(err)
    throw new AppError(`Logline generation failed: ${message}`, 500, "AI_ERROR")
  }
})

// ─── POST /analyze ───

loglineRoutes.post("/analyze", async (c) => {
  const body = await c.req.json<{
    logline: string
  }>()

  if (!body.logline?.trim()) {
    throw new ValidationError("logline is required")
  }

  const userPrompt = `Analyze this logline:

"${body.logline}"

Score it on the 4 criteria and provide feedback with an improved version.`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: LOGLINE_ANALYZE_PROMPT,
      temperature: 0.7,
    })

    const objMatch = response.match(/\{[\s\S]*\}/)
    if (!objMatch) {
      throw new AppError("Failed to parse AI response as JSON object", 500, "INTERNAL_SERVER_ERROR")
    }

    const result = JSON.parse(objMatch[0]) as {
      scores: { irony: number; stakes: number; visual: number; pacing: number }
      feedback: string
      improved: string
    }
    return c.json(result)
  } catch (err) {
    if (err instanceof AppError) throw err
    const message = err instanceof Error ? err.message : String(err)
    throw new AppError(`Logline analysis failed: ${message}`, 500, "AI_ERROR")
  }
})

// ─── POST /variations ───

loglineRoutes.post("/variations", async (c) => {
  const body = await c.req.json<{
    logline: string
    style: "darker" | "lighter" | "more_ironic" | "more_emotional"
  }>()

  if (!body.logline?.trim()) {
    throw new ValidationError("logline is required")
  }

  const validStyles = ["darker", "lighter", "more_ironic", "more_emotional"]
  if (!validStyles.includes(body.style)) {
    throw new ValidationError(`style must be one of: ${validStyles.join(", ")}`)
  }

  const userPrompt = `Original logline: "${body.logline}"

Style direction: ${body.style}

Generate 3 variations of this logline in the specified style direction.`

  try {
    const gw = getGateway()
    const response = await gw.text(userPrompt, {
      provider: "gemini",
      systemPrompt: LOGLINE_VARIATIONS_PROMPT,
      temperature: 0.8,
    })

    const objMatch = response.match(/\{[\s\S]*\}/)
    if (!objMatch) {
      throw new AppError("Failed to parse AI response as JSON object", 500, "INTERNAL_SERVER_ERROR")
    }

    const result = JSON.parse(objMatch[0]) as { variations: string[] }
    return c.json(result)
  } catch (err) {
    if (err instanceof AppError) throw err
    const message = err instanceof Error ? err.message : String(err)
    throw new AppError(`Variation generation failed: ${message}`, 500, "AI_ERROR")
  }
})
