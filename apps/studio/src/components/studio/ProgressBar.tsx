interface Props {
  completed: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ completed, total, showLabel = true, className = '' }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] text-[var(--studio-text-dim)]">
          <span>{completed}/{total}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1 bg-[var(--studio-bg-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--studio-accent)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
