"use client";

import { useEffect, useMemo, useState } from "react";
import type { FestivalEntry } from "../../../lib/festivals/mock-entries";

interface Props {
  entries: FestivalEntry[];
}

const STATUS_COLOR: Record<FestivalEntry["status"], string> = {
  pending: "#707070",
  submitted: "#f59e0b",
  selected: "#00FF41",
  rejected: "#ef4444",
  screened: "#4ade80",
  awarded: "#fbbf24",
};

const STATUS_LABEL: Record<FestivalEntry["status"], string> = {
  pending: "대기",
  submitted: "제출",
  selected: "선정",
  rejected: "기각",
  screened: "상영",
  awarded: "수상",
};

const TIER_COLOR: Record<FestivalEntry["tier"], string> = {
  A: "#fbbf24",
  B: "#00FF41",
  specialty: "#a78bfa",
  regional: "#707070",
};

const TIER_LABEL: Record<FestivalEntry["tier"], string> = {
  A: "A-List",
  B: "B-List",
  specialty: "특화",
  regional: "지역",
};

const CATEGORY_LABEL: Record<FestivalEntry["category"], string> = {
  competition: "경쟁",
  out_of_competition: "비경쟁",
  showcase: "쇼케이스",
  market: "마켓",
  special_screening: "특별 상영",
};

export function FestivalsClient({ entries }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, FestivalEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.projectId) ?? [];
      arr.push(e);
      map.set(e.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.deadline.localeCompare(b.deadline));
    }
    return map;
  }, [entries]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">FESTIVAL STRATEGY</h1>
          <p className="mt-1 text-xs text-neutral-500">
            영화제 출품 · 선정 · 상영 · 수상 전략
          </p>
        </div>
        <a
          href="/projects"
          className="text-xs text-neutral-500 underline hover:text-neutral-300"
        >
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 영화제 출품이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectEntries = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const selected = projectEntries.filter(
          (e) => e.status === "selected" || e.status === "screened" || e.status === "awarded",
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
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {selected}/{projectEntries.length} selected
                </span>
              </div>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#00FF41",
                    border: "1px solid #00FF4144",
                    backgroundColor: "#00FF4111",
                  }}
                >
                  deep-linked
                </span>
              )}
            </header>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">Festival</th>
                  <th className="pb-2 font-medium">Country</th>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Deadline</th>
                  <th className="pb-2 font-medium">Festival Date</th>
                  <th className="pb-2 text-right font-medium">Fee</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectEntries.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-medium text-neutral-200">
                      {e.festivalName}
                      <span className="ml-1 text-[10px] text-neutral-600">#{e.edition}</span>
                    </td>
                    <td className="py-2 text-[11px] text-neutral-400">{e.country}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: TIER_COLOR[e.tier],
                          border: `1px solid ${TIER_COLOR[e.tier]}44`,
                          backgroundColor: `${TIER_COLOR[e.tier]}11`,
                        }}
                      >
                        {TIER_LABEL[e.tier]}
                      </span>
                    </td>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-500">
                      {CATEGORY_LABEL[e.category]}
                    </td>
                    <td className="py-2 font-mono text-neutral-400">{e.deadline}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {e.festivalDate ?? "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {e.submissionFee === 0 ? (
                        <span className="text-neutral-600">무료</span>
                      ) : e.submissionFee ? (
                        `$${e.submissionFee}`
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[e.status],
                          border: `1px solid ${STATUS_COLOR[e.status]}44`,
                          backgroundColor: `${STATUS_COLOR[e.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[e.status]}
                      </span>
                      {e.award && (
                        <span
                          className="ml-2 text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: "#fbbf24" }}
                        >
                          🏆 {e.award}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
