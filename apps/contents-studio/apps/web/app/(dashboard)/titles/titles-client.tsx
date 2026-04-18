"use client";

import { useEffect, useMemo, useState } from "react";
import type { TitleCard } from "../../../lib/titles/mock-entries";

interface Props {
  cards: TitleCard[];
}

const STATUS_COLOR: Record<TitleCard["status"], string> = {
  draft: "#707070",
  review: "#f59e0b",
  approved: "#4ade80",
  locked: "#00FF41",
};

const STATUS_LABEL: Record<TitleCard["status"], string> = {
  draft: "초안",
  review: "검토",
  approved: "승인",
  locked: "확정",
};

const KIND_LABEL: Record<TitleCard["kind"], string> = {
  main_title: "메인 타이틀",
  opening_credits: "오프닝 크레딧",
  chapter_title: "챕터 타이틀",
  subtitle_card: "자막 카드",
  end_credits: "엔딩 크레딧",
  post_credits: "쿠키",
};

const KIND_ORDER: Record<TitleCard["kind"], number> = {
  main_title: 0,
  opening_credits: 1,
  subtitle_card: 2,
  chapter_title: 3,
  end_credits: 4,
  post_credits: 5,
};

function fmtDuration(sec?: number): string {
  if (!sec) return "—";
  if (sec >= 60) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${sec}s`;
}

export function TitlesClient({ cards }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, TitleCard[]>();
    for (const c of cards) {
      const arr = map.get(c.projectId) ?? [];
      arr.push(c);
      map.set(c.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    }
    return map;
  }, [cards]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">TITLES &amp; CREDITS</h1>
          <p className="mt-1 text-xs text-neutral-500">
            타이틀 · 크레딧 · 자막 카드 디자인 · 승인 흐름
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
        <p className="text-sm text-neutral-500">등록된 타이틀 디자인이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectCards = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved = projectCards.filter(
          (c) => c.status === "approved" || c.status === "locked",
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
                  {approved}/{projectCards.length} approved
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
                  <th className="pb-2 font-medium">Kind</th>
                  <th className="pb-2 font-medium">Label</th>
                  <th className="pb-2 font-medium">Text</th>
                  <th className="pb-2 font-medium">Font</th>
                  <th className="pb-2 text-right font-medium">Duration</th>
                  <th className="pb-2 font-medium">Designer</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectCards.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-500">
                      {KIND_LABEL[c.kind]}
                    </td>
                    <td className="py-2 font-medium text-neutral-200">{c.label}</td>
                    <td className="py-2 font-mono text-neutral-300">
                      {c.text ?? <span className="text-neutral-700">—</span>}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.font ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {fmtDuration(c.durationSec)}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.designer ?? "—"}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[c.status],
                          border: `1px solid ${STATUS_COLOR[c.status]}44`,
                          backgroundColor: `${STATUS_COLOR[c.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[c.status]}
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
