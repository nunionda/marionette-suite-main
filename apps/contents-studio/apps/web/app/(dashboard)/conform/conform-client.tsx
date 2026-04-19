"use client";

import { useEffect, useMemo, useState } from "react";
import type { ConformReel } from "../../../lib/conform/mock-entries";
import {
  STANDARD_COLOR,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../../../lib/conform/mock-entries";

interface Props {
  reels: ConformReel[];
}

export function ConformClient({ reels }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ConformReel[]>();
    for (const r of reels) {
      const arr = map.get(r.projectId) ?? [];
      arr.push(r);
      map.set(r.projectId, arr);
    }
    return map;
  }, [reels]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">CONFORM / ONLINING</h1>
          <p className="mt-1 text-xs text-neutral-500">컨폼 · 온라이닝 · DCP 마스터링</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 컨폼 릴이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectReels = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const delivered = projectReels.filter((r) => r.status === "delivered").length;
        const inProgress = projectReels.filter(
          (r) => r.status === "conform-in-progress" || r.status === "qc-review",
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
                  {projectReels.length}개 릴 · 납품 {delivered}
                  {inProgress > 0 && (
                    <span style={{ color: "#60a5fa" }}> · 진행중 {inProgress}</span>
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
                  <th className="pb-2 font-medium">릴</th>
                  <th className="pb-2 font-medium">타이틀</th>
                  <th className="pb-2 font-medium">포맷</th>
                  <th className="pb-2 font-medium">색공간</th>
                  <th className="pb-2 font-medium">해상도</th>
                  <th className="pb-2 font-medium">오디오</th>
                  <th className="pb-2 font-medium">납품일</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectReels.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">R{r.reelNumber}</td>
                    <td className="py-2 max-w-[180px] text-[11px] text-neutral-300">{r.title}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STANDARD_COLOR[r.standard],
                          border: `1px solid ${STANDARD_COLOR[r.standard]}44`,
                          backgroundColor: `${STANDARD_COLOR[r.standard]}11`,
                        }}
                      >
                        {r.standard}
                      </span>
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{r.colorSpace}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{r.resolution}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{r.audioConfig}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {r.deliveryDate ?? "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[r.status],
                          border: `1px solid ${STATUS_COLOR[r.status]}44`,
                          backgroundColor: `${STATUS_COLOR[r.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectReels.some((r) => r.notes) && (
              <div className="mt-3 space-y-1">
                {projectReels.filter((r) => r.notes).map((r) => (
                  <p key={r.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">R{r.reelNumber} {r.standard}:</span> {r.notes}
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
