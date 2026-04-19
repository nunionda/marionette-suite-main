"use client";

import { useEffect, useMemo, useState } from "react";
import type { LightingPlan } from "../../../lib/lighting-design/mock-entries";
import { STATUS_COLOR, STATUS_LABEL, TIME_LABEL } from "../../../lib/lighting-design/mock-entries";

interface Props {
  plans: LightingPlan[];
}

export function LightingDesignClient({ plans }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, LightingPlan[]>();
    for (const p of plans) {
      const arr = map.get(p.projectId) ?? [];
      arr.push(p);
      map.set(p.projectId, arr);
    }
    return map;
  }, [plans]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">LIGHTING DESIGN</h1>
          <p className="mt-1 text-xs text-neutral-500">조명 설계 · 로케이션별 라이팅 플랜</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 조명 플랜이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectPlans = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const locked = projectPlans.filter((p) => p.status === "locked").length;
        const adjusted = projectPlans.filter((p) => p.status === "on-set-adjusted").length;

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
                  {projectPlans.length}개 플랜 · 확정 {locked}
                  {adjusted > 0 && (
                    <span style={{ color: "#f59e0b" }}> · 현장조정 {adjusted}</span>
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
                  <th className="pb-2 font-medium">로케이션</th>
                  <th className="pb-2 font-medium">시간대</th>
                  <th className="pb-2 font-medium">무드</th>
                  <th className="pb-2 font-medium">키 라이트</th>
                  <th className="pb-2 font-medium">필 비율</th>
                  <th className="pb-2 text-right font-medium">색온도</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectPlans.map((p) => (
                  <tr key={p.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[11px] text-neutral-300">{p.location}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{TIME_LABEL[p.timeOfDay]}</td>
                    <td className="py-2 max-w-[160px] text-[11px] text-neutral-500">{p.mood}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{p.keyLight}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">{p.fillRatio}</td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {p.colorTemp}K
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[p.status],
                          border: `1px solid ${STATUS_COLOR[p.status]}44`,
                          backgroundColor: `${STATUS_COLOR[p.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectPlans.some((p) => p.practicals.length > 0) && (
              <div className="mt-3 space-y-1">
                {projectPlans.map((p) => (
                  <p key={p.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{p.location}:</span>{" "}
                    프랙티컬 — {p.practicals.join(", ")}
                    {p.notes && <span className="text-neutral-700"> · {p.notes}</span>}
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
