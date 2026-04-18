import { describe, it, expect } from "vitest";
import { recommendStudio } from "../index";

describe("recommendStudio", () => {
  it("never returns MAR", () => {
    const samples = [
      recommendStudio("film"),
      recommendStudio("film", 1_000_000),
      recommendStudio("film", 9_999_999_999_999),
      recommendStudio("drama"),
      recommendStudio("commercial"),
      recommendStudio("youtube"),
    ];
    for (const s of samples) {
      expect(s).not.toBe("MAR");
    }
  });

  it("routes small film to STE, big film to IMP", () => {
    expect(recommendStudio("film", 1_000_000_000)).toBe("STE");
    expect(recommendStudio("film", 100_000_000_000)).toBe("IMP");
  });

  it("routes drama/commercial/youtube to STE", () => {
    expect(recommendStudio("drama")).toBe("STE");
    expect(recommendStudio("commercial")).toBe("STE");
    expect(recommendStudio("youtube")).toBe("STE");
  });
});
