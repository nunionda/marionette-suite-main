"use client";

import type { TitlesStatus } from "./useProjectProgress";

interface Props {
  status: TitlesStatus;
  titlesBaseUrl?: string;
}

export function TitlesPanel({
  status,
  titlesBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/titles`,
}: Props) {
  const url = `${titlesBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, mainTitle, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.approved / summary.total) * 100) : 0;
  const phase = steps.approved
    ? "approved"
    : steps.inReview
      ? "in review"
      : steps.drafted
        ? "drafting"
        : "not started";

  return (
    <article
      className="rounded-lg border p-5"
      style={{
        borderColor: "var(--studio-border)",
        backgroundColor: "var(--studio-bg-surface)",
      }}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wider">TITLES</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.approved ? "#4ade80" : steps.inReview ? "#f59e0b" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.approved ? "#4ade8044" : steps.inReview ? "#f59e0b44" : "var(--studio-border)"
                }`,
                backgroundColor: steps.approved
                  ? "#4ade8011"
                  : steps.inReview
                    ? "#f59e0b11"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            타이틀 · 크레딧 · 자막 카드
          </p>
        </div>
        <a
          href={url}
          className="rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition"
          style={{
            backgroundColor: "var(--accent-violet-dim)",
            color: "var(--accent-violet)",
            border: "1px solid var(--accent-violet)",
          }}
        >
          Open in Titles →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 타이틀 디자인이 시작되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Approved</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.approved}/{summary.total} · {pct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${pct}%`,
                  backgroundColor: "#4ade80",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Cell label="Approved" value={summary.approved} color="#4ade80" />
            <Cell label="Review" value={summary.review} color="#f59e0b" />
            <Cell label="Draft" value={summary.draft} color="#707070" />
          </div>

          {mainTitle && (
            <div
              className="rounded px-2 py-1.5 text-[11px]"
              style={{
                border: "1px solid var(--studio-border)",
                backgroundColor: "var(--studio-bg-elevated)",
              }}
            >
              <div
                className="mb-0.5 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--studio-text-dim)" }}
              >
                MAIN TITLE · {mainTitle.status}
              </div>
              <div style={{ color: "var(--studio-text)" }}>
                <span className="font-bold">{mainTitle.text ?? "— 미정 —"}</span>
                {mainTitle.font && (
                  <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                    · {mainTitle.font}
                  </span>
                )}
                {mainTitle.durationSec && (
                  <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                    · {mainTitle.durationSec}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Cell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded px-2 py-1.5"
      style={{
        border: "1px solid var(--studio-border)",
        backgroundColor: "var(--studio-bg-elevated)",
      }}
    >
      <div className="font-mono text-base font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
        {label}
      </div>
    </div>
  );
}
