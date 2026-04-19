"use client";

import { useEffect, useMemo, useState } from "react";
import type { PressAsset } from "../../../lib/press-kit/mock-entries";
import { ASSET_TYPE_LABEL, STATUS_COLOR, STATUS_LABEL } from "../../../lib/press-kit/mock-entries";

interface Props {
  assets: PressAsset[];
}

export function PressKitClient({ assets }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, PressAsset[]>();
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
          <h1 className="text-xl font-bold tracking-wider text-white">PRESS KIT</h1>
          <p className="mt-1 text-xs text-neutral-500">홍보 자료 · 프레스 킷 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 프레스 킷 자료가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectAssets = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const ready = projectAssets.filter(
          (a) => a.status === "ready" || a.status === "distributed",
        ).length;
        const totalOutlets = projectAssets.reduce((s, a) => s + (a.outletCount ?? 0), 0);

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
                  {projectAssets.length}개 자료 · 준비 {ready}/{projectAssets.length}
                  {totalOutlets > 0 && ` · 배포 ${totalOutlets}개 매체`}
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
                  <th className="pb-2 font-medium">자료 유형</th>
                  <th className="pb-2 font-medium">언어</th>
                  <th className="pb-2 text-right font-medium">배포 매체</th>
                  <th className="pb-2 font-medium">담당자</th>
                  <th className="pb-2 font-medium">마감일</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectAssets.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-300">
                      {ASSET_TYPE_LABEL[a.assetType]}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {a.language}
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {a.outletCount !== undefined ? a.outletCount : "—"}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{a.assignedTo ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{a.dueDate ?? "—"}</td>
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

            {projectAssets.some((a) => a.note) && (
              <div className="mt-3 space-y-1">
                {projectAssets.filter((a) => a.note).map((a) => (
                  <p key={a.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{ASSET_TYPE_LABEL[a.assetType]}:</span> {a.note}
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
