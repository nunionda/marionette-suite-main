"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssemblyJob } from "../../../lib/assembly/mock-entries";

interface Props {
  jobs: AssemblyJob[];
}

const STATUS_COLOR: Record<AssemblyJob["status"], string> = {
  queued: "#707070",
  running: "#f59e0b",
  done: "#4ade80",
  failed: "#ef4444",
};

const STATUS_LABEL: Record<AssemblyJob["status"], string> = {
  queued: "대기",
  running: "렌더링",
  done: "완료",
  failed: "실패",
};

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatSize(gb: number | undefined): string {
  if (gb == null) return "—";
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)}TB`;
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  return `${(gb * 1024).toFixed(0)}MB`;
}

export function AssemblyClient({ jobs }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, AssemblyJob[]>();
    for (const j of jobs) {
      const arr = map.get(j.projectId) ?? [];
      arr.push(j);
      map.set(j.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.id.localeCompare(b.id));
    }
    return map;
  }, [jobs]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">FINAL VIDEO ASSEMBLY</h1>
          <p className="mt-1 text-xs text-neutral-500">
            최종 마스터링 · ffmpeg 렌더 · 프리셋 · 체크섬
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
        <p className="text-sm text-neutral-500">등록된 어셈블리 작업이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectJobs = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const doneCount = projectJobs.filter((j) => j.status === "done").length;
        const totalSize = projectJobs
          .filter((j) => j.status === "done")
          .reduce((acc, j) => acc + (j.outputSizeGB ?? 0), 0);

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
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {pid}
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {doneCount}/{projectJobs.length} mastered · {formatSize(totalSize)}
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
                  <th className="pb-2 font-medium">Version</th>
                  <th className="pb-2 font-medium">Preset</th>
                  <th className="pb-2 font-medium">Resolution</th>
                  <th className="pb-2 font-medium">HDR / Audio</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Progress</th>
                  <th className="pb-2 text-right font-medium">Size</th>
                  <th className="pb-2 font-medium">Output / Checksum</th>
                </tr>
              </thead>
              <tbody>
                {projectJobs.map((j) => {
                  const pct = j.durationSec > 0 ? Math.round((j.renderedSec / j.durationSec) * 100) : 0;
                  return (
                    <tr key={j.id} className="border-t align-top" style={{ borderColor: "#1E1E1E" }}>
                      <td className="py-2 font-mono text-neutral-300">{j.version}</td>
                      <td className="py-2 text-[11px] text-neutral-300">{j.preset}</td>
                      <td className="py-2">
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                          style={{
                            color: j.resolution === "4K" ? "#fbbf24" : "var(--studio-text)",
                            border: "1px solid var(--studio-border)",
                          }}
                        >
                          {j.resolution}
                        </span>
                      </td>
                      <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-400">
                        {j.hdr !== "sdr" && <span style={{ color: "#a78bfa" }}>{j.hdr} · </span>}
                        {j.audioFormat === "atmos" && <span style={{ color: "#4ade80" }}>atmos</span>}
                        {j.audioFormat !== "atmos" && <span>{j.audioFormat.replace("_", ".")}</span>}
                      </td>
                      <td className="py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: STATUS_COLOR[j.status],
                            border: `1px solid ${STATUS_COLOR[j.status]}44`,
                            backgroundColor: `${STATUS_COLOR[j.status]}11`,
                          }}
                        >
                          {STATUS_LABEL[j.status]}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1 w-24 overflow-hidden rounded"
                            style={{ backgroundColor: "#141414" }}
                          >
                            <div
                              className="h-full rounded"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: STATUS_COLOR[j.status],
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-neutral-500">
                          {formatDuration(j.renderedSec)} / {formatDuration(j.durationSec)}
                        </div>
                      </td>
                      <td className="py-2 text-right font-mono text-neutral-400">
                        {formatSize(j.outputSizeGB)}
                      </td>
                      <td className="py-2 text-[10px] text-neutral-400">
                        {j.outputPath ? (
                          <>
                            <div className="font-mono text-[11px] text-neutral-300">
                              {j.outputPath.split("/").pop()}
                            </div>
                            {j.checksumSHA256 && (
                              <div className="font-mono text-[9px] text-neutral-500">
                                sha256: {j.checksumSHA256.slice(0, 16)}…
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ffmpeg command preview for the first running/done job */}
            {(() => {
              const showCmd = projectJobs.find(
                (j) => j.ffmpegCommand && (j.status === "running" || j.status === "done"),
              );
              if (!showCmd) return null;
              return (
                <div
                  className="mt-3 rounded px-3 py-2 font-mono text-[10px] text-neutral-400"
                  style={{
                    border: "1px solid #1E1E1E",
                    backgroundColor: "#0A0A0A",
                    overflow: "auto",
                  }}
                >
                  <span className="text-[9px] uppercase tracking-wider text-neutral-600">
                    ffmpeg command ({showCmd.version}) ·{" "}
                  </span>
                  <span className="whitespace-pre-wrap">{showCmd.ffmpegCommand}</span>
                </div>
              );
            })()}
          </section>
        );
      })}
    </div>
  );
}
