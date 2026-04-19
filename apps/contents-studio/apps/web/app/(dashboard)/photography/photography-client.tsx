"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShootDay } from "../../../lib/photography/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/photography/mock-entries";

interface Props {
  days: ShootDay[];
}

export function PhotographyClient({ days }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ShootDay[]>();
    for (const d of days) {
      const arr = map.get(d.projectId) ?? [];
      arr.push(d);
      map.set(d.projectId, arr);
    }
    return map;
  }, [days]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">PRINCIPAL PHOTOGRAPHY</h1>
          <p className="mt-1 text-xs text-neutral-500">주요 촬영 일정 · 슛 데이 관리</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 촬영 일정이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectDays = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const completed = projectDays.filter((d) => d.status === "completed").length;
        const totalSetups = projectDays.reduce((n, d) => n + d.setups, 0);

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
                  {projectDays.length}일 · 완료 {completed} · 총{" "}
                  <span className="font-mono">{totalSetups}</span>셋업
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
                  <th className="pb-2 font-medium">일차</th>
                  <th className="pb-2 font-medium">날짜</th>
                  <th className="pb-2 font-medium">로케이션</th>
                  <th className="pb-2 font-medium">감독 / DP</th>
                  <th className="pb-2 font-medium">콜타임</th>
                  <th className="pb-2 text-right font-medium">페이지</th>
                  <th className="pb-2 text-right font-medium">셋업</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectDays.map((d) => (
                  <tr key={d.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">D{d.shootDay}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{d.date}</td>
                    <td className="py-2 text-[11px] text-neutral-300">{d.location}</td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {d.director} / {d.dp}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{d.callTime}</td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {d.pageCount}p
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {d.setups}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[d.status],
                          border: `1px solid ${STATUS_COLOR[d.status]}44`,
                          backgroundColor: `${STATUS_COLOR[d.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectDays.some((d) => d.notes) && (
              <div className="mt-3 space-y-1">
                {projectDays.filter((d) => d.notes).map((d) => (
                  <p key={d.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">D{d.shootDay}:</span> {d.notes}
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
