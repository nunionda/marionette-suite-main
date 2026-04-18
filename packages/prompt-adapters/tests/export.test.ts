import { describe, it, expect } from "vitest";
import "../src/index"; // trigger auto-registration
import { buildExportPackage, pickAdapterId } from "../src/export";
import type { ImagePromptNeutral, VideoPromptNeutral } from "../src/types";

const sampleImage: ImagePromptNeutral = {
  cutId: "SC001-C001",
  projectId: "ID-001",
  characters: [{ id: "char-1", name: "주인공" }],
  location: { id: "loc-1", name: "도심 옥상" },
  props: [],
  camera: { angle: "low", lens: "wide" },
  lighting: { key: "natural", timeOfDay: "golden" },
  style: { tone: "cinematic", reference: ["Kurosawa"] },
  description: "주인공이 도심 옥상 끝에 서서 일몰을 바라본다",
};

const sampleVideo: VideoPromptNeutral = {
  cutId: "SC001-C001",
  imagePromptId: "img-001",
  projectId: "ID-001",
  motion: { action: "stands still", intensity: "subtle" },
  cameraMove: { type: "dolly", speed: "slow", target: "character" },
  durationSeconds: 5,
  description: "카메라가 천천히 뒤로 빠지며 광활한 도시 뷰 드러남",
};

describe("pickAdapterId", () => {
  it("maps film to cinema studio", () => {
    expect(pickAdapterId("film")).toBe("higgsfield-cinema-studio-3.5");
  });
  it("maps drama to cinema studio", () => {
    expect(pickAdapterId("drama")).toBe("higgsfield-cinema-studio-3.5");
  });
  it("maps commercial to marketing studio", () => {
    expect(pickAdapterId("commercial")).toBe("higgsfield-marketing-studio");
  });
  it("maps youtube to marketing studio", () => {
    expect(pickAdapterId("youtube")).toBe("higgsfield-marketing-studio");
  });
});

describe("buildExportPackage", () => {
  it("returns package with correct metadata", () => {
    const pkg = buildExportPackage("ID-001", "DECODE", "film", []);
    expect(pkg.projectId).toBe("ID-001");
    expect(pkg.projectTitle).toBe("DECODE");
    expect(pkg.category).toBe("film");
    expect(pkg.higgsfieldProduct).toBe("cinema-studio-3.5");
    expect(pkg.version).toBe("1.0");
    expect(pkg.cuts).toHaveLength(0);
  });

  it("renders cinema studio text for film", () => {
    const pkg = buildExportPackage("ID-001", "DECODE", "film", [
      { imagePrompt: sampleImage, videoPrompt: sampleVideo },
    ]);
    expect(pkg.cuts).toHaveLength(1);
    expect(pkg.cuts[0].cutId).toBe("SC001-C001");
    expect(pkg.cuts[0].imagePrompt?.text).toContain("[CINEMA STUDIO 3.5");
    expect(pkg.cuts[0].videoPrompt?.text).toContain("[CINEMA STUDIO 3.5 — VIDEO");
  });

  it("renders marketing studio text for commercial", () => {
    const pkg = buildExportPackage("ID-002", "나이키 CF", "commercial", [
      { imagePrompt: { ...sampleImage, projectId: "ID-002" } },
    ]);
    expect(pkg.cuts[0].imagePrompt?.text).toContain("[MARKETING STUDIO");
    expect(pkg.cuts[0].videoPrompt).toBeNull();
  });

  it("sets exportedAt as valid ISO date", () => {
    const pkg = buildExportPackage("ID-001", "DECODE", "drama", []);
    expect(() => new Date(pkg.exportedAt).toISOString()).not.toThrow();
  });
});
