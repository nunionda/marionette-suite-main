"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  PHASES,
  nextIncompletePhase,
  phaseFromPathname,
  rollupPhases,
  type PhaseRollup,
} from "../../lib/phases/definition";

interface Props {
  projectId: string;
  /** Server-side seed so the stepper renders useful data before the client fetch resolves. */
  initialRollups?: PhaseRollup[];
}

const POLL_INTERVAL_MS = 10_000;

/**
 * 6-phase progress bar. Each phase is a clickable pill with:
 *   - phase number (1..6)
 *   - label
 *   - progress % (rolled up from aggregator legs)
 *   - active state (based on current pathname, not data)
 *   - "next step" hint (first incomplete phase, data-derived)
 *
 * Connector lines between pills fill proportionally with progress.
 */
export function PhaseStepper({ projectId, initialRollups }: Props) {
  const pathname = usePathname() ?? "";
  const [rollups, setRollups] = useState<PhaseRollup[]>(initialRollups ?? []);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`);
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;
        setRollups(rollupPhases(data));
      } catch {
        // Aggregator hiccup — keep last good data.
      }
    }

    tick();
    const int = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(int);
    };
  }, [projectId]);

  const activePhase = useMemo(
    () => phaseFromPathname(pathname, projectId),
    [pathname, projectId],
  );
  const nextPhase = useMemo(
    () => nextIncompletePhase(rollups),
    [rollups],
  );

  const rollupById = useMemo(() => {
    const m = new Map<string, PhaseRollup>();
    for (const r of rollups) m.set(r.phaseId, r);
    return m;
  }, [rollups]);

  return (
    <div className="rounded-lg border border-neutral-800 bg-[#0F0F0F] p-3">
      <ol className="flex items-center gap-0">
        {PHASES.map((phase, i) => {
          const rollup = rollupById.get(phase.id);
          const pct = rollup ? Math.round(rollup.progress * 100) : 0;
          const isActive = activePhase?.id === phase.id;
          const isNext = !isActive && nextPhase?.phaseId === phase.id;
          const isDone = rollup ? rollup.progress >= 0.999 : false;

          return (
            <li key={phase.id} className="flex flex-1 items-center">
              <Link
                href={phase.representativeHref(projectId)}
                title={phase.description}
                className={`group flex flex-1 items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-neutral-800"
                    : "hover:bg-neutral-900"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isDone
                      ? "bg-green-700 text-white"
                      : isActive
                        ? "bg-blue-600 text-white"
                        : isNext
                          ? "border border-blue-500 bg-transparent text-blue-400"
                          : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-white"
                        : isDone
                          ? "text-neutral-300"
                          : isNext
                            ? "text-blue-300"
                            : "text-neutral-500"
                    }`}
                  >
                    {phase.label}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                    {rollup
                      ? `${pct}% · ${rollup.activeLegCount}/${rollup.totalLegCount} legs`
                      : "—"}
                  </div>
                </div>
              </Link>
              {i < PHASES.length - 1 && (
                <div className="relative mx-1 h-0.5 w-6 rounded bg-neutral-800">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-neutral-500 transition-all"
                    style={{
                      width: `${pct}%`,
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {nextPhase && (
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-neutral-500">
          <span>
            Next focus:{" "}
            <span className="text-blue-400">
              {PHASES.find((p) => p.id === nextPhase.phaseId)?.label}
            </span>
            {" — "}
            {Math.round(nextPhase.progress * 100)}% complete
          </span>
          <span className="text-neutral-600">
            ⌘K to jump · {PHASES.length} phases · 73 processes rolled up
          </span>
        </div>
      )}
    </div>
  );
}
