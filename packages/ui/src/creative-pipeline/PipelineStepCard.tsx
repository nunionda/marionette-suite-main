"use client";

import { PipelineStepBadge } from "./PipelineStepBadge";
import { STEPS, type StepKey, type StepProgress, type DeepLink } from "./types";

interface Props {
  stepKey: StepKey;
  progress: StepProgress;
  deepLink?: DeepLink;
  children?: React.ReactNode;
}

export function PipelineStepCard({ stepKey, progress, deepLink, children }: Props) {
  const step = STEPS.find((s) => s.key === stepKey)!;
  const updated = progress.lastUpdated
    ? new Date(progress.lastUpdated).toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article
      className="rounded-lg border p-5"
      style={{
        borderColor: "var(--studio-border)",
        backgroundColor: "var(--studio-bg-surface)",
      }}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: "var(--studio-bg-elevated)",
                color: "var(--studio-text-dim)",
              }}
            >
              {step.order}
            </span>
            <h3 className="text-sm font-bold tracking-wider">{step.label}</h3>
            <PipelineStepBadge status={progress.status} />
            {progress.count !== undefined && progress.count > 0 && (
              <span
                className="text-[11px]"
                style={{ color: "var(--studio-text-dim)" }}
              >
                · {progress.count}개
              </span>
            )}
          </div>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--studio-text-dim)" }}
          >
            {step.description}
          </p>
        </div>
        {deepLink && (
          <a
            href={deepLink.url}
            className="rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition"
            style={{
              backgroundColor: "var(--accent-violet-dim)",
              color: "var(--accent-violet)",
              border: "1px solid var(--accent-violet)",
            }}
          >
            {deepLink.label} →
          </a>
        )}
      </header>

      {(progress.previewText || children) && (
        <div className="mt-3">
          {progress.previewText && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--studio-text)" }}
            >
              {progress.previewText}
            </p>
          )}
          {children}
        </div>
      )}

      {updated && (
        <footer
          className="mt-3 text-[10px] uppercase tracking-wider"
          style={{ color: "var(--studio-text-muted)" }}
        >
          Last updated · {updated}
        </footer>
      )}
    </article>
  );
}
