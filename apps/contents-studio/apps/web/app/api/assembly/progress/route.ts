import { NextResponse } from "next/server";
import {
  findAssemblyJobsByProject,
  computeAssemblySummary,
} from "../../../../lib/assembly/mock-entries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("paperclipId");
  if (!pid) {
    return NextResponse.json(
      { error: "paperclipId required" },
      { status: 400 },
    );
  }

  const jobs = findAssemblyJobsByProject(pid);
  if (jobs.length === 0) {
    return NextResponse.json({ found: false, paperclipId: pid });
  }

  const summary = computeAssemblySummary(jobs);

  // Latest job — running first, else most recent "done"
  const latest =
    jobs.find((j) => j.status === "running") ??
    jobs.filter((j) => j.status === "done").sort((a, b) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
    )[0] ??
    jobs[0];

  return NextResponse.json({
    found: true,
    paperclipId: pid,
    steps: {
      queued: summary.total > 0,
      rendering: summary.running > 0,
      mastered: summary.mastered > 0,
    },
    summary,
    latestJob: latest
      ? {
          id: latest.id,
          version: latest.version,
          status: latest.status,
          preset: latest.preset,
          resolution: latest.resolution,
          hdr: latest.hdr,
          audioFormat: latest.audioFormat,
          renderedSec: latest.renderedSec,
          durationSec: latest.durationSec,
          pct:
            latest.durationSec > 0
              ? Math.round((latest.renderedSec / latest.durationSec) * 100)
              : 0,
          outputSizeGB: latest.outputSizeGB ?? null,
          outputPath: latest.outputPath ?? null,
          completedAt: latest.completedAt ?? null,
        }
      : null,
  });
}
