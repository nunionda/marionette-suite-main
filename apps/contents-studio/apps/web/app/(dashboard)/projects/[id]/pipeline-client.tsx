"use client";

import { useCallback } from "react";
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

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(meta.id)}/export`);
      if (!res.ok) throw new Error(`Export failed: HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${meta.id}-higgsfield-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Export] Failed:", err);
    }
  }, [meta.id]);

  return (
    <CreativePipelineShell
      meta={meta}
      deepLinks={deepLinks}
      onExport={handleExport}
    />
  );
}
