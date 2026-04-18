"use client";

import type { LocationsStatus } from "./useProjectProgress";

interface Props {
  status: LocationsStatus;
  locationsBaseUrl?: string;
}

const STATUS_COLOR: Record<LocationsStatus["topLocations"][number]["status"], string> = {
  scouting: "#707070",
  shortlisted: "#f59e0b",
  permitted: "#00FF41",
  confirmed: "#4ade80",
  rejected: "#ef4444",
};

const STATUS_LABEL: Record<LocationsStatus["topLocations"][number]["status"], string> = {
  scouting: "답사",
  shortlisted: "후보",
  permitted: "허가",
  confirmed: "확정",
  rejected: "기각",
};

export function LocationsPanel({
  status,
  locationsBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/locations`,
}: Props) {
  const url = `${locationsBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, topLocations, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.confirmed / summary.total) * 100) : 0;
  const phase = steps.locked
    ? "locked"
    : steps.permitted
      ? "permitted"
      : steps.scouting
        ? "scouting"
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
            <h3 className="text-sm font-bold tracking-wider">LOCATIONS</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.locked ? "#4ade80" : steps.permitted ? "#00FF41" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.locked ? "#4ade8044" : steps.permitted ? "#00FF4144" : "var(--studio-border)"
                }`,
                backgroundColor: steps.locked
                  ? "#4ade8011"
                  : steps.permitted
                    ? "#00FF4111"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            로케이션 헌팅 · 허가 · 계약
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
          Open in Locations →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 로케이션 헌팅이 시작되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Confirmed</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.confirmed}/{summary.total} · {pct}%
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
            <Cell label="Confirmed" value={summary.confirmed} color="#4ade80" />
            <Cell label="Permitted" value={summary.permitted} color="#00FF41" />
            <Cell label="Scouting" value={summary.scouting} color="#f59e0b" />
          </div>

          {topLocations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topLocations.map((l, i) => (
                <span
                  key={`${l.name}-${i}`}
                  className="rounded px-2 py-0.5 text-[10px]"
                  style={{
                    backgroundColor: "var(--studio-bg-elevated)",
                    color: STATUS_COLOR[l.status],
                    border: `1px solid ${STATUS_COLOR[l.status]}44`,
                  }}
                >
                  <span style={{ color: "var(--studio-text-dim)" }}>
                    {l.interior ? "INT" : "EXT"} ·{" "}
                  </span>
                  {l.name}
                  <span className="ml-1 text-[9px] uppercase">· {STATUS_LABEL[l.status]}</span>
                </span>
              ))}
            </div>
          )}
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
