"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../lib/api"

interface Snapshot {
  id: string
  type: string
  version: number
  label: string | null
  createdAt: string
}

interface VersionHistoryProps {
  projectId: string
}

type FilterTab = "all" | "DIRECTION_PLAN" | "SCREENPLAY_OUTLINE" | "SCREENPLAY_DRAFT" | "SCREENPLAY_CHARACTERS"

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Direction Plan", value: "DIRECTION_PLAN" },
  { label: "Outline", value: "SCREENPLAY_OUTLINE" },
  { label: "Draft", value: "SCREENPLAY_DRAFT" },
  { label: "Characters", value: "SCREENPLAY_CHARACTERS" },
]

const TYPE_BADGE_COLORS: Record<string, string> = {
  DIRECTION_PLAN: "bg-blue-500/20 text-blue-400",
  SCREENPLAY_OUTLINE: "bg-purple-500/20 text-purple-400",
  SCREENPLAY_DRAFT: "bg-amber-500/20 text-amber-400",
  SCREENPLAY_CHARACTERS: "bg-emerald-500/20 text-emerald-400",
}

const TYPE_LABELS: Record<string, string> = {
  DIRECTION_PLAN: "Direction Plan",
  SCREENPLAY_OUTLINE: "Outline",
  SCREENPLAY_DRAFT: "Draft",
  SCREENPLAY_CHARACTERS: "Characters",
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 border-b border-gray-800 px-4 py-3"
        >
          <div className="h-5 w-24 rounded-full bg-gray-800" />
          <div className="h-4 w-8 rounded bg-gray-800" />
          <div className="h-4 flex-1 rounded bg-gray-800" />
          <div className="h-4 w-16 rounded bg-gray-800" />
          <div className="h-6 w-16 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  )
}

function SnapshotRow({
  snapshot,
  projectId,
  onRestored,
}: {
  snapshot: Snapshot
  projectId: string
  onRestored: () => void
}) {
  const [restoring, setRestoring] = useState(false)
  const [restored, setRestored] = useState(false)

  const badgeColor = TYPE_BADGE_COLORS[snapshot.type] ?? "bg-gray-500/20 text-gray-400"
  const typeLabel = TYPE_LABELS[snapshot.type] ?? snapshot.type

  function handleRestore() {
    const confirmed = window.confirm(
      `Restore ${typeLabel} v${snapshot.version}? This will replace the current version.`
    )
    if (!confirmed) return

    setRestoring(true)
    fetchAPI<{ restored: boolean; type: string; version: number }>(
      `/api/snapshots/${projectId}/${snapshot.id}/restore`,
      { method: "POST" }
    )
      .then(() => {
        setRestored(true)
        setTimeout(() => {
          onRestored()
        }, 800)
      })
      .catch((err: Error) => {
        alert(`Restore failed: ${err.message}`)
        setRestoring(false)
      })
  }

  return (
    <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3 hover:bg-gray-800/30">
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColor}`}
      >
        {typeLabel}
      </span>

      <span className="shrink-0 text-xs font-mono text-gray-400">
        v{snapshot.version}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
        {snapshot.label ? (
          <em className="text-gray-400 not-italic italic">{snapshot.label}</em>
        ) : null}
      </span>

      <span className="shrink-0 text-xs text-gray-600" title={snapshot.createdAt}>
        {timeAgo(snapshot.createdAt)}
      </span>

      <button
        type="button"
        onClick={handleRestore}
        disabled={restoring || restored}
        className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
          restored
            ? "bg-emerald-500/20 text-emerald-400"
            : restoring
            ? "cursor-not-allowed bg-gray-800 text-gray-500"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        {restored ? "Restored!" : restoring ? "Restoring…" : "Restore"}
      </button>
    </div>
  )
}

export function VersionHistory({ projectId }: VersionHistoryProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")

  const fetchSnapshots = useCallback(() => {
    setLoading(true)
    fetchAPI<{ snapshots: Snapshot[] }>(`/api/snapshots/${projectId}`)
      .then((data) => {
        setSnapshots(data.snapshots ?? [])
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

  const filteredSnapshots =
    activeFilter === "all"
      ? snapshots
      : snapshots.filter((s) => s.type === activeFilter)

  // Reverse chronological order
  const sortedSnapshots = [...filteredSnapshots].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  function handleRestored() {
    window.location.reload()
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-800 p-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.value
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Empty state */}
      {!loading && sortedSnapshots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-3 h-10 w-10 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-500">No version history yet</p>
        </div>
      )}

      {/* Snapshot list */}
      {!loading && sortedSnapshots.length > 0 && (
        <div>
          {sortedSnapshots.map((snapshot) => (
            <SnapshotRow
              key={snapshot.id}
              snapshot={snapshot}
              projectId={projectId}
              onRestored={handleRestored}
            />
          ))}
        </div>
      )}
    </div>
  )
}
