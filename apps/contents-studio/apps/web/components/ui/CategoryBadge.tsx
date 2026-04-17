"use client";

import { tokens } from "@marionette/design-tokens";
import type { ContentCategory, StudioCode } from "@marionette/pipeline-core";
import { getProfile } from "@marionette/content-profiles";

const labels: Record<ContentCategory, string> = {
  film: "영화",
  drama: "드라마",
  commercial: "광고",
  youtube: "유튜브",
};

export function CategoryBadge({ category }: { category: ContentCategory }) {
  const color = tokens.content[category];
  const label = labels[category];
  return (
    <span
      className="inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}

export function StudioBadge({ studio }: { studio: StudioCode }) {
  return (
    <span
      className="inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-mono tracking-wide"
      style={{
        backgroundColor: "var(--studio-bg-hover, #22223a)",
        color: "var(--studio-text-dim, #8888aa)",
      }}
      title={
        studio === "STE"
          ? "Marionette Studios"
          : studio === "IMP"
            ? "Global Studios Standard"
            : "Development Department"
      }
    >
      {studio}
    </span>
  );
}

export function PhaseBadge({ category }: { category: ContentCategory }) {
  const profile = getProfile(category);
  return (
    <span className="text-[10px] text-gray-500">
      {profile.ui.emphasize} 중심
    </span>
  );
}
