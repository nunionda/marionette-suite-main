import React, { useState, useEffect } from 'react';
import { calculateGateReadiness, generateDispatchXML } from '../utils/gsExporter';

/**
 * GS Stage Gate G1~G5 — Disney 6-Stage Pipeline checklist.
 *
 * G1: Creative Development (시나리오 완성)
 * G2: Pre-Production (프로덕션 디자인 + 프리비즈)
 * G3: Production (영상 생성)
 * G4: Post-Production (편집 + 색보정 + VFX)
 * G5: Distribution (배포 + 마케팅)
 */

const GATE_DEFINITIONS = {
  G2: {
    label: 'Pre-Production',
    items: [
      { id: 'script_analysis', label: 'Script Analysis', nodeId: 'script_analysis' },
      { id: 'production_breakdown', label: 'Production Breakdown', nodeId: 'production_breakdown' },
      { id: 'character_design', label: 'Character Design', nodeId: 'character_design' },
      { id: 'set_design', label: 'Set Design', nodeId: 'set_design' },
      { id: 'costume_design', label: 'Costume Design', nodeId: 'costume_design' },
      { id: 'storyboard', label: 'Storyboard', nodeId: 'storyboard' },
      { id: 'shot_list', label: 'Shot List', nodeId: 'shot_list' },
      { id: 'art_bible', label: 'Art Bible', nodeId: 'art_bible' },
    ],
  },
  G3: {
    label: 'Production',
    items: [
      { id: 'image_prompt', label: 'Image Prompts', nodeId: 'image_prompt' },
      { id: 'image_gen', label: 'Image Generation', nodeId: 'image_gen' },
      { id: 'video_prompt', label: 'Video Prompts', nodeId: 'video_prompt' },
      { id: 'video_gen', label: 'Video Generation', nodeId: 'video_gen' },
      { id: 'audio_gen', label: 'Audio / TTS', nodeId: 'audio_gen' },
    ],
  },
  G4: {
    label: 'Post-Production',
    items: [
      { id: 'final_cut', label: 'Final Cut Assembly', nodeId: 'final_cut' },
      { id: 'color_grade', label: 'Color Grading', status: 'planned' },
      { id: 'vfx', label: 'VFX Compositing', status: 'planned' },
      { id: 'sound_mix', label: 'Sound Mixing', status: 'planned' },
    ],
  },
  G5: {
    label: 'Distribution',
    items: [
      { id: 'master_export', label: 'Master Export', status: 'planned' },
      { id: 'trailer', label: 'Trailer Cut', status: 'planned' },
      { id: 'poster', label: 'Key Art / Poster', status: 'planned' },
      { id: 'marketing', label: 'Marketing Package', status: 'planned' },
    ],
  },
};

const StageGateChecklist = ({ project, pipelineData, category }) => {
  const [showXML, setShowXML] = useState(false);
  const [activeGate, setActiveGate] = useState('G1');
  const [pipelineStatus, setPipelineStatus] = useState({});
  const readiness = calculateGateReadiness(project, pipelineData, category);

  // Fetch pipeline node status for G2~G5
  useEffect(() => {
    if (project?.id) {
      fetch(`/api/projects/${project.id}/pipeline`)
        .then(r => r.json())
        .then(d => { if (d.success) setPipelineStatus(d.nodes || {}); })
        .catch(() => {});
    }
  }, [project?.id]);

  if (readiness.total === 0) return null;

  const statusIcon = (status) => {
    if (status === 'complete') return '✅';
    if (status === 'planned') return '📋';
    return '⬜';
  };

  const statusLabel = (status) => {
    if (status === 'complete') return 'COMPLETE';
    if (status === 'planned') return 'PLANNED';
    return 'NOT STARTED';
  };

  const xml = showXML ? generateDispatchXML(project, pipelineData, category) : '';

  // Compute G2~G5 readiness from pipeline status
  const computeGateReadiness = (gateKey) => {
    const def = GATE_DEFINITIONS[gateKey];
    if (!def) return null;
    const items = def.items.map(item => {
      const nodeStatus = pipelineStatus[item.nodeId]?.status;
      return {
        ...item,
        status: item.status || (nodeStatus === 'done' ? 'complete' : nodeStatus === 'generating' ? 'in_progress' : 'not_started'),
      };
    });
    const completed = items.filter(i => i.status === 'complete').length;
    return { gate: gateKey, label: def.label, items, completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const gates = ['G1', 'G2', 'G3', 'G4', 'G5'];
  const activeReadiness = activeGate === 'G1' ? readiness : computeGateReadiness(activeGate);

  return (
    <section className="sidebar-section">
      {/* Gate tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
        {gates.map(g => {
          const r = g === 'G1' ? readiness : computeGateReadiness(g);
          const pct = r?.percent || 0;
          return (
            <button key={g} onClick={() => setActiveGate(g)} style={{
              flex: 1, padding: '4px 0', fontSize: '0.55rem', fontWeight: activeGate === g ? 700 : 500,
              background: activeGate === g ? 'rgba(139,92,246,0.15)' : 'transparent',
              border: `1px solid ${activeGate === g ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '3px', cursor: 'pointer',
              color: pct === 100 ? '#22c55e' : activeGate === g ? '#a78bfa' : 'var(--text-muted, #888)',
            }}>
              {g} {pct === 100 ? '✓' : pct > 0 ? `${pct}%` : ''}
            </button>
          );
        })}
      </div>

      <h4 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>GS Stage Gate {activeReadiness?.gate || activeGate}</span>
        <span style={{
          fontSize: '0.65rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: (activeReadiness?.percent || 0) === 100 ? 'rgba(74,222,128,0.2)' : 'rgba(251,146,60,0.2)',
          color: (activeReadiness?.percent || 0) === 100 ? '#4ade80' : '#fb923c',
          border: `1px solid ${(activeReadiness?.percent || 0) === 100 ? 'rgba(74,222,128,0.4)' : 'rgba(251,146,60,0.4)'}`,
        }}>
          {(activeReadiness?.percent || 0) === 100 ? 'READY' : `${activeReadiness?.percent || 0}%`}
        </span>
      </h4>

      {/* Progress bar */}
      <div style={{
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        marginBottom: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${activeReadiness?.percent || 0}%`,
          background: (activeReadiness?.percent || 0) === 100
            ? 'linear-gradient(90deg, #4ade80, #22c55e)'
            : 'linear-gradient(90deg, #fb923c, #f97316)',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Deliverable list */}
      <div style={{ fontSize: '0.7rem', lineHeight: '1.8' }}>
        {(activeReadiness?.items || []).map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: item.status === 'planned' ? 0.5 : 1,
          }}>
            <span>
              {statusIcon(item.status)} {item.label}
            </span>
            <span style={{
              fontSize: '0.6rem',
              color: item.status === 'complete' ? '#4ade80' : 'var(--text-muted)',
            }}>
              {statusLabel(item.status)}
            </span>
          </div>
        ))}
      </div>

      {/* Agent info */}
      <div style={{
        marginTop: '10px',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '8px',
      }}>
        {activeReadiness?.completed || 0}/{activeReadiness?.total || 0} deliverables · {activeGate === 'G1' ? 'CINE' : activeGate === 'G2' ? 'ART_DEPT' : 'PIPELINE'} Agent
      </div>

      {/* Export button */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
        <button
          className="btn-secondary"
          onClick={() => setShowXML(!showXML)}
          style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px' }}
        >
          {showXML ? '✕ Close' : '📤 GS Dispatch XML'}
        </button>
      </div>

      {showXML && (
        <pre style={{
          marginTop: '8px',
          padding: '10px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          fontSize: '0.6rem',
          color: '#a5b4fc',
          overflow: 'auto',
          maxHeight: '200px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {xml}
        </pre>
      )}
    </section>
  );
};

export default StageGateChecklist;
