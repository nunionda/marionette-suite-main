import React, { useState, useEffect } from 'react';

export default function Dashboard({ onNavigate }) {
  const [health, setHealth] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {});
    fetch('/api/pipeline/status').then(r => r.json()).then(setPipeline).catch(() => {});
    fetch('/api/sources').then(r => r.json()).then(d => setSources(d.sources || [])).catch(() => {});
  }, []);

  const stats = [
    { label: 'Queued', value: pipeline?.queued ?? '—', color: 'var(--status-info)' },
    { label: 'Processing', value: pipeline?.processing ?? '—', color: 'var(--status-warn)' },
    { label: 'Pending Review', value: pipeline?.pendingReview ?? '—', color: 'var(--gold)' },
    { label: 'Scheduled', value: pipeline?.scheduled ?? '—', color: 'var(--status-ok)' },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          color: 'var(--text-bright)',
          margin: 0,
        }}>
          Shorts Factory
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          K-POP 팬튜브 숏폼 자동화 파이프라인
        </p>
      </div>

      {/* Server Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        fontSize: '0.65rem',
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: health?.status === 'ok' ? 'var(--status-ok)' : 'var(--status-error)',
          display: 'inline-block',
        }} />
        <span style={{ color: 'var(--text-muted)' }}>
          API {health?.status === 'ok' ? 'Online' : 'Offline'} — :3008
        </span>
      </div>

      {/* Pipeline Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {stats.map(s => (
          <div key={s.label} className="glass" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{
              fontSize: '0.6rem', color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', letterSpacing: '1px',
              textTransform: 'uppercase', marginTop: 4,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => onNavigate('sources')}>
            Manage Sources
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('assets')}>
            Browse Assets
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('review')}>
            Review Queue
          </button>
        </div>
      </div>

      {/* Monitored Sources */}
      <div>
        <h3 style={{
          fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          Monitored Sources ({sources.length})
        </h3>
        {sources.length === 0 ? (
          <div className="glass" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            No sources configured. Add a YouTube channel to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sources.map(s => (
              <div key={s.id} className="glass" style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.channelName}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {s.channelId} — max {s.maxClipSeconds}s
                  </div>
                </div>
                <span style={{
                  fontSize: '0.55rem', padding: '3px 8px', borderRadius: 4,
                  background: s.enabled ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
                  color: s.enabled ? 'var(--status-ok)' : 'var(--status-error)',
                  border: `1px solid ${s.enabled ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
                  fontWeight: 600,
                }}>
                  {s.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
