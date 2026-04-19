"use client";

import { useEffect, useMemo, useState } from "react";
import type { PictureLockVersion } from "../../../lib/picture-lock/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/picture-lock/mock-entries";

interface Props {
  versions: PictureLockVersion[];
}

export function PictureLockClient({ versions }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, PictureLockVersion[]>();
    for (const v of versions) {
      const arr = map.get(v.projectId) ?? [];
      arr.push(v);
      map.set(v.projectId, arr);
    }
    return map;
  }, [versions]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">PICTURE LOCK</h1>
          <p className="mt-1 text-xs text-neutral-500">픽처 락 · 편집 확정</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 픽처 락 버전이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectVersions = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const locked       = projectVersions.filter((v) => v.status === "locked").length;
        const latestStatus = projectVersions.at(-1)?.status;

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
                  {projectVersions.length}개 버전
                  {locked > 0 && (
                    <span style={{ color: "#00FF41" }}> · 픽처 락 확정</span>
                  )}
                  {!locked && latestStatus && (
                    <span style={{ color: STATUS_COLOR[latestStatus] }}>
                      {" "}· {STATUS_LABEL[latestStatus]}
                    </span>
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
                  <th className="pb-2 font-medium">날짜</th>
                  <th className="pb-2 font-medium">런타임</th>
                  <th className="pb-2 font-medium">씬</th>
                  <th className="pb-2 font-medium">컷수</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectVersions.map((v) => (
                  <tr key={v.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-300">{v.version}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">{v.date}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{v.totalRuntime}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{v.scenes}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{v.cuts}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[v.status],
                          border: `1px solid ${STATUS_COLOR[v.status]}44`,
                          backgroundColor: `${STATUS_COLOR[v.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[v.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectVersions.some((v) => v.notes) && (
              <div className="mt-3 space-y-1">
                {projectVersions.filter((v) => v.notes).map((v) => (
                  <p key={v.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{v.version}:</span> {v.notes}
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
