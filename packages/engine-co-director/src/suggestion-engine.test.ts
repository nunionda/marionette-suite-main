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
import { buildProjectContext } from "./project-context";
import {
  computeRuleSuggestions,
  computeSuggestions,
  UNTRAINED_USAGE_WARN_THRESHOLD,
} from "./suggestion-engine";

function fakeTextProvider(
  response: string,
  opts: { throws?: boolean } = {},
): TextProvider & { lastReq: TextGenerateRequest | null } {
  const p: TextProvider & { lastReq: TextGenerateRequest | null } = {
    lastReq: null,
    meta: {
      id: "fake-text",
      label: "Fake Text",
      capability: "text",
      tier: "free",
    },
    async probe() {
      return { state: "ready", lastProbeAt: Date.now() };
    },
    async generate(req) {
      p.lastReq = req;
      if (opts.throws) throw new Error("simulated provider down");
      const result: TextGenerateResult = {
        providerId: "fake-text",
        text: response,
        finishReason: "stop",
      };
      return result;
    },
  };
  return p;
}

describe("computeRuleSuggestions", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("empty project → suggest create-element", async () => {
    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    expect(s).toHaveLength(1);
    expect(s[0]!.id).toBe("empty-project");
    expect(s[0]!.action?.kind).toBe("create-element");
  });

  it("untrained element with ≥3 usages → warn train", async () => {
    const jane = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j" }],
      attributes: {},
      tags: [],
    });
    for (let i = 0; i < UNTRAINED_USAGE_WARN_THRESHOLD; i++) {
      await store.recordUsage(jane.id, { nodeId: `cinema:s${i}:sh1` });
    }
    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    const warn = s.find((x) => x.action?.kind === "train-soul");
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe("warn");
    expect(warn!.action?.elementId).toBe(jane.id);
  });

  it("below threshold → no train suggestion", async () => {
    const jane = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j" }],
      attributes: {},
      tags: [],
    });
    await store.recordUsage(jane.id, { nodeId: "x" });
    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    expect(s.find((x) => x.action?.kind === "train-soul")).toBeUndefined();
  });

  it("trained but low consistency → retrain suggestion", async () => {
    await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j" }],
      identity: {
        provider: "lora",
        modelId: "m",
        trainingSampleIds: [],
        trained: true,
        consistencyScore: 0.5,
      },
      attributes: {},
      tags: [],
    });
    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    const retrain = s.find((x) => x.action?.kind === "retrain-soul");
    expect(retrain).toBeDefined();
  });

  it("element with no refs + untrained → critical", async () => {
    await store.create({
      projectId: "p",
      kind: "character",
      name: "Ghost",
      references: [],
      attributes: {},
      tags: [],
    });
    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    const crit = s.find((x) => x.action?.kind === "add-references");
    expect(crit?.severity).toBe("critical");
  });

  it("≥3 unused elements + totalElements > 5 → orphan suggestion", async () => {
    for (let i = 0; i < 6; i++) {
      await store.create({
        projectId: "p",
        kind: "prop",
        name: `Prop ${i}`,
        references: [{ kind: "url", url: `u${i}` }],
        attributes: {},
        tags: [],
      });
    }
    // Use only 2 of them so 4 remain unused.
    const all = await store.query({ projectId: "p" });
    await store.recordUsage(all[0]!.id, { nodeId: "x" });
    await store.recordUsage(all[1]!.id, { nodeId: "y" });

    const ctx = await buildProjectContext(store, "p");
    const s = computeRuleSuggestions(ctx);
    expect(s.find((x) => x.id === "orphans")).toBeDefined();
  });
});

describe("computeSuggestions (with LLM)", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("no provider → rule suggestions only", async () => {
    const ctx = await buildProjectContext(store, "p");
    const s = await computeSuggestions(ctx);
    expect(s).toHaveLength(1);
    expect(s[0]!.id).toBe("empty-project");
  });

  it("appends LLM suggestions parsed from bullet lines", async () => {
    const provider = fakeTextProvider(
      `- [warn] Train Jane's Soul ID — she appears in 4 shots
- [info] Storyboard scene 7 next — it's the emotional pivot`,
    );
    const ctx = await buildProjectContext(store, "p");
    const s = await computeSuggestions(ctx, { textProvider: provider });
    expect(s.length).toBeGreaterThan(1);
    const llm = s.filter((x) => x.id.startsWith("llm:"));
    expect(llm).toHaveLength(2);
    expect(llm[0]!.severity).toBe("warn");
    expect(llm[0]!.title).toContain("Jane");
  });

  it("includes the user question in the LLM request", async () => {
    const provider = fakeTextProvider("- [info] ok — go for it");
    const ctx = await buildProjectContext(store, "p");
    await computeSuggestions(ctx, {
      textProvider: provider,
      question: "Should I shoot scene 7 today?",
    });
    const userMsg = provider.lastReq?.messages[0]?.content;
    expect(userMsg).toContain("scene 7");
  });

  it("LLM failure → rule suggestions + error note, no throw", async () => {
    const provider = fakeTextProvider("", { throws: true });
    const ctx = await buildProjectContext(store, "p");
    const s = await computeSuggestions(ctx, { textProvider: provider });
    const err = s.find((x) => x.id === "llm:error");
    expect(err).toBeDefined();
    expect(err!.rationale).toContain("simulated provider down");
  });

  it("enableLlm: false skips LLM even with provider", async () => {
    const provider = fakeTextProvider("should not be called");
    const ctx = await buildProjectContext(store, "p");
    await computeSuggestions(ctx, {
      textProvider: provider,
      enableLlm: false,
    });
    expect(provider.lastReq).toBeNull();
  });

  it("unparseable LLM text falls back to a single raw note", async () => {
    const provider = fakeTextProvider("Just some freeform prose without bullets.");
    const ctx = await buildProjectContext(store, "p");
    const s = await computeSuggestions(ctx, { textProvider: provider });
    const raw = s.find((x) => x.id === "llm:raw");
    expect(raw?.title).toBe("Co-director note");
    expect(raw?.rationale).toContain("freeform prose");
  });
});
