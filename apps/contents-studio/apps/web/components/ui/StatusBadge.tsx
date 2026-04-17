import { STATUS_COLORS, STATUS_LABELS } from "../../lib/constants"

interface StatusBadgeProps {
  status: string
  /** "pill" = default (sharp 2px radius), "tag" = same — both sharp per design system */
  variant?: "pill" | "tag"
  className?: string
}

export function StatusBadge({ status, variant = "pill", className = "" }: StatusBadgeProps) {
  void variant
  const colorClass = STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT
  const label = STATUS_LABELS[status] ?? status

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${colorClass} ${className}`}
      style={{
        borderRadius: "2px",
        fontFamily: "var(--font-geist-mono, monospace)",
      }}
    >
      {label}
    </span>
  )
}
