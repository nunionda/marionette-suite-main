"use client";

import type { DistributionStatus } from "./useProjectProgress";

interface Props {
  status: DistributionStatus;
  libraryBaseUrl?: string;
}

const STREAMING_STATUS_COLOR = {
  scheduled: "#f59e0b",
  live: "#00FF41",
  ended: "#707070",
  withdrawn: "#ef4444",
} as const;

const STREAMING_STATUS_LABEL = {
  scheduled: "예정",
  live: "공개중",
  ended: "종료",
  withdrawn: "철수",
} as const;

export function DistributionPanel({
  status,
  libraryBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000"}/library`,
}: Props) {
  const url = `${libraryBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { entry, published, streaming, streamingLive } = status;

  // Overall phase for the badge
  const phase = streamingLive
    ? "streaming live"
    : streaming && streaming.platforms.length > 0
      ? "streaming scheduled"
      : published
        ? "published"
        : "not published";
  const phaseColor = streamingLive
    ? "#00FF41"
    : streaming && streaming.platforms.length > 0
      ? "#f59e0b"
      : published
        ? "#4ade80"
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
            <h3 className="text-sm font-bold tracking-wider">DISTRIBUTION</h3>
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
            라이브러리 · 채널 · 배포물 · 스트리밍/VOD
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
          Open in Library →
        </a>
      </header>

      {entry ? (
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <span style={{ color: "var(--studio-text-dim)" }}>Title · </span>
            <span className="font-medium">{entry.title}</span>
            {entry.releaseDate && (
              <span style={{ color: "var(--studio-text-dim)" }}> · {entry.releaseDate}</span>
            )}
          </div>

          {entry.channels.length > 0 && (
            <div>
              <div className="mb-1" style={{ color: "var(--studio-text-dim)" }}>Channels</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.channels.map((c) => (
                  <span
                    key={c}
                    className="rounded px-2 py-0.5 text-[10px]"
                    style={{
                      backgroundColor: "var(--studio-bg-elevated)",
                      color: "var(--studio-text)",
                      border: "1px solid var(--studio-border)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.deliverables.length > 0 && (
            <div>
              <div className="mb-1" style={{ color: "var(--studio-text-dim)" }}>Deliverables</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.deliverables.map((d) => (
                  <span
                    key={d}
                    className="rounded px-2 py-0.5 text-[10px]"
                    style={{
                      backgroundColor: "var(--studio-bg-elevated)",
                      color: "var(--studio-text-dim)",
                      border: "1px solid var(--studio-border)",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Charter #69 Streaming/VOD */}
          {streaming && streaming.platforms.length > 0 && (
            <div
              className="mt-1 rounded px-3 py-2"
              style={{
                border: "1px solid var(--studio-border)",
                backgroundColor: "var(--studio-bg-elevated)",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
                  Streaming / VOD
                </span>
                <span className="text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  {streaming.exclusivity && <span className="mr-2">· {streaming.exclusivity}</span>}
                  {streaming.windowEnd && <span>window ends {streaming.windowEnd}</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {streaming.platforms.map((p) => (
                  <div
                    key={p.platform}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STREAMING_STATUS_COLOR[p.status],
                          border: `1px solid ${STREAMING_STATUS_COLOR[p.status]}44`,
                          backgroundColor: `${STREAMING_STATUS_COLOR[p.status]}11`,
                        }}
                      >
                        {STREAMING_STATUS_LABEL[p.status]}
                      </span>
                      <span className="font-medium" style={{ color: "var(--studio-text)" }}>
                        {p.platform}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                        · {p.regions.join(", ")}
                      </span>
                      {p.liveDate && (
                        <span className="font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                          · {p.liveDate}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="rounded px-1 py-0.5 font-mono text-[10px] font-bold"
                        style={{
                          color: p.maxResolution === "4K" ? "#fbbf24" : "var(--studio-text)",
                          border: "1px solid var(--studio-border)",
                        }}
                      >
                        {p.maxResolution}
                      </span>
                      {p.hasHDR && (
                        <span
                          className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            color: "#a78bfa",
                            border: "1px solid #a78bfa44",
                            backgroundColor: "#a78bfa11",
                          }}
                        >
                          HDR
                        </span>
                      )}
                      {p.hasAtmos && (
                        <span
                          className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            color: "#4ade80",
                            border: "1px solid #4ade8044",
                            backgroundColor: "#4ade8011",
                          }}
                        >
                          ATMOS
                        </span>
                      )}
                      <span className="font-mono text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                        · {p.variantCount}v · DRM {p.drm.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 라이브러리에 등록되지 않았습니다.
        </p>
      )}
    </article>
  );
}
