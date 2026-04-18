"use client";

import { useEffect, useState } from "react";
import { STUDIOS, type Studio } from "@marionette/paperclip-bridge";
import type { StudioCode } from "@marionette/pipeline-core";

const STORAGE_KEY = "marionette.studio";

export function useActiveStudio(): [StudioCode, (s: StudioCode) => void] {
  const [code, setCode] = useState<StudioCode>("STE");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as StudioCode | null;
    if (saved && STUDIOS.some((s) => s.code === saved)) setCode(saved);
  }, []);

  const set = (next: StudioCode) => {
    setCode(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return [code, set];
}

export function StudioSelector() {
  const [code, setCode] = useActiveStudio();
  const [open, setOpen] = useState(false);
  const active = STUDIOS.find((s) => s.code === code) ?? STUDIOS[0]!;

  return (
    <div className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded px-2 py-2 text-left transition"
        style={{
          border: "1px solid var(--studio-border, #2a2a3a)",
          backgroundColor: "var(--studio-bg-surface, #111118)",
        }}
      >
        <span className="flex items-center gap-2">
          <span>{active.emoji}</span>
          <span className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
              Studio
            </span>
            <span className="text-xs font-bold">{active.code}</span>
          </span>
        </span>
        <span className="text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          className="absolute left-3 right-3 z-50 mt-1 overflow-hidden rounded"
          style={{
            border: "1px solid var(--studio-border, #2a2a3a)",
            backgroundColor: "var(--studio-bg-elevated, #1a1a24)",
          }}
        >
          {STUDIOS.map((s: Studio) => (
            <button
              key={s.code}
              onClick={() => {
                setCode(s.code);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left transition hover:opacity-100"
              style={{
                backgroundColor: s.code === code ? "var(--studio-bg-hover)" : "transparent",
                opacity: s.code === code ? 1 : 0.75,
              }}
            >
              <div className="flex items-center gap-2">
                <span>{s.emoji}</span>
                <span className="text-xs font-bold">{s.code}</span>
                <span className="ml-auto text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                  {s.agentCount} agents
                </span>
              </div>
              <div className="mt-0.5 text-[10px]" style={{ color: "var(--studio-text-dim)" }}>
                {s.name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
