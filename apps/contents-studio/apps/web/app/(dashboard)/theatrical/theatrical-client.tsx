"use client";

import { useEffect, useMemo, useState } from "react";
import type { TheatricalRelease } from "../../../lib/theatrical/mock-entries";
import { PHASE_COLOR, PHASE_LABEL } from "../../../lib/theatrical/mock-entries";

interface Props {
  releases: TheatricalRelease[];
}

function formatKRW(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}십억원`;
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(0)}억원`;
  return `${amount.toLocaleString()}원`;
}

export function TheatricalClient({ releases }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, TheatricalRelease[]>();
    for (const r of releases) {
      const arr = map.get(r.projectId) ?? [];
      arr.push(r);
      map.set(r.projectId, arr);
    }
    return map;
  }, [releases]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">THEATRICAL RELEASE</h1>
          <p className="mt-1 text-xs text-neutral-500">극장 개봉 계획 · 개봉 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 극장 개봉 정보가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectReleases = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const totalAdmissions = projectReleases.reduce(
          (s, r) => s + (r.totalAdmissions ?? 0),
          0,
        );

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
                  {projectReleases.length}개 지역
                  {totalAdmissions > 0 && ` · 총 관객 ${totalAdmissions.toLocaleString()}명`}
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

            <div className="flex flex-col gap-3">
              {projectReleases.map((r) => (
                <div
                  key={r.id}
                  className="rounded border p-3"
                  style={{ borderColor: "#1E1E1E", backgroundColor: "#0A0A0A" }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-200">
                        {r.territory}
                      </span>
                      {r.ratingCode && (
                        <span className="rounded border px-1 text-[10px] text-neutral-500"
                          style={{ borderColor: "#2E2E2E" }}>
                          {r.ratingCode}
                        </span>
                      )}
                    </div>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: PHASE_COLOR[r.phase],
                        border: `1px solid ${PHASE_COLOR[r.phase]}44`,
                        backgroundColor: `${PHASE_COLOR[r.phase]}11`,
                      }}
                    >
                      {PHASE_LABEL[r.phase]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px]">
                    {r.targetReleaseDate && (
                      <span className="text-neutral-500">
                        <span className="text-neutral-600">목표 개봉:</span> {r.targetReleaseDate}
                      </span>
                    )}
                    {r.actualReleaseDate && (
                      <span className="text-neutral-500">
                        <span className="text-neutral-600">실제 개봉:</span> {r.actualReleaseDate}
                      </span>
                    )}
                    {r.distributorKR && (
                      <span className="text-neutral-500">
                        <span className="text-neutral-600">배급:</span> {r.distributorKR}
                      </span>
                    )}
                    {r.openingScreens !== undefined && (
                      <span className="text-neutral-500">
                        <span className="text-neutral-600">스크린:</span> {r.openingScreens.toLocaleString()}
                      </span>
                    )}
                    {r.totalAdmissions !== undefined && (
                      <span className="font-mono" style={{ color: "#00FF41" }}>
                        관객 {r.totalAdmissions.toLocaleString()}명
                      </span>
                    )}
                    {r.boxOfficeTotalKRW !== undefined && (
                      <span className="font-mono text-neutral-400">
                        {formatKRW(r.boxOfficeTotalKRW)}
                      </span>
                    )}
                  </div>

                  {r.theaters && r.theaters.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.theaters.map((t) => (
                        <span
                          key={t.chain}
                          className="rounded px-1.5 py-0.5 text-[10px] text-neutral-500"
                          style={{ backgroundColor: "#1A1A1A", border: "1px solid #2E2E2E" }}
                        >
                          {t.chain} {t.screenCount}개
                        </span>
                      ))}
                    </div>
                  )}

                  {r.note && (
                    <p className="mt-2 text-[11px] text-neutral-600">{r.note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
