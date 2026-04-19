import type { ProviderHealth } from "@marionette/ai-providers";

/**
 * Visual indicator for a single provider's readiness.
 *
 *   ✓  ready         — green  — clickable, can be selected
 *   🔑 missing-key   — amber  — click prompts user to add BYOK key
 *   ✗  unreachable   — red    — registry will skip; still clickable to re-probe
 *   ⏱ rate-limited  — blue   — displays retry window
 *   ·  unknown       — gray   — not yet probed
 */
export function ProviderBadge({ health }: { health: ProviderHealth }) {
  const style = BADGE_STYLES[health.state];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: 4,
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 10,
        letterSpacing: "0.05em",
        color: style.fg,
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
      title={describeHealth(health)}
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </span>
  );
}

const BADGE_STYLES: Record<
  ProviderHealth["state"],
  { icon: string; label: string; fg: string; bg: string; border: string }
> = {
  ready: { icon: "✓", label: "READY", fg: "#00FF41", bg: "#0a1f0a", border: "#00FF41" },
  "missing-key": { icon: "🔑", label: "KEY", fg: "#FFB020", bg: "#1f1608", border: "#FFB020" },
  unreachable: { icon: "✗", label: "DOWN", fg: "#FF4040", bg: "#1f0808", border: "#FF4040" },
  "rate-limited": { icon: "⏱", label: "BACKOFF", fg: "#40A0FF", bg: "#081019", border: "#40A0FF" },
  unknown: { icon: "·", label: "UNKNOWN", fg: "#707070", bg: "#141414", border: "#2a2a2a" },
};

function describeHealth(h: ProviderHealth): string {
  switch (h.state) {
    case "ready":
      return `Ready (last probe ${new Date(h.lastProbeAt).toLocaleTimeString()})`;
    case "missing-key":
      return `Requires env: ${h.requiredEnv.join(", ")}`;
    case "unreachable":
      return `Unreachable: ${h.error}`;
    case "rate-limited":
      return `Rate-limited until ${new Date(h.retryAt).toLocaleTimeString()}`;
    case "unknown":
      return "Not yet probed";
  }
}
