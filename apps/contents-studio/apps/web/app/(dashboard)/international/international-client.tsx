"use client";

import { useEffect, useMemo, useState } from "react";
import type { IntlDeal } from "../../../lib/international/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/international/mock-entries";

interface Props {
  deals: IntlDeal[];
}

function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount.toLocaleString()}`;
}

const DEAL_TYPE_LABEL: Record<IntlDeal["dealType"], string> = {
  theatrical: "극장",
  streaming: "스트리밍",
  broadcast: "방송",
  "all-rights": "전권",
};

export function InternationalClient({ deals }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, IntlDeal[]>();
    for (const d of deals) {
      const arr = map.get(d.projectId) ?? [];
      arr.push(d);
      map.set(d.projectId, arr);
    }
    return map;
  }, [deals]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">INTERNATIONAL DISTRIBUTION</h1>
          <p className="mt-1 text-xs text-neutral-500">해외 배급 · 지역별 계약 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 해외 배급 딜이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectDeals = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const closed = projectDeals.filter((d) => d.status === "deal-closed").length;
        const totalUSD = projectDeals
          .filter((d) => d.status === "deal-closed")
          .reduce((s, d) => s + (d.minGuaranteeUSD ?? 0), 0);

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
                  {projectDeals.length}개 지역 · 계약 {closed}/{projectDeals.length}
                  {totalUSD > 0 && ` · MG ${formatUSD(totalUSD)}`}
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

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">지역</th>
                  <th className="pb-2 font-medium">국가</th>
                  <th className="pb-2 font-medium">에이전트</th>
                  <th className="pb-2 font-medium">바이어</th>
                  <th className="pb-2 font-medium">유형</th>
                  <th className="pb-2 text-right font-medium">MG (USD)</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectDeals.map((d) => (
                  <tr key={d.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-300">{d.region}</td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {d.countries ? d.countries.join(", ") : "—"}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-400">{d.agent ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{d.buyer ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {DEAL_TYPE_LABEL[d.dealType]}
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {d.minGuaranteeUSD !== undefined ? formatUSD(d.minGuaranteeUSD) : "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[d.status],
                          border: `1px solid ${STATUS_COLOR[d.status]}44`,
                          backgroundColor: `${STATUS_COLOR[d.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectDeals.some((d) => d.note) && (
              <div className="mt-3 space-y-1">
                {projectDeals.filter((d) => d.note).map((d) => (
                  <p key={d.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{d.region}:</span> {d.note}
                  </p>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
