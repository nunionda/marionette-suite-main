"use client";

import { useEffect, useMemo, useState } from "react";
import type { Deliverable } from "../../../lib/deliverables/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/deliverables/mock-entries";

interface Props {
  deliverables: Deliverable[];
}

export function DeliverablesClient({ deliverables }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, Deliverable[]>();
    for (const d of deliverables) {
      const arr = map.get(d.projectId) ?? [];
      arr.push(d);
      map.set(d.projectId, arr);
    }
    return map;
  }, [deliverables]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">DELIVERABLES PREP</h1>
          <p className="mt-1 text-xs text-neutral-500">납품 준비 · 플랫폼별 인코딩</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 납품 항목이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectDeliverables = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const delivered = projectDeliverables.filter((d) => d.status === "delivered").length;
        const pending   = projectDeliverables.filter((d) => d.status === "pending").length;

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
                  {projectDeliverables.length}개 납품
                  {delivered > 0 && (
                    <span style={{ color: "#22c55e" }}> · 완료 {delivered}</span>
                  )}
                  {pending > 0 && (
                    <span style={{ color: "#707070" }}> · 대기 {pending}</span>
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
                  <th className="pb-2 font-medium">명칭</th>
                  <th className="pb-2 font-medium">플랫폼</th>
                  <th className="pb-2 font-medium">스펙</th>
                  <th className="pb-2 font-medium">납품기한</th>
                  <th className="pb-2 font-medium">파일크기</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectDeliverables.map((d) => (
                  <tr key={d.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[11px] text-neutral-300">{d.name}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{d.platform}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{d.spec}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {d.dueDate ?? "—"}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {d.fileSize ?? "—"}
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

            {projectDeliverables.some((d) => d.notes) && (
              <div className="mt-3 space-y-1">
                {projectDeliverables.filter((d) => d.notes).map((d) => (
                  <p key={d.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{d.name}:</span> {d.notes}
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
