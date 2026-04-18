"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReviewEntry } from "../../../lib/reviews/mock-entries";

interface Props {
  entries: ReviewEntry[];
}

const SOURCE_LABEL: Record<ReviewEntry["source"], string> = {
  critic_press: "평론지",
  critic_aggregator: "집계",
  audience_portal: "관객",
  social: "소셜",
  festival_jury: "심사위원",
};

const SOURCE_COLOR: Record<ReviewEntry["source"], string> = {
  critic_press: "#a78bfa",
  critic_aggregator: "#fbbf24",
  audience_portal: "#00FF41",
  social: "#f59e0b",
  festival_jury: "#4ade80",
};

const SENTIMENT_COLOR: Record<ReviewEntry["sentiment"], string> = {
  positive: "#4ade80",
  mixed: "#f59e0b",
  negative: "#ef4444",
};

const SENTIMENT_LABEL: Record<ReviewEntry["sentiment"], string> = {
  positive: "긍정",
  mixed: "혼합",
  negative: "부정",
};

export function ReviewsClient({ entries }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ReviewEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.projectId) ?? [];
      arr.push(e);
      map.set(e.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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
          <h1 className="text-xl font-bold tracking-wider text-white">REVIEWS & RECEPTION</h1>
          <p className="mt-1 text-xs text-neutral-500">
            평론 · 관객 평점 · 감성 분석 · 집계
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
        <p className="text-sm text-neutral-500">등록된 리뷰가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectEntries = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const scored = projectEntries.filter((e) => e.score !== null);
        const avg = scored.length > 0
          ? scored.reduce((acc, e) => acc + (e.score ?? 0), 0) / scored.length
          : null;
        const positive = projectEntries.filter((e) => e.sentiment === "positive").length;
        const positivePct = projectEntries.length > 0
          ? Math.round((positive / projectEntries.length) * 100)
          : 0;

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
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                {avg != null && (
                  <span
                    className="rounded px-2 py-0.5 font-mono text-xs font-bold"
                    style={{
                      color: avg >= 7 ? "#4ade80" : avg >= 5 ? "#f59e0b" : "#ef4444",
                      border: `1px solid ${avg >= 7 ? "#4ade8044" : avg >= 5 ? "#f59e0b44" : "#ef444444"}`,
                      backgroundColor: avg >= 7 ? "#4ade8011" : avg >= 5 ? "#f59e0b11" : "#ef444411",
                    }}
                  >
                    ★ {avg.toFixed(1)}
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {positivePct}% 긍정 · {projectEntries.length}개
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
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Outlet</th>
                  <th className="pb-2 font-medium">Reviewer</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Score</th>
                  <th className="pb-2 font-medium">Sentiment</th>
                  <th className="pb-2 font-medium">Headline</th>
                </tr>
              </thead>
              <tbody>
                {projectEntries.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: SOURCE_COLOR[e.source],
                          border: `1px solid ${SOURCE_COLOR[e.source]}44`,
                          backgroundColor: `${SOURCE_COLOR[e.source]}11`,
                        }}
                      >
                        {SOURCE_LABEL[e.source]}
                      </span>
                    </td>
                    <td className="py-2 font-medium text-neutral-200">{e.outlet}</td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {e.reviewer ?? "—"}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-500">
                      {e.publishedAt}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {e.score != null ? (
                        <span
                          className="font-bold"
                          style={{
                            color: e.score >= 7 ? "#4ade80" : e.score >= 5 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {e.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: SENTIMENT_COLOR[e.sentiment],
                          border: `1px solid ${SENTIMENT_COLOR[e.sentiment]}44`,
                          backgroundColor: `${SENTIMENT_COLOR[e.sentiment]}11`,
                        }}
                      >
                        {SENTIMENT_LABEL[e.sentiment]}
                      </span>
                    </td>
                    <td className="py-2 text-[11px] text-neutral-300">
                      {e.headline ?? "—"}
                      {e.excerpt && (
                        <div className="mt-0.5 text-[10px] italic text-neutral-500">
                          &ldquo;{e.excerpt}&rdquo;
                        </div>
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
