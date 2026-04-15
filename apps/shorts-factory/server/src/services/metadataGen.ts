/**
 * metadataGen.ts — YouTube Shorts metadata generation via LLM.
 *
 * Provider chain: Gemini Free (gemini-1.5-flash) → rule-based fallback.
 * Generates 3 title variants, hashtag set, and description from clip context.
 */

export interface MetadataInput {
  videoTitle: string;
  ruleType: string;
  creditText: string;
  startSec: number;
  endSec: number;
  channelName?: string;
  contentType?: "short" | "long"; // short = Shorts, long = long-form video
}

export interface GeneratedMetadata {
  titles: [string, string, string];
  hashtags: string[];
  description: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 900 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function ruleBasedFallback(input: MetadataInput): GeneratedMetadata {
  const base = input.videoTitle.slice(0, 40).trim();
  const ch = input.channelName ?? "KPOP";
  const isLong = input.contentType === "long";

  if (isLong) {
    return {
      titles: [
        `${base} | Best Moments Compilation`,
        `${base} | Must-Watch Highlights`,
        `${base} | Top Moments ${new Date().getFullYear()}`,
      ],
      hashtags: [
        "#kpop",
        `#${ch.replace(/\s+/g, "").toLowerCase()}`,
        "#highlights",
        "#compilation",
        "#bestmoments",
      ],
      description: `${input.videoTitle}\n\nBest moments compilation.\n\n${input.creditText}\n\n#kpop`,
    };
  }

  return {
    titles: [
      `${base} 🔥 Best Moment #shorts`,
      `${base} ✨ You Need to See This`,
      `${base} 💫 Viral Clip`,
    ],
    hashtags: [
      "#shorts",
      "#kpop",
      "#kpopshorts",
      "#viral",
      `#${ch.replace(/\s+/g, "").toLowerCase()}`,
    ],
    description: `${input.videoTitle}\n\n${input.creditText}\n\n#shorts #kpop`,
  };
}

export async function generateMetadata(
  input: MetadataInput
): Promise<GeneratedMetadata> {
  const durSec = Math.round(input.endSec - input.startSec);
  const channel = input.channelName ?? "K-POP channel";
  const isLong = input.contentType === "long";

  const prompt = isLong
    ? `You are a YouTube SEO expert for K-POP fan channels creating LONG-FORM videos (3-15 minutes).

Original video: "${input.videoTitle}"
Source channel: ${channel}
Clip type: ${input.ruleType}
Total duration: ${durSec} seconds (~${Math.round(durSec / 60)} minutes)

Generate YouTube long-form video metadata. Respond ONLY with valid JSON — no markdown, no prose:
{
  "titles": ["title1_under80chars", "title2_under80chars", "title3_under80chars"],
  "hashtags": ["#tag1", "#tag2", ...8 to 12 total...],
  "description": "4-5 sentences with SEO keywords then newline then credit"
}

Title rules:
- Each under 80 characters (longer than Shorts titles for SEO)
- Include relevant emojis sparingly
- Optimize for YouTube search: include group name, year, specific event/song name
- Each takes a different angle: list/compilation / emotional narrative / search-optimized

Hashtag rules:
- Include: #kpop, group name tags
- Do NOT include #shorts
- Focus on searchable terms: song names, event names, member names

Description rules:
- 4-5 sentences with relevant keywords for search
- Include timestamps if this is a compilation (use format: 0:00 First clip title)
- End with blank line then exactly: ${input.creditText}`
    : `You are a YouTube Shorts expert for K-POP idol fan channels.

Original video: "${input.videoTitle}"
Source channel: ${channel}
Clip type: ${input.ruleType}
Clip duration: ${durSec} seconds

Generate YouTube Shorts metadata. Respond ONLY with valid JSON — no markdown, no prose:
{
  "titles": ["title1_under60chars", "title2_under60chars", "title3_under60chars"],
  "hashtags": ["#tag1", "#tag2", ...12 to 15 total...],
  "description": "2-3 sentences then newline then credit"
}

Title rules:
- Each under 60 characters
- Include relevant emojis
- Each takes a different angle: curiosity hook / emotional reaction / highlight label

Hashtag rules:
- Always include: #shorts, #kpop, #kpopshorts
- Mix English and Korean tags
- Include artist name, group name

Description rules:
- Short hook sentence, 1-2 more sentences, then blank line, then exactly: ${input.creditText}`;

  try {
    const raw = await callGemini(prompt);
    // Strip markdown code fences if Gemini adds them
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    const titles = (parsed.titles ?? []).slice(0, 3);
    // Pad to exactly 3 if Gemini returned fewer
    while (titles.length < 3) titles.push(ruleBasedFallback(input).titles[titles.length]);

    return {
      titles: titles as [string, string, string],
      hashtags: parsed.hashtags ?? [],
      description: parsed.description ?? "",
    };
  } catch (err) {
    console.warn("[metadataGen] Gemini failed, using fallback:", err);
    return ruleBasedFallback(input);
  }
}
