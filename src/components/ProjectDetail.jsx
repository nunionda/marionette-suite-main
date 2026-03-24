import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';

// Using Vite's raw import to get the agent rules
import loglineRule from '../.agents/rules/logline_engine.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';
import treatmentRule from '../.agents/rules/treatment_engine.md?raw';
import scenarioRule from '../.agents/rules/scenario_writer.md?raw';
import reviewRule from '../.agents/rules/production_review.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import clicheRules from '../.agents/rules/cliche_strategy.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';

const GENRE_HINTS = {
  'Thriller/Action': { icon: '🔪', cues: ['Shaky Cam', 'Dutch Tilt', 'Jump Cuts', 'Drones'] },
  'Human Drama': { icon: '🫂', cues: ['Deep Focus', 'Long Takes', 'Subtext', 'Ambiance'] },
  'SF/Mystery': { icon: '🛸', cues: ['Wide Shots', 'Neon Contrast', 'Symmetry', 'Synth'] },
  'Comedy/Satire': { icon: '🤡', cues: ['Fast Pan', 'Rule of Three', 'Anticlimax', 'Bright'] }
};

const ProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('CONCEPT');
  const [zenMode, setZenMode] = useState(false);
  const [orchestrationIntensity, setOrchestrationIntensity] = useState(1);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  // Concept Form State
  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');
  const [conceptDirection, setConceptDirection] = useState(project.conceptDirection || '글로벌 텐트폴 및 한국 상업 영화 표준');
  
  // Pipeline State
  const [pipelineData, setPipelineData] = useState({
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || ''
  });
  
  const [producerNote, setProducerNote] = useState('');
  const [scenes, setScenes] = useState([]); // Will hold the 120-scene inventory
  const [scriptMode, setScriptMode] = useState('DRAFT'); // 'DRAFT' or 'REFINE'
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  
  // Advanced Narrative Controls
  const [bingeHookEnabled, setBingeHookEnabled] = useState(project.isNetflixStandard || false);
  const [clicheSubversionIntensity, setClicheSubversionIntensity] = useState(5); // 1-10

  const outputRef = useRef(null);
  const baseTextRef = useRef(''); // To store text before appending

  // Sync state if project prop changes
  useEffect(() => {
    setPipelineData({
      concept: project.concept || '',
      architecture: project.architecture || '',
      treatment: project.treatment || '',
      scenario: project.scenario || '',
      review: project.review || '',
      analysisData: project.analysisData || null
    });
    setConceptBrief(project.conceptBrief || '');
    setConceptDirection(project.conceptDirection || '글로벌 텐트폴 및 한국 상업 영화 표준');
  }, [project]);

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  // 1. Instantiate Application Layer (Engine Hook)
  const { executeAgent, isGenerating, generationStatus } = useAgentEngine(apiKey, handleDataChange);

  // 2. Manage View Side Effects (Auto-Scroll)
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [pipelineData, activeTab]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('openRouterApiKey', key);
  };

  const saveToContext = () => {
    updateProject(project.id, { 
      ...pipelineData, 
      conceptBrief, 
      conceptDirection 
    });
    alert("Project Data Saved!");
  };

  // Agent UseCase Triggers
  const generateConcept = () => {
    if (!conceptBrief.trim()) {
      alert("⚠️ 아이디어 및 주제를 먼저 입력해주세요.");
      return;
    }
    
    executeAgent(
      loglineRule, 
      `사용자 브리프(아이디어/주제):\n${conceptBrief}\n\n기획 방향성:\n${conceptDirection}\n\n이 아이디어와 방향성을 바탕으로 글로벌 스펙터클과 한국 관객의 카타르시스를 모두 충족하는 완벽한 하이컨셉을 도출하세요.`, 
      'concept',
      false,
      'Conceptualizing Vision...'
    );
  };

  const generateArchitecture = () => {
    if (!pipelineData.concept) { alert("Please generate the Concept first."); return; }
    executeAgent(architectRule, `Logline/Concept:\\n${pipelineData.concept}\\n\\n이 컨셉을 바탕으로 핵심 캐릭터 시트와 역동적인 3막 시놉시스를 설계하세요.`, 'architecture', false, 'Drafting Structural Blueprint...');
  };

  const generateTreatment = () => {
    if (!pipelineData.architecture) { alert("Please generate Architecture first."); return; }
    executeAgent(treatmentRule, `Synopsis & Characters:\\n${pipelineData.architecture}\\n\\n이를 Blake Snyder의 15-Beat Sheet (Save the Cat!) 구조에 맞게 배열하고 단계별 트리트먼트와 세부 비트 시트를 작성하세요.`, 'treatment', false, 'Sequencing Beat Sheet...');
  };

  const generateScenario = () => {
    if (!pipelineData.treatment) { alert("Please generate Treatment first."); return; }
    
    const genreContext = `\n[Genre Mode]: ${project.genre}\n[Category]: ${project.category}\n[Binge-Hook]: ${bingeHookEnabled ? 'ENABLED (Force cliffhanger)' : 'DISABLED'}\n[Cliché Subversion]: Intensity ${clicheSubversionIntensity}/10\n`;
    
    // Choose the base engine rule based on project category
    const baseEngineRule = project.category === 'Commercial' ? adRule : scenarioRule;
    
    const fullSystemPrompt = `${baseEngineRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}\n\n[CLICHE STRATEGY]\n${clicheRules}`;

    if (scriptMode === 'REFINE') {
      const targetScene = selectedSceneId ? `S#${selectedSceneId}` : '전체';
      const prompt = `
[Mode]: DIRECTOR'S REFINEMENT (대상: ${targetScene})${genreContext}
[Standard]: MASTER SCENE FORMAT (전문 시나리오 규격 - INT./EXT. 필수)
[Feedback]:\n${producerNote}\n\n
[Current Script]:\n${pipelineData.scenario}\n\n
[Task]: 위 피드백을 반영하여 시나리오를 수정하세요. 모든 씬 헤딩에 INT. 또는 EXT. 를 명시하세요. 수정된 전체 시나리오를 반환하세요.
`;
      executeAgent(fullSystemPrompt, prompt, 'scenario', false, 'Refining Scene Dynamics...');
      return;
    }

    baseTextRef.current = pipelineData.scenario ? (pipelineData.scenario.trim() + "\n\n") : "";
    
    // Calculate the next scene number to prevent duplication
    const lastSceneMatch = pipelineData.scenario ? pipelineData.scenario.match(/S#(\d+)/g) : null;
    const lastSceneNum = lastSceneMatch ? parseInt(lastSceneMatch[lastSceneMatch.length - 1].replace('S#', '')) : 0;
    const nextSceneNum = lastSceneNum + 1;

    const prompt = `
[Mode]: INCREMENTAL DRAFTING (새로운 씬 추가)${genreContext}
[Standard]: MASTER SCENE FORMAT (INT./EXT. 필수)
[Next Scene Start]: S#${nextSceneNum}
[Context]: 
기존 시나리오 요약:\n${pipelineData.scenario ? pipelineData.scenario.slice(-1000) : '없음 (검사 시작)'}\n\n
트리트먼트 내용:\n${pipelineData.treatment}\n\n
[Producer's Note]: 사용자의 특별 지시사항:\n${producerNote}\n\n
[Task]: 위 지단사항을 반영하며 S#${nextSceneNum}부터 시작하여 다음 5개 씬을 집필하세요. 모든 씬 헤딩에 INT./EXT.를 명시적으로 기입하세요. 절대 이전 시나리오 내용을 반복하지 마세요.
`;
    executeAgent(fullSystemPrompt, prompt, 'scenario', true, 'Executing Master Scene Format...');
  };

  const generateReview = () => {
    if (!pipelineData.scenario) { alert("Please generate Scenario first."); return; }
    const prompt = `Full Screenplay Segment:\n${pipelineData.scenario}\n\n이 시나리오가 실제 영화로 제작될 때의 실현 가능성, 예산 효율성, 상업적 매력을 제작자 및 투자자 관점에서 'Brutally Honest'하게 분석하세요. 특히 Robert McKee의 '대항 세력 감사(Antagonism Audit)'를 포함하여 서사적 깊이를 검증하세요.
    [IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요.
    [ANALYSIS_JSON] 
    {
      "emotionalArc": [{"name": "Opener", "valence": 5}, {"name": "Plot Point 1", "valence": -2}, {"name": "Midpoint", "valence": 8}, {"name": "Climax", "valence": 10}],
      "characterMap": [{"subject": "PROTAG", "A": 85, "B": 80}, {"subject": "ANTAG", "A": 90, "B": 95}, {"subject": "SIDEKICK", "A": 40, "B": 30}],
      "beatProgress": [{"completed": 8, "total": 15}]
    }`;
    executeAgent(reviewRule, prompt, 'review', false, 'Performing Production Audit...');
  };

  const TAB_META = {
    CONCEPT: { label: 'CONCEPT', engine: 'Logline Engine', icon: '🎯' },
    ARCHITECTURE: { label: 'ARCHITECTURE', engine: 'Architect AI', icon: '🏛️' },
    TREATMENT: { label: 'TREATMENT', engine: 'Treatment Engine', icon: '🎬' },
    SCENARIO: { label: 'SCENARIO', engine: 'Scenario Writer', icon: '🖋️' },
    REVIEW: { label: 'REVIEW', engine: 'Production Review', icon: '⚖️' },
    VISION: { label: 'VISION', engine: 'Analytic Engine', icon: '📊' }
  };

  const tabs = Object.keys(TAB_META);

  return (
    <div 
      className={`project-detail ${isGenerating ? 'orchestration-active' : ''} ${zenMode ? 'is-zen' : ''}`}
      style={{ '--orchestration-intensity': orchestrationIntensity }}
    >
      {/* 🏙️ STUDIO HEADER: Operational Status & Global Meta */}
      <header className="detail-header">
        <div className="header-meta">
          <div className="back-btn" onClick={onBack}>
            <span>←</span> EXIT STUDIO
          </div>
          <div className="project-title-mini">
            PROJECT: {project.title}
          </div>
          <div className="badge status-badge">
            {project.status || 'DEVELOPMENT'}
          </div>
        </div>

        <div className="orchestration-controls">
          <div className="input-group-row">
            <span className="input-label">📡 OPENROUTER</span>
            <input 
              type="password" 
              className="key-input"
              value={apiKey} 
              onChange={(e) => saveApiKey(e.target.value)} 
            />
          </div>
          <div className="header-actions">
            <button 
              className={`btn-secondary ${zenMode ? 'active' : ''}`}
              onClick={() => setZenMode(!zenMode)}
              title="Spatial Zen Mode"
            >
              {zenMode ? '📡 EXIT ZEN' : '🪐 ZEN MODE'}
            </button>
            <button className="btn-primary" onClick={saveToContext}>
              SAVE CHANGES
            </button>
          </div>
        </div>
      </header>

      {/* 🛰️ AI PROGRESS OVERLAY (Cinematic) */}
      <div className={`status-indicator-bar ${isGenerating ? 'active' : ''}`} />
      <div className={`neural-mesh-overlay ${isGenerating ? 'active' : ''}`}>
        <div className="scan-line" />
      </div>
      
      {isGenerating && (
        <div className="status-text-bubble">
          <div className="status-dot" />
          {generationStatus || 'AI GENERATING...'}
        </div>
      )}

      {/* 🏢 STUDIO CONTAINER: Sidebar & Stage Controller */}
      <div className="studio-container">
        
        {/* 📋 PRODUCTION SIDEBAR (Context & Rules) */}
        <aside className="studio-sidebar">
          <section className="sidebar-section">
            <h4 className="section-title">Narrative Vitals</h4>
            <div className="vitals-row">
              <div className="badge category-badge">{project.category}</div>
              <div className="badge genre-badge">{project.genre}</div>
            </div>
          </section>

          <section className="sidebar-section">
            <h4 className="section-title">Production Controls</h4>
            <div className="control-group">
              <label className="input-label">BINGE-HOOK ENGINE</label>
              <div className="control-item">
                <input 
                  type="checkbox" 
                  checked={bingeHookEnabled} 
                  onChange={(e) => setBingeHookEnabled(e.target.checked)}
                />
                <span className="control-text">Hardened Tension</span>
              </div>
            </div>
            <div className="control-group">
              <label className="input-label">SUBVERSION INTENSITY</label>
              <div className="control-item">
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={clicheSubversionIntensity}
                  onChange={(e) => setClicheSubversionIntensity(parseInt(e.target.value))}
                  className="range-input"
                />
                <div className="range-labels">
                  <span>LO</span>
                  <span className="active-val">{clicheSubversionIntensity}</span>
                  <span>HI</span>
                </div>
              </div>
            </div>
          </section>

          <section className="sidebar-section" style={{ marginTop: 'auto' }}>
            <h4 className="section-title">Director's Notepad</h4>
            <textarea 
              className="logline-editor"
              value={producerNote}
              onChange={(e) => setProducerNote(e.target.value)}
              placeholder="Inject tactical notes here..."
              style={{ minHeight: '120px' }}
            />
          </section>
        </aside>

        {/* 🎬 STAGE CONTROLLER (Tabbed Content) */}
        <main className="studio-main">
          <div className="tabs">
            {tabs.map(tab => (
              <div 
                key={tab} 
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_META[tab].icon} {TAB_META[tab].label}
              </div>
            ))}
          </div>

          <div className="stage-content animate-in" key={activeTab}>
            <div className="stage-header">
              <h2 className="section-title">
                {TAB_META[activeTab].engine}
              </h2>
              <div className="stage-actions">
                <button 
                  className={`btn-secondary ${scriptMode === 'REFINE' ? 'active' : ''}`}
                  onClick={() => setScriptMode(scriptMode === 'DRAFT' ? 'REFINE' : 'DRAFT')}
                >
                  {scriptMode === 'REFINE' ? '⚖️ REFINEMENT MODE' : '⚙️ DRAFT MODE'}
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    if(activeTab === 'CONCEPT') generateConcept();
                    if(activeTab === 'ARCHITECTURE') generateArchitecture();
                    if(activeTab === 'TREATMENT') generateTreatment();
                    if(activeTab === 'SCENARIO') generateScenario();
                    if(activeTab === 'REVIEW') generateReview();
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? generationStatus : `RUN PIPELINE`}
                </button>
              </div>
            </div>
          
          {/* 🔘 ACTION BAR: Contextual Pipeline Controls */}
          {activeTab !== 'VISION' && (
            <div className="action-bar">
              <div className="action-info">
                <span className="input-label">OUTPUT MODE:</span>
                <span className="active-val">{TAB_META[activeTab].engine}</span>
              </div>
              <div className="stage-actions">
                <button 
                  className="btn-accent" 
                  onClick={() => {
                    if(activeTab === 'CONCEPT') generateConcept();
                    if(activeTab === 'ARCHITECTURE') generateArchitecture();
                    if(activeTab === 'TREATMENT') generateTreatment();
                    if(activeTab === 'SCENARIO') generateScenario();
                    if(activeTab === 'REVIEW') generateReview();
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? generationStatus.toUpperCase() : `⚡ EXECUTE ${activeTab}`}
                </button>
              </div>
            </div>
          )}

          {/* 📑 TAB CONTENT AREAS */}
          <div className="tab-pane-container">
            
            {/* 📋 CONTEXTUAL SIDEBAR: Scene Inventory (Contextual to SCENARIO/STORY/TREATMENT) */}
            {(activeTab === 'SCENARIO' || activeTab === 'STORY' || activeTab === 'TREATMENT') && (
              <div className="context-sidebar">
                <div className="context-sidebar-header">
                  SCENE INVENTORY
                </div>
                <div className="context-sidebar-content">
                  {(() => {
                    const completedScenes = pipelineData.scenario ? pipelineData.scenario.match(/S#(\d+)/g) || [] : [];
                    const completedIds = new Set(completedScenes.map(s => parseInt(s.replace('S#', ''))));
                    
                    return [...Array(120)].map((_, i) => {
                      const id = i + 1;
                      const isCompleted = completedIds.has(id);
                      return (
                        <div 
                          key={i} 
                          className={`inventory-item ${selectedSceneId === id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => setSelectedSceneId(id)}
                        >
                          S#{id} {isCompleted ? '✓' : ''}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 🖋️ MAIN EDITOR / VIEWER AREA */}
            <div className="editor-frame" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {activeTab === 'CONCEPT' && (
                <div className="concept-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '800', display: 'block', marginBottom: '8px' }}>IDEA BRIEF</label>
                    <textarea 
                      className="logline-editor"
                      value={conceptBrief}
                      onChange={(e) => setConceptBrief(e.target.value)}
                      placeholder="Enter core idea..."
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '800', display: 'block', marginBottom: '8px' }}>PRODUCTION DIRECTION</label>
                    <textarea 
                      className="logline-editor"
                      value={conceptDirection}
                      onChange={(e) => setConceptDirection(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'VISION' ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <AnalyticsDashboard data={pipelineData.analysisData} />
                </div>
              ) : (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1px' }}>
                    [ SYSTEM_OUTPUT_STREAM :: {activeTab} ]
                  </div>
                  <textarea 
                    ref={outputRef}
                    className={activeTab === 'SCENARIO' ? 'script-view' : 'logline-editor'}
                    style={{ 
                      flex: 1,
                      backgroundColor: activeTab === 'SCENARIO' ? 'white' : 'rgba(0,0,0,0.3)',
                      color: activeTab === 'SCENARIO' ? '#111' : 'var(--text-primary)',
                      resize: 'none',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px'
                    }}
                    value={pipelineData[activeTab.toLowerCase()]}
                    onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
};

export default ProjectDetail;
