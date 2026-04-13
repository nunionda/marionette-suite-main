import React, { useMemo } from 'react';
import { parseScreenplayToScenes } from '../utils/sceneCutParser';

/**
 * Scene Breakdown Panel — parses screenplay text and displays
 * structured scene/cut hierarchy with stats.
 *
 * Replaces the simple SCENE INVENTORY with a real breakdown
 * that matches studio's SceneMeta/CutMeta structure.
 */
const STUDIO_URL = 'http://localhost:3001';

const SceneBreakdownPanel = ({ screenplayText, projectTitle, projectId, onSceneClick }) => {
  const breakdown = useMemo(() => {
    if (!screenplayText || screenplayText.length < 50) return null;
    try {
      return parseScreenplayToScenes(screenplayText, { projectTitle });
    } catch {
      return null;
    }
  }, [screenplayText, projectTitle]);

  if (!breakdown || breakdown.scenes.length === 0) {
    return (
      <div style={{ padding: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        SCREENPLAY 탭에서 시나리오를 생성하면<br />씬/컷 분해가 자동으로 표시됩니다.
      </div>
    );
  }

  const { scenes, stats } = breakdown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
      }}>
        <div>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{stats.totalScenes}</span> Scenes
        </div>
        <div>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{stats.totalCuts}</span> Cuts
        </div>
        <div>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{stats.totalCharacters}</span> Characters
        </div>
        <div>
          ~<span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{stats.estimatedMinutes}</span> min
        </div>
      </div>

      {/* Act breakdown bar */}
      <div style={{
        padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: '2px',
        height: '20px',
      }}>
        {[
          { label: 'ACT 1', count: stats.actBreakdown.act1, color: '#3b82f6' },
          { label: 'ACT 2', count: stats.actBreakdown.act2, color: 'var(--gold)' },
          { label: 'ACT 3', count: stats.actBreakdown.act3, color: 'var(--status-error)' },
        ].map(act => (
          <div
            key={act.label}
            style={{
              flex: act.count,
              background: `${act.color}30`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              color: act.color,
              fontWeight: 600,
              minWidth: act.count > 0 ? '30px' : '0',
            }}
          >
            {act.count > 0 && `${act.label} (${act.count})`}
          </div>
        ))}
      </div>

      {/* Scene list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {scenes.map(scene => (
          <div
            key={scene.slug}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onClick={() => {
              if (projectId) {
                window.open(`${STUDIO_URL}/projects/${projectId}/scenes/${scene.slug}`, '_blank');
              } else {
                onSceneClick?.(scene);
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {/* Scene header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {scene.displayId}
              </span>
              <span style={{
                fontSize: '0.55rem',
                padding: '1px 6px',
                borderRadius: '3px',
                background: 'rgba(139,92,246,0.15)',
                color: 'var(--gold)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}>
                {scene.cutCount} cuts
              </span>
            </div>

            {/* Location + time */}
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
              {scene.setting && <span style={{ color: scene.setting === 'INT.' ? '#60a5fa' : '#34d399', marginRight: '4px' }}>{scene.setting}</span>}
              {scene.location}
              {scene.timeOfDay && <span style={{ marginLeft: '4px', opacity: 0.6 }}>— {scene.timeOfDay}</span>}
            </div>

            {/* Characters */}
            {scene.characters.length > 0 && (
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '4px' }}>
                {scene.characters.slice(0, 4).map(char => (
                  <span key={char} style={{
                    fontSize: '0.5rem',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                  }}>
                    {char}
                  </span>
                ))}
                {scene.characters.length > 4 && (
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>
                    +{scene.characters.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Cut breakdown (collapsed) */}
            <div style={{ marginTop: '4px', display: 'flex', gap: '2px' }}>
              {scene.cuts.map(cut => (
                <div
                  key={cut.slug}
                  title={cut.description}
                  style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '1px',
                    background: 'rgba(139,92,246,0.3)',
                    maxWidth: '30px',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneBreakdownPanel;
