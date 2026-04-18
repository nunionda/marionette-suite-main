"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../../lib/api"

interface ScenePrompt {
  scene_number: number
  original_prompt: string
  enhanced_prompt: string
  lens: string | null
  movement: string | null
  lighting: string | null
}

interface CinematographerResponse {
  status: string
  scenes: ScenePrompt[]
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="h-4 w-1/4 rounded bg-gray-800" />
          <div className="mt-3 h-3 w-full rounded bg-gray-800" />
          <div className="mt-2 h-3 w-5/6 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleCopy()
      }}
      className="rounded border border-gray-700 px-2 py-1 text-[10px] text-gray-400 transition hover:border-gray-600 hover:text-white"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function SceneAccordion({ scene }: { scene: ScenePrompt }) {
  const [open, setOpen] = useState(false)
  const tags = [
    scene.lens && { label: scene.lens, color: "bg-cyan-500/15 text-cyan-400" },
    scene.movement && { label: scene.movement, color: "bg-green-500/15 text-green-400" },
    scene.lighting && { label: scene.lighting, color: "bg-amber-500/15 text-amber-400" },
  ].filter(Boolean) as { label: string; color: string }[]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
            S#{scene.scene_number}
          </span>
          <span className="text-sm font-medium text-white">Scene {scene.scene_number}</span>
          {tags.length > 0 && (
            <div className="hidden gap-1.5 sm:flex">
              {tags.map((tag) => (
                <span key={tag.label} className={`rounded px-1.5 py-0.5 text-[10px] ${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4">
          {/* Tags on mobile */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5 sm:hidden">
              {tags.map((tag) => (
                <span key={tag.label} className={`rounded px-1.5 py-0.5 text-[10px] ${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Original prompt */}
          <div className="mb-3">
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-gray-600">Original</span>
            <p className="text-xs leading-relaxed text-gray-500 line-through decoration-gray-700">
              {scene.original_prompt}
            </p>
          </div>

          {/* Enhanced prompt */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-green-600">Enhanced</span>
              <CopyButton text={scene.enhanced_prompt} />
            </div>
            <p className="text-xs leading-relaxed text-green-300">
              {scene.enhanced_prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function PromptPreview({ projectId }: { projectId: string }) {
  const [scenes, setScenes] = useState<ScenePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAPI<CinematographerResponse>(`/api/projects/${projectId}/agents/cinematographer`)
      .then((data) => {
        setScenes(data.scenes ?? [])
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Cinematography Prompts</h2>

      {loading && <LoadingSkeleton />}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={fetchData}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && scenes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-950 py-12">
          <span className="mb-2 text-3xl text-gray-700">🎥</span>
          <p className="text-sm text-gray-500">Cinematographer agent has not run yet</p>
        </div>
      )}

      {!loading && !error && scenes.length > 0 && (
        <div className="space-y-3">
          {scenes.map((scene) => (
            <SceneAccordion key={scene.scene_number} scene={scene} />
          ))}
        </div>
      )}
    </div>
  )
}
