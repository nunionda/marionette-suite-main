"use client";

import { useEffect, useState } from "react";
import type { JobSummary } from "../../../lib/ai-ops/history";

interface ProviderRow {
  id: string;
  capability: "text" | "image" | "video" | "audio" | "voice-clone";
  label: string;
  tier: "top" | "free" | "local";
  description?: string;
  health: { state: string; lastProbeAt?: number; error?: string };
}

interface Props {
  initialJobs: JobSummary[];
}

const POLL_INTERVAL_MS = 5000;

const STATE_GLYPH: Record<string, string> = {
  ready: "✓",
  "missing-key": "🔑",
  unreachable: "✗",
  "rate-limited": "⏱",
  unknown: "·",
};

const STATE_COLOR: Record<string, string> = {
  ready: "bg-green-100 text-green-800",
  "missing-key": "bg-amber-100 text-amber-800",
  unreachable: "bg-red-100 text-red-800",
  "rate-limited": "bg-yellow-100 text-yellow-800",
  unknown: "bg-neutral-100 text-neutral-600",
};

const JOB_STATE_COLOR: Record<string, string> = {
  queued: "bg-neutral-100 text-neutral-700",
  running: "bg-blue-100 text-blue-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  canceled: "bg-neutral-200 text-neutral-600",
};

export function AiOpsClient({ initialJobs }: Props) {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>(initialJobs);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const [pRes, jRes] = await Promise.all([
          fetch("/api/ai/providers"),
          fetch("/api/ai/jobs"),
        ]);
        if (cancelled) return;
        if (pRes.ok) {
          const { providers: fresh } = (await pRes.json()) as {
            providers: ProviderRow[];
          };
          setProviders(fresh);
        }
        if (jRes.ok) {
          const { jobs: fresh } = (await jRes.json()) as { jobs: JobSummary[] };
          setJobs(fresh);
        }
        setLoadedAt(Date.now());
      } catch (err) {
        console.error("ai-ops poll failed", err);
      }
    }

    tick();
    const int = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(int);
    };
  }, []);

  const byCapability = providers.reduce<Record<string, ProviderRow[]>>(
    (acc, p) => {
      (acc[p.capability] ??= []).push(p);
      return acc;
    },
    {},
  );

  const stats = {
    totalProviders: providers.length,
    ready: providers.filter((p) => p.health.state === "ready").length,
    missingKey: providers.filter((p) => p.health.state === "missing-key").length,
    unreachable: providers.filter((p) => p.health.state === "unreachable").length,
    jobsActive: jobs.filter(
      (j) => j.latestState === "queued" || j.latestState === "running",
    ).length,
    jobsSucceeded: jobs.filter((j) => j.latestState === "succeeded").length,
    jobsFailed: jobs.filter((j) => j.latestState === "failed").length,
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">AI Ops</h1>
        <p className="text-sm text-neutral-500">
          Live provider health matrix and in-process job history. Polls every 5s.
          {loadedAt && (
            <> Last refresh: {new Date(loadedAt).toLocaleTimeString()}.</>
          )}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3 md:grid-cols-7">
        <StatCard label="Providers" value={stats.totalProviders} />
        <StatCard label="Ready" value={stats.ready} tone="positive" />
        <StatCard
          label="Missing key"
          value={stats.missingKey}
          tone={stats.missingKey ? "warn" : "neutral"}
        />
        <StatCard
          label="Unreachable"
          value={stats.unreachable}
          tone={stats.unreachable ? "critical" : "neutral"}
        />
        <StatCard label="Jobs active" value={stats.jobsActive} tone="info" />
        <StatCard label="Succeeded" value={stats.jobsSucceeded} tone="positive" />
        <StatCard
          label="Failed"
          value={stats.jobsFailed}
          tone={stats.jobsFailed ? "critical" : "neutral"}
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Providers</h2>
        {Object.keys(byCapability).length === 0 ? (
          <p className="text-sm text-neutral-500">Loading provider health…</p>
        ) : (
          <div className="space-y-4">
            {(
              ["text", "image", "video", "audio", "voice-clone"] as const
            ).map((cap) => {
              const rows = byCapability[cap] ?? [];
              if (rows.length === 0) return null;
              return (
                <div key={cap} className="rounded-lg border">
                  <header className="flex items-baseline justify-between border-b px-3 py-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                      {cap}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {rows.length} provider{rows.length === 1 ? "" : "s"}
                    </span>
                  </header>
                  <ul>
                    {rows.map((p) => (
                      <li
                        key={`${p.capability}:${p.id}`}
                        className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.label}</span>
                            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                              {p.tier}
                            </span>
                            <code className="text-xs text-neutral-400">
                              {p.id}
                            </code>
                          </div>
                          {p.description && (
                            <div className="mt-0.5 text-xs text-neutral-500">
                              {p.description}
                            </div>
                          )}
                          {p.health.error && (
                            <div className="mt-0.5 text-xs text-red-600">
                              {p.health.error}
                            </div>
                          )}
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            STATE_COLOR[p.health.state] ??
                            STATE_COLOR.unknown!
                          }`}
                        >
                          {STATE_GLYPH[p.health.state] ?? "·"} {p.health.state}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Recent jobs ({jobs.length})
        </h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No activity yet. Generate a shot from{" "}
            <code>/projects/[id]/cinema</code> to populate this panel.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2 text-left">Job</th>
                  <th className="px-3 py-2 text-left">State</th>
                  <th className="px-3 py-2 text-left">Progress</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 30).map((j) => (
                  <tr key={j.jobId} className="border-t">
                    <td className="px-3 py-2">
                      <code className="text-xs">{j.jobId}</code>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          JOB_STATE_COLOR[j.latestState] ??
                          "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {j.latestState}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {j.latestProgress !== undefined
                        ? `${Math.round(j.latestProgress * 100)}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-neutral-500">
                      {j.durationMs !== undefined
                        ? `${(j.durationMs / 1000).toFixed(1)}s`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-neutral-600">
                      {j.latestNote ?? j.error ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-neutral-50 p-4 text-sm text-neutral-600">
        <h2 className="font-semibold">Cost rollups</h2>
        <p className="mt-1">
          Per-provider token/credit accounting ships in a follow-up sprint.
          Providers that expose usage metadata in their response (Anthropic,
          Gemini, Groq) will feed into this panel; for video/image we&apos;ll
          estimate from request duration × per-second pricing.
        </p>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  tone?: "positive" | "warn" | "critical" | "info" | "neutral";
}

function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  const toneClass =
    tone === "positive"
      ? "bg-green-50 text-green-800 border-green-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : tone === "critical"
          ? "bg-red-50 text-red-800 border-red-200"
          : tone === "info"
            ? "bg-blue-50 text-blue-800 border-blue-200"
            : "bg-white text-neutral-800 border-neutral-200";
  return (
    <div className={`rounded border p-3 ${toneClass}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
