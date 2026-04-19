"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductionOfficeItem } from "../../../lib/production-office/mock-entries";
import {
  OFFICE_CATEGORY_COLOR,
  OFFICE_CATEGORY_LABEL,
} from "../../../lib/production-office/mock-entries";

interface Props {
  items: ProductionOfficeItem[];
}

const STATUS_COLOR: Record<ProductionOfficeItem["status"], string> = {
  needed: "#707070",
  ordered: "#facc15",
  setup: "#60a5fa",
  operational: "#00FF41",
};

const STATUS_LABEL: Record<ProductionOfficeItem["status"], string> = {
  needed: "필요",
  ordered: "주문 완료",
  setup: "설치 중",
  operational: "운영 중",
};

function formatKRW(n: number) {
  if (n === 0) return "—";
  return `₩${(n / 1_000_000).toFixed(1)}M`;
}

export function ProductionOfficeClient({ items }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, ProductionOfficeItem[]>();
    for (const o of items) {
      const arr = map.get(o.projectId) ?? [];
      arr.push(o);
      map.set(o.projectId, arr);
    }
    return map;
  }, [items]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">PRODUCTION OFFICE</h1>
          <p className="mt-1 text-xs text-neutral-500">
            사무실 · IT · 통신 · 케이터링 · 운영 현황
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 오피스 항목이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectItems = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const operational = projectItems.filter(
          (o) => o.status === "operational" || o.status === "setup",
        ).length;
        const monthlyTotal = projectItems.reduce((s, o) => s + (o.monthlyCostKRW ?? 0), 0);
        const oneTimeTotal = projectItems.reduce((s, o) => s + (o.oneTimeCostKRW ?? 0), 0);

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
                  {operational}/{projectItems.length} active · 월 {formatKRW(monthlyTotal)} · 초기비용 {formatKRW(oneTimeTotal)}
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
                  <th className="pb-2 font-medium">항목</th>
                  <th className="pb-2 font-medium">카테고리</th>
                  <th className="pb-2 font-medium">벤더</th>
                  <th className="pb-2 text-right font-medium">수량</th>
                  <th className="pb-2 text-right font-medium">월 비용</th>
                  <th className="pb-2 text-right font-medium">초기비용</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectItems.map((o) => (
                  <tr key={o.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-200">{o.name}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: OFFICE_CATEGORY_COLOR[o.category],
                          border: `1px solid ${OFFICE_CATEGORY_COLOR[o.category]}44`,
                          backgroundColor: `${OFFICE_CATEGORY_COLOR[o.category]}11`,
                        }}
                      >
                        {OFFICE_CATEGORY_LABEL[o.category]}
                      </span>
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{o.vendor ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {o.quantity ?? "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {formatKRW(o.monthlyCostKRW ?? 0)}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-300">
                      {formatKRW(o.oneTimeCostKRW ?? 0)}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[o.status],
                          border: `1px solid ${STATUS_COLOR[o.status]}44`,
                          backgroundColor: `${STATUS_COLOR[o.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectItems.some((o) => o.note) && (
              <div className="mt-3 space-y-1">
                {projectItems.filter((o) => o.note).map((o) => (
                  <p key={o.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{o.name}:</span> {o.note}
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
