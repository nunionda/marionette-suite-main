import { Elysia, t } from "elysia";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { syncProjectToFileSystem } from "./lib/sync";
import { VISUAL_DIRECTOR_SYSTEM_PROMPT } from "./prompts/visualDirector";

// Target storyboard dimensions — always 16:9
const IMG_W = 800;
const IMG_H = 450;

const STORYBOARD_DIR = path.join(process.cwd(), "public", "storyboard", "images");
if (!fs.existsSync(STORYBOARD_DIR)) {
  fs.mkdirSync(STORYBOARD_DIR, { recursive: true });
}

const EXPORT_BASE = path.join(process.cwd(), "public", "storyboard", "images");

function slugify(text: string): string {
  return text
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInitials(title: string): string {
  const letters = title
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, "")[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return letters || "PRJ";
}

interface ExportOpts {
  projectId: string | number;
  projectTitle: string;
  frameNumber?: string | number;
}

function buildExportPath(opts: ExportOpts): { dir: string; fileName: string } {
  const initials = getInitials(opts.projectTitle);
  const slug = slugify(opts.projectTitle) || `project-${opts.projectId}`;
  const folderName = `${initials}_${opts.projectId}_${slug}`;
  const dir = path.join(EXPORT_BASE, folderName);
  const cn = String(opts.frameNumber ?? "01").padStart(2, "0");
  const fileName = `${opts.projectId}_S01_C${cn}.jpg`;
  return { dir, fileName };
}

async function saveImageFromResponse(res: Response, exportOpts?: ExportOpts): Promise<string | null> {
  try {
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Normalize to exactly 800×450 (16:9) so every card renders without bars
    const normalized = await sharp(rawBuffer)
      .resize(IMG_W, IMG_H, { fit: "cover", position: "attention" })
      .jpeg({ quality: 92 })
      .toBuffer();

    let dir: string;
    let fileName: string;
    if (exportOpts) {
      ({ dir, fileName } = buildExportPath(exportOpts));
    } else {
      dir = STORYBOARD_DIR;
      fileName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    }
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), normalized);
    const host = process.env.BACKEND_URL || "http://localhost:3006";
    const relativePath = path.relative(path.join(process.cwd(), "public"), path.join(dir, fileName));
    return `${host}/public/${relativePath.replace(/\\/g, "/")}`;
  } catch (err) {
    console.error("[IMAGE_SAVE] Error saving response:", err);
    return null;
  }
}

async function downloadAndSaveImage(url: string, exportOpts?: ExportOpts): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    return await saveImageFromResponse(res, exportOpts);
  } catch (err) {
    console.error("[IMAGE_DOWNLOAD] Error saving image:", err);
    return null;
  }
}


// --- CONFIGURATION & KEYS ---
const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || "",
  ANTHROPIC: process.env.ANTHROPIC_API_KEY || "",
  GEMINI: process.env.GEMINI_API_KEY || "",
  OPENAI: process.env.OPENAI_API_KEY || "",
  DEEPSEEK: process.env.DEEPSEEK_API_KEY || "",
  GROQ: process.env.GROQ_API_KEY || ""
};

export const aiRoutes = new Elysia()
  .post("/stream", async ({ body, set }) => {
    const { prompt, system, model: requestedModel, mode = "agent" } = body as any;
    
    // [DEV MODE] 유료 모델 사용 금지. 최종 완성 후 유료 API 활성화 예정.
    // Provider chain (FREE ONLY): Gemini Free → Groq → OpenRouter free models
    // Last updated: 2026-04-12 | Next review: 2026-04-19
    // See: docs/ai-model-policy.md for update schedule and benchmarks
    const fallbackModels = [
      requestedModel || "google/gemini-2.5-flash",
      "google/gemini-2.0-flash-001",
      "google/gemini-2.0-flash-lite-001",
      "groq/llama-3.3-70b-versatile",
      "groq/llama-3.1-8b-instant",                           // separate Groq quota bucket
      "groq/meta-llama/llama-4-scout-17b-16e-instruct",      // Llama 4 Scout, separate quota
      "groq/qwen/qwen3-32b",                                 // Qwen 3 32B, separate quota
      // PAID models (disabled during dev — uncomment after final release):
      // "anthropic/claude-3-5-haiku",
      // "openai/gpt-4o-mini",
    ];

    for (const currentModel of fallbackModels) {
      console.log(`[AI_ORCHESTRATOR][${mode.toUpperCase()}] Attempting: ${currentModel}`);

      try {
        let response: any = null;

        // --- DIRECT API ATTEMPT (Gemini Free → Groq → Anthropic credits) ---
        console.log(`[AI_ORCHESTRATOR] Attempting Direct API for ${currentModel}`);
        if (currentModel.includes("gemini") && KEYS.GEMINI) {
          response = await callGeminiDirect(currentModel, prompt, system);
        } else if ((currentModel.includes("groq/") || currentModel.includes("llama") || currentModel.includes("mixtral")) && KEYS.GROQ) {
          response = await callGroqDirect(currentModel, prompt, system);
        } else if (currentModel.includes("claude") && KEYS.ANTHROPIC) {
          response = await callAnthropicDirect(currentModel, prompt, system);
        } else if (currentModel.includes("openai") && KEYS.OPENAI) {
          response = await callOpenAIDirect(currentModel, prompt, system);
        } else if (currentModel.includes("deepseek") && KEYS.DEEPSEEK) {
          response = await callDeepSeekDirect(currentModel, prompt, system);
        }

        // --- OPENROUTER LAST RESORT (only if explicitly configured) ---
        if ((!response || !response.ok) && KEYS.OPENROUTER) {
          console.log(`[AI_ORCHESTRATOR] Last resort: OpenRouter for ${currentModel}`);
          response = await callOpenRouterStream(currentModel, prompt, system, KEYS.OPENROUTER);
        }

        if (response && !response.ok) {
          console.warn(`[AI_ORCHESTRATOR] ${currentModel} responded ${response.status} ${response.statusText}`);
        }

        if (response && response.ok) {
          console.log(`[AI_ORCHESTRATOR] Success: ${currentModel}`);
          
          // NORMALIZE STREAM (SSE Standard)
          const normalizedStream = currentModel.includes("claude") 
            ? transformAnthropicStream(response.body) 
            : currentModel.includes("gemini")
            ? transformGeminiStream(response.body)
            : response.body;

          return new Response(normalizedStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive"
            }
          });
        }
      } catch (err: any) {
        console.error(`[AI_ORCHESTRATOR] Error with ${currentModel}:`, err.message);
      }
    }

    set.status = 502;
    return { error: "All text generation models failed." };
  }, {
    body: t.Object({
      prompt: t.String(),
      system: t.Optional(t.String()),
      model: t.Optional(t.String()),
      mode: t.Optional(t.String())
    })
  })
  .post("/generate-image", async ({ body, set }) => {
    const { prompt: rawPrompt, model: requestedModel, frameNumber, panelName, projectId, projectTitle } = body as any;
    const exportOpts: ExportOpts | undefined = (projectId && projectTitle)
      ? { projectId, projectTitle, frameNumber }
      : undefined;

    // Always build the storyboard prompt from the structured enrichedPrompt fields
    // (Visual Director pass-through was removed — server template produces better Pollinations results)
    const sceneDescMatch = rawPrompt.match(/\[Frame #?\d+\]\s*([\s\S]*)/i) || rawPrompt.match(/\[Scene Description\][:\s]+([\s\S]*)/i);
    const sceneDesc = (sceneDescMatch ? sceneDescMatch[1] : rawPrompt).trim();

    const panelNum = frameNumber ?? '?';
    let titleLabel: string;
    if (panelName && panelName.trim()) {
      titleLabel = panelName.trim().toUpperCase();
    } else {
      const krToEn: Record<string, string> = {
        '농구': 'BASKETBALL', '달리기': 'RUNNING', '달리는': 'RUNNING', '나이키': 'NIKE',
        '헬스장': 'GYM', '트랙': 'TRACK', '코트': 'COURT', '경기장': 'STADIUM',
        '선수': 'ATHLETE', '여성': 'WOMAN', '남성': 'MAN', '훈련': 'TRAINING',
        '드리블': 'DRIBBLE', '슬로우': 'SLOW-MO', '카메라': 'CAMERA', '광고': 'AD',
        '어두운': 'DARK', '새벽': 'DAWN', '도시': 'CITY', '자연': 'NATURE',
      };
      const firstWords = sceneDesc.split(/[\s,.\n]+/).slice(0, 5);
      const translated = firstWords.map((w: string) => krToEn[w.replace(/[^\w가-힣]/g, '')] || null).filter(Boolean);
      titleLabel = translated.length > 0
        ? translated.slice(0, 2).join(' ')
        : sceneDesc.replace(/[^\x00-\x7F]/g, '').trim().split(/\s+/).slice(0, 3).join(' ').toUpperCase() || 'SCENE';
    }
    const panelLabel = `PANEL ${panelNum}: ${titleLabel}`;
    const shotMatches = rawPrompt.match(/\b(INT\.|EXT\.|CLOSE[\s-]UP|WIDE SHOT|TRACKING|DOLLY|PAN UP|RACK FOCUS|ECU|OTS)\b/gi);
    const shotNotes = shotMatches ? shotMatches.slice(0, 3).join(' / ') : 'CUT TO';

    const storyboardPrompt = `Dark cinematic storyboard illustration, Copic alcohol marker and brushpen technique on cream card stock. Layered alcohol marker strokes — multiple dark passes building rich near-black shadow zones with visible marker stroke direction and feathered bleed edges. Warm cream paper substrate showing through at highlight zones and mid-tones, characteristic alcohol marker bleed-through effect. Crisp brushpen ink outlines over marker base, bold confident linework with slight ink feathering. ONE vivid crimson red alcohol marker accent applied exclusively to hero product detail — all other elements cool dark grey and black marker. Dramatic single spotlight backlight rendered as paper white lifting through dark marker layers, white ink or gouache for rim highlights. Dynamic motion blur marker strokes conveying speed. Ink splatter details. Black border frame. Handwritten panel label "${panelLabel}" top center, shot notes "${shotNotes}" top right in small caps. Nike/Wieden+Kennedy agency pre-vis board. Scene: ${sceneDesc}`;

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(storyboardPrompt);

    // Shared headers — Pollinations and proxies sometimes block bare server requests
    const imageHeaders = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      "Referer": "https://pollinations.ai/"
    };

    // Pollinations 무료 모델 체인 (안정성순): flux → gptimage
    // kontext는 enter.pollinations.ai 유료 전용 → 제거
    const pollinationsModels = [
      { model: 'flux',     timeout: 30000 },
      { model: 'gptimage', timeout: 50000 },
    ];
    for (const { model, timeout } of pollinationsModels) {
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&model=${model}&nologo=true&seed=${seed}`;
      try {
        console.log(`[IMAGE_GEN] Trying Pollinations model: ${model} (timeout: ${timeout/1000}s)`);
        const res = await fetch(url, { headers: imageHeaders, signal: AbortSignal.timeout(timeout) });
        const ct = res.headers.get('content-type') || '';
        console.log(`[IMAGE_GEN] ${model} → status=${res.status} content-type=${ct}`);
        if (res.status === 429) { console.warn(`[IMAGE_GEN] Rate limited (429) on ${model}, skipping`); continue; }
        if (res.ok && ct.includes('image')) {
          const savedUrl = await saveImageFromResponse(res, exportOpts);
          if (savedUrl) {
            console.log(`[IMAGE_GEN] Success with ${model}, saved: ${savedUrl}`);
            return { data: [{ url: savedUrl }] };
          }
        } else {
          console.warn(`[IMAGE_GEN] ${model} non-image response (ct=${ct}), skipping`);
        }
      } catch (err: any) {
        console.error(`[IMAGE_GEN] Pollinations ${model} failed:`, err.message);
      }
    }

    // 최후 폴백: 서버에서 직접 다운로드 시도 (flux URL, User-Agent 포함)
    console.warn("[IMAGE_GEN] All Pollinations models failed — trying last-resort server-side download");
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&model=flux&nologo=true&seed=${seed + 1}`;
    const savedFallback = await downloadAndSaveImage(fallbackUrl, exportOpts);
    if (savedFallback) {
      console.log("[IMAGE_GEN] Last-resort download succeeded:", savedFallback);
      return { data: [{ url: savedFallback }] };
    }

    // 완전 실패: 프론트엔드에 빈 data 반환 (외부 URL 노출하지 않음)
    console.error("[IMAGE_GEN] All image generation attempts failed");
    return { data: [] };
  })
  .post("/refine-image-prompt", async ({ body, set }) => {
    const { prompt: rawPrompt } = body as any;

    try {
      // 1. Try Direct Gemini if key is available
      if (KEYS.GEMINI) {
        console.log("[VISUAL_DIRECTOR] Attempting Direct Gemini API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEYS.GEMINI}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: VISUAL_DIRECTOR_SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: rawPrompt }] }]
          })
        });
        
        const data: any = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return parseVisualDirectorResponse(text);
        }
        console.warn("[VISUAL_DIRECTOR] Direct Gemini failed, falling back to OpenRouter...");
      }

      // 2. Fallback to Groq (free tier, llama-3.3-70b)
      if (KEYS.GROQ) {
        console.log("[VISUAL_DIRECTOR] Attempting Groq API...");
        try {
          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${KEYS.GROQ}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: VISUAL_DIRECTOR_SYSTEM_PROMPT },
                { role: "user", content: rawPrompt }
              ],
              temperature: 0.7,
              max_tokens: 2048
            })
          });
          const groqData: any = await groqResponse.json();
          if (groqData.choices?.[0]?.message?.content) {
            return parseVisualDirectorResponse(groqData.choices[0].message.content);
          }
          console.warn("[VISUAL_DIRECTOR] Groq returned empty, trying OpenRouter...", groqData.error?.message);
        } catch (groqErr: any) {
          console.warn("[VISUAL_DIRECTOR] Groq failed:", groqErr.message);
        }
      }

      // 3. Last resort: OpenRouter (if credits allow)
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${KEYS.OPENROUTER}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Cine Script Writer"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: VISUAL_DIRECTOR_SYSTEM_PROMPT },
            { role: "user", content: rawPrompt }
          ],
          temperature: 0.7,
        })
      });

      const data: any = await response.json();
      if (data.error) {
         console.error("[VISUAL_DIRECTOR] OpenRouter Error:", data.error);
         throw new Error(data.error.message || "OpenRouter error");
      }

      if (data.choices?.[0]?.message?.content) {
        return parseVisualDirectorResponse(data.choices[0].message.content);
      }
      
      console.warn("[VISUAL_DIRECTOR] Unexpected response structure:", JSON.stringify(data));
      throw new Error("Empty response from AI");
    } catch (err: any) {
      console.error("[VISUAL_DIRECTOR] Final Error:", err.message);
      return { success: false, error: err.message, prompt: rawPrompt };
    }
  });

// --- VISUAL DIRECTOR RESPONSE PARSER ---

function parseVisualDirectorResponse(text: string): { success: boolean; refinedPrompt: string; sceneBlueprint?: any } {
  const trimmed = text.trim();

  // Extract PROMPT: line
  const promptMatch = trimmed.match(/PROMPT:\s*(.+)/s);
  const refinedPrompt = promptMatch ? promptMatch[1].trim().split('\n')[0].trim() : trimmed;

  // Try to parse JSON blueprint
  let sceneBlueprint: any = undefined;
  const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try { sceneBlueprint = JSON.parse(jsonMatch[1].trim()); } catch { /* ignore parse errors */ }
  }

  console.log("[VISUAL_DIRECTOR] Refined prompt:", refinedPrompt.slice(0, 120) + "...");
  if (sceneBlueprint) console.log("[VISUAL_DIRECTOR] Scene blueprint keys:", Object.keys(sceneBlueprint).join(', '));

  return { success: true, refinedPrompt, sceneBlueprint };
}

// --- STREAM TRANSFORMERS ---

function transformAnthropicStream(stream: any) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              const data = JSON.parse(dataStr);
              if (data.type === 'content_block_delta' && data.delta?.text) {
                const standardized = { choices: [{ delta: { content: data.delta.text } }] };
                await writer.write(encoder.encode(`data: ${JSON.stringify(standardized)}\n\n`));
              }
            } catch (e) {}
          }
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err: any) {
      console.error("[AI_STREAM] Anthropic Transform Error:", err.message);
    } finally {
      writer.close();
    }
  })();
  return readable;
}

function transformGeminiStream(stream: any) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          
          let cleanLine = line.trim();
          if (cleanLine.startsWith('data: ')) cleanLine = cleanLine.slice(6);
          if (cleanLine === '[DONE]') continue;

          try {
            const data = JSON.parse(cleanLine);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              const standardized = { choices: [{ delta: { content: text } }] };
              await writer.write(encoder.encode(`data: ${JSON.stringify(standardized)}\n\n`));
            }
          } catch (e) {}
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err: any) {
      console.error("[AI_STREAM] Gemini Transform Error:", err.message);
    } finally {
      writer.close();
    }
  })();
  return readable;
}

// --- HELPERS ---

async function callAnthropicDirect(model: string, prompt: string, system?: string) {
  const anthropicModel = model.includes("/") ? model.split("/")[1] : model;
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": KEYS.ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: anthropicModel, max_tokens: 8192, system: system || "You are a creative assistant.", messages: [{ role: "user", content: prompt }], stream: true })
  });
}

async function callGeminiDirect(model: string, prompt: string, system?: string) {
  const geminiModel = model.includes("/") ? model.split("/")[1] : model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${KEYS.GEMINI}`;
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: (system ? system + "\n\n" : "") + prompt }] }] }) });
}

async function callOpenAIDirect(model: string, prompt: string, system?: string) {
  const oaiModel = model.includes("/") ? model.split("/")[1] : model;
  return fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${KEYS.OPENAI}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: oaiModel, messages: [{ role: "system", content: system || "You are a creative assistant." }, { role: "user", content: prompt }], stream: true }) });
}

async function callDeepSeekDirect(model: string, prompt: string, system?: string) {
  return fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${KEYS.DEEPSEEK}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: system || "You are a creative assistant." }, { role: "user", content: prompt }], stream: true }) });
}

async function callGroqDirect(model: string, prompt: string, system?: string) {
  // Strip the "groq/" prefix only, preserving org/model format (e.g. "meta-llama/llama-4-scout-...")
  const groqModel = model.startsWith("groq/") ? model.slice("groq/".length) : model;
  return fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${KEYS.GROQ}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: groqModel, messages: [{ role: "system", content: system || "You are a creative assistant." }, { role: "user", content: prompt }], stream: true }) });
}

async function callOpenRouterStream(model: string, prompt: string, system: string | undefined, apiKey: string) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "system", content: (system || "You are a creative assistant.") + "\n\n[STRICT LANGUAGE RULE]: 반드시 요청받은 언어로 답변하십시오." }, { role: "user", content: prompt }], max_tokens: 4000, stream: true }) });
}

async function callDallE3Direct(prompt: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024" }) });
  if (response.ok) return await response.json();
  return null;
}

async function callOpenRouterImage(model: string, prompt: string, apiKey: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], modalities: ["image"] }) });
  if (!response.ok) return null;
  const result = await response.json() as any;
  const content = result.choices?.[0]?.message?.content || "";
  const images = result.choices?.[0]?.message?.images || [];
  const urlMatch = content.match(/\((https:\/\/.*?)\)/) || content.match(/https:\/\/.*\.png/);
  const finalUrl = urlMatch ? urlMatch[1] || urlMatch[0] : (images[0] || content);
  if (finalUrl && typeof finalUrl === 'string' && finalUrl.startsWith('http')) return { data: [{ url: finalUrl.trim() }] };
  return null;
}
