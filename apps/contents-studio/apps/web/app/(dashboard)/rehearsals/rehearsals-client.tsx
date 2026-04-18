"use client";

import { useEffect, useMemo, useState } from "react";
import type { RehearsalSession } from "../../../lib/rehearsals/mock-entries";

interface Props {
  sessions: RehearsalSession[];
}

const STATUS_COLOR: Record<RehearsalSession["status"], string> = {
  scheduled: "#707070",
  in_progress: "#00FF41",
  completed: "#4ade80",
  cancelled: "#ef4444",
};

const STATUS_LABEL: Record<RehearsalSession["status"], string> = {
  scheduled: "예정",
  in_progress: "진행 중",
  completed: "완료",
  cancelled: "취소",
};

const TYPE_LABEL: Record<RehearsalSession["type"], string> = {
  table_read: "테이블 리딩",
  blocking: "블로킹",
  scene_work: "씬 워크",
  chemistry: "케미스트리",
  stunt: "스턴트",
  dance: "댄스",
};

export function RehearsalsClient({ sessions }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, RehearsalSession[]>();
    for (const s of sessions) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.date.localeCompare(b.date));
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
          <h1 className="text-xl font-bold tracking-wider text-white">REHEARSALS</h1>
          <p className="mt-1 text-xs text-neutral-500">
            배우 × 씬 × 연습 일정 · 테이블 리딩 · 블로킹 · 스턴트
          </p>
        </div>
        <a
          href="/projects"
          className="text-xs text-neutral-500 underline hover:text-neutral-300"
        >
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 리허설이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectSessions = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const completed = projectSessions.filter((s) => s.status === "completed").length;
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
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {completed}/{projectSessions.length} completed
                </span>
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

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Scenes</th>
                  <th className="pb-2 font-medium">Attendees</th>
                  <th className="pb-2 font-medium">Venue</th>
                  <th className="pb-2 text-right font-medium">Hours</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectSessions.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-neutral-300">{s.date}</td>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-400">
                      {TYPE_LABEL[s.type]}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {s.sceneIds.join(", ")}
                    </td>
                    <td className="py-2 text-neutral-300">{s.attendees.join(", ")}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{s.venue}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">{s.durationHours}h</td>
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
          </section>
        );
      })}
    </div>
  );
}
