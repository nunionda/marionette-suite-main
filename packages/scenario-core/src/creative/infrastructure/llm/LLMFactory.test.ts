import { describe, expect, test } from 'bun:test';
import { LLMFactory } from './LLMFactory';

describe('LLMFactory Orchestrator', () => {
  const factory = new LLMFactory();

  test('should successfully retrieve registered providers', () => {
    const anthropic = factory.getProvider('anthropic');
    const gemini = factory.getProvider('gemini');
    const groq = factory.getProvider('groq');

    expect(anthropic).toBeDefined();
    expect(anthropic.name).toBe('anthropic');

    expect(gemini).toBeDefined();
    expect(gemini.name).toBe('gemini');

    expect(groq).toBeDefined();
    expect(groq.name).toBe('groq');
  });

  test('should retrieve gemini tier variants', () => {
    const pro = factory.getProvider('gemini-pro');
    const long = factory.getProvider('gemini-long');

    expect(pro).toBeDefined();
    expect(pro.name).toBe('gemini-pro');

    expect(long).toBeDefined();
    expect(long.name).toBe('gemini-long');
  });

  test('should throw error for unregistered provider', () => {
    // @ts-expect-error Testing invalid runtime input
    expect(() => factory.getProvider('invalid')).toThrow();
  });

  test('runEnsemble should return responses for all providers', async () => {
    const responses = await factory.runEnsemble("System prompt", "User prompt");

    expect(responses).toBeInstanceOf(Array);
    expect(responses).toHaveLength(6); // anthropic, gemini, gemini-pro, gemini-long, groq, mock

    const providers = responses.map(r => r.provider).sort();
    expect(providers).toContain('mock');
    expect(providers).toContain('groq');
    expect(providers).toContain('gemini');
  }, 120_000); // Gemini retry backoff can take time when rate-limited
});
