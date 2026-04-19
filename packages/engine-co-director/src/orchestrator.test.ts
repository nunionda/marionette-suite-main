import { describe, expect, it, beforeEach } from "vitest";
import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import type {
  TextGenerateRequest,
  TextGenerateResult,
  TextProvider,
} from "@marionette/ai-providers/text";
import { createCoDirector } from "./orchestrator";

function stubProvider(response = "stub response"): TextProvider & {
  lastReq: TextGenerateRequest | null;
  calls: number;
} {
  const p: TextProvider & {
    lastReq: TextGenerateRequest | null;
    calls: number;
  } = {
    lastReq: null,
    calls: 0,
    meta: {
      id: "stub-text",
      label: "stub",
      capability: "text",
      tier: "free",
    },
    async probe() {
      return { state: "ready", lastProbeAt: Date.now() };
    },
    async generate(req) {
      p.lastReq = req;
      p.calls++;
      const r: TextGenerateResult = {
        providerId: "stub-text",
        text: response,
        finishReason: "stop",
      };
      return r;
    },
  };
  return p;
}

describe("CoDirector", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("summary returns a ProjectContext", async () => {
    await store.create({
      projectId: "p1",
      kind: "character",
      name: "Jane",
      references: [],
      attributes: {},
      tags: [],
    });
    const co = createCoDirector({
      store,
      resolveTextProvider: null,
    });
    const ctx = await co.summary("p1");
    expect(ctx.projectId).toBe("p1");
    expect(ctx.elements).toHaveLength(1);
  });

  it("suggest without provider returns only rule suggestions", async () => {
    const co = createCoDirector({
      store,
      resolveTextProvider: null,
    });
    const s = await co.suggest("p1");
    expect(s.every((x) => !x.id.startsWith("llm:"))).toBe(true);
  });

  it("suggest with provider appends LLM suggestions", async () => {
    const provider = stubProvider(
      "- [info] Storyboard scene 7 next — it's the emotional pivot",
    );
    const co = createCoDirector({
      store,
      resolveTextProvider: async () => provider,
    });
    await store.create({
      projectId: "p1",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j" }],
      attributes: {},
      tags: [],
    });
    const s = await co.suggest("p1");
    expect(provider.calls).toBe(1);
    expect(s.find((x) => x.id.startsWith("llm:"))).toBeDefined();
  });

  it("ask throws helpful error when no provider", async () => {
    const co = createCoDirector({
      store,
      resolveTextProvider: null,
    });
    await expect(
      co.ask("p1", { message: "hello" }),
    ).rejects.toThrow(/No text provider/i);
  });

  it("ask runs chat through provider with context injected into system", async () => {
    await store.create({
      projectId: "p1",
      kind: "character",
      name: "Jane",
      references: [],
      attributes: {},
      tags: [],
    });
    const provider = stubProvider("Here is my answer");
    const co = createCoDirector({
      store,
      resolveTextProvider: async () => provider,
    });
    const resp = await co.ask("p1", { message: "How is Jane looking?" });
    expect(resp.text).toBe("Here is my answer");
    expect(resp.providerId).toBe("stub-text");
    expect(provider.lastReq?.system).toContain("Jane");
    expect(provider.lastReq?.messages[0]?.content).toBe("How is Jane looking?");
  });

  it("graceful degrade: resolveTextProvider that throws → suggest returns rules only", async () => {
    const co = createCoDirector({
      store,
      resolveTextProvider: async () => {
        throw new Error("no healthy provider");
      },
    });
    const s = await co.suggest("p1");
    expect(s.every((x) => !x.id.startsWith("llm:"))).toBe(true);
  });
});
