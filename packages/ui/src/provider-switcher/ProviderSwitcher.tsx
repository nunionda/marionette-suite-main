"use client";

import { useState, useTransition } from "react";
import { ProviderBadge } from "./ProviderBadge";
import type { ProviderSwitcherEntry, ProviderSwitcherProps } from "./types";

/**
 * Provider Switcher — dropdown that lets the user pick the active AI provider
 * for a given capability (text / image / video / audio).
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ TEXT  [Claude Opus 4.6 ✓] ▾   [Refresh ↻]   │
 *   └──────────────────────────────────────────────┘
 *       (click ▾ to expand ↓)
 *   ┌──────────────────────────────────────────────┐
 *   │  TOP                                         │
 *   │  • Claude Opus 4.6 Thinking     [✓ READY]   │
 *   │  FREE                                        │
 *   │  • Gemini 3.1 Pro               [✓ READY]   │
 *   │  • DeepSeek V3.2 (Groq)         [✓ READY]   │
 *   │  LOCAL                                       │
 *   │  • Ollama                       [✗ DOWN]    │
 *   │  • LM Studio                    [🔑 KEY]    │
 *   └──────────────────────────────────────────────┘
 */
export function ProviderSwitcher(props: ProviderSwitcherProps) {
  const { entries, capability, selected, onSelect, onRefresh } = props;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedEntry =
    entries.find((e) => e.meta.id === selected) ?? entries[0];

  const groups = groupByTier(entries);

  const handleSelect = (id: string) => {
    setOpen(false);
    if (!onSelect) return;
    // React 19: startTransition accepts async functions and keeps `isPending`
    // true until the async work resolves — so the button correctly disables
    // during the server action / router.refresh() round-trip.
    startTransition(async () => {
      await onSelect(id);
    });
  };

  return (
    <div style={{ position: "relative", display: "inline-block", minWidth: 280 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isPending}
        style={buttonStyle(isPending)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ opacity: 0.5, fontSize: 10 }}>{capability.toUpperCase()}</span>
        <span style={{ flex: 1, fontWeight: 500 }}>
          {selectedEntry?.meta.label ?? "(none)"}
        </span>
        {selectedEntry && <ProviderBadge health={selectedEntry.health} />}
        <span style={{ opacity: 0.5 }}>{open ? "▲" : "▼"}</span>
      </button>

      {onRefresh && (
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await onRefresh();
            })
          }
          disabled={isPending}
          style={refreshButtonStyle}
          title="Re-probe all providers"
        >
          ↻
        </button>
      )}

      {open && (
        <div role="listbox" style={dropdownStyle}>
          {(["top", "free", "local"] as const).map((tier) => {
            const rows = groups[tier];
            if (rows.length === 0) return null;
            return (
              <div key={tier}>
                <div style={tierHeadingStyle}>{tier.toUpperCase()}</div>
                {rows.map((entry) => (
                  <ProviderRow
                    key={entry.meta.id}
                    entry={entry}
                    selected={entry.meta.id === selected}
                    onClick={() => handleSelect(entry.meta.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProviderRow({
  entry,
  selected,
  onClick,
}: {
  entry: ProviderSwitcherEntry;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      style={rowStyle(selected)}
    >
      <span style={{ flex: 1, textAlign: "left" }}>
        {selected ? "● " : "  "}
        {entry.meta.label}
        {entry.meta.benchmarkScore != null && (
          <span style={{ marginLeft: 6, opacity: 0.4, fontSize: 10 }}>
            Elo {entry.meta.benchmarkScore}
          </span>
        )}
      </span>
      <ProviderBadge health={entry.health} />
    </button>
  );
}

function groupByTier(entries: ProviderSwitcherEntry[]) {
  const groups: Record<"top" | "free" | "local", ProviderSwitcherEntry[]> = {
    top: [],
    free: [],
    local: [],
  };
  for (const e of entries) groups[e.meta.tier].push(e);
  return groups;
}

// ─── styles (inline to avoid CSS build step in package) ─────────────────────

const monoStyle = { fontFamily: "var(--font-geist-mono, monospace)" } as const;

function buttonStyle(pending: boolean): React.CSSProperties {
  return {
    ...monoStyle,
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 12px",
    borderRadius: 4,
    border: "1px solid #2a2a2a",
    background: "#0a0a0a",
    color: "#F0F0F0",
    fontSize: 12,
    cursor: pending ? "wait" : "pointer",
    opacity: pending ? 0.6 : 1,
  };
}

const refreshButtonStyle: React.CSSProperties = {
  ...monoStyle,
  position: "absolute",
  right: -36,
  top: 0,
  width: 32,
  height: "100%",
  borderRadius: 4,
  border: "1px solid #2a2a2a",
  background: "#0a0a0a",
  color: "#707070",
  cursor: "pointer",
};

const dropdownStyle: React.CSSProperties = {
  ...monoStyle,
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  width: "100%",
  minWidth: 320,
  background: "#0a0a0a",
  border: "1px solid #2a2a2a",
  borderRadius: 4,
  zIndex: 100,
  maxHeight: 400,
  overflowY: "auto",
};

const tierHeadingStyle: React.CSSProperties = {
  ...monoStyle,
  padding: "6px 12px",
  fontSize: 9,
  letterSpacing: "0.1em",
  color: "#505050",
  background: "#141414",
  borderTop: "1px solid #1a1a1a",
};

function rowStyle(selected: boolean): React.CSSProperties {
  return {
    ...monoStyle,
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 12px",
    border: "none",
    background: selected ? "#141414" : "transparent",
    color: "#F0F0F0",
    fontSize: 11,
    cursor: "pointer",
    borderLeft: selected ? "2px solid #00FF41" : "2px solid transparent",
  };
}
