import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { OllamaProvider } from './OllamaProvider';

interface OllamaChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  stream: boolean;
}

describe('OllamaProvider', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(async (_url: string, _opts: RequestInit) => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'hello from ollama' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('name is "ollama"', () => {
    const provider = new OllamaProvider();
    expect(provider.name).toBe('ollama');
  });

  test('generateText returns content from response', async () => {
    const provider = new OllamaProvider();
    const result = await provider.generateText('You are a helper.', 'Say hello.');
    expect(result.provider).toBe('ollama');
    expect(result.content).toBe('hello from ollama');
    expect(result.error).toBeUndefined();
  });

  test('generateText returns error on network failure', async () => {
    globalThis.fetch = mock(async () => { throw new Error('connection refused'); }) as unknown as typeof fetch;
    const provider = new OllamaProvider();
    let result;
    try {
      result = await provider.generateText('sys', 'user');
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(result!.content).toBe('');
    expect(result!.error).toContain('connection refused');
  });

  test('calls correct endpoint with correct body', async () => {
    let capturedUrl = '';
    let capturedBody: OllamaChatRequest | null = null;
    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      capturedUrl = url;
      capturedBody = JSON.parse(opts.body as string) as OllamaChatRequest;
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const provider = new OllamaProvider();
    try {
      await provider.generateText('sys prompt', 'user prompt');
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(capturedUrl).toBe('http://localhost:11434/v1/chat/completions');
    expect(capturedBody!.messages).toEqual([
      { role: 'system', content: 'sys prompt' },
      { role: 'user', content: 'user prompt' },
    ]);
    expect(capturedBody!.stream).toBe(false);
  });
});
