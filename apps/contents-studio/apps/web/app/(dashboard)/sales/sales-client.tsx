"use client";

import { useEffect, useMemo, useState } from "react";
import type { SalesDeal } from "../../../lib/sales/mock-entries";
import { DEAL_TYPE_LABEL, STATUS_COLOR, STATUS_LABEL } from "../../../lib/sales/mock-entries";

interface Props {
  deals: SalesDeal[];
}

function formatKRW(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}십억원`;
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(0)}억원`;
  if (amount >= 10_000) return `${Math.round(amount / 10_000)}만원`;
  return `${amount.toLocaleString()}원`;
}

export function SalesClient({ deals }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, SalesDeal[]>();
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
          <h1 className="text-xl font-bold tracking-wider text-white">SALES & DISTRIBUTION</h1>
          <p className="mt-1 text-xs text-neutral-500">세일즈 · 배급 계약 현황</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 세일즈 딜이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectDeals = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const signed = projectDeals.filter(
          (d) => d.status === "signed" || d.status === "closed",
        ).length;
        const totalMG = projectDeals
          .filter((d) => d.status === "signed" || d.status === "closed")
          .reduce((s, d) => s + (d.minGuaranteeKRW ?? 0), 0);

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
                  {projectDeals.length}건 · 계약 {signed}/{projectDeals.length}
                  {totalMG > 0 && ` · MG ${formatKRW(totalMG)}`}
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
                  <th className="pb-2 font-medium">바이어</th>
                  <th className="pb-2 font-medium">유형</th>
                  <th className="pb-2 font-medium">지역</th>
                  <th className="pb-2 text-right font-medium">MG</th>
                  <th className="pb-2 text-right font-medium">RS%</th>
                  <th className="pb-2 font-medium">계약일</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectDeals.map((d) => (
                  <tr key={d.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2">
                      <p className="text-neutral-200">{d.buyer}</p>
                      {d.agentOrSeller && (
                        <p className="text-[10px] text-neutral-600">via {d.agentOrSeller}</p>
                      )}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {DEAL_TYPE_LABEL[d.dealType]}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{d.territory}</td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {d.minGuaranteeKRW !== undefined ? formatKRW(d.minGuaranteeKRW) : "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-500">
                      {d.revSharePct !== undefined ? `${d.revSharePct}%` : "—"}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{d.dealDate ?? "—"}</td>
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
                    <span className="text-neutral-500">{d.buyer}:</span> {d.note}
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
