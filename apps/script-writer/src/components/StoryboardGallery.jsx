import React, { useState, useEffect } from 'react';

/**
 * StoryboardGallery — Scene-based storyboard frame generation and gallery.
 *
 * Features:
 *   - Scene selector (dropdown or grid of scenes)
 *   - Style selector (10 Masters)
 *   - Batch generate frames for selected scene's cuts
 *   - Gallery view of generated frames with cut info
 *   - Navigate between scenes
 */

const STYLES = [
  { id: 'bong', label: 'Bong Joon-ho' },
  { id: 'kubrick', label: 'Stanley Kubrick' },
  { id: 'miyazaki', label: 'Hayao Miyazaki' },
  { id: 'ridley', label: 'Ridley Scott' },
  { id: 'kurosawa', label: 'Akira Kurosawa' },
  { id: 'wes', label: 'Wes Anderson' },
  { id: 'denis', label: 'Denis Villeneuve' },
  { id: 'wong', label: 'Wong Kar-wai' },
  { id: 'nolan', label: 'Christopher Nolan' },
  { id: 'tarantino', label: 'Quentin Tarantino' },
];

const StoryboardGallery = ({ projectId, project, onBack }) => {
  const [scenes, setScenes] = useState([]);
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [sceneCuts, setSceneCuts] = useState([]);
  const [style, setStyle] = useState('bong');
  const [generating, setGenerating] = useState(false);
  const [generatedFrames, setGeneratedFrames] = useState([]); // { cutId, cutSlug, description, imageUrl, status }
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(true);

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

  // Load cuts when scene changes
  useEffect(() => {
    if (!selectedSceneId) return;
    fetch(`/api/scenes/${selectedSceneId}`)
      .then(r => r.json())
      .then(d => {
        const cuts = d.cuts || [];
        setSceneCuts(cuts);
        // Load existing storyboard frames from pipeline assets
        loadExistingFrames(cuts);
      })
      .catch(() => setSceneCuts([]));
  }, [selectedSceneId]);

  const loadExistingFrames = async (cuts) => {
    // Check if any cuts already have storyboard images
    const frames = cuts.map(c => ({
      cutId: c.id,
      cutSlug: c.slug || c.display_id,
      description: c.description || c.script_text || '',
      imageUrl: c.image_url || c.imageUrl || null,
      status: c.image_url || c.imageUrl ? 'done' : 'pending',
    }));
    setGeneratedFrames(frames);
  };

  const generateBatch = async () => {
    if (sceneCuts.length === 0) return;
    setGenerating(true);
    const total = Math.min(sceneCuts.length, 10); // Limit to 10 per batch to avoid overload
    setProgress({ current: 0, total });

    const newFrames = [...generatedFrames];

    for (let i = 0; i < total; i++) {
      const cut = sceneCuts[i];
      const frameIdx = newFrames.findIndex(f => f.cutId === cut.id);
      if (frameIdx >= 0 && newFrames[frameIdx].status === 'done' && newFrames[frameIdx].imageUrl) {
        setProgress(p => ({ ...p, current: i + 1 }));
        continue; // Skip already generated (skip broken/null so they get retried)
      }

      try {
        // Call storyboard API via pipeline execute
        const res = await fetch(`/api/projects/${projectId}/pipeline/storyboard/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phase: 'previz',
            track: 'design',
            style,
            description: cut.description || cut.script_text || `Scene cut ${cut.cut_number}`,
            scene: cut.description || cut.script_text || '',
            project: project?.title || 'Untitled',
          }),
        });
        const data = await res.json();
        const imageUrl = data.result?.imageUrl || data.result?.image_url || data.result?.url || null;

        if (frameIdx >= 0) {
          newFrames[frameIdx] = { ...newFrames[frameIdx], imageUrl, status: imageUrl ? 'done' : 'error' };
        }

        // Also save to cut's image_url
        if (imageUrl && cut.id) {
          await fetch(`/api/cuts/${cut.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          }).catch(() => {});
        }
      } catch (e) {
        if (frameIdx >= 0) {
          newFrames[frameIdx] = { ...newFrames[frameIdx], status: 'error' };
        }
      }

      setProgress(p => ({ ...p, current: i + 1 }));
      setGeneratedFrames([...newFrames]);
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
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
      }}>
        {/* Scene selector */}
        <select
          value={selectedSceneId || ''}
          onChange={(e) => setSelectedSceneId(Number(e.target.value))}
          style={{
            padding: '6px 10px', fontSize: '0.72rem',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px', color: 'var(--text-main, #eee)',
            minWidth: '250px',
          }}
        >
          {scenes.map(s => (
            <option key={s.id} value={s.id}>
              {s.display_id || s.slug} — {(s.heading || s.location || '').slice(0, 40)}
            </option>
          ))}
        </select>

        {/* Style selector */}
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          style={{
            padding: '6px 10px', fontSize: '0.72rem',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px', color: 'var(--text-main, #eee)',
          }}
        >
          {STYLES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {/* Generate button */}
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
            : `⚡ Generate Storyboard (${Math.min(sceneCuts.length, 10)} cuts)`}
        </button>

        {/* Scene info */}
        {selectedScene && (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
            {sceneCuts.length} cuts · {selectedScene.location || ''}
          </span>
        )}
      </div>

      {/* Gallery */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {generatedFrames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            씬을 선택하고 Generate를 눌러 스토리보드를 생성하세요.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {generatedFrames.map((frame, i) => (
              <div
                key={frame.cutId}
                style={{
                  borderRadius: '8px', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Image area */}
                <div style={{
                  aspectRatio: '16/9', background: '#111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {frame.status === 'done' && frame.imageUrl ? (
                    <img
                      src={frame.imageUrl.startsWith('http') ? frame.imageUrl : `/public/${frame.imageUrl}`}
                      alt={frame.cutSlug}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => {
                        setGeneratedFrames(prev =>
                          prev.map(f => f.cutId === frame.cutId ? { ...f, status: 'broken' } : f)
                        );
                      }}
                    />
                  ) : frame.status === 'error' || frame.status === 'broken' ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--status-error)' }}>⚠ 이미지 로드 실패</span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {generating ? '⏳' : '—'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                      CUT {String(i + 1).padStart(3, '0')}
                    </span>
                    <span style={{
                      fontSize: '0.5rem', padding: '1px 6px', borderRadius: '3px',
                      background: frame.status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                      color: frame.status === 'done' ? 'var(--status-ok)' : 'var(--text-dim)',
                    }}>
                      {frame.status}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.4,
                    maxHeight: '2.8em', overflow: 'hidden',
                  }}>
                    {frame.description.slice(0, 80)}{frame.description.length > 80 ? '...' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardGallery;
