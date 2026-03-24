import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';

// Rules
import scenarioRule from '../.agents/rules/scenario_writer.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';

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
      review: project.review || ''
    });
  }, [project]);

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange);

  const saveToContext = () => {
    updateProject(project.id, { ...pipelineData, conceptBrief: seriesConcept });
    alert("Series Data Saved!");
  };

  const TAB_META = {
    BIBLE: { label: 'SERIES BIBLE', engine: 'Series Architect', icon: '📖' },
    EPISODES: { label: 'EPISODE ARC', engine: 'Arc Designer', icon: '🎞️' },
    SCRIPT: { label: 'SCRIPT LAB', engine: 'Episode Writer', icon: '🖋️' },
    REVIEW: { label: 'BINGE AUDIT', engine: 'Hook Auditor', icon: '⚡' }
  };

  const generateContent = (tab) => {
    const context = `\n[Series Category]: Netflix Original\n[Episode]: ${selectedEpisode}/10\n[Binge-Hook Intensity]: ${bingeHookIntensity}/10\n`;
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
      prompt = `[Task]: Binge-Watch & Antagonism Audit. Script Content: ${pipelineData.script}\n${context}\n이 에피소드가 끝났을 때 관객이 즉시 '다음 화' 버튼을 누를 확률을 분석하고, 'Brutally Honest'한 제작 실현 가능성 및 대항 세력(Antagonism)의 깊이를 검증하세요.`;
    }

    executeAgent(fullSystemPrompt, prompt, target);
  };

  return (
    <div className="project-detail-container drama-theme" style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
      <header className="detail-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="back-btn" onClick={onBack}>← BACK TO DASHBOARD</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0' }}>{project.title}</h1>
          <span className="badge category-badge" style={{ background: '#E50914', color: 'white' }}>📺 NETFLIX ORIGINAL SERIES</span>
        </div>
        <button className="tactical-btn" onClick={saveToContext}>💾 SAVE SEASON</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
        {/* Left Control Panel */}
        <div className="section-card glass" style={{ padding: '20px' }}>
          <h3 style={{ color: '#E50914', marginBottom: '20px', letterSpacing: '1px' }}>🧛 SERIES CONTROL</h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>EPISODE SELECTOR (1-10)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {[...Array(10)].map((_, i) => (
                <button 
                  key={i+1}
                  onClick={() => setSelectedEpisode(i+1)}
                  style={{ 
                    padding: '8px 0', 
                    background: selectedEpisode === i+1 ? '#E50914' : 'rgba(255,255,255,0.05)',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: '4px'
                  }}
                >
                  E{i+1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid #E50914', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>BINGE-HOOK INTENSITY</span>
              <span style={{ color: '#E50914' }}>{bingeHookIntensity}</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              value={bingeHookIntensity} 
              onChange={(e) => setBingeHookIntensity(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#E50914' }}
            />
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              Increases the psychological impact of cliffhangers and character stakes.
            </p>
          </div>

          <div className="genre-tactics" style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#E50914', letterSpacing: '1px' }}>
              {GENRE_HINTS[project.genre]?.icon} {project.genre?.toUpperCase()} TACTICS
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {GENRE_HINTS[project.genre]?.cues.map(cue => (
                <span key={cue} style={{ fontSize: '0.65rem', padding: '4px 8px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.2)', borderRadius: '4px', color: 'white' }}>
                  #{cue}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>🎥 SERIES LOGLINE</h4>
            <textarea 
              value={seriesConcept}
              onChange={(e) => setSeriesConcept(e.target.value)}
              placeholder="What is the overall story of this season?"
              style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)', padding: '10px', marginTop: '10px' }}
            />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="section-card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: '800px' }}>
          <div className="tabs" style={{ marginBottom: '20px' }}>
            {Object.keys(TAB_META).map(tab => (
              <div 
                key={tab} 
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_META[tab].icon} {TAB_META[tab].label}
              </div>
            ))}
          </div>

          <div style={{ flexGrow: 1, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#E50914', fontSize: '0.9rem', fontWeight: 'bold' }}>{TAB_META[activeTab].engine} :: EPISODE {selectedEpisode}</span>
              <button 
                className="tactical-btn" 
                onClick={() => generateContent(activeTab)}
                disabled={isGenerating}
                style={{ background: '#E50914', color: 'white' }}
              >
                {isGenerating ? 'Orchestrating Arcs...' : `⚡ RUN ${TAB_META[activeTab].label}`}
              </button>
            </div>
            
            <textarea 
              ref={outputRef}
              className="drama-editor"
              value={pipelineData[activeTab.toLowerCase()]}
              onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
              style={{ 
                width: '100%', height: 'calc(100% - 40px)', background: 'white', 
                color: '#111', padding: '60px 80px', border: '1px solid var(--surface-border)',
                lineHeight: '1.8', fontSize: '1.1rem', resize: 'none',
                fontFamily: activeTab === 'SCRIPT' ? "'Courier Prime', monospace" : 'inherit'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DramaProjectDetail;
