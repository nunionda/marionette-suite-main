"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  ScriptAnalysisHub, 
  CinematicStudio, 
  AssetForge, 
  VFXStudio, 
  SoundLab, 
  ScoreStudio, 
  DIStudio,
  VoiceStudio,
  EditSuite,
  DevelopmentView,
  CharacterConceptStudio,
  SetDesignStudio,
  KeySceneLab,
  MasteringForge,
  SceneRenderStudio,
  EngineRegistry,
  NeuralCalibration,
  usePipeline
} from "@marionette/ui";

const AGENT_MAP: Record<string, string> = {
  "scripter": "SCRP",
  "writer": "WRIT",
  "casting": "CNCP",
  "location": "SETD",
  "concept": "SETD", // Shared with SETD for now
  "cinematics": "CINE",
  "asset-forge": "ASST",
  "vfx": "VFX",
  "gen": "GEN",
  "color": "GRDE",
  "sound": "SOND",
  "score": "SCOR",
  "mixing": "MSTR",
  "voice": "VOIC",
  "edit": "EDIT",
};

export default function AgentStudioPage() {
  const params = useParams();
  const agent = params.agent as string;
  const { getEngineForAgent } = usePipeline();
  
  const [isCalibrated, setIsCalibrated] = React.useState(false);
  
  const agentAcronym = AGENT_MAP[agent];
  const assignedEngine = getEngineForAgent(agentAcronym || "");

  React.useEffect(() => {
    setIsCalibrated(false);
  }, [agent]);

  if (agent !== "admin" && !isCalibrated && assignedEngine) {
    return (
      <NeuralCalibration 
        agentId={agentAcronym} 
        engineName={assignedEngine.name} 
        onComplete={() => setIsCalibrated(true)} 
      />
    );
  }

  const renderStudio = () => {
    switch (agent) {
      // Pre-Production
      case "scripter": return <ScriptAnalysisHub />;
      case "writer": return <DevelopmentView />;
      case "casting": return <CharacterConceptStudio />;
      case "location": return <SetDesignStudio />;
      case "concept": return <KeySceneLab />;
      
      // Production Crew
      case "cinematics": return <CinematicStudio />;
      case "asset-forge": return <AssetForge />;
      case "vfx": return <VFXStudio />;
      case "gen": return <SceneRenderStudio />;
      
      // Post Production
      case "color": return <DIStudio />;
      case "sound": return <SoundLab />;
      case "score": return <ScoreStudio />;
      case "mixing": return <MasteringForge />;
      case "voice": return <VoiceStudio />;
      case "edit": return <EditSuite />;
      
      // System
      case "admin": return <EngineRegistry />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-dashed border-[var(--ms-gold-border)]/20 rounded-xl">
            <h2 className="text-2xl font-serif text-[var(--ms-gold)] mb-4 uppercase tracking-widest">Studio_Not_Found</h2>
            <p className="text-[10px] text-[var(--ms-text-dim)] font-mono uppercase tracking-[0.4em]">The requested professional environment is not yet calibrated.</p>
          </div>
        );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-[1px] bg-[var(--ms-gold)] opacity-30" />
        <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.8em] text-[var(--ms-gold)] whitespace-nowrap">
          {agent?.toUpperCase()}_PROFESSIONAL_STUDIO_v4
        </h2>
        <div className="flex-grow h-[1px] bg-gradient-to-r from-[var(--ms-gold)]/30 to-transparent" />
      </div>
      
      {renderStudio()}
    </div>
  );
}
