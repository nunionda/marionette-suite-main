import React, { useState, useEffect } from 'react';
import PipelineView from './PipelineView';
import StageGateChecklist from './StageGateChecklist';
import AnalyticsDashboard from './AnalyticsDashboard';
import NodeExecutionPanel from './NodeExecutionPanel';
import StoryboardGallery from './StoryboardGallery';
import ArtBibleViewer from './ArtBibleViewer';
import SceneDetailView from './SceneDetailView';

/**
 * ProductionDeck — Production management sub-page.
 *
 * Sections:
 *   1. Scene/Cut Overview (with parse + stats) → SceneDetailView drill-down
 *   2. Pipeline View (Design/Video dual-track)
 *   3. Storyboard / Art Bible / References / Analytics
 */

const ProductionDeck = ({ project, onBack, initialView }) => {
  const [activeView, setActiveView] = useState(initialView || 'pipeline');
  const [selectedNode, setSelectedNode] = useState(null); // { node, track }
  const [selectedSceneId, setSelectedSceneId] = useState(null); // drill-down into SceneDetailView
  const [pipelineRefreshKey, setPipelineRefreshKey] = useState(0);
  const [batchingSceneId, setBatchingSceneId] = useState(null);
  const [batchProgress, setBatchProgress] = useState(null); // { current, total, scene }
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [stats, setStats] = useState(null);

  const pipelineData = {
    concept: project.concept || '',
    architecture: project.architecture || '',
    treatment: project.treatment || '',
    scenario: project.scenario || '',
    review: project.review || '',
    analysisData: project.analysisData || null,
  };

  useEffect(() => { fetchScenes(); }, [project.id]);

  const fetchScenes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes`);
      const data = await res.json();
      const sceneList = data.scenes || [];
      setScenes(sceneList);

      const totalCuts = sceneList.reduce((s, r) => s + (r.cutCount || r.cut_count || 0), 0);
      const doneCuts = sceneList.reduce((s, r) => s + (r.completedCutCount || r.completed_cut_count || 0), 0);
      const chars = new Set();
      sceneList.forEach(s => {
        const c = typeof s.characters === 'string' ? JSON.parse(s.characters || '[]') : (s.characters || []);
        c.forEach(ch => chars.add(ch));
      });
      setStats({ scenes: sceneList.length, totalCuts, doneCuts, characters: chars.size });
    } catch (e) {
      console.error('Failed to fetch scenes:', e);
    } finally {
      setLoading(false);
    }
  };

  const parseScreenplay = async () => {
    setParsing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/parse`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchScenes();
      }
    } catch (e) {
      console.error('Parse failed:', e);
    } finally {
      setParsing(false);
    }
  };

  const openSceneDetail = (scene) => {
    setSelectedSceneId(scene.id);
  };

  const VIEW_TABS = [
    { key: 'pipeline',    label: 'Pipeline',      icon: '🔀' },
    { key: 'storyboard',  label: 'Storyboard',    icon: '📐' },
    { key: 'scenes',      label: 'Scenes / Cuts', icon: '🎬' },
    { key: 'artbible',    label: 'Art Bible',      icon: '📕' },
    { key: 'references',  label: 'References',     icon: '🎨' },
    { key: 'analytics',   label: 'Analytics',      icon: '📊' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-floor)' }}>
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
          <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '1px' }}>PRODUCTION</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stats && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              {stats.scenes} scenes · {stats.totalCuts} cuts · {stats.doneCuts} done
            </span>
          )}
        </div>
      </header>

      {/* ── View Tabs ── */}
      <nav style={{
        padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: '4px', flexShrink: 0, background: 'rgba(0,0,0,0.2)',
      }}>
        {VIEW_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveView(tab.key); setSelectedSceneId(null); }}
            style={{
              padding: '10px 20px', fontSize: '0.72rem', fontWeight: activeView === tab.key ? 700 : 500,
              background: 'none', border: 'none',
              borderBottom: activeView === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeView === tab.key ? 'var(--text-main)' : 'var(--text-dim)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeView === 'scenes' && selectedSceneId ? (
          <SceneDetailView
            project={project}
            sceneId={selectedSceneId}
            onBack={() => setSelectedSceneId(null)}
          />
        ) : activeView === 'scenes' && (
          <ScenesView
            scenes={scenes}
            stats={stats}
            loading={loading}
            parsing={parsing}
            hasScreenplay={!!project.scenario}
            onParse={parseScreenplay}
            onSceneClick={openSceneDetail}
            onBatchExecute={async (scene) => {
              setBatchingSceneId(scene.id);
              setBatchProgress({ current: 0, total: Math.min(scene.cutCount || scene.cut_count || 5, 5), scene: scene.display_id || scene.slug });
              try {
                const res = await fetch(`/api/projects/${project.id}/scenes/${scene.id}/batch-execute`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ steps: ['image_prompt', 'image_gen'], maxCuts: 5 }),
                });
                const data = await res.json();
                if (data.success) {
                  setBatchProgress({ current: data.processedCuts, total: data.totalCuts, scene: data.scene });
                }
                await fetchScenes();
              } catch (e) { /* silent */ }
              setTimeout(() => { setBatchingSceneId(null); setBatchProgress(null); }, 3000);
            }}
            batchingSceneId={batchingSceneId}
            batchProgress={batchProgress}
            projectId={project.id}
          />
        )}
        {activeView === 'pipeline' && (
          <div style={{ height: '100%', overflow: 'hidden', display: 'flex', position: 'relative' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PipelineView
                project={project}
                pipelineData={pipelineData}
                category={project.category}
                onNodeClick={(track, node) => setSelectedNode({ node, track })}
                refreshKey={pipelineRefreshKey}
              />
            </div>
            <aside style={{ width: '260px', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '16px', flexShrink: 0 }}>
              <StageGateChecklist project={project} pipelineData={pipelineData} category={project.category} />
            </aside>
            {/* Node Execution Panel (slide-in) */}
            {selectedNode && (
              <NodeExecutionPanel
                node={selectedNode.node}
                track={selectedNode.track}
                projectId={project.id}
                project={project}
                onClose={() => { setSelectedNode(null); setPipelineRefreshKey(k => k + 1); }}
              />
            )}
          </div>
        )}
        {activeView === 'storyboard' && (
          <StoryboardGallery
            projectId={project.id}
            project={project}
            onBack={() => setActiveView('pipeline')}
          />
        )}
        {activeView === 'artbible' && (
          <ArtBibleViewer
            projectId={project.id}
            project={project}
            onBack={() => setActiveView('pipeline')}
          />
        )}
        {activeView === 'analytics' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '24px' }}>
            <AnalyticsDashboard data={pipelineData.analysisData} />
          </div>
        )}
        {activeView === 'references' && (
          <div style={{ height: '100%', position: 'relative' }}>
            <iframe
              src="/gallery/index.html?embed=true"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#06060a',
              }}
              title="Visual Reference Library"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Scenes View ─── */
function ScenesView({ scenes, stats, loading, parsing, hasScreenplay, onParse, onSceneClick, onBatchExecute, projectId, batchingSceneId, batchProgress }) {
  const [actFilter, setActFilter] = useState(null);

  const filtered = actFilter
    ? scenes.filter(s => s.act === actFilter)
    : scenes;

  // Group by act
  const actGroups = {};
  scenes.forEach(s => {
    const act = s.act || 1;
    if (!actGroups[act]) actGroups[act] = [];
    actGroups[act].push(s);
  });

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-dim)', fontSize: '0.8rem', textAlign: 'center' }}>Loading scenes...</div>;
  }

  if (scenes.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎬</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>씬이 아직 없습니다</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.5 }}>
          {hasScreenplay
            ? '시나리오를 씬/컷으로 파싱하여 프로덕션을 시작하세요.'
            : 'Writing Room에서 시나리오를 먼저 작성해야 합니다.'}
        </div>
        {hasScreenplay && (
          <button
            onClick={onParse}
            disabled={parsing}
            style={{
              padding: '12px 32px', fontSize: '0.8rem', fontWeight: 700,
              background: 'var(--gold)', color: '#000', border: 'none',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {parsing ? '파싱 중...' : '⚡ 시나리오 파싱'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Stats bar */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          <span><strong style={{ color: 'var(--gold)' }}>{stats?.scenes || 0}</strong> Scenes</span>
          <span><strong style={{ color: 'var(--gold)' }}>{stats?.totalCuts || 0}</strong> Cuts</span>
          <span><strong style={{ color: 'var(--gold)' }}>{stats?.characters || 0}</strong> Characters</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Act filter */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setActFilter(null)} style={filterBtnStyle(!actFilter)}>ALL</button>
          {Object.keys(actGroups).sort().map(act => (
            <button key={act} onClick={() => setActFilter(Number(act))} style={filterBtnStyle(actFilter === Number(act))}>
              ACT {act}
            </button>
          ))}
        </div>
        <button onClick={onParse} disabled={parsing} style={{
          padding: '4px 12px', fontSize: '0.6rem', fontWeight: 600,
          background: 'var(--gold-subtle)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '4px', color: 'var(--gold)', cursor: 'pointer',
        }}>
          {parsing ? '...' : '↻ Re-parse'}
        </button>
      </div>

      {/* Scene grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {filtered.map(scene => {
            const chars = typeof scene.characters === 'string' ? JSON.parse(scene.characters || '[]') : (scene.characters || []);
            const cutCount = scene.cutCount || scene.cut_count || 0;
            const doneCuts = scene.completedCutCount || scene.completed_cut_count || 0;
            const progress = cutCount > 0 ? Math.round((doneCuts / cutCount) * 100) : 0;

            return (
              <div
                key={scene.id}
                onClick={() => onSceneClick(scene)}
                style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.background = 'rgba(245,158,11,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                {/* Cover image (if any cut has an image) */}
                {scene.coverImageUrl && (
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '4px', marginBottom: '8px', background: '#111' }}>
                    <img src={scene.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                    {scene.displayId || scene.display_id || scene.slug}
                  </span>
                  <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '3px', background: 'var(--gold-subtle)', color: 'var(--gold)' }}>
                    {cutCount} cuts
                  </span>
                </div>

                {/* Location */}
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {scene.setting && <span style={{ color: scene.setting === 'INT.' ? '#60a5fa' : '#34d399', marginRight: '4px' }}>{scene.setting}</span>}
                  {scene.location || ''}
                </div>

                {/* Characters */}
                {chars.length > 0 && (
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {chars.slice(0, 3).map(ch => (
                      <span key={ch} style={{ fontSize: '0.5rem', padding: '1px 4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                        {ch}
                      </span>
                    ))}
                    {chars.length > 3 && <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>+{chars.length - 3}</span>}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--status-ok)' : 'var(--gold)', borderRadius: '2px' }} />
                  {batchingSceneId === scene.id && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                      background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                      animation: 'shimmer 1.5s infinite',
                      borderRadius: '2px',
                    }} />
                  )}
                </div>
                {batchingSceneId === scene.id && batchProgress && (
                  <div style={{ fontSize: '0.5rem', color: 'var(--gold)', marginTop: '4px', textAlign: 'center', fontWeight: 600 }}>
                    ⚡ {batchProgress.current}/{batchProgress.total} cuts processing...
                  </div>
                )}

                {/* Actions row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onBatchExecute?.(scene); }}
                    style={{
                      fontSize: '0.5rem', padding: '2px 8px', fontWeight: 600,
                      background: 'var(--gold-subtle)', border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: '3px', color: 'var(--gold)', cursor: 'pointer',
                    }}
                  >
                    ⚡ Generate
                  </button>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>
                    컷 편집 →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function filterBtnStyle(isActive) {
  return {
    padding: '4px 10px', fontSize: '0.6rem', fontWeight: 600,
    background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '4px', color: isActive ? 'var(--gold)' : 'var(--text-dim)',
    cursor: 'pointer',
  };
}

export default ProductionDeck;
