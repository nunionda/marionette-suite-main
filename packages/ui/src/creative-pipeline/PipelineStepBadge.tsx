"use client";

import type { StepStatus } from "./types";

const COLOR: Record<StepStatus, { fg: string; bg: string; border: string; label: string }> = {
  not_started: {
    fg: "var(--studio-text-dim)",
    bg: "transparent",
    border: "var(--studio-border)",
    label: "대기",
  },
  in_progress: {
    fg: "var(--accent-violet)",
    bg: "var(--accent-violet-dim)",
    border: "var(--accent-violet)",
    label: "진행",
  },
  review: {
    fg: "var(--studio-warning)",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "var(--studio-warning)",
    label: "검토",
  },
  locked: {
    fg: "var(--accent-mint)",
    bg: "var(--accent-mint-dim)",
    border: "var(--accent-mint)",
    label: "확정",
  },
};

export function PipelineStepBadge({ status }: { status: StepStatus }) {
  const c = COLOR[status];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: c.fg, backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}
