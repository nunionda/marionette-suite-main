"use client"

import { useState, useEffect } from "react"
import { fetchAPI } from "../../../lib/api"
import { SkeletonCard } from "../../../components/ui/Skeleton"

interface AgentConfig {
  name: string
  phase: string
  provider: string
  model: string
  enabled: boolean
}

const PHASE_LABELS: Record<string, string> = {
  PRE: "Pre-Production",
  MAIN: "Main Production",
  POST: "Post-Production",
}

const PHASE_COLORS: Record<string, string> = {
  PRE: "bg-blue-500/20 text-blue-400",
  MAIN: "bg-green-500/20 text-green-400",
  POST: "bg-purple-500/20 text-purple-400",
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPI<{ agents: AgentConfig[] }>("/api/agents")
      .then((data) => setAgents(data.agents))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleAgent = async (name: string, enabled: boolean) => {
    try {
      await fetchAPI(`/api/agents/${name}/config`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !enabled }),
      })
      setAgents((prev) =>
        prev.map((a) => (a.name === name ? { ...a, enabled: !enabled } : a)),
      )
    } catch (err) {
      console.error("Failed to toggle agent:", err)
    }
  }

  const grouped = agents.reduce<Record<string, AgentConfig[]>>((acc, agent) => {
    const phase = agent.phase.toUpperCase()
    if (!acc[phase]) acc[phase] = []
    acc[phase]!.push(agent)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-gray-800" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">AI Agents</h1>

      {(["PRE", "MAIN", "POST"] as const).map((phase) => (
        <div key={phase} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-300">
            {PHASE_LABELS[phase]}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(grouped[phase] ?? []).map((agent) => (
              <div
                key={agent.name}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-white">{agent.name}</span>
                  <button
                    onClick={() => toggleAgent(agent.name, agent.enabled)}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      agent.enabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {agent.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded px-2 py-0.5 ${PHASE_COLORS[phase] ?? "bg-gray-800 text-gray-400"}`}>
                    {PHASE_LABELS[phase]}
                  </span>
                  <span className="rounded bg-gray-800 px-2 py-0.5 text-gray-400">
                    {agent.provider}
                  </span>
                  <span className="rounded bg-gray-800 px-2 py-0.5 text-gray-400">
                    {agent.model}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
