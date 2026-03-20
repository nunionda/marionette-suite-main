'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Film, Users, TrendingUp, Activity, Upload, FileText, Loader, Clock, AlertCircle, BarChart3, Shield, Star, Download, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import './dashboard.css';

type ViewMode = 'idle' | 'analyzing' | 'viewing';
type Strategy = 'auto' | 'fast' | 'deep' | 'custom';
type ProviderChoice = 'gemini' | 'anthropic' | 'openai' | 'mock';

const STRATEGIES = [
  { name: 'auto' as Strategy, label: 'Auto', desc: 'Best available + fallback' },
  { name: 'fast' as Strategy, label: 'Fast', desc: 'Gemini Flash (low cost)' },
  { name: 'deep' as Strategy, label: 'Deep Analysis', desc: 'Claude + Gemini hybrid' },
  { name: 'custom' as Strategy, label: 'Custom', desc: 'Pick per engine' },
];

const ENGINE_LABELS: Record<string, string> = {
  beatSheet: 'Beat Sheet',
  emotion: 'Emotion',
  rating: 'Rating',
  roi: 'ROI Prediction',
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Gemini',
  anthropic: 'Claude',
  openai: 'GPT-4o',
  mock: 'Mock',
};

export default function Dashboard() {
  const [mode, setMode] = useState<ViewMode>('idle');
  const [data, setData] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [movieId, setMovieId] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [strategy, setStrategy] = useState<Strategy>('auto');
  const [customProviders, setCustomProviders] = useState<Record<string, ProviderChoice>>({
    beatSheet: 'gemini',
    emotion: 'gemini',
    rating: 'gemini',
    roi: 'gemini',
  });
  const [availableProviders, setAvailableProviders] = useState<Record<string, boolean>>({});
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchReportHistory();
    fetch('http://localhost:4005/providers')
      .then(r => r.json())
      .then(d => setAvailableProviders(d.available || {}))
      .catch(() => {});
  }, []);

  async function fetchReportHistory() {
    try {
      const res = await fetch('http://localhost:4005/reports?pageSize=10');
      if (res.ok) {
        const result = await res.json();
        setReports(result.data || []);
      }
    } catch {
      // silently fail — history is optional
    }
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    setMode('analyzing');
    setUploadError(null);

    try {
      const isPdf = selectedFile.name.endsWith('.pdf');
      let bodyPayload: Record<string, unknown>;

      if (isPdf) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), '')
        );
        bodyPayload = { scriptBase64: base64, isPdf: true, movieId: movieId.trim() || undefined };
      } else {
        const scriptText = await selectedFile.text();
        bodyPayload = { scriptText, movieId: movieId.trim() || undefined };
      }

      bodyPayload.strategy = strategy;
      if (strategy === 'custom') {
        bodyPayload.customProviders = customProviders;
      }

      const res = await fetch('http://localhost:4005/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Analysis failed (${res.status}): ${errBody}`);
      }

      const result = await res.json();
      setData(result);
      setMode('viewing');
      fetchReportHistory();
    } catch (err: any) {
      setUploadError(err.message || 'Analysis failed. Is the API running?');
      setMode('idle');
    }
  }

  async function loadReport(scriptId: string) {
    setMode('analyzing');
    setUploadError(null);
    try {
      const res = await fetch(`http://localhost:4005/report/${scriptId}`);
      if (!res.ok) throw new Error('Failed to load report');
      const result = await res.json();
      setData(result);
      setMode('viewing');
    } catch (err: any) {
      setUploadError(err.message);
      setMode('idle');
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.fountain') || file.name.endsWith('.txt') || file.name.endsWith('.pdf'))) {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError('Please drop a .fountain, .txt, or .pdf file');
    }
  }

  function handleFileSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.fountain,.txt,.pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setUploadError(null);
      }
    };
    input.click();
  }

  function resetToIdle() {
    setMode('idle');
    setData(null);
    setSelectedFile(null);
    setUploadError(null);
    setMovieId('');
  }

  return (
    <div className="dashboard-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Script Intelligence</h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {data ? `Project ID: ${data.scriptId}` : 'Upload a screenplay to begin analysis'}
          </p>
        </div>
        {data && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="badge badge-r">Rating: {data.summary.predictedRating}</div>
            <div className={`badge ${data.summary.predictedRoi === 'Blockbuster' ? 'badge-blockbuster' : 'badge-hit'}`}>
              ROI: {data.summary.predictedRoi}
            </div>
            <button className="btn-export no-print" onClick={() => window.print()}>
              <Download size={16} /> Export PDF
            </button>
          </div>
        )}
      </header>

      {data?.warning && (
        <div className="warning-banner">
          <AlertCircle size={16} /> {data.warning}
        </div>
      )}

      {/* Provider attribution bar */}
      {data?.providers && (
        <div className="provider-bar">
          {data.strategy && <span className="provider-strategy">{data.strategy.toUpperCase()}</span>}
          {Object.entries(data.providers).map(([engine, prov]: [string, any]) => (
            <span key={engine} className="provider-badge-item">
              <span className="provider-engine">{ENGINE_LABELS[engine] || engine}</span>
              <span className={`provider-name provider-${prov}`}>{PROVIDER_LABELS[prov] || prov}</span>
            </span>
          ))}
        </div>
      )}

      {/* Upload + History Row */}
      <div className="upload-row">
        <div className="glass-panel upload-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              <Upload size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Analyze New Script
            </h3>
            {mode === 'viewing' && (
              <button className="btn-reset" onClick={resetToIdle}>New Analysis</button>
            )}
          </div>

          {mode !== 'viewing' && (
            <>
              <div
                className={`drop-zone ${dragOver ? 'drop-zone-active' : ''} ${selectedFile ? 'drop-zone-selected' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={handleFileSelect}
              >
                {selectedFile ? (
                  <div className="file-info">
                    <FileText size={24} style={{ color: 'var(--accent-gold)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                    <Upload size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div>Drag & drop a <strong>.fountain</strong>, <strong>.txt</strong>, or <strong>.pdf</strong> file</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>or click to browse</div>
                  </div>
                )}
              </div>

              {/* Strategy Selector */}
              <div className="strategy-row">
                {STRATEGIES.map(s => (
                  <button
                    key={s.name}
                    className={`strategy-pill ${strategy === s.name ? 'active' : ''}`}
                    onClick={() => setStrategy(s.name)}
                  >
                    <span className="pill-label">{s.label}</span>
                    <span className="pill-desc">{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Custom Provider Grid */}
              {strategy === 'custom' && (
                <div className="custom-grid">
                  {(['beatSheet', 'emotion', 'rating', 'roi'] as const).map(engine => (
                    <div key={engine} className="custom-grid-item">
                      <label>{ENGINE_LABELS[engine]}</label>
                      <select
                        className="select-glass"
                        value={customProviders[engine]}
                        onChange={(e) => setCustomProviders(prev => ({ ...prev, [engine]: e.target.value as ProviderChoice }))}
                      >
                        {(['gemini', 'anthropic', 'openai', 'mock'] as const).map(p => (
                          <option key={p} value={p} disabled={p !== 'mock' && !availableProviders[p]}>
                            {PROVIDER_LABELS[p]}{p !== 'mock' && !availableProviders[p] ? ' (no key)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Movie ID / Title (optional)"
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  className="input-glass"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-analyze"
                  disabled={!selectedFile || mode === 'analyzing'}
                  onClick={handleAnalyze}
                >
                  {mode === 'analyzing' ? (
                    <><Loader size={16} className="spin" /> Analyzing...</>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>

              {uploadError && (
                <div className="upload-error">
                  <AlertCircle size={16} /> {uploadError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="glass-panel history-panel">
          <h3 style={{ margin: 0 }}>
            <Clock size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Recent Reports
          </h3>
          <div style={{ marginTop: '1rem', maxHeight: '220px', overflowY: 'auto' }}>
            {reports.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem', padding: '1rem 0' }}>
                No reports yet
              </div>
            ) : (
              reports.map((report: any) => (
                <div
                  key={report.scriptId}
                  className="history-item"
                  onClick={() => loadReport(report.scriptId)}
                >
                  <FileText size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {report.scriptId}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {report.summary.predictedRating} / {report.summary.predictedRoi}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Script Coverage Report */}
      {data?.coverage && (
        <div className="coverage-section">
          <div className="glass-panel coverage-header">
            <div className="coverage-title-row">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Script Coverage Report</h2>
                <p style={{ color: 'var(--text-dim)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                  {data.coverage.title} — {data.coverage.genre}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="score-circle">
                  <span className="score-value">{data.coverage.overallScore}</span>
                  <span className="score-label">/ 100</span>
                </div>
                <span className={`verdict-badge verdict-${data.coverage.verdict.toLowerCase()}`}>
                  {data.coverage.verdict}
                </span>
              </div>
            </div>
            {data.coverage.logline && (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', margin: '0.75rem 0 0', fontSize: '0.9rem' }}>
                &ldquo;{data.coverage.logline}&rdquo;
              </p>
            )}
          </div>

          {/* Category Score Bars */}
          <div className="coverage-categories">
            {data.coverage.categories?.map((cat: any, idx: number) => (
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
          {data.coverage.synopsis && (
            <div className="glass-panel coverage-synopsis">
              <h3 style={{ margin: '0 0 0.5rem' }}>Synopsis</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{data.coverage.synopsis}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {(data.coverage.strengths?.length > 0 || data.coverage.weaknesses?.length > 0) && (
            <div className="strengths-weaknesses">
              <div className="glass-panel sw-col">
                <h3 style={{ margin: '0 0 0.75rem', color: '#2ecc71' }}>
                  <CheckCircle size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  Strengths
                </h3>
                <ul className="sw-list">
                  {data.coverage.strengths?.map((s: string, i: number) => (
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
                  {data.coverage.weaknesses?.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {data.coverage.recommendation && (
            <div className="glass-panel recommendation-box">
              <h3 style={{ margin: '0 0 0.5rem' }}>Analyst Recommendation</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{data.coverage.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* Results Dashboard */}
      {data && (
        <div className="grid-layout">
          <div className="glass-panel stat-card">
            <Film className="icon" style={{ color: 'var(--accent-gold)' }} />
            <h3>Protagonist</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.summary.protagonist}</p>
          </div>
          <div className="glass-panel stat-card">
            <TrendingUp className="icon" style={{ color: '#27ae60' }} />
            <h3>ROI Multiplier</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {data.predictions?.roi?.predictedMultiplier
                ? `${data.predictions.roi.predictedMultiplier}x`
                : '—'}
            </p>
          </div>
          <div className="glass-panel stat-card">
            <Users className="icon" style={{ color: 'var(--accent-blue)' }} />
            <h3>Cast Members</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.characterNetwork.length}</p>
          </div>
          <div className="glass-panel stat-card">
            <Activity className="icon" style={{ color: '#e74c3c' }} />
            <h3>Scenes</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.features?.sceneCount ?? '—'}</p>
          </div>

          <div className="glass-panel main-chart">
            <h3 style={{ marginBottom: '1.5rem' }}>Emotional Valence Arc</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.emotionGraph}>
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

          <div className="glass-panel sidebar-panel">
            <h3>Character Prominence</h3>
            <div style={{ marginTop: '1rem' }}>
              {data.characterNetwork.map((char: any) => (
                <div key={char.name} className="character-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{char.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{char.role}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{char.totalLines || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Analysis */}
          {data.predictions?.roi && (
            <div className="glass-panel detail-panel-wide">
              <h3>
                <TrendingUp size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#27ae60' }} />
                ROI Analysis
              </h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-label">Tier</span>
                  <span className={`badge ${data.predictions.roi.tier === 'Blockbuster' ? 'badge-blockbuster' : data.predictions.roi.tier === 'Hit' ? 'badge-hit' : 'badge-flop'}`}>
                    {data.predictions.roi.tier}
                  </span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">Multiplier</span>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{data.predictions.roi.predictedMultiplier}x</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">Confidence</span>
                  <span style={{ fontWeight: 600 }}>{Math.round((data.predictions.roi.confidence || 0) * 100)}%</span>
                </div>
              </div>
              {data.predictions.roi.reasoning && (
                <p className="detail-reasoning">{data.predictions.roi.reasoning}</p>
              )}
            </div>
          )}

          {/* Content Rating */}
          {data.predictions?.rating && (
            <div className="glass-panel detail-panel-narrow">
              <h3>
                <Shield size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#c0392b' }} />
                Content Rating
              </h3>
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <span className="rating-badge">{data.predictions.rating.rating}</span>
                {data.predictions.rating.confidence != null && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                    Confidence: {Math.round(data.predictions.rating.confidence * 100)}%
                  </div>
                )}
              </div>
              {data.predictions.rating.reasons?.length > 0 && (
                <ul className="rating-reasons">
                  {data.predictions.rating.reasons.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comparable Films */}
          {data.predictions?.comps?.length > 0 && (
            <div className="glass-panel comps-panel">
              <h3>
                <Star size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-gold)' }} />
                Comparable Films
              </h3>
              <div className="comps-grid">
                {data.predictions.comps.map((comp: any, idx: number) => (
                  <div key={idx} className="comp-card">
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{comp.title}</div>
                    <div className="comp-stat">
                      <span className="detail-label">Similarity</span>
                      <span>{Math.round(comp.similarityScore * 100)}%</span>
                    </div>
                    {comp.marketPerformance && (
                      <>
                        <div className="comp-stat">
                          <span className="detail-label">Budget</span>
                          <span>${(comp.marketPerformance.budget / 1e6).toFixed(0)}M</span>
                        </div>
                        <div className="comp-stat">
                          <span className="detail-label">Revenue</span>
                          <span>${(comp.marketPerformance.revenue / 1e6).toFixed(0)}M</span>
                        </div>
                        <div className="comp-stat">
                          <span className="detail-label">ROI</span>
                          <span style={{ color: '#2ecc71', fontWeight: 600 }}>{comp.marketPerformance.roi}x</span>
                        </div>
                      </>
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

          {/* Beat Sheet */}
          <div className="timeline-container">
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem' }}>
                <BarChart3 size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
                Narrative Beat Sheet
              </h3>
              <div style={{ display: 'flex' }}>
                {data.beatSheet.map((beat: any, idx: number) => (
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
        </div>
      )}
    </div>
  );
}
