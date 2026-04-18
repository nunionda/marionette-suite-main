import type { SceneStatus, CutStatus } from '@/lib/studio/types';

type Status = SceneStatus | CutStatus;

const CONFIG: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-[var(--studio-bg-elevated)] text-[var(--studio-text-dim)] border border-[var(--studio-border)]' },
  in_progress:{ label: 'In Progress',className: 'bg-[var(--studio-accent-dim)] text-[var(--studio-accent)] border border-[var(--studio-accent)]' },
  generating: { label: 'Generating', className: 'bg-amber-900/30 text-[var(--studio-warning)] border border-amber-700/50 animate-pulse' },
  done:       { label: 'Done',       className: 'bg-green-900/30 text-[var(--studio-success)] border border-green-700/50' },
  approved:   { label: 'Approved',   className: 'bg-green-900/50 text-[var(--studio-success)] border border-green-600' },
};

interface Props {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  const { label, className: statusClass } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${statusClass} ${className}`}
    >
      {label}
    </span>
  );
}
