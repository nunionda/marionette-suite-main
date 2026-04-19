import { describe, expect, it, beforeEach } from "vitest";
import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import {
  buildProjectContext,
  renderProjectContext,
} from "./project-context";

describe("buildProjectContext", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("returns empty context for empty project", async () => {
    const ctx = await buildProjectContext(store, "p1");
    expect(ctx.projectId).toBe("p1");
    expect(ctx.elements).toEqual([]);
    expect(ctx.stats.totalElements).toBe(0);
    expect(ctx.stats.trained).toBe(0);
    expect(ctx.stats.unused).toBe(0);
    expect(ctx.stats.mostUsed).toBeUndefined();
  });

  it("filters by projectId", async () => {
    await store.create({
      projectId: "p1",
      kind: "character",
      name: "Jane",
      references: [],
      attributes: {},
      tags: [],
    });
    await store.create({
      projectId: "p2",
      kind: "character",
      name: "John",
      references: [],
      attributes: {},
      tags: [],
    });
    const ctx = await buildProjectContext(store, "p1");
    expect(ctx.elements.map((e) => e.name)).toEqual(["Jane"]);
  });

  it("computes trained/untrained/unused counts", async () => {
    const jane = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [],
      identity: {
        provider: "soul-2.0",
        modelId: "m1",
        trainingSampleIds: [],
        trained: true,
        consistencyScore: 0.91,
      },
      attributes: {},
      tags: [],
    });
    await store.create({
      projectId: "p",
      kind: "character",
      name: "John",
      references: [],
      attributes: {},
      tags: [],
    });
    await store.recordUsage(jane.id, { nodeId: "cinema:s1:sh1" });

    const ctx = await buildProjectContext(store, "p");
    expect(ctx.stats.totalElements).toBe(2);
    expect(ctx.stats.trained).toBe(1);
    expect(ctx.stats.untrained).toBe(1);
    expect(ctx.stats.unused).toBe(1);
    expect(ctx.stats.mostUsed?.name).toBe("Jane");
  });

  it("aggregates byKind correctly", async () => {
    for (const kind of ["character", "character", "prop", "location"] as const) {
      await store.create({
        projectId: "p",
        kind,
        name: `x-${kind}`,
        references: [],
        attributes: {},
        tags: [],
      });
    }
    const ctx = await buildProjectContext(store, "p");
    expect(ctx.stats.byKind.character).toBe(2);
    expect(ctx.stats.byKind.prop).toBe(1);
    expect(ctx.stats.byKind.location).toBe(1);
  });

  it("surfaces consistencyScore + soulProvider in summary", async () => {
    await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [],
      identity: {
        provider: "lora",
        modelId: "m",
        trainingSampleIds: [],
        trained: true,
        consistencyScore: 0.65,
      },
      attributes: {},
      tags: [],
    });
    const ctx = await buildProjectContext(store, "p");
    expect(ctx.elements[0]!.soulProvider).toBe("lora");
    expect(ctx.elements[0]!.consistencyScore).toBe(0.65);
  });
});

describe("renderProjectContext", () => {
  it("emits markdown with key stats", async () => {
    const store = createInMemoryElementStore();
    const jane = await store.create({
      projectId: "p",
      kind: "character",
      name: "Jane",
      references: [{ kind: "url", url: "j1" }, { kind: "url", url: "j2" }],
      identity: {
        provider: "soul-2.0",
        modelId: "m",
        trainingSampleIds: [],
        trained: true,
        consistencyScore: 0.91,
      },
      attributes: {},
      tags: ["lead"],
    });
    await store.recordUsage(jane.id, { nodeId: "cinema:s1:sh1" });
    await store.recordUsage(jane.id, { nodeId: "cinema:s2:sh1" });

    const ctx = await buildProjectContext(store, "p");
    const md = renderProjectContext(ctx);
    expect(md).toContain("# Project p");
    expect(md).toContain("Jane");
    expect(md).toContain("TRAINED");
    expect(md).toContain("soul-2.0");
    expect(md).toContain("consistency 0.91");
    expect(md).toContain("2 usages");
  });

  it("empty project renders without ## Elements section", async () => {
    const store = createInMemoryElementStore();
    const ctx = await buildProjectContext(store, "p");
    const md = renderProjectContext(ctx);
    expect(md).not.toContain("## Elements");
  });
});
