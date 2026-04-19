"use client";

import { useEffect, useMemo, useState } from "react";
import type { QCCheck } from "../../../lib/qc/mock-entries";
import { QC_TYPE_LABEL, STATUS_COLOR, STATUS_LABEL } from "../../../lib/qc/mock-entries";

interface Props {
  checks: QCCheck[];
}

export function QCClient({ checks }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, QCCheck[]>();
    for (const c of checks) {
      const arr = map.get(c.projectId) ?? [];
      arr.push(c);
      map.set(c.projectId, arr);
    }
    return map;
  }, [checks]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">QUALITY CONTROL</h1>
          <p className="mt-1 text-xs text-neutral-500">기술 품질 검수 · QC 리포트</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 QC 검수 내역이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectChecks = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const passed = projectChecks.filter((c) => c.status === "passed").length;
        const criticalTotal = projectChecks.reduce((s, c) => s + c.criticalIssues, 0);

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
                  {projectChecks.length}건 · 통과 {passed}/{projectChecks.length}
                  {criticalTotal > 0 && (
                    <span style={{ color: "#f87171" }}> · 크리티컬 {criticalTotal}건</span>
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
                  <th className="pb-2 font-medium">버전</th>
                  <th className="pb-2 font-medium">검수 항목</th>
                  <th className="pb-2 font-medium">검수자</th>
                  <th className="pb-2 font-medium">검수일</th>
                  <th className="pb-2 text-right font-medium">이슈</th>
                  <th className="pb-2 text-right font-medium">크리티컬</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectChecks.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{c.version}</td>
                    <td className="py-2 text-neutral-300">{QC_TYPE_LABEL[c.checkType]}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.checkedBy ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.checkedAt ?? "—"}</td>
                    <td
                      className="py-2 text-right font-mono"
                      style={{ color: c.issueCount > 0 ? "#facc15" : "#00FF41" }}
                    >
                      {c.issueCount}
                    </td>
                    <td
                      className="py-2 text-right font-mono"
                      style={{ color: c.criticalIssues > 0 ? "#f87171" : "#707070" }}
                    >
                      {c.criticalIssues}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[c.status],
                          border: `1px solid ${STATUS_COLOR[c.status]}44`,
                          backgroundColor: `${STATUS_COLOR[c.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectChecks.some((c) => c.notes && c.notes.length > 0) && (
              <div className="mt-3 space-y-1">
                {projectChecks
                  .filter((c) => c.notes && c.notes.length > 0)
                  .flatMap((c) =>
                    (c.notes ?? []).map((note, i) => (
                      <p key={`${c.id}-${i}`} className="text-[11px] text-neutral-600">
                        <span className="text-neutral-500">[{c.version} {QC_TYPE_LABEL[c.checkType]}]</span> {note}
                      </p>
                    )),
                  )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
