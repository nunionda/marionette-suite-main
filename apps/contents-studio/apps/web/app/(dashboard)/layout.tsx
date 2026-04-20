"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { StudioSelector } from "../../components/ui/StudioSelector";
import { CommandPalette } from "../../components/ui/CommandPalette";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "dev",
    label: "개발 · Development",
    items: [
      { href: "/idea", label: "Idea / Concept", icon: "💡" },
      { href: "/research", label: "Research", icon: "🔬" },
      { href: "/rights", label: "Rights / Clearances", icon: "⚖️" },
      { href: "/pitch", label: "Pitch Deck", icon: "📊" },
      { href: "/financing", label: "Financing", icon: "💳" },
    ],
  },
  {
    id: "writing",
    label: "각본 · Writing",
    items: [
      { href: process.env.NEXT_PUBLIC_SCRIPT_WRITER_URL || "http://localhost:5174", label: "CineScript Writer", icon: "✍️", external: true },
      { href: process.env.NEXT_PUBLIC_ANALYSIS_WEB_URL || "http://localhost:4007", label: "Scenario Analysis", icon: "📊", external: true },
      { href: "/script-library", label: "Script Library", icon: "📚" },
      { href: "/script-doctoring", label: "Script Doctoring", icon: "🩺" },
      { href: "/logline-guide", label: "Logline Guide", icon: "📝" },
      { href: "/prompt-guide", label: "Prompt Guide", icon: "🎨" },
    ],
  },
  {
    id: "preproduction",
    label: "사전제작 · Pre-Production",
    items: [
      { href: process.env.NEXT_PUBLIC_STORYBOARD_URL || "http://localhost:3007", label: "Storyboard Concept", icon: "🎨", external: true },
      { href: "/lighting-design", label: "Lighting Design", icon: "💡" },
      { href: "/vfx-previs", label: "VFX Previs", icon: "🎬" },
      { href: "/schedule", label: "Shoot Schedule", icon: "📅" },
      { href: "/budget", label: "Budget", icon: "💰" },
      { href: "/casting", label: "Casting", icon: "🎭" },
      { href: "/talent-contracts", label: "Talent Contracts", icon: "📋" },
      { href: "/crew", label: "Crew Hiring", icon: "👥" },
      { href: "/locations", label: "Locations", icon: "📍" },
      { href: "/contracts", label: "Location Contracts", icon: "📄" },
      { href: "/rehearsals", label: "Rehearsals", icon: "🎬" },
      { href: "/equipment", label: "Equipment Prep", icon: "🎥" },
      { href: "/insurance", label: "Insurance / Legal", icon: "🛡️" },
      { href: "/production-office", label: "Production Office", icon: "🏗️" },
      { href: "/stunt", label: "Stunt Choreography", icon: "🤸" },
      { href: "/script-supervisor-prep", label: "Script Supervisor", icon: "📋" },
    ],
  },
  {
    id: "production",
    label: "프로덕션 · Production",
    items: [
      { href: "/photography", label: "Principal Photography", icon: "📷" },
      { href: "/on-set-sound", label: "On-set Sound", icon: "🎙️" },
      { href: "/continuity", label: "Continuity", icon: "🔄" },
      { href: "/daily-report", label: "Daily Report", icon: "📋" },
      { href: "/wrap-report", label: "Wrap Report", icon: "🎬" },
      { href: "/dailies", label: "Dailies / Rushes", icon: "📽️" },
    ],
  },
  {
    id: "post",
    label: "포스트 · Post-Production",
    items: [
      { href: "/ingest", label: "Data Ingest", icon: "💾" },
      { href: "/post", label: "Post Studio", icon: "✂️" },
      { href: "/assembly", label: "Assembly", icon: "🎞️" },
      { href: "/picture-lock", label: "Picture Lock", icon: "🔒" },
      { href: "/vfx-review", label: "VFX Review", icon: "🎞️" },
      { href: "/titles", label: "Titles", icon: "🔤" },
      { href: "/music-licensing", label: "Music Licensing", icon: "🎵" },
      { href: "/final-mix", label: "Final Mix", icon: "🎚️" },
      { href: "/qc", label: "QC / Quality Control", icon: "✅" },
      { href: "/dcp", label: "DCP Mastering", icon: "💿" },
      { href: "/conform", label: "Conform / Onlining", icon: "🖥️" },
      { href: "/deliverables", label: "Deliverables Prep", icon: "📦" },
      { href: process.env.NEXT_PUBLIC_PIPELINE_URL || "http://localhost:3003/dashboard", label: "Production Pipeline", icon: "⚙️", external: true },
    ],
  },
  {
    id: "distribution",
    label: "배급 · Distribution",
    items: [
      { href: "/festivals", label: "Festivals", icon: "🏆" },
      { href: "/sales", label: "Sales / Distribution", icon: "🤝" },
      { href: "/theatrical", label: "Theatrical Release", icon: "🎦" },
      { href: "/press-kit", label: "Press Kit", icon: "📰" },
      { href: "/marketing", label: "Marketing", icon: "📣" },
      { href: "/international", label: "International", icon: "🌏" },
    ],
  },
  {
    id: "analytics",
    label: "분석 · Analytics",
    items: [
      { href: "/boxoffice", label: "Box Office", icon: "🎟️" },
      { href: "/reviews", label: "Reviews", icon: "⭐" },
      { href: "/awards", label: "Awards Campaign", icon: "🏅" },
      { href: "/archive", label: "Archive & Rights", icon: "🗄️" },
      { href: "/library", label: "Content Library", icon: "📚" },
    ],
  },
  {
    id: "system",
    label: "시스템 · System",
    items: [
      { href: "/ai-ops", label: "AI Ops", icon: "🩺" },
      { href: "/paperclip", label: "Paperclip HQ", icon: "🏢" },
    ],
  },
];

const monoStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono, monospace)",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const displayUser = user ?? { name: "Guest", email: "guest@local" };

  // Which group contains the current route (always kept open)
  const activeGroupId = useMemo(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (!item.external && pathname.startsWith(item.href)) {
          return group.id;
        }
      }
    }
    return null;
  }, [pathname]);

  // Additional manually-opened groups beyond the active one
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  const isGroupOpen = (id: string) => id === activeGroupId || openGroups.has(id);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const itemStyle = (isActive: boolean): React.CSSProperties => ({
    ...monoStyle,
    fontSize: 11,
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px 6px 22px",
    marginBottom: 1,
    borderRadius: 2,
    borderLeft: isActive
      ? "2px solid var(--color-green, #00FF41)"
      : "2px solid transparent",
    background: isActive ? "#141414" : "transparent",
    color: isActive
      ? "var(--color-white, #F0F0F0)"
      : "var(--color-muted, #707070)",
    transition: "background 0.12s, color 0.12s",
    textDecoration: "none",
  });

  return (
    <div className="flex h-screen" style={{ background: "var(--color-bg, #0A0A0A)" }}>
      {/* Sidebar */}
      <aside
        className="flex w-60 flex-col"
        style={{ borderRight: "1px solid var(--color-border, #1E1E1E)" }}
      >
        {/* Logo */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border, #1E1E1E)" }}
        >
          <span
            className="block text-sm uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-anton, serif)",
              color: "var(--color-white, #F0F0F0)",
            }}
          >
            Marionette
          </span>
          <span
            className="block text-[10px] uppercase tracking-widest mt-0.5"
            style={{ ...monoStyle, color: "var(--color-green, #00FF41)" }}
          >
            Studio OS
          </span>
        </div>

        {/* Studio Selector */}
        <StudioSelector />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {/* Pinned: Projects */}
          <Link
            href="/projects"
            style={itemStyle(pathname.startsWith("/projects"))}
            className="hover:bg-[#141414] hover:text-[#F0F0F0] mb-2 block"
          >
            <span>🎬</span>
            <span>Projects</span>
          </Link>

          {/* Phase groups */}
          {navGroups.map((group) => {
            const open = isGroupOpen(group.id);
            return (
              <div key={group.id} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 hover:text-[#A0A0A0]"
                  style={{
                    ...monoStyle,
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: open ? "var(--color-subtle, #505050)" : "var(--color-subtle, #404040)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2 flex-shrink-0 transition-transform duration-150"
                    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="truncate">{group.label}</span>
                </button>

                {/* Group items */}
                {open && (
                  <div>
                    {group.items.map((item) => {
                      const isActive = !item.external && pathname.startsWith(item.href);

                      if (item.external) {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={itemStyle(false)}
                            className="hover:bg-[#141414] hover:text-[#F0F0F0]"
                          >
                            <span>{item.icon}</span>
                            <span className="flex-1 truncate">{item.label}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-2.5 w-2.5 flex-shrink-0 opacity-30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={itemStyle(isActive)}
                          className="hover:bg-[#141414] hover:text-[#F0F0F0]"
                        >
                          <span>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid var(--color-border, #1E1E1E)" }}
        >
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[11px] font-medium"
                  style={{ ...monoStyle, color: "var(--color-white, #F0F0F0)" }}
                >
                  {displayUser.name}
                </p>
                <p
                  className="truncate text-[10px]"
                  style={{ ...monoStyle, color: "var(--color-subtle, #505050)" }}
                >
                  {displayUser.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1.5 transition-colors hover:text-[#F0F0F0]"
                style={{ borderRadius: 2, color: "var(--color-subtle, #505050)" }}
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto p-8"
        style={{ background: "var(--color-bg, #0A0A0A)" }}
      >
        {children}
      </main>

      {/* Global ⌘K command palette */}
      <CommandPalette />
    </div>
  );
}
