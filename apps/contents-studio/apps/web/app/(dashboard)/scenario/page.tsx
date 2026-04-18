"use client"

import { useCallback, useState } from "react"
import { ScriptAnalysis } from "../../../components/scenario/ScriptAnalysis"
import { ReportHistory } from "../../../components/scenario/ReportHistory"
import { DraftComparison } from "../../../components/scenario/DraftComparison"

type Tab = "analysis" | "history" | "comparison"

const TABS: { key: Tab; label: string }[] = [
  { key: "analysis", label: "Script Analysis" },
  { key: "history", label: "Report History" },
  { key: "comparison", label: "Draft Comparison" },
]

export default function ScenarioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("analysis")
  const [loadReportId, setLoadReportId] = useState<string | null>(null)

  const handleSelectReport = useCallback((scriptId: string) => {
    setLoadReportId(scriptId)
    setActiveTab("analysis")
  }, [])

  const handleReportLoaded = useCallback(() => {
    setLoadReportId(null)
  }, [])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          Scenario <span className="text-blue-500">Analysis</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-medium">
          Screenplay analysis pipeline &mdash; 7-engine deep analysis, report history, and draft comparison
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === tab.key
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "analysis" && (
        <ScriptAnalysis loadReportId={loadReportId} onReportLoaded={handleReportLoaded} />
      )}
      {activeTab === "history" && <ReportHistory onSelectReport={handleSelectReport} />}
      {activeTab === "comparison" && <DraftComparison />}
    </div>
  )
}
