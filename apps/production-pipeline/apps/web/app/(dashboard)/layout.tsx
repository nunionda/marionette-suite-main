"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

const navItems = [
  { href: "/projects", label: "Projects", icon: "🎬" },
  { href: "http://localhost:5173", label: "CineScript Writer", icon: "✍️", external: true },
  { href: "http://localhost:3001", label: "Art Department", icon: "🎨", external: true },
  { href: "/scenario", label: "Scenario Analysis", icon: "📊" },
  { href: "/pipeline", label: "Pipeline", icon: "⚙️" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/logline-guide", label: "Logline Guide", icon: "📝" },
  { href: "/prompt-guide", label: "Prompt Guide", icon: "🎨" },
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
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--color-bg, #0A0A0A)" }}
      >
        <div
          className="h-6 w-6 animate-spin rounded-full border-2"
          style={{ borderColor: "#1E1E1E", borderTopColor: "#00FF41" }}
        />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive = !("external" in item) && pathname.startsWith(item.href);
            const itemStyle: React.CSSProperties = {
              ...monoStyle,
              fontSize: 11,
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
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
            };

            if ("external" in item) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={itemStyle}
                  className="hover:bg-[#141414] hover:text-[#F0F0F0]"
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2.5 w-2.5 opacity-30"
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
                style={itemStyle}
                className="hover:bg-[#141414] hover:text-[#F0F0F0]"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
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
                  {user.name}
                </p>
                <p
                  className="truncate text-[10px]"
                  style={{ ...monoStyle, color: "var(--color-subtle, #505050)" }}
                >
                  {user.email}
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
    </div>
  );
}
