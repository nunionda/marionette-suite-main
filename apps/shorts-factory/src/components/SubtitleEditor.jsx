import React, { useState, useEffect, useCallback } from 'react';

function formatSec(s) {
  if (s == null) return '0:00';
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.round((s % 1) * 10))}`;
}

const POLL_MS = 3000;

export default function SubtitleEditor() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok'|'err', text }

  const loadJobs = useCallback(() => {
    fetch('/api/render')
      .then(r => r.json())
      .then(d => {
        const pending = (d.jobs || []).filter(j =>
          j.status === 'subtitle_review' || j.status === 'subtitle_review_confirmed'
        );
        setJobs(pending);
      });
  }, []);

  useEffect(() => {
    loadJobs();
    const t = setInterval(loadJobs, POLL_MS);
    return () => clearInterval(t);
  }, [loadJobs]);

  const loadSubtitles = useCallback(async (id) => {
    const res = await fetch(`/api/render/${id}/subtitles`);
    const data = await res.json();
    setEntries(data.entries || []);
    setStatus(data.status || '');
    setMessage(null);
  }, []);

  useEffect(() => {
    if (selectedId) loadSubtitles(selectedId);
  }, [selectedId, loadSubtitles]);

  const updateText = (idx, text) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, text } : e));
  };

  const deleteEntry = (idx) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/render/${selectedId}/confirm-subtitles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'ok', text: '자막 확정 완료 — 렌더링 시작' });
      setStatus('subtitle_review_confirmed');
      loadJobs();
    } catch (e) {
      setMessage({ type: 'err', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const isConfirmed = status === 'subtitle_review_confirmed';

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* Left: job list */}
      <div style={{
        width: 240, borderRight: '1px solid var(--border)',
        overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', letterSpacing: 1, color: 'var(--gold)' }}>
            SUBTITLE REVIEW
          </span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} pending
          </div>
        </div>
        {jobs.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            No jobs awaiting subtitle review
          </div>
        ) : (
          jobs.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedId(job.id)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: selectedId === job.id ? 'var(--surface-2)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Job #{job.id}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                {job.videoTitle ? job.videoTitle.slice(0, 30) : 'Unknown video'}
              </div>
              <StatusBadge status={job.status} />
            </div>
          ))
        )}
      </div>

      {/* Right: subtitle editor */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {!selectedId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Select a job to review subtitles
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, flex: 1 }}>
                Job #{selectedId} — {entries.length} subtitle{entries.length !== 1 ? 's' : ''}
              </span>
              {message && (
                <span style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: 4,
                  background: message.type === 'ok' ? 'rgba(0,200,100,0.15)' : 'rgba(255,80,80,0.15)',
                  color: message.type === 'ok' ? 'var(--status-ok)' : 'var(--status-error)',
                }}>
                  {message.text}
                </span>
              )}
              <button
                onClick={handleConfirm}
                disabled={saving || isConfirmed}
                style={{
                  padding: '6px 18px', fontSize: '0.75rem', fontWeight: 700,
                  background: isConfirmed ? 'var(--surface-2)' : 'var(--gold)',
                  color: isConfirmed ? 'var(--text-muted)' : '#000',
                  border: 'none', borderRadius: 4, cursor: isConfirmed ? 'default' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? '저장 중...' : isConfirmed ? '확정됨 ✓' : '자막 확정 → 렌더링'}
              </button>
            </div>

            {/* Entry list */}
            <div style={{ flex: 1, padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                  자막 없음 (Whisper STT 결과 없음)
                </div>
              ) : entries.map((entry, idx) => (
                <EntryRow
                  key={idx}
                  idx={idx}
                  entry={entry}
                  disabled={isConfirmed}
                  onChange={updateText}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EntryRow({ idx, entry, disabled, onChange, onDelete }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '8px 10px',
      background: 'var(--surface-2)',
      borderRadius: 6,
      border: '1px solid var(--border)',
    }}>
      {/* Timestamp */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
        color: 'var(--text-muted)', whiteSpace: 'nowrap',
        paddingTop: 6, minWidth: 100,
      }}>
        {formatSec(entry.start)} → {formatSec(entry.end)}
      </div>

      {/* Editable text */}
      <textarea
        value={entry.text}
        disabled={disabled}
        onChange={e => onChange(idx, e.target.value)}
        rows={2}
        style={{
          flex: 1, background: disabled ? 'transparent' : 'var(--surface-1)',
          border: disabled ? 'none' : '1px solid var(--border)',
          borderRadius: 4, color: 'var(--text-primary)',
          fontSize: '0.8rem', padding: '4px 8px',
          resize: 'vertical', fontFamily: 'inherit',
          lineHeight: 1.4,
        }}
      />

      {/* Delete */}
      {!disabled && (
        <button
          onClick={() => onDelete(idx)}
          title="Remove this line"
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.85rem', padding: '4px 6px',
            borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--status-error)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    subtitle_review: { label: 'REVIEW', color: 'var(--status-warn)' },
    subtitle_review_confirmed: { label: 'CONFIRMED', color: 'var(--status-ok)' },
  }[status] || { label: status, color: 'var(--text-muted)' };

  return (
    <span style={{
      fontSize: '0.55rem', fontFamily: 'var(--font-mono)', letterSpacing: 1,
      color: cfg.color, fontWeight: 700,
    }}>
      {cfg.label}
    </span>
  );
}
