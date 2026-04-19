"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * Minimal ⌘K / Ctrl+K command palette.
 *
 * When the user is inside a project route (/projects/[id]/*), project-
 * scoped items are added to the top of the list. Top-level items are
 * always present.
 *
 * Intentional scope cut: no fuzzy search library — plain substring match
 * is enough for <50 items and keeps the dependency surface flat. When
 * we grow past that, switch to `cmdk` (React 19 compatible).
 */
interface Command {
  id: string;
  label: string;
  group: string;
  href: string;
  shortcut?: string;
}

const TOP_LEVEL: Command[] = [
  { id: "projects", label: "Projects", group: "Navigation", href: "/projects" },
  { id: "ai-ops", label: "AI Ops — Provider health + jobs", group: "Navigation", href: "/ai-ops" },
  { id: "library", label: "Content Library", group: "Navigation", href: "/library" },
  { id: "schedule", label: "Shoot Schedule", group: "Production" },
  { id: "budget", label: "Budget", group: "Production" },
  { id: "casting", label: "Casting", group: "Production" },
  { id: "locations", label: "Locations", group: "Production" },
].map((c) => ({ ...c, href: c.href ?? `/${c.id}` }));

function projectCommands(projectId: string): Command[] {
  return [
    {
      id: "p-overview",
      label: "Overview",
      group: "Current Project",
      href: `/projects/${projectId}`,
    },
    {
      id: "p-cinema",
      label: "Cinema Studio 3.5",
      group: "Current Project",
      href: `/projects/${projectId}/cinema`,
    },
    {
      id: "p-marketing",
      label: "Marketing Studio",
      group: "Current Project",
      href: `/projects/${projectId}/marketing`,
    },
    {
      id: "p-elements",
      label: "Elements Library",
      group: "Current Project",
      href: `/projects/${projectId}/elements`,
    },
    {
      id: "p-screenplay",
      label: "Screenplay",
      group: "Current Project",
      href: `/projects/${projectId}/screenplay`,
    },
  ];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Extract current project id from /projects/[id]/...
  const projectId = useMemo(() => {
    const m = pathname?.match(/^\/projects\/([^/]+)/);
    return m?.[1];
  }, [pathname]);

  // Global keyboard shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((x) => !x);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset on open.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  const allCommands = useMemo<Command[]>(() => {
    return projectId
      ? [...projectCommands(projectId), ...TOP_LEVEL]
      : TOP_LEVEL;
  }, [projectId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((c) =>
      (c.label + " " + c.group).toLowerCase().includes(q),
    );
  }, [allCommands, query]);

  // Clamp cursor when filter shrinks.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  function activate(cmd: Command) {
    setOpen(false);
    router.push(cmd.href);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && filtered[cursor]) {
      e.preventDefault();
      activate(filtered[cursor]!);
    }
  }

  if (!open) return null;

  // Group rendering.
  const groups = new Map<string, Command[]>();
  for (const cmd of filtered) {
    const arr = groups.get(cmd.group) ?? [];
    arr.push(cmd);
    groups.set(cmd.group, arr);
  }

  let renderedIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-lg border border-neutral-800 bg-[#0F0F0F] shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Type a command or search…"
          className="w-full border-b border-neutral-800 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
        />
        <ul className="max-h-80 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-center text-xs text-neutral-500">
              No matches.
            </li>
          )}
          {Array.from(groups.entries()).map(([group, cmds]) => (
            <li key={group}>
              <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-500">
                {group}
              </div>
              <ul>
                {cmds.map((cmd) => {
                  const active = renderedIndex === cursor;
                  const thisIndex = renderedIndex++;
                  return (
                    <li key={cmd.id}>
                      <Link
                        href={cmd.href}
                        onClick={(e) => {
                          e.preventDefault();
                          activate(cmd);
                        }}
                        onMouseEnter={() => setCursor(thisIndex)}
                        className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                          active
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-300 hover:bg-neutral-800/50"
                        }`}
                      >
                        <span>{cmd.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <footer className="flex items-center justify-between border-t border-neutral-800 px-3 py-1.5 text-[10px] text-neutral-500">
          <div>
            <kbd className="rounded bg-neutral-800 px-1 py-0.5">↑↓</kbd> navigate
            <span className="mx-2">·</span>
            <kbd className="rounded bg-neutral-800 px-1 py-0.5">↵</kbd> open
            <span className="mx-2">·</span>
            <kbd className="rounded bg-neutral-800 px-1 py-0.5">esc</kbd> close
          </div>
          <div>
            <kbd className="rounded bg-neutral-800 px-1 py-0.5">⌘K</kbd> toggle
          </div>
        </footer>
      </div>
    </div>
  );
}
