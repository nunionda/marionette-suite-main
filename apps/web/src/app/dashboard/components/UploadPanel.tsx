'use client';

import React from 'react';
import { Upload, FileText, Loader, Clock, AlertCircle } from 'lucide-react';

type Strategy = 'auto' | 'fast' | 'deep' | 'custom';
type ProviderChoice = 'gemini' | 'anthropic' | 'openai' | 'mock';
type ViewMode = 'idle' | 'analyzing' | 'viewing';

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
  coverage: 'Coverage',
  vfx: 'VFX',
  trope: 'Trope',
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Gemini',
  anthropic: 'Claude',
  openai: 'GPT-4o',
  mock: 'Mock',
};

interface UploadPanelProps {
  mode: ViewMode;
  selectedFile: File | null;
  movieId: string;
  uploadError: string | null;
  dragOver: boolean;
  strategy: Strategy;
  customProviders: Record<string, ProviderChoice>;
  availableProviders: Record<string, boolean>;
  reports: any[];
  locale: 'en' | 'ko';
  onSetDragOver: (v: boolean) => void;
  onFileDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  onMovieIdChange: (v: string) => void;
  onStrategyChange: (s: Strategy) => void;
  onCustomProviderChange: (engine: string, provider: ProviderChoice) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onLoadReport: (scriptId: string) => void;
}

export { ENGINE_LABELS, PROVIDER_LABELS };
export type { Strategy, ProviderChoice, ViewMode };

export default function UploadPanel({
  mode, selectedFile, movieId, uploadError, dragOver, strategy,
  customProviders, availableProviders, reports, locale,
  onSetDragOver, onFileDrop, onFileSelect, onMovieIdChange,
  onStrategyChange, onCustomProviderChange, onAnalyze, onReset, onLoadReport,
}: UploadPanelProps) {
  const t = locale === 'ko';
  return (
    <div className="upload-row">
      <div className="glass-panel upload-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>
            <Upload size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            {t ? '새 시나리오 분석' : 'Analyze New Script'}
          </h3>
          {mode === 'viewing' && (
            <button className="btn-reset" onClick={onReset}>{t ? '새 분석' : 'New Analysis'}</button>
          )}
        </div>

        {mode !== 'viewing' && (
          <>
            <div
              className={`drop-zone ${dragOver ? 'drop-zone-active' : ''} ${selectedFile ? 'drop-zone-selected' : ''}`}
              onDragOver={(e) => { e.preventDefault(); onSetDragOver(true); }}
              onDragLeave={() => onSetDragOver(false)}
              onDrop={onFileDrop}
              onClick={onFileSelect}
              role="button"
              tabIndex={0}
              aria-label={selectedFile ? `Selected file: ${selectedFile.name}` : 'Drop zone: click or drag to upload screenplay'}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFileSelect(); } }}
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
                  <div>{t ? <><strong>.fountain</strong>, <strong>.txt</strong>, 또는 <strong>.pdf</strong> 파일을 드래그 앤 드롭</> : <>Drag & drop a <strong>.fountain</strong>, <strong>.txt</strong>, or <strong>.pdf</strong> file</>}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{t ? '또는 클릭하여 찾아보기' : 'or click to browse'}</div>
                </div>
              )}
            </div>

            {/* Strategy Selector */}
            <div className="strategy-row">
              {STRATEGIES.map(s => (
                <button
                  key={s.name}
                  className={`strategy-pill ${strategy === s.name ? 'active' : ''}`}
                  onClick={() => onStrategyChange(s.name)}
                >
                  <span className="pill-label">{s.label}</span>
                  <span className="pill-desc">{s.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Provider Grid */}
            {strategy === 'custom' && (
              <div className="custom-grid">
                {(['beatSheet', 'emotion', 'rating', 'roi', 'coverage', 'vfx', 'trope'] as const).map(engine => (
                  <div key={engine} className="custom-grid-item">
                    <label>{ENGINE_LABELS[engine]}</label>
                    <select
                      className="select-glass"
                      value={customProviders[engine]}
                      onChange={(e) => onCustomProviderChange(engine, e.target.value as ProviderChoice)}
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
                placeholder={t ? '영화 ID / 제목 (선택사항)' : 'Movie ID / Title (optional)'}
                value={movieId}
                onChange={(e) => onMovieIdChange(e.target.value)}
                className="input-glass"
                style={{ flex: 1 }}
              />
              <button
                className="btn-analyze"
                disabled={!selectedFile || mode === 'analyzing'}
                onClick={onAnalyze}
              >
                {mode === 'analyzing' ? (
                  <><Loader size={16} className="spin" /> {t ? '분석 중...' : 'Analyzing...'}</>
                ) : (
                  t ? '분석' : 'Analyze'
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
          {t ? '최근 리포트' : 'Recent Reports'}
        </h3>
        <div style={{ marginTop: '1rem', maxHeight: '220px', overflowY: 'auto' }}>
          {reports.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem', padding: '1rem 0' }}>
              {t ? '리포트 없음' : 'No reports yet'}
            </div>
          ) : (
            reports.map((report: any) => (
              <div
                key={report.scriptId}
                className="history-item"
                onClick={() => onLoadReport(report.scriptId)}
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
  );
}
