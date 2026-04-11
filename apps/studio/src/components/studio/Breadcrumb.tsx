import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="opacity-40" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--studio-text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--studio-text)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
