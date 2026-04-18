import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';
import SendToStudioButton from './SendToStudioButton';
import StageGateChecklist from './StageGateChecklist';
import PipelineView from './PipelineView';

// Rules
import scenarioRule from '../.agents/rules/scenario_writer.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';

const GENRE_HINTS = {
  'Thriller/Action': { icon: '🔪', cues: ['Shaky Cam', 'Dutch Tilt', 'Jump Cuts', 'Drones'] },
  'Human Drama': { icon: '🫂', cues: ['Deep Focus', 'Long Takes', 'Subtext', 'Ambiance'] },
  'SF/Mystery': { icon: '🛸', cues: ['Wide Shots', 'Neon Contrast', 'Symmetry', 'Synth'] },
  'Comedy/Satire': { icon: '🤡', cues: ['Fast Pan', 'Rule of Three', 'Anticlimax', 'Bright'] }
};

const DramaProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('BIBLE');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [bingeHookIntensity, setBingeHookIntensity] = useState(8);
  const [creativeRole, setCreativeRole] = useState('DIRECTOR'); // DIRECTOR, WRITER, PRODUCER
  const [language, setLanguage] = useState('KO'); // KO, EN
  const [ottPlatform, setOttPlatform] = useState('Netflix');
  const [saveStatus, setSaveStatus] = useState('');
  
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);
  
  const [pipelineData, setPipelineData] = useState({
    bible: project.bible || '',
    episodes: project.episodes || '',
    script: project.script || '',
    review: project.review || ''
  });

  const [seriesConcept, setSeriesConcept] = useState(project.conceptBrief || '');
  const [producerNote, setProducerNote] = useState('');

  const outputRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    setPipelineData({
      bible: project.bible || '',
      episodes: project.episodes || '',
      script: project.script || '',
      review: project.review || '',
      analysisData: project.analysisData || null
    });
  }, [project]);

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange);
  const handleBriefChange = (_field, value) => setBriefingResult(value);
  const { executeAgent: executeBriefAgent } = useAgentEngine(apiKey, handleBriefChange);

  const saveToContext = () => {
    updateProject(project.id, { ...pipelineData, conceptBrief: seriesConcept });
    setSaveStatus('SAVED ✓');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const OTT_PLATFORMS = {
    Netflix:   { color: '#E50914' },
    'Disney+': { color: '#113CCF' },
    'Apple TV+': { color: '#555555' },
    Wavve:     { color: '#0078FF' },
    TVING:     { color: '#FF153C' },
  };

  const getRoleContext = () => `\n[Creative Role]: ${creativeRole}\n[Output Language]: ${language}\n[OTT Platform]: ${ottPlatform}\n`;

  const refineBriefWithRole = async () => {
    if (!seriesConcept) return;
    setIsOptimizingBrief(true);
    setBriefingResult(null);
    
    const contextInfo = `\n[Role]: ${creativeRole}\n[Standard]: Netflix Original Series\n`;
    const prompt = `[Task]: Refine and expand the following series concept/logline.
    [Original Concept]: ${seriesConcept}
    ${contextInfo}
    [Note]: Provide a professional, high-concept expansion with tactical suggestions for the ${creativeRole} role.
    마지막에 반드시 ### [REFINED BRIEF] 태그 뒤에 수정된 최종 기획안을 포함하세요.`;

    try {
      await executeBriefAgent(architectRule, prompt, 'brief', false, 'Synthesizing Series Vision...');
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
      setSeriesConcept(match[1].trim());
    } else {
      setSeriesConcept(briefingResult);
    }
    setBriefingResult(null);
  };

  const TAB_META = {
    BIBLE: { label: 'SERIES BIBLE', engine: 'Showrunner', icon: '📖' },
    EPISODES: { label: 'EPISODE ARC', engine: 'Story Room', icon: '🎞️' },
    SCRIPT: { label: 'TELEPLAY', engine: 'Staff Writer', icon: '🖋️' },
    REVIEW: { label: 'BINGE AUDIT', engine: 'Pitch Master', icon: '⚡' },
    VISION: { label: 'ANALYTICS', engine: 'Series Analyst', icon: '📊' },
    PIPELINE: { label: 'PIPELINE', engine: 'Production Pipeline', icon: '🔀' }
  };

  const generateContent = (tab) => {
    const roleContext = getRoleContext();
    const context = `\n[Series Category]: Netflix Original\n[Episode]: ${selectedEpisode}/10\n[Binge-Hook Intensity]: ${bingeHookIntensity}/10\n${roleContext}`;
    const fullSystemPrompt = `${scenarioRule}\n\n[SERIES RULES]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}`;

    let prompt = "";
    let target = tab.toLowerCase();

    if (tab === 'BIBLE') {
      prompt = `[Task]: Create a Series Bible. Concept: ${seriesConcept}\n${context}\n대서사시의 세계관, 주요 인물들의 시즌 아크, 그리고 작품 전체의 톤앤매너를 설계하세요.`;
    } else if (tab === 'EPISODES') {
      prompt = `[Task]: Design 10-Episode Arc using 15-Beat Framework. Bible: ${pipelineData.bible}\n${context}\n각 에피소드를 15개의 핵심 비트(Opening Image ~ Final Image)로 세분화하여 설계하고, 다음 화를 보게 만드는 'Binge-Hook' 지점을 명확히 하세요.`;
    } else if (tab === 'SCRIPT') {
      prompt = `[Task]: Write Episode Script. Current Arc: ${pipelineData.episodes}\n${context}\n에피소드 ${selectedEpisode}의 오프닝부터 주요 씬 5개를 집필하세요. 모든 씬 헤더에 실내외 구분(INT./EXT.)을 반드시 포함하여 넷플릭스 표준 텐션을 유지하세요.`;
    } else if (tab === 'REVIEW') {
      prompt = `[Task]: Binge-Watch & Antagonism Audit. Script Content: ${pipelineData.script}\n${context}\n이 에피소드가 끝났을 때 관객이 즉시 '다음 화' 버튼을 누를 확률을 분석하고, 'Brutally Honest'한 제작 실현 가능성 및 대항 세력(Antagonism)의 깊이를 검증하세요.
      [IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요.
      [ANALYSIS_JSON] 
      {
        "emotionalArc": [{"name": "Opener", "valence": 7}, {"name": "Cliffhanger", "valence": 9}],
        "characterMap": [{"subject": "PROTAG", "A": 88, "B": 82}],
        "beatProgress": [{"completed": 12, "total": 15}]
      }`;
    }

    executeAgent(fullSystemPrompt, prompt, target);
  };

  return (
    <div className="studio-root">
      <div className="project-detail drama-theme">
      <header className="detail-header">
        <div className="header-left">
          <div className="back-btn" onClick={onBack}>← BACK</div>
          <span className="header-format-label" style={{ color: OTT_PLATFORMS[ottPlatform]?.color || '#E50914' }}>{ottPlatform.toUpperCase()}</span>
        </div>
        <div className="header-title-block">
          <h1 className="header-title">{project.title}</h1>
        </div>
        <div className="header-right">
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

      <div className="studio-container">
        {/* 📋 PRODUCTION SIDEBAR (Context & Rules) */}
        <aside className="studio-sidebar">
          <section className="sidebar-section">
            <h4 className="section-title">Narrative Vitals</h4>
            <div className="vitals-row">
              <div className="badge category-badge" style={{ background: OTT_PLATFORMS[ottPlatform]?.color || '#E50914', color: 'white', border: 'none', fontSize: 'var(--sidebar-badge-fs)' }}>{ottPlatform} Series</div>
              <div className="badge genre-badge" style={{ fontSize: 'var(--sidebar-badge-fs)' }}>{project.genre}</div>
            </div>
          </section>

          <StageGateChecklist project={project} pipelineData={pipelineData} category={project.category} />

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

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">OTT PLATFORM</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {Object.entries(OTT_PLATFORMS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setOttPlatform(key)}
                    className={`btn-secondary ${ottPlatform === key ? 'active' : ''}`}
                    style={{ flex: 1, minWidth: '45%', fontSize: 'var(--sidebar-btn-fs)', borderColor: ottPlatform === key ? val.color : undefined }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">EPISODE</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => setSelectedEpisode(e => Math.max(1, e - 1))} className="btn-secondary" style={{ padding: '4px 8px' }}>◀</button>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                  className="logline-editor"
                  style={{ flex: 1, padding: '4px', minHeight: 'auto', fontSize: 'var(--sidebar-btn-fs)', textAlign: 'center', cursor: 'pointer' }}
                >
                  {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>EP. {i+1}</option>)}
                </select>
                <button onClick={() => setSelectedEpisode(e => Math.min(10, e + 1))} className="btn-secondary" style={{ padding: '4px 8px' }}>▶</button>
              </div>
            </div>

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>BINGE-HOOK INTENSITY</label>
                <span style={{ color: '#E50914', fontSize: '0.8rem', fontWeight: 800 }}>{bingeHookIntensity}</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={bingeHookIntensity} 
                onChange={(e) => setBingeHookIntensity(parseInt(e.target.value))}
                className="range-input"
                style={{ accentColor: '#E50914' }}
              />
            </div>

            <div className="genre-tactics" style={{ marginTop: '15px', padding: '10px', background: 'rgba(229, 9, 20, 0.05)', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.2)' }}>
               <div style={{ fontSize: '0.65rem', color: '#E50914', marginBottom: '5px', fontWeight: 800 }}>
                 {GENRE_HINTS[project.genre]?.icon} {project.genre?.toUpperCase()} TACTICS
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                 {GENRE_HINTS[project.genre]?.cues.map(cue => (
                   <span key={cue} style={{ fontSize: '0.6rem', padding: '2px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                     #{cue}
                   </span>
                 ))}
               </div>
            </div>
          </section>

          <section className="sidebar-section" style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="section-title" style={{ marginBottom: 0 }}>Series Logline</h4>
              <button 
                className="btn-primary" 
                onClick={refineBriefWithRole}
                disabled={isOptimizingBrief || !seriesConcept}
                style={{ padding: '6px 12px', height: 'auto', fontSize: 'var(--sidebar-btn-fs)', background: '#E50914', color: 'white', border: 'none' }}
              >
                {isOptimizingBrief ? '...' : creativeRole === 'DIRECTOR' ? '✨ Synthesize' : `⚡ Refine`}
              </button>
            </div>
            
            <textarea 
              className="logline-editor"
              value={seriesConcept}
              onChange={(e) => setSeriesConcept(e.target.value)}
              placeholder="What is the overall story of this season?"
              style={{ minHeight: '100px', fontSize: '0.85rem' }}
            />

            {briefingResult && (
              <div className="briefing-assistant" style={{ marginTop: '10px', border: '1px solid #E50914', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#E50914', fontWeight: 'bold', marginBottom: '8px' }}>
                  🧠 {creativeRole} AI Insight
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                  {briefingResult}
                </div>
                <div className="control-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={applyRefinedBrief} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: 'var(--sidebar-btn-fs)', background: '#E50914', border: 'none', color: 'white' }}>Adopt</button>
                  <button onClick={() => setBriefingResult(null)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 'var(--sidebar-btn-fs)' }}>Discard</button>
                </div>
              </div>
            )}
          </section>
        </aside>

        {/* 🎬 STAGE CONTROLLER (Tabbed Content) */}
        <main className="studio-main">
          <div className="tabs" style={{ marginBottom: '20px' }}>
            {Object.keys(TAB_META).map(tab => (
              <div 
                key={tab} 
                className={`tab ${activeTab === tab ? 'active' : ''} ${pipelineData[tab.toLowerCase()]?.length > 50 ? 'has-content' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_META[tab].icon} {TAB_META[tab].label}
              </div>
            ))}
          </div>

          <div className="output-frame">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
              <span style={{ color: '#E50914', fontSize: '0.9rem', fontWeight: 'bold' }}>{TAB_META[activeTab].engine} :: EPISODE {selectedEpisode}</span>
              <button
                className="tactical-btn"
                onClick={() => generateContent(activeTab)}
                disabled={isGenerating}
                style={{ background: '#E50914', color: 'white', border: 'none' }}
              >
                {isGenerating ? 'Orchestrating...' : `⚡ RUN ${TAB_META[activeTab].label}`}
              </button>
            </div>

            {activeTab === 'PIPELINE' ? (
              <div style={{ flex: 1, overflow: 'hidden', minHeight: '500px' }}>
                <PipelineView project={project} pipelineData={pipelineData} category={project.category} />
              </div>
            ) : activeTab === 'VISION' ? (
              <AnalyticsDashboard data={pipelineData.analysisData} />
            ) : (
              <textarea
                ref={outputRef}
                className={activeTab === 'SCRIPT' ? 'script-view' : 'logline-editor'}
                value={pipelineData[activeTab.toLowerCase()]}
                onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                style={{ lineHeight: '1.8', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  </div>
);
};

export default DramaProjectDetail;
