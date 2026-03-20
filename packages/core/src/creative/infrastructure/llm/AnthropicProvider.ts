import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../../shared/env';
import { ILLMProvider, LLMResponse } from './ILLMProvider';

export class AnthropicProvider implements ILLMProvider {
  readonly name = 'anthropic';
  private client: Anthropic | null = null;
  private readonly defaultModel = 'claude-3-5-sonnet-20241022';

  constructor() {
    if (env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    } else {
      console.warn("⚠️ ANTHROPIC_API_KEY is not set. AnthropicProvider will be disabled.");
    }
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    try {
      if (!this.client) throw new Error("API Key missing");

      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 4096,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      // Extract text from the first content block
      const contentBlock = response.content[0];
      const content = contentBlock.type === 'text' ? contentBlock.text : "";

      return {
        provider: this.name,
        model: this.defaultModel,
        content,
        latencyMs: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        provider: this.name,
        model: this.defaultModel,
        content: "",
        latencyMs: Date.now() - startTime,
        error: error.message
      };
    }
  }
}
