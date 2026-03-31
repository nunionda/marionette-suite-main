"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AGENT_DISPLAY_NAMES } from "../../lib/constants"
import { API_BASE } from "../../lib/api"

// ─── 14-Agent Pipeline Order ───

type AgentPhase = "pre-production" | "production" | "post-production"
type AgentStatus = "idle" | "running" | "completed" | "error"

interface AgentDef {
  key: string
  phase: AgentPhase
}

const PIPELINE_AGENTS: AgentDef[] = [
  // Pre-production
  { key: "script_writer", phase: "pre-production" },
  { key: "scripter", phase: "pre-production" },
  { key: "concept_artist", phase: "pre-production" },
  { key: "previsualizer", phase: "pre-production" },
  { key: "casting_director", phase: "pre-production" },
  { key: "location_scout", phase: "pre-production" },
  // Production
  { key: "cinematographer", phase: "production" },
  { key: "generalist", phase: "production" },
  { key: "asset_designer", phase: "production" },
  // Post-production
  { key: "colorist", phase: "post-production" },
  { key: "mixing_engineer", phase: "post-production" },
  { key: "sound_designer", phase: "post-production" },
  { key: "master_editor", phase: "post-production" },
  { key: "vfx_compositor", phase: "post-production" },
]

const PHASE_LABELS: Record<AgentPhase, string> = {
  "pre-production": "Pre-Production",
  production: "Production",
  "post-production": "Post-Production",
}

const PHASE_COLORS: Record<AgentPhase, string> = {
  "pre-production": "#A855F7",
  production: "#3B82F6",
  "post-production": "#F59E0B",
}

interface AgentState {
  status: AgentStatus
  progress: number
  message: string
}

interface WSMessage {
  type: string
  runId: string
  agent: string
  status: string
  progress: number
  message: string
  timestamp: string
}

// ─── Component ───

interface PipelineProgressBarProps {
  projectId: string
  runId: string | null
}

export function PipelineProgressBar({ projectId, runId }: PipelineProgressBarProps) {
  const [agents, setAgents] = useState<Record<string, AgentState>>({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const maxRetries = 3
  const retryDelay = 2000

  const connect = useCallback(() => {
    if (!runId) return

    const wsBase = API_BASE.replace(/^http/, "ws")
    const ws = new WebSocket(`${wsBase}/api/pipeline/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      retriesRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        if (msg.type !== "agent_progress" || msg.runId !== runId) return

        setAgents((prev) => ({
          ...prev,
          [msg.agent]: {
            status: (msg.status as AgentStatus) || "idle",
            progress: msg.progress ?? 0,
            message: msg.message ?? "",
          },
        }))
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
      if (retriesRef.current < maxRetries) {
        retriesRef.current++
        setTimeout(connect, retryDelay * retriesRef.current)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [runId])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])

  if (!runId) return null

  // Compute overall progress
  const completedCount = PIPELINE_AGENTS.filter(
    (a) => agents[a.key]?.status === "completed",
  ).length
  const overallPct = Math.round((completedCount / PIPELINE_AGENTS.length) * 100)

  // Group by phase
  const phases: AgentPhase[] = ["pre-production", "production", "post-production"]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: connected ? "#00FF41" : "#C0392B",
              animation: connected ? "ppb-pulse 1.4s ease-in-out infinite" : "none",
            }}
          />
          <span
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "#F0F0F0" }}
          >
            Pipeline Progress
          </span>
        </div>
        <span
          className="text-[11px] font-medium tabular-nums"
          style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "#707070" }}
        >
          {overallPct}% — {completedCount}/{PIPELINE_AGENTS.length} agents
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${overallPct}%`,
            background: "linear-gradient(90deg, #A855F7, #3B82F6, #F59E0B)",
          }}
        />
      </div>

      {/* Phase groups */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const phaseAgents = PIPELINE_AGENTS.filter((a) => a.phase === phase)
          return (
            <div key={phase}>
              <span
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest"
                style={{ color: PHASE_COLORS[phase] }}
              >
                {PHASE_LABELS[phase]}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {phaseAgents.map((agent) => {
                  const state = agents[agent.key]
                  const status = state?.status ?? "idle"
                  return (
                    <AgentCard
                      key={agent.key}
                      name={AGENT_DISPLAY_NAMES[agent.key] ?? agent.key}
                      status={status}
                      progress={state?.progress ?? 0}
                      message={state?.message ?? ""}
                      phaseColor={PHASE_COLORS[agent.phase]}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes ppb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes ppb-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ppb-border-pulse {
          0%, 100% { border-color: rgba(59,130,246,0.4); }
          50% { border-color: rgba(59,130,246,0.8); }
        }
      `}</style>
    </div>
  )
}

// ─── Agent Card ───

const STATUS_ICON: Record<AgentStatus, string> = {
  idle: "⚪",
  running: "🔵",
  completed: "✅",
  error: "❌",
}

function AgentCard({
  name,
  status,
  progress,
  message,
  phaseColor,
}: {
  name: string
  status: AgentStatus
  progress: number
  message: string
  phaseColor: string
}) {
  const isRunning = status === "running"
  const isError = status === "error"
  const isCompleted = status === "completed"

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg border p-3 transition-all"
      style={{
        background: isRunning
          ? "rgba(59,130,246,0.06)"
          : isError
            ? "rgba(192,57,43,0.06)"
            : isCompleted
              ? "rgba(72,72,72,0.08)"
              : "transparent",
        borderColor: isRunning
          ? "rgba(59,130,246,0.4)"
          : isError
            ? "rgba(192,57,43,0.35)"
            : isCompleted
              ? "rgba(72,72,72,0.25)"
              : "#1E1E1E",
        animation: isRunning ? "ppb-border-pulse 2s ease-in-out infinite" : "none",
      }}
    >
      {/* Top row: icon + name */}
      <div className="flex items-center gap-1.5">
        {isRunning ? (
          <span
            className="inline-block h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent"
            style={{ animation: "ppb-spin 0.8s linear infinite" }}
          />
        ) : (
          <span className="text-xs leading-none">{STATUS_ICON[status]}</span>
        )}
        <span
          className="truncate text-[10px] font-medium uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-geist-mono, monospace)",
            color: isRunning ? "#60A5FA" : isError ? "#C0392B" : isCompleted ? "#F0F0F0" : "#707070",
          }}
        >
          {name}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: isError ? "#C0392B" : isRunning ? "#3B82F6" : isCompleted ? phaseColor : "#505050",
          }}
        />
      </div>

      {/* Message or progress % */}
      {message && isRunning ? (
        <span
          className="truncate text-[9px]"
          style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "#505050" }}
          title={message}
        >
          {message}
        </span>
      ) : (
        <span
          className="text-[9px]"
          style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "#505050" }}
        >
          {progress}%
        </span>
      )}
    </div>
  )
}
