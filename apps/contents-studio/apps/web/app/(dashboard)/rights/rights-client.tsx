"use client";

import { useEffect, useState } from "react";
import type { RightsEntry } from "../../../lib/rights/mock-entries";

interface Props {
  entries: RightsEntry[];
}

const STATUS_COLOR = {
  clear: "#00FF41",
  pending: "#facc15",
  issue: "#ef4444",
  not_applicable: "#6b7280",
} as const;

const STATUS_LABEL = {
  clear: "클리어",
  pending: "협상 중",
  issue: "이슈",
  not_applicable: "해당없음",
} as const;

const TYPE_LABEL: Record<string, string> = {
  script_ip: "각본 IP",
  music: "음악",
  footage: "영상",
  trademark: "상표",
  location: "로케이션",
  likeness: "초상권",
  adaptation: "원작 각색",
};

export function RightsClient({ entries }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedId(pid);
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (a.projectId === highlightedId) return -1;
    if (b.projectId === highlightedId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">RIGHTS / CLEARANCES</h1>
          <p className="mt-1 text-xs text-neutral-500">
            각본 IP · 음악 · 상표 · 초상권 · 법무 클리어런스 — Charter #11
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {sorted.map((entry) => {
        const isHighlighted = entry.projectId === highlightedId;
        const hasIssue = entry.items.some((i) => i.status === "issue");
        return (
          <section
            key={entry.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : hasIssue ? "#ef444444" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {entry.projectId}
                </h2>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: STATUS_COLOR[entry.overallStatus],
                    border: `1px solid ${STATUS_COLOR[entry.overallStatus]}44`,
                    backgroundColor: `${STATUS_COLOR[entry.overallStatus]}11`,
                  }}
                >
                  {STATUS_LABEL[entry.overallStatus]}
                </span>
                {entry.legalCounsel && (
                  <span className="text-[11px] text-neutral-500">{entry.legalCounsel}</span>
                )}
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
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {entry.items.map((item, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-neutral-500">
                      {TYPE_LABEL[item.type] ?? item.type}
                    </td>
                    <td className="py-2 text-neutral-300 max-w-xs">{item.description}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[item.status],
                          border: `1px solid ${STATUS_COLOR[item.status]}44`,
                          backgroundColor: `${STATUS_COLOR[item.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="py-2 text-neutral-600 text-[11px]">{item.note ?? "—"}</td>
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
