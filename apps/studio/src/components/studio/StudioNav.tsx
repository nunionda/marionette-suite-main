import Link from 'next/link';
import { Film } from 'lucide-react';

interface Props {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StudioNav({ breadcrumbs = [] }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 border-b border-[var(--studio-border)]"
      style={{
        height: 'var(--studio-nav-h)',
        background: 'var(--studio-bg-surface)',
      }}
    >
      <Link
        href="/projects"
        className="flex items-center gap-2 text-[var(--studio-accent)] hover:opacity-80 transition-opacity shrink-0"
      >
        <Film size={20} />
        <span className="text-[13px] font-bold tracking-widest uppercase">Studio</span>
      </Link>

      {breadcrumbs.length > 0 && (
        <>
          <div className="w-px h-5 bg-[var(--studio-border)]" />
          <nav className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)]">
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-30 mx-1">/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[var(--studio-text)] transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[var(--studio-text)]">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
