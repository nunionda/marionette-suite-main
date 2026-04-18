"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../lib/api"
import { STATUS_ICONS, STATUS_LABELS } from "../lib/constants"
import { SkeletonCard } from "./ui/Skeleton"

// ─── Types ───

interface CutTask {
  id: string
  cutNumber: number
  status: string
  currentStep: string | null
  steps: string[]
  stepResults: Record<string, { status: string; message?: string }>
  attempt: number
  errorMessage: string | null
}

interface SceneTask {
  id: string
  sceneNumber: number
  status: string
  currentStep: string | null
  stepResults: Record<string, { status: string; message?: string }>
  attempt: number
  errorMessage: string | null
  cutTasks: CutTask[]
}

interface BatchRun {
  id: string
  status: string
  totalScenes: number
  completedScenes: number
  progress: number
  errorMessage: string | null
  sceneTasks: SceneTask[]
  createdAt: string
}

// ─── Status helpers ───

function statusIcon(status: string): string {
  return STATUS_ICONS[status] ?? "❓"
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

// ─── Component ───

export function BatchMonitor({ projectId }: { projectId: string }) {
  const [batchRun, setBatchRun] = useState<BatchRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set())

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetchAPI<{ batchRuns: BatchRun[] }>(`/batch/${projectId}/runs`)
      const runs = res.batchRuns
      setBatchRun(runs.length > 0 ? runs[0]! : null)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLatest()
    const interval = setInterval(fetchLatest, 3000)
    return () => clearInterval(interval)
  }, [fetchLatest])

  // Auto-expand running/failed scenes
  useEffect(() => {
    if (!batchRun) return
    const autoExpand = new Set<number>()
    for (const st of batchRun.sceneTasks) {
      if (st.status === "RUNNING" || st.status === "FAILED") {
        autoExpand.add(st.sceneNumber)
      }
    }
    setExpandedScenes((prev) => new Set([...prev, ...autoExpand]))
  }, [batchRun])

  const startBatch = async () => {
    try {
      await fetchAPI(`/batch/${projectId}/run`, { method: "POST" })
      await fetchLatest()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start batch")
    }
  }

  const cancelBatch = async () => {
    if (!batchRun || !window.confirm("Cancel the batch run?")) return
    try {
      await fetchAPI(`/batch/${batchRun.id}/cancel`, { method: "POST" })
      await fetchLatest()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel")
    }
  }

  const regenerateScene = async (sceneNumber: number) => {
    if (!batchRun || !window.confirm(`Regenerate scene ${sceneNumber}?`)) return
    try {
      await fetchAPI(`/batch/${batchRun.id}/scene/${sceneNumber}/regenerate`, { method: "POST" })
      await fetchLatest()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate")
    }
  }

  const regenerateCut = async (sceneNumber: number, cutNumber: number) => {
    if (!batchRun || !window.confirm(`Regenerate scene ${sceneNumber}, cut ${cutNumber}?`)) return
    try {
      await fetchAPI(`/batch/${batchRun.id}/scene/${sceneNumber}/cut/${cutNumber}/regenerate`, { method: "POST" })
      await fetchLatest()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate cut")
    }
  }

  const rerunFrom = async (sceneNumber: number) => {
    if (!batchRun || !window.confirm(`Rerun from scene ${sceneNumber}?`)) return
    try {
      await fetchAPI(`/batch/${batchRun.id}/rerun-from/${sceneNumber}`, { method: "POST" })
      await fetchLatest()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to rerun")
    }
  }

  const toggleScene = (sceneNumber: number) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev)
      if (next.has(sceneNumber)) next.delete(sceneNumber)
      else next.add(sceneNumber)
      return next
    })
  }

  const isRunning = batchRun?.status === "RUNNING"

  if (loading) {
    return <SkeletonCard />
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Batch Production</h2>
        <div className="flex gap-2">
          {!isRunning && (
            <button
              onClick={startBatch}
              className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium transition hover:bg-green-500"
            >
              Run
            </button>
          )}
          {isRunning && (
            <button
              onClick={cancelBatch}
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium transition hover:bg-red-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {batchRun && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm text-gray-400">
            <span>{statusLabel(batchRun.status)}</span>
            <span>{Math.round(batchRun.progress)}% ({batchRun.completedScenes}/{batchRun.totalScenes} scenes)</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${batchRun.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Scene list */}
      {batchRun && batchRun.sceneTasks.length > 0 && (
        <div className="space-y-1">
          {batchRun.sceneTasks.map((scene) => {
            const expanded = expandedScenes.has(scene.sceneNumber)
            const completedCuts = scene.cutTasks.filter((c) => c.status === "COMPLETED").length
            const totalCuts = scene.cutTasks.length

            return (
              <div key={scene.id}>
                {/* Scene row */}
                <div
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition hover:bg-gray-800/50"
                  onClick={() => toggleScene(scene.sceneNumber)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-500">{expanded ? "▼" : "▶"}</span>
                    <span>{statusIcon(scene.status)}</span>
                    <span className="font-medium">Scene {scene.sceneNumber}</span>
                    <span className="text-gray-500">
                      ({completedCuts}/{totalCuts} cuts)
                    </span>
                    {scene.attempt > 1 && (
                      <span className="text-xs text-yellow-500">(attempt {scene.attempt})</span>
                    )}
                    {scene.errorMessage && (
                      <span className="text-xs text-red-400">{scene.errorMessage}</span>
                    )}
                  </div>
                  {!isRunning && (scene.status === "COMPLETED" || scene.status === "FAILED") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); void regenerateScene(scene.sceneNumber) }}
                      className="rounded bg-gray-700 px-2 py-0.5 text-xs transition hover:bg-gray-600"
                    >
                      Regenerate
                    </button>
                  )}
                </div>

                {/* Cut list (expanded) */}
                {expanded && (
                  <div className="ml-8 space-y-0.5 pb-1">
                    {scene.cutTasks.map((cut) => (
                      <div key={cut.id} className="flex items-center justify-between rounded px-2 py-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{statusIcon(cut.status)}</span>
                          <span className="text-gray-400">Cut {cut.cutNumber}</span>
                          {cut.status === "RUNNING" && cut.currentStep && (
                            <span className="text-xs text-blue-400">{cut.currentStep}</span>
                          )}
                          {cut.attempt > 1 && (
                            <span className="text-xs text-yellow-500">(attempt {cut.attempt})</span>
                          )}
                          {cut.errorMessage && (
                            <span className="text-xs text-red-400">{cut.errorMessage}</span>
                          )}
                        </div>
                        {!isRunning && cut.status === "FAILED" && (
                          <button
                            onClick={() => void regenerateCut(scene.sceneNumber, cut.cutNumber)}
                            className="rounded bg-gray-700 px-2 py-0.5 text-xs transition hover:bg-gray-600"
                          >
                            Regenerate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Rerun from selector */}
      {batchRun && !isRunning && batchRun.sceneTasks.length > 0 && (
        <div className="mt-4 border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2">
            <select
              id="rerun-from"
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm"
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value
                if (val) void rerunFrom(Number(val))
              }}
            >
              <option value="" disabled>Select scene...</option>
              {batchRun.sceneTasks.map((st) => (
                <option key={st.sceneNumber} value={st.sceneNumber}>
                  Scene {st.sceneNumber}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">rerun from here</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!batchRun && (
        <div className="flex flex-col items-center py-8 text-gray-500">
          <p>No batch runs yet</p>
          <p className="mt-1 text-xs">Press Run to start once a Direction Plan is available</p>
        </div>
      )}
    </div>
  )
}
