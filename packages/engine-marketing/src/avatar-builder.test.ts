import { describe, expect, it, beforeEach } from "vitest";
import {
  createInMemoryElementStore,
  type ElementStore,
} from "@marionette/elements-core";
import { buildAvatarElement } from "./avatar-builder";

describe("buildAvatarElement", () => {
  let store: ElementStore;

  beforeEach(() => {
    store = createInMemoryElementStore();
  });

  it("creates a character element with photos as refs", async () => {
    const el = await buildAvatarElement(store, {
      projectId: "p1",
      name: "Model A",
      photos: [
        { kind: "url", url: "a1" },
        { kind: "url", url: "a2" },
      ],
    });
    expect(el.kind).toBe("character");
    expect(el.references).toHaveLength(2);
    expect(el.attributes.role).toBe("avatar");
    expect(el.tags).toContain("avatar");
  });

  it("caps at 9 photos", async () => {
    const photos = Array.from({ length: 15 }, (_, i) => ({
      kind: "url" as const,
      url: `p${i}`,
    }));
    const el = await buildAvatarElement(store, {
      projectId: "p",
      name: "X",
      photos,
    });
    expect(el.references).toHaveLength(9);
  });

  it("honors custom tags", async () => {
    const el = await buildAvatarElement(store, {
      projectId: "p",
      name: "X",
      photos: [],
      tags: ["hero", "senior"],
    });
    expect(el.tags).toEqual(["hero", "senior"]);
  });
});
