/**
 * Design Tokens — TypeScript Constants
 * For use in JS/TS (Tailwind extends, style props, etc).
 * CSS consumers: import "@marionette/design-tokens/tokens.css" instead.
 */

export const tokens = {
  bg: {
    base: "#0a0a0f",
    surface: "#111118",
    elevated: "#1a1a24",
    hover: "#22223a",
  },
  border: {
    base: "#2a2a3a",
    accent: "#3f3f5a",
  },
  text: {
    base: "#f0f0f8",
    dim: "#8888aa",
    muted: "#55556a",
  },
  accent: {
    base: "#6366f1",
    dim: "rgba(99, 102, 241, 0.15)",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  investor: {
    gold: "#d4af37",
    goldDim: "rgba(212, 175, 55, 0.15)",
  },
  status: {
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#38bdf8",
  },
  content: {
    film: "#a78bfa",
    drama: "#fb7185",
    commercial: "#facc15",
    youtube: "#f87171",
  },
  layout: {
    navHeight: 56,
    sidebarWidth: 220,
    radius: 8,
    radiusSm: 4,
    radiusLg: 12,
  },
} as const;

export type ContentCategory = keyof typeof tokens.content;
