import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from 'recharts';

// ── Toast notification ────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }) {
  const colors = {
    ok:   { bg: '#27AE6022', border: 'var(--status-ok)',   text: 'var(--status-ok)' },
    warn: { bg: '#E2A03522', border: 'var(--status-warn)', text: 'var(--status-warn)' },
    info: { bg: 'var(--gold-glow)', border: 'var(--gold-dim)', text: 'var(--gold)' },
  };
  const c = colors[type] ?? colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 'var(--r-md)',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: '0.75rem',
      color: c.text,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      fontFamily: 'var(--font-body)',
      minWidth: 240,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.text, fontSize: '1rem', lineHeight: 1, padding: 0,
      }}>×</button>
    </div>
  );
}

// ── Custom tooltip (keeps dark theme) ────────────────────────────────────────

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-hover)',
      borderRadius: 'var(--r-sm)',
      padding: '8px 12px',
      fontSize: '0.7rem',
      fontFamily: 'var(--font-mono)',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: 'var(--gold)' }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="glass" style={{ padding: '16px 20px', textAlign: 'center' }}>
      <div style={{
        fontSize: '1.6rem', fontWeight: 700,
        color: color ?? 'var(--text-bright)',
        fontFamily: 'var(--font-mono)',
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{
        fontSize: '0.6rem', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', letterSpacing: '1px',
        textTransform: 'uppercase', marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  published: 'var(--status-ok)',
  scheduled: 'var(--status-info)',
  uploading: 'var(--status-warn)',
  error:     'var(--status-error)',
};

function StatusBadge({ status }) {
  return (
    <span style={{
      fontSize: '0.6rem',
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      color: STATUS_COLORS[status] ?? 'var(--text-muted)',
      background: (STATUS_COLORS[status] ?? 'var(--text-muted)') + '22',
      borderRadius: 'var(--r-sm)',
      padding: '2px 6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {status ?? '—'}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [summary,    setSummary]    = useState(null);
  const [videos,     setVideos]     = useState([]);
  const [timeseries, setTimeseries] = useState([]);
  const [selected,   setSelected]   = useState(null); // publishJobId
  const [collecting, setCollecting] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null); // { message, type }
  const toastTimer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, v] = await Promise.all([
        fetch('/api/analytics/summary').then(r => r.json()),
        fetch('/api/analytics/videos').then(r => r.json()),
      ]);
      setSummary(s);
      setVideos(v.videos ?? []);
    } catch (e) {
      console.error('[analytics] load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load timeseries when a video is selected
  useEffect(() => {
    if (!selected) { setTimeseries([]); return; }
    fetch(`/api/analytics/timeseries/${selected}`)
      .then(r => r.json())
      .then(d => setTimeseries(d.series ?? []))
      .catch(() => setTimeseries([]));
  }, [selected]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const collect = async () => {
    setCollecting(true);
    try {
      const res  = await fetch('/api/analytics/collect', { method: 'POST' });
      const data = await res.json();
      if (data.errors > 0) {
        showToast(`⚠️ ${data.collected}개 수집, ${data.errors}개 실패 (서버 로그 확인)`, 'warn');
      } else if (data.collected === 0) {
        showToast('업로드된 영상이 없습니다. Publish 탭에서 먼저 YouTube에 업로드하세요.', 'warn');
      } else {
        showToast(`✅ ${data.collected}개 영상 메트릭 수집 완료`, 'ok');
      }
      await load();
    } catch (e) {
      showToast('❌ 수집 실패 — 서버 연결을 확인하세요', 'warn');
    } finally {
      setCollecting(false);
    }
  };

  // Bar chart: top 10 videos with views > 0, sorted descending
  const barData = [...videos]
    .filter(v => v.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(v => ({
      name:  v.title.length > 22 ? v.title.slice(0, 22) + '…' : v.title,
      views: v.views,
      likes: v.likes,
    }));

  // Selected video for timeseries header
  const selectedVideo = videos.find(v => v.id === selected);

  return (
    <div style={{ padding: 24 }}>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => { clearTimeout(toastTimer.current); setToast(null); }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            color: 'var(--text-bright)',
            margin: 0,
          }}>
            Analytics
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Published Shorts 성과 집계 — YouTube Data API v3
          </p>
        </div>
        <button
          onClick={collect}
          disabled={collecting}
          className="btn-primary"
          style={{ fontSize: '0.7rem', padding: '8px 14px' }}
        >
          {collecting ? '수집 중…' : '📡 Collect Metrics'}
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}>
        <StatCard label="Published" value={summary?.publishedJobs ?? '—'} color="var(--status-ok)" />
        <StatCard label="Total Views" value={summary?.totalViews ?? '—'} color="var(--gold)" />
        <StatCard label="Total Likes" value={summary?.totalLikes ?? '—'} color="var(--status-info)" />
        <StatCard label="Total Comments" value={summary?.totalComments ?? '—'} color="var(--text)" />
      </div>

      {/* ── Bar chart ── */}
      {barData.length > 0 && (
        <div className="glass" style={{ padding: '16px 20px', marginBottom: 24 }}>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            Top Videos by Views
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="views" fill="var(--gold)" radius={[3, 3, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Timeseries for selected video ── */}
      {selected && timeseries.length > 0 && (
        <div className="glass" style={{ padding: '16px 20px', marginBottom: 24 }}>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: 4,
          }}>
            Views Over Time
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: 12 }}>
            {selectedVideo?.title}
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<DarkTooltip />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="var(--gold)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--gold)', r: 3 }}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="var(--status-info)"
                  strokeWidth={1.5}
                  dot={false}
                  name="Likes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Video table ── */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Videos ({videos.length})
          </span>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
              }}
            >
              ✕ Deselect
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            Loading…
          </div>
        ) : videos.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: '0.75rem' }}>아직 업로드된 영상이 없습니다</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 6 }}>
              Publish 탭에서 숏폼을 업로드하면 여기서 성과를 확인할 수 있습니다
            </div>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 80px 100px 80px',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.6rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              <span>Title</span>
              <span style={{ textAlign: 'right' }}>Views</span>
              <span style={{ textAlign: 'right' }}>Likes</span>
              <span style={{ textAlign: 'right' }}>Comments</span>
              <span style={{ textAlign: 'center' }}>Status</span>
              <span style={{ textAlign: 'right' }}>Collected</span>
            </div>

            {videos.map(v => (
              <div
                key={v.id}
                onClick={() => setSelected(prev => prev === v.id ? null : v.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px 80px 100px 80px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selected === v.id ? 'var(--bg-hover)' : 'transparent',
                  borderLeft: selected === v.id ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {/* Title */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-bright)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {v.title}
                  </div>
                  {v.youtubeUrl && (
                    <a
                      href={v.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        textDecoration: 'none',
                      }}
                    >
                      ↗ youtube.com/shorts/{v.uploadId}
                    </a>
                  )}
                </div>

                {/* Metrics */}
                <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--gold)', alignSelf: 'center' }}>
                  {v.views.toLocaleString()}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--status-info)', alignSelf: 'center' }}>
                  {v.likes.toLocaleString()}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  {v.comments.toLocaleString()}
                </div>

                {/* Status */}
                <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                  <StatusBadge status={v.status} />
                </div>

                {/* Last collected */}
                <div style={{
                  textAlign: 'right', fontSize: '0.6rem',
                  fontFamily: 'var(--font-mono)', color: 'var(--text-dim)',
                  alignSelf: 'center',
                }}>
                  {v.lastCollected ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── No data hint ── */}
      {!loading && videos.some(v => v.uploadId) && summary?.totalViews === 0 && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'var(--gold-glow)',
          border: '1px solid var(--gold-dim)',
          borderRadius: 'var(--r-md)',
          fontSize: '0.7rem',
          color: 'var(--gold)',
        }}>
          💡 업로드된 영상이 있지만 아직 수집된 데이터가 없습니다.{' '}
          <button
            onClick={collect}
            disabled={collecting}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: 'var(--gold)', cursor: 'pointer',
              fontWeight: 600, fontSize: 'inherit',
            }}
          >
            Collect Metrics
          </button>
          를 눌러 지금 가져오세요.
        </div>
      )}
    </div>
  );
}
