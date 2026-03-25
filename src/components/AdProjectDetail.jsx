import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { parseStoryboardFrames } from '../utils/adUtils';
import { OpenRouterAdapter } from '../infrastructure/OpenRouterAdapter';
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

const StoryboardView = ({ raw, imageUrls, onGenerate, onGenerateAll, loadingFrames }) => {
  const [step, setStep] = useState('SCRIPT'); // 'SCRIPT' or 'VISUAL'
  const frames = parseStoryboardFrames(raw);

  if (frames.length === 0) {
    return (
      <div style={{ padding: '20px', color: 'var(--text-dim)' }}>
        {raw ? (
          <div style={{ opacity: 0.6 }}>
            <p>Parsing storyboard structure... (Found {raw.length} chars)</p>
            <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{raw.substring(0, 300)}...</pre>
          </div>
        ) : 'Waiting for CONCEPT ARTIST role to structure storyboard...'}
      </div>
    );
  }

  const isAnyLoading = Object.values(loadingFrames).some(v => v);

  return (
    <div className="storyboard-container">
      <div className="storyboard-step-nav">
        <div 
          className={`step-item ${step === 'SCRIPT' ? 'active' : ''}`}
          onClick={() => setStep('SCRIPT')}
        >
          📝 1. Script Design
        </div>
        <div 
          className={`step-item ${step === 'VISUAL' ? 'active' : ''}`}
          onClick={() => setStep('VISUAL')}
        >
          🎨 2. Concept Sketches
        </div>
      </div>

      {step === 'VISUAL' && (
        <div className="batch-gen-bar">
          <div className="batch-gen-info">
            <strong>Concept Sketch Mode</strong>: 주요 미장센과 구도를 러프한 스케치로 시각화합니다.
          </div>
          <button 
            className="tactical-btn"
            onClick={() => onGenerateAll(frames)}
            disabled={isAnyLoading}
          >
            {isAnyLoading ? 'Processing...' : '🎭 Generate All Sketches'}
          </button>
        </div>
      )}

      <div className={`storyboard-grid ${step === 'VISUAL' ? 'visual-mode' : ''}`}>
        {frames.map((frame, index) => (
          <div key={index} className="storyboard-card">
            <div className="storyboard-visual-placeholder">
              {imageUrls[frame.number] ? (
                <img src={imageUrls[frame.number]} alt={`Frame ${frame.number}`} className="storyboard-image" />
              ) : loadingFrames[frame.number] ? (
                <div className="gen-loading">
                  <div className="spinner"></div>
                  <span>Drawing Sketch...</span>
                </div>
              ) : (
                <button 
                  className="gen-visual-btn"
                  onClick={() => onGenerate(frame.number, frame.sketchPrompt)}
                >
                  🎨 Generate Sketch
                </button>
              )}
              <span className="storyboard-frame-number">#{frame.number}</span>
            </div>
            <div className="storyboard-content">
              {step === 'SCRIPT' && (
                <>
                  <span className="storyboard-label">Visual</span>
                  <p className="storyboard-text">{frame.visual}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                      <span className="storyboard-label">Lighting</span>
                      <p className="storyboard-text" style={{ fontSize: '0.75rem' }}>{frame.lighting}</p>
                    </div>
                    <div>
                      <span className="storyboard-label">Camera</span>
                      <p className="storyboard-text" style={{ fontSize: '0.75rem' }}>{frame.camera}</p>
                    </div>
                  </div>
                </>
              )}
              {step === 'VISUAL' && (
                <div style={{ fontSize: '0.750rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                   {frame.visual.substring(0, 60)}...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('CONCEPT');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  const [adDuration, setAdDuration] = useState(project.adDuration || '30s');
  const [adType, setAdType] = useState(project.genre || 'Brand Film');
  const [creativeRole, setCreativeRole] = useState('CD'); // CD, Copywriter, Art Director
  const [language, setLanguage] = useState('KO'); // KO, EN
  
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
  
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);

  const [storyboardImages, setStoryboardImages] = useState(project.storyboardImages || {});
  const [loadingFrames, setLoadingFrames] = useState({});

  const outputRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    setPipelineData({
      concept: project.concept || '',
      architecture: project.architecture || '',
      treatment: project.treatment || '',
      scenario: project.scenario || '',
      review: project.review || '',
      analysisData: project.analysisData || project.analysis_data || null
    });
    setStoryboardImages(project.storyboardImages || project.storyboard_images || {});
  }, [project]);

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange);

  const saveToContext = () => {
    updateProject(project.id, { 
      ...pipelineData, 
      adDuration, 
      genre: adType, 
      conceptBrief, 
      conceptDirection,
      storyboardImages 
    });
    alert("Campaign Data & Storyboard Saved!");
  };

  const TAB_META = {
    CONCEPT: { label: 'BRIEF', engine: '📝 캠페인 기획안 (Campaign Brief)', icon: '📋' },
    ARCHITECTURE: { label: 'COPY', engine: '✍️ 카피 시안 (Ideation / Copy)', icon: '✍️' },
    TREATMENT: { label: 'STORYBOARD', engine: '🎨 컨셉 아트 (Concept Artist Sketch)', icon: '🎨' },
    SCENARIO: { label: 'A/V SCRIPT', engine: '📽️ 최종 합본 (A/V Production Script)', icon: '📽️' },
    REVIEW: { label: 'AUDIT', engine: '🔍 브랜드 검증 (Brand & Impact Audit)', icon: '🔍' },
    VISION: { label: 'ANALYTICS', engine: '📊 데이터 분석 (AI Impact Matrix)', icon: '📊' }
  };

  const refineBriefWithRole = async () => {
    if (!conceptBrief) return alert("Please enter a basic brief first.");
    setIsOptimizingBrief(true);
    setBriefingResult(null); // Reset previous result
    
    const isCD = creativeRole === 'CD';
    const contextInfo = isCD ? `
[CROSS-ROLE FEEDS]:
- Current Copy (CW): ${pipelineData.architecture || 'None'}
- Current Storyboard (CA): ${pipelineData.treatment || 'None'}
[Note]: As CD, your task is to SYNTHESIZE these inputs into the final Brief/Strategy.
` : '';

    const prompt = `
[Task]: Refine and Synthesize the following Campaign Brief.
[Role]: ${isCD ? 'Strategic Orchestrator / Creative Director' : creativeRole === 'COPY' ? 'Copywriter' : 'Concept Artist'} (${creativeRole})
[Context]: Output structured strategic advice and a refined version of the brief. ${isCD ? 'Harmonize the Copy and Storyboard inputs into this final direction.' : 'Focus on your specific role perspective.'}
${contextInfo}
[Language]: ${language}

Current Brief: ${conceptBrief}

Follow the standards in ## 🏛️ STRATEGIC ORCHESTRATION (CD Persona) and ## 🧠 BRIEFING_OPTIMIZER (CD Persona).
`;

    try {
      let fullResponse = "";
      await executeAgent(prompt, (chunk) => {
        fullResponse += chunk;
        setBriefingResult(fullResponse);
      });
    } catch (error) {
      console.error("Briefing Error:", error);
    } finally {
      setIsOptimizingBrief(false);
    }
  };

  const applyRefinedBrief = () => {
    if (!briefingResult) return;
    // Extract the text between [REFINED BRIEF] indices if present, or take the whole thing
    const match = briefingResult.match(/### \[REFINED BRIEF\]([\s\S]*?)(?=###|$)/i);
    if (match && match[1]) {
      setConceptBrief(match[1].trim());
    } else {
      setConceptBrief(briefingResult);
    }
    setBriefingResult(null);
  };

  const handleGenerateSketch = async (frameNumber, prompt) => {
    if (!prompt) return alert("No sketch prompt available for this frame. Regenerate Storyboard.");
    
    setLoadingFrames(prev => ({ ...prev, [frameNumber]: true }));
    try {
      // Use standard image generation for concept sketches
      const result = await OpenRouterAdapter.generateImage(prompt);
      const url = result.data?.[0]?.url;
      if (url) {
        setStoryboardImages(prev => ({ ...prev, [frameNumber]: url }));
      }
    } catch (error) {
      console.error("Sketch Gen Error:", error);
      alert("Failed to draw sketch: " + error.message);
    } finally {
      setLoadingFrames(prev => ({ ...prev, [frameNumber]: false }));
    }
  };

  const handleGenerateAllSketches = async (frames) => {
    if (!frames || frames.length === 0) return;
    
    for (const frame of frames) {
      if (!storyboardImages[frame.number]) {
        await handleGenerateSketch(frame.number, frame.sketchPrompt);
      }
    }
  };

  const generateContent = (tab) => {
    // RESET LOGIC: Clear dependent data when regenerating
    if (tab === 'TREATMENT') {
      setStoryboardImages({});
      setLoadingFrames({});
    }
    setBriefingResult(null); // Clear assistant results when moving to next stage

    const isCD = creativeRole === 'CD';
    const roleContext = `\n[Role]: ${creativeRole}\n[Language]: ${language}\n[Ad Type]: ${adType}\n[Duration]: ${adDuration}\n[Category]: Commercial\n`;
    const fullSystemPrompt = `${adRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}`;

    let prompt = "";
    let target = tab.toLowerCase();

    if (tab === 'CONCEPT') {
      prompt = `[Task]: BRIEFING PHASE. 아이디어: ${conceptBrief}\n방향성: ${conceptDirection}\n${roleContext}\n위 브리프를 바탕으로 전략적 빅 아이디어와 캠페인 핵심 메시지를 도출하세요.`;
    } else if (tab === 'ARCHITECTURE') {
      const storyboardContext = isCD && pipelineData.treatment ? `\n[Storyboard Sketch Context]:\n${pipelineData.treatment}` : '';
      prompt = `[Task]: COPYWRITING & SYNTHESIS PHASE. 컨셉: ${pipelineData.concept}\n${roleContext}${storyboardContext}\n헤드라인, 바디카피, 브랜드 슬로건을 포함한 다수의 카피 시안을 제안하세요. ${isCD ? '컨셉 아티스트의 시각적 방향성을 카피에 녹여내어 전략적으로 조율하세요.' : ''}`;
    } else if (tab === 'TREATMENT') {
      const visualContext = pipelineData.architecture || pipelineData.concept || conceptBrief;
      prompt = `[Task]: STORYBOARDING PHASE. 컨셉/카피: ${visualContext}\n${roleContext}\nAIDA 구조에 맞춰 각 초수별 시각적 구성과 리듬감을 설계하세요. 각 프레임은 반드시 [FRAME 1], [FRAME 2] 형식을 사용하세요.`;
    } else if (tab === 'SCENARIO') {
      prompt = `[Task]: FINAL A/V SCRIPT. 스토리보드: ${pipelineData.treatment}\n${roleContext}\n현장 투입용 표준 2단 테이블 스크립트를 작성하세요. Visual(미장센)과 Audio(SFX/VO)를 분리하세요.`;
    } else if (tab === 'REVIEW') {
      prompt = `[Task]: BRAND & IMPACT AUDIT. 완료된 시나리오:\n${pipelineData.scenario}\n${roleContext}\n브랜드 가이드라인 준수 여부와 'Brutally Honest'한 소출 기대 효과를 냉정하게 평가하세요. 타겟 소비자에게 전달될 실질적인 메시지 파워를 검증하세요.
      [IMPORTANT]: 분석 완료 시 마지막에 반드시 아래 JSON 형식을 [ANALYSIS_JSON] 태그와 함께 포함하세요. 
      [NOTE]: 아래의 값들은 예시일 뿐입니다. 실제 시나리오의 흐름에 맞는 임의의 다양한 수치(0~10, 0~100)를 직접 계산하여 정교하게 반영하십시오.
      
      [ANALYSIS_JSON] 
      {
        "emotionalArc": [{"name": "Start", "valence": 5}, {"name": "USP", "valence": 8}, {"name": "CTA", "valence": 10}],
        "characterMap": [{"subject": "BRAND", "A": 90, "B": 80}, {"subject": "CONSUMER", "A": 65, "B": 45}],
        "beatProgress": [{"completed": 1, "total": 1}]
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
              {['CD', 'COPY', 'CONCEPT ARTIST'].map(role => (
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>OUTPUT LANGUAGE</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['KO', 'EN'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{ 
                    flex: 1, padding: '8px', 
                    background: language === lang ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  {lang === 'KO' ? 'KOREAN (한글)' : 'ENGLISH'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', margin: 0 }}>📝 CAMPAIGN BRIEF</h4>
              <button 
                className="tactical-btn refine-btn" 
                onClick={refineBriefWithRole}
                disabled={isOptimizingBrief || !conceptBrief}
                style={{ background: 'var(--accent-primary)', color: 'black', padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {isOptimizingBrief ? 'Optimizing...' : creativeRole === 'CD' ? '✨ Synthesize (CD)' : `⚡ Refine (${creativeRole})`}
              </button>
            </div>
            
            <textarea 
              value={conceptBrief}
              onChange={(e) => setConceptBrief(e.target.value)}
              placeholder="Enter core brand requirement..."
              style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)', padding: '10px', marginTop: '10px' }}
            />

            {briefingResult && (
              <div className="briefing-assistant">
                <div className="briefing-header">
                  <span className="briefing-title">🧠 {creativeRole}'s Feedback</span>
                </div>
                <div className="briefing-content">
                  {briefingResult.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                  ))}
                </div>
                <div className="briefing-actions">
                  <button className="refine-btn" onClick={applyRefinedBrief}>Adopt This Brief</button>
                  <button className="tactical-btn" style={{ padding: '6px 12px' }} onClick={() => setBriefingResult(null)}>Discard</button>
                </div>
              </div>
            )}
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
            ) : (activeTab === 'TREATMENT' && (creativeRole === 'CONCEPT ARTIST' || creativeRole === 'CD')) ? (
              <StoryboardView 
                raw={pipelineData.treatment} 
                imageUrls={storyboardImages}
                onGenerate={handleGenerateSketch}
                onGenerateAll={handleGenerateAllSketches}
                loadingFrames={loadingFrames}
              />
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
