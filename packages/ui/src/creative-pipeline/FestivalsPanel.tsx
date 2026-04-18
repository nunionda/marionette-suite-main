"use client";

import type { FestivalsStatus } from "./useProjectProgress";

interface Props {
  status: FestivalsStatus;
  festivalsBaseUrl?: string;
}

export function FestivalsPanel({
  status,
  festivalsBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/festivals`,
}: Props) {
  const url = `${festivalsBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, nextDeadline, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.selected / summary.total) * 100) : 0;
  const phase = steps.selected
    ? "selected"
    : steps.submitted
      ? "submitted"
      : steps.planned
        ? "planning"
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
            <h3 className="text-sm font-bold tracking-wider">FESTIVALS</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.selected ? "#4ade80" : steps.submitted ? "#f59e0b" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.selected ? "#4ade8044" : steps.submitted ? "#f59e0b44" : "var(--studio-border)"
                }`,
                backgroundColor: steps.selected
                  ? "#4ade8011"
                  : steps.submitted
                    ? "#f59e0b11"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            영화제 출품 · 선정 · 상영 · 수상
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
          Open in Festivals →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 영화제 출품 계획이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Selected</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.selected}/{summary.total} · {pct}%
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

          <div className="grid grid-cols-4 gap-2 text-center">
            <Cell label="A-List" value={summary.aListFestivals} color="#fbbf24" />
            <Cell label="Submitted" value={summary.submitted} color="#f59e0b" />
            <Cell label="Selected" value={summary.selected} color="#4ade80" />
            <Cell label="Awarded" value={summary.awarded} color="#fbbf24" />
          </div>

          {nextDeadline && (
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
                NEXT DEADLINE · {nextDeadline.deadline}
              </div>
              <div style={{ color: "var(--studio-text)" }}>
                <span className="font-bold">{nextDeadline.festivalName}</span>
                <span className="ml-2 text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  · {nextDeadline.country}
                </span>
                <span
                  className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: nextDeadline.tier === "A" ? "#fbbf24" : "var(--studio-text-dim)",
                    border: `1px solid ${nextDeadline.tier === "A" ? "#fbbf2444" : "var(--studio-border)"}`,
                    backgroundColor:
                      nextDeadline.tier === "A" ? "#fbbf2411" : "var(--studio-bg-elevated)",
                  }}
                >
                  {nextDeadline.tier}
                </span>
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
