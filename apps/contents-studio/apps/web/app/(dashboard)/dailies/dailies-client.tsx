"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailiesSession } from "../../../lib/dailies/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/dailies/mock-entries";

interface Props {
  sessions: DailiesSession[];
}

export function DailiesClient({ sessions }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, DailiesSession[]>();
    for (const s of sessions) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }, [sessions]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">DAILIES / RUSHES REVIEW</h1>
          <p className="mt-1 text-xs text-neutral-500">일일 촬영분 시사 · 러시즈 검토</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 데일리즈 세션이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectSessions = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved = projectSessions.filter((s) => s.status === "approved").length;
        const flagged  = projectSessions.filter((s) => s.status === "flagged").length;

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
                  {projectSessions.length}일 촬영
                  {approved > 0 && (
                    <span style={{ color: "#00FF41" }}> · 승인 {approved}</span>
                  )}
                  {flagged > 0 && (
                    <span style={{ color: "#ef4444" }}> · 재촬영 {flagged}</span>
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
                  <th className="pb-2 font-medium">촬영일</th>
                  <th className="pb-2 font-medium">날짜</th>
                  <th className="pb-2 font-medium">로케이션</th>
                  <th className="pb-2 font-medium">포맷</th>
                  <th className="pb-2 font-medium">클립수</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectSessions.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">D+{s.shootDay}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">{s.date}</td>
                    <td className="py-2 max-w-[180px] text-[11px] text-neutral-300">{s.location}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{s.format}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{s.clipCount}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[s.status],
                          border: `1px solid ${STATUS_COLOR[s.status]}44`,
                          backgroundColor: `${STATUS_COLOR[s.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectSessions.some((s) => s.directorNotes || s.dpNotes) && (
              <div className="mt-3 space-y-1">
                {projectSessions.filter((s) => s.directorNotes).map((s) => (
                  <p key={`dir-${s.id}`} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">D+{s.shootDay} 감독:</span> {s.directorNotes}
                  </p>
                ))}
                {projectSessions.filter((s) => s.dpNotes).map((s) => (
                  <p key={`dp-${s.id}`} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">D+{s.shootDay} DP:</span> {s.dpNotes}
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
