import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const HF_BASE = 'https://api-inference.huggingface.co';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export class HuggingFaceProvider implements ILLMProvider {
  readonly name = 'huggingface';
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env['HUGGINGFACE_API_KEY'];
    this.model = process.env['HUGGINGFACE_MODEL'] ?? DEFAULT_MODEL;
    if (!this.apiKey) {
      console.warn('⚠️ HUGGINGFACE_API_KEY not set — running without auth (strict rate limits apply).');
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const response = await fetch(`${HF_BASE}/models/${this.model}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`HuggingFace error (${response.status}): ${err}`);
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
