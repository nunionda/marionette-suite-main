"use client";

import type { PostProductionStatus } from "./useProjectProgress";

interface Props {
  status: PostProductionStatus;
  postStudioBaseUrl?: string;
}

const CATEGORIES: { key: keyof PostProductionStatus["steps"]; label: string; icon: string }[] = [
  { key: "edit",     label: "Edit",     icon: "✂️" },
  { key: "vfx",      label: "VFX",      icon: "✨" },
  { key: "sound",    label: "Sound",    icon: "🎚" },
  { key: "color",    label: "Color",    icon: "🎨" },
  { key: "delivery", label: "Delivery", icon: "📦" },
];

function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function PostProductionPanel({ status, postStudioBaseUrl = (process.env.NEXT_PUBLIC_POST_STUDIO_URL ?? "http://localhost:4002") }: Props) {
  const { progress, steps } = status;
  const url = `${postStudioBaseUrl}/?paperclipId=${encodeURIComponent(status.paperclipId)}`;

  const rows: { key: string; label: string; icon: string; pctValue: number; done: boolean; detail: string }[] = [
    { key: "edit",     label: "Edit",     icon: "✂️", pctValue: progress.edit,                                done: steps.edit,     detail: `${progress.edit}%` },
    { key: "vfx",      label: "VFX",      icon: "✨", pctValue: pct(progress.vfx.done,   progress.vfx.total),   done: steps.vfx,      detail: `${progress.vfx.done}/${progress.vfx.total}` },
    { key: "sound",    label: "Sound",    icon: "🎚", pctValue: pct(progress.sound.done, progress.sound.total), done: steps.sound,    detail: `${progress.sound.done}/${progress.sound.total}` },
    { key: "color",    label: "Color",    icon: "🎨", pctValue: pct(progress.color.done, progress.color.total), done: steps.color,    detail: `${progress.color.done}/${progress.color.total}` },
    { key: "delivery", label: "Delivery", icon: "📦", pctValue: steps.delivery ? 100 : 0,                       done: steps.delivery, detail: steps.delivery ? "delivered" : "pending" },
  ];

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
          <h3 className="text-sm font-bold tracking-wider">POST-PRODUCTION</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--studio-text-dim)" }}>
            편집 · VFX · 사운드 · 컬러 · 납품
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
          Open in Post Studio →
        </a>
      </header>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <span className="w-6 text-base">{r.icon}</span>
            <span className="w-20 text-xs font-medium">{r.label}</span>
            <div
              className="relative h-2 flex-1 overflow-hidden rounded"
              style={{ backgroundColor: "var(--studio-bg-elevated)" }}
            >
              <div
                className="absolute inset-y-0 left-0 transition-all"
                style={{
                  width: `${r.pctValue}%`,
                  backgroundColor: r.done ? "#4ade80" : "var(--accent-violet)",
                }}
              />
            </div>
            <span
              className="w-20 text-right text-[11px] tabular-nums"
              style={{ color: "var(--studio-text-dim)" }}
            >
              {r.detail}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
