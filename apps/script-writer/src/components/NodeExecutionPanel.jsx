import React, { useState, useEffect } from 'react';
import { PRODUCTION_DESIGN_NODES, VIDEO_GENERATION_NODES } from '../config/productionPipeline';

/**
 * NodeExecutionPanel — slide-in panel for pipeline node execution.
 *
 * Shows when a node is clicked in PipelineView:
 *   - Node info (label, description, agent, phase)
 *   - Style selector (10 Masters for design nodes)
 *   - Description/prompt input
 *   - Execute button
 *   - Result display (images, text, status)
 */

// Fallback styles if server is offline
const FALLBACK_STYLES = [
  { id: 'bong', label: 'Bong Joon-ho', desc: '사회적 풍자, 극단적 대비' },
  { id: 'kurosawa', label: 'Akira Kurosawa', desc: '동적 구도, 자연광' },
  { id: 'miyazaki', label: 'Hayao Miyazaki', desc: '자연주의, 색채 풍부' },
  { id: 'ridley_scott', label: 'Ridley Scott', desc: '스케일감, 디테일 질감' },
  { id: 'anderson_wes', label: 'Wes Anderson', desc: '대칭, 파스텔, 미니어처' },
];

const STORYBOARD_API = 'http://localhost:3007';

const NodeExecutionPanel = ({ node, track, projectId, project, onClose }) => {
  const [style, setStyle] = useState('bong');
  const [availableStyles, setAvailableStyles] = useState(FALLBACK_STYLES);

  // Fetch real styles from storyboard server
  useEffect(() => {
    fetch(`${STORYBOARD_API}/api/styles`)
      .then(r => r.json())
      .then(d => {
        if (d.artists && d.artists.length > 0) {
          setAvailableStyles(d.artists.map(a => ({
            id: a.key,
            label: a.name,
            desc: `${a.medium} · ${a.color_mode}`,
          })));
        }
      })
      .catch(() => {}); // Keep fallback
  }, []);
  const [description, setDescription] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load existing result on mount
  useEffect(() => {
    if (!node || !projectId) return;
    fetch(`/api/projects/${projectId}/pipeline/${node.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.asset) {
          setResult(d.asset);
          setHistory(d.history || []);
        }
      })
      .catch(() => {});
  }, [node?.id, projectId]);

  // Auto-generate description from node context
  useEffect(() => {
    if (!node) return;
    const autoDesc = generateAutoDescription(node, project);
    if (autoDesc && !description) setDescription(autoDesc);
  }, [node?.id]);

  if (!node) return null;

  const isDesignNode = track === 'design';
  const hasImageApi = ['character_design', 'set_design', 'costume_design', 'props', 'storyboard'].includes(node.id);
  const isAnalysisNode = ['script_analysis', 'production_breakdown'].includes(node.id);

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    try {
      const payload = {
        phase: node.phase,
        track,
        style: isDesignNode ? style : undefined,
        description,
        project: project?.title || 'Untitled',
        inputData: { description, style },
        provider: hasImageApi ? 'pollinations' : 'local',
      };
      const res = await fetch(`/api/projects/${projectId}/pipeline/${node.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Reload result
        const reload = await fetch(`/api/projects/${projectId}/pipeline/${node.id}`);
        const reloaded = await reload.json();
        if (reloaded.asset) setResult(reloaded.asset);
        setHistory(reloaded.history || []);
      } else {
        setError(data.error || 'Execution failed');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setExecuting(false);
    }
  };

  const imageUrls = result?.imageUrls || [];
  const outputData = result?.outputData;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '420px', background: '#0d0d0d',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: isDesignNode ? '#8b5cf6' : '#f59e0b', fontWeight: 600, letterSpacing: '1px' }}>
            {node.agent || track.toUpperCase()} · {node.phase}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
            {node.labelKo || node.label}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--text-dim, #888)',
          fontSize: '1.2rem', cursor: 'pointer', padding: '4px',
        }}>✕</button>
      </div>

      {/* Content — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Description */}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim, #888)', marginBottom: '16px', lineHeight: 1.5 }}>
          {node.description}
        </div>

        {/* Status badge */}
        {result && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '4px', marginBottom: '16px',
            background: result.status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${result.status === 'done' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
            fontSize: '0.6rem', fontWeight: 600,
            color: result.status === 'done' ? '#22c55e' : '#f59e0b',
          }}>
            {result.status === 'done' ? '✓ COMPLETE' : result.status?.toUpperCase()}
          </div>
        )}

        {/* Style selector (design nodes only) */}
        {isDesignNode && hasImageApi && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>
              STYLE — 10 MASTERS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {availableStyles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  style={{
                    padding: '6px 8px', fontSize: '0.62rem', textAlign: 'left',
                    background: style === s.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${style === s.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '4px', cursor: 'pointer',
                    color: style === s.id ? '#a78bfa' : 'var(--text-dim, #888)',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '0.5rem', opacity: 0.6, marginTop: '2px' }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description input */}
        {!isAnalysisNode && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>
              DESCRIPTION
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${node.labelKo} 설명을 입력하세요...`}
              style={{
                width: '100%', minHeight: '80px', resize: 'vertical',
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '10px', fontSize: '0.75rem',
                color: '#f0f0f0', fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />
          </div>
        )}

        {/* Execute button */}
        <button
          onClick={handleExecute}
          disabled={executing}
          style={{
            width: '100%', padding: '12px', fontSize: '0.8rem', fontWeight: 700,
            background: executing ? 'rgba(255,255,255,0.06)' : (isDesignNode ? '#8b5cf6' : '#f59e0b'),
            color: executing ? 'var(--text-dim)' : '#000',
            border: 'none', borderRadius: '8px', cursor: executing ? 'wait' : 'pointer',
            letterSpacing: '0.5px', marginBottom: '20px',
          }}
        >
          {executing ? '⏳ Generating...' : `⚡ EXECUTE ${node.label.toUpperCase()}`}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px', marginBottom: '16px', fontSize: '0.7rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px', color: '#ef4444',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result: Images */}
        {imageUrls.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>
              GENERATED IMAGES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={url} alt={`${node.label} result ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result: Data */}
        {outputData && typeof outputData === 'object' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>
              OUTPUT DATA
            </div>
            {/* Analysis nodes: show structured summary */}
            {node.id === 'script_analysis' && outputData.stats && (
              <div style={{ fontSize: '0.7rem', lineHeight: 1.8, color: '#ccc' }}>
                <div>📊 <strong>{outputData.stats.totalScenes}</strong> Scenes · <strong>{outputData.stats.totalCuts}</strong> Cuts</div>
                <div>👤 <strong>{outputData.characters?.length || 0}</strong> Characters · 📍 <strong>{outputData.locations?.length || 0}</strong> Locations</div>
                <div>⏱ ~<strong>{outputData.stats.estimatedMinutes}</strong> min</div>
                <div style={{ marginTop: '8px', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                  ACT 1: {outputData.stats.actBreakdown?.act1} · ACT 2: {outputData.stats.actBreakdown?.act2} · ACT 3: {outputData.stats.actBreakdown?.act3}
                </div>
                {/* Top characters */}
                {outputData.characters?.slice(0, 5).map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.65rem' }}>
                    <span style={{ color: c.type === 'lead' ? '#a78bfa' : '#888' }}>{c.name}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{c.sceneCount} scenes · {c.type}</span>
                  </div>
                ))}
              </div>
            )}
            {node.id === 'production_breakdown' && (
              <div style={{ fontSize: '0.7rem', lineHeight: 1.8, color: '#ccc' }}>
                <div>📍 <strong>{outputData.uniqueLocations}</strong> Unique Locations</div>
                <div>🎬 <strong>{outputData.estimatedShootingDays}</strong> Estimated Shooting Days</div>
                <div>🌙 <strong>{outputData.nightScenes}</strong> Night Scenes · 🌿 <strong>{outputData.exteriorScenes}</strong> Exterior Scenes</div>
              </div>
            )}
            {/* Generic fallback for other nodes */}
            {!['script_analysis', 'production_breakdown'].includes(node.id) && (
              <pre style={{
                fontSize: '0.6rem', color: '#888', background: 'rgba(0,0,0,0.3)',
                padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {JSON.stringify(outputData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>
              HISTORY ({history.length})
            </div>
            {history.map(h => (
              <div key={h.id} style={{ fontSize: '0.6rem', color: 'var(--text-dim)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                #{h.id} · {h.status} · {h.style || '-'} · {h.createdAt?.slice(0, 16)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function generateAutoDescription(node, project) {
  if (!project) return '';
  switch (node.id) {
    case 'character_design': return `${project.title}의 주요 캐릭터 컨셉 디자인`;
    case 'set_design': return `${project.title}의 주요 로케이션 세트 컨셉`;
    case 'costume_design': return `${project.title}의 캐릭터별 의상 디자인`;
    case 'props': return `${project.title}의 핵심 소품 디자인`;
    case 'storyboard': return `${project.title}의 주요 씬 스토리보드`;
    case 'visual_world': return `${project.title}의 비주얼 톤 & 색감 정의`;
    default: return '';
  }
}

export default NodeExecutionPanel;
