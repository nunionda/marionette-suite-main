"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "../../../lib/api";
import { PHASE_AGENTS } from "../../../lib/constants";
import { usePipelineWS } from "../../../hooks/use-pipeline-ws";
import { StageCard } from "../../../components/pipeline/StageCard";

// ─── Types ───

interface Project {
  id: string;
  title: string;
  genre: string;
  status: string;
  progress: number;
  direction_plan_json: unknown | null;
}

interface PipelineRunSummary {
  id: string;
  status: string;
  steps: string[];
  step_results: Record<string, { status: string }>;
  progress: number;
  current_step: string | null;
}

interface StageInfo {
  title: string;
  icon: string;
  status: "idle" | "running" | "completed" | "failed" | "queued" | "error";
  progress: number;
}

// ─── Agent → Phase mapping (sourced from lib/constants) ───

const PRE_PROD_AGENTS = [...PHASE_AGENTS["pre-production"]];
const MAIN_PROD_AGENTS = [...PHASE_AGENTS.production];
const POST_PROD_AGENTS = [...PHASE_AGENTS["post-production"]];

function computeStages(project: Project, runs: PipelineRunSummary[]): StageInfo[] {
  const hasPlan = !!project.direction_plan_json;

  // Check if any run completed a specific set of agents
  function phaseStatus(agents: string[]): { status: "idle" | "running" | "completed" | "failed"; progress: number } {
    let completedCount = 0;
    let hasRunning = false;
    let hasFailed = false;

    for (const agent of agents) {
      // Check across all runs for this agent
      for (const run of runs) {
        if (!run.steps.includes(agent)) continue;
        const result = run.step_results?.[agent];
        if (result?.status === "completed") { completedCount++; break; }
        if (result?.status === "running" || run.current_step === agent) hasRunning = true;
        if (result?.status === "failed") hasFailed = true;
      }
    }

    if (completedCount === agents.length) return { status: "completed", progress: 100 };
    if (hasRunning) return { status: "running", progress: Math.round((completedCount / agents.length) * 100) };
    if (completedCount > 0) return { status: "running", progress: Math.round((completedCount / agents.length) * 100) };
    if (hasFailed) return { status: "failed", progress: Math.round((completedCount / agents.length) * 100) };
    return { status: "idle", progress: 0 };
  }

  // Development: has direction plan or any script_writer/scripter completed
  const devCompleted = hasPlan || runs.some(r =>
    r.step_results?.["script_writer"]?.status === "completed" ||
    r.step_results?.["scripter"]?.status === "completed"
  );
  const devRunning = !devCompleted && runs.some(r =>
    r.current_step === "script_writer" || r.current_step === "scripter"
  );

  // Analysis: scripter completed
  const analysisCompleted = runs.some(r =>
    r.step_results?.["scripter"]?.status === "completed"
  );
  const analysisRunning = !analysisCompleted && runs.some(r =>
    r.current_step === "scripter"
  );

  const preProd = phaseStatus(PRE_PROD_AGENTS);
  const mainProd = phaseStatus(MAIN_PROD_AGENTS);
  const postProd = phaseStatus(POST_PROD_AGENTS);

  return [
    { title: "Development", icon: "✍️", status: devCompleted ? "completed" : devRunning ? "running" : "idle", progress: devCompleted ? 100 : devRunning ? 50 : 0 },
    { title: "Analysis", icon: "📊", status: analysisCompleted ? "completed" : analysisRunning ? "running" : "idle", progress: analysisCompleted ? 100 : analysisRunning ? 50 : 0 },
    { title: "Art Dept", icon: "🎨", ...preProd },
    { title: "Production", icon: "🎬", ...mainProd },
    { title: "Post-Pro", icon: "🎞️", ...postProd },
  ];
}

// ─── Main Component ───

export default function PipelinePage() {
  const { runs: liveRuns, connected, loading: wsLoading } = usePipelineWS();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectRuns, setProjectRuns] = useState<Map<string, PipelineRunSummary[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAPI<{ projects: Project[] }>("/api/projects")
      .then(async (data) => {
        const projs = data.projects ?? [];
        setProjects(projs);

        // Fetch runs for each project in parallel
        const runsMap = new Map<string, PipelineRunSummary[]>();
        await Promise.allSettled(
          projs.map(async (p) => {
            try {
              const res = await fetchAPI<{ runs: PipelineRunSummary[] }>(`/api/pipeline/${p.id}/runs`);
              runsMap.set(p.id, res.runs ?? []);
            } catch {
              runsMap.set(p.id, []);
            }
          })
        );
        setProjectRuns(runsMap);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const monoStyle: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl uppercase tracking-tight"
            style={{ fontFamily: "var(--font-anton, serif)", color: "var(--color-white, #F0F0F0)" }}
          >
            Studio{" "}
            <span style={{ color: "var(--color-green, #00FF41)" }}>Pipeline</span>{" "}
            Hub
          </h1>
          <p
            className="mt-1 text-[11px]"
            style={{ ...monoStyle, color: "var(--color-muted, #707070)" }}
          >
            End-to-end production orchestration & department monitoring
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className="flex items-center gap-2 px-3 py-1"
            style={{
              border: "1px solid var(--color-border, #1E1E1E)",
              borderRadius: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: connected ? "#00FF41" : "#F59E0B",
                animation: connected ? "ms-pulse 1.4s ease-in-out infinite" : undefined,
              }}
            />
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ ...monoStyle, color: "var(--color-muted, #707070)" }}
            >
              {connected ? "Live System Sync" : "Connection Lost"}
            </span>
          </div>
          <span
            className="text-[9px]"
            style={{ ...monoStyle, color: "var(--color-subtle, #505050)" }}
          >
            {new Date().toISOString()}
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse p-5"
              style={{ border: "1px solid var(--color-border, #1E1E1E)", borderRadius: 2 }}
            >
              <div className="mb-3 h-4 w-1/3 rounded" style={{ background: "#1E1E1E" }} />
              <div className="h-0.5 w-full rounded" style={{ background: "#1E1E1E" }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="mb-6 px-4 py-3 text-[11px]"
          style={{
            border: "1px solid rgba(192,57,43,0.4)",
            borderRadius: 2,
            background: "#1A0808",
            color: "#C0392B",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          Failed to load projects: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p
            className="text-[11px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-muted, #707070)" }}
          >
            No projects in pipeline
          </p>
          <p
            className="mt-1 text-[10px]"
            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
          >
            Create a project to start production
          </p>
          <Link
            href="/projects/new"
            className="mt-6 px-6 py-2 text-[11px] uppercase tracking-widest transition hover:brightness-110"
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              background: "var(--color-green, #00FF41)",
              color: "#0A0A0A",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Create Project
          </Link>
        </div>
      )}

      {/* Project Pipeline Cards */}
      <div className="space-y-12">
        {projects.map((project) => {
          const runs = projectRuns.get(project.id) ?? [];
          const stages = computeStages(project, runs);

          return (
            <section key={project.id} className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00FF41", flexShrink: 0 }}
                  />
                  <h2
                    className="text-lg uppercase tracking-tight"
                    style={{ fontFamily: "var(--font-anton, serif)", color: "var(--color-white, #F0F0F0)" }}
                  >
                    {project.title}
                  </h2>
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
                  >
                    {project.genre}
                  </span>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[10px] uppercase tracking-widest transition-colors hover:text-[#F0F0F0]"
                  style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-green, #00FF41)" }}
                >
                  View Breakdown →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stages.map((stage, idx) => (
                  <StageCard
                    key={idx}
                    title={stage.title}
                    status={stage.status}
                    progress={stage.progress}
                    icon={stage.icon}
                    onClick={() => window.location.href = `/projects/${project.id}`}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Live Agent Activity */}
        <section
          className="mt-16 p-6"
          style={{ border: "1px solid var(--color-border, #1E1E1E)", borderRadius: 2 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00FF41", animation: "ms-pulse 1.4s ease-in-out infinite" }}
            />
            <h3
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-white, #F0F0F0)" }}
            >
              Live Activity
            </h3>
            <span
              className="text-[10px]"
              style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
            >
              {liveRuns.length} active threads
            </span>
          </div>

          {wsLoading && (
            <div
              className="py-10 text-center text-[10px] uppercase tracking-widest animate-pulse"
              style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
            >
              Syncing with backend queue...
            </div>
          )}

          {!wsLoading && liveRuns.length === 0 && (
            <div
              className="py-10 text-center text-[10px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
            >
              No active agent threads
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {liveRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-3"
                style={{ border: "1px solid var(--color-border, #1E1E1E)", borderRadius: 2 }}
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium truncate max-w-[120px]"
                      style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-white, #F0F0F0)" }}
                    >
                      {run.projectTitle}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-tighter"
                      style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-green, #00FF41)" }}
                    >
                      [{run.currentStep}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-16 overflow-hidden"
                      style={{ height: 2, background: "var(--color-border, #1E1E1E)", borderRadius: 1 }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${run.progress}%`,
                          background: "#00FF41",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px]"
                      style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-subtle, #505050)" }}
                    >
                      {Math.round(run.progress)}%
                    </span>
                  </div>
                </div>
                <span
                  className="text-[9px] uppercase tracking-widest px-2 py-0.5"
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    borderRadius: 2,
                    background: run.status === "running" ? "rgba(0,255,65,0.08)" : run.status === "completed" ? "rgba(72,72,72,0.2)" : "transparent",
                    color: run.status === "running" ? "#00FF41" : run.status === "completed" ? "#F0F0F0" : "var(--color-subtle, #505050)",
                    border: `1px solid ${run.status === "running" ? "rgba(0,255,65,0.25)" : "var(--color-border, #1E1E1E)"}`,
                  }}
                >
                  {run.status}
                </span>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes ms-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </section>
      </div>
    </div>
  );
}
