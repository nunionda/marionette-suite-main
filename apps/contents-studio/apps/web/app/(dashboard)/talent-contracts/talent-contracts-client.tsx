"use client";

import { useEffect, useMemo, useState } from "react";
import type { TalentContract } from "../../../lib/talent-contracts/mock-entries";

interface Props {
  contracts: TalentContract[];
}

const STATUS_COLOR: Record<TalentContract["status"], string> = {
  negotiating: "#707070",
  offered: "#facc15",
  signed: "#00FF41",
  declined: "#ef4444",
};

const STATUS_LABEL: Record<TalentContract["status"], string> = {
  negotiating: "협상 중",
  offered: "오퍼 완료",
  signed: "서명 완료",
  declined: "거절",
};

const ROLE_LABEL: Record<TalentContract["role"], string> = {
  lead: "주연",
  supporting: "조연",
  minor: "단역",
};

const ROLE_COLOR: Record<TalentContract["role"], string> = {
  lead: "#00FF41",
  supporting: "#facc15",
  minor: "#707070",
};

function formatKRW(n: number) {
  if (n === 0) return "—";
  if (n >= 100_000_000) return `₩${(n / 100_000_000).toFixed(1)}억`;
  return `₩${(n / 1_000_000).toFixed(0)}M`;
}

export function TalentContractsClient({ contracts }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, TalentContract[]>();
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
          <h1 className="text-xl font-bold tracking-wider text-white">TALENT CONTRACTS</h1>
          <p className="mt-1 text-xs text-neutral-500">
            배우 계약 · 출연료 · 촬영일수 · 전속 조항
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 배우 계약이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const items = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const signed = items.filter((c) => c.status === "signed").length;
        const leads = items.filter((c) => c.role === "lead");
        const leadsLocked = leads.filter((c) => c.status === "signed").length;
        const totalFee = items.reduce((s, c) => s + c.feeKRW, 0);

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
                  {signed}/{items.length} signed · 주연 {leadsLocked}/{leads.length} · 총 {formatKRW(totalFee)}
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
                  <th className="pb-2 font-medium">배우</th>
                  <th className="pb-2 font-medium">캐릭터</th>
                  <th className="pb-2 font-medium">역할</th>
                  <th className="pb-2 font-medium">소속사</th>
                  <th className="pb-2 text-right font-medium">출연료</th>
                  <th className="pb-2 text-right font-medium">촬영일</th>
                  <th className="pb-2 font-medium">전속</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-neutral-200">{c.actorName}</td>
                    <td className="py-2 text-neutral-400">{c.characterName}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: ROLE_COLOR[c.role],
                          border: `1px solid ${ROLE_COLOR[c.role]}44`,
                          backgroundColor: `${ROLE_COLOR[c.role]}11`,
                        }}
                      >
                        {ROLE_LABEL[c.role]}
                      </span>
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{c.agencyName ?? "—"}</td>
                    <td className="py-2 text-right font-mono text-neutral-300">{formatKRW(c.feeKRW)}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">{c.shootDays}일</td>
                    <td className="py-2 text-center text-[11px] text-neutral-500">
                      {c.exclusivity ? <span style={{ color: "#00FF41" }}>●</span> : "—"}
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
                    <span className="text-neutral-500">{c.actorName}:</span> {c.note}
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
