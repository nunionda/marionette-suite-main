import Link from "next/link";
import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge/registry";
import { PhaseStepper } from "../../../../components/ui/PhaseStepper";
import {
  rollupPhases,
  type PhaseRollup,
} from "../../../../lib/phases/definition";

/**
 * Project-scoped layout with two navigation layers:
 *
 *   [Phase Stepper]  — 6-phase progress rolled up from the 15-leg aggregator,
 *                      data-driven, shows where work lives
 *   [Sub-nav pills]  — Overview · Screenplay · Cinema · Marketing · Elements,
 *                      pathname-driven, shows where user is
 *
 * Applied by Next.js to every /projects/[id]/* page.
 */
import { ProjectSubNavClient } from "./project-subnav-client";

interface LayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

/**
 * Server-side seed for the Phase Stepper. We call the aggregator route
 * directly (internal fetch) so the stepper renders with real progress
 * before the client hydrates. Failure is non-fatal — the client will
 * re-fetch on mount.
 */
async function fetchInitialRollups(projectId: string): Promise<PhaseRollup[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000";
    const res = await fetch(
      `${base}/api/projects/${encodeURIComponent(projectId)}/progress`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>;
    return rollupPhases(data);
  } catch {
    return [];
  }
}

export default async function ProjectLayout({ params, children }: LayoutProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const initialRollups = await fetchInitialRollups(id);

  const links = [
    { href: `/projects/${id}`, label: "Overview" },
    { href: `/projects/${id}/screenplay`, label: "Screenplay" },
    { href: `/projects/${id}/cinema`, label: "Cinema Studio" },
    { href: `/projects/${id}/marketing`, label: "Marketing Studio" },
    { href: `/projects/${id}/elements`, label: "Elements" },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Project
          </div>
          <h1 className="text-xl font-semibold text-white">{entry.title}</h1>
        </div>
        <Link
          href="/ai-ops"
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          AI Ops ↗
        </Link>
      </header>
      <PhaseStepper projectId={id} initialRollups={initialRollups} />
      <ProjectSubNavClient links={links} />
      <div>{children}</div>
    </div>
  );
}
