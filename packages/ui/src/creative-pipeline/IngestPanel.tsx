"use client";

import type { IngestStatus } from "./useProjectProgress";

interface Props {
  status: IngestStatus;
  ingestBaseUrl?: string;
}

function fmtGB(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)}TB`;
  return `${gb}GB`;
}

export function IngestPanel({
  status,
  ingestBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/ingest`,
}: Props) {
  const url = `${ingestBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, latestBatch, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.verified / summary.total) * 100) : 0;
  const phase = steps.archived
    ? "archived"
    : steps.verified
      ? "verifying"
      : steps.ingesting
        ? "ingesting"
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
            <h3 className="text-sm font-bold tracking-wider">DATA INGEST</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.archived ? "#4ade80" : steps.ingesting ? "#f59e0b" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.archived ? "#4ade8044" : steps.ingesting ? "#f59e0b44" : "var(--studio-border)"
                }`,
                backgroundColor: steps.archived
                  ? "#4ade8011"
                  : steps.ingesting
                    ? "#f59e0b11"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            촬영 footage 인제스트 · 체크섬 · 백업
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
          Open in Ingest →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 인제스트된 footage가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Verified</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.verified}/{summary.total} · {pct}%
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
            <Cell label="Batches" value={String(summary.total)} color="#F0F0F0" />
            <Cell label="Total" value={fmtGB(summary.totalSizeGB)} color="#f59e0b" />
            <Cell label="Takes" value={String(summary.totalTakes)} color="#4ade80" />
          </div>

          {latestBatch && (
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
                LATEST · {latestBatch.shootDate} · Roll {latestBatch.cameraRoll}
              </div>
              <div style={{ color: "var(--studio-text)" }}>
                {latestBatch.cameraModel}
                <span className="ml-2 font-mono" style={{ color: "var(--studio-text-dim)" }}>
                  · {latestBatch.codec} · {fmtGB(latestBatch.sizeGB)} · {latestBatch.takes} takes
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
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
