"use client";

import type { AssemblyStatus } from "./useProjectProgress";

interface Props {
  status: AssemblyStatus;
  assemblyBaseUrl?: string;
}

const JOB_STATUS_COLOR = {
  queued: "#707070",
  running: "#f59e0b",
  done: "#4ade80",
  failed: "#ef4444",
} as const;

const JOB_STATUS_LABEL = {
  queued: "대기",
  running: "렌더링",
  done: "완료",
  failed: "실패",
} as const;

function formatSize(gb: number | null): string {
  if (gb == null) return "—";
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)}TB`;
  return `${gb.toFixed(1)}GB`;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? `${m}m` : ""}`;
  return `${m}m`;
}

export function AssemblyPanel({
  status,
  assemblyBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/assembly`,
}: Props) {
  const url = `${assemblyBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, steps, latestJob } = status;

  const phase = summary.mastered > 0 && summary.running === 0
    ? "all mastered"
    : summary.running > 0
      ? "rendering"
      : summary.mastered > 0
        ? "partial masters"
        : steps.queued
          ? "queued"
          : "not started";

  const phaseColor = summary.failed > 0
    ? "#ef4444"
    : summary.mastered > 0 && summary.running === 0
      ? "#4ade80"
      : summary.running > 0
        ? "#f59e0b"
        : undefined;

  return (
    <article
      className="rounded-lg border p-5"
      style={{
        borderColor: "var(--studio-border)",
        backgroundColor: "var(--studio-bg-surface)",
      }}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wider">FINAL ASSEMBLY</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: phaseColor ?? "var(--studio-text-dim)",
                border: `1px solid ${phaseColor ? `${phaseColor}44` : "var(--studio-border)"}`,
                backgroundColor: phaseColor ? `${phaseColor}11` : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            ffmpeg 마스터 · 프리셋 · HDR / Atmos · 체크섬
          </p>
        </div>
        <a
          href={url}
          className="rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition"
          style={{
            backgroundColor: "var(--accent-violet-dim)",
            color: "var(--accent-violet)",
            border: "1px solid var(--accent-violet)",
          }}
        >
          Open in Assembly →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          아직 어셈블리 작업이 등록되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          {/* Overall render progress */}
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Overall Render</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.done}/{summary.total} done · {summary.pctOverall}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${summary.pctOverall}%`,
                  backgroundColor: "#4ade80",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* 4-cell summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <Cell label="Mastered" value={`${summary.mastered}`} color="#4ade80" />
            <Cell label="Rendering" value={`${summary.running}`} color="#f59e0b" />
            <Cell label="Queued" value={`${summary.queued}`} color="#a78bfa" />
            <Cell label="Total Size" value={formatSize(summary.totalSizeGB)} color="#00FF41" />
          </div>

          {/* Latest job strip */}
          {latestJob && (
            <div
              className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
              style={{
                border: "1px solid var(--studio-border)",
                backgroundColor: "var(--studio-bg-elevated)",
              }}
            >
              <div className="flex-1 overflow-hidden">
                <span
                  className="mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: JOB_STATUS_COLOR[latestJob.status],
                    border: `1px solid ${JOB_STATUS_COLOR[latestJob.status]}44`,
                    backgroundColor: `${JOB_STATUS_COLOR[latestJob.status]}11`,
                  }}
                >
                  {JOB_STATUS_LABEL[latestJob.status]}
                </span>
                <span className="mr-2 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  {latestJob.version}
                </span>
                <span className="font-bold" style={{ color: "var(--studio-text)" }}>
                  {latestJob.preset}
                </span>
                <span className="ml-1 font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  · {latestJob.resolution}
                </span>
                {latestJob.hdr !== "sdr" && (
                  <span
                    className="ml-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#a78bfa", border: "1px solid #a78bfa44", backgroundColor: "#a78bfa11" }}
                  >
                    {latestJob.hdr}
                  </span>
                )}
                {latestJob.audioFormat === "atmos" && (
                  <span
                    className="ml-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#4ade80", border: "1px solid #4ade8044", backgroundColor: "#4ade8011" }}
                  >
                    ATMOS
                  </span>
                )}
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  {latestJob.pct}% · {formatDuration(latestJob.renderedSec)}/
                  {formatDuration(latestJob.durationSec)}
                </span>
                {latestJob.outputSizeGB != null && (
                  <span className="font-mono text-[10px] font-bold" style={{ color: "var(--studio-text)" }}>
                    {formatSize(latestJob.outputSizeGB)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded px-2 py-1.5"
      style={{
        border: "1px solid var(--studio-border)",
        backgroundColor: "var(--studio-bg-elevated)",
      }}
    >
      <div className="font-mono text-base font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
        {label}
      </div>
    </div>
  );
}
