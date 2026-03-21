'use client';

import React from 'react';
import { GitBranch, AudioWaveform, PieChart } from 'lucide-react';

interface CharacterIntelligenceProps {
  characterNetwork: any;
}

export default function CharacterIntelligence({ characterNetwork }: CharacterIntelligenceProps) {
  const characters = characterNetwork?.characters ?? characterNetwork ?? [];
  const edges = characterNetwork?.edges;
  const diversityMetrics = characterNetwork?.diversityMetrics;

  return (
    <>
      {/* Character Prominence */}
      <div className="glass-panel sidebar-panel">
        <h3>Character Prominence</h3>
        <div style={{ marginTop: '1rem' }}>
          {characters.map((char: any) => (
            <div key={char.name} className="character-item">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{char.name}</span>
                  <span style={{ fontWeight: 600 }}>{char.totalLines || '—'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{char.role}</span>
                  {char.voiceScore != null && (
                    <span style={{ color: char.voiceScore >= 60 ? '#2ecc71' : char.voiceScore >= 30 ? '#f39c12' : 'var(--text-dim)' }}>
                      Voice: {char.voiceScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Character Relationships */}
      {edges?.length > 0 && (
        <div className="glass-panel char-relationships-panel">
          <h3 style={{ marginBottom: '1rem' }}>
            <GitBranch size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
            Character Relationships
          </h3>
          <div className="relationship-list">
            {edges.slice(0, 12).map((edge: any, i: number) => {
              const maxWeight = edges[0]?.weight || 1;
              const pct = Math.round((edge.weight / maxWeight) * 100);
              return (
                <div key={i} className="relationship-row">
                  <div className="relationship-names">
                    <span>{edge.source}</span>
                    <span className="relationship-arrow">&#8596;</span>
                    <span>{edge.target}</span>
                  </div>
                  <div className="relationship-stats">
                    <span className="detail-label">{edge.weight} scenes</span>
                    {edge.dialogueExchanges > 0 && (
                      <span className="detail-label">{edge.dialogueExchanges} exchanges</span>
                    )}
                  </div>
                  <div className="category-bar" style={{ height: '4px' }}>
                    <div className="category-bar-fill" style={{
                      width: `${pct}%`,
                      background: 'var(--accent-blue)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Uniqueness */}
      {characters[0]?.voiceScore != null && (
        <div className="glass-panel voice-panel">
          <h3 style={{ marginBottom: '1rem' }}>
            <AudioWaveform size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#9b59b6' }} />
            Voice Uniqueness
          </h3>
          <div className="voice-list">
            {(characters as any[])
              .filter((c: any) => c.role !== 'Minor')
              .map((char: any) => (
              <div key={char.name} className="voice-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{char.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {char.avgWordsPerLine} wpl / {char.vocabularyRichness} richness
                  </span>
                </div>
                <div className="category-bar">
                  <div className="category-bar-fill" style={{
                    width: `${char.voiceScore}%`,
                    background: char.voiceScore >= 60 ? '#9b59b6' : char.voiceScore >= 30 ? '#f39c12' : '#7f8c8d',
                  }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                  {char.voiceScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diversity Metrics */}
      {diversityMetrics && (
        <div className="glass-panel diversity-panel">
          <h3 style={{ marginBottom: '1rem' }}>
            <PieChart size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#2ecc71' }} />
            Dialogue Distribution
          </h3>
          <div className="diversity-stats">
            <div className="diversity-stat-item">
              <div className="diversity-donut" style={{
                background: `conic-gradient(#b8941f 0% ${diversityMetrics.speakingRoleDistribution.top1Pct}%, #e0e0e0 ${diversityMetrics.speakingRoleDistribution.top1Pct}% 100%)`
              }}>
                <span className="diversity-donut-label">{diversityMetrics.speakingRoleDistribution.top1Pct}%</span>
              </div>
              <span className="detail-label">Lead Share</span>
            </div>
            <div className="diversity-stat-item">
              <div className="diversity-donut" style={{
                background: `conic-gradient(#005bc0 0% ${diversityMetrics.speakingRoleDistribution.top3Pct}%, #e0e0e0 ${diversityMetrics.speakingRoleDistribution.top3Pct}% 100%)`
              }}>
                <span className="diversity-donut-label">{diversityMetrics.speakingRoleDistribution.top3Pct}%</span>
              </div>
              <span className="detail-label">Top 3 Share</span>
            </div>
            <div className="diversity-stat-item">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{diversityMetrics.centralityGap}</div>
                <span className="detail-label">Centrality Gap</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
