import React, { useState, useEffect } from 'react';

/**
 * SceneDetailView — Scene 1개의 전체 컷 파이프라인을 시각화.
 *
 * 각 컷은 6단계 노드 파이프라인:
 *   Script → Image Prompt → Image Gen → Video Prompt → Video Gen → Audio → Done
 *
 * 비트세이비어 S#1: 45컷, 설희+은서, 싱가포르 국제학교
 */

const CUT_STATUSES = ['pending', 'script', 'image_prompt', 'image_gen', 'video', 'audio', 'done'];
const STATUS_CONFIG = {
  pending:      { label: 'Pending',       icon: '⬜', color: '#6b7280', progress: 0 },
  script:       { label: 'Script',        icon: '📝', color: '#3b82f6', progress: 16 },
  image_prompt: { label: 'Img Prompt',    icon: '✏️', color: 'var(--gold)', progress: 33 },
  image_gen:    { label: 'Image Gen',     icon: '🖼️', color: '#a855f7', progress: 50 },
  video:        { label: 'Video Gen',     icon: '🎬', color: 'var(--gold)', progress: 66 },
  audio:        { label: 'Audio',         icon: '🔊', color: '#10b981', progress: 83 },
  done:         { label: 'Done',          icon: '✅', color: 'var(--status-ok)', progress: 100 },
};

function CutCard({ cut, isSelected, onClick }) {
  const s = STATUS_CONFIG[cut.status] || STATUS_CONFIG.pending;
  const isDialogue = cut.type === 'dialogue';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 10px',
        background: isSelected ? 'rgba(200,168,85,0.1)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'var(--gold-dim)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: '3px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {cut.displayId}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.55rem', color: isDialogue ? '#60a5fa' : '#9ca3af', padding: '1px 4px', background: isDialogue ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
            {isDialogue ? '💬' : '🎬'} {cut.type}
          </span>
          <span style={{ fontSize: '0.6rem' }}>{s.icon}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-primary)', lineHeight: '1.4', maxHeight: '2.8em', overflow: 'hidden' }}>
        {cut.description}
      </div>
      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', marginTop: '6px' }}>
        <div style={{ height: '100%', width: `${s.progress}%`, background: s.color, borderRadius: '1px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function CutNodePipeline({ cut, onUpdate }) {
  if (!cut) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
      ← 컷을 선택하면 노드 파이프라인이 표시됩니다
    </div>
  );

  const nodes = [
    { key: 'script',       label: 'Script',        field: 'scriptText',   placeholder: '컷 스크립트 (대사/액션)' },
    { key: 'image_prompt', label: 'Image Prompt',   field: 'imagePrompt',  placeholder: '포토리얼리스틱 이미지 생성 프롬프트' },
    { key: 'image_gen',    label: 'Image',          field: 'imageUrl',     placeholder: '이미지 URL', isMedia: true },
    { key: 'video',        label: 'Video Prompt',   field: 'videoPrompt',  placeholder: '카메라 무빙, 비디오 생성 프롬프트' },
    { key: 'video_gen',    label: 'Video',          field: 'videoUrl',     placeholder: '비디오 URL', isMedia: true },
    { key: 'audio',        label: 'Audio',          field: 'audioUrl',     placeholder: '오디오 URL', isMedia: true },
  ];

  const handleFieldUpdate = async (field, value) => {
    try {
      await fetch(`/api/cuts/${cut.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      onUpdate?.();
    } catch (e) {
      console.error('Cut update failed:', e);
    }
  };

  const handleStatusAdvance = async (nextStatus) => {
    await fetch(`/api/cuts/${cut.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    onUpdate?.();
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
      {/* Cut header */}
      <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(200,168,85,0.06)', border: '1px solid var(--gold-subtle)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--gold)' }}>{cut.displayId}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{cut.type} · {cut.duration}s</span>
          </div>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: `${STATUS_CONFIG[cut.status]?.color}20`, color: STATUS_CONFIG[cut.status]?.color, border: `1px solid ${STATUS_CONFIG[cut.status]?.color}40` }}>
            {STATUS_CONFIG[cut.status]?.icon} {STATUS_CONFIG[cut.status]?.label}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.5' }}>
          {cut.description}
        </div>
      </div>

      {/* Node pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {nodes.map((node, i) => {
          const value = cut[node.field] || '';
          const statusIdx = CUT_STATUSES.indexOf(cut.status);
          const nodeIdx = CUT_STATUSES.indexOf(node.key);
          const isActive = statusIdx >= nodeIdx || statusIdx === -1;
          const isCurrent = cut.status === node.key;

          return (
            <div key={node.key} style={{ opacity: isActive ? 1 : 0.4 }}>
              {/* Connection arrow */}
              {i > 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(200,168,85,0.3)', fontSize: '0.7rem', margin: '2px 0' }}>↓</div>
              )}
              <div style={{
                padding: '10px 12px',
                background: isCurrent ? 'rgba(200,168,85,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCurrent ? 'rgba(200,168,85,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '6px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isCurrent ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    {node.label.toUpperCase()}
                  </span>
                  {isCurrent && (
                    <button
                      onClick={() => handleStatusAdvance(CUT_STATUSES[statusIdx + 1])}
                      style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'var(--gold-subtle)', border: '1px solid var(--gold-dim)', borderRadius: '4px', color: 'var(--gold)', cursor: 'pointer' }}
                    >
                      ▶ Next
                    </button>
                  )}
                </div>
                {node.isMedia ? (
                  value ? (
                    <div style={{ borderRadius: '6px', overflow: 'hidden', background: '#111', maxWidth: '480px' }}>
                      {node.field.includes('image') ? (
                        <img src={value} alt={node.label} style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }} />
                      ) : node.field.includes('video') ? (
                        <video src={value} controls style={{ width: '100%', maxHeight: '240px', background: '#000' }} />
                      ) : (
                        <audio src={value} controls style={{ width: '100%' }} />
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                      {node.placeholder}
                    </div>
                  )
                ) : (
                  <textarea
                    value={value}
                    onChange={(e) => handleFieldUpdate(node.field, e.target.value)}
                    placeholder={node.placeholder}
                    style={{
                      width: '100%', minHeight: '60px', resize: 'vertical',
                      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px', padding: '8px', fontSize: '0.72rem',
                      color: 'var(--text-primary)', fontFamily: 'inherit', lineHeight: '1.5',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SceneDetailView = ({ project, sceneId, onBack }) => {
  const [scene, setScene] = useState(null);
  const [selectedCutId, setSelectedCutId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchScene = async () => {
    try {
      const res = await fetch(`/api/scenes/${sceneId}`);
      const data = await res.json();
      setScene(data);
      if (!selectedCutId && data?.cuts?.length > 0) {
        setSelectedCutId(data.cuts[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch scene:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScene(); }, [sceneId]);

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading scene...</div>;
  if (!scene) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Scene not found</div>;

  const selectedCut = scene.cuts?.find(c => c.id === selectedCutId);
  const completedCuts = scene.cuts?.filter(c => c.status === 'done').length || 0;
  const totalCuts = scene.cuts?.length || 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-floor)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.3)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>← Back</button>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{scene.heading}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {scene.characters?.join(', ')} · {totalCuts} cuts · Act {scene.act}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {completedCuts}/{totalCuts} done
          </div>
          <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${totalCuts > 0 ? (completedCuts / totalCuts * 100) : 0}%`, background: 'var(--status-ok)', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      {/* Main split: Cut list (left) + Node editor (right) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Cut list */}
        <div style={{ width: '320px', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '8px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', padding: '4px 6px', marginBottom: '4px' }}>
            CUTS ({totalCuts})
          </div>
          {scene.cuts?.map(cut => (
            <CutCard
              key={cut.id}
              cut={cut}
              isSelected={cut.id === selectedCutId}
              onClick={() => setSelectedCutId(cut.id)}
            />
          ))}
        </div>

        {/* Right: Node pipeline editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CutNodePipeline cut={selectedCut} onUpdate={fetchScene} />
        </div>
      </div>
    </div>
  );
};

export default SceneDetailView;
