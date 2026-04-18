"use client";

import { useEffect, useMemo, useState } from "react";
import type { FootageBatch } from "../../../lib/ingest/mock-entries";

interface Props {
  batches: FootageBatch[];
}

const STATUS_COLOR: Record<FootageBatch["status"], string> = {
  pending: "#707070",
  ingesting: "#f59e0b",
  verified: "#4ade80",
  rejected: "#ef4444",
};

const STATUS_LABEL: Record<FootageBatch["status"], string> = {
  pending: "대기",
  ingesting: "인제스트",
  verified: "검증",
  rejected: "기각",
};

const BACKUP_COLOR: Record<FootageBatch["backup"], string> = {
  onset: "#ef4444",
  studio: "#f59e0b",
  archived: "#4ade80",
};

const BACKUP_LABEL: Record<FootageBatch["backup"], string> = {
  onset: "현장",
  studio: "스튜디오",
  archived: "아카이브",
};

function fmtGB(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)}TB`;
  return `${gb}GB`;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function IngestClient({ batches }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, FootageBatch[]>();
    for (const b of batches) {
      const arr = map.get(b.projectId) ?? [];
      arr.push(b);
      map.set(b.projectId, arr);
    }
    // Newest first, within each project
    for (const arr of map.values()) {
      arr.sort((a, b) => b.shootDate.localeCompare(a.shootDate) || b.cameraRoll.localeCompare(a.cameraRoll));
    }
    return map;
  }, [batches]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">DATA INGEST</h1>
          <p className="mt-1 text-xs text-neutral-500">
            촬영 footage 인제스트 · 메타데이터 · 체크섬 검증 · 백업
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
        <p className="text-sm text-neutral-500">인제스트된 footage가 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectBatches = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const verified = projectBatches.filter((b) => b.status === "verified").length;
        const totalGB = projectBatches.reduce((a, b) => a + b.sizeGB, 0);
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
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {verified}/{projectBatches.length} verified · {fmtGB(totalGB)}
                </span>
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

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-neutral-600">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Roll</th>
                  <th className="pb-2 font-medium">Camera · Codec</th>
                  <th className="pb-2 font-medium">Scenes</th>
                  <th className="pb-2 text-right font-medium">Takes</th>
                  <th className="pb-2 text-right font-medium">Size</th>
                  <th className="pb-2 text-right font-medium">Duration</th>
                  <th className="pb-2 font-medium">Checksum</th>
                  <th className="pb-2 font-medium">Backup</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectBatches.map((b) => (
                  <tr key={b.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 font-mono text-neutral-300">{b.shootDate}</td>
                    <td className="py-2 font-mono font-medium text-neutral-200">{b.cameraRoll}</td>
                    <td className="py-2 text-[11px] text-neutral-400">
                      {b.cameraModel}
                      <span className="ml-1 text-neutral-600">· {b.codec}</span>
                    </td>
                    <td className="py-2 font-mono text-[10px] text-neutral-500">
                      {b.sceneIds.join(", ")}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">{b.takes}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">{fmtGB(b.sizeGB)}</td>
                    <td className="py-2 text-right font-mono text-neutral-400">{fmtDuration(b.durationMin)}</td>
                    <td className="py-2 text-center">
                      {b.checksumVerified ? (
                        <span style={{ color: "#4ade80" }}>✓</span>
                      ) : (
                        <span style={{ color: "#f59e0b" }}>…</span>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: BACKUP_COLOR[b.backup],
                          border: `1px solid ${BACKUP_COLOR[b.backup]}44`,
                          backgroundColor: `${BACKUP_COLOR[b.backup]}11`,
                        }}
                      >
                        {BACKUP_LABEL[b.backup]}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[b.status],
                          border: `1px solid ${STATUS_COLOR[b.status]}44`,
                          backgroundColor: `${STATUS_COLOR[b.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
