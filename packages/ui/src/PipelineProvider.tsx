"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AgentStatus = "QUEUED" | "PROCESSING" | "READY_FOR_QC" | "COMPLETE" | "FAILED";
export type MasteringMode = "IDLE" | "2K_PREVIEW" | "AWAITING_4K_APPROVAL" | "MASTERING_4K" | "COMPLETE";

export interface Engine {
  id: string;
  name: string;
  type: "Cloud" | "Local" | "Hybrid";
  provider: string;
  status: "Online" | "Offline" | "Degraded";
  latency: number;
}

export interface PipelineState {
  activeShotId: string;
  activeSceneId: string;
  agentStatus: Record<string, AgentStatus>;
  masteringMode: MasteringMode;
  retryTrack: Record<string, number>;
  is4KApproved: boolean;
  globalHealthScore: number;
  engines: Engine[];
  agentBindings: Record<string, string>;
  projectId: string;
}

interface PipelineContextType extends PipelineState {
  setAgentStatus: (agent: string, status: AgentStatus) => void;
  setMasteringMode: (mode: MasteringMode) => void;
  approve4K: () => void;
  incrementRetry: (agent: string) => void;
  resetPipeline: (shotId: string, sceneId: string) => void;
  updateBinding: (agent: string, engineId: string) => void;
  getEngineForAgent: (agent: string) => Engine | undefined;
  getAgentMeta: (agentId: string) => AgentMeta | undefined;
  setProjectId: (id: string) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

const INITIAL_AGENTS = [
  "WRIT", "SCRP", "CNCP", "SETD", "ASST", "GEN", 
  "CINE", "VFX", "VOIC", "EDIT", "GRDE", 
  "SOND", "SCOR", "MSTR"
];

export interface AgentMeta {
  stage: string;
  stageName: string;
  layer: string;
  layerName: string;
}

export const AGENT_METADATA: Record<string, AgentMeta> = {
  "WRIT": { stage: "ST1", stageName: "Creative Dev", layer: "L2", layerName: "Development" },
  "SCRP": { stage: "ST1", stageName: "Creative Dev", layer: "L2", layerName: "Development" },
  "CNCP": { stage: "ST1", stageName: "Creative Dev", layer: "L2", layerName: "Development" },
  "SETD": { stage: "ST1", stageName: "Creative Dev", layer: "L2", layerName: "Development" },
  "ASST": { stage: "ST1", stageName: "Creative Dev", layer: "L5", layerName: "AI Technology" },
  "GEN":  { stage: "ST3", stageName: "Production", layer: "L5", layerName: "AI Technology" },
  "CINE": { stage: "ST3", stageName: "Production", layer: "L5", layerName: "AI Technology" },
  "VFX":  { stage: "ST4", stageName: "Post-Production", layer: "L5", layerName: "AI Technology" },
  "VOIC": { stage: "ST4", stageName: "Post-Production", layer: "L5", layerName: "AI Technology" },
  "EDIT": { stage: "ST4", stageName: "Post-Production", layer: "L3", layerName: "Production Management" },
  "GRDE": { stage: "ST4", stageName: "Post-Production", layer: "L5", layerName: "AI Technology" },
  "SOND": { stage: "ST4", stageName: "Post-Production", layer: "L5", layerName: "AI Technology" },
  "SCOR": { stage: "ST4", stageName: "Post-Production", layer: "L5", layerName: "AI Technology" },
  "MSTR": { stage: "ST4", stageName: "Post-Production", layer: "L3", layerName: "Production Management" },
};

const INITIAL_ENGINES: Engine[] = [
  { id: "gemini-2.5", name: "Gemini 2.5 Pro", type: "Cloud", provider: "Google", status: "Online", latency: 240 },
  { id: "veo-3.1", name: "Google Veo 3.1", type: "Cloud", provider: "Vertex AI", status: "Online", latency: 1200 },
  { id: "midjourney-v6", name: "Midjourney v6", type: "Cloud", provider: "Discord/API", status: "Online", latency: 850 },
  { id: "sora-fall", name: "OpenAI Sora", type: "Cloud", provider: "Azure", status: "Degraded", latency: 4200 },
  { id: "claude-seedence", name: "Claude 3.5 (Seedence)", type: "Hybrid", provider: "Anthropic/Code", status: "Online", latency: 310 },
];

const INITIAL_BINDINGS: Record<string, string> = {
  "WRIT": "gemini-2.5",
  "SCRP": "gemini-2.5",
  "CNCP": "midjourney-v6",
  "SETD": "midjourney-v6",
  "ASST": "claude-seedence",
  "GEN": "veo-3.1",
  "CINE": "gemini-2.5",
  "VFX": "claude-seedence",
  "VOIC": "gemini-2.5",
  "EDIT": "gemini-2.5",
  "GRDE": "midjourney-v6",
  "SOND": "gemini-2.5",
  "SCOR": "gemini-2.5",
  "MSTR": "gemini-2.5",
};

export function PipelineProvider({ children, onApprove4K }: { children: ReactNode; onApprove4K?: (projectId: string) => Promise<void> }) {
  const [state, setState] = useState<PipelineState>({
    activeShotId: "TK_01",
    activeSceneId: "SC_001",
    agentStatus: INITIAL_AGENTS.reduce((acc, agent) => {
      acc[agent] = "QUEUED";
      return acc;
    }, {} as Record<string, AgentStatus>),
    masteringMode: "IDLE",
    retryTrack: INITIAL_AGENTS.reduce((acc, agent) => {
      acc[agent] = 0;
      return acc;
    }, {} as Record<string, number>),
    is4KApproved: false,
    globalHealthScore: 100,
    engines: INITIAL_ENGINES,
    agentBindings: INITIAL_BINDINGS,
    projectId: "",
  });

  // Mock Telemetry Feed
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        engines: prev.engines.map(e => ({
          ...e,
          latency: Math.max(10, e.latency + (Math.random() * 20 - 10))
        }))
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const setAgentStatus = (agent: string, status: AgentStatus) => {
    setState(prev => ({
      ...prev,
      agentStatus: { ...prev.agentStatus, [agent]: status }
    }));
  };

  const setMasteringMode = (mode: MasteringMode) => {
    setState(prev => ({ ...prev, masteringMode: mode }));
  };

  const approve4K = async () => {
    setState(prev => ({ ...prev, is4KApproved: true, masteringMode: "MASTERING_4K" }));
    if (onApprove4K && state.projectId) {
      await onApprove4K(state.projectId);
    }
  };

  const setProjectId = (id: string) => {
    setState(prev => ({ ...prev, projectId: id }));
  };

  const updateBinding = (agent: string, engineId: string) => {
    setState(prev => ({
      ...prev,
      agentBindings: { ...prev.agentBindings, [agent]: engineId }
    }));
  };

  const getAgentMeta = (agentId: string) => {
    return AGENT_METADATA[agentId];
  };

  const getEngineForAgent = (agent: string) => {
    const engineId = state.agentBindings[agent];
    return state.engines.find(e => e.id === engineId);
  };

  const incrementRetry = (agent: string) => {
    setState(prev => {
      const currentRetry = prev.retryTrack[agent] || 0;
      if (currentRetry >= 1) {
        return {
          ...prev,
          agentStatus: { ...prev.agentStatus, [agent]: "FAILED" },
          globalHealthScore: Math.max(0, prev.globalHealthScore - 10)
        };
      }
      return {
        ...prev,
        retryTrack: { ...prev.retryTrack, [agent]: currentRetry + 1 }
      };
    });
  };

  const resetPipeline = (shotId: string, sceneId: string) => {
    setState({
      activeShotId: shotId,
      activeSceneId: sceneId,
      agentStatus: INITIAL_AGENTS.reduce((acc, agent) => {
        acc[agent] = "QUEUED";
        return acc;
      }, {} as Record<string, AgentStatus>),
      masteringMode: "IDLE",
      retryTrack: INITIAL_AGENTS.reduce((acc, agent) => {
        acc[agent] = 0;
        return acc;
      }, {} as Record<string, number>),
      is4KApproved: false,
      globalHealthScore: 100,
      engines: INITIAL_ENGINES,
      agentBindings: INITIAL_BINDINGS,
    });
  };

  return (
    <PipelineContext.Provider value={{ 
      ...state, 
      setAgentStatus, 
      setMasteringMode, 
      approve4K, 
      incrementRetry, 
      resetPipeline,
      updateBinding,
      getEngineForAgent,
      getAgentMeta,
      setProjectId
    }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error("usePipeline must be used within a PipelineProvider");
  }
  return context;
}
