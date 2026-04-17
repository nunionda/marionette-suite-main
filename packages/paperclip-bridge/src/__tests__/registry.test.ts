import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises");

describe("registry", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns parsed entries when registry file exists", async () => {
    const fs = await import("fs/promises");
    const mockEntries = [
      {
        id: "ID-001",
        title: "DECODE",
        genre: "SF",
        category: "film",
        budgetKRW: 3_500_000_000,
        priority: "P1",
        ownerStudio: "IMP",
      },
    ];
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockEntries));
    const { readRegistry } = await import("../registry");
    const entries = await readRegistry();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("ID-001");
  });

  it("returns empty array when file missing", async () => {
    const fs = await import("fs/promises");
    vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));
    const { readRegistry } = await import("../registry");
    const entries = await readRegistry();
    expect(entries).toEqual([]);
  });

  it("findProject returns matching entry", async () => {
    const fs = await import("fs/promises");
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([
      { id: "ID-001", title: "DECODE", genre: "SF", category: "film", budgetKRW: 3.5e9, priority: "P1", ownerStudio: "IMP" },
      { id: "ID-002", title: "어머니의 이력서", genre: "드라마", category: "drama", budgetKRW: 2e9, priority: "P0", ownerStudio: "STE" },
    ]));
    const { findProject } = await import("../registry");
    const found = await findProject("ID-002");
    expect(found?.title).toBe("어머니의 이력서");
  });
});
