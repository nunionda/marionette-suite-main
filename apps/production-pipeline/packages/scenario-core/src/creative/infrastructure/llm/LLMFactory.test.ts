import { describe, expect, test, mock, beforeEach } from 'bun:test';
import { LLMFactory, FALLBACK_CHAIN_ORDER } from './LLMFactory';
import type { ILLMProvider, LLMResponse } from './ILLMProvider';

// --- Helper: create a mock provider ---
function createMockProvider(
  name: string,
  behavior: 'success' | 'error' | 'throw' | 'empty',
): ILLMProvider {
  return {
    name,
    generateText: async (_sys: string, _user: string): Promise<LLMResponse> => {
      switch (behavior) {
        case 'success':
          return { provider: name, model: 'test-model', content: `Response from ${name}`, latencyMs: 10 };
        case 'error':
          return { provider: name, model: 'none', content: '', latencyMs: 0, error: 'API Key missing' };
        case 'throw':
          throw new Error(`${name} network failure`);
        case 'empty':
          return { provider: name, model: 'test-model', content: '', latencyMs: 5 };
      }
    },
  };
}

// --- Test: Chain Order Constant ---
describe('FALLBACK_CHAIN_ORDER', () => {
  test('Gemini is index 0', () => {
    expect(FALLBACK_CHAIN_ORDER[0]).toBe('gemini');
  });

  test('Anthropic is last before mock', () => {
    const idx = FALLBACK_CHAIN_ORDER.indexOf('anthropic');
    const mockIdx = FALLBACK_CHAIN_ORDER.indexOf('mock');
    expect(idx).toBeGreaterThan(0);
    expect(mockIdx).toBe(FALLBACK_CHAIN_ORDER.length - 1);
    expect(idx).toBe(mockIdx - 1);
  });

  test('full chain order is Gemini → Ollama → HuggingFace → Groq → Anthropic → Mock', () => {
    expect(FALLBACK_CHAIN_ORDER).toEqual([
      'gemini', 'ollama', 'huggingface', 'groq', 'anthropic', 'mock',
    ]);
  });
});

// --- Test: Provider Registry ---
describe('LLMFactory Provider Registry', () => {
  const factory = new LLMFactory();

  test('should retrieve all registered providers', () => {
    const providers = ['anthropic', 'gemini', 'gemini-pro', 'gemini-long', 'groq', 'ollama', 'huggingface', 'mock'] as const;
    for (const name of providers) {
      const provider = factory.getProvider(name);
      expect(provider).toBeDefined();
    }
  });

  test('should throw error for unregistered provider', () => {
    // @ts-expect-error Testing invalid runtime input
    expect(() => factory.getProvider('invalid')).toThrow('Provider invalid is not registered.');
  });

  test('ollama provider should have correct name', () => {
    expect(factory.getProvider('ollama').name).toBe('ollama');
  });

  test('huggingface provider should have correct name', () => {
    expect(factory.getProvider('huggingface').name).toBe('huggingface');
  });
});

// --- Test: Fallback Chain ---
describe('LLMFactory Fallback Chain', () => {
  test('chain order: Gemini first, Anthropic last (before mock)', async () => {
    // Track which providers are called and in what order
    const callOrder: string[] = [];

    const factory = new LLMFactory();

    // Override all providers with failing mocks to track call order
    const failingProvider = (name: string): ILLMProvider => ({
      name,
      generateText: async () => {
        callOrder.push(name);
        return { provider: name, model: 'none', content: '', latencyMs: 0, error: 'test-fail' };
      },
    });

    // Access private providers map via type assertion
    const factoryAny = factory as any;
    factoryAny.providers.set('gemini', failingProvider('gemini'));
    factoryAny.providers.set('ollama', failingProvider('ollama'));
    factoryAny.providers.set('huggingface', failingProvider('huggingface'));
    factoryAny.providers.set('groq', failingProvider('groq'));
    factoryAny.providers.set('anthropic', failingProvider('anthropic'));
    factoryAny.providers.set('mock', failingProvider('mock'));

    await factory.runFallbackChain('sys', 'usr');

    expect(callOrder).toEqual(['gemini', 'ollama', 'huggingface', 'groq', 'anthropic', 'mock']);
  });

  test('returns first successful provider response', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    // Gemini fails, Ollama succeeds
    factoryAny.providers.set('gemini', createMockProvider('gemini', 'error'));
    factoryAny.providers.set('ollama', createMockProvider('ollama', 'success'));
    factoryAny.providers.set('huggingface', createMockProvider('huggingface', 'success'));

    const result = await factory.runFallbackChain('sys', 'usr');

    expect(result.provider).toBe('ollama');
    expect(result.content).toBe('Response from ollama');
    expect(result.error).toBeUndefined();
  });

  test('skips provider that throws and continues chain', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    factoryAny.providers.set('gemini', createMockProvider('gemini', 'throw'));
    factoryAny.providers.set('ollama', createMockProvider('ollama', 'throw'));
    factoryAny.providers.set('huggingface', createMockProvider('huggingface', 'success'));

    const result = await factory.runFallbackChain('sys', 'usr');

    expect(result.provider).toBe('huggingface');
    expect(result.content).toBe('Response from huggingface');
  });

  test('skips provider with empty content', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    factoryAny.providers.set('gemini', createMockProvider('gemini', 'empty'));
    factoryAny.providers.set('ollama', createMockProvider('ollama', 'success'));

    const result = await factory.runFallbackChain('sys', 'usr');

    expect(result.provider).toBe('ollama');
  });

  test('gracefully skips provider with missing API key', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    // Simulate API key missing responses
    factoryAny.providers.set('gemini', createMockProvider('gemini', 'error'));
    factoryAny.providers.set('ollama', createMockProvider('ollama', 'error'));
    factoryAny.providers.set('huggingface', createMockProvider('huggingface', 'error'));
    factoryAny.providers.set('groq', createMockProvider('groq', 'error'));
    factoryAny.providers.set('anthropic', createMockProvider('anthropic', 'error'));
    factoryAny.providers.set('mock', createMockProvider('mock', 'success'));

    const result = await factory.runFallbackChain('sys', 'usr');

    expect(result.provider).toBe('mock');
    expect(result.content).toBe('Response from mock');
  });

  test('returns last error when all providers fail', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    factoryAny.providers.set('gemini', createMockProvider('gemini', 'error'));
    factoryAny.providers.set('ollama', createMockProvider('ollama', 'error'));
    factoryAny.providers.set('huggingface', createMockProvider('huggingface', 'error'));
    factoryAny.providers.set('groq', createMockProvider('groq', 'error'));
    factoryAny.providers.set('anthropic', createMockProvider('anthropic', 'error'));
    factoryAny.providers.set('mock', createMockProvider('mock', 'error'));

    const result = await factory.runFallbackChain('sys', 'usr');

    expect(result.error).toBeDefined();
    expect(result.content).toBe('');
  });

  test('supports custom chain order', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    const callOrder: string[] = [];
    const trackingProvider = (name: string): ILLMProvider => ({
      name,
      generateText: async () => {
        callOrder.push(name);
        return { provider: name, model: 'test', content: `from-${name}`, latencyMs: 1 };
      },
    });

    factoryAny.providers.set('groq', trackingProvider('groq'));
    factoryAny.providers.set('anthropic', trackingProvider('anthropic'));

    const result = await factory.runFallbackChain('sys', 'usr', ['groq', 'anthropic']);

    // Should use groq first (custom order) and succeed immediately
    expect(result.provider).toBe('groq');
    expect(callOrder).toEqual(['groq']);
  });

  test('returns fallback response when chain is empty', async () => {
    const factory = new LLMFactory();

    const result = await factory.runFallbackChain('sys', 'usr', []);

    expect(result.error).toBe('No providers available in fallback chain');
  });
});

// --- Test: Ensemble (existing functionality) ---
describe('LLMFactory Ensemble', () => {
  test('runEnsemble returns responses from all providers', async () => {
    const factory = new LLMFactory();
    const factoryAny = factory as any;

    // Replace all with mock providers for fast testing
    const names = ['anthropic', 'gemini', 'gemini-pro', 'gemini-long', 'groq', 'ollama', 'huggingface', 'mock'];
    for (const name of names) {
      factoryAny.providers.set(name, createMockProvider(name, 'success'));
    }

    const responses = await factory.runEnsemble('sys', 'usr');

    expect(responses).toBeInstanceOf(Array);
    expect(responses).toHaveLength(8);

    const providerNames = responses.map(r => r.provider).sort();
    expect(providerNames).toContain('ollama');
    expect(providerNames).toContain('huggingface');
    expect(providerNames).toContain('mock');
  });
});
