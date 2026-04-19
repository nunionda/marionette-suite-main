"use client";

import { useEffect, useState } from "react";
import type { IdeaEntry } from "../../../lib/idea/mock-entries";

interface Props {
  ideas: IdeaEntry[];
}

const STATUS_COLOR: Record<IdeaEntry["status"], string> = {
  draft: "#707070",
  developing: "#facc15",
  approved: "#00FF41",
  archived: "#6b7280",
};

const STATUS_LABEL: Record<IdeaEntry["status"], string> = {
  draft: "초안",
  developing: "개발 중",
  approved: "승인",
  archived: "보관",
};

export function IdeaClient({ ideas }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedId(pid);
  }, []);

  const sorted = [...ideas].sort((a, b) => {
    if (a.projectId === highlightedId) return -1;
    if (b.projectId === highlightedId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">IDEA / CONCEPT</h1>
          <p className="mt-1 text-xs text-neutral-500">
            프로젝트 아이디어 · 로그라인 · 포맷 · 승인 상태 관리 — Charter #1
          </p>
        </div>
        <a href="/projects" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          ← Projects
        </a>
      </header>

      {sorted.length === 0 && (
        <p className="text-sm text-neutral-500">등록된 아이디어가 없습니다.</p>
      )}

      {sorted.map((idea) => {
        const isHighlighted = idea.projectId === highlightedId;
        return (
          <section
            key={idea.projectId}
            className="rounded-lg border p-5"
            style={{
              borderColor: isHighlighted ? "#00FF41" : "#1E1E1E",
              backgroundColor: "#0F0F0F",
              boxShadow: isHighlighted ? "0 0 0 1px #00FF4133" : undefined,
            }}
          >
            <header className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm font-bold tracking-wider text-white">
                  {idea.projectId}
                </h2>
                <span className="text-sm text-neutral-300">{idea.title}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: STATUS_COLOR[idea.status],
                    border: `1px solid ${STATUS_COLOR[idea.status]}44`,
                    backgroundColor: `${STATUS_COLOR[idea.status]}11`,
                  }}
                >
                  {STATUS_LABEL[idea.status]}
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

            <div className="mb-4 rounded border p-3 text-xs text-neutral-300 leading-relaxed"
              style={{ borderColor: "#1E1E1E", backgroundColor: "#050505" }}>
              <span className="mr-2 text-[10px] uppercase tracking-wider text-neutral-600">Logline</span>
              {idea.logline}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                { label: "Genre", value: idea.genre },
                { label: "Format", value: idea.format },
                { label: "Audience", value: idea.targetAudience },
                { label: "Origin", value: idea.originSource },
              ].map(({ label, value }) => (
                <div key={label} className="rounded border p-2" style={{ borderColor: "#1E1E1E" }}>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-600">{label}</div>
                  <div className="text-neutral-300">{value}</div>
                </div>
              ))}
            </div>

            {idea.uniqueAngle && (
              <div className="mt-3 text-xs text-neutral-500">
                <span className="mr-1 text-[10px] uppercase tracking-wider text-neutral-700">Unique angle</span>
                {idea.uniqueAngle}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
