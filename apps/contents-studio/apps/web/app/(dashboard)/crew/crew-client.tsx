"use client";

import { useEffect, useMemo, useState } from "react";
import type { CrewMember } from "../../../lib/crew/mock-entries";
import { DEPT_COLOR, DEPT_LABEL } from "../../../lib/crew/mock-entries";

interface Props {
  crew: CrewMember[];
}

const HIRE_STATUS_COLOR: Record<CrewMember["status"], string> = {
  searching: "#ef4444",
  interviewing: "#facc15",
  offered: "#60a5fa",
  hired: "#00FF41",
};

const HIRE_STATUS_LABEL: Record<CrewMember["status"], string> = {
  searching: "인재 탐색",
  interviewing: "면접 중",
  offered: "오퍼 완료",
  hired: "확정",
};

function formatKRW(n: number) {
  if (!n) return "—";
  return `₩${(n / 1_000_000).toFixed(1)}M/일`;
}

export function CrewClient({ crew }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, CrewMember[]>();
    for (const m of crew) {
      const arr = map.get(m.projectId) ?? [];
      arr.push(m);
      map.set(m.projectId, arr);
    }
    return map;
  }, [crew]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">CREW HIRING</h1>
          <p className="mt-1 text-xs text-neutral-500">
            스태프 채용 · 부서별 현황 · 일급 · 합류일
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 스태프가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const items = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const hired = items.filter((m) => m.status === "hired").length;
        const searching = items.filter((m) => m.status === "searching").length;

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
                  {hired}/{items.length} hired
                  {searching > 0 && (
                    <span style={{ color: "#ef4444" }}> · 탐색 중 {searching}</span>
                  )}
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
                  <th className="pb-2 font-medium">포지션</th>
                  <th className="pb-2 font-medium">부서</th>
                  <th className="pb-2 font-medium">이름</th>
                  <th className="pb-2 font-medium">소속</th>
                  <th className="pb-2 text-right font-medium">일급</th>
                  <th className="pb-2 font-medium">합류일</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-200">{m.position}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: DEPT_COLOR[m.department],
                          border: `1px solid ${DEPT_COLOR[m.department]}44`,
                          backgroundColor: `${DEPT_COLOR[m.department]}11`,
                        }}
                      >
                        {DEPT_LABEL[m.department]}
                      </span>
                    </td>
                    <td className="py-2 text-neutral-400">{m.name ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{m.agencyOrUnion ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {formatKRW(m.dailyRateKRW ?? 0)}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {m.startDate ?? "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: HIRE_STATUS_COLOR[m.status],
                          border: `1px solid ${HIRE_STATUS_COLOR[m.status]}44`,
                          backgroundColor: `${HIRE_STATUS_COLOR[m.status]}11`,
                        }}
                      >
                        {HIRE_STATUS_LABEL[m.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.some((m) => m.note) && (
              <div className="mt-3 space-y-1">
                {items.filter((m) => m.note).map((m) => (
                  <p key={m.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{m.position}:</span> {m.note}
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
