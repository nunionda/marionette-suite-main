'use client';

import React from 'react';
import { TrendingUp, Shield, Hash, Star } from 'lucide-react';

interface MarketPredictionsProps {
  predictions: any;
  tropes?: string[];
  locale?: 'en' | 'ko';
}

export default function MarketPredictions({ predictions, tropes, locale = 'en' }: MarketPredictionsProps) {
  const ko = locale === 'ko';
  return (
    <>
      {/* ROI Analysis */}
      {predictions?.roi && (
        <div className="glass-panel detail-panel-wide">
          <h3>
            <TrendingUp size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#27ae60' }} />
            {ko ? 'ROI 분석' : 'ROI Analysis'}
          </h3>
          <div className="detail-metrics">
            <div className="detail-metric">
              <span className="detail-label">{ko ? '등급' : 'Tier'}</span>
              <span className={`badge ${predictions.roi.tier === 'Blockbuster' ? 'badge-blockbuster' : predictions.roi.tier === 'Hit' ? 'badge-hit' : 'badge-flop'}`}>
                {predictions.roi.tier}
              </span>
            </div>
            <div className="detail-metric">
              <span className="detail-label">{ko ? '배수' : 'Multiplier'}</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{predictions.roi.predictedMultiplier}x</span>
            </div>
            <div className="detail-metric">
              <span className="detail-label">{ko ? '신뢰도' : 'Confidence'}</span>
              <span style={{ fontWeight: 600 }}>{Math.round((predictions.roi.confidence || 0) * 100)}%</span>
            </div>
          </div>
          {predictions.roi.reasoning && (
            <p className="detail-reasoning">{predictions.roi.reasoning}</p>
          )}
        </div>
      )}

      {/* Content Rating */}
      {predictions?.rating && (
        <div className="glass-panel detail-panel-narrow">
          <h3>
            <Shield size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#c0392b' }} />
            {ko ? '콘텐츠 등급' : 'Content Rating'}
          </h3>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <span className="rating-badge">{predictions.rating.rating}</span>
            {predictions.rating.confidence != null && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                {ko ? '신뢰도' : 'Confidence'}: {Math.round(predictions.rating.confidence * 100)}%
              </div>
            )}
          </div>
          {predictions.rating.reasons?.length > 0 && (
            <ul className="rating-reasons">
              {predictions.rating.reasons.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Trope Tag Cloud */}
      {tropes && tropes.length > 0 && (
        <div className="glass-panel trope-panel">
          <h3>
            <Hash size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#e67e22' }} />
            {ko ? '서사 트로프' : 'Narrative Tropes'}
          </h3>
          <div className="trope-cloud">
            {tropes.map((trope: string, i: number) => (
              <span key={i} className="trope-tag">{trope}</span>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Films */}
      {predictions?.comps?.length > 0 && (
        <div className="glass-panel comps-panel">
          <h3>
            <Star size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-gold)' }} />
            {ko ? `비교 작품 (${predictions.comps.length})` : `Comparable Films (${predictions.comps.length})`}
          </h3>
          <div className="comps-grid">
            {predictions.comps.map((comp: any, idx: number) => (
              <div key={idx} className="comp-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{comp.title}</span>
                  <span className="similarity-badge">{Math.round(comp.similarityScore * 100)}%</span>
                </div>
                {comp.marketPerformance && (
                  <div className="comp-stats-row">
                    <div className="comp-stat">
                      <span className="detail-label">{ko ? '예산' : 'Budget'}</span>
                      <span>${(comp.marketPerformance.budget / 1e6).toFixed(0)}M</span>
                    </div>
                    <div className="comp-stat">
                      <span className="detail-label">{ko ? '수익' : 'Revenue'}</span>
                      <span>${(comp.marketPerformance.revenue / 1e6).toFixed(0)}M</span>
                    </div>
                    <div className="comp-stat">
                      <span className="detail-label">ROI</span>
                      <span style={{ color: '#2ecc71', fontWeight: 600 }}>{comp.marketPerformance.roi}x</span>
                    </div>
                  </div>
                )}
                {comp.sharedTraits?.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {comp.sharedTraits.map((t: string, i: number) => (
                      <span key={i} className="trait-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
