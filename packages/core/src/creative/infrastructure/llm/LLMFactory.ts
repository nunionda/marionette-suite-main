import { ILLMProvider, LLMResponse } from './ILLMProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { MockProvider } from './MockProvider';

export class LLMFactory {
  private providers: Map<string, ILLMProvider> = new Map();

  constructor() {
    // Initialize all available providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('mock', new MockProvider());
  }

  /**
   * Get a specific provider by name.
   */
  getProvider(name: 'openai' | 'anthropic' | 'gemini' | 'mock'): ILLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} is not registered.`);
    }
    return provider;
  }

  /**
   * Run all providers in parallel for the same prompt.
   * Useful for Ensemble voting or comparing AI extraction consistency.
   */
  async runEnsemble(systemPrompt: string, userPrompt: string): Promise<LLMResponse[]> {
    const activeProviders = Array.from(this.providers.values());
    
    // Fire all LLM requests concurrently
    const promises = activeProviders.map(provider => 
      provider.generateText(systemPrompt, userPrompt)
    );

    return Promise.all(promises);
  }
}
