"use client";

import { CreativePipelineShell, type ProjectMeta, type StepKey, type DeepLink } from "@marionette/ui";

interface Props {
  meta: ProjectMeta;
}

const SCRIPT_WRITER_BASE = process.env.NEXT_PUBLIC_SCRIPT_WRITER_URL ?? "http://localhost:5174";
const STORYBOARD_BASE = process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007";

function buildDeepLinks(projectId: string): Partial<Record<StepKey, DeepLink>> {
  const sw = (step: string): DeepLink => ({
    url: `${SCRIPT_WRITER_BASE}/?projectId=${encodeURIComponent(projectId)}&jumpTo=${step}`,
    label: "Open in Script Writer",
  });
  const sb = (step: string): DeepLink => ({
    url: `${STORYBOARD_BASE}/?projectId=${encodeURIComponent(projectId)}&jumpTo=${step}`,
    label: "Open in Storyboard Maker",
  });
  return {
    logline: sw("logline"),
    synopsis: sw("synopsis"),
    treatment: sw("treatment"),
    script: sw("script"),
    scene: sw("scene"),
    cut: sw("cut"),
    "image-prompt": sb("image-prompt"),
    "video-prompt": sb("video-prompt"),
  };
}

export function PipelineClient({ meta }: Props) {
  const deepLinks = buildDeepLinks(meta.id);
  return <CreativePipelineShell meta={meta} deepLinks={deepLinks} />;
}
