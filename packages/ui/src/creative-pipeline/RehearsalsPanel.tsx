"use client";

import type { RehearsalsStatus } from "./useProjectProgress";

interface Props {
  status: RehearsalsStatus;
  rehearsalsBaseUrl?: string;
}

export function RehearsalsPanel({
  status,
  rehearsalsBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/rehearsals`,
}: Props) {
  const url = `${rehearsalsBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, next, active, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
  const phase = steps.done
    ? "done"
    : steps.started
      ? "in progress"
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
            <h3 className="text-sm font-bold tracking-wider">REHEARSALS</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.done ? "#4ade80" : steps.started ? "#00FF41" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.done ? "#4ade8044" : steps.started ? "#00FF4144" : "var(--studio-border)"
                }`,
                backgroundColor: steps.done
                  ? "#4ade8011"
                  : steps.started
                    ? "#00FF4111"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            배우 × 씬 리허설 · 테이블 리딩 · 블로킹 · 스턴트
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
          Open in Rehearsals →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 리허설이 편성되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Completed</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.completed}/{summary.total} · {pct}% · {summary.totalHours}h
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

          <div className="grid grid-cols-3 gap-2 text-center">
            <Cell label="Completed" value={summary.completed} color="#4ade80" />
            <Cell label="Active" value={summary.inProgress} color="#00FF41" />
            <Cell label="Scheduled" value={summary.scheduled} color="#707070" />
          </div>

          {active && <SessionLine label="ACTIVE" session={active} highlight />}
          {!active && next && <SessionLine label="NEXT" session={next} />}
        </div>
      )}
    </article>
  );
}

function Cell({ label, value, color }: { label: string; value: number; color: string }) {
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

function SessionLine({
  label,
  session,
  highlight,
}: {
  label: string;
  session: NonNullable<RehearsalsStatus["next"]>;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded px-2 py-1.5 text-[11px]"
      style={{
        border: `1px solid ${highlight ? "#00FF4144" : "var(--studio-border)"}`,
        backgroundColor: highlight ? "#00FF4108" : "var(--studio-bg-elevated)",
      }}
    >
      <div
        className="mb-0.5 text-[10px] uppercase tracking-wider"
        style={{ color: highlight ? "#00FF41" : "var(--studio-text-dim)" }}
      >
        {label} · {session.date} · {session.type}
      </div>
      <div style={{ color: "var(--studio-text)" }}>
        {session.venue}
        <span className="ml-2 font-mono" style={{ color: "var(--studio-text-dim)" }}>
          · {session.durationHours}h · {session.attendees.length}명
        </span>
      </div>
    </div>
  );
}
