import { describe, it, expect } from "bun:test"
import { AIGateway } from "../src/gateway.js"
import type {
  TextProvider,
  ImageProvider,
  AudioProvider,
  TTSProvider,
  TextOptions,
  ImageOptions,
  AudioOptions,
  TTSOptions,
} from "../src/types.js"

// ─── Mock providers ───

class MockTextProvider implements TextProvider {
  async generateText(prompt: string, _options?: TextOptions): Promise<string> {
    return `mock-text: ${prompt}`
  }
}

class MockImageProvider implements ImageProvider {
  async generateImage(prompt: string, _options?: ImageOptions): Promise<Buffer> {
    return Buffer.from(`mock-image: ${prompt}`)
  }
}

class MockAudioProvider implements AudioProvider {
  async generateAudio(prompt: string, _options?: AudioOptions): Promise<Buffer> {
    return Buffer.from(`mock-audio: ${prompt}`)
  }
}

class MockTTSProvider implements TTSProvider {
  async generateTTS(text: string, _options?: TTSOptions): Promise<Buffer> {
    return Buffer.from(`mock-tts: ${text}`)
  }
}

class MockMultiProvider implements TextProvider, ImageProvider {
  async generateText(prompt: string, _options?: TextOptions): Promise<string> {
    return `multi-text: ${prompt}`
  }
  async generateImage(prompt: string, _options?: ImageOptions): Promise<Buffer> {
    return Buffer.from(`multi-image: ${prompt}`)
  }
}

// ─── Tests ───

describe("AIGateway", () => {
  it("routes text() to a registered TextProvider", async () => {
    const gw = new AIGateway()
    gw.register("mock", new MockTextProvider(), true)

    const result = await gw.text("hello")
    expect(result).toBe("mock-text: hello")
  })

  it("routes image() to a registered ImageProvider", async () => {
    const gw = new AIGateway()
    gw.register("mock", new MockImageProvider(), true)

    const result = await gw.image("sunset")
    expect(result.toString()).toBe("mock-image: sunset")
  })

  it("routes audio() to a registered AudioProvider", async () => {
    const gw = new AIGateway()
    gw.register("mock", new MockAudioProvider(), true)

    const result = await gw.audio("ambient rain")
    expect(result.toString()).toBe("mock-audio: ambient rain")
  })

  it("routes tts() to a registered TTSProvider", async () => {
    const gw = new AIGateway()
    gw.register("mock", new MockTTSProvider(), true)

    const result = await gw.tts("Hello world")
    expect(result.toString()).toBe("mock-tts: Hello world")
  })

  it("resolves provider by explicit name", async () => {
    const gw = new AIGateway()
    gw.register("alpha", new MockTextProvider())
    gw.register("beta", new MockMultiProvider())

    const result = await gw.text("test", { provider: "beta" })
    expect(result).toBe("multi-text: test")
  })

  it("falls back to default provider", async () => {
    const gw = new AIGateway()
    gw.register("secondary", new MockTextProvider())
    gw.register("primary", new MockMultiProvider(), true)

    // No provider specified -> uses default ("primary")
    const result = await gw.text("test")
    expect(result).toBe("multi-text: test")
  })

  it("falls back to any capable provider when no default set", async () => {
    const gw = new AIGateway()
    gw.register("only-text", new MockTextProvider())

    const result = await gw.text("test")
    expect(result).toBe("mock-text: test")
  })

  it("throws when no provider supports the requested capability", async () => {
    const gw = new AIGateway()
    gw.register("text-only", new MockTextProvider(), true)

    await expect(gw.image("test")).rejects.toThrow(
      /No registered provider supports the "image" capability/,
    )
  })

  it("throws when named provider is not registered", async () => {
    const gw = new AIGateway()
    gw.register("mock", new MockTextProvider())

    await expect(gw.text("test", { provider: "nonexistent" })).rejects.toThrow(
      /No provider registered with name "nonexistent"/,
    )
  })

  it("throws when named provider lacks requested capability", async () => {
    const gw = new AIGateway()
    gw.register("text-only", new MockTextProvider())

    await expect(gw.image("test", { provider: "text-only" })).rejects.toThrow(
      /Provider "text-only" does not support the "image" capability/,
    )
  })

  it("supports fluent register chaining", () => {
    const gw = new AIGateway()
    const result = gw
      .register("a", new MockTextProvider())
      .register("b", new MockImageProvider())

    expect(result).toBe(gw)
  })

  it("handles multi-capability provider for different capabilities", async () => {
    const gw = new AIGateway()
    gw.register("multi", new MockMultiProvider(), true)

    const textResult = await gw.text("hello")
    expect(textResult).toBe("multi-text: hello")

    const imageResult = await gw.image("sunset")
    expect(imageResult.toString()).toBe("multi-image: sunset")
  })
})
