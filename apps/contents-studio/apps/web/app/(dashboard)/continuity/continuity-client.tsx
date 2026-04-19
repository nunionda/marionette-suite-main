"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContinuityIssue } from "../../../lib/continuity/mock-entries";
import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  TYPE_LABEL,
} from "../../../lib/continuity/mock-entries";

interface Props {
  issues: ContinuityIssue[];
}

export function ContinuityClient({ issues }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ContinuityIssue[]>();
    for (const i of issues) {
      const arr = map.get(i.projectId) ?? [];
      arr.push(i);
      map.set(i.projectId, arr);
    }
    return map;
  }, [issues]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">CONTINUITY</h1>
          <p className="mt-1 text-xs text-neutral-500">연속성 감수 · 스크립트 슈퍼비전</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 연속성 이슈가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectIssues = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const critical = projectIssues.filter((i) => i.severity === "critical").length;
        const unfixed = projectIssues.filter(
          (i) => i.status === "flagged" || i.status === "under-review",
        ).length;

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
                  {projectIssues.length}개 이슈
                  {critical > 0 && (
                    <span style={{ color: "#ef4444" }}> · 심각 {critical}</span>
                  )}
                  {unfixed > 0 && (
                    <span style={{ color: "#f59e0b" }}> · 미해결 {unfixed}</span>
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
                  <th className="pb-2 font-medium">씬</th>
                  <th className="pb-2 font-medium">유형</th>
                  <th className="pb-2 font-medium">리포터</th>
                  <th className="pb-2 font-medium">설명</th>
                  <th className="pb-2 font-medium">영향 샷</th>
                  <th className="pb-2 font-medium">심각도</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectIssues.map((i) => (
                  <tr key={i.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{i.sceneId}</td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {TYPE_LABEL[i.continuityType]}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{i.reporter}</td>
                    <td className="py-2 max-w-[200px] text-[11px] text-neutral-300">
                      {i.description}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {i.affectedShots.join(", ")}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: SEVERITY_COLOR[i.severity],
                          border: `1px solid ${SEVERITY_COLOR[i.severity]}44`,
                          backgroundColor: `${SEVERITY_COLOR[i.severity]}11`,
                        }}
                      >
                        {SEVERITY_LABEL[i.severity]}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[i.status],
                          border: `1px solid ${STATUS_COLOR[i.status]}44`,
                          backgroundColor: `${STATUS_COLOR[i.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[i.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectIssues.some((i) => i.fixNotes) && (
              <div className="mt-3 space-y-1">
                {projectIssues.filter((i) => i.fixNotes).map((i) => (
                  <p key={i.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{i.sceneId}:</span> {i.fixNotes}
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
