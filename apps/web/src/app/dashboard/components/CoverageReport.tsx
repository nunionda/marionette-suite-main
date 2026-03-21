'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CoverageReportProps {
  coverage: any;
}

export default function CoverageReport({ coverage }: CoverageReportProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  return (
    <div className="coverage-section">
      <div className="glass-panel coverage-header">
        <div className="coverage-title-row">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Script Coverage Report</h2>
            <p style={{ color: 'var(--text-dim)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
              {coverage.title} — {coverage.genre}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="score-circle">
              <span className="score-value">{coverage.overallScore}</span>
              <span className="score-label">/ 100</span>
            </div>
            <span className={`verdict-badge verdict-${coverage.verdict.toLowerCase()}`}>
              {coverage.verdict}
            </span>
          </div>
        </div>
        {coverage.logline && (
          <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', margin: '0.75rem 0 0', fontSize: '0.9rem' }}>
            &ldquo;{coverage.logline}&rdquo;
          </p>
        )}
      </div>

      {/* Category Score Bars */}
      <div className="coverage-categories">
        {coverage.categories?.map((cat: any, idx: number) => (
          <div key={idx} className="glass-panel coverage-category-card">
            <div
              className="category-header"
              onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{cat.score}</span>
                    {expandedCategory === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <div className="category-bar">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${cat.score}%`,
                      background: cat.score >= 80 ? '#2ecc71' : cat.score >= 60 ? '#f39c12' : '#e74c3c',
                    }}
                  />
                </div>
              </div>
            </div>
            {expandedCategory === idx && cat.subcategories && (
              <div className="subcategories">
                {cat.subcategories.map((sub: any, si: number) => (
                  <div key={si} className="subcategory-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{sub.name}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sub.score}</span>
                    </div>
                    <div className="category-bar" style={{ height: '4px' }}>
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${sub.score}%`,
                          background: sub.score >= 80 ? '#2ecc71' : sub.score >= 60 ? '#f39c12' : '#e74c3c',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.25rem 0 0' }}>{sub.assessment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Synopsis */}
      {coverage.synopsis && (
        <div className="glass-panel coverage-synopsis">
          <h3 style={{ margin: '0 0 0.5rem' }}>Synopsis</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{coverage.synopsis}</p>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {(coverage.strengths?.length > 0 || coverage.weaknesses?.length > 0) && (
        <div className="strengths-weaknesses">
          <div className="glass-panel sw-col">
            <h3 style={{ margin: '0 0 0.75rem', color: '#2ecc71' }}>
              <CheckCircle size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Strengths
            </h3>
            <ul className="sw-list">
              {coverage.strengths?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="glass-panel sw-col">
            <h3 style={{ margin: '0 0 0.75rem', color: '#e74c3c' }}>
              <XCircle size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Weaknesses
            </h3>
            <ul className="sw-list sw-list-weak">
              {coverage.weaknesses?.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {coverage.recommendation && (
        <div className="glass-panel recommendation-box">
          <h3 style={{ margin: '0 0 0.5rem' }}>Analyst Recommendation</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{coverage.recommendation}</p>
        </div>
      )}
    </div>
  );
}
