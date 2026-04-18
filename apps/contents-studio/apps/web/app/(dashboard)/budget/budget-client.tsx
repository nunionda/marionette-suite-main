"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeBudgetSummary,
  type ProjectBudget,
} from "../../../lib/budget/mock-entries";

interface Props {
  budgets: ProjectBudget[];
}

const STATUS_COLOR: Record<ProjectBudget["status"], string> = {
  draft: "#707070",
  submitted: "#f59e0b",
  approved: "#4ade80",
  locked: "#00FF41",
};

const STATUS_LABEL: Record<ProjectBudget["status"], string> = {
  draft: "초안",
  submitted: "제출",
  approved: "승인",
  locked: "확정",
};

function fmtKRW(krw: number): string {
  if (krw >= 1_000_000_000) return `₩${(krw / 1_000_000_000).toFixed(1)}B`;
  if (krw >= 1_000_000) return `₩${(krw / 1_000_000).toFixed(0)}M`;
  if (krw >= 1_000) return `₩${(krw / 1_000).toFixed(0)}K`;
  return `₩${krw}`;
}

export function BudgetClient({ budgets }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const ordered = useMemo(() => {
    if (highlightedProjectId) {
      const highlight = budgets.filter((b) => b.projectId === highlightedProjectId);
      const rest = budgets.filter((b) => b.projectId !== highlightedProjectId);
      return [...highlight, ...rest];
    }
    return budgets;
  }, [budgets, highlightedProjectId]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">BUDGET</h1>
          <p className="mt-1 text-xs text-neutral-500">
            프로젝트별 총예산 · 부서별 배정 · 집행률 · 승인 흐름
          </p>
        </div>
        <a
          href="/projects"
          className="text-xs text-neutral-500 underline hover:text-neutral-300"
        >
          ← Projects
        </a>
      </header>

      {ordered.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 예산이 없습니다.</p>
      )}

      {ordered.map((b) => {
        const isHighlighted = b.projectId === highlightedProjectId;
        const { spent, remaining, burnRatePct } = computeBudgetSummary(b);
        return (
          <section
            key={b.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {b.projectId}
                </h2>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: STATUS_COLOR[b.status],
                    border: `1px solid ${STATUS_COLOR[b.status]}44`,
                    backgroundColor: `${STATUS_COLOR[b.status]}11`,
                  }}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                {b.approvedBy && (
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                    {b.approvedBy} · {b.approvedAt}
                  </span>
                )}
              </div>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#00FF41",
                    border: "1px solid #00FF4144",
                    backgroundColor: "#00FF4111",
                  }}
                >
                  deep-linked
                </span>
              )}
            </header>

            {/* summary row */}
            <div className="mb-4 grid grid-cols-4 gap-3 text-center">
              <SummaryBox label="Total" value={fmtKRW(b.totalAllocated)} color="#F0F0F0" />
              <SummaryBox label="Spent" value={fmtKRW(spent)} color="#f59e0b" />
              <SummaryBox label="Remaining" value={fmtKRW(remaining)} color="#4ade80" />
              <SummaryBox label="Burn rate" value={`${burnRatePct}%`} color="#00FF41" />
            </div>

            {/* progress bar */}
            <div className="mb-4">
              <div
                className="h-1.5 w-full overflow-hidden rounded"
                style={{ backgroundColor: "#1E1E1E" }}
              >
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.min(burnRatePct, 100)}%`,
                    backgroundColor: burnRatePct >= 90 ? "#ef4444" : "#f59e0b",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* departments table */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 text-right font-medium">Allocated</th>
                  <th className="pb-2 text-right font-medium">Spent</th>
                  <th className="pb-2 text-right font-medium">% Used</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {b.lineItems.map((li) => {
                  const pct = li.allocated > 0
                    ? Math.round((li.spent / li.allocated) * 100)
                    : 0;
                  return (
                    <tr key={li.department} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                      <td className="py-2 text-neutral-300">{li.department}</td>
                      <td className="py-2 text-right font-mono text-neutral-300">
                        {fmtKRW(li.allocated)}
                      </td>
                      <td className="py-2 text-right font-mono text-neutral-400">
                        {fmtKRW(li.spent)}
                      </td>
                      <td
                        className="py-2 text-right font-mono"
                        style={{
                          color: pct >= 90
                            ? "#ef4444"
                            : pct >= 70
                              ? "#f59e0b"
                              : "#4ade80",
                        }}
                      >
                        {pct}%
                      </td>
                      <td className="py-2 text-neutral-500">{li.note ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded px-2 py-2"
      style={{
        border: "1px solid #1E1E1E",
        backgroundColor: "#141414",
      }}
    >
      <div className="font-mono text-base font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
    </div>
  );
}
