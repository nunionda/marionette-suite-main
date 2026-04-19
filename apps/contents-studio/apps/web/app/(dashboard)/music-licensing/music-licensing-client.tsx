"use client";

import { useEffect, useMemo, useState } from "react";
import type { MusicLicense } from "../../../lib/music-licensing/mock-entries";
import {
  LICENSE_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  USAGE_LABEL,
} from "../../../lib/music-licensing/mock-entries";

interface Props {
  licenses: MusicLicense[];
}

function formatKRW(amount: number): string {
  if (amount === 0) return "무료";
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${Math.round(amount / 10_000)}만원`;
  return `${amount.toLocaleString()}원`;
}

export function MusicLicensingClient({ licenses }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, MusicLicense[]>();
    for (const l of licenses) {
      const arr = map.get(l.projectId) ?? [];
      arr.push(l);
      map.set(l.projectId, arr);
    }
    return map;
  }, [licenses]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">MUSIC LICENSING</h1>
          <p className="mt-1 text-xs text-neutral-500">음악 라이선싱 · 저작권 취득 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 음악 라이선스가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectLicenses = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const cleared = projectLicenses.filter(
          (l) => l.status === "cleared" || l.status === "licensed",
        ).length;
        const totalFee = projectLicenses.reduce((s, l) => s + (l.feeKRW ?? 0), 0);

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
                  {projectLicenses.length}곡 · 클리어 {cleared}/{projectLicenses.length} · 총 {formatKRW(totalFee)}
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
                  <th className="pb-2 font-medium">트랙</th>
                  <th className="pb-2 font-medium">유형</th>
                  <th className="pb-2 font-medium">용도</th>
                  <th className="pb-2 font-medium">지역</th>
                  <th className="pb-2 text-right font-medium">라이선스 비용</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectLicenses.map((l) => (
                  <tr key={l.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2">
                      <p className="text-neutral-200">{l.trackTitle}</p>
                      {l.artist && (
                        <p className="text-[10px] text-neutral-600">{l.artist}</p>
                      )}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {LICENSE_TYPE_LABEL[l.licenseType]}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {USAGE_LABEL[l.usageType]}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {l.territories.join(", ")}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {l.feeKRW !== undefined ? formatKRW(l.feeKRW) : "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[l.status],
                          border: `1px solid ${STATUS_COLOR[l.status]}44`,
                          backgroundColor: `${STATUS_COLOR[l.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[l.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectLicenses.some((l) => l.note) && (
              <div className="mt-3 space-y-1">
                {projectLicenses.filter((l) => l.note).map((l) => (
                  <p key={l.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{l.trackTitle}:</span> {l.note}
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
