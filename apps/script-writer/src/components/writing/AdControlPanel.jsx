import React, { useState, useEffect } from 'react';

export const AD_GENRE_HINTS = {
  'BrandFilm':   { icon: '✨', name: 'Brand Film',          copyTone: '시적·철학적 VO' },
  'ProductDemo': { icon: '📦', name: 'Product Demo',        copyTone: '직접·기능 중심' },
  'Cinematic':   { icon: '🎥', name: 'Cinematic Narrative', copyTone: '내러티브 VO' },
  'Social':      { icon: '🤳', name: 'Social / Digital',    copyTone: '구어체·직접 대화' },
  'Performance': { icon: '🎯', name: 'Performance / DR',    copyTone: '설득·행동 유도' },
  'Testimonial': { icon: '🗣️', name: 'Testimonial / UGC',  copyTone: '진정성·구어' },
};

export const AD_FORMAT_PRESETS = {
  '15s': {
    label: '15s Sprint', structure: `[0:00-0:03] HOOK — 시각적 충격\n[0:03-0:10] USP — 핵심 혜택 1가지\n[0:10-0:15] CTA — 브랜드 + 슬로건`,
    aida: 'A→D→A', cuts: '7-10', copyRule: '헤드라인 1줄 + 슬로건만',
  },
  '30s': {
    label: '30s Classic', structure: `[0:00-0:03] HOOK\n[0:03-0:10] PROBLEM\n[0:10-0:22] SOLUTION\n[0:22-0:27] PROOF\n[0:27-0:30] CTA`,
    aida: 'A→I→D→A', cuts: '15-20', copyRule: 'VO 3-5줄. 감성+기능 균형',
  },
  '60s': {
    label: '60s Story', structure: `[0:00-0:05] HOOK\n[0:05-0:20] SETUP\n[0:20-0:40] CONFLICT\n[0:40-0:52] RESOLUTION\n[0:52-0:58] PEAK\n[0:58-1:00] CTA`,
    aida: 'A→I→D→A (확장)', cuts: '30-40', copyRule: '내러티브 VO. 캐릭터 대사 허용',
  },
  'BrandFilm': {
    label: 'Brand Film 2-3min', structure: `[0:00-0:15] MANIFESTO\n[0:15-1:00] ACT 1\n[1:00-2:00] ACT 2\n[2:00-2:40] ACT 3\n[2:40-3:00] RESOLUTION`,
    aida: '매니페스토 서사', cuts: '60-80', copyRule: '철학적 VO. 제품 직접 언급 최소',
  },
};

export const AD_PLATFORM_PRESETS = {
  'TV':        { ratio: '16:9',  hook: '3s', note: '감성 최대치' },
  'YouTube':   { ratio: '16:9',  hook: '5s', note: '5초 안에 브랜드 노출' },
  'Instagram': { ratio: '9:16',  hook: '1s', note: '세로형. 자막 필수' },
  'TikTok':    { ratio: '9:16',  hook: '1s', note: 'Native + 트렌딩 오디오' },
  'Cinema':    { ratio: '2.39:1', hook: '-', note: '프레스티지. 사운드 극대화' },
  'OTT':       { ratio: '16:9',  hook: '3s', note: 'TV급 + 디지털 정밀 타겟' },
};

const selectStyle = {
  padding: '4px 8px', fontSize: '0.6rem', fontWeight: 600,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,168,85,0.2)',
  borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer',
};

const AdControlPanel = ({ onConfigChange, initialConfig }) => {
  const [adType, setAdType] = useState(initialConfig?.adType || 'Cinematic');
  const [adFormat, setAdFormat] = useState(initialConfig?.adFormat || '30s');
  const [adPlatform, setAdPlatform] = useState(initialConfig?.adPlatform || 'YouTube');
  const [creativeRole, setCreativeRole] = useState(initialConfig?.creativeRole || 'CD');

  useEffect(() => {
    const preset = AD_FORMAT_PRESETS[adFormat];
    const platform = AD_PLATFORM_PRESETS[adPlatform];
    onConfigChange({
      adType, adFormat, adPlatform, creativeRole,
      formatStructure: preset?.structure || '',
      platformRatio: platform?.ratio || '16:9',
      platformHook: platform?.hook || '3s',
      copyTone: AD_GENRE_HINTS[adType]?.copyTone || '',
      aida: preset?.aida || '',
      cuts: preset?.cuts || '',
    });
  }, [adType, adFormat, adPlatform, creativeRole]);

  return (
    <div style={{
      padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
    }}>
      <span style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '1.5px', fontWeight: 700 }}>AD</span>

      <select value={adType} onChange={e => setAdType(e.target.value)} style={selectStyle}>
        {Object.entries(AD_GENRE_HINTS).map(([k, v]) => (
          <option key={k} value={k}>{v.icon} {v.name}</option>
        ))}
      </select>

      <select value={adFormat} onChange={e => setAdFormat(e.target.value)} style={selectStyle}>
        {Object.entries(AD_FORMAT_PRESETS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>

      <select value={adPlatform} onChange={e => setAdPlatform(e.target.value)} style={selectStyle}>
        {Object.keys(AD_PLATFORM_PRESETS).map(k => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <select value={creativeRole} onChange={e => setCreativeRole(e.target.value)} style={selectStyle}>
        <option value="CD">CD</option>
        <option value="AE">AE</option>
      </select>

      <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
        {AD_FORMAT_PRESETS[adFormat]?.aida} · {AD_FORMAT_PRESETS[adFormat]?.cuts} cuts · {AD_PLATFORM_PRESETS[adPlatform]?.ratio}
      </span>
    </div>
  );
};

export default AdControlPanel;
