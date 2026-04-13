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

// ─── Node-specific style categories ───
// Each production design node uses different reference artists

const STYLE_BY_NODE = {
  // 캐릭터 디자인: 할리우드 10대 캐릭터 디자이너/컨셉 아티스트
  character_design: [
    { id: 'iain_mccaig', label: 'Iain McCaig', desc: 'Star Wars 프리퀄 캐릭터 디자인, 다스 몰/파드메' },
    { id: 'ralph_mcquarrie', label: 'Ralph McQuarrie', desc: 'Star Wars 오리지널 컨셉, 다스 베이더/C-3PO' },
    { id: 'moebius', label: 'Moebius (Jean Giraud)', desc: 'Alien/Tron/Fifth Element 컨셉, 유럽 만화 거장' },
    { id: 'neville_page', label: 'Neville Page', desc: 'Avatar/Star Trek/Prometheus 크리처 디자인' },
    { id: 'mike_mignola', label: 'Mike Mignola', desc: 'Hellboy 창시자, 강렬한 실루엣과 그림자' },
    { id: 'syd_mead', label: 'Syd Mead', desc: 'Blade Runner/Aliens/Tron 비주얼 퓨처리스트' },
    { id: 'hr_giger', label: 'H.R. Giger', desc: 'Alien 제노모프 창시자, 바이오메카닉 공포' },
    { id: 'carlos_huante', label: 'Carlos Huante', desc: 'Men in Black/Prometheus/Pacific Rim 크리처' },
    { id: 'doug_chiang', label: 'Doug Chiang', desc: 'Star Wars 프리퀄 디자인 총괄, 메카닉+유기적' },
    { id: 'crash_mcdonnell', label: 'Crash McCreery', desc: 'Jurassic Park/Pirates of Caribbean 크리처' },
  ],
  // 세트 디자인: 할리우드 10대 프로덕션 디자이너
  set_design: [
    { id: 'ken_adam', label: 'Ken Adam', desc: 'James Bond/Dr. Strangelove, 거대한 비현실적 공간' },
    { id: 'nathan_crowley', label: 'Nathan Crowley', desc: 'Nolan 전담 — Dark Knight/Interstellar/Dunkirk' },
    { id: 'rick_carter', label: 'Rick Carter', desc: 'Jurassic Park/Avatar/Star Wars, 세계관 건축가' },
    { id: 'hannah_beachler', label: 'Hannah Beachler', desc: 'Black Panther 와칸다 설계, 아카데미 수상' },
    { id: 'dante_ferretti', label: 'Dante Ferretti', desc: 'Scorsese 전담 — Hugo/Gangs of New York' },
    { id: 'stuart_craig', label: 'Stuart Craig', desc: 'Harry Potter 전 시리즈 호그와트 설계' },
    { id: 'eugenio_caballero', label: 'Eugenio Caballero', desc: "Pan's Labyrinth, 판타지+현실 공간 융합" },
    { id: 'adam_stockhausen', label: 'Adam Stockhausen', desc: 'Grand Budapest Hotel/West Side Story' },
    { id: 'mark_tildesley', label: 'Mark Tildesley', desc: '28 Days Later/Sunshine, 디스토피아 공간' },
    { id: 'eve_stewart', label: 'Eve Stewart', desc: "Les Misérables/The King's Speech, 시대극 전문" },
  ],
  // 의상 디자인: 할리우드 10대 의상 디자이너
  costume_design: [
    { id: 'colleen_atwood', label: 'Colleen Atwood', desc: '팀 버튼 전담, Alice/Fantastic Beasts 4회 오스카' },
    { id: 'ruth_carter', label: 'Ruth E. Carter', desc: 'Black Panther, 아프로퓨처리즘 의상 2회 오스카' },
    { id: 'sandy_powell', label: 'Sandy Powell', desc: 'Scorsese 전담, The Aviator/Cinderella 3회 오스카' },
    { id: 'eiko_ishioka', label: 'Eiko Ishioka', desc: "Bram Stoker's Dracula, 일본 아방가르드 오스카 수상" },
    { id: 'jenny_beavan', label: 'Jenny Beavan', desc: 'Mad Max: Fury Road/Cruella 2회 오스카' },
    { id: 'milena_canonero', label: 'Milena Canonero', desc: 'A Clockwork Orange/Grand Budapest 4회 오스카' },
    { id: 'jacqueline_durran', label: 'Jacqueline Durran', desc: 'Little Women/Anna Karenina 2회 오스카' },
    { id: 'michael_kaplan', label: 'Michael Kaplan', desc: 'Blade Runner/Star Wars: Force Awakens SF의상' },
    { id: 'lindy_hemming', label: 'Lindy Hemming', desc: 'Dark Knight 조커 의상, 007 시리즈 오스카 수상' },
    { id: 'arianne_phillips', label: 'Arianne Phillips', desc: 'Once Upon a Time/Kingsman 시대극+현대 융합' },
  ],
  // 소품 디자인: 할리우드 10대 소품/프랍 디자이너
  props: [
    { id: 'daniel_simon', label: 'Daniel Simon', desc: 'Tron Legacy/Captain America 미래 차량+메카닉' },
    { id: 'annie_atkins', label: 'Annie Atkins', desc: 'Grand Budapest Hotel/Islanders 그래픽 프랍' },
    { id: 'roger_christian', label: 'Roger Christian', desc: 'Star Wars 오리지널 소품 총괄 오스카 수상' },
    { id: 'phil_saunders', label: 'Phil Saunders', desc: 'Iron Man 아머/Tron 차량 디자인' },
    { id: 'weta_workshop', label: 'Weta Workshop', desc: 'LOTR/Avatar 소품+무기 제작 뉴질랜드' },
    { id: 'adam_savage', label: 'Adam Savage', desc: 'The Matrix/Galaxy Quest/AI 하드 프랍 전문' },
    { id: 'simon_mcquoid', label: 'Prop Realism', desc: '기능적 사실주의 — 실제 작동하는 소품 스타일' },
    { id: 'sci_fi_minimal', label: 'SF Minimalist', desc: '미니멀 SF 소품 — 깔끔한 미래 디자인' },
    { id: 'period_authentic', label: 'Period Authentic', desc: '시대극 고증 소품 — 역사적 정확성' },
    { id: 'fantasy_ornate', label: 'Fantasy Ornate', desc: '판타지 장식 소품 — 정교한 디테일' },
  ],
};

// 스토리보드 노드는 storyboard-concept-maker 서버에서 스타일을 가져옴 (연출가 스타일)
const STORYBOARD_FALLBACK = [
  { id: 'bong', label: 'Bong Joon-ho', desc: '사회적 풍자, 극단적 대비' },
  { id: 'kurosawa', label: 'Akira Kurosawa', desc: '동적 구도, 자연광' },
  { id: 'miyazaki', label: 'Hayao Miyazaki', desc: '자연주의, 색채 풍부' },
  { id: 'ridley_scott', label: 'Ridley Scott', desc: '스케일감, 디테일 질감' },
  { id: 'anderson_wes', label: 'Wes Anderson', desc: '대칭, 파스텔, 미니어처' },
];

const STORYBOARD_API = 'http://localhost:3007';

function getNodeStyles(nodeId) {
  return STYLE_BY_NODE[nodeId] || null; // null means use storyboard server styles
}

const NodeExecutionPanel = ({ node, track, projectId, project, onClose }) => {
  // Use node-specific styles if available, otherwise fetch from storyboard server
  const nodeSpecificStyles = getNodeStyles(node?.id);
  const [style, setStyle] = useState(nodeSpecificStyles?.[0]?.id || 'bong');
  const [availableStyles, setAvailableStyles] = useState(nodeSpecificStyles || STORYBOARD_FALLBACK);

  // Fetch storyboard server styles only for storyboard/generic nodes
  useEffect(() => {
    if (nodeSpecificStyles) {
      setAvailableStyles(nodeSpecificStyles);
      setStyle(nodeSpecificStyles[0]?.id || 'bong');
      return;
    }
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
              {nodeSpecificStyles ? `REFERENCE ARTISTS — ${node.label.toUpperCase()}` : 'STYLE — 10 MASTERS'}
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
