"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketingAsset } from "../../../lib/marketing/mock-entries";

interface Props {
  assets: MarketingAsset[];
}

const STATUS_COLOR: Record<MarketingAsset["status"], string> = {
  draft: "#707070",
  in_review: "#f59e0b",
  approved: "#4ade80",
  delivered: "#00FF41",
  live: "#fbbf24",
};

const STATUS_LABEL: Record<MarketingAsset["status"], string> = {
  draft: "초안",
  in_review: "검토",
  approved: "승인",
  delivered: "납품",
  live: "공개",
};

const KIND_LABEL: Record<MarketingAsset["kind"], string> = {
  teaser_trailer: "티저 트레일러",
  main_trailer: "메인 트레일러",
  tv_spot: "TV 광고",
  international_trailer: "국제 트레일러",
  teaser_poster: "티저 포스터",
  main_poster: "메인 포스터",
  character_poster: "캐릭터 포스터",
  international_poster: "국제 포스터",
  key_art: "키 아트",
  social_asset: "소셜 자산",
};

const KIND_ORDER: Record<MarketingAsset["kind"], number> = {
  teaser_trailer: 0,
  main_trailer: 1,
  tv_spot: 2,
  international_trailer: 3,
  teaser_poster: 4,
  main_poster: 5,
  character_poster: 6,
  international_poster: 7,
  key_art: 8,
  social_asset: 9,
};

function isVideo(kind: MarketingAsset["kind"]): boolean {
  return ["teaser_trailer", "main_trailer", "tv_spot", "international_trailer"].includes(kind);
}

function fmtDuration(sec?: number): string {
  if (!sec) return "—";
  if (sec >= 60) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${sec}s`;
}

export function MarketingClient({ assets }: Props) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid) setHighlightedProjectId(pid);
  }, []);

  const byProject = useMemo(() => {
    const map = new Map<string, MarketingAsset[]>();
    for (const a of assets) {
      const arr = map.get(a.projectId) ?? [];
      arr.push(a);
      map.set(a.projectId, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    }
    return map;
  }, [assets]);

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
          <h1 className="text-xl font-bold tracking-wider text-white">MARKETING</h1>
          <p className="mt-1 text-xs text-neutral-500">
            트레일러 · 포스터 · 키 아트 · 소셜 자산 · AI 증강
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
        <p className="text-sm text-neutral-500">등록된 마케팅 자산이 없습니다.</p>
      )}

      {projectIds.map((pid) => {
        const projectAssets = byProject.get(pid) ?? [];
        const isHighlighted = pid === highlightedProjectId;
        const approved = projectAssets.filter(
          (a) => a.status === "approved" || a.status === "delivered" || a.status === "live",
        ).length;
        const aiCount = projectAssets.filter((a) => a.aiGenerated).length;
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
                  {approved}/{projectAssets.length} approved · {aiCount} AI
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
                  <th className="pb-2 font-medium">Kind</th>
                  <th className="pb-2 font-medium">Label</th>
                  <th className="pb-2 font-medium">Format</th>
                  <th className="pb-2 font-medium">Languages</th>
                  <th className="pb-2 text-right font-medium">Duration</th>
                  <th className="pb-2 font-medium">AI</th>
                  <th className="pb-2 font-medium">Vendor</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectAssets.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: "#1E1E1E" }}>
                    <td className="py-2 text-[10px] uppercase tracking-wider text-neutral-500">
                      <span className="mr-1 text-[9px]">{isVideo(a.kind) ? "🎬" : "🖼️"}</span>
                      {KIND_LABEL[a.kind]}
                    </td>
                    <td className="py-2 font-medium text-neutral-200">{a.label}</td>
                    <td className="py-2 text-[11px] text-neutral-500">{a.format ?? "—"}</td>
                    <td className="py-2 font-mono text-[10px] text-neutral-400">
                      {a.languages?.join(", ") ?? "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-neutral-400">
                      {isVideo(a.kind) ? fmtDuration(a.durationSec) : "—"}
                    </td>
                    <td className="py-2 text-center">
                      {a.aiGenerated ? (
                        <span
                          className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            color: "#a78bfa",
                            border: "1px solid #a78bfa44",
                            backgroundColor: "#a78bfa11",
                          }}
                        >
                          AI
                        </span>
                      ) : (
                        <span className="text-neutral-700">—</span>
                      )}
                    </td>
                    <td className="py-2 text-[11px] text-neutral-500">{a.vendor ?? "—"}</td>
                    <td className="py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: STATUS_COLOR[a.status],
                          border: `1px solid ${STATUS_COLOR[a.status]}44`,
                          backgroundColor: `${STATUS_COLOR[a.status]}11`,
                        }}
                      >
                        {STATUS_LABEL[a.status]}
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
