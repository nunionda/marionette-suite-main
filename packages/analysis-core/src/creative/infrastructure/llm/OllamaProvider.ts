import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export class OllamaProvider implements ILLMProvider {
  readonly name = 'ollama';
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env['OLLAMA_BASE_URL'] ?? DEFAULT_BASE_URL;
    this.model = process.env['OLLAMA_MODEL'] ?? DEFAULT_MODEL;
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama error (${response.status}): ${err}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      return {
        provider: this.name,
        model: this.model,
        content: data.choices[0]?.message?.content ?? '',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        provider: this.name,
        model: this.model,
        content: '',
        latencyMs: Date.now() - startTime,
        error: message,
      };
    }
  }
}
