import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { HuggingFaceProvider } from './HuggingFaceProvider';

interface HFChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  max_tokens: number;
}

describe('HuggingFaceProvider', () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env['HUGGINGFACE_API_KEY'];

  beforeEach(() => {
    process.env['HUGGINGFACE_API_KEY'] = 'hf_test_token';
    globalThis.fetch = mock(async (_url: string, _opts: RequestInit) => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'hello from hf' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env['HUGGINGFACE_API_KEY'];
    } else {
      process.env['HUGGINGFACE_API_KEY'] = originalKey;
    }
  });

  test('name is "huggingface"', () => {
    const provider = new HuggingFaceProvider();
    expect(provider.name).toBe('huggingface');
  });

  test('generateText returns content from response', async () => {
    const provider = new HuggingFaceProvider();
    const result = await provider.generateText('You are a helper.', 'Say hello.');
    expect(result.provider).toBe('huggingface');
    expect(result.content).toBe('hello from hf');
    expect(result.error).toBeUndefined();
  });

  test('generateText returns error on non-ok response', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('{"error":"Model is loading"}', { status: 503 });
    }) as unknown as typeof fetch;
    try {
      const provider = new HuggingFaceProvider();
      const result = await provider.generateText('sys', 'user');
      expect(result.content).toBe('');
      expect(result.error).toContain('503');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('sends Authorization header and correct HF endpoint', async () => {
    let capturedUrl = '';
    let capturedHeaders: Headers | null = null;
    let capturedBody: HFChatRequest | null = null;

    globalThis.fetch = mock(async (url: string, opts: RequestInit) => {
      capturedUrl = url;
      capturedHeaders = new Headers(opts.headers as HeadersInit);
      capturedBody = JSON.parse(opts.body as string) as HFChatRequest;
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    try {
      const provider = new HuggingFaceProvider();
      await provider.generateText('sys', 'user');

      expect(capturedUrl).toContain('api-inference.huggingface.co');
      expect(capturedHeaders!.get('Authorization')).toBe('Bearer hf_test_token');
      expect(capturedBody!.messages).toEqual([
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'user' },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('does not send Authorization header when API key is absent', async () => {
    delete process.env['HUGGINGFACE_API_KEY'];
    let capturedHeaders: Headers | null = null;
    globalThis.fetch = mock(async (_url: string, opts: RequestInit) => {
      capturedHeaders = new Headers(opts.headers as HeadersInit);
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;
    try {
      const provider = new HuggingFaceProvider();
      await provider.generateText('sys', 'user');
      expect(capturedHeaders!.get('Authorization')).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
      process.env['HUGGINGFACE_API_KEY'] = 'hf_test_token'; // restore for afterEach
    }
  });
});
