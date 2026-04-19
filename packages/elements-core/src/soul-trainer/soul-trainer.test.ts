import { describe, expect, it, beforeEach } from "vitest";
import { createInMemoryElementStore, type ElementStore } from "../store/index";
import type { ElementDraft } from "../types";
import { createMockSoulTrainer, trainElement } from "./index";

function draft(overrides: Partial<ElementDraft> = {}): ElementDraft {
  return {
    projectId: "proj-28",
    kind: "character",
    name: "Jane",
    references: [
      { kind: "url", url: "https://example.com/j1.jpg" },
      { kind: "url", url: "https://example.com/j2.jpg" },
      { kind: "url", url: "https://example.com/j3.jpg" },
    ],
    attributes: {},
    tags: [],
    ...overrides,
  };
}

describe("soul trainer", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("submit + poll cycle resolves to `done` with identity", async () => {
    const trainer = createMockSoulTrainer({ mockDurationMs: 10 });
    const { jobId } = await trainer.submit({
      element: { id: "x", projectId: "p", kind: "character", name: "Jane" },
      references: [{ kind: "url", url: "a" }],
    });
    // running
    const s1 = await trainer.poll(jobId);
    expect(["running", "done"]).toContain(s1.state);
    // wait for completion
    await new Promise((r) => setTimeout(r, 30));
    const s2 = await trainer.poll(jobId);
    expect(s2.state).toBe("done");
    if (s2.state === "done") {
      expect(s2.identity.trained).toBe(true);
      expect(s2.identity.provider).toBe("lora");
      expect(s2.identity.modelId).toContain("mock_lora");
    }
  });

  it("trainElement end-to-end patches store.identity", async () => {
    const el = await store.create(draft());
    expect(el.identity).toBeUndefined();

    const trainer = createMockSoulTrainer({ mockDurationMs: 10 });
    const updated = await trainElement(store, trainer, el.id, {
      pollIntervalMs: 5,
    });

    expect(updated.identity?.trained).toBe(true);
    expect(updated.identity?.provider).toBe("lora");
    expect(updated.identity?.trainingSampleIds).toHaveLength(3);

    const fromStore = await store.get(el.id);
    expect(fromStore?.identity?.modelId).toBe(updated.identity?.modelId);
  });

  it("trainElement refuses when references[] is empty", async () => {
    const el = await store.create(draft({ references: [] }));
    const trainer = createMockSoulTrainer({ mockDurationMs: 5 });
    await expect(
      trainElement(store, trainer, el.id, { pollIntervalMs: 5 }),
    ).rejects.toThrow(/references\[] is empty/i);
  });

  it("trainElement throws for missing element id", async () => {
    const trainer = createMockSoulTrainer({ mockDurationMs: 5 });
    await expect(
      trainElement(store, trainer, "missing", { pollIntervalMs: 5 }),
    ).rejects.toThrow(/not found/i);
  });

  it("trainElement surfaces failure from trainer", async () => {
    const el = await store.create(draft());
    const trainer = createMockSoulTrainer({
      mockDurationMs: 10,
      forceFailure: "simulated vendor error",
    });
    await expect(
      trainElement(store, trainer, el.id, { pollIntervalMs: 5 }),
    ).rejects.toThrow(/simulated vendor error/);

    // Element should remain without identity after failure.
    const after = await store.get(el.id);
    expect(after?.identity).toBeUndefined();
  });

  it("trainElement calls onProgress hook at least once", async () => {
    const el = await store.create(draft());
    const trainer = createMockSoulTrainer({ mockDurationMs: 15 });
    const states: string[] = [];
    await trainElement(store, trainer, el.id, {
      pollIntervalMs: 5,
      onProgress: (s) => states.push(s.state),
    });
    expect(states.length).toBeGreaterThan(0);
    expect(states[states.length - 1]).toBe("done");
  });
});
