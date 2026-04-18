import type { ContentCategory } from "@marionette/pipeline-core";
import { getAdapter } from "./adapter";
import type { ImagePromptNeutral, VideoPromptNeutral, AdapterContext } from "./types";

export interface CutExport {
  cutId: string;
  imagePrompt: { text: string } | null;
  videoPrompt: { text: string } | null;
}

export interface PromptPackage {
  version: "1.0";
  projectId: string;
  projectTitle: string;
  category: ContentCategory;
  higgsfieldProduct: string;
  exportedAt: string;
  cuts: CutExport[];
}

export function pickAdapterId(category: ContentCategory): string {
  return category === "film" || category === "drama"
    ? "higgsfield-cinema-studio-3.5"
    : "higgsfield-marketing-studio";
}

export function buildExportPackage(
  projectId: string,
  projectTitle: string,
  category: ContentCategory,
  cuts: Array<{ imagePrompt: ImagePromptNeutral; videoPrompt?: VideoPromptNeutral }>,
): PromptPackage {
  const adapterId = pickAdapterId(category);
  const adapter = getAdapter(adapterId);
  if (!adapter) throw new Error(`Adapter not registered: ${adapterId}`);

  const ctx: AdapterContext = { category, projectTitle };

  const renderedCuts: CutExport[] = cuts.map(({ imagePrompt, videoPrompt }) => ({
    cutId: imagePrompt.cutId,
    imagePrompt: { text: adapter.renderImage(imagePrompt, ctx).text },
    videoPrompt: videoPrompt
      ? { text: adapter.renderVideo(videoPrompt, ctx).text }
      : null,
  }));

  return {
    version: "1.0",
    projectId,
    projectTitle,
    category,
    higgsfieldProduct: adapter.product,
    exportedAt: new Date().toISOString(),
    cuts: renderedCuts,
  };
}
