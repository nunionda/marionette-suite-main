"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailyReport } from "../../../lib/daily-report/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/daily-report/mock-entries";

interface Props {
  reports: DailyReport[];
}

export function DailyReportClient({ reports }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, DailyReport[]>();
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
          <h1 className="text-xl font-bold tracking-wider text-white">DAILY PRODUCTION REPORT</h1>
          <p className="mt-1 text-xs text-neutral-500">일일 촬영 보고서 · 현장 진행 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 일일 보고서가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectReports = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved = projectReports.filter((r) => r.status === "approved").length;
        const totalScheduled = projectReports.reduce((s, r) => s + r.scheduledPages, 0);
        const totalCompleted = projectReports.reduce((s, r) => s + r.completedPages, 0);
        const efficiency = totalScheduled > 0 ? ((totalCompleted / totalScheduled) * 100).toFixed(0) : "—";

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
                  {projectReports.length}일차 · 승인 {approved}/{projectReports.length} · 효율 {efficiency}%
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
                  <th className="pb-2 font-medium">촬영일</th>
                  <th className="pb-2 font-medium">날짜</th>
                  <th className="pb-2 font-medium">유닛</th>
                  <th className="pb-2 text-right font-medium">예정 페이지</th>
                  <th className="pb-2 text-right font-medium">완료 페이지</th>
                  <th className="pb-2 text-right font-medium">씬</th>
                  <th className="pb-2 text-right font-medium">셋업</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectReports.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-neutral-300">Day {r.shootDay}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{r.date}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{r.unit}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">{r.scheduledPages}p</td>
                    <td className="py-2 text-right font-mono"
                      style={{ color: r.completedPages >= r.scheduledPages ? "#00FF41" : "#facc15" }}>
                      {r.completedPages}p
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {r.completedScenes}/{r.totalScenes}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">{r.setups}</td>
                    <td className="py-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectReports.some((r) => r.note) && (
              <div className="mt-3 space-y-1">
                {projectReports.filter((r) => r.note).map((r) => (
                  <p key={r.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">Day {r.shootDay}:</span> {r.note}
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
