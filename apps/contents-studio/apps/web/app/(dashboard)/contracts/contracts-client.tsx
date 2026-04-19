"use client";

import { useEffect, useMemo, useState } from "react";
import type { LocationContract } from "../../../lib/contracts/mock-entries";

interface Props {
  contracts: LocationContract[];
}

const STATUS_COLOR: Record<LocationContract["status"], string> = {
  draft: "#707070",
  review: "#facc15",
  signed: "#00FF41",
  expired: "#ef4444",
};

const STATUS_LABEL: Record<LocationContract["status"], string> = {
  draft: "초안",
  review: "검토 중",
  signed: "서명 완료",
  expired: "만료",
};

function formatKRW(n: number) {
  if (n === 0) return "—";
  return `₩${(n / 1_000_000).toFixed(1)}M`;
}

export function ContractsClient({ contracts }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, LocationContract[]>();
    for (const c of contracts) {
      const arr = map.get(c.projectId) ?? [];
      arr.push(c);
      map.set(c.projectId, arr);
    }
    return map;
  }, [contracts]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">LOCATION CONTRACTS</h1>
          <p className="mt-1 text-xs text-neutral-500">
            촬영지 계약 · 임대료 · 보증금 · 계약 상태
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 계약이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const items = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const signed = items.filter((c) => c.status === "signed").length;
        const totalFee = items.reduce((s, c) => s + c.totalFeeKRW, 0);
        const deposit = items.reduce((s, c) => s + (c.depositPaidKRW ?? 0), 0);
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
                  {signed}/{items.length} signed · 총 {formatKRW(totalFee)} · 보증금 {formatKRW(deposit)}
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
                  <th className="pb-2 font-medium">장소</th>
                  <th className="pb-2 font-medium">벤더</th>
                  <th className="pb-2 font-medium">촬영일</th>
                  <th className="pb-2 text-right font-medium">일비</th>
                  <th className="pb-2 text-right font-medium">총액</th>
                  <th className="pb-2 text-right font-medium">보증금</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-200">{c.locationName}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.vendor}</td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {c.shootDates.length > 0 ? c.shootDates[0] : "—"}
                      {c.shootDates.length > 1 && ` +${c.shootDates.length - 1}`}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {formatKRW(c.dailyRateKRW)}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-300">
                      {formatKRW(c.totalFeeKRW)}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-500">
                      {formatKRW(c.depositPaidKRW ?? 0)}
                    </td>
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

            {items.some((c) => c.note) && (
              <div className="mt-3 space-y-1">
                {items.filter((c) => c.note).map((c) => (
                  <p key={c.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{c.locationName}:</span> {c.note}
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
