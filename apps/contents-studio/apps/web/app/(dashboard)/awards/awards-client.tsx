"use client";

import { useEffect, useMemo, useState } from "react";
import type { AwardEntry } from "../../../lib/awards/mock-entries";
import { CATEGORY_LABEL, STATUS_COLOR, STATUS_LABEL } from "../../../lib/awards/mock-entries";

interface Props {
  entries: AwardEntry[];
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(0)}억원`;
  if (amount >= 10_000) return `${Math.round(amount / 10_000)}만원`;
  return `${amount.toLocaleString()}원`;
}

export function AwardsClient({ entries }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, AwardEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.projectId) ?? [];
      arr.push(e);
      map.set(e.projectId, arr);
    }
    return map;
  }, [entries]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">AWARDS CAMPAIGN</h1>
          <p className="mt-1 text-xs text-neutral-500">시상식 캠페인 · 수상 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 시상식 캠페인이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectEntries = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const nominated = projectEntries.filter(
          (e) => e.status === "nominated" || e.status === "shortlisted",
        ).length;
        const won = projectEntries.filter((e) => e.status === "won").length;
        const totalBudget = projectEntries.reduce((s, e) => s + (e.campaignBudgetKRW ?? 0), 0);

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
            <header className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">{pid}</h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {projectEntries.length}개 부문
                  {nominated > 0 && ` · 노미네이트 ${nominated}`}
                  {won > 0 && (
                    <span style={{ color: "#00FF41" }}> · 수상 {won}</span>
                  )}
                  {totalBudget > 0 && ` · 캠페인 ${formatKRW(totalBudget)}`}
                </span>
              </div>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#00FF41", border: "1px solid #00FF4144", backgroundColor: "#00FF4111" }}
                >
                  deep-linked
                </span>
              )}
            </header>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">시상식</th>
                  <th className="pb-2 text-right font-medium">연도</th>
                  <th className="pb-2 font-medium">부문</th>
                  <th className="pb-2 text-right font-medium">캠페인 예산</th>
                  <th className="pb-2 font-medium">시사회</th>
                  <th className="pb-2 font-medium">결과 발표</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectEntries.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-200">{e.ceremony}</td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-500">{e.year}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{CATEGORY_LABEL[e.category]}</td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {e.campaignBudgetKRW !== undefined ? formatKRW(e.campaignBudgetKRW) : "—"}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{e.screeningDate ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{e.resultDate ?? "—"}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[e.status],
                          border: `1px solid ${STATUS_COLOR[e.status]}44`,
                          backgroundColor: `${STATUS_COLOR[e.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[e.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectEntries.some((e) => e.note) && (
              <div className="mt-3 space-y-1">
                {projectEntries.filter((e) => e.note).map((e) => (
                  <p key={e.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{e.ceremony} {CATEGORY_LABEL[e.category]}:</span> {e.note}
                  </p>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
