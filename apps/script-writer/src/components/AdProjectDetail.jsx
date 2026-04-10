import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { parseStoryboardFrames } from '../utils/adUtils';
import { OpenRouterAdapter } from '../infrastructure/OpenRouterAdapter';
import { getStyleGuideForGenre } from '../config/visualStyles';
import { 
  getBriefingPrompt, 
  getArchitecturePrompt, 
  getTreatmentPrompt, 
  getScenarioPrompt, 
  getReviewPrompt, 
  getRefinementPrompt 
} from '../infrastructure/adOrchestrator';
import '../styles/ProjectDetail.css';

// Rules
import adRule from '../.agents/rules/AD_ENGINE.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';
import ScriptTableView from './ScriptTableView';

const AD_GENRE_HINTS = {
  'BrandFilm': { icon: '✨', name: 'Brand Film', cues: ['Cinematic', 'Emotional', 'Poetic', 'Manifesto'] },
  'ProductDemo': { icon: '📦', name: 'Product Demo', cues: ['Hard Sell', 'USP', 'X-Ray View', 'Tech Specs'] },
  'Cinematic': { icon: '🎥', name: 'Cinematic Narrative', cues: ['Storytelling', 'Subtle Branding', 'High Mise-en-scène', 'Character Driven'] },
  'Social': { icon: '🤳', name: 'Social / Digital', cues: ['UGC Style', 'Fast Pace', 'Vertical-ready', 'Hook-first'] }
};

const StoryboardView = ({ raw, imageUrls, onGenerate, onGenerateAll, loadingFrames, viewMode = 'prompt' }) => {
  const frames = parseStoryboardFrames(raw);

  if (frames.length === 0) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-dim)', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Director's Note is empty or not yet structured.</p>
        <p style={{ fontSize: '0.9rem' }}>Please run the [TREATMENT] engine to generate the frame-by-frame structure first.</p>
      </div>
    );
  }

  const isAnyLoading = Object.values(loadingFrames).some(v => v);

  return (
    <div className={`storyboard-container mode-${viewMode}`}>
      {viewMode === 'prompt' && (
        <div className="batch-gen-bar glass" style={{ marginBottom: '25px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="batch-gen-info">
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>🛠️ VISUAL DIRECTOR'S WORKBENCH</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Refine prompts, lighting, and camera work here. Generate all assets for production sync.</p>
          </div>
          <button 
            className="tactical-btn"
            onClick={() => onGenerateAll(frames)}
            disabled={isAnyLoading}
            style={{ background: 'var(--accent-primary)', color: 'black' }}
          >
            {isAnyLoading ? '🔁 LOCALIZING...' : '🎭 GENERATE & LOCALIZE ALL'}
          </button>
        </div>
      )}

      <div className={`storyboard-grid ${viewMode === 'result' ? 'final-grid' : 'workbench-grid'}`}>
        {frames.map((frame, index) => {
          const handleCopy = () => {
             if (frame.sketchPrompt) {
               navigator.clipboard.writeText(frame.sketchPrompt);
               alert(`Prompt for Frame ${frame.number} copied!`);
             }
          };

          return (
            <div key={index} className={`storyboard-card ${viewMode}`}>
              {viewMode !== 'prompt-only' && (
                <div className="storyboard-visual-placeholder">
                  {imageUrls[frame.number] ? (
                    <img src={imageUrls[frame.number]} alt={`Frame ${frame.number}`} className="storyboard-image" />
                  ) : loadingFrames[frame.number] ? (
                    <div className="gen-loading">
                      <div className="spinner"></div>
                      <span>Rendering...</span>
                    </div>
                  ) : (
                    <button 
                      className="gen-visual-btn"
                      onClick={() => onGenerate(frame.number, frame.sketchPrompt)}
                    >
                      🎨 Generate
                    </button>
                  )}
                  <span className="storyboard-frame-number">#{frame.number}</span>
                </div>
              )}
              
              <div className="storyboard-content">
                {(viewMode === 'prompt' || viewMode === 'prompt-only') ? (
                  <>
                    <div className="card-header-row">
                      <span className="frame-tag">FRAME #{frame.number}</span>
                      <div className="meta-row" style={{ display: 'flex', gap: '12px' }}>
                        <div>
                          <span className="storyboard-label" style={{ fontSize: '0.6rem' }}>Lighting</span>
                          <p className="storyboard-text mini">{frame.lighting || 'Cinematic'}</p>
                        </div>
                        <div>
                          <span className="storyboard-label" style={{ fontSize: '0.6rem' }}>Camera</span>
                          <p className="storyboard-text mini">{frame.camera || 'Standard'}</p>
                        </div>
                      </div>
                      <button className="copy-btn" onClick={handleCopy}>📋 Copy</button>
                    </div>
                    
                    <span className="storyboard-label">Cinematic Logic</span>
                    <p className="storyboard-text small" style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>{frame.visual}</p>
                    
                    <span className="storyboard-label">Architected Prompt</span>
                    <div className="prompt-block">
                      {frame.sketchPrompt || 'Processing prompt...'}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="storyboard-text result-desc">
                      <strong style={{ color: 'var(--accent-secondary)' }}>Scene #{frame.number}:</strong> {frame.visual}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(`activeTab_${project.id}`) || 'CONCEPT';
  });
  const [zenMode, setZenMode] = useState(false);
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
    review: project.review || '',
    analysisData: project.analysisData || null,
    visuals_metadata: project.visuals_metadata || project.storyboardImages || project.storyboard_images || {}
  });

  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');
  const [conceptDirection, setConceptDirection] = useState(project.conceptDirection || 'Brand Impact First, AIDA Structure');
  const [producerNote, setProducerNote] = useState('');
  
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);
  const [proposedDraft, setProposedDraft] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);

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
      analysisData: project.analysisData || project.analysis_data || null,
      visuals_metadata: project.visuals_metadata || project.storyboardImages || project.storyboard_images || {}
    });
  }, [project]);

  useEffect(() => {
    localStorage.setItem(`activeTab_${project.id}`, activeTab);
  }, [activeTab, project.id]);

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({ 
      ...prev, 
      [field]: isAppend ? (baseTextRef.current + value) : value 
    }));
  };

  const handleDraftChange = (field, value) => {
    setProposedDraft(value);
  };

  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange);
  const { executeAgent: executeDraftAgent, isGenerating: isDraftGenerating } = useAgentEngine(apiKey, handleDraftChange);

  const saveToContext = () => {
    updateProject(project.id, { 
      ...pipelineData, 
      adDuration, 
      genre: adType, 
      conceptBrief, 
      conceptDirection 
    });
    alert("Campaign Data & Storyboard Saved!");
  };

  const TAB_META = {
    CONCEPT: { label: 'BRIEF', engine: '📝 캠페인 기획안 (Campaign Brief)', icon: '📋' },
    ARCHITECTURE: { label: 'COPY', engine: '✍️ 카피 시안 (Ideation / Copy)', icon: '✍️' },
    TREATMENT: { label: "DIRECTOR'S NOTE", engine: "📜 연출 의도 (Creative Direction / Note)", icon: '📜' },
    SCENARIO: { label: 'A/V SCRIPT', engine: '📽️ 최종 합본 (A/V Production Script)', icon: '📽️' },
    VISUALS: { label: 'IMAGE PROMPT', engine: '🎨 비주얼 디렉터 (Visual Director Workspace)', icon: '🎨' },
    STORYBOARD: { label: 'STORYBOARD', engine: '🎞️ 시네마틱 보드 (Final Storyboard)', icon: '🎞️' },
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

    const prompt = getRefinementPrompt(conceptBrief, creativeRole, language, contextInfo);

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

  const handleGenerateSketch = async (frameNumber, rawPrompt) => {
    if (!rawPrompt) return alert("No sketch prompt available for this frame. Regenerate Storyboard.");
    
    setLoadingFrames(prev => ({ ...prev, [frameNumber]: true }));
    try {
      // Dynamic Prompt Injection (CD Orchestrator)
      const styleGuide = getStyleGuideForGenre(adType);
      const enrichedPrompt = `[Campaign Tone]: ${conceptDirection}\n[Visual Style Guide]: ${styleGuide}\n[Scene Description]: ${rawPrompt}`;

      // [PHASE B.6] Visual Director Prompt Refinement (Gemini 2.0)
      let finalPrompt = enrichedPrompt;
      try {
        const refinement = await OpenRouterAdapter.refineImagePrompt(enrichedPrompt);
        if (refinement.success) {
          finalPrompt = refinement.refinedPrompt;
          console.log("✨ Visual Director Refinement:", finalPrompt);
        }
      } catch (refineErr) {
        console.warn("Visual Director refinement failed, using enriched prompt", refineErr);
      }

      const result = await OpenRouterAdapter.generateImage(finalPrompt);
      let url = result.data?.[0]?.url;
      
      if (url) {
        try {
          // [PHASE B.6] CLIENT-SIDE CANVAS CAPTURE (Bypass Bot detection)
          // We load the image in the browser, draw it to a canvas, and send base64 to backend
          const canvasData = await new Promise((resolve) => {
            const tempImg = new Image();
            tempImg.crossOrigin = "anonymous";
            tempImg.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = tempImg.width;
              canvas.height = tempImg.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(tempImg, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.95));
            };
            tempImg.onerror = () => {
              console.warn("Canvas capture failed (CORS), falling back to URL proxy");
              resolve(null);
            };
            tempImg.src = url;
            // Short timeout for canvas
            setTimeout(() => resolve(null), 10000);
          });

          // Send to backend (either base64 or URL)
          const uploadRes = await fetch(`http://${window.location.hostname}:3006/api/projects/${project.id}/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canvasData ? { image: canvasData } : { url })
          });
          
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            url = uploadData.url;
            console.log("🚀 Local Asset Created via Canvas/Proxy:", url);
          }
        } catch (uploadErr) {
          console.error("Local localization failed, using external URL", uploadErr);
        }

        const newImages = { ...pipelineData.visuals_metadata, [frameNumber]: url };
        setPipelineData(prev => ({ ...prev, visuals_metadata: newImages }));
        
        // [PHASE B.6] Final Sync
        await fetch(`http://${window.location.hostname}:3006/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyboard_images: newImages })
        });
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
      const currentUrl = pipelineData.visuals_metadata[frame.number];
      const isExternal = currentUrl && !currentUrl.includes(window.location.hostname) && !currentUrl.includes('localhost');
      
      // If no image OR it's an external URL, trigger the generation/localization flow
      if (!currentUrl || isExternal) {
        await handleGenerateSketch(frame.number, frame.sketchPrompt);
      }
    }
    alert("All images localized and saved to project folder!");
  };

  const generateContent = (tab) => {
    // RESET LOGIC: Move to non-destructive pattern. 
    // We only clear if the user explicitly Accepts a new draft.
    setBriefingResult(null); 
    setProposedDraft(null);
    setIsDrafting(true);

    const isCD = creativeRole === 'CD';
    const roleContext = `\n[Role]: ${creativeRole}\n[Language]: ${language}\n[Ad Type]: ${adType}\n[Duration]: ${adDuration}\n[Category]: Commercial\n`;
    const fullSystemPrompt = `${adRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}`;

    let prompt = "";
    let target = tab.toLowerCase();

    if (tab === 'CONCEPT') {
      prompt = getBriefingPrompt(conceptBrief, roleContext);
    } else if (tab === 'ARCHITECTURE') {
      prompt = getArchitecturePrompt(pipelineData, roleContext, isCD);
    } else if (tab === 'TREATMENT') {
      const visualContext = pipelineData.architecture || pipelineData.concept || conceptBrief;
      prompt = getTreatmentPrompt(visualContext, roleContext);
    } else if (tab === 'SCENARIO') {
      prompt = getScenarioPrompt(pipelineData.treatment, roleContext);
    } else if (tab === 'REVIEW') {
      prompt = getReviewPrompt(pipelineData.scenario, roleContext);
    }

    executeDraftAgent(fullSystemPrompt, prompt, target);
  };

  const applyDraft = () => {
    if (!proposedDraft) return;
    const target = activeTab.toLowerCase();
    setPipelineData(prev => ({ ...prev, [target]: proposedDraft }));
    setProposedDraft(null);
    setIsDrafting(false);
  };

  const discardDraft = () => {
    setProposedDraft(null);
    setIsDrafting(false);
  };
  const [exportStatus, setExportStatus] = useState(null);

  const handleExportPDF = async () => {
    try {
      setExportStatus('pending');
      const res = await fetch(`http://localhost:3006/api/projects/${project.id}/export`, { method: 'POST' });
      const data = await res.json();
      if (data.jobId) {
        pollExportStatus(data.jobId);
      }
    } catch (err) {
      console.error(err);
      setExportStatus('failed');
      alert("Failed to start export.");
    }
  };

  const pollExportStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3006/api/export/${jobId}`);
        const data = await res.json();
        if (data.job?.status === 'completed') {
          clearInterval(interval);
          setExportStatus(null);
          window.open(`http://localhost:3006${data.job.url}`, '_blank');
        } else if (data.job?.status === 'failed') {
          clearInterval(interval);
          setExportStatus(null);
          alert("Export failed: " + data.job.error);
        } else {
          setExportStatus(data.job?.status || 'processing');
        }
      } catch (err) {
        clearInterval(interval);
        setExportStatus(null);
      }
    }, 3000);
  };

  return (
    <div className="studio-root">
      <div className={`project-detail ad-theme ${isGenerating || isDraftGenerating ? 'orchestration-active' : ''} ${zenMode ? 'is-zen' : ''}`}>
      {/* 🏙️ STUDIO HEADER */}
      <header className="detail-header">
        <div className="header-meta">
          <div className="back-btn" onClick={onBack}>← EXIT STUDIO</div>
          <div className="project-title-mini">PROJECT: {project.title}</div>
          <div className="badge status-badge">{project.status || 'PRODUCTION'}</div>
        </div>

        <div className="orchestration-controls">
          <div className="input-group-row">
            <span className="input-label">📡 OPENROUTER</span>
            <input 
              type="password" 
              className="key-input"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
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
            <button className="btn-secondary" onClick={handleExportPDF} disabled={exportStatus !== null}>
              {exportStatus ? `⏳ Exporting...` : '📄 EXPORT PDF'}
            </button>
            <button className="btn-primary" onClick={saveToContext}>
              SAVE CAMPAIGN
            </button>
          </div>
        </div>
      </header>

      {/* 🏙️ AI PROGRESS OVERLAY (Shared Utility) */}
      <div className={`status-indicator-bar ${isGenerating || isDraftGenerating ? 'active' : ''}`} />
      
      <div className="studio-container">
        {/* 📋 PRODUCTION SIDEBAR (Context & Rules) */}
        <aside className="studio-sidebar">
          <section className="sidebar-section">
            <h4 className="section-title">Narrative Vitals</h4>
            <div className="vitals-row">
              <div className="badge category-badge">Commercial</div>
              <div className="badge genre-badge">{adType}</div>
            </div>
          </section>

          <section className="sidebar-section">
            <h4 className="section-title">Production Controls</h4>
            
            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">CREATIVE ROLE</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['CD', 'COPY', 'ART'].map(role => (
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
              <label className="input-label">AD TYPE</label>
              <select 
                value={adType} 
                onChange={(e) => setAdType(e.target.value)}
                className="logline-editor"
                style={{ fontSize: '0.8rem', padding: '8px', minHeight: 'auto' }}
              >
                {Object.keys(AD_GENRE_HINTS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="genre-tactics" style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 'var(--sidebar-badge-fs)', color: 'var(--accent-primary)', marginBottom: '5px' }}>
                 {AD_GENRE_HINTS[adType]?.icon} {adType.toUpperCase()} TACTICS
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                 {AD_GENRE_HINTS[adType]?.cues.map(cue => (
                   <span key={cue} style={{ fontSize: 'var(--sidebar-badge-fs)', padding: '2px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', color: 'var(--text-muted)' }}>
                     #{cue}
                   </span>
                 ))}
               </div>
            </div>
          </section>

          <section className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="section-title" style={{ marginBottom: 0, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Campaign Brief</h4>
              <button 
                className="btn-primary" 
                onClick={refineBriefWithRole}
                disabled={isOptimizingBrief || !conceptBrief}
                style={{ padding: '6px 12px', height: 'auto', fontSize: 'var(--sidebar-btn-fs)' }}
              >
                {isOptimizingBrief ? '...' : creativeRole === 'CD' ? '✨ Synthesize' : `⚡ Refine`}
              </button>
            </div>
            
            <textarea 
              className="logline-editor"
              value={conceptBrief}
              onChange={(e) => setConceptBrief(e.target.value)}
              placeholder="Enter brand requirement..."
              style={{ minHeight: '120px', fontSize: '0.85rem' }}
            />

            {briefingResult && (
              <div className="briefing-assistant" style={{ marginTop: '10px', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                  🧠 CD Feedback
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                  {briefingResult}
                </div>
                <div className="control-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={applyRefinedBrief} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: 'var(--sidebar-btn-fs)' }}>Adopt</button>
                  <button onClick={() => setBriefingResult(null)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 'var(--sidebar-btn-fs)' }}>Discard</button>
                </div>
              </div>
            )}
          </section>
        </aside>

        {/* 🎬 STAGE CONTROLLER (Tabbed Content) */}
        <main className="studio-main">
          <div className="tabs">
            {Object.keys(TAB_META).map(tab => {
              let isGreenlight = false;
              if (tab === 'VISION' || tab === 'AUDIT') {
                isGreenlight = !!pipelineData.analysisData;
              } else {
                isGreenlight = pipelineData[tab.toLowerCase()]?.length > 20;
              }
              
              return (
                <div 
                  key={tab} 
                  className={`tab ${activeTab === tab ? 'active' : ''} ${isGreenlight ? 'completed' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {TAB_META[tab].icon} {TAB_META[tab].label}
                  {isGreenlight && (
                    <span style={{ fontSize: '0.6rem', color: '#00ff88', marginLeft: '6px', textShadow: '0 0 5px #00ff88' }}>●</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="stage-content" style={{ flexGrow: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {TAB_META[activeTab].engine}
              </span>
              {(activeTab !== 'VISUALS' && activeTab !== 'STORYBOARD' && activeTab !== 'VISION') && (
                <button 
                  className="btn-primary" 
                  onClick={() => generateContent(activeTab)}
                  disabled={isGenerating || isDraftGenerating}
                  style={{ padding: '8px 20px' }}
                >
                  {(isGenerating || isDraftGenerating) ? 'Analyzing...' : `⚡ Run Pipeline`}
                </button>
              )}
            </div>

            {proposedDraft && (
              <div className="briefing-assistant" style={{ position: 'absolute', top: '50px', right: '0', left: '0', zIndex: 100, maxHeight: '80%', overflowY: 'auto', border: '1px solid var(--accent-primary)', background: '#0a0a0a', padding: '20px' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginTop: 0, fontSize: '0.9rem' }}>✨ AI Proposed Draft ({TAB_META[activeTab].label})</h4>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {proposedDraft}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={applyDraft}>Adopt & Overwrite</button>
                  <button className="btn-secondary" onClick={discardDraft}>Discard</button>
                </div>
              </div>
            )}
            
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              {activeTab === 'VISION' ? (
                <AnalyticsDashboard data={pipelineData.analysisData} />
              ) : activeTab === 'TREATMENT' ? (
                <div className="directors-note-view glass" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                  {pipelineData.treatment || 'No content yet. Run the engine to generate.'}
                </div>
              ) : activeTab === 'SCENARIO' ? (
                <ScriptTableView raw={pipelineData.scenario} />
              ) : activeTab === 'VISUALS' ? (
                <StoryboardView 
                  raw={pipelineData.treatment} 
                  imageUrls={pipelineData.visuals_metadata}
                  onGenerate={handleGenerateSketch}
                  onGenerateAll={handleGenerateAllSketches}
                  loadingFrames={loadingFrames}
                  viewMode="prompt-only"
                />
              ) : activeTab === 'STORYBOARD' ? (
                <StoryboardView 
                  raw={pipelineData.treatment} 
                  imageUrls={pipelineData.visuals_metadata}
                  onGenerate={handleGenerateSketch}
                  onGenerateAll={handleGenerateAllSketches}
                  loadingFrames={loadingFrames}
                  viewMode="result"
                />
              ) : (
                <textarea 
                  ref={outputRef}
                  className="ad-editor"
                  value={pipelineData[activeTab.toLowerCase()]}
                  onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                  style={{ width: '100%', height: '100%', minHeight: '600px', background: 'transparent', color: 'white', border: 'none', resize: 'none', outline: 'none' }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
};

export default AdProjectDetail;
