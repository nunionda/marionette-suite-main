import type { ILLMProvider, LLMResponse } from './ILLMProvider';

const INFERENCE_API_URL = 'https://api-inference.huggingface.co/models';

const MODEL_CHAIN = [
  'mistralai/Mistral-7B-Instruct-v0.2',
  'google/gemma-2b-it',
];

export class HuggingFaceProvider implements ILLMProvider {
  readonly name = 'huggingface';
  private readonly apiKey: string | undefined;
  private readonly maxRetries = 2;
  private readonly retryDelayMs = 1000;

  constructor() {
    this.apiKey = process.env['HUGGINGFACE_API_KEY'] || process.env['HF_TOKEN'] || process.env['HF_API_TOKEN'];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    if (!this.apiKey) {
      return {
        provider: this.name,
        model: 'none',
        content: '',
        latencyMs: 0,
        error: 'API Key missing',
      };
    }

    const prompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
    let lastError = '';

    for (const model of MODEL_CHAIN) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const response = await fetch(`${INFERENCE_API_URL}/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                temperature: 0.2,
                max_new_tokens: 4096,
                return_full_text: false,
              },
            }),
          });

          // Model loading (503) or rate limit (429) — retry
          if (response.status === 503 || response.status === 429) {
            if (attempt < this.maxRetries) {
              await this.sleep(this.retryDelayMs * (attempt + 1));
              continue;
            }
            lastError = `HTTP ${response.status}`;
            break;
          }

          if (!response.ok) {
            lastError = `HTTP ${response.status}`;
            break;
          }

          const data = await response.json() as Array<{ generated_text?: string }>;
          const content = data?.[0]?.generated_text?.trim() || '';

          return {
            provider: this.name,
            model,
            content,
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
      error: `All HuggingFace models failed. ${lastError}`,
    };
  }
}
