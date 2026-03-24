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
  });
