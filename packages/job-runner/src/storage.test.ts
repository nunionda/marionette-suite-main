import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createInMemoryAssetStorage,
  createLocalFileAssetStorage,
  createVercelBlobAssetStorage,
} from "./storage";

describe("InMemoryAssetStorage", () => {
  it("put/get/getMetadata/delete/list round-trip", async () => {
    const s = createInMemoryAssetStorage();
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const meta = await s.put(bytes, { key: "shot/a.mp4", mime: "video/mp4" });
    expect(meta.bytes).toBe(4);
    expect(meta.mime).toBe("video/mp4");
    expect(meta.url).toMatch(/^memory:\/\//);

    const got = await s.get("shot/a.mp4");
    expect(got).toEqual(bytes);

    const m = await s.getMetadata("shot/a.mp4");
    expect(m?.bytes).toBe(4);

    const list = await s.list("shot/");
    expect(list).toHaveLength(1);

    expect(await s.delete("shot/a.mp4")).toBe(true);
    expect(await s.get("shot/a.mp4")).toBeUndefined();
  });

  it("list filters by prefix", async () => {
    const s = createInMemoryAssetStorage();
    await s.put(new Uint8Array([1]), { key: "a/1" });
    await s.put(new Uint8Array([1]), { key: "a/2" });
    await s.put(new Uint8Array([1]), { key: "b/1" });
    const a = await s.list("a/");
    expect(a).toHaveLength(2);
    const b = await s.list("b/");
    expect(b).toHaveLength(1);
  });
});

describe("LocalFileAssetStorage", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "marionette-storage-"));
  });
  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("round-trips bytes on disk", async () => {
    const s = createLocalFileAssetStorage({ baseDir: tmp });
    const bytes = new Uint8Array([10, 20, 30]);
    const meta = await s.put(bytes, { key: "shot/a.mp4", mime: "video/mp4" });
    expect(meta.url).toContain("shot/a.mp4");

    const got = await s.get("shot/a.mp4");
    expect(got).toEqual(bytes);

    const list = await s.list();
    expect(list.some((x) => x.key === "shot/a.mp4")).toBe(true);

    expect(await s.delete("shot/a.mp4")).toBe(true);
    expect(await s.get("shot/a.mp4")).toBeUndefined();
  });

  it("rejects path traversal in keys", async () => {
    const s = createLocalFileAssetStorage({ baseDir: tmp });
    await s.put(new Uint8Array([1]), { key: "../escape" });
    // The key gets sanitized to __/escape so it stays inside baseDir.
    const got = await s.get("../escape");
    expect(got).toEqual(new Uint8Array([1]));
    // And the real parent file doesn't exist.
    const s2 = createLocalFileAssetStorage({ baseDir: join(tmp, "..") });
    expect(await s2.get("escape")).toBeUndefined();
  });
});

describe("VercelBlobAssetStorage stub", () => {
  it("throws informative errors on every method", async () => {
    const s = createVercelBlobAssetStorage();
    await expect(
      s.put(new Uint8Array([1]), { key: "x" }),
    ).rejects.toThrow(/stub/i);
    await expect(s.get("x")).rejects.toThrow(/stub/i);
    await expect(s.delete("x")).rejects.toThrow(/stub/i);
  });
});
