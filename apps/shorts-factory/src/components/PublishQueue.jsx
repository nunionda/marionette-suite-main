import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3008';

const STATUS_META = {
  pending:   { label: 'Draft',      color: 'var(--text-dim)',    icon: '○' },
  approved:  { label: 'Ready',      color: 'var(--gold)',        icon: '◆' },
  uploading: { label: 'Uploading…', color: '#60a5fa',            icon: '↑' },
  scheduled: { label: 'Scheduled',  color: '#a78bfa',            icon: '⏱' },
  published: { label: 'Published',  color: '#4ade80',            icon: '✓' },
  error:     { label: 'Error',      color: 'var(--accent-red, #f87171)', icon: '✕' },
};

const FILTERS = [
  { key: 'ready',     label: 'Ready to Upload' },
  { key: 'published', label: 'Published' },
  { key: 'all',       label: 'All' },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, color: 'var(--text-dim)', icon: '·' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
      color: meta.color, letterSpacing: '0.5px',
    }}>
      <span>{meta.icon}</span>
      {meta.label.toUpperCase()}
    </span>
  );
}

function AuthBanner({ authStatus, onConnect, onDisconnect }) {
  const { authenticated, hasCredentials } = authStatus;

  if (!hasCredentials) {
    return (
      <div style={{
        padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 6,
        border: '1px solid var(--border)', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ⚠ Set <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>YOUTUBE_CLIENT_ID</code> and{' '}
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>YOUTUBE_CLIENT_SECRET</code> in <strong>.env</strong> to enable uploads.
        </span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{
        padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 6,
        border: '1px solid var(--border)', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ⊘ YouTube not connected
        </span>
        <button
          onClick={onConnect}
          style={{
            padding: '6px 14px', background: '#ff0000', border: 'none',
            borderRadius: 4, color: '#fff', fontSize: '0.75rem',
            fontFamily: 'var(--font-body)', cursor: 'pointer', fontWeight: 600,
          }}
        >
          ▶ Connect YouTube
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 6,
      border: '1px solid #4ade8040', marginBottom: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
        ✓ YouTube Connected
      </span>
      <button
        onClick={onDisconnect}
        style={{
          padding: '4px 10px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 4,
          color: 'var(--text-muted)', fontSize: '0.7rem',
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}
      >
        Disconnect
      </button>
    </div>
  );
}

function JobCard({ job, authenticated, onUpload, onScheduleChange, uploading }) {
  const [scheduleVal, setScheduleVal] = useState(
    job.scheduledAt ? job.scheduledAt.slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);

  const isUploading = uploading || job.status === 'uploading';
  const canUpload = authenticated && ['approved', 'error'].includes(job.status);
  const isPublished = job.status === 'published' || job.status === 'scheduled';

  const handleScheduleSave = async () => {
    setSaving(true);
    await onScheduleChange(job.id, scheduleVal ? new Date(scheduleVal).toISOString() : null);
    setSaving(false);
  };

  const youtubeUrl = job.uploadId
    ? `https://www.youtube.com/shorts/${job.uploadId}`
    : null;

  const previewUrl = job.outputFilePath
    ? (() => {
        const idx = job.outputFilePath.indexOf('/output/');
        return idx !== -1 ? job.outputFilePath.substring(idx) : null;
      })()
    : null;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '16px 20px', marginBottom: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>
            {job.channelName ?? '—'}
          </div>
          <div style={{
            fontSize: '0.85rem', color: 'var(--text-bright)',
            fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {job.videoTitle ?? 'Untitled'}
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12,
        padding: '6px 10px', background: 'var(--bg-floor)', borderRadius: 4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {job.title}
      </div>

      {/* Error message */}
      {job.status === 'error' && job.errorMessage && (
        <div style={{
          fontSize: '0.7rem', color: '#f87171', marginBottom: 10,
          padding: '6px 10px', background: '#f871710a', borderRadius: 4,
          fontFamily: 'var(--font-mono)',
        }}>
          {job.errorMessage.slice(0, 200)}
        </div>
      )}

      {/* Published — show YouTube link */}
      {isPublished && youtubeUrl && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {job.uploadId}
          </span>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '4px 10px', background: '#ff0000', borderRadius: 4,
              color: '#fff', fontSize: '0.7rem', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ▶ View on YouTube
          </a>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.7rem', color: 'var(--text-dim)',
                textDecoration: 'none', borderBottom: '1px solid var(--border)',
              }}
            >
              local preview
            </a>
          )}
        </div>
      )}

      {/* Controls row — schedule + upload */}
      {!isPublished && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Schedule:</span>
            <input
              type="datetime-local"
              value={scheduleVal}
              onChange={(e) => setScheduleVal(e.target.value)}
              onBlur={handleScheduleSave}
              disabled={isUploading}
              style={{
                flex: 1, padding: '4px 8px',
                background: 'var(--bg-floor)', border: '1px solid var(--border)',
                borderRadius: 4, color: 'var(--text-muted)', fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
            {saving && <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>saving…</span>}
          </div>

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.7rem', color: 'var(--text-dim)',
                textDecoration: 'none', borderBottom: '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}
            >
              preview
            </a>
          )}

          <button
            onClick={() => onUpload(job.id)}
            disabled={!canUpload || isUploading}
            style={{
              padding: '6px 16px',
              background: isUploading
                ? 'var(--bg-hover)'
                : canUpload
                ? 'var(--gold)'
                : 'var(--bg-hover)',
              border: 'none', borderRadius: 4,
              color: isUploading ? 'var(--text-dim)' : canUpload ? '#000' : 'var(--text-dim)',
              fontSize: '0.75rem', fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: canUpload && !isUploading ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {isUploading ? '↑ Uploading…' : scheduleVal ? '↑ Upload (Scheduled)' : '↑ Upload Now'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PublishQueue() {
  const [jobs, setJobs] = useState([]);
  const [authStatus, setAuthStatus] = useState({ authenticated: false, hasCredentials: false });
  const [filter, setFilter] = useState('ready');
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(null); // 'success' | 'error'
  const [uploadingSet, setUploadingSet] = useState(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, authRes] = await Promise.all([
        fetch(`${API}/api/publish`),
        fetch(`${API}/api/auth/youtube/status`),
      ]);
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs ?? []);
      }
      if (authRes.ok) {
        setAuthStatus(await authRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + OAuth callback detection
  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(window.location.search);
    const authResult = params.get('youtubeAuth');
    if (authResult) {
      setAuthNotice(authResult); // 'success' | 'error'
      window.history.replaceState({}, '', window.location.pathname);
      fetchData();
      setTimeout(() => setAuthNotice(null), 5000);
    }
  }, [fetchData]);

  // Poll every 3s while something is uploading
  useEffect(() => {
    const hasUploading = jobs.some((j) => j.status === 'uploading');
    if (!hasUploading) return;
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, [jobs, fetchData]);

  const handleConnect = async () => {
    const res = await fetch(`${API}/api/auth/youtube/url`);
    const data = await res.json();
    if (data.url) {
      window.open(data.url, '_blank', 'width=600,height=700,noopener');
    } else {
      alert(data.error ?? 'Failed to get auth URL');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect YouTube? You will need to re-authorise to upload.')) return;
    await fetch(`${API}/api/auth/youtube`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpload = async (jobId) => {
    setUploadingSet((s) => new Set(s).add(jobId));
    try {
      const res = await fetch(`${API}/api/publish/${jobId}/upload`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        alert(`Upload failed: ${err.error ?? 'Unknown error'}`);
      } else {
        // Give the server a moment to mark the job as "uploading" before we refresh
        setTimeout(fetchData, 800);
      }
    } finally {
      setUploadingSet((s) => { const ns = new Set(s); ns.delete(jobId); return ns; });
    }
  };

  const handleScheduleChange = async (jobId, scheduledAt) => {
    await fetch(`${API}/api/publish/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    });
    fetchData();
  };

  const filtered = (() => {
    if (filter === 'ready')     return jobs.filter((j) => ['approved', 'error'].includes(j.status));
    if (filter === 'published') return jobs.filter((j) => ['published', 'scheduled'].includes(j.status));
    return jobs;
  })();

  const counts = {
    ready:     jobs.filter((j) => ['approved', 'error'].includes(j.status)).length,
    published: jobs.filter((j) => ['published', 'scheduled'].includes(j.status)).length,
    all:       jobs.length,
  };

  return (
    <div style={{ padding: 24, maxWidth: 780, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: 6 }}>
          PUBLISH QUEUE
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-bright)', fontWeight: 600 }}>
          YouTube Shorts Upload
        </div>
      </div>

      {/* Auth notice toast */}
      {authNotice && (
        <div style={{
          padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: '0.78rem',
          background: authNotice === 'success' ? '#4ade8020' : '#f8717120',
          border: `1px solid ${authNotice === 'success' ? '#4ade80' : '#f87171'}`,
          color: authNotice === 'success' ? '#4ade80' : '#f87171',
        }}>
          {authNotice === 'success'
            ? '✓ YouTube connected successfully! You can now upload Shorts.'
            : '✕ YouTube authorisation failed. Check the console and try again.'}
        </div>
      )}

      {/* Auth banner */}
      <AuthBanner
        authStatus={authStatus}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 14px',
              background: filter === key ? 'var(--bg-hover)' : 'transparent',
              border: filter === key ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 4, color: filter === key ? 'var(--text-bright)' : 'var(--text-muted)',
              fontSize: '0.75rem', fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            {label}
            <span style={{
              marginLeft: 6, padding: '1px 6px',
              background: 'var(--bg-floor)', borderRadius: 10,
              fontSize: '0.65rem', color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
            }}>
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: 20 }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center', color: 'var(--text-dim)',
          border: '1px dashed var(--border)', borderRadius: 8,
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: '0.8rem' }}>
            {filter === 'ready'
              ? 'No approved clips ready to upload. Approve clips in the Review tab first.'
              : 'Nothing here yet.'}
          </div>
        </div>
      ) : (
        filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            authenticated={authStatus.authenticated}
            onUpload={handleUpload}
            onScheduleChange={handleScheduleChange}
            uploading={uploadingSet.has(job.id)}
          />
        ))
      )}

      {/* Setup instructions (collapsed if already connected) */}
      {!authStatus.hasCredentials && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ fontSize: '0.75rem', color: 'var(--text-dim)', cursor: 'pointer' }}>
            How to set up YouTube API credentials
          </summary>
          <div style={{
            marginTop: 10, padding: 16,
            background: 'var(--bg-surface)', borderRadius: 6,
            border: '1px solid var(--border)', fontSize: '0.75rem',
            color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Go to <strong>console.cloud.google.com</strong> → Create or select a project</li>
              <li>Enable <strong>YouTube Data API v3</strong></li>
              <li>Credentials → Create → <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
              <li>Add authorized redirect URI: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>http://localhost:3008/api/auth/youtube/callback</code></li>
              <li>Copy Client ID and Secret into <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>.env</code>:</li>
            </ol>
            <pre style={{
              marginTop: 10, padding: 10,
              background: 'var(--bg-floor)', borderRadius: 4,
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: 'var(--text-muted)', overflowX: 'auto',
            }}>
{`YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret`}
            </pre>
            <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Restart the server after adding env vars.
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
