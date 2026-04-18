"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScoutedLocation } from "../../../lib/locations/mock-entries";

interface Props {
  locations: ScoutedLocation[];
}

const STATUS_COLOR: Record<ScoutedLocation["status"], string> = {
  scouting: "#707070",
  shortlisted: "#f59e0b",
  permitted: "#00FF41",
  confirmed: "#4ade80",
  rejected: "#ef4444",
};

const STATUS_LABEL: Record<ScoutedLocation["status"], string> = {
  scouting: "답사",
  shortlisted: "후보",
  permitted: "허가",
  confirmed: "확정",
  rejected: "기각",
};

const PERMIT_LABEL: Record<NonNullable<ScoutedLocation["permitStatus"]>, string> = {
  none: "—",
  pending: "진행 중",
  approved: "승인",
};

function fmtKRW(krw?: number): string {
  if (!krw) return "—";
  if (krw >= 1_000_000) return `₩${(krw / 1_000_000).toFixed(1)}M`;
  if (krw >= 1_000) return `₩${(krw / 1_000).toFixed(0)}K`;
  return `₩${krw}`;
}

export function LocationsClient({ locations }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ScoutedLocation[]>();
    for (const l of locations) {
      const arr = map.get(l.projectId) ?? [];
      arr.push(l);
      map.set(l.projectId, arr);
    }
    // Status urgency ordering: confirmed/permitted first, then shortlisted, then scouting
    const order: Record<ScoutedLocation["status"], number> = {
      confirmed: 0, permitted: 1, shortlisted: 2, scouting: 3, rejected: 4,
    };
    for (const arr of map.values()) {
      arr.sort((a, b) => order[a.status] - order[b.status]);
    }
    return map;
  }, [locations]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">LOCATIONS</h1>
          <p className="mt-1 text-xs text-neutral-500">
            로케이션 헌팅 · 허가 · 계약 · 씬 매핑
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
        <p className="text-sm text-neutral-500">등록된 로케이션이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectLocs = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const confirmed = projectLocs.filter((l) => l.status === "confirmed").length;
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
                  {confirmed}/{projectLocs.length} confirmed
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
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Address</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Scenes</th>
                  <th className="pb-2 text-right font-medium">Rate/day</th>
                  <th className="pb-2 font-medium">Permit</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectLocs.map((l) => (
                  <tr key={l.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-medium text-neutral-200">{l.name}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{l.address}</td>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-500">
                      {l.interior ? "INT" : "EXT"}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {l.sceneIds?.join(", ") ?? ""}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {fmtKRW(l.dailyRateKRW)}
                    </td>
                    <td className="py-2 text-[10px] text-neutral-500">
                      {l.permitStatus ? PERMIT_LABEL[l.permitStatus] : "—"}
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
          </section>
        );
      })}
    </div>
  );
}
