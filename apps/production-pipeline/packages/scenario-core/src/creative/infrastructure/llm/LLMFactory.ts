import type { ILLMProvider, LLMResponse } from './ILLMProvider';
import type { ProviderChoice } from './AnalysisStrategy';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { OllamaProvider } from './OllamaProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { MockProvider } from './MockProvider';

/**
 * Fallback chain order: Gemini Free → Ollama → HuggingFace → Groq → Anthropic → Mock
 * Each provider is tried in order. On failure/rate-limit, the chain moves to the next.
 * Providers without API keys are skipped gracefully.
 */
export const FALLBACK_CHAIN_ORDER: ProviderChoice[] = [
  'gemini',
  'ollama',
  'huggingface',
  'groq',
  'anthropic',
  'mock',
];

export class LLMFactory {
  private providers: Map<string, ILLMProvider> = new Map();

  constructor() {
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider('standard'));
    this.providers.set('gemini-pro', new GeminiProvider('pro'));
    this.providers.set('gemini-long', new GeminiProvider('long-context'));
    this.providers.set('groq', new GroqProvider());
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('huggingface', new HuggingFaceProvider());
    this.providers.set('mock', new MockProvider());
  }

  getProvider(name: ProviderChoice): ILLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} is not registered.`);
    }
    return provider;
  }

  /**
   * Run the fallback chain: tries each provider in order.
   * A provider is considered failed if its response has an error or empty content.
   * Returns the first successful response, or the last failure.
   */
  async runFallbackChain(
    systemPrompt: string,
    userPrompt: string,
    chain?: ProviderChoice[],
  ): Promise<LLMResponse> {
    const order = chain || FALLBACK_CHAIN_ORDER;
    let lastResponse: LLMResponse | null = null;

    for (const providerName of order) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        const response = await provider.generateText(systemPrompt, userPrompt);

        // Success: has content and no error
        if (response.content && !response.error) {
          return response;
        }

        // Provider returned an error (e.g., API key missing, all models exhausted)
        lastResponse = response;
        console.warn(`⚠️ [FallbackChain] ${providerName} failed: ${response.error || 'empty content'}, trying next...`);
      } catch (error: any) {
        lastResponse = {
          provider: providerName,
          model: 'unknown',
          content: '',
          latencyMs: 0,
          error: error.message,
        };
        console.warn(`⚠️ [FallbackChain] ${providerName} threw: ${error.message}, trying next...`);
      }
    }

    return lastResponse || {
      provider: 'none',
      model: 'none',
      content: '',
      latencyMs: 0,
      error: 'No providers available in fallback chain',
    };
  }

  async runEnsemble(systemPrompt: string, userPrompt: string): Promise<LLMResponse[]> {
    const activeProviders = Array.from(this.providers.values());
    const promises = activeProviders.map(provider =>
      provider.generateText(systemPrompt, userPrompt)
    );
    return Promise.all(promises);
  }
}
