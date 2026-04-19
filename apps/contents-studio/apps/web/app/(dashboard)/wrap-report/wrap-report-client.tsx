"use client";

import { useEffect, useMemo, useState } from "react";
import type { WrapReport } from "../../../lib/wrap-report/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/wrap-report/mock-entries";

interface Props {
  reports: WrapReport[];
}

function formatKRW(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (abs >= 10_000) return `${Math.round(amount / 10_000)}만원`;
  return `${amount.toLocaleString()}원`;
}

export function WrapReportClient({ reports }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, WrapReport[]>();
    for (const r of reports) {
      const arr = map.get(r.projectId) ?? [];
      arr.push(r);
      map.set(r.projectId, arr);
    }
    return map;
  }, [reports]);

  const projectIds = useMemo(() => {
    const ids = Array.from(byProject.keys());
    if (highlightedProjectId && ids.includes(highlightedProjectId)) {
      return [highlightedProjectId, ...ids.filter((id) => id !== highlightedProjectId)];
    }
    return ids;
  }, [byProject, highlightedProjectId]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">WRAP REPORT</h1>
          <p className="mt-1 text-xs text-neutral-500">랩 보고서 · 촬영 종합 결산</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 랩 보고서가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectReports = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;

        return (
          <section
            key={pid}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-sm font-bold tracking-wider text-white">{pid}</h2>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#00FF41", border: "1px solid #00FF4144", backgroundColor: "#00FF4111" }}
                >
                  deep-linked
                </span>
              )}
            </header>

            <div className="flex flex-col gap-4">
              {projectReports.map((r) => {
                const budgetDelta = r.overUnderBudgetKRW;
                const budgetColor =
                  budgetDelta === undefined ? "#707070" : budgetDelta > 0 ? "#f87171" : "#00FF41";
                const budgetLabel =
                  budgetDelta === undefined
                    ? "—"
                    : budgetDelta > 0
                      ? `+${formatKRW(budgetDelta)} 초과`
                      : `${formatKRW(budgetDelta)} 절감`;

                return (
                  <div
                    key={r.id}
                    className="rounded border p-4"
                    style={{ borderColor: "#1E1E1E", backgroundColor: "#0A0A0A" }}
                  >
                    {/* Header row */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-neutral-400">{r.id}</span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[r.status],
                          border: `1px solid ${STATUS_COLOR[r.status]}44`,
                          backgroundColor: `${STATUS_COLOR[r.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>

                    {/* Stats grid */}
                    <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">촬영일수</p>
                        <p className="font-mono text-neutral-200">
                          {r.shootingDays}일
                          <span className="ml-1 text-neutral-500">/ 계획 {r.plannedDays}일</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">총 페이지</p>
                        <p className="font-mono text-neutral-200">{r.totalPagesShot}p</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">총 셋업</p>
                        <p className="font-mono text-neutral-200">{r.totalSetups}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">예산 증감</p>
                        <p className="font-mono" style={{ color: budgetColor }}>{budgetLabel}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mb-3 flex flex-wrap gap-4 text-[11px]">
                      {r.principalWrapDate && (
                        <span className="text-neutral-500">
                          <span className="text-neutral-600">촬영 완료:</span> {r.principalWrapDate}
                        </span>
                      )}
                      {r.postHandoffDate && (
                        <span className="text-neutral-500">
                          <span className="text-neutral-600">후반 인도:</span> {r.postHandoffDate}
                        </span>
                      )}
                      {r.preparedBy && (
                        <span className="text-neutral-500">
                          <span className="text-neutral-600">작성:</span> {r.preparedBy}
                        </span>
                      )}
                    </div>

                    {/* Highlights */}
                    {r.highlights && r.highlights.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {r.highlights.map((h, i) => (
                          <p key={i} className="text-[11px] text-neutral-500">
                            <span className="mr-1 text-neutral-600">·</span>{h}
                          </p>
                        ))}
                      </div>
                    )}

                    {r.note && (
                      <p className="mt-2 text-[11px] text-neutral-600">
                        <span className="text-neutral-500">비고:</span> {r.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
