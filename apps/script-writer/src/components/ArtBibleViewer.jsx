import React, { useState, useEffect } from 'react';

/**
 * ArtBibleViewer — Compiled art bible from all Production Design nodes.
 *
 * Sections:
 *   1. Visual Tone (from visual_world node)
 *   2. Character Sheets (from character_design node)
 *   3. Set Design (from set_design node)
 *   4. Costume Bible (from costume_design node)
 *   5. Props (from props node)
 *   6. Storyboard Frames (from storyboard node)
 *   7. Analysis Summary (from script_analysis + production_breakdown)
 */

const SECTIONS = [
  { nodeId: 'script_analysis',      label: '시나리오 분석',    icon: '🔍', type: 'data' },
  { nodeId: 'production_breakdown', label: '제작 분석표',      icon: '📋', type: 'data' },
  { nodeId: 'visual_world',         label: '비주얼 세계관',    icon: '🌍', type: 'mixed' },
  { nodeId: 'character_design',     label: '캐릭터 디자인',    icon: '👤', type: 'image' },
  { nodeId: 'character_arc',        label: '캐릭터 개발',      icon: '📊', type: 'data' },
  { nodeId: 'set_design',           label: '세트 디자인',      icon: '🏗️', type: 'image' },
  { nodeId: 'set_dressing',         label: '세트 드레싱',      icon: '🪑', type: 'data' },
  { nodeId: 'costume_design',       label: '의상 디자인',      icon: '👗', type: 'image' },
  { nodeId: 'props',                label: '소품',             icon: '🔧', type: 'image' },
  { nodeId: 'storyboard',           label: '스토리보드',       icon: '📐', type: 'image' },
  { nodeId: 'shot_list',            label: '샷 리스트',        icon: '🎥', type: 'data' },
];

const ArtBibleViewer = ({ projectId, project, onBack }) => {
  const [pipelineData, setPipelineData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/pipeline`)
      .then(r => r.json())
      .then(d => {
        setPipelineData(d.nodes || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const completedSections = SECTIONS.filter(s => pipelineData[s.nodeId]?.status === 'done');
  const totalSections = SECTIONS.length;
  const progress = Math.round((completedSections.length / totalSections) * 100);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-dim)', textAlign: 'center' }}>Loading Art Bible...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color, #0a0a0a)' }}>
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
          <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '1px' }}>ART BIBLE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {completedSections.length}/{totalSections} sections
          </span>
          <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', borderRadius: '2px' }} />
          </div>
          <button
            onClick={() => {
              window.open(`/api/projects/${projectId}/art-bible/export`, '_blank');
            }}
            disabled={completedSections.length === 0}
            style={{
              padding: '6px 14px', fontSize: '0.65rem', fontWeight: 600,
              background: completedSections.length > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${completedSections.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '4px',
              color: completedSections.length > 0 ? 'var(--gold)' : 'var(--text-dim)',
              cursor: completedSections.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            📤 Export PDF
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Section nav */}
        <nav style={{
          width: '220px', borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto', flexShrink: 0, padding: '8px',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--text-dim)', padding: '8px 8px 4px', marginBottom: '4px' }}>
            SECTIONS
          </div>
          {SECTIONS.map(section => {
            const asset = pipelineData[section.nodeId];
            const isDone = asset?.status === 'done';
            const isActive = activeSection === section.nodeId;
            return (
              <button
                key={section.nodeId}
                onClick={() => setActiveSection(section.nodeId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '8px 10px', marginBottom: '2px',
                  background: isActive ? 'rgba(239,68,68,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
                  borderRadius: '6px', cursor: 'pointer',
                  color: isDone ? 'var(--text-main, #eee)' : 'var(--text-dim, #666)',
                  fontSize: '0.7rem', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span>{section.icon}</span>
                <span style={{ flex: 1 }}>{section.label}</span>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isDone ? 'var(--status-ok)' : 'rgba(255,255,255,0.1)',
                }} />
              </button>
            );
          })}
        </nav>

        {/* Right: Section content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!activeSection ? (
            <OverviewGrid sections={SECTIONS} pipelineData={pipelineData} onSelect={setActiveSection} project={project} />
          ) : (
            <SectionDetail
              section={SECTIONS.find(s => s.nodeId === activeSection)}
              asset={pipelineData[activeSection]}
              onBack={() => setActiveSection(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

/* ─── Overview Grid ─── */
function OverviewGrid({ sections, pipelineData, onSelect, project }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
        {project?.title} — Art Bible
      </h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.5 }}>
        프로덕션 디자인 파이프라인의 모든 결과물을 통합한 아트 바이블입니다.
        각 섹션을 클릭하여 상세 내용을 확인하세요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {sections.map(section => {
          const asset = pipelineData[section.nodeId];
          const isDone = asset?.status === 'done';
          const images = asset?.imageUrls || [];
          return (
            <div
              key={section.nodeId}
              onClick={() => onSelect(section.nodeId)}
              style={{
                padding: '16px', borderRadius: '8px', cursor: 'pointer',
                background: isDone ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isDone ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{section.icon}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>{section.label}</div>
              <div style={{
                fontSize: '0.6rem',
                color: isDone ? 'var(--status-ok)' : 'var(--text-dim)',
                fontWeight: isDone ? 600 : 400,
              }}>
                {isDone ? '✓ Complete' : '— Not started'}
              </div>
              {images.length > 0 && (
                <div style={{ marginTop: '8px', borderRadius: '4px', overflow: 'hidden', aspectRatio: '16/9', background: '#111' }}>
                  <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section Detail ─── */
function SectionDetail({ section, asset, onBack }) {
  if (!section) return null;
  const isDone = asset?.status === 'done';
  const outputData = asset?.outputData;
  const images = asset?.imageUrls || [];

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
        fontSize: '0.75rem', marginBottom: '16px', fontFamily: 'inherit',
      }}>
        ← Overview
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '2rem' }}>{section.icon}</span>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{section.label}</h2>
          <span style={{
            fontSize: '0.6rem', fontWeight: 600,
            color: isDone ? 'var(--status-ok)' : 'var(--text-dim)',
          }}>
            {isDone ? '✓ Complete' : '— Not generated yet'}
          </span>
        </div>
      </div>

      {!isDone && (
        <div style={{
          padding: '24px', textAlign: 'center', fontSize: '0.75rem',
          color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          Pipeline 탭에서 이 노드를 실행하세요.
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
            {images.map((url, i) => (
              <div key={i} style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={url} alt={`${section.label} ${i + 1}`} style={{ width: '100%', display: 'block' }} onError={e => e.target.style.display = 'none'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data output */}
      {outputData && section.nodeId === 'script_analysis' && (
        <AnalysisSummary data={outputData} />
      )}
      {outputData && section.nodeId === 'production_breakdown' && (
        <BreakdownSummary data={outputData} />
      )}
      {outputData && !['script_analysis', 'production_breakdown'].includes(section.nodeId) && (
        <pre style={{
          fontSize: '0.65rem', color: '#888', background: 'rgba(0,0,0,0.3)',
          padding: '12px', borderRadius: '6px', overflow: 'auto', maxHeight: '400px',
          whiteSpace: 'pre-wrap',
        }}>
          {JSON.stringify(outputData, null, 2)}
        </pre>
      )}

      {/* Metadata */}
      {asset && (
        <div style={{ marginTop: '16px', fontSize: '0.6rem', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
          {asset.style && <span>Style: {asset.style}</span>}
          {asset.provider && <span>Provider: {asset.provider}</span>}
          {asset.createdAt && <span>Created: {asset.createdAt?.slice(0, 16)}</span>}
        </div>
      )}
    </div>
  );
}

function AnalysisSummary({ data }) {
  if (!data?.stats) return null;
  return (
    <div style={{ fontSize: '0.75rem', lineHeight: 1.8, color: '#ccc' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <StatCard label="Scenes" value={data.stats.totalScenes} />
        <StatCard label="Cuts" value={data.stats.totalCuts} />
        <StatCard label="Characters" value={data.stats.totalCharacters} />
        <StatCard label="Est. Minutes" value={data.stats.estimatedMinutes} />
      </div>
      {data.characters && (
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '6px' }}>CHARACTERS</div>
          {data.characters.slice(0, 10).map(c => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: c.type === 'lead' ? 'var(--gold)' : '#888' }}>{c.name}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>{c.sceneCount} scenes · {c.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BreakdownSummary({ data }) {
  return (
    <div style={{ fontSize: '0.75rem', lineHeight: 1.8, color: '#ccc' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <StatCard label="Locations" value={data.uniqueLocations} />
        <StatCard label="Shooting Days" value={data.estimatedShootingDays} />
        <StatCard label="Night Scenes" value={data.nightScenes} />
        <StatCard label="Exterior Scenes" value={data.exteriorScenes} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #eee)' }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

export default ArtBibleViewer;
