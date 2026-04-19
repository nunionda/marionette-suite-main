import { describe, expect, it, beforeEach } from "vitest";
import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import {
  collectReferencesForElements,
  combinedSeed,
  seedFromElementId,
} from "./shot-sequence";

describe("seed derivation", () => {
  it("is deterministic for same id", () => {
    expect(seedFromElementId("el_abc")).toBe(seedFromElementId("el_abc"));
  });

  it("is different across ids", () => {
    expect(seedFromElementId("el_a")).not.toBe(seedFromElementId("el_b"));
  });

  it("combinedSeed is order-independent", () => {
    const a = combinedSeed(["x", "y", "z"]);
    const b = combinedSeed(["z", "y", "x"]);
    expect(a).toBe(b);
  });

  it("combinedSeed undefined for empty", () => {
    expect(combinedSeed([])).toBeUndefined();
  });
});

describe("collectReferencesForElements", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("returns empty bundle for empty input", async () => {
    const r = await collectReferencesForElements(store, []);
    expect(r.references).toEqual([]);
    expect(r.usedElementIds).toEqual([]);
  });

  it("collects refs across elements in order", async () => {
    const a = await store.create({
      projectId: "p",
      kind: "character",
      name: "A",
      references: [
        { kind: "url", url: "a1" },
        { kind: "url", url: "a2" },
      ],
      attributes: {},
      tags: [],
    });
    const b = await store.create({
      projectId: "p",
      kind: "prop",
      name: "B",
      references: [{ kind: "url", url: "b1" }],
      attributes: {},
      tags: [],
    });
    const r = await collectReferencesForElements(store, [a.id, b.id]);
    expect(r.references).toHaveLength(3);
    expect(r.usedElementIds).toEqual([a.id, b.id]);
  });

  it("caps at 9 references — skips overflow, keeps earlier", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const el = await store.create({
        projectId: "p",
        kind: "character",
        name: `E${i}`,
        references: [
          { kind: "url", url: `${i}-1` },
          { kind: "url", url: `${i}-2` },
          { kind: "url", url: `${i}-3` },
        ],
        attributes: {},
        tags: [],
      });
      ids.push(el.id);
    }
    const r = await collectReferencesForElements(store, ids);
    // First 3 elements fit (9 refs), 4th is skipped entirely
    expect(r.references).toHaveLength(9);
    expect(r.usedElementIds).toEqual(ids.slice(0, 3));
  });

  it("picks up trained Soul ID modelIds", async () => {
    const el = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j1" }],
      identity: {
        provider: "soul-2.0",
        modelId: "soul_jane_42",
        trainingSampleIds: [],
        trained: true,
      },
      attributes: {},
      tags: [],
    });
    const r = await collectReferencesForElements(store, [el.id]);
    expect(r.soulModelIds).toEqual(["soul_jane_42"]);
  });

  it("identity-only element (no refs) still marks usedElementIds when trained", async () => {
    const el = await store.create({
      projectId: "p",
      kind: "character",
      name: "Ghost",
      references: [],
      identity: {
        provider: "soul-2.0",
        modelId: "soul_ghost",
        trainingSampleIds: [],
        trained: true,
      },
      attributes: {},
      tags: [],
    });
    const r = await collectReferencesForElements(store, [el.id]);
    expect(r.references).toEqual([]);
    expect(r.usedElementIds).toEqual([el.id]);
    expect(r.soulModelIds).toEqual(["soul_ghost"]);
  });

  it("silently skips unknown element ids", async () => {
    const r = await collectReferencesForElements(store, ["missing"]);
    expect(r.usedElementIds).toEqual([]);
  });
});
