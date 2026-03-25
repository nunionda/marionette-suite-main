// src/infrastructure/OpenRouterAdapter.js

/**
 * OpenRouterAdapter
 * 외부 API(OpenRouter)와의 원시 스트리밍 통신을 전담하는 Infrastructure 레이어입니다.
 * 도메인(React UI나 비즈니스 룰)에 대한 지식 없이, 순수하게 HTTP 요청과 SSE 파싱만 수행합니다.
 */
export class OpenRouterAdapter {
  static async streamChatCompletion(apiKey, systemPrompt, userPrompt, onChunk, onError, onComplete, mode = 'agent') {
    try {
      const response = await fetch('http://127.0.0.1:3005/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          prompt: userPrompt,
          mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData.error?.message) || response.statusText || 'Unknown Server Error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim().startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices[0]?.delta?.content;
            if (delta) {
              onChunk(delta);
            }
          } catch(e) {
            // Ignore parse errors on incomplete chunks
          }
        }
      }
      if (onComplete) onComplete();
    } catch (err) {
      if (onError) onError(err.message);
    }
  }
  
  static async generateImage(prompt) {
    const response = await fetch('http://127.0.0.1:3005/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData.error?.message) || response.statusText || 'Image Generation Failed');
    }

    return await response.json(); // Returns { data: [{ url: "..." }] }
  }

  static async generateVideo(prompt, apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    const response = await fetch('http://127.0.0.1:3005/api/ai/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey })
    });
    const data = await response.json();
    return data;
  }

  static async refineImagePrompt(prompt) {
    const response = await fetch('http://127.0.0.1:3005/api/ai/refine-image-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData.error) || response.statusText || 'Prompt Refinement Failed');
    }

    return await response.json(); // Returns { success: true, refinedPrompt: "..." }
  }
}
