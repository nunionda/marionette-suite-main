import React, { useMemo, useState, useEffect } from 'react';
import {
  PRODUCTION_DESIGN_NODES,
  VIDEO_GENERATION_NODES,
  TRACK_HANDOFFS,
  DESIGN_PHASES,
  VIDEO_PHASES,
  ACTIVE_NODES_BY_CATEGORY,
} from '../config/productionPipeline';
import { checkHealth } from '../utils/storyboardApi';

/**
 * PipelineView — Dual-track production pipeline visualization.
 *
 *   Track A: Production Design (기획/프리프로덕션)
 *   Track B: Video Generation (영상 생성)
 *
 * Shows node status, phase grouping, and handoff connections.
 */

// ─── Node status from pipeline data ───

function computeNodeStatus(nodeId, pipelineData, project) {
  const statusMap = {
    // Track A: Production Design
    script_analysis:      () => !!(pipelineData.scenario || pipelineData.treatment),
    production_breakdown: () => !!(pipelineData.treatment),
    visual_world:         () => !!(project.analysisData?.artDirection || pipelineData.treatment),
    character_design:     () => !!(project.analysisData?.characterSheets),
    character_arc:        () => !!(pipelineData.architecture),
    set_design:           () => !!(project.analysisData?.setDesign),
    set_dressing:         () => !!(project.analysisData?.setDressing),
    costume_design:       () => !!(project.analysisData?.costumeDesign),
    props:                () => !!(project.analysisData?.propList),
    storyboard:           () => !!(pipelineData.visuals_metadata && Object.keys(pipelineData.visuals_metadata || {}).length > 0),
    shot_list:            () => !!(project.analysisData?.shotList),
    art_bible:            () => !!(project.analysisData?.artBible),

    // Track B: Video Generation (per-project, not per-cut)
    script_node:   () => !!(pipelineData.scenario),
    image_prompt:  () => !!(pipelineData.visuals_metadata),
    image_gen:     () => !!(pipelineData.storyboardImages && Object.keys(pipelineData.storyboardImages || {}).length > 0),
    image_pick:    () => !!(pipelineData.storyboardImages),
    video_prompt:  () => false, // studio에서 처리
    video_gen:     () => false,
    audio_gen:     () => false,
    final_cut:     () => false,
  };

  const checker = statusMap[nodeId];
  if (!checker) return 'empty';
  try {
    return checker() ? 'complete' : 'empty';
  } catch {
    return 'empty';
  }
}

// ─── Components ───

function PhaseHeader({ phase }) {
  return (
    <div style={{
      padding: '4px 10px',
      fontSize: '0.6rem',
      fontWeight: 700,
      color: phase.color,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      borderBottom: `2px solid ${phase.color}30`,
      marginBottom: '6px',
    }}>
      {phase.icon} {phase.labelKo}
    </div>
  );
}

function PipelineNode({ node, status, isActive, onClick }) {
  const statusConfig = {
    complete: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)', icon: '✅', color: '#4ade80' },
    in_progress: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', icon: '🔄', color: '#fbbf24' },
    empty: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', icon: '⬜', color: 'var(--text-muted)' },
  };
  const s = statusConfig[status] || statusConfig.empty;

  return (
    <div
      onClick={isActive ? onClick : undefined}
      style={{
        padding: '10px 12px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '8px',
        cursor: isActive ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0.35,
        transition: 'all 0.2s',
        marginBottom: '4px',
      }}
      onMouseEnter={(e) => { if (isActive) e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {node.labelKo}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {node.label}
          </div>
        </div>
        <span style={{ fontSize: '0.7rem' }}>{s.icon}</span>
      </div>
      {node.sub && (
        <div style={{ fontSize: '0.55rem', color: s.color, marginTop: '4px', fontFamily: 'monospace' }}>
          {node.agent}.{node.sub}
        </div>
      )}
    </div>
  );
}

function HandoffArrow({ handoff }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      fontSize: '0.55rem',
      color: '#a78bfa',
    }}>
      <span style={{ color: '#8b5cf6' }}>⤳</span>
      <span>{handoff.description}</span>
    </div>
  );
}

// ─── Main Component ───

const PipelineView = ({ project, pipelineData, category, onNodeClick }) => {
  const [activeTrack, setActiveTrack] = useState('both');
  const [storyboardServerOnline, setStoryboardServerOnline] = useState(false);

  useEffect(() => {
    checkHealth().then(setStoryboardServerOnline);
  }, []);

  const activeConfig = ACTIVE_NODES_BY_CATEGORY[category] || ACTIVE_NODES_BY_CATEGORY['Feature Film'];
  const activeDesignIds = new Set(activeConfig.design);
  const activeVideoIds = new Set(activeConfig.video);

  const designStats = useMemo(() => {
    const active = PRODUCTION_DESIGN_NODES.filter(n => activeDesignIds.has(n.id));
    const complete = active.filter(n => computeNodeStatus(n.id, pipelineData, project) === 'complete');
    return { total: active.length, complete: complete.length };
  }, [pipelineData, project, category]);

  const videoStats = useMemo(() => {
    const active = VIDEO_GENERATION_NODES.filter(n => activeVideoIds.has(n.id));
    const complete = active.filter(n => computeNodeStatus(n.id, pipelineData, project) === 'complete');
    return { total: active.length, complete: complete.length };
  }, [pipelineData, project, category]);

  const showDesign = activeTrack === 'both' || activeTrack === 'design';
  const showVideo = activeTrack === 'both' || activeTrack === 'video';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Track selector */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {[
          { id: 'both', label: 'ALL TRACKS' },
          { id: 'design', label: `DESIGN (${designStats.complete}/${designStats.total})` },
          { id: 'video', label: `VIDEO (${videoStats.complete}/${videoStats.total})` },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setActiveTrack(opt.id)}
            className={`btn-secondary ${activeTrack === opt.id ? 'active' : ''}`}
            style={{ flex: 1, fontSize: '0.6rem', padding: '5px 8px' }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Pipeline content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: showDesign && showVideo ? 'grid' : 'block',
        gridTemplateColumns: showDesign && showVideo ? '1fr 1fr' : '1fr',
        gap: '16px',
      }}>
        {/* Track A: Production Design */}
        {showDesign && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#8b5cf6',
              letterSpacing: '2px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>🎨 PRODUCTION DESIGN</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                {designStats.complete}/{designStats.total}
              </span>
            </div>

            {DESIGN_PHASES.map(phase => {
              const nodesInPhase = PRODUCTION_DESIGN_NODES.filter(n => n.phase === phase.id);
              const hasActive = nodesInPhase.some(n => activeDesignIds.has(n.id));
              if (!hasActive) return null;

              return (
                <div key={phase.id} style={{ marginBottom: '12px' }}>
                  <PhaseHeader phase={phase} />
                  {nodesInPhase.map(node => (
                    <PipelineNode
                      key={node.id}
                      node={node}
                      status={computeNodeStatus(node.id, pipelineData, project)}
                      isActive={activeDesignIds.has(node.id)}
                      onClick={() => onNodeClick?.('design', node)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Track B: Video Generation */}
        {showVideo && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#f59e0b',
              letterSpacing: '2px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>🎬 VIDEO GENERATION</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                {videoStats.complete}/{videoStats.total}
              </span>
            </div>

            {VIDEO_PHASES.map(phase => {
              const nodesInPhase = VIDEO_GENERATION_NODES.filter(n => n.phase === phase.id);
              const hasActive = nodesInPhase.some(n => activeVideoIds.has(n.id));
              if (!hasActive) return null;

              return (
                <div key={phase.id} style={{ marginBottom: '12px' }}>
                  <PhaseHeader phase={phase} />
                  {nodesInPhase.map(node => (
                    <PipelineNode
                      key={node.id}
                      node={node}
                      status={computeNodeStatus(node.id, pipelineData, project)}
                      isActive={activeVideoIds.has(node.id)}
                      onClick={() => onNodeClick?.('video', node)}
                    />
                  ))}
                </div>
              );
            })}

            {/* Handoff connections */}
            {showDesign && (
              <div style={{
                marginTop: '16px',
                padding: '10px',
                background: 'rgba(139,92,246,0.05)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#a78bfa', marginBottom: '6px', letterSpacing: '1px' }}>
                  HANDOFF POINTS (Design → Video)
                </div>
                {TRACK_HANDOFFS.map(h => (
                  <HandoffArrow key={h.from + h.to} handoff={h} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom stats bar */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        flexShrink: 0,
      }}>
        <span>
          Total: {designStats.complete + videoStats.complete}/{designStats.total + videoStats.total} nodes
        </span>
        <span style={{
          padding: '2px 6px',
          borderRadius: '3px',
          background: storyboardServerOnline ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
          color: storyboardServerOnline ? '#4ade80' : '#ef4444',
          border: `1px solid ${storyboardServerOnline ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {storyboardServerOnline ? '● Storyboard Engine Online' : '○ Storyboard Engine Offline'}
        </span>
        <span>
          {Math.round(((designStats.complete + videoStats.complete) / (designStats.total + videoStats.total || 1)) * 100)}% complete
        </span>
      </div>
    </div>
  );
};

export default PipelineView;
