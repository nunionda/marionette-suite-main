import React, { useState, useEffect, useRef, useCallback } from 'react';

const RULE_TYPES = [
  // A: AI Picks
  { value: 'highlight',    label: '🔥 Highlight' },
  { value: 'performance',  label: '🎤 Performance' },
  { value: 'reaction',     label: '😮 Reaction' },
  // B: Cross-Group
  { value: 'comparison',   label: '⚔️ Group Comparison' },
  { value: 'compilation',  label: '🏆 Top Compilation' },
  // C: AI Analysis
  { value: 'analysis',     label: '🔬 AI Analysis' },
  // Other
  { value: 'interview',    label: '🎙️ Interview' },
  { value: 'broll',        label: '🎬 B-Roll' },
];

const RENDER_STATUS_COLOR = {
  queued:     'var(--text-muted)',
  processing: 'var(--status-warn)',
  done:       'var(--status-ok)',
  error:      'var(--status-error)',
};

const CANDIDATE_STATUS_COLOR = {
  pending:   'var(--text-muted)',
  rendering: 'var(--status-warn)',
  rendered:  'var(--status-ok)',
};

/** Convert absolute rawFilePath → browser-accessible URL via /output prefix. */
function rawPathToUrl(rawFilePath) {
  if (!rawFilePath) return null;
  const idx = rawFilePath.indexOf('/output/');
  return idx !== -1 ? rawFilePath.substring(idx) : null;
}

function formatTime(sec) {
  if (sec == null || isNaN(sec)) return '0:00.0';
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1);
  return `${m}:${String(s).padStart(4, '0')}`;
}

export default function CandidateEditor({ assetId, onBack }) {
  const videoRef = useRef(null);

  const [asset, setAsset]           = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [renderMap, setRenderMap]   = useState({}); // candidateId → renderJob
  const [currentTime, setCurrentTime] = useState(0);

  // Form state
  const [startSec, setStartSec]       = useState(0);
  const [endSec, setEndSec]           = useState(0);
  const [ruleType, setRuleType]       = useState('highlight');
  const [rationale, setRationale]     = useState('');
  const [contentType, setContentType] = useState('short'); // short | long
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');

  // ─── Data loading ───────────────────────────────────────────────────────

  const loadCandidates = useCallback(() => {
    fetch(`/api/candidates?assetId=${assetId}`)
      .then(r => r.json())
      .then(d => setCandidates(d.candidates || []));
  }, [assetId]);

  const loadRenderJobs = useCallback(() => {
    fetch('/api/render')
      .then(r => r.json())
      .then(d => {
        const jobs = (d.jobs || []).filter(j => j.assetId === assetId);
        const map = {};
        for (const j of jobs) map[j.candidateClipId] = j;
        setRenderMap(map);
      });
  }, [assetId]);

  useEffect(() => {
    fetch(`/api/assets/${assetId}`)
      .then(r => r.json())
      .then(setAsset);
    loadCandidates();
    loadRenderJobs();
  }, [assetId, loadCandidates, loadRenderJobs]);

  // Auto-refresh render jobs while any are processing/queued
  useEffect(() => {
    const hasActive = Object.values(renderMap).some(
      j => j.status === 'queued' || j.status === 'processing'
    );
    if (!hasActive) return;
    const t = setInterval(() => { loadRenderJobs(); loadCandidates(); }, 3000);
    return () => clearInterval(t);
  }, [renderMap, loadRenderJobs, loadCandidates]);

  // ─── Video events ────────────────────────────────────────────────────────

  const onTimeUpdate = () => {
    setCurrentTime(videoRef.current?.currentTime ?? 0);
  };

  const seekTo = (sec) => {
    if (videoRef.current) videoRef.current.currentTime = sec;
  };

  // ─── Candidate form ──────────────────────────────────────────────────────

  const duration = endSec - startSec;
  const maxSec   = contentType === 'long' ? 900 : (asset?.maxClipSeconds ?? 60);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (endSec <= startSec) {
      setFormError('End must be after Start.');
      return;
    }
    if (duration > maxSec) {
      setFormError(`Clip duration ${duration.toFixed(1)}s exceeds max ${maxSec}s for this source.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, startSec, endSec, ruleType, rationale, contentType }),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error || 'Failed to create candidate');
        return;
      }
      setRationale('');
      loadCandidates();
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render trigger ──────────────────────────────────────────────────────

  const handleRender = async (candidateId) => {
    await fetch(`/api/candidates/${candidateId}/render`, { method: 'POST' });
    loadRenderJobs();
    loadCandidates();
  };

  const handleDeleteCandidate = async (candidateId) => {
    await fetch(`/api/candidates/${candidateId}`, { method: 'DELETE' });
    loadCandidates();
  };

  // ─── Styles ──────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '6px 10px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '0.6rem',
    color: 'var(--gold)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
    marginBottom: 4,
    display: 'block',
  };

  const videoUrl = rawPathToUrl(asset?.rawFilePath);

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '4px 10px', fontSize: '0.65rem' }}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, color: 'var(--text-bright)' }}>
            Clip Editor
          </h2>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {asset?.title || `Asset #${assetId}`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: Video + Form */}
        <div>
          {/* Video Player */}
          <div className="glass" style={{ marginBottom: 16, overflow: 'hidden' }}>
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onTimeUpdate={onTimeUpdate}
                style={{ width: '100%', display: 'block', maxHeight: 340, background: '#000' }}
              />
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                {asset ? 'Video not available (not downloaded?)' : 'Loading…'}
              </div>
            )}

            {/* Current time + Set buttons */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--gold)', minWidth: 60 }}>
                {formatTime(currentTime)}
              </span>
              <button
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                onClick={() => setStartSec(parseFloat(currentTime.toFixed(1)))}
              >
                Set Start
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                onClick={() => setEndSec(parseFloat(currentTime.toFixed(1)))}
              >
                Set End
              </button>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                {duration > 0 ? `${duration.toFixed(1)}s / max ${maxSec}s` : ''}
              </span>
            </div>
          </div>

          {/* Candidate form */}
          <form className="glass" style={{ padding: '16px' }} onSubmit={handleSubmit}>
            <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: 12 }}>
              NEW CANDIDATE CLIP
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>START (sec)</label>
                <input
                  style={inputStyle} type="number" step="0.1" min="0"
                  value={startSec}
                  onChange={e => setStartSec(parseFloat(e.target.value) || 0)}
                />
                {startSec > 0 && (
                  <button type="button" className="btn-secondary"
                    style={{ marginTop: 4, padding: '2px 6px', fontSize: '0.55rem', width: '100%' }}
                    onClick={() => seekTo(startSec)}>
                    Preview ↗
                  </button>
                )}
              </div>
              <div>
                <label style={labelStyle}>END (sec)</label>
                <input
                  style={inputStyle} type="number" step="0.1" min="0"
                  value={endSec}
                  onChange={e => setEndSec(parseFloat(e.target.value) || 0)}
                />
                {endSec > 0 && (
                  <button type="button" className="btn-secondary"
                    style={{ marginTop: 4, padding: '2px 6px', fontSize: '0.55rem', width: '100%' }}
                    onClick={() => seekTo(endSec)}>
                    Preview ↗
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>CONTENT TYPE</label>
                <select style={inputStyle} value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="short">Short (9:16)</option>
                  <option value="long">Long-form (16:9)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>RULE TYPE</label>
                <select style={inputStyle} value={ruleType} onChange={e => setRuleType(e.target.value)}>
                  {RULE_TYPES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>RATIONALE (optional)</label>
              <input
                style={inputStyle} type="text" placeholder="Why is this a good highlight?"
                value={rationale}
                onChange={e => setRationale(e.target.value)}
              />
            </div>

            {formError && (
              <div style={{ fontSize: '0.65rem', color: 'var(--status-error)', marginBottom: 8 }}>
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || endSec <= startSec}
              style={{ width: '100%', padding: '7px', fontSize: '0.7rem' }}
            >
              {submitting ? 'Adding…' : 'Add Candidate Clip'}
            </button>
          </form>
        </div>

        {/* Right: Candidate list */}
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: 10 }}>
            CANDIDATES ({candidates.length})
          </div>

          {candidates.length === 0 ? (
            <div className="glass" style={{ padding: 24, textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              No clips yet. Use the player to set timestamps.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {candidates.map(c => {
                const job = renderMap[c.id];
                const dur = (c.endSec - c.startSec).toFixed(1);
                return (
                  <div key={c.id} className="glass" style={{ padding: '10px 12px' }}>
                    {/* Timestamps */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '0.55rem', fontFamily: 'var(--font-mono)' }}
                        onClick={() => seekTo(c.startSec)}
                      >
                        {formatTime(c.startSec)}
                      </button>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>→</span>
                      <button
                        className="btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '0.55rem', fontFamily: 'var(--font-mono)' }}
                        onClick={() => seekTo(c.endSec)}
                      >
                        {formatTime(c.endSec)}
                      </button>
                      <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                        {dur}s
                      </span>
                    </div>

                    {/* Rule type + rationale */}
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {RULE_TYPES.find(r => r.value === c.ruleType)?.label || c.ruleType}
                      </span>
                      {c.rationale && <span> · {c.rationale}</span>}
                    </div>

                    {/* Candidate status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{
                        fontSize: '0.5rem', padding: '1px 5px', borderRadius: 3,
                        background: `${CANDIDATE_STATUS_COLOR[c.status] ?? 'var(--text-dim)'}18`,
                        color: CANDIDATE_STATUS_COLOR[c.status] ?? 'var(--text-dim)',
                        border: `1px solid ${CANDIDATE_STATUS_COLOR[c.status] ?? 'var(--text-dim)'}44`,
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                      }}>
                        {c.status?.toUpperCase()}
                      </span>
                    </div>

                    {/* Render job status */}
                    {job && (
                      <div style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                        <span style={{ color: RENDER_STATUS_COLOR[job.status] }}>
                          ● {job.status?.toUpperCase()}
                        </span>
                        {job.stage && job.status === 'processing' && (
                          <span style={{ color: 'var(--text-muted)' }}> [{job.stage}]</span>
                        )}
                        {job.status === 'done' && job.outputFilePath && (
                          <a
                            href={rawPathToUrl(job.outputFilePath)}
                            target="_blank" rel="noreferrer"
                            style={{ marginLeft: 6, color: 'var(--gold)', textDecoration: 'underline' }}
                          >
                            Preview
                          </a>
                        )}
                        {job.errorMessage && (
                          <div style={{ color: 'var(--status-error)', marginTop: 2 }}>
                            {job.errorMessage.substring(0, 80)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(!job || job.status === 'error') && c.status !== 'rendering' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '3px 8px', fontSize: '0.6rem', flex: 1 }}
                          onClick={() => handleRender(c.id)}
                        >
                          {job?.status === 'error' ? 'Retry Render' : 'Render'}
                        </button>
                      )}
                      {(c.status === 'pending' || c.status === 'rendered') && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '3px 6px', fontSize: '0.6rem' }}
                          onClick={() => handleDeleteCandidate(c.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
