"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

const navItems = [
  { href: "/projects", label: "Projects", icon: "🎬" },
  { href: "/pipeline", label: "Pipeline", icon: "⚙️" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/logline-guide", label: "Logline Guide", icon: "📝" },
  { href: "/prompt-guide", label: "Prompt Guide", icon: "🎨" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Auth guard — redirect to login if not authenticated (in useEffect to avoid render-time setState)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show loading spinner while checking auth or redirecting
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r border-gray-800 bg-gray-950">
        <div className="border-b border-gray-800 px-6 py-5">
          <h1 className="text-lg font-bold tracking-tight">
            🎭 Marionette Studio
          </h1>
        </div>
        <nav className="flex-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-800 px-4 py-4">
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-200">
                  {user.name}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        {children}
      </main>
    </div>
  );
}
