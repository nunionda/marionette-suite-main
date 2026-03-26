"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "../../../lib/api";
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
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
}

// ─── Agent → Phase mapping ───

const PRE_PROD_AGENTS = ["concept_artist", "casting_director", "location_scout", "previsualizer"];
const MAIN_PROD_AGENTS = ["cinematographer", "generalist", "asset_designer"];
const POST_PROD_AGENTS = ["vfx_compositor", "sound_designer", "composer", "master_editor", "colorist", "mixing_engineer"];

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Studio <span className="text-blue-500">Pipeline</span> Hub
          </h1>
          <p className="mt-1 text-sm text-gray-400 font-medium">
            End-to-end production orchestration & department monitoring
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-green-400 animate-pulse" : "bg-yellow-400"
              }`}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {connected ? "Live System Sync" : "Connection Lost"}
            </span>
          </div>
          <span className="text-[9px] text-gray-600 font-mono">
            {new Date().toISOString()}
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 animate-pulse">
          Loading pipeline data...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load projects: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-medium">No projects in pipeline</p>
          <p className="mt-1 text-sm text-gray-500">Create a project to start production</p>
          <Link
            href="/projects/new"
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
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
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-sm bg-blue-500" />
                  <h2 className="text-xl font-extrabold tracking-tight text-white uppercase italic">
                    {project.title}
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">{project.genre}</span>
                  <div className="h-[1px] w-48 bg-gradient-to-r from-gray-700 to-transparent" />
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Full Breakdown →
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

        {/* Live Agent Log Monitor */}
        <section className="mt-16 rounded-2xl border border-gray-800 bg-gray-950/50 p-6 backdrop-blur-xl">
           <div className="mb-6 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                 Agentic <span className="text-white">Live Activity</span>
               </h3>
               <div className="h-1 w-1 bg-gray-700 rounded-full" />
               <span className="text-[10px] text-gray-600 font-mono">
                 {liveRuns.length} ACTIVE THREADS
               </span>
             </div>
           </div>

           {wsLoading && (
             <div className="py-12 text-center text-xs font-bold uppercase tracking-widest text-gray-700 animate-pulse">
               Syncing with Backend Queue...
             </div>
           )}

           {!wsLoading && liveRuns.length === 0 && (
             <div className="py-12 text-center text-xs font-medium text-gray-600">
               NO RECENT AI THREADS DETECTED
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {liveRuns.map((run) => (
               <div
                 key={run.id}
                 className="group flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 transition-all hover:bg-gray-800/40"
               >
                 <div className="flex flex-col gap-1 min-w-0">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-white truncate max-w-[120px]">
                       {run.projectTitle}
                     </span>
                     <span className="text-[9px] text-blue-400/80 font-mono uppercase tracking-tighter">
                       [{run.currentStep}]
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="h-1 w-16 bg-gray-800 rounded-full overflow-hidden">
                       <div
                         className="h-full bg-blue-500 transition-all duration-300"
                         style={{ width: `${run.progress}%` }}
                       />
                     </div>
                     <span className="text-[8px] text-gray-600 font-bold">{Math.round(run.progress)}%</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      run.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
                      run.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {run.status}
                    </span>
                 </div>
               </div>
             ))}
           </div>
        </section>
      </div>
    </div>
  );
}
