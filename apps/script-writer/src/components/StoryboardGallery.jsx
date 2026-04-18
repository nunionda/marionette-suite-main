import React, { useState, useEffect, useRef } from 'react';

// Storyboard artists (Phase 3: aligned with NodeExecutionPanel STYLE_BY_NODE)
const STYLES = [
  { id: 'j_todd_anderson', label: 'J. Todd Anderson', desc: 'Coen Brothers, Fargo — clean shot design' },
  { id: 'moebius',         label: 'Moebius',          desc: 'Alien, Tron — expressive line, surreal' },
  { id: 'martin_asbury',  label: 'Martin Asbury',    desc: 'James Bond — action clarity, dynamic angles' },
  { id: 'mike_kungl',     label: 'Mike Kungl',       desc: 'Pixar/Disney — character-focused emotional beats' },
  { id: 'alex_saviuk',    label: 'Alex Saviuk',      desc: 'Hollywood action — wide to tight coverage' },
  { id: 'pierre_droal',   label: 'Pierre Droal',     desc: 'European cinematic — painterly depth staging' },
];

const YOUTUBE_STYLES = [
  { id: 'thumbnail', label: 'Thumbnail Style' },
  { id: 'reaction', label: 'Reaction / Talk' },
  { id: 'vlog', label: 'Vlog / Lifestyle' },
  { id: 'educational', label: 'Educational' },
  { id: 'gaming', label: 'Gaming / Dynamic' },
];

// Extract segments from analysis_data.youtube for batch generation
const extractYouTubeSegments = (analysisData, count) => {
  const yt = analysisData?.youtube || {};
  const raw = [yt.hook, yt.scenes, yt.content, yt.description, yt.script]
    .filter(Boolean).join('\n\n');
  if (!raw) return [];
  const paras = raw.split(/\n{2,}/).filter(p => p.trim().length > 20);
  const selected = paras.slice(0, count);
  return selected.map((p, i) => ({
    id: `yt-seg-${i}`,
    index: i + 1,
    description: p.replace(/^#+\s*/, '').replace(/\*+/g, '').trim().slice(0, 250),
  }));
};

const StoryboardGallery = ({ projectId, project, onBack }) => {
  const isYouTube = project?.category === 'YouTube';
  const styleOptions = isYouTube ? YOUTUBE_STYLES : STYLES;

  const [scenes, setScenes] = useState([]);
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [sceneCuts, setSceneCuts] = useState([]);
  const [style, setStyle] = useState(isYouTube ? 'thumbnail' : 'j_todd_anderson');
  const [confirmedStyle, setConfirmedStyle] = useState(() => {
    const raw = project?.analysisData ?? project?.analysis_data;
    try { const ad = typeof raw === 'string' ? JSON.parse(raw) : raw; return ad?.storyboardStyle || null; } catch { return null; }
  });
  const [generating, setGenerating] = useState(false);
  const [generatingCutId, setGeneratingCutId] = useState(null); // per-cut loading
  const [generatedFrames, setGeneratedFrames] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [frameCount, setFrameCount] = useState(6); // YouTube batch frame count
  const framesRef = useRef(generatedFrames);
  framesRef.current = generatedFrames;

  const confirmStyle = async () => {
    const styleObj = STYLES.find(s => s.id === style);
    const storyboardStyle = { id: style, label: styleObj?.label, confirmedAt: new Date().toISOString() };
    const raw = project?.analysisData ?? project?.analysis_data;
    const ad = (() => { try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); } catch { return {}; } })();
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisData: { ...ad, storyboardStyle } }),
    });
    setConfirmedStyle(storyboardStyle);
  };

  const changeStyle = () => {
    const doneCount = generatedFrames.filter(f => f.status === 'done').length;
    if (doneCount > 0 && !window.confirm(`스타일을 변경하면 기존 ${doneCount}개 프레임과 스타일이 달라집니다. 계속하시겠습니까?`)) return;
    setConfirmedStyle(null);
  };

  // Load scenes
  useEffect(() => {
    fetch(`/api/projects/${projectId}/scenes`)
      .then(r => r.json())
      .then(d => {
        const list = d.scenes || [];
        setScenes(list);
        if (list.length > 0 && !selectedSceneId) setSelectedSceneId(list[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  // YouTube batch mode: build segments from analysis_data when no scenes in DB
  const isYouTubeBatchMode = isYouTube && !loading && scenes.length === 0;

  useEffect(() => {
    if (!isYouTubeBatchMode) return;
    const ad = (() => {
      if (!project?.analysisData && !project?.analysis_data) return null;
      const raw = project.analysisData ?? project.analysis_data;
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
    })();
    const segs = extractYouTubeSegments(ad, frameCount);
    const frames = segs.map(s => ({
      cutId: s.id,
      cutSlug: `FRAME-${String(s.index).padStart(2, '0')}`,
      description: s.description,
      imageUrl: null,
      status: 'pending',
    }));
    setGeneratedFrames(frames);
  }, [isYouTubeBatchMode, frameCount, project]);

  // Load cuts when scene changes (per-cut mode)
  useEffect(() => {
    if (!selectedSceneId) return;
    fetch(`/api/scenes/${selectedSceneId}`)
      .then(r => r.json())
      .then(d => {
        const cuts = d.cuts || [];
        setSceneCuts(cuts);
        setGeneratedFrames(cuts.map(c => ({
          cutId: c.id,
          cutSlug: c.display_id || c.slug,
          description: c.description || c.script_text || '',
          imageUrl: c.image_url || c.imageUrl || null,
          status: c.image_url || c.imageUrl ? 'done' : 'pending',
        })));
      })
      .catch(() => setSceneCuts([]));
  }, [selectedSceneId]);

  // Call the storyboard execute API for a single frame/cut
  const executeStoryboard = async (description) => {
    const res = await fetch(`/api/projects/${projectId}/pipeline/storyboard/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'previz',
        track: 'design',
        style: confirmedStyle?.id || style,
        description: description || `Scene frame`,
        scene: description || '',
        project: project?.title || 'Untitled',
        category: project?.category || '',
      }),
    });
    const data = await res.json();
    return data.result?.imageUrl || data.result?.image_url || data.result?.url || null;
  };

  // YouTube batch: generate all frames sequentially
  const generateYouTubeBatch = async () => {
    const frames = framesRef.current;
    if (frames.length === 0) return;
    setGenerating(true);
    setProgress({ current: 0, total: frames.length });

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      setGeneratedFrames(prev => prev.map(f =>
        f.cutId === frame.cutId ? { ...f, status: 'generating' } : f
      ));
      try {
        const imageUrl = await executeStoryboard(frame.description);
        setGeneratedFrames(prev => prev.map(f =>
          f.cutId === frame.cutId ? { ...f, imageUrl, status: imageUrl ? 'done' : 'error' } : f
        ));
      } catch {
        setGeneratedFrames(prev => prev.map(f =>
          f.cutId === frame.cutId ? { ...f, status: 'error' } : f
        ));
      }
      setProgress({ current: i + 1, total: frames.length });
    }
    setGenerating(false);
  };

  // Per-cut mode: generate a single cut
  const generateSingleCut = async (frame) => {
    if (generatingCutId || generating) return;
    setGeneratingCutId(frame.cutId);
    try {
      const imageUrl = await executeStoryboard(frame.description);
      setGeneratedFrames(prev => prev.map(f =>
        f.cutId === frame.cutId ? { ...f, imageUrl, status: imageUrl ? 'done' : 'error' } : f
      ));
      // Save to cut record if it's a real DB cut (numeric id)
      if (imageUrl && typeof frame.cutId === 'number') {
        fetch(`/api/cuts/${frame.cutId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        }).catch(() => {});
      }
    } catch {
      setGeneratedFrames(prev => prev.map(f =>
        f.cutId === frame.cutId ? { ...f, status: 'error' } : f
      ));
    }
    setGeneratingCutId(null);
  };

  // Per-cut batch: generate all cuts in scene
  const generateBatch = async () => {
    if (sceneCuts.length === 0) return;
    setGenerating(true);
    const total = Math.min(sceneCuts.length, 10);
    setProgress({ current: 0, total });

    for (let i = 0; i < total; i++) {
      const cut = sceneCuts[i];
      const frame = framesRef.current.find(f => f.cutId === cut.id);
      if (frame?.status === 'done' && frame?.imageUrl) {
        setProgress(p => ({ ...p, current: i + 1 }));
        continue;
      }
      try {
        const imageUrl = await executeStoryboard(cut.description || cut.script_text || `Cut ${cut.cut_number}`);
        setGeneratedFrames(prev => prev.map(f =>
          f.cutId === cut.id ? { ...f, imageUrl, status: imageUrl ? 'done' : 'error' } : f
        ));
        if (imageUrl) {
          fetch(`/api/cuts/${cut.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          }).catch(() => {});
        }
      } catch {
        setGeneratedFrames(prev => prev.map(f =>
          f.cutId === cut.id ? { ...f, status: 'error' } : f
        ));
      }
      setProgress(p => ({ ...p, current: i + 1 }));
    }
    setGenerating(false);
  };

  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const completedFrames = generatedFrames.filter(f => f.status === 'done').length;

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-dim)', textAlign: 'center' }}>Loading scenes...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-floor)' }}>
      {/* Header */}
      <header style={{
        padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.4)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
            ← Back
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{project?.title}</span>
          <span style={{ fontSize: '0.65rem', color: '#10b981', letterSpacing: '1px' }}>STORYBOARD</span>
          {isYouTubeBatchMode && (
            <span style={{ fontSize: '0.6rem', color: '#f59e0b', letterSpacing: '1px', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
              YT BATCH
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {completedFrames}/{generatedFrames.length} frames
          </span>
        </div>
      </header>

      {/* Controls bar */}
      <div style={{
        padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {isYouTubeBatchMode ? (
          // YouTube Batch Mode controls
          <>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Frames:
              <input
                type="range" min={3} max={12} value={frameCount}
                onChange={e => setFrameCount(Number(e.target.value))}
                disabled={generating}
                style={{ width: '80px', cursor: 'pointer' }}
              />
              <span style={{ minWidth: '16px', fontWeight: 700, color: 'var(--text-main, #eee)' }}>{frameCount}</span>
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={generating}
              style={{
                padding: '6px 10px', fontSize: '0.72rem',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', color: 'var(--text-main, #eee)',
              }}
            >
              {styleOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button
              onClick={generateYouTubeBatch}
              disabled={generating || generatedFrames.length === 0}
              style={{
                padding: '8px 20px', fontSize: '0.72rem', fontWeight: 700,
                background: generating ? 'rgba(255,255,255,0.06)' : '#f59e0b',
                color: generating ? 'var(--text-dim)' : '#000',
                border: 'none', borderRadius: '6px', cursor: generating ? 'wait' : 'pointer',
              }}
            >
              {generating
                ? `⏳ Generating ${progress.current}/${progress.total}...`
                : `⚡ Batch Generate ${frameCount} Frames`}
            </button>
          </>
        ) : (
          // Per-cut Mode controls (Movie / Drama / YouTube with scenes)
          <>
            <select
              value={selectedSceneId || ''}
              onChange={(e) => setSelectedSceneId(Number(e.target.value))}
              style={{
                padding: '6px 10px', fontSize: '0.72rem',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', color: 'var(--text-main, #eee)', minWidth: '250px',
              }}
            >
              {scenes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.display_id || s.slug} — {(s.heading || s.location || '').slice(0, 40)}
                </option>
              ))}
            </select>
            {/* Style selector — 2-phase confirm for non-YouTube */}
            {!isYouTube ? (
              confirmedStyle ? (
                // CONFIRMED phase: show badge + change button + active Generate
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 10px', background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px',
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>
                      🎨 {confirmedStyle.label}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#10b981' }}>✓ 확정됨</span>
                    <button
                      onClick={changeStyle}
                      style={{
                        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px', color: 'var(--text-dim)', fontSize: '0.58rem',
                        padding: '1px 6px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      변경
                    </button>
                  </div>
                  <button
                    onClick={generateBatch}
                    disabled={generating || sceneCuts.length === 0}
                    style={{
                      padding: '8px 20px', fontSize: '0.72rem', fontWeight: 700,
                      background: generating ? 'rgba(255,255,255,0.06)' : '#10b981',
                      color: generating ? 'var(--text-dim)' : '#000',
                      border: 'none', borderRadius: '6px', cursor: generating ? 'wait' : 'pointer',
                    }}
                  >
                    {generating
                      ? `⏳ Generating ${progress.current}/${progress.total}...`
                      : `⚡ Generate All (${Math.min(sceneCuts.length, 10)} cuts)`}
                  </button>
                </>
              ) : (
                // SELECT phase: style picker + confirm button + disabled Generate
                <>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    style={{
                      padding: '6px 10px', fontSize: '0.72rem',
                      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px', color: 'var(--text-main, #eee)',
                    }}
                  >
                    {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    {STYLES.find(s => s.id === style)?.desc}
                  </span>
                  <button
                    onClick={confirmStyle}
                    style={{
                      padding: '6px 14px', fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
                      borderRadius: '6px', color: '#10b981', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ✓ 이 스타일로 확정
                  </button>
                  <button
                    disabled
                    title="스타일을 먼저 확정하세요"
                    style={{
                      padding: '8px 20px', fontSize: '0.72rem', fontWeight: 700,
                      background: 'rgba(255,255,255,0.04)', color: 'var(--text-dim)',
                      border: 'none', borderRadius: '6px', cursor: 'not-allowed', opacity: 0.5,
                    }}
                  >
                    Generate (스타일 미확정)
                  </button>
                </>
              )
            ) : (
              // YouTube per-cut mode: simple style select + generate
              <>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{
                    padding: '6px 10px', fontSize: '0.72rem',
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px', color: 'var(--text-main, #eee)',
                  }}
                >
                  {YOUTUBE_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <span style={{ fontSize: '0.6rem', color: '#f59e0b', letterSpacing: '1px' }}>YT MODE</span>
                <button
                  onClick={generateBatch}
                  disabled={generating || sceneCuts.length === 0}
                  style={{
                    padding: '8px 20px', fontSize: '0.72rem', fontWeight: 700,
                    background: generating ? 'rgba(255,255,255,0.06)' : '#10b981',
                    color: generating ? 'var(--text-dim)' : '#000',
                    border: 'none', borderRadius: '6px', cursor: generating ? 'wait' : 'pointer',
                  }}
                >
                  {generating
                    ? `⏳ Generating ${progress.current}/${progress.total}...`
                    : `⚡ Generate All (${Math.min(sceneCuts.length, 10)} cuts)`}
                </button>
              </>
            )}
            {selectedScene && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {sceneCuts.length} cuts · {selectedScene.location || ''}
              </span>
            )}
          </>
        )}
      </div>

      {/* Gallery */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {generatedFrames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            {isYouTubeBatchMode
              ? 'analysis_data에서 세그먼트를 찾을 수 없습니다. 프레임 수를 조정하거나 프로젝트 데이터를 확인하세요.'
              : '씬을 선택하고 Generate를 눌러 스토리보드를 생성하세요.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {generatedFrames.map((frame, i) => {
              const isThisCutGenerating = generatingCutId === frame.cutId || (generating && frame.status === 'generating');
              return (
                <div
                  key={frame.cutId}
                  style={{
                    borderRadius: '8px', overflow: 'hidden',
                    border: `1px solid ${isThisCutGenerating ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Image area */}
                  <div style={{
                    aspectRatio: isYouTubeBatchMode ? '16/9' : '16/9',
                    background: '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {frame.status === 'done' && frame.imageUrl ? (
                      <img
                        src={frame.imageUrl.startsWith('http') ? frame.imageUrl : frame.imageUrl.startsWith('/public/') ? frame.imageUrl : `/public/${frame.imageUrl}`}
                        alt={frame.cutSlug}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => {
                          setGeneratedFrames(prev =>
                            prev.map(f => f.cutId === frame.cutId ? { ...f, status: 'broken' } : f)
                          );
                        }}
                      />
                    ) : isThisCutGenerating ? (
                      <span style={{ fontSize: '1.2rem' }}>⏳</span>
                    ) : frame.status === 'error' || frame.status === 'broken' ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--status-error)' }}>⚠ 실패</span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>—</span>
                    )}
                  </div>

                  {/* Info + per-cut button */}
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                        {frame.cutSlug || `CUT ${String(i + 1).padStart(3, '0')}`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.5rem', padding: '1px 6px', borderRadius: '3px',
                          background: frame.status === 'done' ? 'rgba(34,197,94,0.1)' : isThisCutGenerating ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                          color: frame.status === 'done' ? 'var(--status-ok)' : isThisCutGenerating ? '#f59e0b' : 'var(--text-dim)',
                        }}>
                          {isThisCutGenerating ? 'generating' : frame.status}
                        </span>
                        {/* Per-cut generate button (only in per-cut mode) */}
                        {!isYouTubeBatchMode && (
                          <button
                            onClick={() => generateSingleCut(frame)}
                            disabled={!!generatingCutId || generating || isThisCutGenerating}
                            title="이 컷만 생성"
                            style={{
                              background: isThisCutGenerating ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.1)',
                              border: `1px solid ${isThisCutGenerating ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.3)'}`,
                              borderRadius: '4px', color: isThisCutGenerating ? '#f59e0b' : '#10b981',
                              fontSize: '0.65rem', padding: '2px 7px', cursor: (!!generatingCutId || generating) ? 'not-allowed' : 'pointer',
                              opacity: (!!generatingCutId || generating) && !isThisCutGenerating ? 0.4 : 1,
                              fontFamily: 'inherit',
                              transition: 'opacity 0.15s',
                            }}
                          >
                            {isThisCutGenerating ? '⏳' : '⚡'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.4,
                      maxHeight: '2.8em', overflow: 'hidden',
                    }}>
                      {frame.description.slice(0, 80)}{frame.description.length > 80 ? '...' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardGallery;
