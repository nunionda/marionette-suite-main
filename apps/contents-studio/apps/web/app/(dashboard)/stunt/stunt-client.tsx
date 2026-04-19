"use client";

import { useEffect, useMemo, useState } from "react";
import type { StuntSequence } from "../../../lib/stunt/mock-entries";
import {
  RISK_COLOR,
  RISK_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STUNT_TYPE_LABEL,
} from "../../../lib/stunt/mock-entries";

interface Props {
  sequences: StuntSequence[];
}

export function StuntClient({ sequences }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, StuntSequence[]>();
    for (const s of sequences) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }, [sequences]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">STUNT CHOREOGRAPHY</h1>
          <p className="mt-1 text-xs text-neutral-500">스턴트 안무 · 위험도 관리 · 안전 승인</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 스턴트 시퀀스가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectSeqs = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const cleared = projectSeqs.filter(
          (s) => s.status === "safety-cleared" || s.status === "completed",
        ).length;
        const extreme = projectSeqs.filter((s) => s.riskLevel === "extreme").length;

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
                  {projectSeqs.length}개 시퀀스 · 안전승인 {cleared}
                  {extreme > 0 && (
                    <span style={{ color: "#ff00ff" }}> · 극위험 {extreme}</span>
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
                  <th className="pb-2 font-medium">씬</th>
                  <th className="pb-2 font-medium">설명</th>
                  <th className="pb-2 font-medium">유형</th>
                  <th className="pb-2 font-medium">위험도</th>
                  <th className="pb-2 text-right font-medium">리허설</th>
                  <th className="pb-2 font-medium">퍼포머</th>
                  <th className="pb-2 font-medium">촬영일</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectSeqs.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{s.sceneId}</td>
                    <td className="py-2 max-w-[180px] text-[11px] text-neutral-300">{s.description}</td>
                    <td className="py-2 text-[11px] text-neutral-400">{STUNT_TYPE_LABEL[s.stuntType]}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: RISK_COLOR[s.riskLevel],
                          border: `1px solid ${RISK_COLOR[s.riskLevel]}44`,
                          backgroundColor: `${RISK_COLOR[s.riskLevel]}11`,
                        }}
                      >
                        {RISK_LABEL[s.riskLevel]}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {s.rehearsalCount}회
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">
                      {s.performer}
                      {s.doubleRequired && (
                        <span className="ml-1 text-[10px] text-neutral-600">(대역)</span>
                      )}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{s.shootDate ?? "—"}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[s.status],
                          border: `1px solid ${STATUS_COLOR[s.status]}44`,
                          backgroundColor: `${STATUS_COLOR[s.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projectSeqs.some((s) => s.notes) && (
              <div className="mt-3 space-y-1">
                {projectSeqs.filter((s) => s.notes).map((s) => (
                  <p key={s.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">{s.sceneId}:</span> {s.notes}
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
