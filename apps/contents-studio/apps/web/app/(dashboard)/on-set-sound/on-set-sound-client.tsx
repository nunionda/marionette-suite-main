"use client";

import { useEffect, useMemo, useState } from "react";
import type { SoundSession } from "../../../lib/on-set-sound/mock-entries";
import { STATUS_COLOR, STATUS_LABEL } from "../../../lib/on-set-sound/mock-entries";

interface Props {
  sessions: SoundSession[];
}

export function OnSetSoundClient({ sessions }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, SoundSession[]>();
    for (const s of sessions) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }, [sessions]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">ON-SET SOUND</h1>
          <p className="mt-1 text-xs text-neutral-500">현장 녹음 · 사운드 세션 관리</p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {projectIds.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 사운드 세션이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectSessions = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved = projectSessions.filter((s) => s.status === "approved").length;
        const reRecord = projectSessions.filter((s) => s.status === "re-record").length;

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
                  {projectSessions.length}개 세션 · 승인 {approved}
                  {reRecord > 0 && (
                    <span style={{ color: "#ef4444" }}> · 재녹음 {reRecord}</span>
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
                  <th className="pb-2 font-medium">촬영일</th>
                  <th className="pb-2 font-medium">씬</th>
                  <th className="pb-2 font-medium">레코디스트</th>
                  <th className="pb-2 font-medium">붐 오퍼레이터</th>
                  <th className="pb-2 font-medium">장비</th>
                  <th className="pb-2 text-right font-medium">샘플레이트</th>
                  <th className="pb-2 text-right font-medium">트랙</th>
                  <th className="pb-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectSessions.map((s) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">D{s.shootDay}</td>
                    <td className="py-2 font-mono text-[11px] text-neutral-400">{s.sceneId}</td>
                    <td className="py-2 text-[11px] text-neutral-300">{s.recordist}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{s.boomOperator}</td>
                    <td className="py-2 max-w-[180px] text-[11px] text-neutral-500">
                      {s.equipment.slice(0, 2).join(", ")}
                      {s.equipment.length > 2 && (
                        <span className="text-neutral-700"> +{s.equipment.length - 2}</span>
                      )}
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {(s.sampleRate / 1000).toFixed(1)}k/{s.bitDepth}b
                    </td>
                    <td className="py-2 text-right font-mono text-[11px] text-neutral-400">
                      {s.trackCount}ch
                    </td>
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

            {projectSessions.some((s) => s.issues ?? s.notes) && (
              <div className="mt-3 space-y-1">
                {projectSessions.filter((s) => s.issues ?? s.notes).map((s) => (
                  <p key={s.id} className="text-[11px] text-neutral-600">
                    <span className="text-neutral-500">D{s.shootDay}:</span>{" "}
                    {s.issues && <span style={{ color: "#ef4444" }}>{s.issues} · </span>}
                    {s.notes}
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
