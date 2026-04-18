"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BoxOfficeReport,
  ProjectReleaseMeta,
  Territory,
} from "../../../lib/boxoffice/mock-entries";

interface Props {
  reports: BoxOfficeReport[];
  releases: ProjectReleaseMeta[];
}

const TERRITORY_LABEL: Record<Territory, string> = {
  KR: "🇰🇷 Korea",
  US: "🇺🇸 USA",
  JP: "🇯🇵 Japan",
  CN: "🇨🇳 China",
  FR: "🇫🇷 France",
  UK: "🇬🇧 UK",
  DE: "🇩🇪 Germany",
  global: "🌍 Global",
};

const PATTERN_LABEL: Record<ProjectReleaseMeta["pattern"], string> = {
  wide: "와이드",
  platform: "플랫폼",
  limited: "한정",
  streaming: "스트리밍",
  festival_only: "영화제 한정",
};

function formatRevenue(revenue: number, currency: "KRW" | "USD") {
  if (currency === "KRW") {
    if (revenue >= 1_000_000_000) return `₩${(revenue / 1_000_000_000).toFixed(2)}B`;
    if (revenue >= 1_000_000) return `₩${(revenue / 1_000_000).toFixed(1)}M`;
    return `₩${revenue.toLocaleString()}`;
  }
  if (revenue >= 1_000_000) return `$${(revenue / 1_000_000).toFixed(2)}M`;
  if (revenue >= 1_000) return `$${(revenue / 1_000).toFixed(1)}K`;
  return `$${revenue.toLocaleString()}`;
}

function formatAdmissions(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

export function BoxOfficeClient({ reports, releases }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, BoxOfficeReport[]>();
    for (const r of reports) {
      const arr = map.get(r.projectId) ?? [];
      arr.push(r);
      map.set(r.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        if (a.territory !== b.territory) return a.territory.localeCompare(b.territory);
        return a.weekNumber - b.weekNumber;
      });
    }
    return map;
  }, [reports]);

  const projectIds = useMemo(() => {
    const ids = releases.map((r) => r.projectId);
    if (highlightedProjectId && ids.includes(highlightedProjectId)) {
      return [highlightedProjectId, ...ids.filter((id) => id !== highlightedProjectId)];
    }
    return ids;
  }, [releases, highlightedProjectId]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">BOX OFFICE</h1>
          <p className="mt-1 text-xs text-neutral-500">
            박스오피스 · 관객수 · 손익분기 · 주차별 추이
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
        <p className="text-sm text-neutral-500">개봉 정보가 등록된 프로젝트가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const meta = releases.find((r) => r.projectId === pid);
        const projectReports = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        if (!meta) return null;

        const krReports = projectReports.filter((r) => r.territory === "KR");
        const krRevenue = krReports.reduce((acc, r) => acc + r.revenue, 0);
        const krAdmissions = krReports.reduce((acc, r) => acc + r.admissions, 0);
        const producerNet = krRevenue * 0.5;
        const breakevenPct = meta.budgetKRW > 0
          ? Math.round((producerNet / meta.budgetKRW) * 100)
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
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {PATTERN_LABEL[meta.pattern]}
                </span>
                {meta.released ? (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: "#00FF41",
                      border: "1px solid #00FF4144",
                      backgroundColor: "#00FF4111",
                    }}
                  >
                    개봉 · {meta.releaseDate}
                  </span>
                ) : (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: "#707070",
                      border: "1px solid #1E1E1E",
                      backgroundColor: "transparent",
                    }}
                  >
                    미개봉
                  </span>
                )}
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

            {meta.released ? (
              <>
                {/* Summary strip */}
                <div className="mb-4 grid grid-cols-4 gap-2 text-center">
                  <Cell
                    label="KR 누적"
                    value={formatRevenue(krRevenue, "KRW")}
                    sub={`${formatAdmissions(krAdmissions)}명`}
                    color="#00FF41"
                  />
                  <Cell
                    label="제작비"
                    value={formatRevenue(meta.budgetKRW, "KRW")}
                    color="#a78bfa"
                  />
                  <Cell
                    label="손익분기"
                    value={`${breakevenPct}%`}
                    sub={breakevenPct >= 100 ? "달성" : "진행중"}
                    color={breakevenPct >= 100 ? "#4ade80" : "#f59e0b"}
                  />
                  <Cell
                    label="주차"
                    value={`W${krReports.length}`}
                    sub={`${new Set(projectReports.map((r) => r.territory)).size}개 지역`}
                    color="#f59e0b"
                  />
                </div>

                {/* Weekly table */}
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                      <th className="pb-2 font-medium">지역</th>
                      <th className="pb-2 font-medium">주차</th>
                      <th className="pb-2 font-medium">주 시작</th>
                      <th className="pb-2 text-right font-medium">관객수</th>
                      <th className="pb-2 text-right font-medium">매출</th>
                      <th className="pb-2 text-right font-medium">상영관</th>
                      <th className="pb-2 text-right font-medium">순위</th>
                      <th className="pb-2 text-right font-medium">WoW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectReports.map((r) => (
                      <tr key={r.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                        <td className="py-2 text-[11px] text-neutral-300">
                          {TERRITORY_LABEL[r.territory]}
                        </td>
                        <td className="py-2 font-mono text-neutral-400">W{r.weekNumber}</td>
                        <td className="py-2 font-mono text-[11px] text-neutral-500">
                          {r.weekStarting}
                        </td>
                        <td className="py-2 text-right font-mono text-neutral-200">
                          {formatAdmissions(r.admissions)}
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-neutral-200">
                          {formatRevenue(r.revenue, r.currency)}
                        </td>
                        <td className="py-2 text-right font-mono text-neutral-400">
                          {r.screens.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-mono text-neutral-400">
                          #{r.rank}
                        </td>
                        <td className="py-2 text-right font-mono text-[11px]">
                          {r.weekOverWeekPct != null ? (
                            <span
                              style={{
                                color: r.weekOverWeekPct < 0 ? "#ef4444" : "#4ade80",
                              }}
                            >
                              {r.weekOverWeekPct > 0 ? "+" : ""}
                              {r.weekOverWeekPct}%
                            </span>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-xs text-neutral-500">
                아직 개봉하지 않았습니다. Distribution 단계를 먼저 진행하세요.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded px-3 py-2"
      style={{
        border: "1px solid #1E1E1E",
        backgroundColor: "#141414",
      }}
    >
      <div className="font-mono text-sm font-bold leading-none" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 font-mono text-[10px] text-neutral-500">{sub}</div>
      )}
      <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-600">
        {label}
      </div>
    </div>
  );
}
