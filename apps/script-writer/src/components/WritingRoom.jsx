import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';

import loglineRule from '../.agents/rules/logline_engine.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';
import treatmentRule from '../.agents/rules/treatment_engine.md?raw';
import scenarioRule from '../.agents/rules/scenario_writer.md?raw';
import reviewRule from '../.agents/rules/production_review.md?raw';
import genreRules from '../.agents/rules/genres.md?raw';
import categoryRules from '../.agents/rules/categories.md?raw';
import clicheRules from '../.agents/rules/cliche_strategy.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import SceneBreakdownPanel from './SceneBreakdownPanel';
import AnalyticsDashboard from './AnalyticsDashboard';

/**
 * WritingRoom — Focused screenplay development sub-page.
 *
 * Sequential step-based navigation:
 *   Step 1: Development (concept/logline)
 *   Step 2: Bible (world/characters)
 *   Step 3: Treatment (step outline)
 *   Step 4: Screenplay (master scene format)
 *   Step 5: Coverage (script review)
 *
 * Each step shows its own AI engine, input area, and output area.
 * Steps are clearly sequential with dependencies.
 */

const STEP_CONFIGS = {
  'Feature Film': {
    steps: {
      concept:      { label: 'Development',  engine: 'Story Architect',   icon: '🎯', num: '01', rule: loglineRule, field: 'concept',      requires: null },
      architecture: { label: 'Bible',        engine: 'Story Architect',   icon: '📖', num: '02', rule: architectRule, field: 'architecture', requires: 'concept' },
      treatment:    { label: 'Treatment',    engine: 'Scene Writer',      icon: '🎬', num: '03', rule: treatmentRule, field: 'treatment',    requires: 'architecture' },
      scenario:     { label: 'Screenplay',   engine: 'Scenario Writer',   icon: '🖋️', num: '04', rule: scenarioRule, field: 'scenario',     requires: 'treatment' },
      review:       { label: 'Coverage',     engine: 'Pitch Master',      icon: '⚖️', num: '05', rule: reviewRule, field: 'review',        requires: 'scenario' },
    },
    order: ['concept', 'architecture', 'treatment', 'scenario', 'review'],
  },
  'Short Film': {
    steps: {
      concept:      { label: 'Development',  engine: 'Story Architect',   icon: '🎯', num: '01', rule: loglineRule, field: 'concept',      requires: null },
      architecture: { label: 'Bible',        engine: 'Story Architect',   icon: '📖', num: '02', rule: architectRule, field: 'architecture', requires: 'concept' },
      treatment:    { label: 'Treatment',    engine: 'Scene Writer',      icon: '🎬', num: '03', rule: treatmentRule, field: 'treatment',    requires: 'architecture' },
      scenario:     { label: 'Screenplay',   engine: 'Scenario Writer',   icon: '🖋️', num: '04', rule: scenarioRule, field: 'scenario',     requires: 'treatment' },
      review:       { label: 'Coverage',     engine: 'Pitch Master',      icon: '⚖️', num: '05', rule: reviewRule, field: 'review',        requires: 'scenario' },
    },
    order: ['concept', 'architecture', 'treatment', 'scenario', 'review'],
  },
  'Netflix Original': {
    steps: {
      bible:    { label: 'Series Bible',  engine: 'Showrunner',     icon: '📖', num: '01', rule: architectRule, field: 'bible',    requires: null },
      episodes: { label: 'Episode Arc',   engine: 'Story Room',     icon: '🎞️', num: '02', rule: treatmentRule, field: 'episodes', requires: 'bible' },
      script:   { label: 'Teleplay',      engine: 'Staff Writer',   icon: '🖋️', num: '03', rule: scenarioRule, field: 'script',   requires: 'episodes' },
      review:   { label: 'Binge Audit',   engine: 'Pitch Master',   icon: '⚡', num: '04', rule: reviewRule, field: 'review',    requires: 'script' },
    },
    order: ['bible', 'episodes', 'script', 'review'],
  },
  'Commercial': {
    steps: {
      concept:      { label: 'Creative Brief',  engine: 'Creative Director',    icon: '📋', num: '01', rule: loglineRule, field: 'concept',      requires: null },
      architecture: { label: 'Copy Deck',        engine: 'Senior Copywriter',   icon: '✍️', num: '02', rule: architectRule, field: 'architecture', requires: 'concept' },
      treatment:    { label: 'Art Direction',     engine: 'Art Director',         icon: '📜', num: '03', rule: treatmentRule, field: 'treatment',    requires: 'architecture' },
      scenario:     { label: 'A/V Script',        engine: 'Production Writer',    icon: '📽️', num: '04', rule: scenarioRule, field: 'scenario',     requires: 'treatment' },
      review:       { label: 'Compliance',        engine: 'Brand Strategist',     icon: '🔍', num: '05', rule: reviewRule, field: 'review',        requires: 'scenario' },
    },
    order: ['concept', 'architecture', 'treatment', 'scenario', 'review'],
  },
  'YouTube': {
    steps: {
      hook:   { label: 'Hook Lab',        engine: 'Hook Architect',       icon: '🪝', num: '01', rule: loglineRule, field: 'hook',   requires: null },
      script: { label: 'Script',          engine: 'Content Writer',       icon: '📝', num: '02', rule: scenarioRule, field: 'script', requires: 'hook' },
      edit:   { label: 'Post-Production', engine: 'Post Director',        icon: '✂️', num: '03', rule: treatmentRule, field: 'edit',   requires: 'script' },
      seo:    { label: 'SEO Package',     engine: 'Growth Strategist',    icon: '🔍', num: '04', rule: reviewRule, field: 'seo',    requires: 'edit' },
    },
    order: ['hook', 'script', 'edit', 'seo'],
  },
};

function getStepConfig(category) {
  return STEP_CONFIGS[category] || STEP_CONFIGS['Feature Film'];
}

const PRODUCTION_STANDARDS = {
  'GL_TENTPOLE': { label: 'Global Tentpole', rules: 'Maximize high-stakes spectacle, 3-act structure with 8 sequences.' },
  'KR_COMMERCIAL': { label: 'K-Commercial', rules: 'Emotional catharsis, fast-paced narrative twists, high-density dialogue subtext.' },
  'INDIE_NOIR': { label: 'Indie Noir', rules: 'Experimental structure, heavy subtext, low-key lighting descriptions.' },
};

const WritingRoom = ({ project, onBack, initialStep }) => {
  const { updateProject } = useContext(ProjectContext);
  const { steps: STEP_CONFIG, order: STEP_ORDER } = getStepConfig(project.category);
  const [activeStep, setActiveStep] = useState(initialStep || STEP_ORDER[0]);
  const [pipelineData, setPipelineData] = useState({
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || '',
    // Drama fields
    bible: project.bible || '',
    episodes: project.episodes || '',
    script: project.script || project.scenario || '',
    // YouTube fields
    hook: project.hook || '',
    edit: project.edit || '',
    seo: project.seo || '',
    analysisData: project.analysisData || null,
  });
  const [scenes, setScenes] = useState([]);
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [scriptMode, setScriptMode] = useState('DRAFT');
  const [producerNote, setProducerNote] = useState('');
  const [language, setLanguage] = useState('KO');
  const [productionStandard, setProductionStandard] = useState('GL_TENTPOLE');
  const [styleIntensity, setStyleIntensity] = useState(5);
  const [apiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [conceptBrief, setConceptBrief] = useState(project.conceptBrief || '');

  const outputRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    fetchOutline();
  }, [project]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [pipelineData, activeStep]);

  const fetchOutline = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/outline`);
      const data = await res.json();
      if (data.success) setScenes(data.outline || []);
    } catch (e) { /* silent */ }
  };

  const handleDataChange = (field, value, isAppend = false) => {
    setPipelineData(prev => ({
      ...prev,
      [field]: isAppend ? (baseTextRef.current + value) : value,
    }));
  };

  const { executeAgent, isGenerating, generationStatus } = useAgentEngine(apiKey, handleDataChange);

  const getRoleContext = () => `\n[Creative Role]: DIRECTOR\n[Output Language]: ${language}\n`;

  const saveToContext = async () => {
    updateProject(project.id, { ...pipelineData, conceptBrief });
    setSaveStatus('SAVED');

    // Auto-parse scenes/cuts when screenplay data exists
    const screenplayField = pipelineData.scenario || pipelineData.script || '';
    if (screenplayField.length > 500) {
      try {
        const res = await fetch(`/api/projects/${project.id}/scenes/parse`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setSaveStatus(`SAVED · ${data.stats?.totalScenes || 0} scenes parsed`);
        }
      } catch { /* silent */ }
    }

    setTimeout(() => setSaveStatus(''), 3000);
  };

  /* ─── Generation Functions ─── */

  const generateStep = () => {
    const cfg = STEP_CONFIG[activeStep];
    if (!cfg) return;
    const standardRules = PRODUCTION_STANDARDS[productionStandard].rules;
    const field = cfg.field;

    // First step: needs concept brief
    if (STEP_ORDER.indexOf(activeStep) === 0) {
      if (!conceptBrief.trim()) { setSaveStatus('아이디어를 먼저 입력하세요'); setTimeout(() => setSaveStatus(''), 2000); return; }
      executeAgent(cfg.rule, `[Production Standard]: ${standardRules}${getRoleContext()}\n[Category]: ${project.category}\n[Creative Brief]: ${conceptBrief}\n\n[Task]: ${cfg.label}을 작성하세요.`, field, false, `${cfg.label}...`);
      return;
    }

    // Dependency check
    const depField = cfg.requires;
    if (depField && (!pipelineData[depField] || pipelineData[depField].length < 50)) return;

    // Screenplay/Script/Teleplay step (main writing step — typically step 3 or 4)
    const isMainScript = ['scenario', 'script'].includes(activeStep);
    if (isMainScript) {
      const prevContent = pipelineData[depField] || '';
      const genreContext = `\n[Genre]: ${project.genre}\n[Category]: ${project.category}\n[Standard]: ${standardRules}\n[Dialogue Density]: ${styleIntensity}/10${getRoleContext()}`;
      const fullSystemPrompt = `${cfg.rule}\n\n[STANDARDS]\n${categoryRules}\n\n[GENRE]\n${genreRules}\n\n[CLICHE]\n${clicheRules}\n\n[PRODUCTION]\n${standardRules}`;

      if (scriptMode === 'REFINE') {
        const targetScene = selectedSceneId ? `S#${selectedSceneId}` : '전체';
        executeAgent(fullSystemPrompt, `[Mode]: REFINEMENT (${targetScene})${genreContext}\n[Feedback]:\n${producerNote}\n\n[Current Script]:\n${pipelineData[field]}\n\n[Task]: 피드백을 반영하여 수정하세요.`, field, false, 'Refining...');
        return;
      }

      baseTextRef.current = pipelineData[field] ? (pipelineData[field].trim() + '\n\n') : '';
      const lastSceneMatch = pipelineData[field] ? pipelineData[field].match(/S#(\d+)/g) : null;
      const nextSceneNum = lastSceneMatch ? parseInt(lastSceneMatch[lastSceneMatch.length - 1].replace('S#', '')) + 1 : 1;

      executeAgent(fullSystemPrompt, `[Mode]: INCREMENTAL DRAFTING${genreContext}\n[Next Scene]: S#${nextSceneNum}\n[Context]:\n기존:\n${pipelineData[field] ? pipelineData[field].slice(-1000) : '없음'}\n\n구조:\n${prevContent.slice(0, 2000)}\n\n[Task]: S#${nextSceneNum}부터 집필하세요.`, field, true, 'Drafting...');
      return;
    }

    // Review/Coverage/Audit step (last step typically)
    const isReview = ['review', 'seo'].includes(activeStep);
    if (isReview) {
      const mainContent = pipelineData[depField] || '';
      executeAgent(cfg.rule, `Full Content:\n${mainContent}\n\n${project.category} 기준으로 분석하세요.\n[ANALYSIS_JSON]\n{"emotionalArc":[],"characterMap":[],"beatProgress":[]}`, field, false, `${cfg.label}...`);
      return;
    }

    // Generic middle steps (architecture, treatment, episodes, edit, etc.)
    const prevContent = pipelineData[depField] || '';
    executeAgent(cfg.rule, `[Production Standard]: ${standardRules}${getRoleContext()}\n[Previous Stage (${STEP_CONFIG[depField]?.label || depField})]: ${prevContent.slice(0, 3000)}\n\n[Task]: ${cfg.label}을 작성하세요. ${project.category} 표준을 준수하세요.`, field, false, `${cfg.label}...`);
  };

  const cfg = STEP_CONFIG[activeStep];
  const stepIdx = STEP_ORDER.indexOf(activeStep);
  const prevStep = stepIdx > 0 ? STEP_ORDER[stepIdx - 1] : null;
  const nextStep = stepIdx < STEP_ORDER.length - 1 ? STEP_ORDER[stepIdx + 1] : null;

  // Check if current step's dependency is met
  const depField = cfg.requires;
  const depMet = !depField || (pipelineData[depField] && pipelineData[depField].length > 50);

  const selectStyle = {
    padding: '4px 8px', fontSize: '0.6rem', fontWeight: 600,
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px', color: 'var(--text-dim, #888)', cursor: 'pointer',
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color, #0a0a0a)' }}>
      {/* ── Top Bar ── */}
      <header style={{
        padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.4)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
            ← Hub
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{project.title}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>WRITING ROOM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Production Controls */}
          <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
            <option value="KO">KO</option>
            <option value="EN">EN</option>
          </select>
          <select value={productionStandard} onChange={e => setProductionStandard(e.target.value)} style={selectStyle}>
            {Object.entries(PRODUCTION_STANDARDS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Style</span>
            <input type="range" min="1" max="10" value={styleIntensity} onChange={e => setStyleIntensity(Number(e.target.value))}
              style={{ width: '50px', height: '3px', accentColor: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', width: '12px' }}>{styleIntensity}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          {saveStatus && <span style={{ fontSize: '0.65rem', color: 'var(--status-ok)' }}>{saveStatus}</span>}
          <button onClick={saveToContext} style={{
            padding: '6px 16px', fontSize: '0.7rem', fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer',
          }}>
            SAVE
          </button>
        </div>
      </header>

      {/* ── Step Navigation (horizontal stepper) ── */}
      <nav style={{
        padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'stretch', flexShrink: 0,
        background: 'rgba(0,0,0,0.2)',
      }}>
        {STEP_ORDER.map((key, i) => {
          const s = STEP_CONFIG[key];
          const status = getFieldStatus(pipelineData[s.field]);
          const isActive = key === activeStep;
          return (
            <button
              key={key}
              onClick={() => setActiveStep(key)}
              style={{
                flex: 1, padding: '12px 8px',
                background: 'none', border: 'none', borderBottom: isActive ? '2px solid var(--accent-primary, #00d4ff)' : '2px solid transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-dim)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              {/* Status dot */}
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: status === 'complete' ? 'var(--status-ok)' : status === 'draft' ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
              }} />
              <span style={{ letterSpacing: '0.5px' }}>{s.num}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Scene sidebar (only for Treatment/Screenplay) */}
        {(activeStep === 'scenario' || activeStep === 'treatment') && pipelineData.scenario && (
          <aside style={{
            width: '280px', borderRight: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '8px 12px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              SCENE BREAKDOWN
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <SceneBreakdownPanel
                screenplayText={pipelineData.scenario}
                projectTitle={project.title}
                projectId={project.id}
                onSceneClick={(scene) => setSelectedSceneId(scene.number)}
              />
            </div>
          </aside>
        )}

        {/* Center: Editor */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Step header + actions */}
          <div style={{
            padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary, #00d4ff)', fontWeight: 600, letterSpacing: '1px', marginBottom: '2px' }}>
                {cfg.engine.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {cfg.icon} {cfg.label}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeStep === 'scenario' && (
                <button
                  onClick={() => setScriptMode(scriptMode === 'DRAFT' ? 'REFINE' : 'DRAFT')}
                  style={{
                    padding: '6px 12px', fontSize: '0.65rem', fontWeight: 600,
                    background: scriptMode === 'REFINE' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${scriptMode === 'REFINE' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '4px', color: scriptMode === 'REFINE' ? 'var(--gold)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                >
                  {scriptMode === 'REFINE' ? '⚖️ REFINE' : '⚙️ DRAFT'}
                </button>
              )}
              <button
                onClick={generateStep}
                disabled={isGenerating || !depMet}
                style={{
                  padding: '8px 20px', fontSize: '0.72rem', fontWeight: 700,
                  background: depMet ? 'var(--accent-primary, #00d4ff)' : 'rgba(255,255,255,0.06)',
                  color: depMet ? '#000' : 'var(--text-dim)',
                  border: 'none', borderRadius: '6px', cursor: depMet ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.5px',
                }}
              >
                {isGenerating ? generationStatus || 'Generating...' : `⚡ RUN ${cfg.label.toUpperCase()}`}
              </button>
            </div>
          </div>

          {/* Dependency warning */}
          {!depMet && depField && (
            <div style={{
              padding: '12px 24px', fontSize: '0.7rem', color: 'var(--gold)',
              background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.1)',
            }}>
              ⚠ {STEP_CONFIG[depField].label} 단계를 먼저 완료해야 합니다.
              <button
                onClick={() => setActiveStep(depField)}
                style={{
                  marginLeft: '8px', padding: '2px 8px', fontSize: '0.65rem',
                  background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '3px', color: 'var(--gold)', cursor: 'pointer',
                }}
              >
                → {STEP_CONFIG[depField].label}로 이동
              </button>
            </div>
          )}

          {/* Concept Brief input (only for step 1) */}
          {activeStep === 'concept' && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>IDEA BRIEF</div>
              <textarea
                value={conceptBrief}
                onChange={(e) => setConceptBrief(e.target.value)}
                placeholder="영화 아이디어를 자유롭게 입력하세요..."
                style={{
                  width: '100%', minHeight: '80px', resize: 'vertical',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px', padding: '10px', fontSize: '0.8rem',
                  color: 'var(--text-main)', fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            </div>
          )}

          {/* Producer Note (Refine mode) */}
          {activeStep === 'scenario' && scriptMode === 'REFINE' && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '1px', marginBottom: '6px' }}>
                DIRECTOR'S NOTE {selectedSceneId ? `(S#${selectedSceneId})` : '(전체)'}
              </div>
              <textarea
                value={producerNote}
                onChange={(e) => setProducerNote(e.target.value)}
                placeholder="수정 지시사항을 입력하세요..."
                style={{
                  width: '100%', minHeight: '60px', resize: 'vertical',
                  background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: '6px', padding: '10px', fontSize: '0.75rem',
                  color: 'var(--text-main)', fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
            </div>
          )}

          {/* Output area */}
          <div style={{ flex: 1, padding: '0 24px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeStep === 'review' && pipelineData.analysisData ? (
              <div style={{ flex: 1, overflowY: 'auto', paddingTop: '12px' }}>
                <AnalyticsDashboard data={pipelineData.analysisData} />
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>COVERAGE TEXT</div>
                  <textarea
                    ref={outputRef}
                    className="logline-editor"
                    value={pipelineData.review}
                    onChange={(e) => handleDataChange('review', e.target.value)}
                    disabled={isGenerating}
                    style={{
                      width: '100%', minHeight: '300px', resize: 'vertical',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '12px', fontSize: '0.78rem',
                      color: 'var(--text-main)', fontFamily: 'inherit', lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                ref={outputRef}
                value={pipelineData[cfg.field] || ''}
                onChange={(e) => handleDataChange(cfg.field, e.target.value)}
                disabled={isGenerating}
                placeholder={depMet ? `[ ${cfg.label.toUpperCase()} ] ⚡ RUN 버튼을 눌러 AI 생성을 시작하세요.` : `이전 단계를 먼저 완료하세요.`}
                style={{
                  flex: 1, marginTop: '12px', resize: 'none',
                  background: activeStep === 'scenario' ? '#fff' : 'rgba(0,0,0,0.3)',
                  color: activeStep === 'scenario' ? '#111' : 'var(--text-main)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                  padding: '16px', fontSize: activeStep === 'scenario' ? '0.85rem' : '0.78rem',
                  fontFamily: activeStep === 'scenario' ? "'Courier New', monospace" : 'inherit',
                  lineHeight: 1.7,
                }}
              />
            )}
          </div>

          {/* Bottom nav */}
          <div style={{
            padding: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
          }}>
            <button
              onClick={() => prevStep && setActiveStep(prevStep)}
              disabled={!prevStep}
              style={{
                padding: '6px 16px', fontSize: '0.7rem', fontWeight: 600,
                background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px', color: prevStep ? 'var(--text-dim)' : 'rgba(255,255,255,0.15)',
                cursor: prevStep ? 'pointer' : 'default',
              }}
            >
              ← {prevStep ? STEP_CONFIG[prevStep].label : ''}
            </button>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
              STEP {stepIdx + 1} / {STEP_ORDER.length}
            </span>
            <button
              onClick={() => nextStep && setActiveStep(nextStep)}
              disabled={!nextStep}
              style={{
                padding: '6px 16px', fontSize: '0.7rem', fontWeight: 600,
                background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px', color: nextStep ? 'var(--text-dim)' : 'rgba(255,255,255,0.15)',
                cursor: nextStep ? 'pointer' : 'default',
              }}
            >
              {nextStep ? STEP_CONFIG[nextStep].label : ''} →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

function getFieldStatus(val) {
  if (!val || val.length < 30) return 'empty';
  if (val.length < 200) return 'draft';
  return 'complete';
}

export default WritingRoom;
