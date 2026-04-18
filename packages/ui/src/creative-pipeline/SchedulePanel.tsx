"use client";

import type { ScheduleStatus } from "./useProjectProgress";

interface Props {
  status: ScheduleStatus;
  scheduleBaseUrl?: string;
}

export function SchedulePanel({
  status,
  scheduleBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/schedule`,
}: Props) {
  const url = `${scheduleBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { progress, nextDay, activeDay, steps } = status;
  const { totalDays, wrappedDays, inProgressDays, scheduledDays } = progress;

  const pct = totalDays > 0 ? Math.round((wrappedDays / totalDays) * 100) : 0;
  const phase = steps.wrapped
    ? "wrapped"
    : steps.shooting
      ? "shooting"
      : steps.scheduled
        ? "scheduled"
        : "not started";

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
            <h3 className="text-sm font-bold tracking-wider">SCHEDULE</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.shooting
                  ? "#00FF41"
                  : steps.wrapped
                    ? "#4ade80"
                    : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.shooting
                    ? "#00FF4144"
                    : steps.wrapped
                      ? "#4ade8044"
                      : "var(--studio-border)"
                }`,
                backgroundColor: steps.shooting
                  ? "#00FF4111"
                  : steps.wrapped
                    ? "#4ade8011"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            촬영일 · 로케이션 · 콜타임 · 진행률
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
          Open in Schedule →
        </a>
      </header>

      {totalDays === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 촬영 일정이 편성되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          {/* progress bar */}
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Progress</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {wrappedDays}/{totalDays} · {pct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${pct}%`,
                  backgroundColor: "#4ade80",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* counts */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <CountBox label="Wrapped" value={wrappedDays} color="#4ade80" />
            <CountBox label="Shooting" value={inProgressDays} color="#00FF41" />
            <CountBox label="Scheduled" value={scheduledDays} color="#707070" />
          </div>

          {activeDay && (
            <DayLine label="ACTIVE" day={activeDay} highlight />
          )}
          {!activeDay && nextDay && (
            <DayLine label="NEXT" day={nextDay} />
          )}
        </div>
      )}
    </article>
  );
}

function CountBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded px-2 py-1.5"
      style={{
        border: "1px solid var(--studio-border)",
        backgroundColor: "var(--studio-bg-elevated)",
      }}
    >
      <div
        className="font-mono text-base font-bold leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] uppercase tracking-wider"
        style={{ color: "var(--studio-text-dim)" }}
      >
        {label}
      </div>
    </div>
  );
}

function DayLine({
  label,
  day,
  highlight,
}: {
  label: string;
  day: NonNullable<ScheduleStatus["nextDay"]>;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded px-2 py-1.5 text-[11px]"
      style={{
        border: `1px solid ${highlight ? "#00FF4144" : "var(--studio-border)"}`,
        backgroundColor: highlight
          ? "#00FF4108"
          : "var(--studio-bg-elevated)",
      }}
    >
      <div
        className="mb-0.5 text-[10px] uppercase tracking-wider"
        style={{ color: highlight ? "#00FF41" : "var(--studio-text-dim)" }}
      >
        {label} · Day {day.day} · {day.date}
      </div>
      <div style={{ color: "var(--studio-text)" }}>
        <span className="mr-1 text-[10px] uppercase" style={{ color: "var(--studio-text-dim)" }}>
          {day.interior ? "INT" : "EXT"}
        </span>
        {day.location}
        <span className="ml-2 font-mono" style={{ color: "var(--studio-text-dim)" }}>
          · Call {day.callTime} → Wrap {day.wrapTime}
        </span>
      </div>
    </div>
  );
}
