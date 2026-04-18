"use client";

import type { CastingStatus } from "./useProjectProgress";

interface Props {
  status: CastingStatus;
  castingBaseUrl?: string;
}

const STATE_COLOR: Record<CastingStatus["leads"][number]["state"], string> = {
  open: "#ef4444",
  audition: "#f59e0b",
  offer: "#00FF41",
  confirmed: "#4ade80",
  signed: "#4ade80",
};

const STATE_LABEL: Record<CastingStatus["leads"][number]["state"], string> = {
  open: "공개",
  audition: "오디션",
  offer: "오퍼",
  confirmed: "확정",
  signed: "계약",
};

export function CastingPanel({
  status,
  castingBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/casting`,
}: Props) {
  const url = `${castingBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { summary, leads, steps } = status;
  const pct = summary.total > 0 ? Math.round((summary.signed / summary.total) * 100) : 0;
  const phase = steps.locked
    ? "locked"
    : steps.auditioning
      ? "in audition"
      : steps.started
        ? "open"
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
            <h3 className="text-sm font-bold tracking-wider">CASTING</h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: steps.locked ? "#4ade80" : steps.auditioning ? "#f59e0b" : "var(--studio-text-dim)",
                border: `1px solid ${
                  steps.locked ? "#4ade8044" : steps.auditioning ? "#f59e0b44" : "var(--studio-border)"
                }`,
                backgroundColor: steps.locked
                  ? "#4ade8011"
                  : steps.auditioning
                    ? "#f59e0b11"
                    : "transparent",
              }}
            >
              {phase}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            캐릭터 × 배우 · 오디션 · 계약 상태
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
          Open in Casting →
        </a>
      </header>

      {summary.total === 0 ? (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 캐스팅이 시작되지 않았습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <div className="mb-1 flex justify-between">
              <span style={{ color: "var(--studio-text-dim)" }}>Cast locked</span>
              <span className="font-mono" style={{ color: "var(--studio-text-dim)" }}>
                {summary.signed}/{summary.total} · {pct}%
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
            <Cell label="Signed" value={summary.signed} color="#4ade80" />
            <Cell label="Audition" value={summary.auditioning} color="#f59e0b" />
            <Cell label="Open" value={summary.open} color="#ef4444" />
          </div>

          {leads.length > 0 && (
            <div>
              <div className="mb-1" style={{ color: "var(--studio-text-dim)" }}>
                Leads
              </div>
              <div className="flex flex-col gap-1">
                {leads.map((l, i) => (
                  <div
                    key={`${l.characterName}-${i}`}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
                    style={{
                      border: "1px solid var(--studio-border)",
                      backgroundColor: "var(--studio-bg-elevated)",
                    }}
                  >
                    <span>
                      <span style={{ color: "var(--studio-text-dim)" }}>{l.characterName} · </span>
                      <span style={{ color: "var(--studio-text)" }}>
                        {l.actorName ?? "— 미정 —"}
                      </span>
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: STATE_COLOR[l.state],
                        border: `1px solid ${STATE_COLOR[l.state]}44`,
                        backgroundColor: `${STATE_COLOR[l.state]}11`,
                      }}
                    >
                      {STATE_LABEL[l.state]}
                    </span>
                  </div>
                ))}
              </div>
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
