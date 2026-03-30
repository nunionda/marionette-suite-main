import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const DEFAULT_BASE_URL = 'http://localhost:11434';

const MODEL_CHAIN = [
  'llama3.2',
  'llama3.1',
  'mistral',
  'gemma2',
];

export class OllamaProvider implements ILLMProvider {
  readonly name = 'ollama';
  private readonly baseUrl: string;
  private readonly maxRetries = 2;
  private readonly retryDelayMs = 1000;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env['OLLAMA_BASE_URL'] || DEFAULT_BASE_URL;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    const available = await this.isAvailable();
    if (!available) {
      return {
        provider: this.name,
        model: 'none',
        content: '',
        latencyMs: Date.now() - startTime,
        error: 'Ollama server not available',
      };
    }

    let lastError = '';

    for (const model of MODEL_CHAIN) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              stream: false,
              options: { temperature: 0.2 },
            }),
          });

          if (!response.ok) {
            const isRetryable = response.status === 429 || response.status === 503;
            if (isRetryable && attempt < this.maxRetries) {
              await this.sleep(this.retryDelayMs * (attempt + 1));
              continue;
            }
            // Model not found or exhausted retries — try next model
            lastError = `HTTP ${response.status}`;
            break;
          }

          const data = await response.json() as { message?: { content?: string } };
          return {
            provider: this.name,
            model,
            content: data.message?.content || '',
            latencyMs: Date.now() - startTime,
          };
        } catch (error: any) {
          lastError = error.message;
          if (attempt < this.maxRetries) {
            await this.sleep(this.retryDelayMs * (attempt + 1));
            continue;
          }
          break;
        }
      }
    }

    return {
      provider: this.name,
      model: 'all-exhausted',
      content: '',
      latencyMs: Date.now() - startTime,
      error: `All Ollama models failed. ${lastError}`,
    };
  }
}
