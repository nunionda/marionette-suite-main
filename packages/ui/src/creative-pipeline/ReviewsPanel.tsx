"use client";

import type { ReviewsStatus } from "./useProjectProgress";

interface Props {
  status: ReviewsStatus;
  reviewsBaseUrl?: string;
}

const SENTIMENT_COLOR = {
  positive: "#4ade80",
  mixed: "#f59e0b",
  negative: "#ef4444",
} as const;

const SENTIMENT_LABEL = {
  positive: "긍정",
  mixed: "혼합",
  negative: "부정",
} as const;

export function ReviewsPanel({
  status,
  reviewsBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/reviews`,
}: Props) {
  const url = `${reviewsBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, topReview } = status;

  const phase = summary.avgScore == null
    ? "리뷰 수집 전"
    : summary.avgScore >= 7
      ? "호평"
      : summary.avgScore >= 5
        ? "혼합"
        : "혹평";

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
            <h3 className="text-sm font-bold tracking-wider">REVIEWS</h3>
            {summary.avgScore != null && (
              <span
                className="rounded px-2 py-0.5 font-mono text-xs font-bold"
                style={{
                  color: summary.avgScore >= 7 ? "#4ade80" : summary.avgScore >= 5 ? "#f59e0b" : "#ef4444",
                  border: `1px solid ${summary.avgScore >= 7 ? "#4ade8044" : summary.avgScore >= 5 ? "#f59e0b44" : "#ef444444"}`,
                  backgroundColor: summary.avgScore >= 7 ? "#4ade8011" : summary.avgScore >= 5 ? "#f59e0b11" : "#ef444411",
                }}
              >
                ★ {summary.avgScore.toFixed(1)}
              </span>
            )}
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: "var(--studio-text-dim)",
                border: "1px solid var(--studio-border)",
                backgroundColor: "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            평론 · 관객 평점 · 감성 분석
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
          Open in Reviews →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          아직 수집된 리뷰가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          {/* Positive ratio bar */}
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>긍정 비율</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.positive}/{summary.total} · {summary.positivePct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${summary.positivePct}%`,
                  backgroundColor: "#4ade80",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* 4-cell summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <Cell
              label="평론가"
              value={summary.criticsAvg != null ? summary.criticsAvg.toFixed(1) : "—"}
              sub={`${summary.criticsCount}편`}
              color="#a78bfa"
            />
            <Cell
              label="관객"
              value={summary.audienceAvg != null ? summary.audienceAvg.toFixed(1) : "—"}
              sub={`${summary.audienceCount}편`}
              color="#00FF41"
            />
            <Cell
              label="긍정"
              value={`${summary.positive}`}
              color="#4ade80"
            />
            <Cell
              label="부정"
              value={`${summary.negative}`}
              color="#ef4444"
            />
          </div>

          {/* Top review */}
          {topReview && (
            <div
              className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
              style={{
                border: "1px solid var(--studio-border)",
                backgroundColor: "var(--studio-bg-elevated)",
              }}
            >
              <div className="flex-1 overflow-hidden">
                <span
                  className="mr-2 text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--studio-text-dim)" }}
                >
                  {topReview.outlet}
                </span>
                {topReview.reviewer && (
                  <span className="mr-2 text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                    · {topReview.reviewer}
                  </span>
                )}
                <span
                  className="block truncate font-bold"
                  style={{ color: "var(--studio-text)" }}
                >
                  {topReview.headline ?? "(무제)"}
                </span>
              </div>
              <div className="ml-2 flex items-center gap-1.5">
                {topReview.score != null && (
                  <span className="font-mono text-[11px] font-bold" style={{ color: "var(--studio-text)" }}>
                    ★ {topReview.score.toFixed(1)}
                  </span>
                )}
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: SENTIMENT_COLOR[topReview.sentiment],
                    border: `1px solid ${SENTIMENT_COLOR[topReview.sentiment]}44`,
                    backgroundColor: `${SENTIMENT_COLOR[topReview.sentiment]}11`,
                  }}
                >
                  {SENTIMENT_LABEL[topReview.sentiment]}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Cell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
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
      {sub && (
        <div className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
          {sub}
        </div>
      )}
      <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
        {label}
      </div>
    </div>
  );
}
