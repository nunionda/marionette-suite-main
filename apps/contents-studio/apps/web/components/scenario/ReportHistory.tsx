"use client"

import { useCallback, useEffect, useState } from "react"
import { SkeletonRow } from "../ui/Skeleton"

// ─── Types ───

interface ReportSummary {
  scriptId: string
  summary?: { protagonist: string; predictedRating: string; predictedRoi: string }
  coverage?: { genre: string; logline: string }
  features?: { sceneCount: number }
}

interface ReportsResponse {
  data: ReportSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ReportHistoryProps {
  onSelectReport?: (scriptId: string) => void
}

// ─── Component ───

export function ReportHistory({ onSelectReport }: ReportHistoryProps) {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/scenario/reports?page=${p}&pageSize=10`)
      const data: ReportsResponse = await res.json()
      if (!res.ok) throw new Error("Failed to load reports")
      setReports(data.data ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotal(data.total ?? 0)
      setPage(data.page ?? p)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports(1)
  }, [fetchReports])

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            Report <span className="text-white">History</span>
          </h2>
          {!loading && total > 0 && (
            <p className="text-[10px] text-gray-600">{total} reports total</p>
          )}
        </div>
        <button
          onClick={() => fetchReports(page)}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition hover:text-white"
        >
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-sm font-medium">No analysis reports yet</p>
          <p className="mt-1 text-xs text-gray-600">Upload a script above to create your first report</p>
        </div>
      )}

      {/* Report list */}
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.scriptId}
              onClick={() => onSelectReport?.(report.scriptId)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-3 text-left transition hover:bg-gray-800/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white truncate">{report.scriptId}</span>
                  {report.coverage?.genre && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">
                      {report.coverage.genre}
                    </span>
                  )}
                </div>
                {report.coverage?.logline && (
                  <p className="mt-1 truncate text-[11px] text-gray-500">{report.coverage.logline}</p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-3 shrink-0">
                {report.features?.sceneCount != null && (
                  <span className="text-[10px] text-gray-600">{report.features.sceneCount} scenes</span>
                )}
                {report.summary?.predictedRating && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                    {report.summary.predictedRating}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchReports(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchReports(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
