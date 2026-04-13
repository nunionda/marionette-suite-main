import React, { useState, useEffect } from 'react';

export const OTT_PLATFORMS = {
  'Netflix':    { color: '#E50914' },
  'Disney+':    { color: '#113CCF' },
  'Apple TV+':  { color: '#555555' },
  'Wavve':      { color: '#0078FF' },
  'TVING':      { color: '#FF153C' },
};

const selectStyle = {
  padding: '4px 8px', fontSize: '0.6rem', fontWeight: 600,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,168,85,0.2)',
  borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer',
};

const DramaControlPanel = ({ onConfigChange, initialConfig }) => {
  const [ottPlatform, setOttPlatform] = useState(initialConfig?.ottPlatform || 'Netflix');
  const [episode, setEpisode] = useState(initialConfig?.episode || 1);
  const [bingeHook, setBingeHook] = useState(initialConfig?.bingeHook || 8);
  const [creativeRole, setCreativeRole] = useState(initialConfig?.creativeRole || 'DIRECTOR');

  useEffect(() => {
    onConfigChange({ ottPlatform, episode, bingeHook, creativeRole });
  }, [ottPlatform, episode, bingeHook, creativeRole]);

  return (
    <div style={{
      padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
    }}>
      <span style={{
        fontSize: '0.55rem', letterSpacing: '1.5px', fontWeight: 700,
        color: OTT_PLATFORMS[ottPlatform]?.color || 'var(--gold)',
      }}>
        {ottPlatform.toUpperCase()}
      </span>

      <select value={ottPlatform} onChange={e => setOttPlatform(e.target.value)} style={selectStyle}>
        {Object.keys(OTT_PLATFORMS).map(k => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <select value={episode} onChange={e => setEpisode(Number(e.target.value))} style={selectStyle}>
        {Array.from({ length: 10 }, (_, i) => (
          <option key={i + 1} value={i + 1}>EP {i + 1}</option>
        ))}
      </select>

      <select value={creativeRole} onChange={e => setCreativeRole(e.target.value)} style={selectStyle}>
        <option value="DIRECTOR">Director</option>
        <option value="WRITER">Writer</option>
        <option value="PRODUCER">Producer</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>Binge Hook</span>
        <input type="range" min="1" max="10" value={bingeHook} onChange={e => setBingeHook(Number(e.target.value))}
          style={{ width: '50px', height: '3px', accentColor: OTT_PLATFORMS[ottPlatform]?.color || 'var(--gold)' }} />
        <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', width: '16px' }}>{bingeHook}</span>
      </div>

      <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
        EP {episode}/10 · 15-Beat Framework
      </span>
    </div>
  );
};

export default DramaControlPanel;
