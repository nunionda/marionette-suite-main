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

const PHASE_ACCENT: Record<string, string> = {
  PRE: "#00FF41",
  MAIN: "#F59E0B",
  POST: "#707070",
}

const monoStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono, monospace)",
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
      <div>
        <div
          className="mb-8 h-5 w-24 animate-pulse rounded"
          style={{ background: "#1E1E1E" }}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1
        className="mb-8 text-2xl uppercase tracking-tight"
        style={{ fontFamily: "var(--font-anton, serif)", color: "var(--color-white, #F0F0F0)" }}
      >
        AI Agents
      </h1>

      {(["PRE", "MAIN", "POST"] as const).map((phase) => {
        const accent = PHASE_ACCENT[phase] ?? "#707070"
        const phaseAgents = grouped[phase] ?? []
        if (phaseAgents.length === 0) return null

        return (
          <div key={phase} className="mb-10">
            {/* Phase header */}
            <div className="mb-4 flex items-center gap-3">
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: accent,
                  flexShrink: 0,
                }}
              />
              <h2
                className="text-[11px] uppercase tracking-widest"
                style={{ ...monoStyle, color: accent }}
              >
                {PHASE_LABELS[phase]}
              </h2>
              <div
                className="h-px flex-1"
                style={{ background: "var(--color-border, #1E1E1E)" }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {phaseAgents.map((agent) => (
                <div
                  key={agent.name}
                  style={{
                    border: `1px solid ${agent.enabled ? "rgba(0,255,65,0.15)" : "var(--color-border, #1E1E1E)"}`,
                    borderRadius: 2,
                    padding: 16,
                    background: agent.enabled ? "rgba(0,255,65,0.03)" : "transparent",
                  }}
                >
                  {/* Agent name + toggle */}
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className="text-[11px] font-medium uppercase tracking-wider"
                      style={{ ...monoStyle, color: "var(--color-white, #F0F0F0)" }}
                    >
                      {agent.name}
                    </span>
                    <button
                      onClick={() => toggleAgent(agent.name, agent.enabled)}
                      style={{
                        borderRadius: 2,
                        padding: "2px 8px",
                        fontSize: 10,
                        fontFamily: "var(--font-geist-mono, monospace)",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                        border: `1px solid ${agent.enabled ? "rgba(0,255,65,0.3)" : "var(--color-border, #1E1E1E)"}`,
                        background: agent.enabled ? "rgba(0,255,65,0.08)" : "transparent",
                        color: agent.enabled ? "#00FF41" : "var(--color-subtle, #505050)",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {agent.enabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {[agent.provider, agent.model].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          ...monoStyle,
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 2,
                          border: "1px solid var(--color-border, #1E1E1E)",
                          color: "var(--color-muted, #707070)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
