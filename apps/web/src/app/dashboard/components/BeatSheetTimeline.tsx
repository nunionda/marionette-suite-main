'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface BeatSheetTimelineProps {
  beatSheet: any[];
}

export default function BeatSheetTimeline({ beatSheet }: BeatSheetTimelineProps) {
  return (
    <div className="timeline-container">
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>
          <BarChart3 size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
          Narrative Beat Sheet
        </h3>
        <div style={{ display: 'flex' }}>
          {beatSheet.map((beat: any, idx: number) => (
            <div key={idx} className="beat-node">
              <div className="dot" />
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>Act {beat.act}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{beat.name}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'normal' }}>{beat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
