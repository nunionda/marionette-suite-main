import React, { useState, useEffect, useCallback } from 'react';

const STATUS_COLOR = {
  pending: 'var(--text-muted)',
  downloading: 'var(--status-warn)',
  done: 'var(--status-ok)',
  error: 'var(--status-error)',
};

const STATUS_LABEL = {
  pending: 'PENDING',
  downloading: 'DOWNLOADING',
  done: 'READY',
  error: 'ERROR',
};

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssetList({ onEditClips }) {
  const [assets, setAssets] = useState([]);
  const [sources, setSources] = useState([]);
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detecting, setDetecting] = useState(null); // sourceId being detected
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(() => {
    fetch('/api/assets').then(r => r.json()).then(d => setAssets(d.assets || []));
  }, []);

  useEffect(() => {
    fetch('/api/sources').then(r => r.json()).then(d => setSources(d.sources || []));
    load();
  }, [load]);

  // Auto-refresh every 5s when any asset is downloading
  useEffect(() => {
    const hasDownloading = assets.some(a => a.downloadStatus === 'downloading');
    if (hasDownloading && !autoRefresh) {
      setAutoRefresh(true);
    } else if (!hasDownloading && autoRefresh) {
      setAutoRefresh(false);
    }
  }, [assets, autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [autoRefresh, load]);

  const handleDetect = async (sourceId) => {
    setDetecting(sourceId);
    try {
      const res = await fetch('/api/assets/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      load();
      if (data.newVideos === 0) {
        alert('No new videos found. Channel may be up-to-date.');
      }
    } finally {
      setDetecting(null);
    }
  };

  const handleDownload = async (assetId) => {
    await fetch(`/api/assets/${assetId}/download`, { method: 'POST' });
    load();
  };

  const displayed = assets.filter(a => {
    if (filterSource !== 'all' && String(a.sourceId) !== filterSource) return false;
    if (filterStatus !== 'all' && a.downloadStatus !== filterStatus) return false;
    return true;
  });

  const selectStyle = {
    padding: '5px 8px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text)',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: 0, color: 'var(--text-bright)' }}>
          Source Assets
        </h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Detected uploads from monitored channels
        </p>
      </div>

      {/* Detect Controls */}
      <div className="glass" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          DETECT NEW VIDEOS
        </span>
        {sources.filter(s => s.enabled).map(s => (
          <button
            key={s.id}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.65rem' }}
            disabled={detecting === s.id}
            onClick={() => handleDetect(s.id)}
          >
            {detecting === s.id ? 'Checking...' : `Poll ${s.channelName}`}
          </button>
        ))}
        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.65rem', marginLeft: 'auto' }} onClick={load}>
          Refresh
        </button>
        {autoRefresh && (
          <span style={{ fontSize: '0.6rem', color: 'var(--status-warn)', fontFamily: 'var(--font-mono)' }}>
            AUTO-REFRESH
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <select style={selectStyle} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">All Channels</option>
          {sources.map(s => (
            <option key={s.id} value={String(s.id)}>{s.channelName}</option>
          ))}
        </select>
        <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="downloading">Downloading</option>
          <option value="done">Ready</option>
          <option value="error">Error</option>
        </select>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
          {displayed.length} / {assets.length} videos
        </span>
      </div>

      {/* Asset List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayed.map(a => (
          <div key={a.id} className="glass" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Thumbnail */}
            {a.thumbnailUrl ? (
              <img
                src={a.thumbnailUrl}
                alt={a.title}
                style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 80, height: 45, background: 'var(--bg-elevated)', borderRadius: 4, flexShrink: 0 }} />
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.title}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {a.channelName} · {a.videoId} · {formatDate(a.publishedAt)} · {formatDuration(a.duration)}
              </div>
              {a.errorMessage && (
                <div style={{ fontSize: '0.6rem', color: 'var(--status-error)', marginTop: 4 }}>
                  {a.errorMessage}
                </div>
              )}
            </div>

            {/* Status + Action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{
                fontSize: '0.5rem', padding: '2px 6px', borderRadius: 3,
                background: `${STATUS_COLOR[a.downloadStatus]}18`,
                color: STATUS_COLOR[a.downloadStatus] || 'var(--text-muted)',
                border: `1px solid ${STATUS_COLOR[a.downloadStatus]}44`,
                fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'var(--font-mono)',
              }}>
                {STATUS_LABEL[a.downloadStatus] || a.downloadStatus?.toUpperCase()}
              </span>
              {(a.downloadStatus === 'pending' || a.downloadStatus === 'error') && (
                <button
                  className="btn-primary"
                  style={{ padding: '3px 8px', fontSize: '0.6rem' }}
                  onClick={() => handleDownload(a.id)}
                >
                  Download
                </button>
              )}
              {a.downloadStatus === 'downloading' && (
                <span style={{ fontSize: '0.6rem', color: 'var(--status-warn)', fontFamily: 'var(--font-mono)' }}>
                  ···
                </span>
              )}
              {a.downloadStatus === 'done' && onEditClips && (
                <button
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.6rem' }}
                  onClick={() => onEditClips(a.id)}
                >
                  Edit Clips
                </button>
              )}
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {assets.length === 0
              ? 'No videos detected yet. Click "Poll Channel" to check for new uploads.'
              : 'No videos match the current filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
