"use client";

import { useEffect, useMemo, useState } from "react";
import type { EquipmentItem } from "../../../lib/equipment/mock-entries";
import { CATEGORY_COLOR, CATEGORY_LABEL } from "../../../lib/equipment/mock-entries";

interface Props {
  equipment: EquipmentItem[];
}

const STATUS_COLOR: Record<EquipmentItem["status"], string> = {
  needed: "#707070",
  sourcing: "#facc15",
  reserved: "#60a5fa",
  confirmed: "#00FF41",
};

const STATUS_LABEL: Record<EquipmentItem["status"], string> = {
  needed: "필요",
  sourcing: "소싱 중",
  reserved: "예약 완료",
  confirmed: "확정",
};

function formatKRW(n: number) {
  if (n === 0) return "—";
  return `₩${(n / 1_000_000).toFixed(1)}M`;
}

export function EquipmentClient({ equipment }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, EquipmentItem[]>();
    for (const e of equipment) {
      const arr = map.get(e.projectId) ?? [];
      arr.push(e);
      map.set(e.projectId, arr);
    }
    return map;
  }, [equipment]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">EQUIPMENT PREP</h1>
          <p className="mt-1 text-xs text-neutral-500">
            촬영 장비 · 렌탈 현황 · 카테고리별 상태
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 장비가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const items = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const confirmed = items.filter((e) => e.status === "confirmed").length;
        const sourcing = items.filter(
          (e) => e.status === "sourcing" || e.status === "needed",
        ).length;
        const totalRental = items.reduce(
          (s, e) => s + (e.dailyRateKRW ?? 0) * (e.rentalDays ?? 0),
          0,
        );

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
                  {confirmed}/{items.length} confirmed · 총 렌탈 {formatKRW(totalRental)}
                  {sourcing > 0 && (
                    <span style={{ color: "#facc15" }}> · 소싱 {sourcing}</span>
                  )}
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
                  <th className="pb-2 font-medium">장비명</th>
                  <th className="pb-2 font-medium">카테고리</th>
                  <th className="pb-2 font-medium">벤더</th>
                  <th className="pb-2 text-right font-medium">수량</th>
                  <th className="pb-2 text-right font-medium">일수</th>
                  <th className="pb-2 text-right font-medium">일비</th>
                  <th className="pb-2 text-right font-medium">소계</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const subtotal = (e.dailyRateKRW ?? 0) * (e.rentalDays ?? 0);
                  return (
                    <tr key={e.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                      <td className="py-2 text-neutral-200">{e.name}</td>
                      <td className="py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: CATEGORY_COLOR[e.category],
                            border: `1px solid ${CATEGORY_COLOR[e.category]}44`,
                            backgroundColor: `${CATEGORY_COLOR[e.category]}11`,
                          }}
                        >
                          {CATEGORY_LABEL[e.category]}
                        </span>
                      </td>
                      <td className="py-2 text-[11px] text-neutral-500">{e.vendor ?? "—"}</td>
                      <td className="py-2 text-right font-mono text-neutral-400">{e.quantity}</td>
                      <td className="py-2 text-right font-mono text-neutral-500">
                        {e.rentalDays ? `${e.rentalDays}일` : "—"}
                      </td>
                      <td className="py-2 text-right font-mono text-neutral-400">
                        {formatKRW(e.dailyRateKRW ?? 0)}
                      </td>
                      <td className="py-2 text-right font-mono text-neutral-300">
                        {formatKRW(subtotal)}
                      </td>
                      <td className="py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: STATUS_COLOR[e.status],
                            border: `1px solid ${STATUS_COLOR[e.status]}44`,
                            backgroundColor: `${STATUS_COLOR[e.status]}11`,
                          }}
                        >
                          {STATUS_LABEL[e.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {items.some((e) => e.note) && (
              <div className="mt-3 space-y-1">
                {items.filter((e) => e.note).map((e) => (
                  <p key={e.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{e.name}:</span> {e.note}
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
