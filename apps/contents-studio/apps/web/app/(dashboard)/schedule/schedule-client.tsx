"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShootDay } from "../../../lib/schedule/mock-entries";

interface Props {
  days: ShootDay[];
}

const STATUS_COLOR: Record<ShootDay["status"], string> = {
  scheduled: "#707070",
  in_progress: "#00FF41",
  wrapped: "#4ade80",
  cancelled: "#ef4444",
};

const STATUS_LABEL: Record<ShootDay["status"], string> = {
  scheduled: "예정",
  in_progress: "촬영 중",
  wrapped: "랩",
  cancelled: "취소",
};

export function ScheduleClient({ days }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  // Deep-link support: ?paperclipId=ID-001 auto-highlights that project's days
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  // Group by project for a project-centric calendar view
  const byProject = useMemo(() => {
    const map = new Map<string, ShootDay[]>();
    for (const d of days) {
      const arr = map.get(d.projectId) ?? [];
      arr.push(d);
      map.set(d.projectId, arr);
    }
    // Sort each project's days by date
    for (const arr of map.values()) {
      arr.sort((a, b) => a.date.localeCompare(b.date));
    }
    return map;
  }, [days]);

  const projectIds = useMemo(() => {
    const ids = Array.from(byProject.keys());
    // Place highlighted project first
    if (highlightedProjectId && ids.includes(highlightedProjectId)) {
      return [highlightedProjectId, ...ids.filter((id) => id !== highlightedProjectId)];
    }
    return ids;
  }, [byProject, highlightedProjectId]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">SHOOT SCHEDULE</h1>
          <p className="mt-1 text-xs text-neutral-500">
            프로젝트별 촬영일 · 로케이션 · 콜타임 관리 · Script Breakdown → 일정 편성
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
        <p className="text-sm text-neutral-500">등록된 촬영 일정이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectDays = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        return (
          <section
            key={pid}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted
                ? "0 0 0 1px #00FF4133"
                : undefined,
            }}
          >
            <header className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {projectDays.length} days
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
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Scenes</th>
                  <th className="pb-2 font-medium">Call</th>
                  <th className="pb-2 font-medium">Wrap</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectDays.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t"
                    style={{ borderColor: "#1E1E1E" }}
                  >
                    <td className="py-2 font-mono text-neutral-400">D{d.day}</td>
                    <td className="py-2 font-mono text-neutral-300">{d.date}</td>
                    <td className="py-2 text-neutral-300">
                      <span className="mr-1 text-[10px] uppercase text-neutral-500">
                        {d.interior ? "INT" : "EXT"}
                      </span>
                      {d.location}
                    </td>
                    <td className="py-2 font-mono text-neutral-500">
                      {d.sceneIds.join(", ")}
                    </td>
                    <td className="py-2 font-mono text-neutral-400">{d.callTime}</td>
                    <td className="py-2 font-mono text-neutral-400">{d.wrapTime}</td>
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
          </section>
        );
      })}
    </div>
  );
}
