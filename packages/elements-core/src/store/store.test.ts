import { describe, expect, it, beforeEach } from "vitest";
import type { ElementDraft } from "../types";
import { createInMemoryElementStore, createPgLiteElementStore, type ElementStore } from "./index";

function draft(overrides: Partial<ElementDraft> = {}): ElementDraft {
  return {
    projectId: "proj-28",
    kind: "character",
    name: "Jane",
    references: [],
    attributes: {},
    tags: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Shared behaviour suite — runs against any ElementStore implementation.
// ---------------------------------------------------------------------------

function runBehaviourSuite(
  label: string,
  makeStore: () => Promise<ElementStore>,
) {
  describe(label, () => {
    let store: ElementStore;

    beforeEach(async () => {
      store = await makeStore();
    });

    it("creates with auto id + timestamps + empty usedIn", async () => {
      const el = await store.create(draft());
      expect(el.id).toMatch(/^el_/);
      expect(el.createdAt).toBeGreaterThan(0);
      expect(el.updatedAt).toBe(el.createdAt);
      expect(el.usedIn).toEqual([]);
    });

    it("gets by id", async () => {
      const el = await store.create(draft());
      const got = await store.get(el.id);
      expect(got?.id).toBe(el.id);
      expect(await store.get("missing")).toBeUndefined();
    });

    describe("query", () => {
      beforeEach(async () => {
        await store.create(draft({ name: "Jane", kind: "character", tags: ["lead"] }));
        await store.create(draft({ name: "John", kind: "character", tags: ["support"] }));
        await store.create(
          draft({
            name: "Seoul Alley",
            kind: "location",
            projectId: "proj-99",
            tags: ["exterior"],
          }),
        );
      });

      it("filters by projectId", async () => {
        const r = await store.query({ projectId: "proj-28" });
        expect(r.map((e) => e.name).sort()).toEqual(["Jane", "John"]);
      });

      it("filters by kind", async () => {
        const r = await store.query({ kind: "location" });
        expect(r).toHaveLength(1);
        expect(r[0]!.name).toBe("Seoul Alley");
      });

      it("filters by tag exactly", async () => {
        const r = await store.query({ tag: "lead" });
        expect(r.map((e) => e.name)).toEqual(["Jane"]);
      });

      it("filters by nameLike case-insensitively", async () => {
        const r = await store.query({ nameLike: "JA" });
        expect(r.map((e) => e.name)).toEqual(["Jane"]);
      });

      it("filters by trained state", async () => {
        const jane = (await store.query({ nameLike: "Jane" }))[0]!;
        await store.patch({
          id: jane.id,
          identity: {
            provider: "soul-2.0",
            modelId: "soul_abc",
            trainingSampleIds: [],
            trained: true,
            trainedAt: Date.now(),
          },
        });
        const trained = await store.query({ trained: true });
        expect(trained.map((e) => e.name)).toEqual(["Jane"]);
        const untrained = await store.query({ trained: false });
        expect(untrained.map((e) => e.name).sort()).toEqual(["John", "Seoul Alley"]);
      });

      it("empty query returns all in creation order", async () => {
        const r = await store.query();
        expect(r).toHaveLength(3);
        // createdAt monotonic
        for (let i = 1; i < r.length; i++) {
          expect(r[i]!.createdAt).toBeGreaterThanOrEqual(r[i - 1]!.createdAt);
        }
      });
    });

    describe("patch", () => {
      it("merges fields + bumps updatedAt", async () => {
        const el = await store.create(draft({ name: "Jane" }));
        const before = el.updatedAt;
        await new Promise((r) => setTimeout(r, 2));
        const patched = await store.patch({ id: el.id, name: "Jane Doe" });
        expect(patched.name).toBe("Jane Doe");
        expect(patched.updatedAt).toBeGreaterThan(before);
        expect(patched.createdAt).toBe(el.createdAt);
      });

      it("refuses to mutate projectId", async () => {
        const el = await store.create(draft({ projectId: "proj-28" }));
        // @ts-expect-error projectId is excluded from ElementPatch at the type level
        const patched = await store.patch({ id: el.id, projectId: "proj-99" });
        expect(patched.projectId).toBe("proj-28");
      });

      it("throws on missing id", async () => {
        await expect(store.patch({ id: "missing", name: "x" })).rejects.toThrow(
          /not found/i,
        );
      });
    });

    describe("recordUsage", () => {
      it("appends usedIn row with timestamp", async () => {
        const el = await store.create(draft());
        await store.recordUsage(el.id, {
          nodeId: "storyboard:scene-7:shot-1",
          sceneId: "scene-7",
          shotId: "shot-1",
        });
        const got = await store.get(el.id);
        expect(got?.usedIn).toHaveLength(1);
        expect(got!.usedIn[0]!.nodeId).toBe("storyboard:scene-7:shot-1");
        expect(got!.usedIn[0]!.usedAt).toBeGreaterThan(0);
      });

      it("deduplicates on (nodeId, sceneId, shotId) and updates timestamp", async () => {
        const el = await store.create(draft());
        await store.recordUsage(el.id, {
          nodeId: "storyboard",
          sceneId: "s1",
          shotId: "sh1",
        });
        const firstTs = (await store.get(el.id))!.usedIn[0]!.usedAt;
        await new Promise((r) => setTimeout(r, 2));
        await store.recordUsage(el.id, {
          nodeId: "storyboard",
          sceneId: "s1",
          shotId: "sh1",
        });
        const got = await store.get(el.id);
        expect(got?.usedIn).toHaveLength(1);
        expect(got!.usedIn[0]!.usedAt).toBeGreaterThan(firstTs);
      });

      it("treats different nodeIds as separate usages", async () => {
        const el = await store.create(draft());
        await store.recordUsage(el.id, { nodeId: "storyboard" });
        await store.recordUsage(el.id, { nodeId: "cinema-render" });
        const got = await store.get(el.id);
        expect(got?.usedIn).toHaveLength(2);
      });

      it("throws on missing elementId", async () => {
        await expect(
          store.recordUsage("missing", { nodeId: "x" }),
        ).rejects.toThrow(/not found/i);
      });
    });

    describe("remove + clear", () => {
      it("remove returns true/false and empties the row", async () => {
        const el = await store.create(draft());
        expect(await store.remove(el.id)).toBe(true);
        expect(await store.remove(el.id)).toBe(false);
        expect(await store.get(el.id)).toBeUndefined();
      });

      it("clear wipes everything", async () => {
        await store.create(draft());
        await store.create(draft({ name: "B" }));
        await store.clear();
        expect(await store.query()).toHaveLength(0);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Run the suite against both implementations.
// ---------------------------------------------------------------------------

runBehaviourSuite("in-memory element store", async () =>
  createInMemoryElementStore(),
);

runBehaviourSuite(
  "pglite element store",
  // Each test gets a fresh in-memory PgLite DB (no dataDir = ephemeral).
  async () => createPgLiteElementStore(),
);
