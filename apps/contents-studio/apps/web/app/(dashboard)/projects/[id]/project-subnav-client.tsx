"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavLink {
  href: string;
  label: string;
}

interface Props {
  links: SubNavLink[];
}

/**
 * Horizontal pill-style sub-nav. Active link highlighted via pathname
 * prefix match — Overview matches only the exact project root, every
 * other link matches its own path prefix.
 */
export function ProjectSubNavClient({ links }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-lg border border-neutral-800 bg-[#0F0F0F] p-1">
      {links.map((l) => {
        const isOverview = l.label === "Overview";
        const isActive = isOverview
          ? pathname === l.href
          : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
