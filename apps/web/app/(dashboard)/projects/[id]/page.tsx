"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { fetchAPI, API_BASE } from "../../../../lib/api"
import {
  AGENT_DISPLAY_NAMES,
  PHASE_AGENTS,
  FULL_PIPELINE,
  PHASE_GROUPS,
  STATUS_COLORS,
} from "../../../../lib/constants"
import { AssetGallery } from "../../../../components/asset-gallery"
import { VersionHistory } from "../../../../components/version-history"
import { BatchMonitor } from "../../../../components/batch-monitor"

// ─── Types ───

interface Scene {
  scene_number: number
  setting: string
  time_of_day: string
  camera_angle: string
  action_description: string
  dialogue: string | null
  image_prompt: string
  video_prompt: string
}

interface DirectionPlan {
  title: string
  logline: string
  genre: string
  target_audience: string
  planning_intent: string
  worldview_settings: string
  character_settings: string
  global_audio_concept: string
  scenes: Scene[]
}

interface PipelineRun {
  id: string
  status: string
  current_step: string | null
  progress: number
  steps: string[]
  step_results: Record<string, { status: string; message?: string; error?: string }>
  started_at: string | null
  completed_at: string | null
}

interface Project {
  id: string
  title: string
  genre: string
  logline: string
  status: string
  progress: number
  idea: string
  protagonist: string | null
  antagonist: string | null
  worldview: string | null
  direction_plan_json: DirectionPlan | null
  created_at: string
  updated_at: string
}

// ─── Constants ───

type Phase = "development" | "pre-production" | "production" | "post-production"

const PHASES: { key: Phase; label: string; icon: string }[] = [
  { key: "development", label: "Development", icon: "📝" },
  { key: "pre-production", label: "Pre-Production", icon: "🎨" },
  { key: "production", label: "Production", icon: "🎥" },
  { key: "post-production", label: "Post-Production", icon: "🎬" },
]

// PHASE_PRESETS maps to the shared PHASE_AGENTS from lib/constants
const PHASE_PRESETS = PHASE_AGENTS

function getPhaseFromStatus(status: string): Phase {
  switch (status) {
    case "PRE_PRODUCTION": return "pre-production"
    case "MAIN_PRODUCTION": return "production"
    case "POST_PRODUCTION": return "post-production"
    case "COMPLETED": return "post-production"
    default: return "development"
  }
}

// ─── Reusable Agent Card ───

function AgentCard({
  step, label, description, buttonLabel, buttonColor, onRun, disabled,
}: {
  step: string
  label: string
  description: string
  buttonLabel: string
  buttonColor: string
  onRun: () => void
  disabled: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${(buttonColor.split(" ")[0] ?? "bg-gray-500")}/20 text-white`}>
          {step}
        </span>
        <h2 className="text-lg font-semibold">{label}</h2>
      </div>
      <p className="mb-4 text-sm text-gray-400">{description}</p>
      <button
        onClick={onRun}
        disabled={disabled}
        className={`rounded-lg ${buttonColor} px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50`}
      >
        {disabled ? "Running..." : buttonLabel}
      </button>
    </div>
  )
}

// ─── Main Component ───

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [runs, setRuns] = useState<PipelineRun[]>([])
  const [activePhase, setActivePhase] = useState<Phase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningPipeline, setRunningPipeline] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({ title: "", genre: "", logline: "", idea: "" })
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshProject = useCallback(() => {
    return fetchAPI<Project>(`/api/projects/${id}`)
      .then(setProject)
      .catch((err: Error) => setError(err.message))
  }, [id])

  useEffect(() => {
    fetchAPI<Project>(`/api/projects/${id}`)
      .then((p) => {
        setProject(p)
        setActivePhase("development")
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))

    fetchAPI<{ runs: PipelineRun[] }>(`/api/pipeline/${id}/runs`)
      .then((data) => setRuns(data.runs ?? []))
      .catch(() => {})

    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  // eslint-disable-next-line
  }, [id])

  const pollRuns = () => {
    fetchAPI<{ runs: PipelineRun[] }>(`/api/pipeline/${id}/runs`)
      .then((data) => {
        setRuns(data.runs ?? [])
        const hasActive = (data.runs ?? []).some(
          (r) => r.status === "running" || r.status === "RUNNING" || r.status === "queued" || r.status === "QUEUED",
        )
        if (!hasActive && pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setRunningPipeline(false)
          refreshProject()
        }
      })
      .catch(() => {})
  }

  const runPipeline = async (steps: string[]) => {
    setRunningPipeline(true)
    setError(null)
    try {
      await fetchAPI(`/api/pipeline/${id}/run`, {
        method: "POST",
        body: JSON.stringify({ steps, idea: project?.idea }),
      })
      pollRuns()
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(pollRuns, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline error")
      setRunningPipeline(false)
    }
  }

  const runFullPipeline = () => {
    if (window.confirm("Run all 15 agents sequentially? This will consume API credits.")) {
      runPipeline([...FULL_PIPELINE])
    }
  }

  const saveProject = async () => {
    try {
      const updated = await fetchAPI<Project>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
      })
      setProject(updated)
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading project...</div>
  if (!project) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error ?? "Project not found"}</div>

  const plan = project.direction_plan_json
  const hasDirectionPlan = !!plan
  const activeRun = runs.find((r) => r.status === "running" || r.status === "RUNNING")

  return (
    <div className="max-w-6xl">
      {/* Back button */}
      <button onClick={() => router.push("/projects")} className="mb-4 text-sm text-gray-400 hover:text-white">
        &larr; Back to Projects
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm text-gray-400">{project.genre}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT}`}>
                {project.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runFullPipeline}
              disabled={runningPipeline}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 text-sm font-bold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {runningPipeline ? "Pipeline Running..." : "Auto-Generate"}
            </button>
            <a
              href={`${API_BASE}/api/export/${project.id}`}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              download
            >
              Export ZIP
            </a>
          </div>
        </div>
        {project.logline && <p className="mt-2 text-sm text-gray-400">{project.logline}</p>}
      </div>

      {/* Phase Progress Tracker */}
      <div className="mb-6 flex items-center gap-0 rounded-xl border border-gray-800 bg-gray-900/50 p-1">
        {PHASES.map((phase, i) => {
          const phaseIndex = PHASES.findIndex((p) => p.key === getPhaseFromStatus(project.status))
          const isCompleted = i < phaseIndex || (project.status === "COMPLETED" && i <= 3)
          const isCurrent = phase.key === activePhase
          const isLocked = !hasDirectionPlan && i > 0

          return (
            <button
              key={phase.key}
              onClick={() => !isLocked && setActivePhase(phase.key)}
              disabled={isLocked}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isCurrent
                  ? "bg-gray-800 text-white shadow-lg"
                  : isCompleted
                    ? "text-green-400 hover:bg-gray-800/50"
                    : isLocked
                      ? "cursor-not-allowed text-gray-600"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <span>{isCompleted && !isCurrent ? "✅" : isLocked ? "🔒" : phase.icon}</span>
              <span className="hidden sm:inline">{phase.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Pipeline Run — Phase-Grouped Progress */}
      {activeRun && (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Pipeline Running</span>
            <span className="text-sm text-gray-400">
              {AGENT_DISPLAY_NAMES[activeRun.current_step ?? ""] ?? activeRun.current_step}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.round(activeRun.progress)}%` }} />
          </div>
          <div className="mt-3 space-y-2">
            {PHASE_GROUPS.map((group) => {
              const activeSteps = group.agents.filter((s) => activeRun.steps.includes(s))
              if (activeSteps.length === 0) return null
              return (
                <div key={group.label}>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{group.label}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeSteps.map((step) => {
                      const result = activeRun.step_results[step]
                      const isRunning = result?.status === "running" || activeRun.current_step === step
                      const isCompleted = result?.status === "completed"
                      const isFailed = result?.status === "failed"
                      return (
                        <span
                          key={step}
                          className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                            isCompleted ? "bg-green-500/10 text-green-400" :
                            isRunning ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                            isFailed ? "bg-red-500/10 text-red-400" :
                            "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {isCompleted ? "✅" : isRunning ? "⏳" : isFailed ? "❌" : "⬜"}
                          {AGENT_DISPLAY_NAMES[step] ?? step}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activePhase === "development" && (
        <DevelopmentTab
          project={project}
          editMode={editMode}
          editData={editData}
          onEditStart={() => {
            setEditMode(true)
            setEditData({ title: project.title, genre: project.genre, logline: project.logline, idea: project.idea })
          }}
          onEditChange={setEditData}
          onEditSave={saveProject}
          onEditCancel={() => setEditMode(false)}
          onRunScriptWriter={() => runPipeline(["script_writer"])}
          runningPipeline={runningPipeline}
          error={error}
        />
      )}

      {activePhase === "pre-production" && (
        <PreProductionTab
          plan={plan}
          onRunAgent={(agent) => runPipeline([agent])}
          onRunAll={() => runPipeline([...PHASE_PRESETS["pre-production"]])}
          runningPipeline={runningPipeline}
          projectId={id}
        />
      )}

      {activePhase === "production" && (
        <ProductionTab
          plan={plan}
          onRunAgent={(agent) => runPipeline([agent])}
          onRunAll={() => runPipeline([...PHASE_PRESETS.production])}
          runningPipeline={runningPipeline}
          projectId={id}
        />
      )}

      {activePhase === "post-production" && (
        <PostProductionTab
          plan={plan}
          onRunAgent={(agent) => runPipeline([agent])}
          onRunAll={() => runPipeline([...PHASE_PRESETS["post-production"]])}
          runningPipeline={runningPipeline}
          projectId={id}
        />
      )}

      {/* Past Pipeline Runs */}
      {runs.length > 0 && !activeRun && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium text-gray-400">Pipeline History</h3>
          <div className="space-y-2">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[run.status] ?? STATUS_COLORS.DRAFT}`}>{run.status}</span>
                  <span className="text-gray-400">{run.steps.map((s) => AGENT_DISPLAY_NAMES[s] ?? s).join(" → ")}</span>
                </div>
                <span className="text-xs text-gray-500">{run.started_at ? new Date(run.started_at).toLocaleString() : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Development Tab ───

function DevelopmentTab({
  project, editMode, editData, onEditStart, onEditChange, onEditSave, onEditCancel, onRunScriptWriter, runningPipeline, error,
}: {
  project: Project
  editMode: boolean
  editData: { title: string; genre: string; logline: string; idea: string }
  onEditStart: () => void
  onEditChange: (data: { title: string; genre: string; logline: string; idea: string }) => void
  onEditSave: () => void
  onEditCancel: () => void
  onRunScriptWriter: () => void
  runningPipeline: boolean
  error: string | null
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Project Information</h2>
          {!editMode && (
            <button onClick={onEditStart} className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white">
              Edit
            </button>
          )}
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Title</label>
              <input value={editData.title} onChange={(e) => onEditChange({ ...editData, title: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Genre</label>
              <input value={editData.genre} onChange={(e) => onEditChange({ ...editData, genre: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Logline</label>
              <input value={editData.logline} onChange={(e) => onEditChange({ ...editData, logline: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Idea</label>
              <textarea value={editData.idea} onChange={(e) => onEditChange({ ...editData, idea: e.target.value })} rows={4} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={onEditSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button onClick={onEditCancel} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Title:</span> <span>{project.title}</span></div>
            <div><span className="text-gray-500">Genre:</span> <span>{project.genre}</span></div>
            <div><span className="text-gray-500">Logline:</span> <span>{project.logline || "—"}</span></div>
            <div><span className="text-gray-500">Idea:</span> <span>{project.idea || "—"}</span></div>
          </div>
        )}
      </div>

      {/* Screenplay Development Link */}
      <Link
        href={`/projects/${project.id}/screenplay`}
        className="block rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 transition hover:border-purple-500/50 hover:bg-purple-500/10"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h2 className="text-lg font-semibold">Screenplay Development</h2>
            <p className="mt-1 text-sm text-gray-400">
              6-stage workflow: Concept → Characters → Treatment → Draft → Feedback → Direction Plan
            </p>
          </div>
          <span className="ml-auto text-gray-500">→</span>
        </div>
      </Link>

      {/* Direction Plan Status */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-2 text-lg font-semibold">Direction Plan</h2>
        {project.direction_plan_json ? (
          <div>
            <p className="mb-3 text-sm text-green-400">
              ✅ Direction Plan ready — {project.direction_plan_json.scenes?.length ?? 0} scenes
            </p>
            <p className="text-xs text-gray-500">Manage scenes and cuts in the Screenplay Development stage 6 (Direction).</p>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-gray-400">
              Complete screenplay development, then generate the Direction Plan in stage 6 (sequence → scene → cut).
            </p>
            <p className="text-xs text-gray-500">Screenplay → Feedback → Direction stage to generate.</p>
          </div>
        )}
      </div>

      <VersionHistory projectId={project.id} />
    </div>
  )
}

// ─── Phase Header with Run All ───

function PhaseHeader({ label, onRunAll, disabled }: { label: string; onRunAll: () => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-white">{label}</h2>
      <button
        onClick={onRunAll}
        disabled={disabled}
        className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
      >
        {disabled ? "Running..." : `Run All ${label}`}
      </button>
    </div>
  )
}

// ─── Pre-Production Tab ───

function PreProductionTab({
  plan, onRunAgent, onRunAll, runningPipeline, projectId,
}: {
  plan: DirectionPlan | null
  onRunAgent: (agent: string) => void
  onRunAll: () => void
  runningPipeline: boolean
  projectId: string
}) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-16">
        <p className="text-lg text-gray-400">Direction Plan required</p>
        <p className="mt-1 text-sm text-gray-500">Generate a Direction Plan in the Development tab first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PhaseHeader label="Pre-Production" onRunAll={onRunAll} disabled={runningPipeline} />

      {/* Direction Plan Overview */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-1 text-lg font-semibold">Direction Plan</h2>
        <p className="mb-4 text-sm text-gray-500">{plan.scenes.length} scenes | {plan.genre} | {plan.global_audio_concept}</p>

        <div className="space-y-3">
          {plan.scenes.map((scene) => (
            <div key={scene.scene_number} className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">S#{scene.scene_number}</span>
                <span className="text-sm font-medium">{scene.setting}</span>
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{scene.time_of_day}</span>
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">{scene.camera_angle}</span>
              </div>
              <p className="text-sm text-gray-300">{scene.action_description}</p>
              {scene.dialogue && (
                <p className="mt-2 border-l-2 border-yellow-500/50 pl-3 text-sm italic text-yellow-400/80">{scene.dialogue}</p>
              )}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">AI Prompts</summary>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p><span className="font-medium text-gray-400">Image:</span> {scene.image_prompt}</p>
                  <p><span className="font-medium text-gray-400">Video:</span> {scene.video_prompt}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Artist */}
      <AgentCard
        step="Step 1"
        label="Storyboard Generation"
        description="ConceptArtist generates storyboard images for each scene from image_prompt. Styles: Webtoon, Photorealistic, Anime, Noir, Concept Art."
        buttonLabel="Generate Storyboards"
        buttonColor="bg-purple-600"
        onRun={() => onRunAgent("concept_artist")}
        disabled={runningPipeline}
      />

      {/* Casting Director */}
      <AgentCard
        step="Step 2"
        label="Casting Director"
        description="CastingDirector analyzes character descriptions to generate reference sheets for up to 8 characters — front, ¾, and full-body views."
        buttonLabel="Run Casting"
        buttonColor="bg-indigo-600"
        onRun={() => onRunAgent("casting_director")}
        disabled={runningPipeline}
      />

      {/* Location Scout */}
      <AgentCard
        step="Step 3"
        label="Location Scout"
        description="LocationScout extracts unique locations from scene settings and generates environment concept art — backgrounds only, no characters."
        buttonLabel="Scout Locations"
        buttonColor="bg-teal-600"
        onRun={() => onRunAgent("location_scout")}
        disabled={runningPipeline}
      />

      {/* Previsualizer */}
      <AgentCard
        step="Step 4"
        label="Previsualizer"
        description="Previsualizer analyzes camera blocking and movement per scene to produce low-res previz clips (5-8s) for camera movement validation."
        buttonLabel="Generate Previz"
        buttonColor="bg-pink-600"
        onRun={() => onRunAgent("previsualizer")}
        disabled={runningPipeline}
      />

      {/* Storyboard Gallery */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Pre-Production Gallery</h2>
        <AssetGallery projectId={projectId} filter="IMAGE" />
      </div>
    </div>
  )
}

// ─── Production Tab ───

function ProductionTab({
  plan, onRunAgent, onRunAll, runningPipeline, projectId,
}: {
  plan: DirectionPlan | null
  onRunAgent: (agent: string) => void
  onRunAll: () => void
  runningPipeline: boolean
  projectId: string
}) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-16">
        <p className="text-lg text-gray-400">Pre-Production을 먼저 완료하세요</p>
        <p className="mt-1 text-sm text-gray-500">Direction Plan이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PhaseHeader label="Production" onRunAll={onRunAll} disabled={runningPipeline} />

      {/* Batch Production */}
      <BatchMonitor projectId={projectId} />

      {/* Cinematographer */}
      <AgentCard
        step="Step 1"
        label="Cinematography Enhancement"
        description="Cinematographer enhances each scene's video_prompt from a professional DP perspective — lens choice, lighting design, camera movement, and color palette details."
        buttonLabel="Enhance Video Prompts"
        buttonColor="bg-blue-600"
        onRun={() => onRunAgent("cinematographer")}
        disabled={runningPipeline}
      />

      {/* Generalist */}
      <AgentCard
        step="Step 2"
        label="AI Video Generation"
        description="Generalist generates 8-second AI video clips per scene via Veo 3.0 using each scene's video_prompt."
        buttonLabel="Generate Scene Videos"
        buttonColor="bg-green-600"
        onRun={() => onRunAgent("generalist")}
        disabled={runningPipeline}
      />

      {/* Asset Designer */}
      <AgentCard
        step="Step 3"
        label="Asset Design"
        description="AssetDesigner analyzes the worldview and scenes to generate concept art turnaround sheets and spec documents for 3D assets (props, vehicles, furniture, architecture)."
        buttonLabel="Design Assets"
        buttonColor="bg-amber-600"
        onRun={() => onRunAgent("asset_designer")}
        disabled={runningPipeline}
      />

      {/* Video Gallery */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Generated Videos</h2>
        <AssetGallery projectId={projectId} filter="VIDEO" />
      </div>
    </div>
  )
}

// ─── Post-Production Tab ───

function PostProductionTab({
  plan, onRunAgent, onRunAll, runningPipeline, projectId,
}: {
  plan: DirectionPlan | null
  onRunAgent: (agent: string) => void
  onRunAll: () => void
  runningPipeline: boolean
  projectId: string
}) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-16">
        <p className="text-lg text-gray-400">Complete Production first</p>
      </div>
    )
  }

  const dialogueScenes = plan.scenes.filter((s) => s.dialogue)

  return (
    <div className="space-y-6">
      <PhaseHeader label="Post-Production" onRunAll={onRunAll} disabled={runningPipeline} />

      {/* VFX Compositor */}
      <AgentCard
        step="Step 1"
        label="VFX Compositing"
        description="VFXCompositor analyzes scene keywords and applies VFX presets (hologram, dream blur, rain, explosion shake, surveillance camera) via FFMPEG filter chains."
        buttonLabel="Apply VFX"
        buttonColor="bg-cyan-600"
        onRun={() => onRunAgent("vfx_compositor")}
        disabled={runningPipeline}
      />

      {/* Sound Designer */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-400">Step 2</span>
          <h2 className="text-lg font-semibold">Sound Design & TTS</h2>
        </div>
        <p className="mb-4 text-sm text-gray-400">
          SoundDesigner generates dialogue audio for each scene via Gemini TTS.
          {dialogueScenes.length > 0
            ? ` ${dialogueScenes.length} scene${dialogueScenes.length > 1 ? "s" : ""} have dialogue.`
            : " (No scenes with dialogue)"}
        </p>
        <button
          onClick={() => onRunAgent("sound_designer")}
          disabled={runningPipeline || dialogueScenes.length === 0}
          className="rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-700 disabled:opacity-50"
        >
          {runningPipeline ? "Generating..." : "Generate Dialogue Audio"}
        </button>
      </div>

      {/* Composer */}
      <AgentCard
        step="Step 3"
        label="Score Composition"
        description="Composer groups scenes by mood (2-5 scenes) and generates background music via Suno API. Genre, atmosphere, instruments, tempo, and dynamics are determined automatically."
        buttonLabel="Compose Score"
        buttonColor="bg-pink-600"
        onRun={() => onRunAgent("composer")}
        disabled={runningPipeline}
      />

      {/* Master Editor */}
      <AgentCard
        step="Step 4"
        label="Master Edit"
        description="MasterEditor merges individual scene clips into a single master video using FFMPEG libx264 encoding."
        buttonLabel="Merge Videos"
        buttonColor="bg-orange-600"
        onRun={() => onRunAgent("master_editor")}
        disabled={runningPipeline}
      />

      {/* Colorist */}
      <AgentCard
        step="Step 5"
        label="Color Grading"
        description="Colorist analyzes genre and mood to apply a color preset: Cinematic Warm, Noir Cold, Neon Cyberpunk, Natural, or Vintage."
        buttonLabel="Color Grade"
        buttonColor="bg-amber-600"
        onRun={() => onRunAgent("colorist")}
        disabled={runningPipeline}
      />

      {/* Mixing Engineer */}
      <AgentCard
        step="Step 6"
        label="Final Audio Mix"
        description="MixingEngineer blends dialogue, score, and source audio at optimal levels (dialogue 0.5, BGM 0.15, source 0.08) to produce the final 3-channel mix."
        buttonLabel="Mix Audio"
        buttonColor="bg-emerald-600"
        onRun={() => onRunAgent("mixing_engineer")}
        disabled={runningPipeline}
      />

      {/* Assets Gallery */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Generated Assets</h2>
        <AssetGallery projectId={projectId} />
      </div>
    </div>
  )
}
