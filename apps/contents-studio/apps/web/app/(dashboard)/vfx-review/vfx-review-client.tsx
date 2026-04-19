"use client";

import { useEffect, useMemo, useState } from "react";
import type { VfxReviewShot } from "../../../lib/vfx-review/mock-entries";
import {
  COMPLEXITY_COLOR,
  COMPLEXITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../../../lib/vfx-review/mock-entries";

interface Props {
  shots: VfxReviewShot[];
}

export function VfxReviewClient({ shots }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, VfxReviewShot[]>();
    for (const s of shots) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }, [shots]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">VFX REVIEW</h1>
          <p className="mt-1 text-xs text-neutral-500">VFX 샷 검토 · 벤더 승인</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 VFX 샷이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectShots = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved  = projectShots.filter((s) => s.status === "approved" || s.status === "locked").length;
        const heroShots = projectShots.filter((s) => s.complexity === "hero").length;

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
                  {projectShots.length}개 샷
                  {heroShots > 0 && (
                    <span style={{ color: "#ef4444" }}> · 히어로 {heroShots}</span>
                  )}
                  {approved > 0 && (
                    <span style={{ color: "#00FF41" }}> · 승인 {approved}</span>
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
                  <th className="pb-2 font-medium">샷코드</th>
                  <th className="pb-2 font-medium">시퀀스</th>
                  <th className="pb-2 font-medium">설명</th>
                  <th className="pb-2 font-medium">벤더</th>
                  <th className="pb-2 font-medium">복잡도</th>
                  <th className="pb-2 font-medium">버전</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectShots.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-300">{s.shotCode}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">{s.sequence}</td>
                    <td className="py-2 max-w-[200px] text-[11px] text-neutral-300">{s.description}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{s.vendor}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: COMPLEXITY_COLOR[s.complexity],
                          border: `1px solid ${COMPLEXITY_COLOR[s.complexity]}44`,
                          backgroundColor: `${COMPLEXITY_COLOR[s.complexity]}11`,
                        }}
                      >
                        {COMPLEXITY_LABEL[s.complexity]}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">v{s.versions}</td>
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

            {projectShots.some((s) => s.notes) && (
              <div className="mt-3 space-y-1">
                {projectShots.filter((s) => s.notes).map((s) => (
                  <p key={s.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{s.shotCode}:</span> {s.notes}
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
