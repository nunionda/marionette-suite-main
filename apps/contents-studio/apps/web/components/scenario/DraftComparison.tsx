"use client"

import { useCallback, useState } from "react"

// ─── Types ───

interface ComparisonDiffs {
  beatSheet: { added: string[]; removed: string[]; modified: string[] }
  emotions: { shifts: string[] }
  rating: { old: string; new: string; changed: boolean }
  roi: { old: string; new: string; delta: number }
  coverage: { scoreDeltas: Record<string, number> }
  tropes: { added: string[]; removed: string[] }
}

interface ComparisonResult {
  oldScriptId: string
  newScriptId: string
  diffs: ComparisonDiffs
  summary: string
  error?: string
}

// ─── Component ───

export function DraftComparison() {
  const [oldScriptId, setOldScriptId] = useState("")
  const [newScriptId, setNewScriptId] = useState("")
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = useCallback(async () => {
    if (!oldScriptId.trim() || !newScriptId.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/scenario/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldScriptId: oldScriptId.trim(), newScriptId: newScriptId.trim() }),
      })
      const data: ComparisonResult = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [oldScriptId, newScriptId])

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <h2 className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
        Draft <span className="text-white">Comparison</span>
      </h2>
      <p className="mb-6 text-xs text-gray-600">Compare two analysis reports to see how a script evolved</p>

      {/* Input */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Old Script ID</label>
          <input
            type="text"
            value={oldScriptId}
            onChange={(e) => setOldScriptId(e.target.value)}
            placeholder="e.g. script_v001"
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">New Script ID</label>
          <input
            type="text"
            value={newScriptId}
            onChange={(e) => setNewScriptId(e.target.value)}
            placeholder="e.g. script_v002"
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading || !oldScriptId.trim() || !newScriptId.trim()}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Comparing..." : "Compare Drafts"}
      </button>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center justify-center py-8">
          <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          <span className="text-sm text-gray-400">Comparing analyses...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="mt-6 space-y-5">
          {/* Summary */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/20 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Summary</p>
            <p className="text-sm text-gray-300">{result.summary}</p>
          </div>

          {/* Rating change */}
          {result.diffs.rating.changed && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/20 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Rating</p>
                <p className="text-sm text-gray-400">{result.diffs.rating.old}</p>
              </div>
              <span className="text-gray-600">&rarr;</span>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">New</p>
                <p className="text-sm text-white">{result.diffs.rating.new}</p>
              </div>
            </div>
          )}

          {/* ROI change */}
          {result.diffs.roi.delta !== 0 && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/20 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">ROI</p>
                <p className="text-sm text-gray-400">{result.diffs.roi.old}</p>
              </div>
              <span className="text-gray-600">&rarr;</span>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">New</p>
                <p className="text-sm text-white">{result.diffs.roi.new}</p>
              </div>
              <span className={`ml-auto text-xs font-bold ${result.diffs.roi.delta > 0 ? "text-green-400" : "text-red-400"}`}>
                {result.diffs.roi.delta > 0 ? "+" : ""}{result.diffs.roi.delta}
              </span>
            </div>
          )}

          {/* Beat sheet changes */}
          {(result.diffs.beatSheet.added.length > 0 || result.diffs.beatSheet.removed.length > 0 || result.diffs.beatSheet.modified.length > 0) && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Beat Sheet Changes</p>
              <div className="space-y-1">
                {result.diffs.beatSheet.added.map((b, i) => (
                  <p key={`a${i}`} className="text-xs text-green-400">+ {b}</p>
                ))}
                {result.diffs.beatSheet.removed.map((b, i) => (
                  <p key={`r${i}`} className="text-xs text-red-400">- {b}</p>
                ))}
                {result.diffs.beatSheet.modified.map((b, i) => (
                  <p key={`m${i}`} className="text-xs text-yellow-400">~ {b}</p>
                ))}
              </div>
            </div>
          )}

          {/* Trope changes */}
          {(result.diffs.tropes.added.length > 0 || result.diffs.tropes.removed.length > 0) && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Trope Changes</p>
              <div className="flex flex-wrap gap-2">
                {result.diffs.tropes.added.map((t, i) => (
                  <span key={`a${i}`} className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    + {t}
                  </span>
                ))}
                {result.diffs.tropes.removed.map((t, i) => (
                  <span key={`r${i}`} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400">
                    - {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emotion shifts */}
          {result.diffs.emotions.shifts.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Emotion Shifts</p>
              <ul className="space-y-1">
                {result.diffs.emotions.shifts.map((s, i) => (
                  <li key={i} className="text-xs text-gray-400">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
