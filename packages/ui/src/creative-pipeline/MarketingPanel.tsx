"use client";

import type { MarketingStatus } from "./useProjectProgress";

interface Props {
  status: MarketingStatus;
  marketingBaseUrl?: string;
}

const STATUS_COLOR = {
  draft: "#707070",
  in_review: "#f59e0b",
  approved: "#4ade80",
  delivered: "#00FF41",
  live: "#fbbf24",
} as const;

const STATUS_LABEL = {
  draft: "초안",
  in_review: "검토",
  approved: "승인",
  delivered: "납품",
  live: "공개",
} as const;

export function MarketingPanel({
  status,
  marketingBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/marketing`,
}: Props) {
  const url = `${marketingBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, flagship, steps } = status;
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
            <h3 className="text-sm font-bold tracking-wider">MARKETING</h3>
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
            트레일러 · 포스터 · 키 아트 · 소셜
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
          Open in Marketing →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 마케팅 자산이 시작되지 않았습니다.
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

          <div className="grid grid-cols-4 gap-2 text-center">
            <Cell label="Video" value={summary.videoAssets} color="#00FF41" />
            <Cell label="Image" value={summary.imageAssets} color="#f59e0b" />
            <Cell label="AI" value={summary.aiGenerated} color="#a78bfa" />
            <Cell label="Approved" value={summary.approved} color="#4ade80" />
          </div>

          {(flagship.trailer || flagship.poster) && (
            <div className="flex flex-col gap-1.5">
              {flagship.trailer && (
                <FlagshipLine
                  label="TRAILER"
                  title={flagship.trailer.label}
                  meta={flagship.trailer.durationSec ? `${flagship.trailer.durationSec}s` : undefined}
                  status={flagship.trailer.status}
                  ai={flagship.trailer.aiGenerated}
                />
              )}
              {flagship.poster && (
                <FlagshipLine
                  label="POSTER"
                  title={flagship.poster.label}
                  status={flagship.poster.status}
                  ai={flagship.poster.aiGenerated}
                />
              )}
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

function FlagshipLine({
  label,
  title,
  meta,
  status,
  ai,
}: {
  label: string;
  title: string;
  meta?: string;
  status: keyof typeof STATUS_COLOR;
  ai: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
      style={{
        border: "1px solid var(--studio-border)",
        backgroundColor: "var(--studio-bg-elevated)",
      }}
    >
      <div>
        <span
          className="mr-2 text-[10px] uppercase tracking-wider"
          style={{ color: "var(--studio-text-dim)" }}
        >
          {label}
        </span>
        <span className="font-bold" style={{ color: "var(--studio-text)" }}>
          {title}
        </span>
        {meta && (
          <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
            · {meta}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {ai && (
          <span
            className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              color: "#a78bfa",
              border: "1px solid #a78bfa44",
              backgroundColor: "#a78bfa11",
            }}
          >
            AI
          </span>
        )}
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: STATUS_COLOR[status],
            border: `1px solid ${STATUS_COLOR[status]}44`,
            backgroundColor: `${STATUS_COLOR[status]}11`,
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </div>
  );
}
