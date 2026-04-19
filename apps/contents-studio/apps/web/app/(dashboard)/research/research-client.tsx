"use client";

import { useEffect, useState } from "react";
import type { ResearchEntry } from "../../../lib/research/mock-entries";

interface Props {
  entries: ResearchEntry[];
}

const STATUS_COLOR = {
  not_started: "#6b7280",
  in_progress: "#facc15",
  complete: "#00FF41",
} as const;

const STATUS_LABEL = {
  not_started: "미시작",
  in_progress: "진행 중",
  complete: "완료",
} as const;

export function ResearchClient({ entries }: Props) {
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
          <h1 className="text-xl font-bold tracking-wider text-white">RESEARCH</h1>
          <p className="mt-1 text-xs text-neutral-500">
            시장 조사 · 유사 작품 분석 · 기술 조사 — Charter #6
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {sorted.map((entry) => {
        const isHighlighted = entry.projectId === highlightedId;
        return (
          <section
            key={entry.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
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

            {entry.marketSize && (
              <div className="mb-4 rounded border p-3 text-xs text-neutral-400"
                style={{ borderColor: "#1E1E1E", backgroundColor: "#050505" }}>
                <span className="mr-2 text-[10px] uppercase tracking-wider text-neutral-600">Market Size</span>
                {entry.marketSize}
              </div>
            )}

            {entry.comparableTitles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-neutral-600 self-center">
                  Comps
                </span>
                {entry.comparableTitles.map((t) => (
                  <span
                    key={t}
                    className="rounded border px-2 py-0.5 text-[11px] text-neutral-400"
                    style={{ borderColor: "#1E1E1E" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {entry.categories.map((cat) => (
                <div
                  key={cat.category}
                  className="rounded border p-3"
                  style={{ borderColor: "#1E1E1E" }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">{cat.category}</span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: STATUS_COLOR[cat.status],
                        border: `1px solid ${STATUS_COLOR[cat.status]}44`,
                        backgroundColor: `${STATUS_COLOR[cat.status]}11`,
                      }}
                    >
                      {STATUS_LABEL[cat.status]}
                    </span>
                  </div>
                  {cat.findings && (
                    <p className="text-xs text-neutral-500 leading-relaxed">{cat.findings}</p>
                  )}
                  {cat.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {cat.sources.map((s) => (
                        <span key={s} className="text-[10px] text-neutral-600">
                          [{s}]
                        </span>
                      ))}
                    </div>
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
