import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import SendToStudioButton from './SendToStudioButton';
import StageGateChecklist from './StageGateChecklist';
import PipelineView from './PipelineView';
import { parseStoryboardFrames } from '../utils/adUtils';
import { OpenRouterAdapter } from '../infrastructure/OpenRouterAdapter';
import { getStyleGuideForGenre, VISIBILITY_CONSTRAINT } from '../config/visualStyles';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3006';

const AD_GENRE_HINTS = {
  'BrandFilm':    { icon: '✨', name: 'Brand Film',          cues: ['Cinematic', 'Emotional', 'Manifesto', 'Brand DNA'],       copyTone: '시적·철학적 VO',  visualRef: 'Apple / Nike / Patagonia' },
  'ProductDemo':  { icon: '📦', name: 'Product Demo',        cues: ['Hard Sell', 'USP', 'Feature Reveal', 'Before/After'],    copyTone: '직접·기능 중심',  visualRef: 'Dyson / Samsung Tech' },
  'Cinematic':    { icon: '🎥', name: 'Cinematic Narrative', cues: ['Character Arc', 'Subtle Branding', 'High Mise-en-scène', 'Emotion First'], copyTone: '내러티브 VO',    visualRef: 'Johnnie Walker / Google' },
  'Social':       { icon: '🤳', name: 'Social / Digital',    cues: ['UGC Style', 'Hook-first', 'Pattern Interrupt', 'Native Feel'], copyTone: '구어체·직접 대화', visualRef: 'TikTok Native / Instagram Reel' },
  'Performance':  { icon: '🎯', name: 'Performance / DR',    cues: ['Problem→Solution', 'Urgency', 'Social Proof', 'Hard CTA'], copyTone: '설득·행동 유도',  visualRef: 'Direct Response / Infomercial' },
  'Testimonial':  { icon: '🗣️', name: 'Testimonial / UGC',  cues: ['Real People', 'Authentic', 'Before/After', 'Word-of-Mouth'], copyTone: '진정성·구어',    visualRef: 'Dove Real Beauty / Airbnb' },
};

// 포맷 프리셋 (지속시간 기반 AIDA 타임라인)
const AD_FORMAT_PRESETS = {
  '15s': {
    icon: '⚡',
    label: '15s Sprint',
    desc: 'TV CM · Pre-roll 비스킵',
    structure: `[0:00-0:03] HOOK — 시각적 충격 / 제품 즉시 노출\n[0:03-0:10] USP — 핵심 혜택 1가지만\n[0:10-0:15] CTA — 브랜드 + 슬로건`,
    aida: 'A→D→A (압축형)',
    cuts: '7-10 cuts',
    copyRule: '헤드라인 1줄 + 슬로건만. VO 없거나 최소화.',
  },
  '30s': {
    icon: '🎬',
    label: '30s Classic',
    desc: '표준 TV · YouTube',
    structure: `[0:00-0:03] HOOK — 스크롤 스탑 / 감각적 오프닝\n[0:03-0:10] PROBLEM — 공감 포인트 / 페인 노출\n[0:10-0:22] SOLUTION — 제품/브랜드 변화 연출\n[0:22-0:27] PROOF — 결과 / 비포애프터\n[0:27-0:30] CTA — 슬로건 + 로고 Lock-up`,
    aida: 'A→I→D→A (정석)',
    cuts: '15-20 cuts',
    copyRule: 'VO 또는 자막 카피 3-5줄. 감성과 기능 균형.',
  },
  '60s': {
    icon: '📽️',
    label: '60s Story',
    desc: '온라인 전용 · OTT',
    structure: `[0:00-0:05] HOOK — 강렬한 시작 / 질문 던지기\n[0:05-0:20] SETUP — 캐릭터/상황 설정\n[0:20-0:40] CONFLICT — 갈등/문제 심화\n[0:40-0:52] RESOLUTION — 브랜드가 해결\n[0:52-0:58] EMOTIONAL PEAK — 감정 클라이맥스\n[0:58-1:00] CTA — 브랜드 메시지`,
    aida: 'A→I→D→A (스토리 확장)',
    cuts: '30-40 cuts',
    copyRule: '내러티브 VO 가능. 캐릭터 대사 허용. 감성 우선.',
  },
  'BrandFilm': {
    icon: '🏆',
    label: 'Brand Film 2-3min',
    desc: '유튜브 롱폼 · 시네마',
    structure: `[0:00-0:15] MANIFESTO — 브랜드 세계관 선언\n[0:15-1:00] ACT 1 — 현실/문제 정의 (날것의 현실)\n[1:00-2:00] ACT 2 — 브랜드 철학 전개 (Why We Exist)\n[2:00-2:40] ACT 3 — 변화/희망 (Transformation)\n[2:40-3:00] RESOLUTION — 브랜드 약속 + 슬로건`,
    aida: '매니페스토 서사 (영화적 구조)',
    cuts: '60-80 cuts',
    copyRule: '철학적 VO 필수. 시적 언어. 제품 직접 언급 최소화.',
  },
};

// 플랫폼 프리셋
const AD_PLATFORM_PRESETS = {
  'TV':        { icon: '📺', ratio: '16:9',  hook: '3s', skipRule: '없음 (완주 필수)', note: '최고 화질·사운드 보장. 감성 최대치.' },
  'YouTube':   { icon: '▶️', ratio: '16:9',  hook: '5s', skipRule: '5s 후 스킵 가능', note: '5초 안에 브랜드 노출 필수. 썸네일 영향 없음.' },
  'Instagram': { icon: '📸', ratio: '9:16',  hook: '1s', skipRule: '즉시 스킵',        note: '세로형 필수. 무음 재생 대비 자막 필수.' },
  'TikTok':    { icon: '🎵', ratio: '9:16',  hook: '1s', skipRule: '즉시 스킵',        note: 'Native 느낌 필수. 트렌딩 오디오. UGC 질감.' },
  'Cinema':    { icon: '🎞️', ratio: '2.39:1', hook: '없음', skipRule: '없음 (캡티브)',  note: '최대 프레스티지. 사운드 설계 극대화. 브랜드 임팩트.' },
  'OTT':       { icon: '📡', ratio: '16:9',  hook: '3s', skipRule: '플랫폼별 상이',   note: 'TV급 품질 + 디지털 정밀 타겟. 중간 광고 맥락 고려.' },
};

const StoryboardView = ({ raw, imageUrls, onGenerate, onGenerateAll, loadingFrames, regenKeys = {}, viewMode = 'prompt', onRunTreatment, editedPrompts = {}, onPromptEdit, onOpenFolder }) => {
  const frames = parseStoryboardFrames(raw);

  if (frames.length === 0) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-dim)', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Art Direction is empty or not yet structured.</p>
        <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>프레임별 구조를 생성하려면 ART DIRECTION 엔진을 실행해야 합니다.</p>
        {onRunTreatment && (
          <button
            onClick={onRunTreatment}
            style={{
              padding: '12px 28px',
              background: 'var(--accent-primary)',
              color: 'black',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
          >
            📜 TREATMENT 엔진 실행
          </button>
        )}
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
            onClick={() => onGenerateAll(frames, true)}
            disabled={isAnyLoading}
            style={{ background: 'var(--accent-primary)', color: 'black' }}
          >
            {isAnyLoading ? '🔁 GENERATING...' : '🎭 GENERATE ALL (FORCE)'}
          </button>
        </div>
      )}

      <div className={`storyboard-grid ${viewMode === 'result' ? 'final-grid' : 'workbench-grid'}`}>
        {frames.map((frame, index) => {
          const handleCopy = () => {
             if (frame.sketchPrompt) {
               navigator.clipboard.writeText(frame.sketchPrompt);
             }
          };

          return (
            <div key={index} className={`storyboard-card ${viewMode}`}>
              {viewMode !== 'prompt-only' && (
                <div className="storyboard-visual-placeholder" style={{ position: 'relative' }}>
                  {loadingFrames[frame.number] ? (
                    <div className="gen-loading">
                      <div className="spinner"></div>
                      <span>Rendering...</span>
                    </div>
                  ) : imageUrls[frame.number] ? (
                    <div className="img-regen-wrapper">
                      <img key={regenKeys[frame.number] || 0} src={imageUrls[frame.number]} alt={`Frame ${frame.number}`} className="storyboard-image" />
                      <button
                        className="regen-overlay-btn"
                        onClick={() => onGenerate(frame.number, frame)}
                        title="Re-generate"
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '4px', color: '#fff', fontSize: '0.7rem',
                          padding: '3px 7px', cursor: 'pointer', opacity: 0,
                          transition: 'opacity 0.2s', zIndex: 10,
                        }}
                      >↻ 재생성</button>
                      {onOpenFolder && imageUrls[frame.number].includes('localhost') && (
                        <button
                          className="folder-open-btn"
                          onClick={() => onOpenFolder(imageUrls[frame.number])}
                          title="파일 위치 열기"
                          style={{
                            position: 'absolute', bottom: '6px', left: '6px',
                            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem',
                            padding: '2px 6px', cursor: 'pointer', zIndex: 10,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontFamily: 'monospace', letterSpacing: '0',
                          }}
                        >
                          📁 {(() => {
                            const url = imageUrls[frame.number].replace(/\?.*$/, '');
                            const m = url.match(/\/public\/export\/([^/]+)\//);
                            return m ? m[1] : 'export';
                          })()}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className="gen-visual-btn"
                      onClick={() => onGenerate(frame.number, frame.sketchPrompt)}
                    >
                      🎨 Generate
                    </button>
                  )}
                  <span className="storyboard-frame-number">
                    #{frame.number}{frame.panelName ? ` · ${frame.panelName}` : ''}
                  </span>
                </div>
              )}
              
              <div className="storyboard-content">
                {(viewMode === 'prompt' || viewMode === 'prompt-only') ? (
                  <>
                    <div className="card-header-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="frame-tag">FRAME #{frame.number}</span>
                        {frame.panelName && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--accent-primary)', textTransform: 'uppercase', opacity: 0.9 }}>
                            {frame.panelName}
                          </span>
                        )}
                      </div>
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
                    
                    <span className="storyboard-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Architected Prompt
                      {editedPrompts[frame.number] !== undefined && editedPrompts[frame.number] !== frame.sketchPrompt && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.5px' }}>✏ EDITED</span>
                      )}
                    </span>
                    <textarea
                      className="prompt-block"
                      value={editedPrompts[frame.number] !== undefined ? editedPrompts[frame.number] : (frame.sketchPrompt || '')}
                      onChange={e => onPromptEdit && onPromptEdit(frame.number, e.target.value)}
                      placeholder="Enter image generation prompt..."
                      style={{ resize: 'vertical', minHeight: '80px', width: '100%', boxSizing: 'border-box', background: 'transparent', color: 'var(--accent-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', fontFamily: 'inherit', fontSize: '0.82rem', lineHeight: '1.6', cursor: 'text' }}
                    />
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
    const stored = localStorage.getItem(`activeTab_${project.id}`);
    const validTabs = ['CONCEPT', 'ARCHITECTURE', 'TREATMENT', 'SCENARIO', 'VISUALS', 'REVIEW', 'VISION'];
    return (stored && validTabs.includes(stored)) ? stored : 'CONCEPT';
  });
  const [zenMode, setZenMode] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  
  const [adFormat, setAdFormat] = useState(project.adFormat || project.adDuration || '30s');
  const [adPlatform, setAdPlatform] = useState(project.adPlatform || 'TV');
  const [adType, setAdType] = useState(project.genre || 'BrandFilm');
  const [creativeRole, setCreativeRole] = useState('CD');
  const [language, setLanguage] = useState('KO');
  
  const [pipelineData, setPipelineData] = useState({
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || '',
    analysisData: (() => { const v = project.analysisData; if (!v) return null; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } } return v; })(),
    visuals_metadata: (() => { const v = project.visuals_metadata || project.storyboardImages || project.storyboard_images; if (!v) return {}; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return {}; } } return v; })()
  });

  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');
  const [conceptDirection, setConceptDirection] = useState(project.conceptDirection || 'Brand Impact First, AIDA Structure');
  const [producerNote, setProducerNote] = useState('');
  
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);
  const [proposedDraft, setProposedDraft] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const [editedPrompts, setEditedPrompts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`editedPrompts_${project.id}`) || '{}'); } catch { return {}; }
  });

  const handlePromptEdit = (frameNumber, value) => {
    setEditedPrompts(prev => {
      const next = { ...prev, [frameNumber]: value };
      localStorage.setItem(`editedPrompts_${project.id}`, JSON.stringify(next));
      return next;
    });
  };

  const [loadingFrames, setLoadingFrames] = useState({});
  const [regenKeys, setRegenKeys] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [visualBoardMode, setVisualBoardMode] = useState('prompt-only');
  const [sidebarOpen, setSidebarOpen] = useState({ type: true, format: false, platform: false });

  const outputRef = useRef(null);
  const baseTextRef = useRef('');
  // Ref that stays in sync with pipelineData.visuals_metadata so async callbacks
  // (e.g. handleGenerateAllSketches) always read the latest value, not a stale closure.
  const visualsRef = useRef(pipelineData.visuals_metadata);

  useEffect(() => {
    const parsed = (() => { const v = project.visuals_metadata || project.storyboardImages || project.storyboard_images; if (!v) return {}; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return {}; } } return v; })();
    visualsRef.current = parsed;
    setPipelineData({
      concept: project.concept || '',
      architecture: project.architecture || '',
      treatment: project.treatment || '',
      scenario: project.scenario || '',
      review: project.review || '',
      analysisData: (() => { const v = project.analysisData || project.analysis_data; if (!v) return null; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } } return v; })(),
      visuals_metadata: parsed
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

  const handleAgentError = (msg) => { setSaveStatus(`⚠ ${msg}`); setTimeout(() => setSaveStatus(''), 4000); };
  const { executeAgent, isGenerating } = useAgentEngine(apiKey, handleDataChange, handleAgentError);
  const { executeAgent: executeDraftAgent, isGenerating: isDraftGenerating } = useAgentEngine(apiKey, handleDraftChange, handleAgentError);
  const handleBriefChange = (_field, value) => setBriefingResult(value);
  const { executeAgent: executeBriefAgent } = useAgentEngine(apiKey, handleBriefChange, handleAgentError);

  const saveToContext = () => {
    updateProject(project.id, {
      ...pipelineData,
      storyboardImages: pipelineData.visuals_metadata,
      adFormat,
      adPlatform,
      adDuration: adFormat,
      genre: adType,
      conceptBrief,
      conceptDirection
    });
    setSaveStatus('SAVED ✓');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const TAB_META = {
    CONCEPT: { label: 'CREATIVE BRIEF', engine: 'Creative Director', icon: '📋' },
    ARCHITECTURE: { label: 'COPYWRITING', engine: 'Senior Copywriter', icon: '✍️' },
    TREATMENT: { label: 'ART DIRECTION', engine: 'Art Director', icon: '📜' },
    SCENARIO: { label: 'A/V SCRIPT', engine: 'Production Scriptwriter', icon: '📽️' },
    VISUALS: { label: 'STORYBOARD', engine: 'Storyboard Artist', icon: '🎨' },
    REVIEW: { label: 'COMPLIANCE', engine: 'Brand Strategist', icon: '🔍' },
    VISION: { label: 'ANALYTICS', engine: 'Campaign Analyst', icon: '📊' },
    PIPELINE: { label: 'PIPELINE', engine: 'Production Pipeline', icon: '🔀' }
  };

  const refineBriefWithRole = async () => {
    if (!conceptBrief) { setSaveStatus('⚠ Enter brief first'); setTimeout(() => setSaveStatus(''), 2000); return; }
    setIsOptimizingBrief(true);
    setBriefingResult(null); // Reset previous result
    
    const isCD = creativeRole === 'CD';
    const contextInfo = isCD ? `
[CROSS-ROLE FEEDS]:
- Current Copy (CW): ${pipelineData.architecture || 'None'}
- Current Storyboard (CA): ${pipelineData.treatment || 'None'}
[Note]: As CD, your task is to SYNTHESIZE these inputs into the final Brief/Strategy.
` : '';

    const prompt = getRefinementPrompt(conceptBrief, creativeRole, language, contextInfo, { duration: adFormat, platform: adPlatform, adType });

    try {
      await executeBriefAgent(adRule, prompt, 'brief', false, 'Refining Brief...');
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

  const handleGenerateSketch = async (frameNumber, frameOrPrompt) => {
    // Accept either a full frame object or a raw string (backward compat)
    const frame = typeof frameOrPrompt === 'object' ? frameOrPrompt : { sketchPrompt: frameOrPrompt };
    // Use user-edited prompt if available, otherwise fall back to parsed value
    const editedPrompt = editedPrompts[frameNumber];
    const effectiveFrame = editedPrompt ? { ...frame, sketchPrompt: editedPrompt } : frame;
    const rawPrompt = effectiveFrame.sketchPrompt || effectiveFrame.visual || '';
    if (!rawPrompt) { setSaveStatus('⚠ No prompt — regenerate Storyboard'); setTimeout(() => setSaveStatus(''), 2500); return; }

    setLoadingFrames(prev => ({ ...prev, [frameNumber]: true }));
    try {
      // Build rich structured context from all frame fields
      const styleGuide = getStyleGuideForGenre(adType);
      const frameContext = [
        effectiveFrame.panelName   && `[Panel Name]: ${effectiveFrame.panelName}`,
        effectiveFrame.visual      && `[Visual Description]: ${effectiveFrame.visual}`,
        effectiveFrame.lighting    && `[Lighting]: ${effectiveFrame.lighting}`,
        effectiveFrame.camera      && `[Camera Angle]: ${effectiveFrame.camera}`,
        effectiveFrame.mood        && `[Mood/Emotion]: ${effectiveFrame.mood}`,
        effectiveFrame.sketchPrompt && effectiveFrame.sketchPrompt !== effectiveFrame.visual && `[Director Note]: ${effectiveFrame.sketchPrompt}`,
      ].filter(Boolean).join('\n');
      const panelTitle = effectiveFrame.panelName
        ? `PANEL ${frameNumber}: ${effectiveFrame.panelName.toUpperCase()}`
        : `PANEL ${frameNumber}`;
      const enrichedPrompt = [
        `[Campaign Tone]: ${conceptDirection}`,
        `[Visual Style Guide]: ${styleGuide}`,
        `[Panel Annotation]: ${panelTitle}`,
        `[Frame #${frameNumber}]`,
        frameContext,
        VISIBILITY_CONSTRAINT,
      ].join('\n');

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

      const result = await OpenRouterAdapter.generateImage(finalPrompt, frameNumber, frame.panelName, project.id, project.title);
      let url = result.data?.[0]?.url;
      
      if (url) {
        try {
          // If server already saved the image locally, skip canvas/proxy — image is ready
          const isAlreadyLocal = url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
          if (!isAlreadyLocal) {
            // External URL: try canvas capture first (CORS bypass), then proxy upload
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
              setTimeout(() => resolve(null), 10000);
            });

            const uploadRes = await fetch(`http://${window.location.hostname}:3006/api/projects/${project.id}/upload-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(canvasData
                ? { image: canvasData, projectTitle: project.title, frameNumber }
                : { url, projectTitle: project.title, frameNumber }
              )
            });

            const uploadData = await uploadRes.json();
            if (uploadData.success && uploadData.url) {
              url = uploadData.url;
              console.log("🚀 Local Asset Created via Canvas/Proxy:", url);
            }
          } else {
            console.log("✅ Image already saved on server, skipping upload step:", url);
          }
        } catch (uploadErr) {
          console.error("Local localization failed, using external URL", uploadErr);
        }

        // Cache-bust local URLs so browser always fetches the freshly generated file
        // (backend overwrites same filename on every regen, browser would otherwise show cached old image)
        const displayUrl = url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')
          ? `${url}?t=${Date.now()}`
          : url;

        // Use ref (not stale closure) so batch generation accumulates all frames
        // Store display URL (with cache buster) in state, clean URL in DB
        const newImages = { ...visualsRef.current, [frameNumber]: displayUrl };
        visualsRef.current = newImages;
        setPipelineData(prev => ({ ...prev, visuals_metadata: newImages }));
        setRegenKeys(prev => ({ ...prev, [frameNumber]: (prev[frameNumber] || 0) + 1 }));
        setSaveStatus(`✓ Frame #${frameNumber} 생성 완료`);
        setTimeout(() => setSaveStatus(''), 3000);

        // [PHASE B.6] Final Sync — save clean URL (no cache-buster) to DB + update context
        const dbImages = { ...newImages, [frameNumber]: url };
        await updateProject(project.id, { storyboardImages: dbImages });
      } else {
        setSaveStatus(`⚠ Frame #${frameNumber} 생성 실패 — 다시 시도`);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error("Sketch Gen Error:", error);
      setSaveStatus('⚠ Sketch failed'); setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setLoadingFrames(prev => ({ ...prev, [frameNumber]: false }));
    }
  };

  const handleGenerateAllSketches = async (frames, forceAll = false) => {
    if (!frames || frames.length === 0) return;

    for (const frame of frames) {
      // Read from ref, not stale pipelineData closure, so each iteration sees latest state
      const currentUrl = visualsRef.current[frame.number];
      const isExternal = currentUrl && !currentUrl.includes(window.location.hostname) && !currentUrl.includes('localhost');

      // Generate if: no image, external URL (needs localization), or forceAll flag
      if (!currentUrl || isExternal || forceAll) {
        await handleGenerateSketch(frame.number, frame);
      }
    }
    setSaveStatus(forceAll ? '✓ All images regenerated' : '✓ All images localized');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const generateContent = (tab) => {
    setBriefingResult(null);
    setProposedDraft(null);
    setIsDrafting(true);

    const isCD = creativeRole === 'CD';
    const formatPreset = AD_FORMAT_PRESETS[adFormat];
    const platformPreset = AD_PLATFORM_PRESETS[adPlatform];
    const opts = {
      duration: adFormat,
      platform: adPlatform,
      adType,
      formatStructure: formatPreset?.structure || '',
    };
    const roleContext = `\n[Role]: ${creativeRole}\n[Language]: ${language}\n[Ad Type]: ${adType}\n[Duration]: ${adFormat}\n[Platform]: ${adPlatform} (${platformPreset?.ratio || '16:9'}, hook ${platformPreset?.hook || '3s'})\n[Category]: Commercial\n[Format Structure]:\n${formatPreset?.structure || 'N/A'}\n`;
    const fullSystemPrompt = `${adRule}\n\n[SPECIFIC STANDARDS]\n${categoryRules}\n\n[GENRE MODULE]\n${genreRules}`;

    let prompt = "";
    let target = tab.toLowerCase();

    if (tab === 'CONCEPT') {
      prompt = getBriefingPrompt(conceptBrief, roleContext, opts);
    } else if (tab === 'ARCHITECTURE') {
      prompt = getArchitecturePrompt(pipelineData, roleContext, isCD, opts);
    } else if (tab === 'TREATMENT') {
      const visualContext = pipelineData.architecture || pipelineData.concept || conceptBrief;
      prompt = getTreatmentPrompt(visualContext, roleContext, opts);
    } else if (tab === 'SCENARIO') {
      prompt = getScenarioPrompt(pipelineData.treatment, roleContext, opts);
    } else if (tab === 'REVIEW') {
      prompt = getReviewPrompt(pipelineData.scenario, roleContext, opts);
    }

    if (tab === 'REVIEW') {
      executeAgent(fullSystemPrompt, prompt, 'review');
    } else {
      executeDraftAgent(fullSystemPrompt, prompt, target);
    }
  };

  const applyDraft = () => {
    if (!proposedDraft) return;
    const target = activeTab.toLowerCase();
    setPipelineData(prev => ({ ...prev, [target]: proposedDraft }));
    setProposedDraft(null);
    setIsDrafting(false);
  };

  const applyDraftText = (text) => {
    const target = activeTab.toLowerCase();
    setPipelineData(prev => ({ ...prev, [target]: text }));
    setProposedDraft(null);
    setIsDrafting(false);
  };

  const parseCopyVariations = (text) => {
    // Split on variation headers: ## 시안 N, **시안 N**, 시안 N:, Option N, --- separators
    const parts = text.split(/(?=(?:#{1,3}\s*시안\s*\d|#{1,3}\s*Option\s*\d|\*\*시안\s*\d|\*\*Option\s*\d|^시안\s*\d|^Option\s*\d))/m)
      .map(s => s.trim()).filter(Boolean);
    return parts.length >= 2 ? parts : null;
  };

  const discardDraft = () => {
    setProposedDraft(null);
    setIsDrafting(false);
  };
  const [exportStatus, setExportStatus] = useState(null);

  const handleExportPDF = async () => {
    try {
      setExportStatus('pending');
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/export`, { method: 'POST' });
      const data = await res.json();
      if (data.jobId) {
        pollExportStatus(data.jobId);
      }
    } catch (err) {
      console.error(err);
      setExportStatus('failed');
      setSaveStatus('⚠ Export failed'); setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const pollExportStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/export/${jobId}`);
        const data = await res.json();
        if (data.job?.status === 'completed') {
          clearInterval(interval);
          setExportStatus(null);
          window.open(`${API_BASE}${data.job.url}`, '_blank');
        } else if (data.job?.status === 'failed') {
          clearInterval(interval);
          setExportStatus(null);
          setSaveStatus('⚠ Export failed'); setTimeout(() => setSaveStatus(''), 2000);
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
        <div className="header-left">
          <div className="back-btn" onClick={onBack}>← BACK</div>
          <span className="header-format-label">AD / COMMERCIAL</span>
        </div>
        <div className="header-title-block">
          <h1 className="header-title">{project.title}</h1>
        </div>
        <div className="header-right">
          <div className="header-mode-controls">
            <button
              className={`mode-btn ${zenMode ? 'active' : ''}`}
              onClick={() => setZenMode(!zenMode)}
            >
              {zenMode ? 'EXIT ZEN' : 'ZEN'}
            </button>
            <input
              type="password"
              className="key-input-inline"
              placeholder="OpenRouter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="header-divider" />
          <div className="header-save-controls">
            <button className="btn-secondary" onClick={handleExportPDF} disabled={exportStatus !== null}>
              {exportStatus ? 'Exporting...' : 'PDF'}
            </button>
            <SendToStudioButton scriptWriterProjectId={project.id} scriptData={pipelineData} />
            <button className="tactical-btn" onClick={saveToContext}>SAVE</button>
            {saveStatus && <span className="save-toast">{saveStatus}</span>}
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

          <StageGateChecklist project={project} pipelineData={pipelineData} category={project.category} />

          <section className="sidebar-section">
            <h4 className="section-title">Production Controls</h4>

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <label className="input-label">CREATIVE ROLE</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { id: 'CD',   label: 'Creative Director', sub: 'Brief & Strategy' },
                  { id: 'COPY', label: 'Copywriter',        sub: 'Copy & Messaging' },
                  { id: 'ART',  label: 'Art Director',      sub: 'Visual Direction' },
                ].map(({ id, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => setCreativeRole(id)}
                    className={`btn-secondary ${creativeRole === id ? 'active' : ''}`}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 10px', lineHeight: 1.3 }}
                  >
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px' }}>{label}</span>
                    <span style={{ display: 'block', fontSize: '0.62rem', opacity: 0.55, fontWeight: 400 }}>{sub}</span>
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

            {[
              { key: 'type', label: 'AD TYPE', selectedLabel: `${AD_GENRE_HINTS[adType]?.icon} ${AD_GENRE_HINTS[adType]?.name}` },
              { key: 'format', label: 'FORMAT', selectedLabel: `${AD_FORMAT_PRESETS[adFormat]?.icon} ${AD_FORMAT_PRESETS[adFormat]?.label}` },
              { key: 'platform', label: 'PLATFORM', selectedLabel: adPlatform },
            ].map(({ key, label, selectedLabel }) => (
              <div key={key} className="control-group" style={{ marginBottom: '15px' }}>
                <button
                  onClick={() => setSidebarOpen(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '6px' }}
                >
                  <label className="input-label" style={{ marginBottom: 0, cursor: 'pointer' }}>{label}</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {sidebarOpen[key] ? '▲' : selectedLabel}
                  </span>
                </button>
                {sidebarOpen[key] && key === 'type' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {Object.entries(AD_GENRE_HINTS).map(([k, hint]) => (
                      <button key={k} onClick={() => setAdType(k)} className={`btn-secondary ${adType === k ? 'active' : ''}`}
                        style={{ justifyContent: 'flex-start', fontSize: 'var(--sidebar-btn-fs)', textAlign: 'left', padding: '5px 8px' }}>
                        {hint.icon} {hint.name}
                      </button>
                    ))}
                  </div>
                )}
                {sidebarOpen[key] && key === 'format' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(AD_FORMAT_PRESETS).map(([k, preset]) => (
                      <button key={k} onClick={() => setAdFormat(k)} className={`btn-secondary ${adFormat === k ? 'active' : ''}`}
                        style={{ flex: 1, fontSize: 'var(--sidebar-btn-fs)', minWidth: '45%', padding: '5px 6px' }}>
                        {preset.icon} {preset.label}
                      </button>
                    ))}
                  </div>
                )}
                {sidebarOpen[key] && key === 'platform' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(AD_PLATFORM_PRESETS).map(([k, preset]) => (
                      <button key={k} onClick={() => setAdPlatform(k)} className={`btn-secondary ${adPlatform === k ? 'active' : ''}`}
                        style={{ flex: 1, fontSize: 'var(--sidebar-btn-fs)', minWidth: '30%', padding: '5px 6px' }}>
                        {preset.icon} {k}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 'var(--sidebar-badge-fs)', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                {AD_GENRE_HINTS[adType]?.icon} {adType.toUpperCase()} · {AD_FORMAT_PRESETS[adFormat]?.label} · {adPlatform}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '6px' }}>
                {AD_GENRE_HINTS[adType]?.cues?.map(cue => (
                  <span key={cue} style={{ fontSize: 'var(--sidebar-badge-fs)', padding: '1px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', color: 'var(--text-muted)' }}>
                    #{cue}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {AD_FORMAT_PRESETS[adFormat]?.structure || ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                📐 {AD_PLATFORM_PRESETS[adPlatform]?.ratio} · Hook {AD_PLATFORM_PRESETS[adPlatform]?.hook}
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
              {(activeTab !== 'VISUALS' && activeTab !== 'VISION') && (
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

            {proposedDraft && (() => {
              const variations = activeTab === 'ARCHITECTURE' ? parseCopyVariations(proposedDraft) : null;
              return (
                <div className="briefing-assistant" style={{ position: 'absolute', top: '50px', right: '0', left: '0', zIndex: 100, maxHeight: '80%', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-primary)', background: 'var(--bg-floor)', padding: '20px' }}>
                  <h4 style={{ color: 'var(--accent-primary)', marginTop: 0, fontSize: '0.9rem', flexShrink: 0 }}>
                    ✨ AI Proposed Draft ({TAB_META[activeTab].label})
                    {variations && <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '8px' }}>— 시안 {variations.length}개 생성됨. 원하는 시안을 선택하세요.</span>}
                  </h4>
                  {variations ? (
                    <div style={{ display: 'flex', gap: '12px', flex: 1, overflowX: 'auto', overflowY: 'hidden', marginBottom: '10px' }}>
                      {variations.map((v, i) => (
                        <div key={i} style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '12px', background: 'rgba(255,255,255,0.03)' }}>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', flex: 1, overflowY: 'auto', lineHeight: 1.6 }}>
                            {v}
                          </div>
                          <button
                            className="btn-primary"
                            onClick={() => applyDraftText(v)}
                            style={{ marginTop: '10px', flexShrink: 0, padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            ✓ 시안 {i + 1} 선택
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                      {proposedDraft}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    {!variations && <button className="btn-primary" onClick={applyDraft}>Adopt & Overwrite</button>}
                    <button className="btn-secondary" onClick={discardDraft}>Discard</button>
                  </div>
                </div>
              );
            })()}
            
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              {activeTab === 'PIPELINE' ? (
                <div style={{ flex: 1, overflow: 'hidden', minHeight: '500px' }}>
                  <PipelineView project={project} pipelineData={pipelineData} category={project.category} />
                </div>
              ) : activeTab === 'VISION' ? (
                <AnalyticsDashboard data={pipelineData.analysisData} />
              ) : activeTab === 'TREATMENT' ? (
                <div className="directors-note-view glass" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                  {pipelineData.treatment || 'No content yet. Run the engine to generate.'}
                </div>
              ) : activeTab === 'SCENARIO' ? (
                <ScriptTableView raw={pipelineData.scenario} />
              ) : activeTab === 'VISUALS' ? (
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[{ id: 'prompt-only', label: '🎨 Image Prompts' }, { id: 'result', label: '🎞️ Storyboard' }].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setVisualBoardMode(id)}
                        className={`btn-secondary ${visualBoardMode === id ? 'active' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <StoryboardView
                    raw={pipelineData.treatment}
                    imageUrls={pipelineData.visuals_metadata}
                    onGenerate={handleGenerateSketch}
                    onGenerateAll={handleGenerateAllSketches}
                    loadingFrames={loadingFrames}
                    regenKeys={regenKeys}
                    viewMode={visualBoardMode}
                    onRunTreatment={() => { setActiveTab('TREATMENT'); generateContent('TREATMENT'); }}
                    editedPrompts={editedPrompts}
                    onPromptEdit={handlePromptEdit}
                    onOpenFolder={async (imgUrl) => {
                      await fetch(`http://${window.location.hostname}:3006/api/open-folder?path=${encodeURIComponent(imgUrl)}`);
                    }}
                  />
                </div>
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
