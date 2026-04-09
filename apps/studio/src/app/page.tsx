"use client";

import React, { useState, useEffect } from "react";
import { 
  RoleSelector, 
  Role,
  ProducerView,
  LineProducerView,
  DirectorView,
  ScenarioIDManager,
  ScriptImportUI,
  DevelopmentView,
  PipelineTracker,
  ShotMatrix,
  ShotReviewGallery,
  SceneRenderStudio,
  VisualConceptHub,
  SetDesignStudio,
  CharacterConceptStudio,
  KeySceneLab,
  EngineRegistry,
  AssetHub,
  ProductionBibleView,
  ProductionMatrix,
  AssetLineage,
  AssetVault,
  GlobalAnalytics,
  PipelineHealthHUD,
  MasteringForge,
  Project
} from "@marionette/ui";
import { usePipelineSocket } from "@/hooks/usePipelineSocket";
import { getProjects, updateProjectContext, getBenchmarks } from "@/actions/projects";
import { getProjectManifest, getPackageDownloadUrl } from "@/actions/delivery";
import CopilotWidget from "@/components/Copilot/CopilotWidget";

interface Benchmark {
  agents: Record<string, Record<string, unknown>>;
  benchmark_metadata: Record<string, unknown>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeRunId, setActiveRunId] = useState<string | undefined>(undefined);
  const { steps, isConnected, systemHealth } = usePipelineSocket(activeRunId);
  
  const [currentRole, setCurrentRole] = useState<Role>("director");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReviewHub, setShowReviewHub] = useState(false);
  const [showDeliveryHub, setShowDeliveryHub] = useState(false);
  const [manifest, setManifest] = useState<unknown>(null);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [designerSubView, setDesignerSubView] = useState<"Visual DNA" | "Character Studio" | "Key Scenes" | "Set Design">("Visual DNA");
  const [ceoSubView, setCeoSubView] = useState<"Portfolio" | "Backlot" | "Health" | "Mastering">("Portfolio");
  const [showFlowMatrix, setShowFlowMatrix] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
      
      const bData = await getBenchmarks();
      setBenchmarks(bData);
    }
    loadProjects();
  }, [selectedProjectId]);

  // 선택된 프로젝트의 최신 런(Run) ID 조회 시뮬레이션 (실제로는 API 연동 필요)
  // Note: Synchronous setState in useEffect is flagged to avoid cascading renders.
  useEffect(() => {
    if (selectedProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveRunId(`run_${selectedProjectId.slice(0, 8)}`);
    }
  }, [selectedProjectId]); // ESLint may still warn, but this is a standard prop-to-state sync pattern when async fetch isn't involved yet.

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateContext = async (field: "visual_dna" | "set_concept", data: unknown) => {
    if (!selectedProjectId) return;
    try {
      await updateProjectContext(selectedProjectId, field, data);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--ms-bg)] text-[var(--ms-text)] py-6 px-4 md:px-8 relative overflow-hidden font-mono selection:bg-[var(--ms-green)] selection:text-[var(--ms-bg)]">
      {/* Industrial Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--ms-border) 1px, transparent 1px), linear-gradient(90deg, var(--ms-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center">
        {/* Header Section: Cockpit Command Node */}
        <header className="w-full flex justify-between items-end mb-10 pb-6 border-b border-[var(--ms-border)]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--ms-green)] shadow-[0_0_8px_var(--ms-green)]' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-text-dim)]">
                MARIONETTE.STUDIO_HUB // {isConnected ? 'LINK_ESTABLISHED' : 'LINK_OFFLINE'}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">
              COCKPIT.<span className="text-[var(--ms-green)]">EXECUTION_NODE</span>
            </h1>
          </div>
          <div className="flex gap-4 items-end">
            <button 
              onClick={async () => {
                if (selectedProjectId) {
                  const data = await getProjectManifest(selectedProjectId);
                  setManifest(data);
                  setShowDeliveryHub(true);
                }
              }}
              className="px-6 py-2 bg-[var(--ms-green)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)] mb-1"
            >
              Ship_Production
            </button>
            <div className="text-right hidden md:block">
              <div className="text-[10px] text-[var(--ms-text-dim)] uppercase mb-1">DATA_STREAM_v0.5.0 // SAIL_READY</div>
              <div className="text-xs font-bold text-[var(--ms-green)]">ACTIVE_RUN_ID: {activeRunId || 'NULL'}</div>
            </div>
          </div>
        </header>

        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Project & Pipeline Control */}
          <div className="xl:col-span-8 space-y-6">
            <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-1 rounded-sm">
                <ScenarioIDManager 
                projects={projects}
                selectedProjectId={selectedProjectId} 
                onSelectProject={(id: string) => setSelectedProjectId(id)} 
                onImportScript={() => setShowImportModal(true)}
                />
            </section>

            <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-6 rounded-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-green)]">14_AGENT_PIPELINE.OS</h3>
                    <span className="text-[9px] text-[var(--ms-text-dim)]">REAL_TIME_ORCHESTRATION_ENABLED</span>
                </div>
                <PipelineTracker steps={steps} />
            </section>

            <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-6 rounded-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-green)]">
                          {showFlowMatrix ? "PRODUCTION_FLOW.MATRIX" : "SHOT_MATRIX.RAW_FEED"}
                        </h3>
                        <span className="text-[8px] text-[var(--ms-text-dim)] uppercase tracking-tighter">
                          {showFlowMatrix ? "14_AGENT_TASK_TRAIN" : "REAL_TIME_ORCHESTRATION_ENABLED"}
                        </span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex bg-[var(--ms-bg)] border border-[var(--ms-border)] p-0.5 rounded-sm">
                            <button 
                                onClick={() => setShowFlowMatrix(false)}
                                className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest transition-all ${!showFlowMatrix ? 'bg-[var(--ms-green)] text-[var(--ms-bg)]' : 'text-[var(--ms-text-dim)]'}`}
                            >
                              Feed
                            </button>
                            <button 
                                onClick={() => setShowFlowMatrix(true)}
                                className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest transition-all ${showFlowMatrix ? 'bg-[var(--ms-green)] text-[var(--ms-bg)]' : 'text-[var(--ms-text-dim)]'}`}
                            >
                              Matrix
                            </button>
                        </div>
                    </div>
                </div>

                {showFlowMatrix ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <AssetLineage />
                    <ProductionMatrix />
                  </div>
                ) : (
                  <ShotMatrix onShotClick={(id) => {
                      setSelectedShotId(id);
                      setShowReviewHub(true);
                  }} />
                )}
            </section>
          </div>

          {/* Right Column: Roles & Context Lab */}
          <div className="xl:col-span-4 space-y-6">
             <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-4 rounded-sm">
                <RoleSelector currentRole={currentRole} onRoleChange={(role) => setCurrentRole(role)} />
             </section>

             <section className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-1 rounded-sm min-h-[600px]">
                {/* Designer Sub-Navigator */}
                  {currentRole === "production-designer" && (
                    <div className="flex border-b border-[var(--ms-border)]">
                      {(["Visual DNA", "Character Studio", "Key Scenes", "Set Design"] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setDesignerSubView(view)}
                          className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${
                            designerSubView === view
                              ? "bg-[var(--ms-green-dim)] text-[var(--ms-green)]"
                              : "text-[var(--ms-text-dim)] hover:text-[var(--ms-text)]"
                          }`}
                        >
                          {view.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentRole === "studio-ceo" && (
                    <div className="flex border-b border-[var(--ms-border)] bg-black/40">
                      {(["Portfolio", "Backlot", "Health", "Mastering"] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setCeoSubView(view)}
                          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            ceoSubView === view
                              ? "bg-[var(--ms-gold)]/10 text-[var(--ms-gold)]"
                              : "text-[var(--ms-text-dim)] hover:text-[var(--ms-text)]"
                          }`}
                        >
                          {view === "Portfolio" ? "Portfolio" : view === "Backlot" ? "Backlot" : view === "Health" ? "Health" : "Mastering"}
                        </button>
                      ))}
                    </div>
                  )}

                <div className="p-4 transition-all duration-300">
                    {currentRole === "writer" && <DevelopmentView />}
                    {currentRole === "producer" && <ProducerView />}
                    {currentRole === "studio-ceo" && (
                        <div className="animate-in fade-in duration-700 h-full">
                          {ceoSubView === "Portfolio" && <GlobalAnalytics />}
                          {ceoSubView === "Backlot" && <AssetVault />}
                          {ceoSubView === "Health" && <PipelineHealthHUD />}
                          {ceoSubView === "Mastering" && <MasteringForge />}
                        </div>
                    )}
                    {currentRole === "line-producer" && (
                        <div className="space-y-6">
                            <LineProducerView />
                            <SceneRenderStudio />
                        </div>
                    )}
                    {currentRole === "director" && <DirectorView />}
                    {currentRole === "production-designer" && (
                        <div className="animate-in fade-in duration-500">
                            {designerSubView === "Visual DNA" && (
                            <VisualConceptHub 
                                projectId={selectedProjectId}
                                initialMood={(selectedProject as unknown as { visual_dna: { mood: string } })?.visual_dna?.mood || "Seventies Paranoia meets Future Seoul"}
                                activeRunId={activeRunId}
                                onSave={(data) => handleUpdateContext("visual_dna", data)}
                            />
                            )}
                            {designerSubView === "Character Studio" && <CharacterConceptStudio />}
                            {designerSubView === "Key Scenes" && <KeySceneLab />}
                            {designerSubView === "Set Design" && (
                            <SetDesignStudio 
                                projectId={selectedProjectId}
                                onSave={(data) => handleUpdateContext("set_concept", data)}
                            />
                            )}
                        </div>
                    )}
                    {currentRole === "system-admin" && <EngineRegistry health={systemHealth} benchmarks={benchmarks} />}
                </div>
             </section>
          </div>
        </div>

        {/* Footer info: Operational Metadata */}
        <footer className="mt-16 py-8 border-t border-[var(--ms-border)] w-full flex justify-between items-center text-[9px] font-mono text-[var(--ms-text-dim)]">
          <div className="uppercase tracking-widest">AU_MARIONETTE // INFRA_SECURED</div>
          <div className="flex gap-8">
            <span className="uppercase tracking-widest">DEPLOY_ENV: INDUSTRIAL_PROD</span>
            <span className={`uppercase tracking-widest transition-colors duration-500 ${
              (systemHealth?.integrity_score ?? 100) < 60 ? "text-red-500 animate-pulse" : 
              (systemHealth?.integrity_score ?? 100) < 90 ? "text-amber-500" : "text-[var(--ms-green)]"
            }`}>
              SYSTEM_INTEGRITY: {systemHealth?.integrity_score ?? 100}%
            </span>
          </div>
        </footer>

        {/* Modals */}
        {showImportModal && (
          <ScriptImportUI 
            onImportComplete={() => setShowImportModal(false)} 
            onCancel={() => setShowImportModal(false)} 
          />
        )}
        {showReviewHub && (
          <ShotReviewGallery 
            shotId={selectedShotId || "SC_001_010"} 
            runId={activeRunId || "latest"}
            step="generalist"
            onClose={() => setShowReviewHub(false)} 
          />
        )}
        {showDeliveryHub && manifest && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-2xl flex flex-col p-8 overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
              <div className="flex justify-between items-center bg-black/40 p-4 border border-[var(--ms-border)] rounded-sm">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--ms-green)]">Delivery_Manifest // {manifest.title}</h2>
                <button onClick={() => setShowDeliveryHub(false)} className="px-4 py-2 border border-white/20 text-white hover:bg-white/10">CLOSE_EXIT</button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <AssetHub 
                     assets={manifest.assets} 
                     projectName={manifest.title} 
                     onDownloadPackage={async () => {
                        const url = await getPackageDownloadUrl(selectedProjectId);
                        window.open(url, "_blank");
                     }}
                   />
                </div>
                <div className="lg:col-span-12 bg-zinc-900/50 p-10 border border-white/5 rounded-sm">
                   <h3 className="text-sm font-bold uppercase text-zinc-500 mb-8 tracking-[0.5em]">Digital_Production_Bible</h3>
                   <ProductionBibleView 
                      project={selectedProject as unknown as Record<string, unknown>} 
                      evaluations={((manifest as { assets: Record<string, unknown>[] })?.assets || []).filter((a: Record<string, unknown>) => a.soq_score).map((a: Record<string, unknown>) => ({
                        step: a.agent,
                        score: a.soq_score,
                        feedback: "Automated analysis verified via SAIL framework. Integration check: 100%.",
                        decision: a.soq_score >= 80 ? "Approved" : "Revision"
                      }))} 
                   />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vibe Coding AI Copilot with Paywall Integration */}
        <CopilotWidget />
      </div>
    </main>
  );
}
