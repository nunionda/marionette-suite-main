"use client";

import { useState, useMemo, useEffect } from "react";
import type { LibraryEntry } from "@marionette/types-content";
import type { ContentCategory } from "@marionette/pipeline-core";
import { MetricsWidget } from "../../../components/library/MetricsWidget";

const categoryLabels: Record<ContentCategory | "all", string> = {
  all: "전체",
  film: "영화",
  drama: "드라마",
  commercial: "광고",
  youtube: "유튜브",
};

const categoryColors: Record<ContentCategory, string> = {
  film: "#d4af37",
  drama: "#60a5fa",
  commercial: "#4ade80",
  youtube: "#f87171",
};

export function LibraryClient({ entries }: { entries: LibraryEntry[] }) {
  const [filter, setFilter] = useState<ContentCategory | "all">("all");
  const [selected, setSelected] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (!pid) return;
    const match = entries.find((e) => e.projectId === pid);
    if (match) setSelected(match.id);
  }, [entries]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.category === filter)),
    [filter, entries],
  );

  const active = entries.find((e) => e.id === selected);

  return (
    <div className="min-h-screen">
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--studio-border)" }}
      >
        <div>
          <h1 className="text-lg font-bold tracking-wider">CONTENT LIBRARY</h1>
          <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
            완성작 아카이브 · 영화 · 드라마 · 광고 · 유튜브
          </p>
        </div>
      </header>

      {/* Filter tabs */}
      <div
        className="flex gap-2 border-b px-6 py-3"
        style={{ borderColor: "var(--studio-border)" }}
      >
        {(["all", "film", "drama", "commercial", "youtube"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="rounded px-3 py-1 text-xs transition"
            style={{
              backgroundColor:
                filter === c ? "var(--studio-accent-muted, #2d2d5a)" : "transparent",
              color: filter === c ? "var(--studio-text)" : "var(--studio-text-dim)",
              border: "1px solid",
              borderColor: filter === c ? "var(--studio-accent)" : "var(--studio-border)",
            }}
          >
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[320px_1fr]">
        <aside
          className="border-r p-4"
          style={{ borderColor: "var(--studio-border)" }}
        >
          {filtered.length === 0 && (
            <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
              No entries.
            </p>
          )}
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className="mb-2 w-full rounded p-3 text-left transition"
              style={{
                border: "1px solid",
                borderColor:
                  selected === e.id ? categoryColors[e.category] : "var(--studio-border)",
                backgroundColor:
                  selected === e.id ? "var(--studio-bg-hover)" : "transparent",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    color: categoryColors[e.category],
                    border: `1px solid ${categoryColors[e.category]}44`,
                    backgroundColor: `${categoryColors[e.category]}11`,
                  }}
                >
                  {categoryLabels[e.category]}
                </span>
                <span className="text-[9px]" style={{ color: "var(--studio-text-dim)" }}>
                  {e.studio}
                </span>
              </div>
              <div className="text-sm font-semibold">{e.title}</div>
              <div className="mt-1 text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                {e.releaseDate ?? "—"} · {e.runtime != null ? `${e.runtime}m` : ""}
              </div>
            </button>
          ))}
        </aside>

        <main className="p-6">
          {active ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{active.title}</h2>
                  <div className="mt-1 flex gap-2 text-xs" style={{ color: "var(--studio-text-dim)" }}>
                    <span>{categoryLabels[active.category]}</span>
                    <span>·</span>
                    <span>{active.studio}</span>
                    <span>·</span>
                    <span>{active.releaseDate ?? "미공개"}</span>
                    {active.runtime != null && (
                      <>
                        <span>·</span>
                        <span>
                          {active.runtime >= 60
                            ? `${Math.floor(active.runtime / 60)}h ${active.runtime % 60}m`
                            : `${active.runtime}s`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <section className="mb-6">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
                  Performance
                </h3>
                <MetricsWidget category={active.category} metrics={active.metrics} />
              </section>

              <section className="mb-6">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
                  Distribution Channels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {active.channels.map((ch) => (
                    <span
                      key={ch}
                      className="rounded px-2 py-1 text-xs"
                      style={{
                        border: "1px solid var(--studio-border)",
                        backgroundColor: "var(--studio-bg-surface)",
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
                  Deliverables
                </h3>
                <div className="flex flex-wrap gap-2">
                  {active.deliverables.map((d) => (
                    <span
                      key={d}
                      className="rounded px-2 py-1 font-mono text-xs"
                      style={{
                        border: "1px solid var(--studio-border)",
                        backgroundColor: "var(--studio-bg-surface)",
                        color: "var(--studio-text-dim)",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <p style={{ color: "var(--studio-text-dim)" }}>Select an entry.</p>
          )}
        </main>
      </div>
    </div>
  );
}
