"use client";

import type { IdeaStatus } from "./useProjectProgress";

interface Props {
  status: IdeaStatus;
  ideaBaseUrl?: string;
}

export function IdeaPanel({
  status,
  ideaBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/idea`,
}: Props) {
  const url = `${ideaBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const stepKeys = Object.keys(status.steps);
  const doneSteops = stepKeys.filter((k) => status.steps[k]).length;

  return (
    <article
      className="rounded-lg border p-5"
      style={{ borderColor: "var(--studio-border)", backgroundColor: "var(--studio-bg-surface)" }}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-wider">IDEA / CONCEPT</h3>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--studio-text-dim)", border: "1px solid var(--studio-border)" }}
          >
            {status.status}
          </span>
        </div>
        <a
          href={url}
          className="shrink-0 text-[11px] underline opacity-60 hover:opacity-100"
          style={{ color: "var(--accent-violet)" }}
        >
          Open →
        </a>
      </header>

      <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--studio-text-dim)" }}>
        {status.genre && <span>Genre: <span className="text-white">{status.genre}</span></span>}
        {status.format && <span>Format: <span className="text-white">{status.format}</span></span>}
        <span>Steps: <span className="text-white">{doneSteops}/{stepKeys.length}</span></span>
      </div>
      {status.logline && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--studio-text-dim)" }}>
          {status.logline}
        </p>
      )}
    </article>
  );
}
