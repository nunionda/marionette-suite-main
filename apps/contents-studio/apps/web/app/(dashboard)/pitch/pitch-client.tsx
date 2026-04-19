"use client";

import { useEffect, useState } from "react";
import type { PitchEntry } from "../../../lib/pitch/mock-entries";

interface Props {
  pitches: PitchEntry[];
}

const STATUS_COLOR: Record<PitchEntry["status"], string> = {
  draft: "#707070",
  ready: "#60a5fa",
  pitched: "#facc15",
  greenlit: "#00FF41",
  rejected: "#ef4444",
};

const STATUS_LABEL: Record<PitchEntry["status"], string> = {
  draft: "초안",
  ready: "준비 완료",
  pitched: "피칭 중",
  greenlit: "그린릿",
  rejected: "반려",
};

const OUTCOME_COLOR = {
  interested: "#60a5fa",
  pass: "#ef4444",
  pending: "#facc15",
  greenlit: "#00FF41",
} as const;

const OUTCOME_LABEL = {
  interested: "관심",
  pass: "패스",
  pending: "검토 중",
  greenlit: "그린릿",
} as const;

function formatKRW(amount: number): string {
  if (amount >= 1_000_000_000) return `₩${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₩${(amount / 1_000_000).toFixed(0)}M`;
  return `₩${amount.toLocaleString()}`;
}

export function PitchClient({ pitches }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedId(pid);
  }, []);

  const sorted = [...pitches].sort((a, b) => {
    if (a.projectId === highlightedId) return -1;
    if (b.projectId === highlightedId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">PITCH DECK</h1>
          <p className="mt-1 text-xs text-neutral-500">
            바이어 피칭 · 미팅 이력 · Ask Amount · 투자자 반응 — Charter #12
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {sorted.map((pitch) => {
        const isHighlighted = pitch.projectId === highlightedId;
        return (
          <section
            key={pitch.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pitch.projectId}
                </h2>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: STATUS_COLOR[pitch.status],
                    border: `1px solid ${STATUS_COLOR[pitch.status]}44`,
                    backgroundColor: `${STATUS_COLOR[pitch.status]}11`,
                  }}
                >
                  {STATUS_LABEL[pitch.status]}
                </span>
                <span className="font-mono text-sm text-neutral-300">
                  {formatKRW(pitch.askAmount)}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Deck {pitch.deckVersion} · ROI {pitch.proposedROI}
                </span>
              </div>
              {isHighlighted && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{ color: "#00FF41", border: "1px solid #00FF4144", backgroundColor: "#00FF4111" }}
                >
                  deep-linked
                </span>
              )}
            </header>

            <div className="mb-4 flex flex-wrap gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-neutral-600 self-center">
                Target Buyers
              </span>
              {pitch.targetBuyers.map((b) => (
                <span
                  key={b}
                  className="rounded border px-2 py-0.5 text-[11px] text-neutral-400"
                  style={{ borderColor: "#1E1E1E" }}
                >
                  {b}
                </span>
              ))}
            </div>

            {pitch.meetings.length > 0 && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Buyer</th>
                    <th className="pb-2 font-medium">Outcome</th>
                    <th className="pb-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {pitch.meetings.map((m, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                      <td className="py-2 font-mono text-neutral-500">
                        {m.date.slice(0, 10)}
                      </td>
                      <td className="py-2 text-neutral-300">{m.buyer}</td>
                      <td className="py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: OUTCOME_COLOR[m.outcome],
                            border: `1px solid ${OUTCOME_COLOR[m.outcome]}44`,
                            backgroundColor: `${OUTCOME_COLOR[m.outcome]}11`,
                          }}
                        >
                          {OUTCOME_LABEL[m.outcome]}
                        </span>
                      </td>
                      <td className="py-2 text-neutral-600 text-[11px]">{m.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}
    </div>
  );
}
