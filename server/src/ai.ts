import { Elysia, t } from "elysia";

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
    const { prompt, system, model: requestedModel } = body as any;
    
    const fallbackModels = [
      requestedModel || "anthropic/claude-3.5-sonnet",
      "google/gemini-2.0-flash-001",
      "google/gemini-2.5-flash",
      "google/gemini-2.0-flash-lite-001",
      "deepseek/deepseek-chat",
      "google/gemma-3-27b-it:free"
    ];

    for (const currentModel of fallbackModels) {
      console.log(`[AI_ORCHESTRATOR] Attempting: ${currentModel}`);

      try {
        let response: any = null;

        // --- 1. DIRECT API ATTEMPT ---
        if (currentModel.includes("claude") && KEYS.ANTHROPIC) {
          response = await callAnthropicDirect(currentModel, prompt, system);
        } else if (currentModel.includes("gemini") && KEYS.GEMINI) {
          response = await callGeminiDirect(currentModel, prompt, system);
        } else if (currentModel.includes("openai") && KEYS.OPENAI) {
          response = await callOpenAIDirect(currentModel, prompt, system);
        } else if (currentModel.includes("deepseek") && KEYS.DEEPSEEK) {
          response = await callDeepSeekDirect(currentModel, prompt, system);
        }
        
        // --- 2. OPENROUTER FALLBACK ---
        if ((!response || !response.ok) && KEYS.OPENROUTER) {
          console.log(`[AI_ORCHESTRATOR] Falling back to OpenRouter for: ${currentModel}`);
          response = await callOpenRouterStream(currentModel, prompt, system, KEYS.OPENROUTER);
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
      model: t.Optional(t.String())
    })
  })
  .post("/generate-image", async ({ body, set }) => {
    const { prompt, model: requestedModel } = body as any;
    const fallbackModels = [requestedModel || "openai/dall-e-3", "black-forest-labs/flux/schnell", "stabilityai/sdxl"];

    for (const currentModel of fallbackModels) {
      try {
        if (currentModel.includes("dall-e") && KEYS.OPENAI) {
          const result = await callDallE3Direct(prompt, KEYS.OPENAI);
          if (result) return result;
        }
        if (KEYS.OPENROUTER) {
          const result = await callOpenRouterImage(currentModel, prompt, KEYS.OPENROUTER);
          if (result) return result;
        }
      } catch (err: any) {
        console.error(`[IMAGE_GEN] Error with ${currentModel}:`, err.message);
      }
    }

    const encodedPrompt = encodeURIComponent("(Cinematic storyboard sketch, rough ink and charcoal style) " + prompt);
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=450&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    return { data: [{ url: pollinationsUrl }] };
  });

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
    body: JSON.stringify({ model: anthropicModel, max_tokens: 4000, system: system || "You are a creative assistant.", messages: [{ role: "user", content: prompt }], stream: true })
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

async function callOpenRouterStream(model: string, prompt: string, system: string | undefined, apiKey: string) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "system", content: (system || "You are a creative assistant.") + "\n\n[STRICT LANGUAGE RULE]: 반드시 요청받은 언어로 답변하십시오." }, { role: "user", content: prompt }], max_tokens: 1000, stream: true }) });
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
