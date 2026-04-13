import React, { useState, useEffect } from 'react';

/**
 * ProjectHub — Phase-based project overview.
 *
 * Replaces the flat 7-tab layout with two clear phases:
 *   Phase 1: Screenplay Development (5 sequential steps)
 *   Phase 2: Production (scene/cut management → studio)
 *
 * Each phase card links to its own sub-page.
 */

const STUDIO_URL = 'http://localhost:3001';

/* ─── Phase 1: Writing Steps ─── */
const WRITING_STEPS = {
  'Feature Film': [
    { key: 'concept',       label: 'Development',   desc: '하이컨셉 & 로그라인',         icon: '01', field: 'concept' },
    { key: 'architecture',  label: 'Bible',          desc: '세계관 & 캐릭터 프로파일',      icon: '02', field: 'architecture' },
    { key: 'treatment',     label: 'Treatment',      desc: '3막 스텝 아웃라인',            icon: '03', field: 'treatment' },
    { key: 'scenario',      label: 'Screenplay',     desc: '마스터씬 포맷 시나리오',        icon: '04', field: 'scenario' },
    { key: 'review',        label: 'Coverage',       desc: '스크립트 커버리지 & 분석',      icon: '05', field: 'review' },
  ],
  'Short Film': [
    { key: 'concept',       label: 'Development',   desc: '하이컨셉 & 로그라인',         icon: '01', field: 'concept' },
    { key: 'architecture',  label: 'Bible',          desc: '세계관 & 캐릭터 프로파일',      icon: '02', field: 'architecture' },
    { key: 'treatment',     label: 'Treatment',      desc: '3막 스텝 아웃라인',            icon: '03', field: 'treatment' },
    { key: 'scenario',      label: 'Screenplay',     desc: '마스터씬 포맷 시나리오',        icon: '04', field: 'scenario' },
    { key: 'review',        label: 'Coverage',       desc: '스크립트 커버리지 & 분석',      icon: '05', field: 'review' },
  ],
  'Netflix Original': [
    { key: 'bible',         label: 'Series Bible',   desc: '시리즈 바이블 & 세계관',       icon: '01', field: 'bible' },
    { key: 'episodes',      label: 'Episode Arc',    desc: '에피소드 아크 맵',             icon: '02', field: 'episodes' },
    { key: 'script',        label: 'Teleplay',       desc: '파일럿 텔레플레이',            icon: '03', field: 'script' },
    { key: 'review',        label: 'Binge Audit',    desc: '바인지 적합성 감사',           icon: '04', field: 'review' },
  ],
  'Commercial': [
    { key: 'concept',       label: 'Creative Brief', desc: '크리에이티브 브리프',           icon: '01', field: 'concept' },
    { key: 'architecture',  label: 'Copy Deck',      desc: '카피라이팅 & 메시지',          icon: '02', field: 'architecture' },
    { key: 'treatment',     label: 'Art Direction',   desc: '아트 디렉션 & 비주얼',         icon: '03', field: 'treatment' },
    { key: 'scenario',      label: 'A/V Script',     desc: 'A/V 스크립트',                icon: '04', field: 'scenario' },
    { key: 'review',        label: 'Compliance',     desc: '브랜드 컴플라이언스',           icon: '05', field: 'review' },
  ],
  'YouTube': [
    { key: 'hook',          label: 'Hook Lab',       desc: '후킹 & 썸네일 기획',           icon: '01', field: 'hook' },
    { key: 'script',        label: 'Script',         desc: '풀 스크립트 작성',             icon: '02', field: 'script' },
    { key: 'edit',          label: 'Post-Production', desc: '편집 큐시트',                 icon: '03', field: 'edit' },
    { key: 'seo',           label: 'SEO Package',    desc: 'SEO & 메타데이터',             icon: '04', field: 'seo' },
  ],
};

function getSteps(category) {
  return WRITING_STEPS[category] || WRITING_STEPS['Feature Film'];
}

function getStepStatus(project, field) {
  const val = project[field];
  if (!val || val.length < 30) return 'empty';
  if (val.length < 200) return 'draft';
  return 'complete';
}

/* ─── Scene Stats ─── */
function useSceneStats(projectId) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/scenes`)
      .then(r => r.json())
      .then(d => {
        const scenes = d.scenes || [];
        const totalCuts = scenes.reduce((sum, s) => sum + (s.cutCount || s.cut_count || 0), 0);
        const doneCuts = scenes.reduce((sum, s) => sum + (s.completedCutCount || s.completed_cut_count || 0), 0);
        setStats({ scenes: scenes.length, totalCuts, doneCuts });
      })
      .catch(() => setStats(null));
  }, [projectId]);
  return stats;
}

/* ─── Main Component ─── */
const ProjectHub = ({ project, onBack, onNavigate }) => {
  const steps = getSteps(project.category);
  const sceneStats = useSceneStats(project.id);
  const [pipelineProgress, setPipelineProgress] = useState(null);

  useEffect(() => {
    if (!project?.id) return;
    fetch(`/api/projects/${project.id}/pipeline`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.nodes) {
          const nodes = Object.values(d.nodes);
          const design = nodes.filter(n => n.track === 'design');
          const video = nodes.filter(n => n.track === 'video');
          const designDone = design.filter(n => n.status === 'done').length;
          const videoDone = video.filter(n => n.status === 'done').length;
          setPipelineProgress({
            designDone, designTotal: 12,
            videoDone, videoTotal: 8,
            totalDone: designDone + videoDone,
            totalNodes: 20,
          });
        }
      })
      .catch(() => {});
  }, [project?.id]);

  // Calculate writing phase progress
  const completedSteps = steps.filter(s => getStepStatus(project, s.field) === 'complete').length;
  const writingProgress = Math.round((completedSteps / steps.length) * 100);
  const hasScreenplay = (project.scenario || project.script || '').length > 500;

  // Production readiness
  const productionReady = hasScreenplay;
  const productionProgress = sceneStats
    ? (sceneStats.totalCuts > 0 ? Math.round((sceneStats.doneCuts / sceneStats.totalCuts) * 100) : 0)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #0a0a0a)', color: 'var(--text-main, #f0f0f0)' }}>
      {/* ── Header ── */}
      <header style={{
        padding: '16px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: 'var(--text-dim, #999)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
          }}>
            ← BACK
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{project.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px', letterSpacing: '1px' }}>
              {project.category.toUpperCase()} · {project.genre}
            </div>
          </div>
          <button
            onClick={() => onNavigate('legacy')}
            style={{
              padding: '6px 12px', fontSize: '0.6rem', fontWeight: 500,
              background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px', color: 'var(--text-dim, #666)', cursor: 'pointer',
            }}
          >
            Classic View
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ═══ PHASE 1: SCREENPLAY DEVELOPMENT ═══ */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--accent-primary, #00d4ff)', margin: 0 }}>
                PHASE 1
              </h2>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0' }}>
                시나리오 개발
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {completedSteps}/{steps.length} 완료
              </span>
              <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                <div style={{ width: `${writingProgress}%`, height: '100%', background: 'var(--accent-primary, #00d4ff)', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <button
                onClick={() => onNavigate('writing')}
                style={{
                  padding: '8px 20px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'var(--accent-primary, #00d4ff)', color: '#000',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                OPEN WRITING ROOM
              </button>
            </div>
          </div>

          {/* Step Cards */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {steps.map((step, i) => {
              const status = getStepStatus(project, step.field);
              const isActive = status !== 'empty';
              const isDone = status === 'complete';
              return (
                <div
                  key={step.key}
                  onClick={() => onNavigate('writing', step.key)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: isDone ? 'rgba(34,197,94,0.06)' : isActive ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace',
                    color: isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                    lineHeight: 1, marginBottom: '8px',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                  {/* Status indicator */}
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isDone ? '#22c55e' : isActive ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                  }} />
                  {/* Connection arrow */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', zIndex: 1,
                    }}>
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Divider ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '48px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{
            fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-dim)',
            padding: '4px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px',
          }}>
            {productionReady ? '✓ SCREENPLAY READY' : '⏳ SCREENPLAY REQUIRED'}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* ═══ PHASE 2: PRODUCTION ═══ */}
        <section style={{ opacity: productionReady ? 1 : 0.4, pointerEvents: productionReady ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', color: '#f59e0b', margin: 0 }}>
                PHASE 2
              </h2>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0' }}>
                프로덕션
              </h3>
            </div>
            {sceneStats && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {sceneStats.doneCuts}/{sceneStats.totalCuts} cuts
                </span>
                <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <div style={{ width: `${productionProgress}%`, height: '100%', background: '#f59e0b', borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Production Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Card: Scene/Cut Management */}
            <div
              onClick={() => onNavigate('production')}
              style={{
                padding: '24px',
                background: 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🎬</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>씬/컷 관리</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '12px' }}>
                시나리오를 씬/컷으로 파싱하고 파이프라인 진행 상태를 관리합니다.
              </div>
              {sceneStats && (
                <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                  {sceneStats.scenes} scenes · {sceneStats.totalCuts} cuts
                </div>
              )}
            </div>

            {/* Card: Node Editor (Studio) */}
            <div
              onClick={() => window.open(`${STUDIO_URL}/projects/${project.id}`, '_blank')}
              style={{
                padding: '24px',
                background: 'rgba(139,92,246,0.04)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🔀</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Node Editor
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginLeft: '6px' }}>↗ Studio</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '12px' }}>
                ReactFlow 기반 컷별 파이프라인 에디터. 이미지/비디오/오디오 생성 노드를 관리합니다.
              </div>
              <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>localhost:3001</div>
            </div>

            {/* Card: Pipeline Overview */}
            <div
              onClick={() => onNavigate('pipeline')}
              style={{
                padding: '24px',
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>📊</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Pipeline & Analytics</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '12px' }}>
                프로덕션 디자인 / 비디오 생성 듀얼 트랙 진행 현황과 GS Stage Gate 체크리스트.
              </div>
              {pipelineProgress ? (
                <div style={{ fontSize: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#8b5cf6' }}>Design {pipelineProgress.designDone}/{pipelineProgress.designTotal}</span>
                    <span style={{ color: '#f59e0b' }}>Video {pipelineProgress.videoDone}/{pipelineProgress.videoTotal}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', height: '3px' }}>
                    <div style={{ flex: 12, background: 'rgba(139,92,246,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(pipelineProgress.designDone / 12) * 100}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px' }} />
                    </div>
                    <div style={{ flex: 8, background: 'rgba(245,158,11,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(pipelineProgress.videoDone / 8) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.6rem', color: '#22c55e' }}>GS STAGE GATE G1</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectHub;
