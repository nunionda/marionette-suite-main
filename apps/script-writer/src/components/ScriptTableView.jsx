import React from 'react';

const ScriptTableView = ({ raw }) => {
  // Simple parser for 2-column format (Visual | Audio)
  // Assumes AI outputs something like:
  // [Scene 1]
  // Visual: ...
  // Audio: ...
  
  const parseScript = (text) => {
    if (!text) return [];
    
    const scenes = [];
    // Aggressive regex for Scene headers
    const sceneRegex = /(?:\[SCENE\s*(\d+).*?\]|###\s*Scene\s*(\d+)|(?:\*\*|#)\s*Scene\s*(\d+)\s*(?:\*\*|:)?|Scene\s*(\d+)\s*:?)([\s\S]*?)(?=\[SCENE|###\s*Scene|\*\*Scene|Scene\s*\d+|$)/gi;
    
    let match;
    while ((match = sceneRegex.exec(text)) !== null) {
      const number = match[1] || match[2] || match[3] || match[4];
      const content = match[5];
      
      const visual = content.match(/Visual\s*[:\s]+([\s\S]*?)(?=Audio:|$)/i)?.[1]?.trim() || 
                    content.match(/Video\s*[:\s]+([\s\S]*?)(?=Audio:|$)/i)?.[1]?.trim() || '';
      const audio = content.match(/Audio\s*[:\s]+([\s\S]*?)$/i)?.[1]?.trim() || '';
      
      if (visual || audio) {
        scenes.push({ number, visual, audio });
      }
    }
    
    // Fallback: parse markdown table format (| time | visual | audio |)
    if (scenes.length === 0 && text.includes('|')) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (!line.includes('|')) continue;
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        // Skip header/separator rows
        if (cells.length < 2) continue;
        if (cells.every(c => /^[-:\s]+$/.test(c))) continue;
        if (/영상|VISUAL|visual|시간|TRT|audio|음성/i.test(cells[0] + cells[1])) continue;
        // cells[0]=time, cells[1]=visual, cells[2]=audio
        const number = cells[0] || '-';
        const visual = cells[1] || '';
        const audio = cells[2] || '-';
        if (visual) scenes.push({ number, visual, audio });
      }
    }
    
    if (scenes.length === 0) {
      return [{ number: '-', visual: text, audio: '-' }];
    }
    
    return scenes;
  };

  const scenes = parseScript(raw);

  return (
    <div className="script-table-container glass" style={{ padding: '20px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr style={{ background: 'var(--accent-primary)', color: 'black' }}>
            <th style={{ padding: '12px', textAlign: 'left', width: '80px' }}>SCENE</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>📽️ VISUAL (MISE-EN-SCÈNE)</th>
            <th style={{ padding: '12px', textAlign: 'left', width: '30%' }}>🔊 AUDIO (SFX / VO)</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((scene, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{scene.number}</td>
              <td style={{ padding: '15px', lineHeight: '1.6', fontSize: '0.95rem' }}>{scene.visual}</td>
              <td style={{ padding: '15px', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{scene.audio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScriptTableView;
