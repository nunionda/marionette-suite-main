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
import adRule from '../.agents/rules/AD_ENGINE.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';
import SendToStudioButton from './SendToStudioButton';

const GENRE_HINTS = {
  'Thriller/Action': { icon: '🔪', cues: ['Shaky Cam', 'Dutch Tilt', 'Jump Cuts', 'Drones'] },
  'Human Drama': { icon: '🫂', cues: ['Deep Focus', 'Long Takes', 'Subtext', 'Ambiance'] },
  'SF/Mystery': { icon: '🛸', cues: ['Wide Shots', 'Neon Contrast', 'Symmetry', 'Synth'] },
  'Comedy/Satire': { icon: '🤡', cues: ['Fast Pan', 'Rule of Three', 'Anticlimax', 'Bright'] }
};

const PRODUCTION_STANDARDS = {
  'GL_TENTPOLE': { 
    label: 'Global Tentpole', 
    rules: 'Maximize high-stakes spectacle, 3-act structure with 8 sequences, clear hero\'s journey, and global market appeal.' 
  },
  'KR_COMMERCIAL': { 
    label: 'K-Commercial Standard', 
    rules: 'Focus on emotional catharsis, fast-paced narrative twists, high-density dialogue subtext, and Korean domestic market archetypes.' 
  },
  'INDIE_NOIR': { 
    label: 'Indie Noir', 
    rules: 'Experimental structure, heavy subtext, low-key lighting descriptions, and non-linear character arcs.' 
  }
};

const ProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('CONCEPT');
  const [zenMode, setZenMode] = useState(false);
  const [orchestrationIntensity, setOrchestrationIntensity] = useState(1);
  const [productionStandard, setProductionStandard] = useState('GL_TENTPOLE');
  const [styleIntensity, setStyleIntensity] = useState(5); // Stage-aware intensity
  const [creativeRole, setCreativeRole] = useState('DIRECTOR'); // DIRECTOR, WRITER, PRODUCER
  const [language, setLanguage] = useState('KO'); // KO, EN
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);
  
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
  const [scenes, setScenes] = useState([]); // High-density outline from projectOutcome table
  const [scriptMode, setScriptMode] = useState('DRAFT'); // 'DRAFT' or 'REFINE'
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [isOutlineLoading, setIsOutlineLoading] = useState(false);
  
  // Advanced Narrative Controls
  const [bingeHookEnabled, setBingeHookEnabled] = useState(project.isNetflixStandard || false);
  const [clicheSubversionIntensity, setClicheSubversionIntensity] = useState(5); // 1-10
  const [saveStatus, setSaveStatus] = useState('');

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
    fetchOutline();
  }, [project]);

  const fetchOutline = async () => {
    if (!project.id) return;
    setIsOutlineLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/outline`);
      const data = await res.json();
      if (data.success) {
        setScenes(data.outline || []);
      }
    } catch (e) {
      console.error("Failed to fetch scenes outline.");
    } finally {
      setIsOutlineLoading(false);
    }
  };

  const saveOutline = async (newScenes) => {
    try {
      await fetch(`/api/projects/${project.id}/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: newScenes })
      });
      setScenes(newScenes);
    } catch (e) {
      console.error("Failed to save outline.");
    }
  };

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  // 1. Instantiate Application Layer (Engine Hook)
  const { executeAgent, isGenerating, generationStatus } = useAgentEngine(apiKey, handleDataChange);
  const handleBriefChange = (_field, value) => setBriefingResult(value);
  const { executeAgent: executeBriefAgent } = useAgentEngine(apiKey, handleBriefChange);

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
    setSaveStatus('SAVED ✓');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const getRoleContext = () => `\n[Creative Role]: ${creativeRole}\n[Output Language]: ${language}\n`;

  const refineBriefWithRole = async () => {
    if (!conceptBrief) { setSaveStatus('⚠ Enter a brief first'); setTimeout(() => setSaveStatus(''), 2000); return; }
    setIsOptimizingBrief(true);
    setBriefingResult(null);
    
    const contextInfo = `\n[Role]: ${creativeRole}\n[Standard]: ${PRODUCTION_STANDARDS[productionStandard].label}\n`;
    const prompt = `[Task]: Refine and expand the following creative brief.
    [Original Brief]: ${conceptBrief}
    ${contextInfo}
    [Note]: Provide a professional, high-concept expansion with tactical suggestions for the ${creativeRole} role.
    마지막에 반드시 ### [REFINED BRIEF] 태그 뒤에 수정된 최종 기획안을 포함하세요.`;

    try {
      await executeBriefAgent(architectRule, prompt, 'brief', false, 'Synthesizing Creative Brief...');
    } catch (error) {
      console.error("Briefing Error:", error);
    } finally {
      setIsOptimizingBrief(false);
    }
  };

  const applyRefinedBrief = () => {
    if (!briefingResult) return;
    const match = briefingResult.match(/### \[REFINED BRIEF\]([\s\S]*?)(?=###|$)/i);
    if (match && match[1]) {
      setConceptBrief(match[1].trim());
    } else {
      setConceptBrief(briefingResult);
    }
    setBriefingResult(null);
  };

  // Agent UseCase Triggers
  const generateConcept = () => {
    if (!conceptBrief.trim()) {
      setSaveStatus('⚠ 아이디어를 먼저 입력하세요'); setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    
    const standardRules = PRODUCTION_STANDARDS[productionStandard].rules;
    
    executeAgent(
      loglineRule, 
      `[Production Standard]: ${standardRules}${getRoleContext()}\n[Creative Brief]: ${conceptBrief}\n[Direction]: ${conceptDirection}\n\n[Task]: 위의 기획 방향성과 표준을 바탕으로, 글로벌 시장에서 통용될 수 있는 강력한 하이컨셉과 로그라인을 도출하세요.`, 
      'concept',
      false,
      'Conceptualizing Vision...'
    );
  };

  // 1.5 Handle parse and save outline from AI response
  useEffect(() => {
    if (activeTab === 'TREATMENT' && pipelineData.treatment && pipelineData.treatment.includes('```json')) {
      try {
        const jsonStr = pipelineData.treatment.split('```json')[1].split('```')[0].trim();
        const data = JSON.parse(jsonStr);
        if (data.step_outline && Array.isArray(data.step_outline)) {
            const formatted = data.step_outline.map((s, i) => ({
                sceneNumber: i + 1,
                description: typeof s === 'string' ? s : (s.description || s.title || "Untitled Scene")
            }));
            // Only auto-save if significantly different to avoid loops
            if (formatted.length !== scenes.length) {
                saveOutline(formatted);
            }
        }
      } catch (e) {
        // Parsing might fail during streaming
        console.debug("Outline parse pending...");
      }
    }
  }, [pipelineData.treatment]);

  const generateArchitecture = () => {
    if (!pipelineData.concept) { setSaveStatus('⚠ Generate CONCEPT first'); setTimeout(() => setSaveStatus(''), 2000); return; }
    const standardRules = PRODUCTION_STANDARDS[productionStandard].rules;
    
    executeAgent(
      architectRule, 
      `[Production Standard]: ${standardRules}${getRoleContext()}\n[Concept]: ${pipelineData.concept}\n\n[Task]: 위 컨셉과 제작 표준을 바탕으로 3막 구조의 시놉시스와 캐릭터 시트를 설계하세요.`, 
      'architecture', 
      false, 
      'Drafting Structural Blueprint...'
    );
  };

  const generateTreatment = () => {
    if (!pipelineData.architecture) { setSaveStatus('⚠ Generate ARCHITECTURE first'); setTimeout(() => setSaveStatus(''), 2000); return; }
    
    const isExpanding = scenes.length > 0;
    const prompt = isExpanding 
      ? `현재 트리트먼트 상태 (씬 ${scenes.length}개):\n${scenes.map(s => `S#${s.sceneNumber}. ${s.description}`).join('\n')}\n\n[TASK]: 위 리스트를 유지하며, 장편 규격(100씬 내외)에 맞게 서사를 대폭 확장하세요. 기존 씬들 사이사이에 마이크로 비트를 추가하여 드라마틱한 텐션을 확보하세요. 반드시 전체 구성을 포함한 새로운 JSON Step Outline을 반환하세요.`
      : `Synopsis & Characters:\\n${pipelineData.architecture}\\n\\n이를 헐리우드 표준 3막 8시퀀스 및 Save the Cat 15비트 구조에 맞게 배열하고 장편 상업영화 규격(100씬 내외)의 고밀도 Step Outline을 작성하세요.`;

    executeAgent(treatmentRule, `${getRoleContext()}${prompt}`, 'treatment', false, isExpanding ? 'Expanding Narrative Density...' : 'Sequencing Beat Sheet...');
  };

  const generateScenario = () => {
    if (!pipelineData.treatment) { setSaveStatus('⚠ Generate TREATMENT first'); setTimeout(() => setSaveStatus(''), 2000); return; }
    
    const standardRules = PRODUCTION_STANDARDS[productionStandard].rules;
    const styleContext = activeTab === 'SCENARIO' ? `\n[Dialogue Density]: ${styleIntensity}/10\n` : '';
    
    const genreContext = `\n[Genre Mode]: ${project.genre}\n[Category]: ${project.category}\n[Standard Rules]: ${standardRules}\n[Binge-Hook]: ${bingeHookEnabled ? 'ENABLED' : 'DISABLED'}\n[Cliché Subversion]: Intensity ${clicheSubversionIntensity}/10${styleContext}${getRoleContext()}\n`;
    
    // Choose the base engine rule based on project category
    const baseEngineRule = project.category === 'Commercial' ? adRule : scenarioRule;
    
    const fullSystemPrompt = `${baseEngineRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}\n\n[CLICHE STRATEGY]\n${clicheRules}\n\n[PRODUCTION STANDARD]\n${standardRules}`;

    if (scriptMode === 'REFINE') {
      const targetScene = selectedSceneId ? `S#${selectedSceneId}` : '전체';
      const prompt = `
[Mode]: DIRECTOR'S REFINEMENT (대상: ${targetScene})${genreContext}
[Standard]: MASTER SCENE FORMAT (전문 시나리오 규격)${styleContext}
[Feedback]:\n${producerNote}\n\n
[Current Script]:\n${pipelineData.scenario}\n\n
[Task]: 위 피드백과 스타일 규격을 반영하여 시나리오를 수정하세요.
`;
      executeAgent(fullSystemPrompt, prompt, 'scenario', false, 'Refining Scene Dynamics...');
      return;
    }

    baseTextRef.current = pipelineData.scenario ? (pipelineData.scenario.trim() + "\n\n") : "";
    
    const lastSceneMatch = pipelineData.scenario ? pipelineData.scenario.match(/S#(\d+)/g) : null;
    const lastSceneNum = lastSceneMatch ? parseInt(lastSceneMatch[lastSceneMatch.length - 1].replace('S#', '')) : 0;
    const nextSceneNum = lastSceneNum + 1;

    const prompt = `
[Mode]: INCREMENTAL DRAFTING (새로운 씬 추가)${genreContext}
[Standard]: MASTER SCENE FORMAT${styleContext}
[Next Scene Start]: S#${nextSceneNum}
[Context]: 
기존 시나리오 요약:\n${pipelineData.scenario ? pipelineData.scenario.slice(-1000) : '없음'}\n\n
상세 트리트먼트 씬 리스트:\n${scenes.map(s => `S#${s.sceneNumber}. ${s.description}`).join('\n')}\n\n
[Producer's Note]:\n${producerNote}\n\n
[Task]: S#${nextSceneNum}부터 시작하여 다음 씬을 집필하세요. 제작 표준(${productionStandard})과 스타일 강도(${styleIntensity})를 엄수하세요.
`;
    executeAgent(fullSystemPrompt, prompt, 'scenario', true, 'Executing Master Scene Format...');
  };

  const generateReview = () => {
    if (!pipelineData.scenario) { setSaveStatus('⚠ Generate SCENARIO first'); setTimeout(() => setSaveStatus(''), 2000); return; }
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

  const generateContent = (tab) => {
    switch (tab) {
      case 'CONCEPT': return generateConcept();
      case 'ARCHITECTURE': return generateArchitecture();
      case 'TREATMENT': return generateTreatment();
      case 'SCENARIO': return generateScenario();
      case 'REVIEW': return generateReview();
      default: break;
    }
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
    <div className="studio-root">
      <div 
        className={`project-detail ${project.category === 'Commercial' ? 'ad-theme' : 'drama-theme'} ${isGenerating ? 'orchestration-active' : ''} ${zenMode ? 'is-zen' : ''}`}
      >
      {/* 🏙️ STUDIO HEADER: Operational Status & Global Meta */}
      <header className="detail-header">
        <div className="header-left">
          <div className="back-btn" onClick={onBack}>← BACK</div>
          <span className="header-format-label">{project.category.toUpperCase()}</span>
        </div>
        <div className="header-title-block">
          <h1 className="header-title">{project.title}</h1>
        </div>
        <div className="header-right">
          <div className="header-mode-controls">
            <button
              className={`mode-btn ${zenMode ? 'active' : ''}`}
              onClick={() => setZenMode(!zenMode)}
              title="Zen Mode"
            >
              {zenMode ? 'EXIT ZEN' : 'ZEN'}
            </button>
            <input
              type="password"
              className="key-input-inline"
              placeholder="OpenRouter API Key"
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
            />
          </div>
          <div className="header-divider" />
          <div className="header-save-controls">
            <SendToStudioButton
              scriptWriterProjectId={project.id}
              scriptData={pipelineData}
            />
            <button className="tactical-btn" onClick={saveToContext}>SAVE</button>
            {saveStatus && <span className="save-toast">{saveStatus}</span>}
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
              <div className="badge category-badge" style={{ fontSize: 'var(--sidebar-badge-fs)' }}>{project.category}</div>
              <div className="badge genre-badge" style={{ fontSize: 'var(--sidebar-badge-fs)' }}>{project.genre}</div>
            </div>
          </section>

          <section className="sidebar-section">
            <h4 className="section-title">Production Controls</h4>
            
            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">CREATIVE ROLE</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['DIRECTOR', 'WRITER', 'PRODUCER'].map(role => (
                  <button 
                    key={role}
                    onClick={() => setCreativeRole(role)}
                    className={`btn-secondary ${creativeRole === role ? 'active' : ''}`}
                    style={{ flex: 1, fontSize: 'var(--sidebar-btn-fs)' }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">LANGUAGE</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['KO', 'EN'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`btn-secondary ${language === lang ? 'active' : ''}`}
                    style={{ flex: 1, fontSize: 'var(--sidebar-btn-fs)' }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="input-label">PRODUCTION STANDARD</label>
              <select 
                value={productionStandard} 
                onChange={(e) => setProductionStandard(e.target.value)}
                className="logline-editor"
                style={{ fontSize: '0.8rem', padding: '8px', minHeight: 'auto' }}
              >
                {Object.keys(PRODUCTION_STANDARDS).map(std => (
                  <option key={std} value={std}>{PRODUCTION_STANDARDS[std].label}</option>
                ))}
              </select>
            </div>

            <div className="genre-tactics" style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 'var(--sidebar-badge-fs)', color: 'var(--accent-primary)', marginBottom: '5px' }}>
                 {GENRE_HINTS[project.genre]?.icon} {project.genre?.toUpperCase()} TACTICS
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                 {GENRE_HINTS[project.genre]?.cues.map(cue => (
                   <span key={cue} style={{ fontSize: 'var(--sidebar-badge-fs)', padding: '2px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', color: 'var(--text-muted)' }}>
                     #{cue}
                   </span>
                 ))}
               </div>
            </div>
          </section>

          <section className="sidebar-section">
            <h4 className="section-title">
              {activeTab === 'SCENARIO' ? 'Script Stylometrics' : 'Agent Guardrails'}
            </h4>
            
            {activeTab === 'SCENARIO' ? (
              <>
                <div className="control-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>DIALOGUE DENSITY</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{styleIntensity}/10</span>
                  </label>
                  <input
                    type="range" min="1" max="10"
                    value={styleIntensity}
                    onChange={(e) => setStyleIntensity(parseInt(e.target.value))}
                    className="range-input"
                  />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    {styleIntensity <= 3 ? 'Minimal — action-driven' : styleIntensity <= 7 ? 'Balanced — subtext & action' : 'Dense — dialogue-heavy'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="control-group">
                  <label className="input-label">NARRATIVE TENSION</label>
                  <div className="control-item">
                    <input 
                      type="checkbox" 
                      checked={bingeHookEnabled} 
                      onChange={(e) => setBingeHookEnabled(e.target.checked)}
                    />
                    <span className="control-text">Cliche Subversion</span>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="sidebar-section" style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="section-title" style={{ marginBottom: 0 }}>Idea Brief</h4>
              <button 
                className="btn-primary" 
                onClick={refineBriefWithRole}
                disabled={isOptimizingBrief || !conceptBrief}
                style={{ padding: '6px 12px', height: 'auto', fontSize: 'var(--sidebar-btn-fs)' }}
              >
                {isOptimizingBrief ? '...' : creativeRole === 'DIRECTOR' ? '✨ Synthesize' : `⚡ Refine`}
              </button>
            </div>
            
            <textarea 
              className="logline-editor"
              value={conceptBrief}
              onChange={(e) => setConceptBrief(e.target.value)}
              placeholder="Enter core idea..."
              style={{ minHeight: '100px', fontSize: '0.85rem' }}
            />

            {briefingResult && (
              <div className="briefing-assistant" style={{ marginTop: '10px', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                  🧠 {creativeRole} AI Insight
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                  {briefingResult}
                </div>
                <div className="control-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={applyRefinedBrief} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>Adopt</button>
                  <button onClick={() => setBriefingResult(null)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>Discard</button>
                </div>
              </div>
            )}
          </section>
        </aside>

        {/* 🎬 STAGE CONTROLLER (Tabbed Content) */}
        <main className="studio-main">
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''} ${pipelineData[tab.toLowerCase()]?.length > 50 ? 'has-content' : ''}`}
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
                  onClick={() => generateContent(activeTab)}
                  disabled={isGenerating}
                  style={{ padding: '8px 20px', minWidth: '160px' }}
                >
                  {isGenerating ? 'Computing...' : `⚡ RUN ${TAB_META[activeTab].label}`}
                </button>
              </div>
            </div>
          

          {/* 📑 TAB CONTENT AREAS */}
          <div className="tab-pane-container">
            
            {/* 📋 CONTEXTUAL SIDEBAR: Scene Inventory (Contextual to SCENARIO/STORY/TREATMENT) */}
            {(activeTab === 'SCENARIO' || activeTab === 'TREATMENT') && (
              <div className="context-sidebar">
                <div className="context-sidebar-header">
                  SCENE INVENTORY
                </div>
                <div className="context-sidebar-content">
                  {scenes.map((s, i) => {
                    const id = s.sceneNumber || (i + 1);
                    const completedScenes = pipelineData.scenario ? pipelineData.scenario.match(/S#(\d+)/g) || [] : [];
                    const completedIds = new Set(completedScenes.map(s => parseInt(s.replace('S#', ''))));
                    const isCompleted = completedIds.has(id);
                    
                    return (
                      <div 
                        key={i} 
                        className={`inventory-item ${selectedSceneId === id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        onClick={() => setSelectedSceneId(id)}
                      >
                        S#{id} {isCompleted ? '✓' : ''}
                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.description}
                        </div>
                      </div>
                    );
                  })}
                  
                  {scenes.length === 0 && !isOutlineLoading && (
                    <div style={{ padding: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No outline found. Execute Treatment to populate.
                    </div>
                  )}
                  {isOutlineLoading && (
                    <div className="status-dot" style={{ margin: '20px auto' }} />
                  )}
                </div>
              </div>
            )}

            {/* 🖋️ MAIN EDITOR / VIEWER AREA */}
            <div className="editor-frame" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Concept Inputs removed (now in sidebar) */}

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
                    placeholder={`[ ${activeTab} ] 아래 IDEA BRIEF를 입력하고 GENERATE를 눌러 시작하세요.`}
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
</div>
);
};

export default ProjectDetail;
