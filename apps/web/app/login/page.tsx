"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/projects");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">🎭 Marionette Studio</h1>
          <p className="mt-2 text-sm text-gray-400">AI Film Production Pipeline</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-semibold">Login</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
