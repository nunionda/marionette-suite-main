export default function GlobalLoading() {
  return (
    <div
      className="flex items-center justify-center h-full"
      style={{ background: 'var(--studio-bg-base)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'var(--studio-accent, #6366f1)', animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'var(--studio-accent, #6366f1)', animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'var(--studio-accent, #6366f1)', animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
