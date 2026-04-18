"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ───

type AnalysisState = "idle" | "analyzing" | "complete" | "error"

interface AnalysisResult {
  scriptId: string
  beatSheet: { name: string; description: string; pageRange: [number, number] }[]
  emotionGraph: { sceneIndex: number; dominantEmotion: string; intensity: number; explanation: string }[]
  features: { sceneCount: number; dialogueRatio: number; avgSceneLength: number }
  predictions: {
    rating: { rating: string; reasons: string[]; confidence: number }
    roi: { tier: string; reasoning: string; budgetEstimate: number }
  }
  tropes: string[]
  coverage: {
    genre: string
    logline: string
    synopsis: string
    strengths: string[]
    weaknesses: string[]
    recommendation: string
  }
  summary: { protagonist: string; predictedRating: string; predictedRoi: string }
}

// ─── Component ───

interface ScriptAnalysisProps {
  loadReportId?: string | null
  onReportLoaded?: () => void
}

export function ScriptAnalysis({ loadReportId, onReportLoaded }: ScriptAnalysisProps) {
  const [state, setState] = useState<AnalysisState>("idle")
  const [scriptText, setScriptText] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    if (file.name.endsWith(".pdf")) {
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]
        setScriptText(`__PDF_BASE64__${base64}`)
      }
      reader.readAsDataURL(file)
    } else {
      reader.onload = () => setScriptText(reader.result as string)
      reader.readAsText(file)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!scriptText.trim()) return
    setState("analyzing")
    setError(null)
    setResult(null)

    try {
      const isPdf = scriptText.startsWith("__PDF_BASE64__")
      const body = isPdf
        ? { scriptBase64: scriptText.slice(14), isPdf: true, fileName }
        : { scriptText, fileName }

      const res = await fetch("/api/scenario/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || `Analysis failed (${res.status})`)
      }

      setResult(data as AnalysisResult)
      setState("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("error")
    }
  }, [scriptText, fileName])

  const handleReset = useCallback(() => {
    setState("idle")
    setScriptText("")
    setFileName(null)
    setResult(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ""
  }, [])

  // Load a saved report by ID when requested
  useEffect(() => {
    if (!loadReportId) return
    setState("analyzing")
    setError(null)
    setResult(null)

    fetch(`/api/scenario/reports/${encodeURIComponent(loadReportId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setResult(data as AnalysisResult)
        setState("complete")
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load report")
        setState("error")
      })
      .finally(() => onReportLoaded?.())
  }, [loadReportId, onReportLoaded])

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <h2 className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
        Script <span className="text-white">Analysis</span>
      </h2>
      <p className="mb-6 text-xs text-gray-600">Upload a screenplay to run the full 7-engine analysis pipeline</p>

      {/* Upload state: idle */}
      {state === "idle" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-600 hover:text-white"
            >
              {fileName ? fileName : "Choose File (.fountain, .txt, .pdf)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".fountain,.txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="relative">
            <textarea
              value={scriptText.startsWith("__PDF_BASE64__") ? `[PDF: ${fileName}]` : scriptText}
              onChange={(e) => {
                setScriptText(e.target.value)
                setFileName(null)
              }}
              disabled={scriptText.startsWith("__PDF_BASE64__")}
              placeholder="Or paste screenplay text here..."
              rows={8}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!scriptText.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Analyze Script
          </button>
        </div>
      )}

      {/* Analyzing state */}
      {state === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          <p className="text-sm font-medium text-gray-400">Running 7-engine analysis pipeline...</p>
          <p className="mt-1 text-xs text-gray-600">beatSheet, emotion, rating, ROI, coverage, VFX, trope</p>
        </div>
      )}

      {/* Error state */}
      {state === "error" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
          <button
            onClick={() => setState("idle")}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 transition hover:text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Complete state — results summary */}
      {state === "complete" && result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">Complete</span>
              <span className="text-xs text-gray-500 font-mono">{result.scriptId}</span>
            </div>
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white"
            >
              New Analysis
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Protagonist</p>
              <p className="text-sm text-white">{result.summary.protagonist}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Rating</p>
              <p className="text-sm text-white">{result.predictions.rating.rating}</p>
              <p className="mt-1 text-[10px] text-gray-500">{Math.round(result.predictions.rating.confidence * 100)}% confidence</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">ROI Tier</p>
              <p className="text-sm text-white">{result.predictions.roi.tier}</p>
              <p className="mt-1 text-[10px] text-gray-500">Est. ${(result.predictions.roi.budgetEstimate / 1_000_000).toFixed(1)}M</p>
            </div>
          </div>

          {/* Beat Sheet */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Beat Sheet</h3>
            <div className="space-y-2">
              {result.beatSheet.map((beat, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-3">
                  <span className="mt-0.5 text-[10px] font-mono text-gray-600">{beat.pageRange[0]}-{beat.pageRange[1]}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{beat.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{beat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-3 text-center">
              <p className="text-lg font-bold text-white">{result.features.sceneCount}</p>
              <p className="text-[10px] text-gray-500">Scenes</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-3 text-center">
              <p className="text-lg font-bold text-white">{Math.round(result.features.dialogueRatio * 100)}%</p>
              <p className="text-[10px] text-gray-500">Dialogue</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-3 text-center">
              <p className="text-lg font-bold text-white">{result.features.avgSceneLength.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Avg Scene Length</p>
            </div>
          </div>

          {/* Coverage */}
          {result.coverage && (
            <div>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Coverage</h3>
              <div className="rounded-lg border border-gray-800 bg-gray-800/20 p-4">
                <p className="mb-2 text-xs text-gray-300">{result.coverage.genre} &mdash; {result.coverage.logline}</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10px] font-bold text-green-400/80">Strengths</p>
                    <ul className="space-y-1">
                      {result.coverage.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-400">+ {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold text-red-400/80">Weaknesses</p>
                    <ul className="space-y-1">
                      {result.coverage.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-gray-400">- {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-300">{result.coverage.recommendation}</p>
              </div>
            </div>
          )}

          {/* Tropes */}
          {result.tropes.length > 0 && (
            <div>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Detected Tropes</h3>
              <div className="flex flex-wrap gap-2">
                {result.tropes.map((trope, i) => (
                  <span key={i} className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs text-gray-300">
                    {trope}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
