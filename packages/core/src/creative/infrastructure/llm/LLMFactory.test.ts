import { describe, expect, test } from 'bun:test';
import { LLMFactory } from './LLMFactory';

describe('LLMFactory Orchestrator', () => {
  const factory = new LLMFactory();

  test('should successfully retrieve registered providers', () => {
    const openai = factory.getProvider('openai');
    const anthropic = factory.getProvider('anthropic');
    const gemini = factory.getProvider('gemini');

    expect(openai).toBeDefined();
    expect(openai.name).toBe('openai');
    
    expect(anthropic).toBeDefined();
    expect(anthropic.name).toBe('anthropic');
    
    expect(gemini).toBeDefined();
    expect(gemini.name).toBe('gemini');
  });

  test('should throw error for unregistered provider', () => {
    // @ts-expect-error Testing invalid runtime input
    expect(() => factory.getProvider('invalid')).toThrow();
  });

  test('runEnsemble should return an array of responses identical to the number of providers', async () => {
    // In a pure unit test without network, the providers will catch API key missing errors
    // and return the error gracefully inside the LLMResponse interface instead of crashing.
    const responses = await factory.runEnsemble("System prompt", "User prompt");
    
    expect(responses).toBeInstanceOf(Array);
    expect(responses).toHaveLength(4); // OpenAI, Anthropic, Gemini, Mock

    const providers = responses.map(r => r.provider).sort();
    expect(providers).toEqual(['anthropic', 'gemini', 'mock', 'openai']);
  });
});
