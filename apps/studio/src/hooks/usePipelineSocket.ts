"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PipelineStep, defaultPipelineSteps } from "@marionette/ui";


const stepMapping: Record<string, string> = {
  script_writer: "Script",
  scripter: "Script",
  concept_artist: "Concept",
  previsualizer: "Previs",
  casting_director: "Casting",
  location_scout: "Location",
  cinematographer: "DP Ref",
  generalist: "Video",
  asset_designer: "Asset",
  vfx_compositor: "VFX",
  master_editor: "Edit",
  colorist: "Color",
  sound_designer: "Sound",
  composer: "Score",
  mixing_engineer: "Mixing",
};

export function usePipelineSocket(runId?: string) {
  const [steps, setSteps] = useState<PipelineStep[]>(defaultPipelineSteps);
  const [isConnected, setIsConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState<Record<string, unknown> | null>(null);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(function connect() {
    if (!runId) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:${process.env.NEXT_PUBLIC_PIPELINE_WS_PORT || "3005"}/ws/pipeline/${runId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log(`🔌 CONNECTED: MARIONETTE_PIPELINE_NODE [RUN_ID: ${runId}]`);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);

      if (data.type === "step_started" || data.type === "step_completed" || data.type === "step_failed" || data.type === "quality_check_completed") {
        setSteps((prevSteps) => {
          const uiStepName = stepMapping[data.step] || data.step;
          return prevSteps.map((s) => {
            if (s.name === uiStepName) {
              return {
                ...s,
                status: data.type === "step_started" ? "Processing" : 
                        data.type === "step_completed" ? "Completed" : 
                        data.type === "step_failed" ? "Error" : s.status,
                progress: data.progress !== undefined ? data.progress : s.progress,
                grounding: data.grounding || s.grounding,
                soq: data.type === "quality_check_completed" ? data.soq.soq_score : s.soq,
              };
            }
            return s;
          });
        });
      }

      if (data.type === "pipeline_started") {
        setSteps((prev) => prev.map(s => ({ ...s, status: "Queue", progress: 0 })));
      }

      if (data.type === "system_health_update") {
        setSystemHealth(data.data);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log(`🔌 DISCONNECTED: MARIONETTE_PIPELINE_NODE [RUN_ID: ${runId}]`);
      // Reconnect after 3 seconds if runId still exists
      if (runId) setTimeout(connect, 3000);
    };

    socketRef.current = socket;
  }, [runId]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { steps, setSteps, isConnected, systemHealth, lastMessage };
}
