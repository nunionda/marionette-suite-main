'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmotionChartProps {
  emotionGraph: any[];
}

export default function EmotionChart({ emotionGraph }: EmotionChartProps) {
  return (
    <div className="glass-panel main-chart">
      <h3 style={{ marginBottom: '1.5rem' }}>Emotional Valence Arc</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={emotionGraph}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0070f3" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="sceneNumber" hide />
          <YAxis domain={[-10, 10]} stroke="var(--text-dim)" />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem', maxWidth: '280px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Scene {d.sceneNumber}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--accent-gold)' }}>{d.dominantEmotion || '—'}</span>
                    <span style={{ fontWeight: 600, color: d.score >= 0 ? '#2ecc71' : '#e74c3c' }}>{d.score > 0 ? '+' : ''}{d.score}</span>
                  </div>
                  {d.explanation && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'normal' }}>{d.explanation}</div>}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="score" stroke="#0070f3" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
