"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArchiveAsset } from "../../../lib/archive/mock-entries";
import { CATEGORY_LABEL, STATUS_COLOR, STATUS_LABEL } from "../../../lib/archive/mock-entries";

interface Props {
  assets: ArchiveAsset[];
}

export function ArchiveClient({ assets }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ArchiveAsset[]>();
    for (const a of assets) {
      const arr = map.get(a.projectId) ?? [];
      arr.push(a);
      map.set(a.projectId, arr);
    }
    return map;
  }, [assets]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">ARCHIVE & RIGHTS</h1>
          <p className="mt-1 text-xs text-neutral-500">콘텐츠 아카이브 · 저작권 관리</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 아카이브 자산이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectAssets = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const active = projectAssets.filter((a) => a.status === "active").length;
        const restricted = projectAssets.filter((a) => a.status === "restricted").length;

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
                  {projectAssets.length}개 자산 · 보관 중 {active}
                  {restricted > 0 && (
                    <span style={{ color: "#f87171" }}> · 제한 {restricted}</span>
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
                  <th className="pb-2 font-medium">분류</th>
                  <th className="pb-2 font-medium">설명</th>
                  <th className="pb-2 font-medium">포맷</th>
                  <th className="pb-2 font-medium">보관 위치</th>
                  <th className="pb-2 text-right font-medium">보존 기간</th>
                  <th className="pb-2 font-medium">권리 만료</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectAssets.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {CATEGORY_LABEL[a.assetCategory]}
                    </td>
                    <td className="py-2 text-neutral-300">{a.description}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">{a.format ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {a.storageLocation ?? "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {a.retentionYears !== undefined ? `${a.retentionYears}년` : "—"}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {a.rightsExpiryDate ?? "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[a.status],
                          border: `1px solid ${STATUS_COLOR[a.status]}44`,
                          backgroundColor: `${STATUS_COLOR[a.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectAssets.some((a) => a.notes) && (
              <div className="mt-3 space-y-1">
                {projectAssets.filter((a) => a.notes).map((a) => (
                  <p key={a.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{CATEGORY_LABEL[a.assetCategory]}:</span> {a.notes}
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
