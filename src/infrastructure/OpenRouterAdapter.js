// src/infrastructure/OpenRouterAdapter.js

/**
 * OpenRouterAdapter
 * 외부 API(OpenRouter)와의 원시 스트리밍 통신을 전담하는 Infrastructure 레이어입니다.
 * 도메인(React UI나 비즈니스 룰)에 대한 지식 없이, 순수하게 HTTP 요청과 SSE 파싱만 수행합니다.
 */
export class OpenRouterAdapter {
  static async streamChatCompletion(apiKey, systemPrompt, userPrompt, onChunk, onError, onComplete) {
    try {
      const response = await fetch('http://localhost:3001/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          prompt: userPrompt,
          model: 'google/gemini-2.0-flash-001'
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
}
