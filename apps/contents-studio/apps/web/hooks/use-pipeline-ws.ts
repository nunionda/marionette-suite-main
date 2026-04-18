"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { API_BASE } from "../lib/api"

export interface PipelineRun {
  id: string
  projectId: string
  projectTitle: string
  status: string
  currentStep: string
  progress: number
  startedAt: string
  completedAt?: string
}

interface PipelineWSEvent {
  type: string
  runId?: string
  projectId?: string
  projectTitle?: string
  steps?: string[]
  step?: string
  stepIndex?: number
  success?: boolean
  message?: string
  progress?: number
  currentStep?: string
  status?: string
  error?: string
  runs?: Array<{
    runId: string
    projectId: string
    projectTitle: string
    status: string
    currentStep: string | null
    progress: number
    steps: string[]
  }>
}

const MAX_RECONNECT = 5
const RECONNECT_DELAY = 3000
const POLL_INTERVAL = 3000

export function usePipelineWS() {
  const [runs, setRuns] = useState<Map<string, PipelineRun>>(new Map())
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const isMounted = useRef(true)
  const reconnectCount = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const fetchRunsHTTP = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pipeline/runs`)
      if (!res.ok) return
      const data = await res.json()
      const list = data.runs ?? []
      setRuns((prev) => {
        const next = new Map(prev)
        for (const run of list) {
          next.set(run.id, {
            id: run.id,
            projectId: run.project_id ?? run.projectId,
            projectTitle: run.projectTitle ?? run.project_id ?? "",
            status: run.status,
            currentStep: run.current_step ?? run.currentStep ?? "",
            progress: run.progress ?? 0,
            startedAt: run.started_at ?? run.startedAt ?? new Date().toISOString(),
            completedAt: run.completed_at ?? run.completedAt,
          })
        }
        return next
      })
    } catch {
      // ignore fetch errors during polling
    } finally {
      setLoading(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    stopPolling()
    void fetchRunsHTTP()
    pollTimer.current = setInterval(fetchRunsHTTP, POLL_INTERVAL)
  }, [fetchRunsHTTP, stopPolling])

  const handleEvent = useCallback((event: PipelineWSEvent) => {
    setRuns((prev) => {
      const next = new Map(prev)

      switch (event.type) {
        case "run:snapshot": {
          // Merge snapshot over existing state (don't clear — preserves completed/failed runs)
          for (const r of event.runs ?? []) {
            next.set(r.runId, {
              id: r.runId,
              projectId: r.projectId,
              projectTitle: r.projectTitle,
              status: r.status,
              currentStep: r.currentStep ?? "",
              progress: r.progress,
              startedAt: new Date().toISOString(),
            })
          }
          break
        }
        case "run:started": {
          if (event.runId) {
            next.set(event.runId, {
              id: event.runId,
              projectId: event.projectId ?? "",
              projectTitle: event.projectTitle ?? "",
              status: "running",
              currentStep: "",
              progress: 0,
              startedAt: new Date().toISOString(),
            })
          }
          break
        }
        case "step:started": {
          if (event.runId) {
            const run = next.get(event.runId)
            if (run) {
              next.set(event.runId, { ...run, currentStep: event.step ?? "" })
            }
          }
          break
        }
        case "step:completed": {
          // Updated via progress event
          break
        }
        case "progress": {
          if (event.runId) {
            const run = next.get(event.runId)
            if (run) {
              next.set(event.runId, {
                ...run,
                progress: event.progress ?? run.progress,
                currentStep: event.currentStep ?? run.currentStep,
              })
            }
          }
          break
        }
        case "run:completed": {
          if (event.runId) {
            const run = next.get(event.runId)
            if (run) {
              next.set(event.runId, {
                ...run,
                status: event.status ?? "completed",
                progress: event.status === "completed" ? 100 : run.progress,
                completedAt: new Date().toISOString(),
              })
            }
          }
          break
        }
      }

      return next
    })
  }, [])

  const connectWS = useCallback(() => {
    const wsUrl = API_BASE.replace(/^http/, "ws") + "/api/pipeline/ws"

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setLoading(false)
        reconnectCount.current = 0
        stopPolling()
      }

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as PipelineWSEvent
          handleEvent(event)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null

        if (!isMounted.current) return  // unmounted, skip reconnect

        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current++
          reconnectTimer.current = setTimeout(connectWS, RECONNECT_DELAY)
        } else {
          // Fallback to polling
          startPolling()
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      // WebSocket constructor failed — fallback to polling
      startPolling()
    }
  }, [handleEvent, startPolling, stopPolling])

  useEffect(() => {
    isMounted.current = true
    connectWS()

    return () => {
      isMounted.current = false
      wsRef.current?.close()
      stopPolling()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connectWS, stopPolling])

  return {
    runs: Array.from(runs.values()),
    connected,
    loading,
  }
}
