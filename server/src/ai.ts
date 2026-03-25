import { Elysia, t } from "elysia";

export const aiRoutes = new Elysia({ prefix: "/ai" })
  .post("/stream", async ({ body, set }) => {
    const { prompt, system, model = "google/gemini-2.0-flash-001" } = body as any;
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";

    if (!apiKey) {
      set.status = 500;
      return { error: "API Key missing in server environment" };
    }

    console.log(`[AI_STREAM] Request: ${model} | Prompt Length: ${prompt?.length || 0}`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cine-script-writer.ai",
        "X-Title": "Cine Script Writer"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      console.error(`[AI_STREAM] Error: ${response.status}`);
      set.status = response.status;
      return response.json();
    }

    console.log(`[AI_STREAM] Streaming started...`);
    return response.body; // Return the stream directly to Elysia
  }, {
    body: t.Object({
      prompt: t.String(),
      system: t.String(),
      model: t.Optional(t.String())
    })
  })
  .post("/generate-image", async ({ body, set }) => {
    const { prompt, model = "black-forest-labs/flux-1-schnell" } = body as any;
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";

    if (!apiKey) {
      set.status = 500;
      return { error: "API Key missing in server environment" };
    }

    console.log(`[IMAGE_GEN] Request: ${model} | Prompt: ${prompt.substring(0, 50)}...`);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          response_format: "url"
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error(`[IMAGE_GEN] OpenRouter Error:`, err);
        set.status = response.status;
        return err;
      }

      const result = await response.json();
      return result; // Should contain { data: [{ url: "..." }] }
    } catch (err: any) {
      console.error(`[IMAGE_GEN] Fetch Error:`, err);
      set.status = 500;
      return { error: err.message };
    }
  }, {
    body: t.Object({
      prompt: t.String(),
      model: t.Optional(t.String())
    })
  });
