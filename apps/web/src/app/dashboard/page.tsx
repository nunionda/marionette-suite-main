'use client';

import React, { useState, useEffect } from 'react';
import { Film, Users, TrendingUp, Activity, AlertCircle, Download, Globe } from 'lucide-react';
import './dashboard.css';

import UploadPanel, { ENGINE_LABELS, PROVIDER_LABELS } from './components/UploadPanel';
import type { Strategy, ProviderChoice, ViewMode } from './components/UploadPanel';
import CoverageReport from './components/CoverageReport';
import ProductionBreakdown from './components/ProductionBreakdown';
import EmotionChart from './components/EmotionChart';
import CharacterIntelligence from './components/CharacterIntelligence';
import NarrativeArcPanel from './components/NarrativeArcPanel';
import MarketPredictions from './components/MarketPredictions';
import BeatSheetTimeline from './components/BeatSheetTimeline';
import SectionNav from './components/SectionNav';
import AnalysisProgress from './components/AnalysisProgress';
import ReportCover from './components/ReportCover';

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
    coverage: 'gemini',
    vfx: 'gemini',
    trope: 'gemini',
  });
  const [availableProviders, setAvailableProviders] = useState<Record<string, boolean>>({});
  const [locale, setLocale] = useState<'en' | 'ko'>('en');

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

      bodyPayload.fileName = selectedFile.name;
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
      const res = await fetch(`http://localhost:4005/report/${encodeURIComponent(scriptId)}`);
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

  const ko = locale === 'ko';

  return (
    <main className="dashboard-container" aria-label="Script Intelligence Dashboard">
      <a href="#stats" className="skip-link">Skip to results</a>
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{ko ? '시나리오 분석' : 'Script Intelligence'}</h1>
          <p className="dashboard-subtitle">
            {data ? `${ko ? '프로젝트' : 'Project'} ID: ${data.scriptId}` : (ko ? '시나리오를 업로드하여 분석을 시작하세요' : 'Upload a screenplay to begin analysis')}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-locale no-print"
            onClick={() => setLocale(prev => prev === 'en' ? 'ko' : 'en')}
            aria-label={ko ? '영어로 전환' : 'Switch to Korean'}
            title={ko ? 'Switch to English' : '한국어로 전환'}
          >
            <Globe size={16} />
            <span>{ko ? 'EN' : 'KO'}</span>
          </button>
          {data && (
            <div className="header-badges">
              <div className="badge badge-r">{ko ? '등급' : 'Rating'}: {data.summary.predictedRating}</div>
              <div className={`badge ${data.summary.predictedRoi === 'Blockbuster' ? 'badge-blockbuster' : 'badge-hit'}`}>
                ROI: {data.summary.predictedRoi}
              </div>
              <button className="btn-export no-print" onClick={() => window.print()}>
                <Download size={16} /> {ko ? 'PDF 내보내기' : 'Export PDF'}
              </button>
            </div>
          )}
        </div>
      </header>

      {data?.warning && (
        <div className="warning-banner">
          <AlertCircle size={16} />
          <div>
            <strong>{ko ? '주의' : 'Warning'}:</strong>{' '}
            {ko
              ? 'Mock 데이터가 사용된 항목이 있습니다. 해당 결과는 실제 AI 분석이 아닌 샘플 데이터입니다.'
              : data.warning}
            {data.mockEngines?.length > 0 && (
              <span className="mock-engines">
                {' '}({data.mockEngines.join(', ')})
              </span>
            )}
          </div>
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

      {/* Upload + History */}
      <UploadPanel
        mode={mode}
        selectedFile={selectedFile}
        movieId={movieId}
        uploadError={uploadError}
        dragOver={dragOver}
        strategy={strategy}
        customProviders={customProviders}
        availableProviders={availableProviders}
        reports={reports}
        locale={locale}
        onSetDragOver={setDragOver}
        onFileDrop={handleFileDrop}
        onFileSelect={handleFileSelect}
        onMovieIdChange={setMovieId}
        onStrategyChange={setStrategy}
        onCustomProviderChange={(engine, provider) =>
          setCustomProviders(prev => ({ ...prev, [engine]: provider }))
        }
        onAnalyze={handleAnalyze}
        onReset={resetToIdle}
        onLoadReport={loadReport}
      />

      {/* Loading Progress */}
      {mode === 'analyzing' && <AnalysisProgress />}

      {/* Section Navigation */}
      {data && <SectionNav />}

      {/* Print-only Report Cover */}
      {data && <ReportCover data={data} />}

      {/* Script Coverage Report */}
      {data?.coverage && (
        <section id="coverage">
          <div className="print-section-header print-only">
            <span className="print-section-number">1</span> Script Coverage Report
          </div>
          <CoverageReport coverage={data.coverage} locale={locale} />
        </section>
      )}

      {/* Production Breakdown */}
      {data?.production && (
        <section id="production">
          <div className="print-section-header print-only">
            <span className="print-section-number">2</span> Production Feasibility
          </div>
          <ProductionBreakdown production={data.production} locale={locale} />
        </section>
      )}

      {/* Results Dashboard */}
      {data && (
        <div className="grid-layout">
          <div className="print-section-header print-only" style={{ width: '100%' }}>
            <span className="print-section-number">3</span> Overview &amp; Emotional Arc
          </div>

          <div id="stats" className="glass-panel stat-card">
            <Film className="icon" style={{ color: 'var(--accent-gold)' }} />
            <h3>{ko ? '주인공' : 'Protagonist'}</h3>
            <p className="stat-value">{data.summary.protagonist}</p>
          </div>
          <div className="glass-panel stat-card">
            <TrendingUp className="icon" style={{ color: 'var(--color-success-dark)' }} />
            <h3>{ko ? 'ROI 배수' : 'ROI Multiplier'}</h3>
            <p className="stat-value">
              {data.predictions?.roi?.predictedMultiplier
                ? `${data.predictions.roi.predictedMultiplier}x`
                : '—'}
            </p>
          </div>
          <div className="glass-panel stat-card">
            <Users className="icon" style={{ color: 'var(--accent-blue)' }} />
            <h3>{ko ? '등장인물' : 'Cast Members'}</h3>
            <p className="stat-value">
              {(data.characterNetwork?.characters ?? data.characterNetwork)?.length ?? 0}
            </p>
          </div>
          <div className="glass-panel stat-card">
            <Activity className="icon" style={{ color: 'var(--color-danger)' }} />
            <h3>{ko ? '장면 수' : 'Scenes'}</h3>
            <p className="stat-value">{data.features?.sceneCount ?? '—'}</p>
          </div>

          <EmotionChart emotionGraph={data.emotionGraph} locale={locale} />

          <div id="characters" style={{ display: 'contents' }}>
            <div className="print-section-header print-only" style={{ width: '100%' }}>
              <span className="print-section-number">4</span> Character Intelligence
            </div>
            <CharacterIntelligence characterNetwork={data.characterNetwork} locale={locale} />
          </div>

          {data.narrativeArc && (
            <div id="arc" style={{ display: 'contents' }}>
              <div className="print-section-header print-only" style={{ width: '100%' }}>
                <span className="print-section-number">5</span> Narrative Arc
              </div>
              <NarrativeArcPanel narrativeArc={data.narrativeArc} locale={locale} />
            </div>
          )}

          <div id="market" style={{ display: 'contents' }}>
            <div className="print-section-header print-only" style={{ width: '100%' }}>
              <span className="print-section-number">6</span> Market Predictions
            </div>
            <MarketPredictions predictions={data.predictions} tropes={data.tropes} locale={locale} />
          </div>

          <div id="beats" style={{ display: 'contents' }}>
            <div className="print-section-header print-only" style={{ width: '100%' }}>
              <span className="print-section-number">7</span> Narrative Beat Sheet
            </div>
            <BeatSheetTimeline beatSheet={data.beatSheet} locale={locale} />
          </div>
        </div>
      )}
    </main>
  );
}
