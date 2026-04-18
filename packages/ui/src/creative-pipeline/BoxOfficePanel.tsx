"use client";

import type { BoxOfficeStatus } from "./useProjectProgress";

interface Props {
  status: BoxOfficeStatus;
  boxOfficeBaseUrl?: string;
}

function formatRevenueKRW(revenue: number) {
  if (revenue >= 1_000_000_000) return `₩${(revenue / 1_000_000_000).toFixed(2)}B`;
  if (revenue >= 1_000_000) return `₩${(revenue / 1_000_000).toFixed(1)}M`;
  return `₩${revenue.toLocaleString()}`;
}

function formatAdmissions(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

export function BoxOfficePanel({
  status,
  boxOfficeBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/boxoffice`,
}: Props) {
  const url = `${boxOfficeBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, steps, meta, latestWeek } = status;

  const phase = !steps.released
    ? "미개봉"
    : steps.breakeven
      ? "손익분기 달성"
      : steps.week1Done
        ? "상영중"
        : "개봉 직후";

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
            <h3 className="text-sm font-bold tracking-wider">BOX OFFICE</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.breakeven ? "#4ade80" : steps.released ? "#f59e0b" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.breakeven ? "#4ade8044" : steps.released ? "#f59e0b44" : "var(--studio-border)"
                }`,
                backgroundColor: steps.breakeven
                  ? "#4ade8011"
                  : steps.released
                    ? "#f59e0b11"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            {meta.releaseDate ? `개봉일 · ${meta.releaseDate}` : "개봉 예정"} · 제작비 {formatRevenueKRW(meta.budgetKRW)}
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
          Open in Box Office →
        </a>
      </header>

      {!steps.released ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          아직 개봉하지 않았습니다. Distribution 단계를 먼저 완료하세요.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          {/* Breakeven progress */}
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>손익분기</span>
              <span
                className="font-mono font-bold"
                style={{ color: summary.breakeven ? "#4ade80" : "#f59e0b" }}
              >
                {summary.breakevenPct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(100, summary.breakevenPct)}%`,
                  backgroundColor: summary.breakevenPct >= 100 ? "#4ade80" : "#f59e0b",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* 4-cell summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <Cell
              label="KR 매출"
              value={formatRevenueKRW(summary.krRevenue)}
              color="#00FF41"
            />
            <Cell
              label="관객"
              value={formatAdmissions(summary.krAdmissions)}
              color="#f59e0b"
            />
            <Cell
              label="주차"
              value={`W${summary.weeksInRelease}`}
              color="#a78bfa"
            />
            <Cell
              label="지역"
              value={`${summary.territoriesLive}`}
              color="#4ade80"
            />
          </div>

          {/* Latest week */}
          {latestWeek && (
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
                  W{latestWeek.weekNumber} · {latestWeek.weekStarting}
                </span>
                <span className="font-bold" style={{ color: "var(--studio-text)" }}>
                  #{latestWeek.rank}
                </span>
                <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  · {formatAdmissions(latestWeek.admissions)}명 · {latestWeek.screens}관
                </span>
              </div>
              {latestWeek.weekOverWeekPct != null && (
                <span
                  className="font-mono text-[10px] font-bold"
                  style={{
                    color: latestWeek.weekOverWeekPct < 0 ? "#ef4444" : "#4ade80",
                  }}
                >
                  {latestWeek.weekOverWeekPct > 0 ? "+" : ""}
                  {latestWeek.weekOverWeekPct}% WoW
                </span>
              )}
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
