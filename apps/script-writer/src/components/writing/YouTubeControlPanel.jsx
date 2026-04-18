import React, { useState, useEffect } from 'react';

export const YT_GENRE_HINTS = {
  'Documentary': { icon: '🎙️', hookType: 'Reveal the ending first', duration: '8-15min' },
  'Story':       { icon: '📖', hookType: 'Drop into most dramatic moment', duration: '10-20min' },
  'Educational': { icon: '📚', hookType: 'Show final result first', duration: '5-12min' },
  'Comedy':      { icon: '😂', hookType: 'Establish premise immediately', duration: '3-8min' },
  'Short-form':  { icon: '📱', hookType: 'Pattern Break in first 2 seconds', duration: '15-60s' },
};

export const YT_FORMAT_PRESETS = {
  'Mini Documentary': {
    structure: `[0:00-0:30] HOOK — 충격적 사실/반전 결론\n[0:30-2:00] SETUP — 문제/현상 정의\n[2:00-5:00] DEEP DIVE A\n[5:00-8:00] DEEP DIVE B — 반전\n[8:00-11:00] REVELATION\n[11:00-14:00] IMPLICATIONS\n[14:00-15:00] CTA`,
    hookFormula: 'Open Loop — 결론 먼저 → "왜?" 유발',
  },
  'Tutorial': {
    structure: `[0:00-0:30] HOOK — 최종 결과물 먼저\n[0:30-1:30] PROMISE — 배울 내용\n[1:30-3:00] WHY IT MATTERS\n[3:00-9:00] STEP-BY-STEP\n[9:00-11:00] COMMON MISTAKES\n[11:00-12:00] RECAP + CTA`,
    hookFormula: 'Before/After — 완성본 먼저, 과정은 나중',
  },
  'Narrative Story': {
    structure: `[0:00-0:45] HOOK — In medias res\n[0:45-3:00] CONTEXT\n[3:00-10:00] ACT 1\n[10:00-16:00] ACT 2 — 반전/위기\n[16:00-19:00] ACT 3\n[19:00-20:00] REFLECTION + CTA`,
    hookFormula: 'In Medias Res — 클라이맥스 시작',
  },
  'Sketch / Comedy': {
    structure: `[0:00-0:15] PREMISE\n[0:15-1:00] ESCALATION 1\n[1:00-2:30] ESCALATION 2\n[2:30-5:00] SUBVERSION\n[5:00-7:30] CALLBACK\n[7:30-8:00] TAG + CTA`,
    hookFormula: 'Pattern Interrupt — 즉각적 상황 과장',
  },
  'Short-form': {
    structure: `[0:00-0:02] PATTERN BREAK\n[0:02-0:05] HOOK LINE\n[0:05-0:20] CORE — 핵심 1가지\n[0:20-0:40] PAYOFF\n[0:40-0:55] LOOP SETUP\n[0:55-1:00] CTA`,
    hookFormula: 'Pattern Break — 첫 2초 스크롤 멈추기',
  },
};

const selectStyle = {
  padding: '4px 8px', fontSize: '0.6rem', fontWeight: 600,
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,168,85,0.2)',
  borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer',
};

const YouTubeControlPanel = ({ onConfigChange, initialConfig }) => {
  const [genre, setGenre] = useState(initialConfig?.genre || 'Documentary');
  const [format, setFormat] = useState(initialConfig?.format || 'Mini Documentary');
  const [retention, setRetention] = useState(initialConfig?.retention || 60);
  const [targetAudience, setTargetAudience] = useState(initialConfig?.targetAudience || '');

  useEffect(() => {
    const preset = YT_FORMAT_PRESETS[format];
    const genreHint = YT_GENRE_HINTS[genre];
    onConfigChange({
      genre, format, retention, targetAudience,
      formatStructure: preset?.structure || '',
      hookFormula: preset?.hookFormula || '',
      hookType: genreHint?.hookType || '',
      duration: genreHint?.duration || '',
    });
  }, [genre, format, retention, targetAudience]);

  return (
    <div style={{
      padding: '8px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
    }}>
      <span style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '1.5px', fontWeight: 700 }}>YT</span>

      <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
        {Object.entries(YT_GENRE_HINTS).map(([k, v]) => (
          <option key={k} value={k}>{v.icon} {k}</option>
        ))}
      </select>

      <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
        {Object.keys(YT_FORMAT_PRESETS).map(k => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>Retention</span>
        <input type="range" min="30" max="90" value={retention} onChange={e => setRetention(Number(e.target.value))}
          style={{ width: '50px', height: '3px', accentColor: 'var(--gold)' }} />
        <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', width: '24px' }}>{retention}%</span>
      </div>

      <input
        value={targetAudience}
        onChange={e => setTargetAudience(e.target.value)}
        placeholder="타겟 시청자..."
        style={{ ...selectStyle, width: '140px', fontSize: '0.55rem' }}
      />

      <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
        {YT_GENRE_HINTS[genre]?.duration} · {YT_FORMAT_PRESETS[format]?.hookFormula?.split('—')[0]?.trim()}
      </span>
    </div>
  );
};

export default YouTubeControlPanel;
