"use client";

import { useEffect, useState } from "react";
import type { FinancingEntry } from "../../../lib/financing/mock-entries";

interface Props {
  entries: FinancingEntry[];
}

const STATUS_COLOR: Record<FinancingEntry["status"], string> = {
  seeking: "#707070",
  partial: "#facc15",
  fully_financed: "#60a5fa",
  greenlit: "#00FF41",
  on_hold: "#ef4444",
};

const STATUS_LABEL: Record<FinancingEntry["status"], string> = {
  seeking: "투자 유치 중",
  partial: "일부 확보",
  fully_financed: "완전 확보",
  greenlit: "그린릿",
  on_hold: "보류",
};

const SOURCE_TYPE_LABEL: Record<string, string> = {
  equity: "지분",
  debt: "부채",
  grant: "보조금",
  presale: "선판매",
  tax_incentive: "세액공제",
  crowdfunding: "크라우드펀딩",
};

const SOURCE_STATUS_COLOR = {
  confirmed: "#00FF41",
  pending: "#facc15",
  declined: "#ef4444",
} as const;

function formatKRW(amount: number): string {
  if (amount >= 1_000_000_000) return `₩${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₩${(amount / 1_000_000).toFixed(0)}M`;
  return `₩${amount.toLocaleString()}`;
}

export function FinancingClient({ entries }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedId(pid);
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (a.projectId === highlightedId) return -1;
    if (b.projectId === highlightedId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">FINANCING / GREENLIGHT</h1>
          <p className="mt-1 text-xs text-neutral-500">
            투자 구조 · 재원 조달 · 그린릿 현황 — Charter #13
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {sorted.map((entry) => {
        const isHighlighted = entry.projectId === highlightedId;
        const pct = Math.round((entry.totalRaised / entry.totalBudget) * 100);
        return (
          <section
            key={entry.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {entry.projectId}
                </h2>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: STATUS_COLOR[entry.status],
                    border: `1px solid ${STATUS_COLOR[entry.status]}44`,
                    backgroundColor: `${STATUS_COLOR[entry.status]}11`,
                  }}
                >
                  {STATUS_LABEL[entry.status]}
                </span>
              </div>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{ color: "#00FF41", border: "1px solid #00FF4144", backgroundColor: "#00FF4111" }}
                >
                  deep-linked
                </span>
              )}
            </header>

            {/* Budget progress bar */}
            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-neutral-400">
                  {formatKRW(entry.totalRaised)} raised
                </span>
                <span className="font-mono text-neutral-300">
                  {pct}% / {formatKRW(entry.totalBudget)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#1E1E1E" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: pct >= 100 ? "#00FF41" : pct >= 50 ? "#60a5fa" : "#facc15",
                  }}
                />
              </div>
            </div>

            {entry.greenlitDate && (
              <div className="mb-4 text-xs text-neutral-500">
                <span className="mr-1 text-[10px] uppercase tracking-wider text-neutral-700">Greenlit</span>
                {entry.greenlitDate.slice(0, 10)}
                {entry.greenlitBy ? ` by ${entry.greenlitBy}` : ""}
              </div>
            )}

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">%</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entry.sources.map((src, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-300">{src.source}</td>
                    <td className="py-2 text-neutral-500">
                      {SOURCE_TYPE_LABEL[src.type] ?? src.type}
                    </td>
                    <td className="py-2 font-mono text-neutral-300">{formatKRW(src.amount)}</td>
                    <td className="py-2 font-mono text-neutral-500">{src.percentage}%</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: SOURCE_STATUS_COLOR[src.status],
                          border: `1px solid ${SOURCE_STATUS_COLOR[src.status]}44`,
                          backgroundColor: `${SOURCE_STATUS_COLOR[src.status]}11`,
                        }}
                      >
                        {src.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
