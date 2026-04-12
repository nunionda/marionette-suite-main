import React, { useState, useContext, useEffect, useRef } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import '../styles/ProjectDetail.css';
import SendToStudioButton from './SendToStudioButton';

// Rules
import youtubeRule from '../.agents/rules/YOUTUBE_ENGINE.md?raw';
import architectRule from '../.agents/rules/architect_ai.md?raw';

import { useAgentEngine } from '../hooks/useAgentEngine';
import AnalyticsDashboard from './AnalyticsDashboard';

// YouTube-specific genre hints
const YT_GENRE_HINTS = {
  'Documentary': {
    icon: '🎙️',
    cues: ['Open Loop', 'Cliff-hanger', 'B-roll Heavy', 'Expert Interview'],
    duration: '8-15min',
    hookType: 'Reveal the ending first'
  },
  'Story': {
    icon: '📖',
    cues: ['In Medias Res', 'Voiceover', 'Personal Stakes', 'Callback'],
    duration: '10-20min',
    hookType: 'Drop into most dramatic moment'
  },
  'Educational': {
    icon: '📚',
    cues: ['Before/After', 'Step-by-step', 'Common Mistake', 'Visual Demo'],
    duration: '5-12min',
    hookType: 'Show final result first'
  },
  'Comedy': {
    icon: '😂',
    cues: ['Rule of Three', 'Subversion', 'Callback', 'Escalation'],
    duration: '3-8min',
    hookType: 'Establish premise immediately'
  }
};

// Format presets for quick injection
const FORMAT_PRESETS = {
  'Mini Documentary': {
    icon: '🎬',
    structure: `[0:00-0:30] HOOK — 충격적 사실 or 반전 결론 먼저 공개\n[0:30-2:00] SETUP — 문제/현상 정의\n[2:00-5:00] DEEP DIVE A — 핵심 증거/스토리\n[5:00-8:00] DEEP DIVE B — 반전 포인트\n[8:00-11:00] REVELATION — 핵심 인사이트\n[11:00-14:00] IMPLICATIONS — 삶에 대한 의미\n[14:00-15:00] CTA + RECAP`,
    hookFormula: 'Open Loop — 결론을 먼저 보여주고 "왜?"를 유발'
  },
  'Tutorial': {
    icon: '📚',
    structure: `[0:00-0:30] HOOK — 최종 결과물 먼저 보여주기\n[0:30-1:30] PROMISE — 배울 내용 명시\n[1:30-3:00] WHY IT MATTERS — 필요한 이유\n[3:00-9:00] STEP-BY-STEP — 단계별 구현\n[9:00-11:00] COMMON MISTAKES — 흔한 실수 경고\n[11:00-12:00] RECAP + CTA`,
    hookFormula: 'Before/After — 완성본 먼저, 과정은 나중'
  },
  'Narrative Story': {
    icon: '📖',
    structure: `[0:00-0:45] HOOK — 가장 극적인 장면 먼저 (In medias res)\n[0:45-3:00] CONTEXT — 배경 설명\n[3:00-10:00] ACT 1 — 발단과 갈등 시작\n[10:00-16:00] ACT 2 — 갈등 심화, 반전, 위기\n[16:00-19:00] ACT 3 — 해결과 교훈\n[19:00-20:00] REFLECTION + CTA`,
    hookFormula: 'In Medias Res — 클라이맥스 장면으로 시작'
  },
  'Sketch / Comedy': {
    icon: '😂',
    structure: `[0:00-0:15] PREMISE — 상황 즉시 설정\n[0:15-1:00] ESCALATION 1 — 상황 과장 (Rule of Three 첫 번째)\n[1:00-2:30] ESCALATION 2 — 서브플롯 도입\n[2:30-5:00] SUBVERSION — 반전 (Rule of Three 세 번째)\n[5:00-7:30] CALLBACK — 앞 개그 재활용\n[7:30-8:00] TAG + CTA`,
    hookFormula: 'Pattern Interrupt — 즉각적인 상황 과장'
  }
};

// Filter out error strings that may have been persisted to the project
const clean = (val) => (typeof val === 'string' && val.startsWith('Error ')) ? '' : (val || '');

const YouTubeProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('HOOK');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');

  // YouTube-specific controls
  const [creatorRole, setCreatorRole] = useState('CREATOR');
  const [language, setLanguage] = useState('KO');
  const [selectedFormat, setSelectedFormat] = useState('Mini Documentary');
  const [retentionTarget, setRetentionTarget] = useState(60); // target % at 30s mark
  const [saveStatus, setSaveStatus] = useState('');

  // Brief optimization
  const [isOptimizingBrief, setIsOptimizingBrief] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);

  // YouTube data is stored in analysisData.youtube JSONB sub-document
  const ytData = project.analysisData?.youtube || {};

  // Content concept input
  const [contentConcept, setContentConcept] = useState(clean(project.conceptBrief || ytData.conceptBrief));
  const [targetAudience, setTargetAudience] = useState(clean(project.targetAudience || ytData.targetAudience));

  // Pipeline data
  const [pipelineData, setPipelineData] = useState({
    hook: clean(ytData.hook),
    script: clean(ytData.script),
    edit: clean(ytData.edit),
    seo: clean(ytData.seo),
    analysisData: project.analysisData || null
  });

  const outputRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    const yt = project.analysisData?.youtube || {};
    setPipelineData({
      hook: clean(yt.hook),
      script: clean(yt.script),
      edit: clean(yt.edit),
      seo: clean(yt.seo),
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
    // Merge YouTube data into analysisData.youtube so it maps to an existing JSONB column
    const existingAnalysis = pipelineData.analysisData || {};
    updateProject(project.id, {
      analysisData: {
        ...existingAnalysis,
        youtube: {
          hook: pipelineData.hook,
          script: pipelineData.script,
          edit: pipelineData.edit,
          seo: pipelineData.seo,
          conceptBrief: contentConcept,
          targetAudience,
        },
      },
    });
    setSaveStatus('SAVED ✓');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const getRoleContext = () =>
    `\n[Creator Role]: ${creatorRole}\n[Output Language]: ${language}\n[Target Format]: ${selectedFormat}\n[Target 30s Retention]: ${retentionTarget}%\n`;

  // --- Brief optimizer ---
  const optimizeBrief = async () => {
    if (!contentConcept) { setSaveStatus('⚠ 영상 콘셉트를 먼저 입력하세요'); setTimeout(() => setSaveStatus(''), 2000); return; }
    setIsOptimizingBrief(true);
    setBriefingResult(null);

    const preset = FORMAT_PRESETS[selectedFormat];
    const prompt = `[Task]: YouTube 콘텐츠 브리프를 최적화하세요.
[Original Concept]: ${contentConcept}
[Target Audience]: ${targetAudience || '명시되지 않음'}
[Format]: ${selectedFormat}
[Hook Formula to Apply]: ${preset.hookFormula}
[Suggested Structure]:
${preset.structure}
${getRoleContext()}

분석 후 아래 형식으로 출력하세요:
### [REFINED BRIEF]
- **Hook Strategy**: (어떻게 첫 3초를 설계할 것인지)
- **Core Promise**: (시청자가 끝까지 봐야 할 이유 한 문장)
- **Retention Tactics**: (이탈을 막을 2가지 전술)
- **CTA**: (영상 끝의 행동 유도)`;

    try {
      await executeBriefAgent(youtubeRule, prompt, 'brief', false, 'Optimizing Creator Brief...');
    } catch (err) {
      console.error("Brief optimization error:", err);
    } finally {
      setIsOptimizingBrief(false);
    }
  };

  const applyRefinedBrief = () => {
    if (!briefingResult) return;
    const match = briefingResult.match(/### \[REFINED BRIEF\]([\s\S]*?)(?=###|$)/i);
    setContentConcept(match ? match[1].trim() : briefingResult);
    setBriefingResult(null);
  };

  // --- Tab content generators ---
  const TAB_META = {
    HOOK: { label: 'HOOK LAB', engine: 'Hook Architect', icon: '🪝' },
    SCRIPT: { label: 'SCRIPT', engine: 'Script Writer', icon: '📝' },
    EDIT: { label: 'EDIT GUIDE', engine: 'Editor AI', icon: '✂️' },
    SEO: { label: 'SEO + THUMBNAIL', engine: 'SEO Analyst', icon: '🔍' },
    VISION: { label: 'ANALYTICS', engine: 'Data Analyst', icon: '📊' }
  };

  const generateContent = (tab) => {
    const roleContext = getRoleContext();
    const preset = FORMAT_PRESETS[selectedFormat];
    const baseContext = `\n[Format]: ${selectedFormat}\n[Genre]: ${project.genre}\n[Target Audience]: ${targetAudience || '일반 대중'}\n${roleContext}`;

    let prompt = '';
    let target = tab.toLowerCase();

    if (tab === 'HOOK') {
      prompt = `[Task]: 3-Layer Hook을 설계하세요.
[Concept]: ${contentConcept}
${baseContext}

아래 3가지 훅을 모두 작성하세요:
1. **Visual Hook (0-3s)**: 스크롤을 멈추는 시각적 충격 장면 묘사
2. **Audio Hook (0-5s)**: 인트로 BGM/SFX + 나레이션 톤
3. **Verbal Hook (3-15s)**: 시청자가 끝까지 봐야 할 이유 선언 (3가지 버전)

그 다음, 후보 Hook 오프닝 스크립트 3가지를 완전한 문장으로 작성하세요.
마지막으로 ${selectedFormat} 구조에 맞는 Chapter Markers (타임스탬프 포함)를 제안하세요.`;

    } else if (tab === 'SCRIPT') {
      prompt = `[Task]: 전체 스크립트를 작성하세요.
[Hook Script]: ${pipelineData.hook}
[Concept]: ${contentConcept}
${baseContext}

[Suggested Structure]:
${preset.structure}

위 구조에 따라 완전한 나레이션/대사 스크립트를 작성하세요.
- 각 섹션 시작에 타임코드와 섹션 제목 포함
- 나레이션은 구어체 사용 (language: ${language})
- 매 2-3분 구간마다 Pattern Interrupt 지점 명시 [PI]
- Open Loop 포인트 명시 [OL]
- CTA는 영상 마지막 60초에 배치`;

    } else if (tab === 'EDIT') {
      prompt = `[Task]: 편집 큐시트(Edit Cue Sheet)를 작성하세요.
[Script]: ${pipelineData.script}
${baseContext}

아래 형식으로 작성하세요:
### CUT BREAKDOWN
[타임코드] | [장면 유형: A-roll/B-roll/Motion Graphic/Stock] | [설명] | [효과/전환]

### B-ROLL SHOT LIST
필요한 B-roll 장면 목록 (촬영 or 스톡 영상)

### SOUND DESIGN
[타임코드] | [BGM/SFX 큐] | [분위기]

### SUBTITLE TIMING NOTES
강조 자막이 필요한 핵심 구간 명시`;

    } else if (tab === 'SEO') {
      prompt = `[Task]: SEO 최적화 패키지를 작성하세요.
[Concept]: ${contentConcept}
[Script Summary]: ${pipelineData.script ? pipelineData.script.slice(0, 500) : '(스크립트 없음)'}
${baseContext}

아래를 모두 포함하세요:

### TITLE OPTIONS (3가지 — CTR 최적화)
각 제목의 클릭률 전략 설명 포함

### THUMBNAIL CONCEPT
- 구도 설명 (인물 표정 / 텍스트 배치 / 배경)
- 썸네일 텍스트: 5단어 이하
- 사용할 색상 팔레트 (주목도 기준)
- 피해야 할 요소

### VIDEO DESCRIPTION (첫 2줄이 가장 중요)
완성된 설명란 텍스트 (SEO 키워드 포함, 타임스탬프 목록 포함)

### TAGS (20개)
검색량 높은 순서로 정렬

### COMMUNITY POST HOOK
업로드 당일 커뮤니티 탭 게시글 텍스트`;
    }

    if (prompt) {
      baseTextRef.current = '';
      executeAgent(youtubeRule, prompt, target);
    }
  };

  // Determine genre hint
  const genreHint = YT_GENRE_HINTS[project.genre] || YT_GENRE_HINTS['Documentary'];
  const currentPreset = FORMAT_PRESETS[selectedFormat];

  return (
    <div className="studio-root">
      <div className="project-detail">
        <header className="detail-header">
          <div className="header-left">
            <div className="back-btn" onClick={onBack}>← BACK</div>
            <span className="header-format-label">YOUTUBE</span>
          </div>
          <div className="header-title-block">
            <h1 className="header-title">{project.title}</h1>
          </div>
          <div className="header-right">
            <div className="header-divider" />
            <div className="header-save-controls">
              <SendToStudioButton scriptWriterProjectId={project.id} scriptData={pipelineData} />
              <button className="tactical-btn" onClick={saveToContext}>SAVE</button>
              {saveStatus && <span className="save-toast">{saveStatus}</span>}
            </div>
          </div>
        </header>

        <div className="studio-container">
          {/* 📋 SIDEBAR */}
          <aside className="studio-sidebar">
            <section className="sidebar-section">
              <h4 className="section-title">Content Vitals</h4>
              <div className="vitals-row">
                <div className="badge category-badge" style={{ background: '#FF0000', color: 'white', border: 'none', fontSize: 'var(--sidebar-badge-fs)' }}>
                  ▶️ YouTube
                </div>
                <div className="badge genre-badge" style={{ fontSize: 'var(--sidebar-badge-fs)' }}>
                  {genreHint.icon} {project.genre}
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div><b>Duration:</b> {genreHint.duration}</div>
                <div><b>Hook Type:</b> {genreHint.hookType}</div>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {genreHint.cues.map(cue => (
                  <span key={cue} className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,0,0,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,0,0,0.3)', padding: '2px 6px' }}>{cue}</span>
                ))}
              </div>
            </section>

            <section className="sidebar-section">
              <h4 className="section-title">Production Controls</h4>

              <div className="control-group" style={{ marginBottom: '15px' }}>
                <label className="input-label">CREATOR ROLE</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['CREATOR', 'EDITOR', 'SEO'].map(role => (
                    <button
                      key={role}
                      onClick={() => setCreatorRole(role)}
                      className={`btn-secondary ${creatorRole === role ? 'active' : ''}`}
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
                <label className="input-label">FORMAT PRESET</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(FORMAT_PRESETS).map(([name, preset]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedFormat(name)}
                      className={`btn-secondary ${selectedFormat === name ? 'active' : ''}`}
                      style={{ justifyContent: 'flex-start', fontSize: 'var(--sidebar-btn-fs)', textAlign: 'left', padding: '6px 8px' }}
                    >
                      {preset.icon} {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group" style={{ marginBottom: '15px' }}>
                <label className="input-label">30s RETENTION TARGET: {retentionTarget}%</label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={retentionTarget}
                  onChange={(e) => setRetentionTarget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#FF0000' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>40% (평균)</span>
                  <span>90% (바이럴)</span>
                </div>
              </div>
            </section>

            {/* Format Structure Preview */}
            <section className="sidebar-section">
              <h4 className="section-title">{currentPreset.icon} {selectedFormat} Structure</h4>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {currentPreset.structure}
              </div>
              <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,0,0,0.08)', borderRadius: '4px', borderLeft: '3px solid #FF0000', fontSize: '0.7rem', color: '#FF6B6B' }}>
                🪝 {currentPreset.hookFormula}
              </div>
            </section>

            <section className="sidebar-section">
              <h4 className="section-title">API Key</h4>
              <input
                type="password"
                className="logline-editor"
                placeholder="OpenRouter API Key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('openRouterApiKey', e.target.value);
                }}
                style={{ width: '100%', fontSize: '0.75rem', minHeight: 'auto', padding: '8px 12px' }}
              />
            </section>
          </aside>

          {/* 🎬 MAIN CONTENT AREA */}
          <main className="studio-main">
            {/* Concept Input + Brief Optimizer */}
            <div className="brief-panel glass" style={{ marginBottom: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">📹 VIDEO CONCEPT / LOGLINE</label>
                  <textarea
                    className="logline-editor"
                    placeholder="예: '한국 직장인의 번아웃 실태 — 5년간 과로사한 선배를 통해 본 현실'"
                    value={contentConcept}
                    onChange={(e) => setContentConcept(e.target.value)}
                    rows={2}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">🎯 TARGET AUDIENCE</label>
                  <textarea
                    className="logline-editor"
                    placeholder="예: '20-35세 직장인, 번아웃을 경험했거나 우려하는 사람'"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={2}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <button
                  className="tactical-btn"
                  onClick={optimizeBrief}
                  disabled={isOptimizingBrief || isGenerating}
                  style={{ marginTop: '22px', whiteSpace: 'nowrap', background: '#FF0000' }}
                >
                  {isOptimizingBrief ? '⚡ Optimizing...' : '🪝 OPTIMIZE BRIEF'}
                </button>
              </div>

              {briefingResult && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px' }}>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: '1.7', color: 'var(--text-primary)', maxHeight: '300px', overflowY: 'auto' }}>
                    {briefingResult}
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button className="tactical-btn" onClick={applyRefinedBrief} style={{ background: '#FF0000' }}>
                      ✅ APPLY REFINED BRIEF
                    </button>
                    <button className="btn-secondary" onClick={() => setBriefingResult(null)}>
                      ✕ Discard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="tabs" style={{ marginBottom: '16px' }}>
              {Object.entries(TAB_META).map(([key, meta]) => (
                <div
                  key={key}
                  className={`tab ${activeTab === key ? 'active' : ''} ${pipelineData[key.toLowerCase()]?.length > 50 ? 'has-content' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {meta.icon} {meta.label}
                </div>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content-area">
              {activeTab === 'VISION' ? (
                <AnalyticsDashboard analysisData={pipelineData.analysisData} />
              ) : (
                <>
                  <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span className="badge" style={{ background: 'rgba(255,0,0,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,0,0,0.3)', marginRight: '8px' }}>
                        {TAB_META[activeTab]?.engine}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {selectedFormat} · {language}
                      </span>
                    </div>
                    <button
                      className="tactical-btn"
                      onClick={() => generateContent(activeTab)}
                      disabled={isGenerating}
                      style={{ background: isGenerating ? 'var(--accent-muted)' : '#FF0000' }}
                    >
                      {isGenerating ? '⚡ GENERATING...' : `▶ RUN ${TAB_META[activeTab]?.label}`}
                    </button>
                  </div>

                  <textarea
                    ref={outputRef}
                    className="logline-editor"
                    value={pipelineData[activeTab.toLowerCase()] || ''}
                    onChange={(e) => handleDataChange(activeTab.toLowerCase(), e.target.value)}
                    placeholder={getPlaceholder(activeTab, selectedFormat)}
                    style={{ minHeight: '500px', width: '100%' }}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function getPlaceholder(tab, format) {
  const placeholders = {
    HOOK: `[${format} Hook Lab]\n\n▶ RUN to generate:\n• 3-Layer Hook (Visual / Audio / Verbal)\n• 3 Opening Script Variants\n• Chapter Markers with timestamps`,
    SCRIPT: `[${format} Full Script]\n\n▶ RUN to generate full narration script with:\n• Timestamped sections\n• Pattern Interrupt [PI] markers\n• Open Loop [OL] markers\n• CTA at end`,
    EDIT: `[Edit Cue Sheet]\n\n▶ RUN to generate:\n• Cut Breakdown (A-roll / B-roll / Graphics)\n• B-roll Shot List\n• Sound Design cues\n• Subtitle timing notes`,
    SEO: `[SEO + Thumbnail Package]\n\n▶ RUN to generate:\n• 3 Title options (CTR optimized)\n• Thumbnail concept & text\n• Video description (SEO)\n• 20 Tags\n• Community post hook`
  };
  return placeholders[tab] || '';
}

export default YouTubeProjectDetail;
