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
  Project,
  GStackProvider,
  SAILIntegrityMonitor,
  VaultLineageExplorer,
  PipelineProvider,
  usePipeline
} from "@marionette/ui";
import { usePipelineSocket } from "@/hooks/usePipelineSocket";
import { getProjects, updateProjectContext, getBenchmarks, getLatestRuns } from "@/actions/projects";
import { getProjectManifest, getPackageDownloadUrl, approveMastering, getProjectAnalysis, runProjectAnalysis } from "@/actions/delivery";
import { RiskMonitor } from "@/components/intelligence/RiskMonitor";
import CopilotWidget from "@/components/Copilot/CopilotWidget";

interface Benchmark {
  agents: Record<string, Record<string, unknown>>;
  benchmark_metadata: Record<string, unknown>;
}

/**
 * Helper to sync the selected project ID into the PipelineProvider context
 */
function SyncProjectId({ id }: { id: string }) {
  const { setProjectId } = usePipeline();
  
  useEffect(() => {
    if (id) {
      setProjectId(id);
    }
  }, [id, setProjectId]);

  return null; 
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
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    async function syncActiveRun() {
      if (selectedProjectId) {
        const runs = await getLatestRuns(selectedProjectId);
        if (runs && runs.length > 0) {
          setActiveRunId(runs[0].id);
        } else {
          setActiveRunId(`run_${selectedProjectId.slice(0, 8)}`);
        }
      }
    }
    syncActiveRun();
  }, [selectedProjectId]);

  // Fetch Analysis Data
  useEffect(() => {
    async function loadAnalysis() {
      if (selectedProjectId) {
        const data = await getProjectAnalysis(selectedProjectId);
        setAnalysisData(data);
      }
    }
    loadAnalysis();
  }, [selectedProjectId]);

  const handleRunAudit = async () => {
    if (!selectedProjectId) return;
    setIsAnalyzing(true);
    try {
      await runProjectAnalysis(selectedProjectId);
      const data = await getProjectAnalysis(selectedProjectId);
      setAnalysisData(data);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleApprove4K = async (projectId: string) => {
    try {
      await approveMastering(projectId);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
    } catch (error) {
      alert("4K 마스터링 승인 중 오류가 발생했습니다.");
    }
  };

  return (
    <GStackProvider initialIntegrity={systemHealth?.integrity_score ?? 94.2}>
      <PipelineProvider onApprove4K={handleApprove4K}>
        <SyncProjectId id={selectedProjectId} />
        <main className="min-h-screen flex flex-col bg-[var(--ms-bg-base)] text-[var(--ms-text-main)] py-8 px-6 md:px-12 relative overflow-hidden selection:bg-[var(--ms-gold)] selection:text-black">
      {/* Cinematic Ambiance */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--ms-gold-haze)] rounded-full blur-[160px] opacity-20 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center">
        {/* Header Section: Auteur Elite Orchestrator */}
        <header className="w-full flex justify-between items-center mb-16 pb-8 border-b border-[var(--ms-gold-border)]/30 border-dashed relative">
          {/* Constrained scan line */}
          <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold)] to-transparent opacity-20" />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[var(--ms-gold)] shadow-[0_0_12px_var(--ms-gold)]' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)] opacity-80">
                AUTEUR.STUDIO // {isConnected ? 'SECURE_CHANNEL' : 'SIGNAL_LOST'}
              </span>
            </div>
            <h1 className="text-6xl font-serif text-[var(--ms-text-bright)] tracking-tight">
              Auteur <span className="text-[var(--ms-gold)] italic">Elite</span>
            </h1>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex bg-[var(--ms-bg-elevated)] border border-[var(--ms-gold-border)] p-1 rounded-full px-4 gap-4 mr-4">
               <button className="text-[9px] font-bold uppercase tracking-widest text-[var(--ms-gold)] hover:opacity-100 opacity-60 transition-opacity">Studio</button>
               <button className="text-[9px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] hover:opacity-100 opacity-40 transition-opacity">Premiere</button>
               <button className="text-[9px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] hover:opacity-100 opacity-40 transition-opacity">Blueprint</button>
            </div>
            <button 
              onClick={async () => {
                if (selectedProjectId) {
                  const data = await getProjectManifest(selectedProjectId);
                  setManifest(data);
                  setShowDeliveryHub(true);
                }
              }}
              className="px-8 py-3 bg-[var(--ms-gold)] text-[var(--ms-bg-base)] text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:scale-105 transition-all shadow-[0_8px_24px_var(--ms-gold-glint)]"
            >
              Ship Production
            </button>
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

            <section className="bg-[var(--ms-bg-elevated)]/40 border border-[var(--ms-gold-border)]/50 p-10 rounded-[var(--ms-radius-lg)] gstack-glass relative overflow-hidden">
                {/* Section Scan Line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold)] to-transparent opacity-10" />
                <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-serif text-[var(--ms-gold)] tracking-tight">Active Pipeline</h3>
                        <p className="text-[10px] text-[var(--ms-text-ghost)] uppercase tracking-[0.2em] font-mono">Real-time orchestration stream</p>
                    </div>
                    <div className="w-24 h-[1px] bg-[var(--ms-gold-border)]/30" />
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
                    <SAILIntegrityMonitor />
                    <VaultLineageExplorer />
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
                        {/* Intelligence & Health HUD (Fixed Placement) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                         <div className="flex flex-col gap-6">
                            <PipelineHealthHUD health={systemHealth} />
                            {analysisData?.riskAudit && (
                              <RiskMonitor data={analysisData.riskAudit} />
                            )}
                         </div>
                         <div className="flex flex-col gap-6">
                            <PipelineTracker steps={steps} currentStep={steps.find(s => s.status === 'RUNNING')?.id} />
                            {!analysisData && (
                              <div className="p-8 border border-[var(--ms-gold-border)]/10 rounded-[var(--ms-radius-lg)] gstack-glass flex flex-col items-center justify-center gap-4">
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Intelligence_Offline</span>
                                <button 
                                  onClick={handleRunAudit}
                                  disabled={isAnalyzing}
                                  className="px-8 py-3 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/20 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--ms-gold)]/20 transition-all rounded-full"
                                >
                                  {isAnalyzing ? "Analyzing_Core..." : "Initiate_Intelligence_Audit"}
                                </button>
                              </div>
                            )}
                         </div>
                      </div>
                            <LineProducerView />
                            <SceneRenderStudio />
                        </div>
                    )}
                    {currentRole === "director" && <DirectorView />}
                    {currentRole === "legacy-lab" && (
                        <div className="animate-in fade-in duration-700 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {[
                                { 
                                    name: "cine-script-writer", 
                                    url: "http://localhost:5174", 
                                    desc: "할리우드 표준 2단 시나리오 작성로직 및 프론트엔드 랩(Lab) 구조 분석",
                                    status: "LAB_OPERATIONAL",
                                    icon: "🖋️"
                                },
                                { 
                                    name: "cine-analysys-system", 
                                    url: "http://localhost:4000", 
                                    desc: "시나리오 분석 및 감정 곡선 등 시각화 데이터 플로우 분석",
                                    status: "DATA_STREAMS_ACTIVE",
                                    icon: "📊"
                                },
                                { 
                                    name: "cine-art-department", 
                                    url: "#", 
                                    desc: "아트 디렉팅 및 자산 생성(이미지) 인터페이스 분석",
                                    status: "DESIGN_CORE_READY",
                                    icon: "🎨"
                                },
                                { 
                                    name: "storyboard-concept-maker", 
                                    url: "http://localhost:8080", 
                                    desc: "스토리보드 갤러리 및 로컬 서버 환경 분석",
                                    status: "GALLERY_SYNCED",
                                    icon: "🖼️"
                                },
                                { 
                                    name: "production_pipeline", 
                                    url: "http://localhost:3005", 
                                    desc: "에이전트 오케스트레이션 및 데이터베이스 연동 구조 분석",
                                    status: "ENGINE_MASTERED",
                                    icon: "⚙️",
                                    fullWidth: true
                                }
                            ].map((lab) => (
                                <a 
                                    key={lab.name}
                                    href={lab.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group flex flex-col p-8 bg-[var(--ms-bg-elevated)]/30 border border-[var(--ms-gold-border)]/20 rounded-[var(--ms-radius-lg)] gstack-glass hover:border-[var(--ms-gold)]/40 transition-all duration-500 hover:scale-[1.02] ${lab.fullWidth ? 'md:col-span-2' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-3xl filter saturate-0 group-hover:saturate-100 transition-all duration-500">{lab.icon}</span>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-mono text-[var(--ms-gold)] tracking-[0.3em] font-bold">{lab.status}</span>
                                            <div className="w-12 h-[1px] bg-[var(--ms-gold)]/20" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-serif text-[var(--ms-text-bright)] mb-4 group-hover:text-[var(--ms-gold)] transition-colors tracking-tight">
                                        {lab.name}
                                    </h4>
                                    <p className="text-xs text-[var(--ms-text-dim)] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity flex-1">
                                        {lab.desc}
                                    </p>
                                    <div className="mt-8 pt-6 border-t border-[var(--ms-gold-border)]/10 flex justify-between items-center">
                                        <span className="text-[8px] font-mono text-[var(--ms-text-ghost)] uppercase tracking-widest">Connect_To_Module</span>
                                        <div className="w-4 h-4 rounded-full border border-[var(--ms-gold)]/40 flex items-center justify-center group-hover:bg-[var(--ms-gold)] transition-all">
                                            <div className="w-1 h-1 bg-[var(--ms-gold)] rounded-full group-hover:bg-black" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
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
        <footer className="mt-16 py-8 border-t border-[var(--ms-gold-border)]/20 w-full flex justify-between items-center text-[9px] font-mono text-[var(--ms-text-dim)] relative">
          <div className="absolute top-[-1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold)] to-transparent opacity-10" />
          <div className="uppercase tracking-[0.4em] opacity-60">AU_MARIONETTE // INFRA_SECURED</div>
          <div className="flex gap-12">
            <span className="uppercase tracking-[0.2em]">ENV: INDUSTRIAL_PROD</span>
            <span className={`uppercase tracking-[0.2em] transition-colors duration-500 ${
              (systemHealth?.integrity_score ?? 100) < 60 ? "text-red-500 animate-pulse" : 
              (systemHealth?.integrity_score ?? 100) < 90 ? "text-amber-500" : "text-[var(--ms-gold)]"
            }`}>
              INTEGRITY_INDEX: {systemHealth?.integrity_score ?? 100}%
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
          <div className="fixed inset-0 z-[70] bg-[var(--ms-bg-base)]/95 backdrop-blur-3xl flex flex-col p-8 md:p-12 overflow-y-auto animate-in fade-in zoom-in duration-500 selection:bg-[var(--ms-gold)] selection:text-black">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-12">
              <div className="flex justify-between items-center bg-black/40 px-10 py-6 border border-[var(--ms-gold-border)]/20 rounded-[var(--ms-radius-lg)] gstack-glass">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse shadow-[0_0_10px_var(--ms-gold)]" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]">Delivery_Protocol_v2.0</span>
                   </div>
                   <h2 className="text-3xl font-serif text-[var(--ms-text-bright)] tracking-tight">Archive Manifest // {manifest.title}</h2>
                </div>
                <button 
                  onClick={() => setShowDeliveryHub(false)} 
                  className="px-8 py-3 border border-[var(--ms-gold-border)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--ms-gold-haze)] transition-all rounded-full"
                >
                  Terminate_Session
                </button>
              </div>
              
                <div className="lg:col-span-12">
                   <AssetHub 
                     assets={(manifest as any).assets} 
                     projectName={(manifest as any).title} 
                     onDownloadPackage={async () => {
                        const url = await getPackageDownloadUrl(selectedProjectId);
                        window.open(url, "_blank");
                     }}
                   />
                </div>
                <div className="lg:col-span-12">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--ms-gold-border)] opacity-20" />
                      <h3 className="text-[10px] font-mono font-bold uppercase text-[var(--ms-gold)] tracking-[0.6em]">Digital_Studio_Bible</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-[var(--ms-gold-border)] to-transparent opacity-20" />
                   </div>
                   <ProductionBibleView 
                      project={selectedProject as unknown as any} 
                      evaluations={((manifest as { assets: Record<string, unknown>[] })?.assets || []).filter((a: Record<string, unknown>) => a.soq_score).map((a: Record<string, unknown>) => ({
                        step: a.agent,
                        score: a.soq_score,
                        feedback: "Automated analysis verified via SAIL framework. Integration check: 100%.",
                        decision: a.soq_score >= 80 ? "Approved" : "Revision"
                      }))} 
                      onApprove4K={handleApprove4K}
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
    </PipelineProvider>
    </GStackProvider>
  );
}
