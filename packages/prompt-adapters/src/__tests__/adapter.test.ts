import { describe, it, expect } from "vitest";
import "../index"; // auto-registers adapters
import { getAdapter, listAdapters } from "../adapter";
import type { ImagePromptNeutral, VideoPromptNeutral, AdapterContext } from "../types";

const ctx: AdapterContext = { category: "film", projectTitle: "DECODE" };

const imageFixture: ImagePromptNeutral = {
  cutId: "C-001",
  projectId: "ID-001",
  characters: [{ id: "c1", name: "Nova" }],
  location: { id: "l1", name: "Neo-Tokyo rooftop" },
  props: [],
  camera: { angle: "low", lens: "wide" },
  lighting: { key: "hard", timeOfDay: "night" },
  style: { tone: "noir", reference: ["Blade Runner 2049"] },
  description: "Nova stands at the edge of the rooftop.",
};

const videoFixture: VideoPromptNeutral = {
  cutId: "C-001",
  imagePromptId: "IP-001",
  projectId: "ID-001",
  motion: { action: "Nova turns toward camera", intensity: "subtle" },
  cameraMove: { type: "dolly", speed: "slow", target: "Nova" },
  durationSeconds: 4,
  description: "Slow dolly-in as Nova turns.",
};

describe("prompt adapters", () => {
  it("registers cinema-studio and marketing-studio by default", () => {
    expect(listAdapters().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        "higgsfield-cinema-studio-3.5",
        "higgsfield-marketing-studio",
      ]),
    );
  });

  it("cinema-studio adapter renders image with shot and location", () => {
    const adapter = getAdapter("higgsfield-cinema-studio-3.5")!;
    const out = adapter.renderImage(imageFixture, ctx);
    expect(out.text).toContain("C-001");
    expect(out.text).toContain("Neo-Tokyo rooftop");
    expect(out.metadata?.product).toBe("cinema-studio-3.5");
  });

  it("cinema-studio adapter renders video with motion and duration", () => {
    const adapter = getAdapter("higgsfield-cinema-studio-3.5")!;
    const out = adapter.renderVideo(videoFixture, ctx);
    expect(out.text).toContain("Nova turns toward camera");
    expect(out.text).toContain("4s");
  });

  it("marketing-studio adapter annotates youtube as UGC", () => {
    const adapter = getAdapter("higgsfield-marketing-studio")!;
    const out = adapter.renderImage(imageFixture, {
      category: "youtube",
      projectTitle: "Shorts 001",
    });
    expect(out.text).toContain("UGC");
  });
});
