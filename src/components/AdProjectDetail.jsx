import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';

// Rules
import adRule from '../.agents/rules/AD_ENGINE.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';

const AD_GENRE_HINTS = {
  'BrandFilm': { icon: '✨', name: 'Brand Film', cues: ['Cinematic', 'Emotional', 'Poetic', 'Manifesto'] },
  'ProductDemo': { icon: '📦', name: 'Product Demo', cues: ['Hard Sell', 'USP', 'X-Ray View', 'Tech Specs'] },
  'Cinematic': { icon: '🎥', name: 'Cinematic Narrative', cues: ['Storytelling', 'Subtle Branding', 'High Mise-en-scène', 'Character Driven'] },
  'Social': { icon: '🤳', name: 'Social / Digital', cues: ['UGC Style', 'Fast Pace', 'Vertical-ready', 'Hook-first'] }
};

const AdProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('CONCEPT');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  const [adDuration, setAdDuration] = useState(project.adDuration || '30s');
  const [adType, setAdType] = useState(project.genre || 'Brand Film');
  const [creativeRole, setCreativeRole] = useState('CD'); // CD, Copywriter, Art Director
  
  const [pipelineData, setPipelineData] = useState({
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || ''
  });

  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');
  const [conceptDirection, setConceptDirection] = useState(project.conceptDirection || 'Brand Impact First, AIDA Structure');
  const [producerNote, setProducerNote] = useState('');

  const outputRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    setPipelineData({
      concept: project.concept || '',
      architecture: project.architecture || '',
      treatment: project.treatment || '',
      scenario: project.scenario || '',
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

  const saveToContext = () => {
    updateProject(project.id, { ...pipelineData, adDuration, genre: adType, conceptBrief, conceptDirection });
    alert("Ad Project Saved!");
  };

  const TAB_META = {
    CONCEPT: { label: 'BRIEF', engine: 'Creative Brief', icon: '📋' },
    ARCHITECTURE: { label: 'COPY', engine: 'Ideation/Copy', icon: '✍️' },
    TREATMENT: { label: 'STORYBOARD', engine: 'Storyboard/Timing', icon: '🎞️' },
    SCENARIO: { label: 'A/V SCRIPT', engine: 'Master A/V Script', icon: '🎙️' },
    REVIEW: { label: 'AUDIT', engine: 'Brand Audit', icon: '🕵️' },
    VISION: { label: 'VISION', engine: 'Impact Analyst', icon: '📊' }
  };

  const generateContent = (tab) => {
    const roleContext = `\n[Role]: ${creativeRole}\n[Ad Type]: ${adType}\n[Duration]: ${adDuration}\n[Category]: Commercial\n`;
    const fullSystemPrompt = `${adRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}`;

    let prompt = "";
    let target = tab.toLowerCase();

    if (tab === 'CONCEPT') {
      prompt = `[Task]: BRIEFING PHASE. 아이디어: ${conceptBrief}\n방향성: ${conceptDirection}\n${roleContext}\n위 브리프를 바탕으로 전략적 빅 아이디어와 캠페인 핵심 메시지를 도출하세요.`;
    } else if (tab === 'ARCHITECTURE') {
      prompt = `[Task]: COPYWRITING PHASE. 컨셉: ${pipelineData.concept}\n${roleContext}\n헤드라인, 바디카피, 브랜드 슬로건을 포함한 다수의 카피 시안을 제안하세요.`;
    } else if (tab === 'TREATMENT') {
      prompt = `[Task]: STORYBOARDING PHASE. 카피안: ${pipelineData.architecture}\n${roleContext}\nAIDA 구조에 맞춰 각 초수별 시각적 구성과 리듬감을 설계하세요.`;
    } else if (tab === 'SCENARIO') {
      prompt = `[Task]: FINAL A/V SCRIPT. 스토리보드: ${pipelineData.treatment}\n${roleContext}\n현장 투입용 표준 2단 테이블 스크립트를 작성하세요. Visual(미장센)과 Audio(SFX/VO)를 분리하세요.`;
    } else if (tab === 'REVIEW') {
      prompt = `[Task]: BRAND & IMPACT AUDIT. 완료된 시나리오:\n${pipelineData.scenario}\n${roleContext}\n브랜드 가이드라인 준수 여부와 'Brutally Honest'한 소출 기대 효과를 냉정하게 평가하세요. 타겟 소비자에게 전달될 실질적인 메시지 파워를 검증하세요.
      [IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요.
      [ANALYSIS_JSON] 
      {
        "emotionalArc": [{"name": "Start", "valence": 4}, {"name": "USP", "valence": 9}, {"name": "CTA", "valence": 10}],
        "characterMap": [{"subject": "BRAND", "A": 100, "B": 90}, {"subject": "CONSUMER", "A": 70, "B": 50}],
        "beatProgress": [{"completed": 5, "total": 5}]
      }`;
    }

    executeAgent(fullSystemPrompt, prompt, target);
  };

  return (
    <div className="project-detail-container commercial-theme" style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
      <header className="detail-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="back-btn" onClick={onBack}>← BACK TO DASHBOARD</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0' }}>{project.title}</h1>
          <span className="badge category-badge" style={{ background: 'var(--accent-secondary)', color: 'black' }}>💼 COMMERCIAL / AD</span>
        </div>
        <button className="tactical-btn" onClick={saveToContext}>💾 SAVE CAMPAIGN</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
        {/* Left Control Panel */}
        <div className="section-card glass" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '20px' }}>⚙️ CAMPAIGN SPECS</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>DURATION</label>
            <select 
              value={adDuration} 
              onChange={(e) => setAdDuration(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--surface-border)' }}
            >
              <option value="15s">15 Seconds</option>
              <option value="30s">30 Seconds</option>
              <option value="60s">60 Seconds</option>
              <option value="Manifesto">Manifesto (Long-form)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>CREATIVE ROLE</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['CD', 'COPY', 'ART'].map(role => (
                <button 
                  key={role}
                  onClick={() => setCreativeRole(role)}
                  style={{ 
                    flex: 1, padding: '8px', 
                    background: creativeRole === role ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: creativeRole === role ? 'black' : 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>AD GENRE / TYPE</label>
            <select 
              value={adType} 
              onChange={(e) => setAdType(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--surface-border)' }}
            >
              {Object.keys(AD_GENRE_HINTS).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="genre-tactics" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '6px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
              {AD_GENRE_HINTS[adType]?.icon} {adType.toUpperCase()} TACTICS
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {AD_GENRE_HINTS[adType]?.cues.map(cue => (
                <span key={cue} style={{ fontSize: '0.65rem', padding: '3px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', color: 'var(--text-dim)' }}>
                  #{cue}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>📝 CAMPAIGN BRIEF</h4>
            <textarea 
              value={conceptBrief}
              onChange={(e) => setConceptBrief(e.target.value)}
              placeholder="Enter core brand requirement..."
              style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)', padding: '10px', marginTop: '10px' }}
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
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{TAB_META[activeTab].engine}</span>
              <button 
                className="tactical-btn" 
                onClick={() => generateContent(activeTab)}
                disabled={isGenerating}
              >
                {isGenerating ? 'Analyzing...' : `⚡ Run ${TAB_META[activeTab].label} Engine`}
              </button>
            </div>
            
            {activeTab === 'VISION' ? (
              <AnalyticsDashboard data={pipelineData.analysisData} />
            ) : (
              <textarea 
                ref={outputRef}
                className="ad-editor"
                value={pipelineData[activeTab.toLowerCase()]}
                onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                style={{ 
                  width: '100%', height: 'calc(100% - 40px)', background: 'rgba(0,0,0,0.4)', 
                  color: 'white', padding: '20px', border: '1px solid var(--surface-border)',
                  lineHeight: '1.6', fontSize: '1.05rem', resize: 'none'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdProjectDetail;
