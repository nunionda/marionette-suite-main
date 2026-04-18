"use client";

import type { DistributionStatus } from "./useProjectProgress";

interface Props {
  status: DistributionStatus;
  libraryBaseUrl?: string;
}

export function DistributionPanel({
  status,
  libraryBaseUrl = `${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:4001"}/library`,
}: Props) {
  const url = `${libraryBaseUrl}?paperclipId=${encodeURIComponent(status.paperclipId)}`;
  const { entry, published } = status;

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
                color: published ? "#4ade80" : "var(--studio-text-dim)",
                border: `1px solid ${published ? "#4ade8044" : "var(--studio-border)"}`,
                backgroundColor: published ? "#4ade8011" : "transparent",
              }}
            >
              {published ? "published" : "not published"}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            라이브러리 등록 · 채널 · 배포물
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
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
          이 프로젝트는 아직 라이브러리에 등록되지 않았습니다.
        </p>
      )}
    </article>
  );
}
