"use client";

import type { BudgetStatus as BudgetSummaryStatus } from "./useProjectProgress";

interface Props {
  status: BudgetSummaryStatus;
  budgetBaseUrl?: string;
}

const STATE_COLOR = {
  draft: "#707070",
  submitted: "#f59e0b",
  approved: "#4ade80",
  locked: "#00FF41",
} as const;

const STATE_LABEL = {
  draft: "초안",
  submitted: "제출",
  approved: "승인",
  locked: "확정",
} as const;

function fmtKRW(krw: number): string {
  if (krw >= 1_000_000_000) return `₩${(krw / 1_000_000_000).toFixed(1)}B`;
  if (krw >= 1_000_000) return `₩${(krw / 1_000_000).toFixed(0)}M`;
  if (krw >= 1_000) return `₩${(krw / 1_000).toFixed(0)}K`;
  return `₩${krw}`;
}

export function BudgetPanel({
  status,
  budgetBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/budget`,
}: Props) {
  const url = `${budgetBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const stateKey = status.status;
  const pct = status.summary.burnRatePct;
  const pctColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#4ade80";

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
            <h3 className="text-sm font-bold tracking-wider">BUDGET</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: STATE_COLOR[stateKey],
                border: `1px solid ${STATE_COLOR[stateKey]}44`,
                backgroundColor: `${STATE_COLOR[stateKey]}11`,
              }}
            >
              {STATE_LABEL[stateKey]}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            총예산 · 집행률 · 부서별 배정
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
          Open in Budget →
        </a>
      </header>

      <div className="flex flex-col gap-3 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="Total" value={fmtKRW(status.totalAllocated)} color="#F0F0F0" />
          <Cell label="Spent" value={fmtKRW(status.summary.spent)} color="#f59e0b" />
          <Cell label="Remaining" value={fmtKRW(status.summary.remaining)} color="#4ade80" />
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span style={{ color: "var(--studio-text-dim)" }}>Burn rate</span>
            <span className="font-mono" style={{ color: pctColor }}>
              {pct}%
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded"
            style={{ backgroundColor: "var(--studio-bg-elevated)" }}
          >
            <div
              className="h-full rounded"
              style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: pctColor,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {status.departments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {status.departments.map((d) => (
              <span
                key={d.department}
                className="rounded px-2 py-0.5 text-[10px]"
                style={{
                  backgroundColor: "var(--studio-bg-elevated)",
                  color: "var(--studio-text-dim)",
                  border: "1px solid var(--studio-border)",
                }}
              >
                {d.department} · {fmtKRW(d.allocated)}
              </span>
            ))}
          </div>
        )}
      </div>
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
