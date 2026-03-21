'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface BeatSheetTimelineProps {
  beatSheet: any[];
}

const ACT_COLORS: Record<number, string> = {
  1: 'var(--color-success)',
  2: 'var(--accent-blue)',
  3: 'var(--color-warning)',
};

const ACT_BG: Record<number, string> = {
  1: 'rgba(46, 204, 113, 0.08)',
  2: 'rgba(0, 112, 243, 0.08)',
  3: 'rgba(243, 156, 18, 0.08)',
};

export default function BeatSheetTimeline({ beatSheet }: BeatSheetTimelineProps) {
  const acts = beatSheet.reduce<Record<number, any[]>>((acc, beat) => {
    const act = beat.act || 1;
    if (!acc[act]) acc[act] = [];
    acc[act].push(beat);
    return acc;
  }, {});

  const actKeys = Object.keys(acts).map(Number).sort();

  return (
    <div className="beat-sheet-container">
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>
          <BarChart3 size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
          Narrative Beat Sheet
        </h3>

        <div className="beat-acts">
          {actKeys.map(actNum => (
            <div key={actNum} className="beat-act-section">
              <div className="beat-act-header">
                <span className="beat-act-label" style={{ color: ACT_COLORS[actNum] || 'var(--text-dim)' }}>
                  Act {actNum}
                </span>
                <span className="beat-act-count">{acts[actNum].length} beats</span>
                <div className="beat-act-line" style={{ background: ACT_COLORS[actNum] || 'var(--text-dim)' }} />
              </div>
              <div className="beat-grid">
                {acts[actNum].map((beat: any, idx: number) => (
                  <div
                    key={idx}
                    className="beat-card"
                    style={{ borderLeftColor: ACT_COLORS[actNum] || 'var(--text-dim)', background: ACT_BG[actNum] || 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="beat-card-header">
                      <span className="beat-card-name">{beat.name}</span>
                    </div>
                    {(beat.sceneStart || beat.sceneEnd) && (
                      <div className="beat-card-scenes">
                        Scenes {beat.sceneStart}–{beat.sceneEnd}
                      </div>
                    )}
                    <p className="beat-card-desc">{beat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
