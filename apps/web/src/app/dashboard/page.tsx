'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Film, Users, TrendingUp, Activity, Upload, FileText, Loader, Clock, AlertCircle } from 'lucide-react';
import './dashboard.css';

type ViewMode = 'idle' | 'analyzing' | 'viewing';

export default function Dashboard() {
  const [mode, setMode] = useState<ViewMode>('idle');
  const [data, setData] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [movieId, setMovieId] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReportHistory();
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="badge badge-r">Rating: {data.summary.predictedRating}</div>
            <div className={`badge ${data.summary.predictedRoi === 'Blockbuster' ? 'badge-blockbuster' : 'badge-hit'}`}>
              ROI: {data.summary.predictedRoi}
            </div>
          </div>
        )}
      </header>

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
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
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

          <div className="timeline-container">
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem' }}>Narrative Beat Sheet</h3>
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
