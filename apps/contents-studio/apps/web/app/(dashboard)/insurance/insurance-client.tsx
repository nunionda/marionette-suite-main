"use client";

import { useEffect, useMemo, useState } from "react";
import type { InsurancePolicy } from "../../../lib/insurance/mock-entries";
import { INSURANCE_TYPE_COLOR, INSURANCE_TYPE_LABEL } from "../../../lib/insurance/mock-entries";

interface Props {
  policies: InsurancePolicy[];
}

const STATUS_COLOR: Record<InsurancePolicy["status"], string> = {
  needed: "#707070",
  quoted: "#facc15",
  bound: "#60a5fa",
  active: "#00FF41",
};

const STATUS_LABEL: Record<InsurancePolicy["status"], string> = {
  needed: "필요",
  quoted: "견적 완료",
  bound: "바인딩",
  active: "유효",
};

function formatKRW(n: number) {
  if (n === 0) return "—";
  if (n >= 1_000_000_000) return `₩${(n / 1_000_000_000).toFixed(1)}B`;
  return `₩${(n / 1_000_000).toFixed(0)}M`;
}

export function InsuranceClient({ policies }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, InsurancePolicy[]>();
    for (const p of policies) {
      const arr = map.get(p.projectId) ?? [];
      arr.push(p);
      map.set(p.projectId, arr);
    }
    return map;
  }, [policies]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">INSURANCE / LEGAL</h1>
          <p className="mt-1 text-xs text-neutral-500">
            제작보험 · 장비보험 · 배상책임 · E&O · 법무
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 보험/법무 항목이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const items = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const active = items.filter(
          (p) => p.status === "active" || p.status === "bound",
        ).length;
        const totalPremium = items.reduce((s, p) => s + (p.annualPremiumKRW ?? 0), 0);
        const totalCoverage = items.reduce((s, p) => s + (p.coverageKRW ?? 0), 0);

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
                  {active}/{items.length} active · 연간 보험료 {formatKRW(totalPremium)} · 총 보장 {formatKRW(totalCoverage)}
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
                  <th className="pb-2 font-medium">종류</th>
                  <th className="pb-2 font-medium">보험사</th>
                  <th className="pb-2 font-medium">브로커</th>
                  <th className="pb-2 text-right font-medium">보장한도</th>
                  <th className="pb-2 text-right font-medium">연간보험료</th>
                  <th className="pb-2 font-medium">유효기간</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: INSURANCE_TYPE_COLOR[p.policyType],
                          border: `1px solid ${INSURANCE_TYPE_COLOR[p.policyType]}44`,
                          backgroundColor: `${INSURANCE_TYPE_COLOR[p.policyType]}11`,
                        }}
                      >
                        {INSURANCE_TYPE_LABEL[p.policyType]}
                      </span>
                    </td>
                    <td className="py-2 text-neutral-300">{p.insurer ?? "—"}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{p.broker ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-neutral-300">
                      {formatKRW(p.coverageKRW ?? 0)}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {formatKRW(p.annualPremiumKRW ?? 0)}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {p.effectiveDate && p.expiresDate
                        ? `${p.effectiveDate} ~ ${p.expiresDate}`
                        : "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[p.status],
                          border: `1px solid ${STATUS_COLOR[p.status]}44`,
                          backgroundColor: `${STATUS_COLOR[p.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.some((p) => p.note) && (
              <div className="mt-3 space-y-1">
                {items.filter((p) => p.note).map((p) => (
                  <p key={p.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{INSURANCE_TYPE_LABEL[p.policyType]}:</span>{" "}
                    {p.note}
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
