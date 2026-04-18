"use client";

import { useEffect, useMemo, useState } from "react";
import type { CastingEntry } from "../../../lib/casting/mock-entries";

interface Props {
  entries: CastingEntry[];
}

const STATE_COLOR: Record<CastingEntry["state"], string> = {
  open: "#ef4444",
  audition: "#f59e0b",
  offer: "#00FF41",
  confirmed: "#4ade80",
  signed: "#4ade80",
};

const STATE_LABEL: Record<CastingEntry["state"], string> = {
  open: "공개",
  audition: "오디션",
  offer: "오퍼",
  confirmed: "확정",
  signed: "계약",
};

const ROLE_LABEL: Record<CastingEntry["characterRole"], string> = {
  lead: "주연",
  supporting: "조연",
  minor: "단역",
};

export function CastingClient({ entries }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, CastingEntry[]>();
    for (const c of entries) {
      const arr = map.get(c.projectId) ?? [];
      arr.push(c);
      map.set(c.projectId, arr);
    }
    // Sort: leads first, then by state urgency
    const roleOrder: Record<CastingEntry["characterRole"], number> = {
      lead: 0,
      supporting: 1,
      minor: 2,
    };
    for (const arr of map.values()) {
      arr.sort((a, b) => roleOrder[a.characterRole] - roleOrder[b.characterRole]);
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
          <h1 className="text-xl font-bold tracking-wider text-white">CASTING</h1>
          <p className="mt-1 text-xs text-neutral-500">
            캐릭터 × 배우 매칭 · 오디션 · 계약 상태
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
        <p className="text-sm text-neutral-500">등록된 캐스팅이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectEntries = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const signed = projectEntries.filter(
          (e) => e.state === "signed" || e.state === "confirmed",
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
                  {signed}/{projectEntries.length} cast
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
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Character</th>
                  <th className="pb-2 font-medium">Actor</th>
                  <th className="pb-2 font-medium">Agency</th>
                  <th className="pb-2 font-medium">State</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {projectEntries.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-500">
                      {ROLE_LABEL[e.characterRole]}
                    </td>
                    <td className="py-2 font-medium text-neutral-200">{e.characterName}</td>
                    <td className="py-2 text-neutral-300">
                      {e.actorName ?? (
                        <span className="text-neutral-600">— 미정 —</span>
                      )}
                    </td>
                    <td className="py-2 text-[10px] text-neutral-500">{e.agency ?? ""}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATE_COLOR[e.state],
                          border: `1px solid ${STATE_COLOR[e.state]}44`,
                          backgroundColor: `${STATE_COLOR[e.state]}11`,
                        }}
                      >
                        {STATE_LABEL[e.state]}
                      </span>
                      {e.auditionDate && (
                        <span className="ml-2 font-mono text-[10px] text-neutral-500">
                          {e.auditionDate}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-neutral-500">{e.note ?? ""}</td>
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
