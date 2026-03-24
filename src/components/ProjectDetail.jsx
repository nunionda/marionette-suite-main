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

    baseTextRef.current = pipelineData.scenario ? (pipelineData.scenario + "\n\n") : "";
    const prompt = `
[Mode]: INCREMENTAL DRAFTING (새로운 씬 추가)${genreContext}
[Standard]: MASTER SCENE FORMAT (INT./EXT. 필수)
[Context]: 트리트먼트 내용:\n${pipelineData.treatment}\n\n
[Producer's Note]: 사용자의 특별 지시사항:\n${producerNote}\n\n
[Task]: 위 지단사항을 반영하며 다음 5개 씬을 집필하세요. 모든 씬 헤딩에 INT./EXT.를 명시적으로 기입하세요. (예: S#1. INT. 거실 - 밤)
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
    <div className="project-detail-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
      <header className="detail-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="back-btn" onClick={onBack}>
          ← BACK TO DASHBOARD
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>{project.title}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge category-badge">{project.category || 'Movie'}</span>
            <span className="badge genre-badge">{project.genre || 'Thriller'}</span>
            <span className="badge status-badge">{project.status || 'Active'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>🔑 OPENROUTER API KEY</span>
          <input 
            type="password" 
            placeholder="sk-or-v1-..." 
            value={apiKey} 
            onChange={(e) => saveApiKey(e.target.value)} 
            style={{ width: '220px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', outline: 'none' }}
          />
          <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)', margin: '0 8px' }}></div>
          <button className="tactical-btn" onClick={saveToContext} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💾</span> SAVE ALL
          </button>
        </div>
      </header>

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

      <div className="content" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div className="section-card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: '1600px', position: 'relative', overflow: 'hidden' }}>
          {/* 🛰️ Stage 2.1 AI Progress Indicators */}
          {isGenerating && (
            <>
              <div className="status-indicator-bar" />
              <div className="status-text-bubble">
                <div className="status-dot" />
                {generationStatus}
              </div>
              <div className="neural-mesh-overlay active">
                <div className="scan-line" />
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {TAB_META[activeTab].engine}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`tactical-btn ${scriptMode === 'REFINE' ? 'active' : ''}`}
                onClick={() => setScriptMode(scriptMode === 'DRAFT' ? 'REFINE' : 'DRAFT')}
                style={{ background: scriptMode === 'REFINE' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.1)', color: scriptMode === 'REFINE' ? 'black' : 'white', fontSize: '0.8rem' }}
              >
                {scriptMode === 'REFINE' ? '⚖️ REFINE MODE ON' : '⚙️ DRAFT MODE'}
              </button>
              <button 
                className="tactical-btn" 
                onClick={() => {
                  if(activeTab === 'CONCEPT') generateConcept();
                  if(activeTab === 'ARCHITECTURE') generateArchitecture();
                  if(activeTab === 'TREATMENT') generateTreatment();
                  if(activeTab === 'SCENARIO') generateScenario();
                  if(activeTab === 'REVIEW') generateReview();
                }}
                disabled={isGenerating}
                style={{ background: isGenerating ? 'transparent' : 'var(--accent-primary)', color: isGenerating ? 'var(--accent-primary)' : 'black', padding: '12px 24px', fontWeight: 'bold' }}
              >
                {isGenerating ? generationStatus : `⚡ ${scriptMode === 'REFINE' && activeTab === 'SCENARIO' ? 'Refine' : 'Run'} ${TAB_META[activeTab].engine}`}
              </button>
            </div>
          </div>
          
          {/* Concept Input Form (Only visible in CONCEPT tab) */}
          {activeTab === 'CONCEPT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px', padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>[단계 1] 아이디어 및 주제 (Brief)</label>
                <textarea 
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', padding: '12px', color: 'white', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                  value={conceptBrief}
                  onChange={(e) => setConceptBrief(e.target.value)}
                  placeholder="예: 해커가 재벌 회장의 뇌파 금고를 턴다"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>[단계 2] 기획 방향성 (Direction)</label>
                <textarea 
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', padding: '12px', color: 'white', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                  value={conceptDirection}
                  onChange={(e) => setConceptDirection(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ flexGrow: 1, display: 'flex', gap: '20px', marginTop: '16px', overflow: 'hidden' }}>
            {/* 📋 Scene Inventory Sidebar (Only for SCENARIO/ARCHITECTURE) */}
            {(activeTab === 'SCENARIO' || activeTab === 'ARCHITECTURE') && (
              <div style={{ width: '280px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--accent-primary)', letterSpacing: '2px' }}>🎞️ SCENE INVENTORY (120)</h4>
                <div style={{ flexGrow: 1, overflowY: 'auto', fontSize: '0.8rem', paddingRight: '5px' }}>
                  {[...Array(120)].map((_, i) => {
                    const id = i + 1;
                    return (
                      <div 
                        key={id} 
                        onClick={() => setSelectedSceneId(id)}
                        style={{ 
                          padding: '8px 10px', 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          color: id <= 10 ? 'var(--accent-secondary)' : '#666', 
                          cursor: 'pointer',
                          background: selectedSceneId === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                          display: 'flex', 
                          justifyContent: 'space-between',
                          borderRadius: '4px',
                          marginBottom: '2px'
                        }}>
                        <span>S#{id} {id <= 10 ? '✓' : ''}</span>
                        <span style={{ fontSize: '0.7rem' }}>{id <= 10 ? 'DONE' : 'PENDING'}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--accent-secondary)', letterSpacing: '1px' }}>🛠️ NARRATIVE CONTROLS</h4>
                  
                  <div className="control-item" style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>BINGE-HOOK AI</span>
                      <input 
                        type="checkbox" 
                        checked={bingeHookEnabled} 
                        onChange={(e) => setBingeHookEnabled(e.target.checked)}
                      />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Forces cliffhangers between episodes/acts.</div>
                  </div>

                  <div className="control-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>ANTI-SLOP INTENSITY</span>
                      <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{clicheSubversionIntensity}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={clicheSubversionIntensity} 
                      onChange={(e) => setClicheSubversionIntensity(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>

                  <div className="genre-tactics" style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                      {GENRE_HINTS[project.genre]?.icon} {project.genre} TACTICS
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {GENRE_HINTS[project.genre]?.cues?.map(cue => (
                        <span key={cue} style={{ fontSize: '0.65rem', padding: '3px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', color: 'var(--text-dim)' }}>
                          #{cue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedSceneId && activeTab === 'SCENARIO' && (
                <div style={{ background: 'rgba(var(--accent-primary-rgb), 0.1)', border: '1px solid var(--accent-primary)', borderRadius: '8px', padding: '15px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1rem' }}>📌 S#{selectedSceneId} Metadata</h3>
                    <button onClick={() => setSelectedSceneId(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-dim)' }}>Location:</span> {selectedSceneId === 1 ? '강의 펜트하우스' : selectedSceneId === 2 ? '지하 서버실' : '...'}</div>
                    <div><span style={{ color: 'var(--text-dim)' }}>Conflict:</span> {selectedSceneId === 1 ? '폭락의 전조' : '...'}</div>
                    <div><span style={{ color: 'var(--text-dim)' }}>Goal:</span> {selectedSceneId === 1 ? '리스크 관리' : '...'}</div>
                    <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-dim)' }}>Twist:</span> {selectedSceneId === 1 ? '오차가 아닌 시스템의 의도적 조작임' : '...'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'SCENARIO' && (
                <div style={{ marginBottom: '12px', borderLeft: '4px solid var(--accent-secondary)', paddingLeft: '15px' }}>
                  <label style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🎬 {scriptMode === 'REFINE' ? 'REFINEMENT DIRECTIVE' : "PRODUCER'S NOTE"}</span>
                    {selectedSceneId && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Targeting S#{selectedSceneId}</span>}
                  </label>
                  <textarea 
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', padding: '12px', color: 'white', borderRadius: '4px', fontSize: '1rem', marginTop: '8px', outline: 'none', minHeight: '80px' }}
                    value={producerNote}
                    onChange={(e) => setProducerNote(e.target.value)}
                    placeholder={scriptMode === 'REFINE' ? `명령 예: "S#${selectedSceneId || 'X'}의 대사를 좀 더 건조하게 바꾸고 미장센을 강화해줘."` : "다음 5개 씬에 대한 지시사항을 입력하세요."}
                  />
                </div>
              )}
              
              <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '0.9rem' }}>
                ▾ {TAB_META[activeTab].engine} Cinema View ▾
              </div>

              {activeTab === 'VISION' ? (
                <AnalyticsDashboard data={pipelineData.analysisData} />
              ) : (
                <textarea 
                  ref={outputRef}
                  className="logline-editor" 
                  style={{ 
                    flexGrow: 1, 
                    resize: 'none', 
                    background: activeTab === 'SCENARIO' ? '#f5f5f5' : 'rgba(0,0,0,0.3)', 
                    color: activeTab === 'SCENARIO' ? '#111' : 'white',
                    lineHeight: '1.8', 
                    fontSize: '1.1rem', 
                    padding: activeTab === 'SCENARIO' ? '60px 80px' : '20px',
                    fontFamily: activeTab === 'SCENARIO' ? "'Courier Prime', 'Courier New', Courier, monospace" : 'inherit',
                    boxShadow: activeTab === 'SCENARIO' ? 'inset 0 0 50px rgba(0,0,0,0.1)' : 'none',
                    borderRadius: '12px',
                    border: '1px solid var(--surface-border)'
                  }}
                  value={pipelineData[activeTab.toLowerCase()]}
                  onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                  disabled={isGenerating}
                  placeholder={`Scenario will appear as a professional script here...`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
