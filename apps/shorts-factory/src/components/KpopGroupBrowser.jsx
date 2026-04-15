import React, { useState, useEffect } from 'react';

const TIER_COLOR = {
  1: 'var(--gold)',
  2: 'var(--status-ok)',
  3: 'var(--text-muted)',
};

const TIER_LABEL = {
  1: 'T1 DIPLOMATIC',
  2: 'T2 GLOBAL',
  3: 'T3 NOTABLE',
};

const STATUS_COLOR = {
  active: 'var(--status-ok)',
  hiatus: 'var(--status-warn)',
  disbanded: 'var(--status-error)',
};

function Badge({ text, color, bg }) {
  return (
    <span style={{
      fontSize: '0.5rem', padding: '2px 6px', borderRadius: 3,
      background: bg ?? `${color}18`,
      color: color,
      border: `1px solid ${color}44`,
      fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

export default function KpopGroupBrowser() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState('all');
  const [filterGen, setFilterGen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [expandedId, setExpandedId] = useState(null);
  const [monitoring, setMonitoring] = useState(null); // groupId being processed

  const load = () => {
    setLoading(true);
    fetch('/api/kpop-groups')
      .then(r => r.json())
      .then(d => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const displayed = groups.filter(g => {
    if (filterTier !== 'all' && g.softPowerTier !== Number(filterTier)) return false;
    if (filterGen !== 'all' && g.generation !== Number(filterGen)) return false;
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    return true;
  });

  const handleMonitor = async (group) => {
    setMonitoring(group.id);
    try {
      const method = group.sourceId ? 'DELETE' : 'POST';
      const res = await fetch(`/api/kpop-groups/${group.id}/monitor`, { method });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        alert(data.error || 'Failed');
      }
    } finally {
      setMonitoring(null);
    }
  };

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
          K-pop Soft Power DB
        </h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          한국 문화외교 자산 — {groups.length} groups · {groups.filter(g => g.sourceId).length} monitored
        </p>
      </div>

      {/* Tier Summary */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map(tier => {
          const count = groups.filter(g => g.softPowerTier === tier).length;
          return (
            <div
              key={tier}
              className="glass"
              style={{ padding: '8px 12px', flex: 1, cursor: 'pointer', borderLeft: `3px solid ${TIER_COLOR[tier]}` }}
              onClick={() => setFilterTier(filterTier === String(tier) ? 'all' : String(tier))}
            >
              <div style={{ fontSize: '0.6rem', color: TIER_COLOR[tier], fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                {TIER_LABEL[tier]}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: 2 }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={selectStyle} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
          <option value="all">All Tiers</option>
          <option value="1">Tier 1 — Diplomatic</option>
          <option value="2">Tier 2 — Global</option>
          <option value="3">Tier 3 — Notable</option>
        </select>
        <select style={selectStyle} value={filterGen} onChange={e => setFilterGen(e.target.value)}>
          <option value="all">All Generations</option>
          <option value="2">2nd Gen</option>
          <option value="3">3rd Gen</option>
          <option value="4">4th Gen</option>
          <option value="5">5th Gen</option>
        </select>
        <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="hiatus">Hiatus</option>
          <option value="disbanded">Disbanded</option>
        </select>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
          {displayed.length} / {groups.length} groups
        </span>
      </div>

      {/* Group List */}
      {loading ? (
        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayed.map(g => {
            const isExpanded = expandedId === g.id;
            const roles = (() => { try { return JSON.parse(g.diplomaticRoles || '[]'); } catch { return []; } })();

            return (
              <div key={g.id} className="glass" style={{ overflow: 'hidden' }}>
                {/* Main row */}
                <div
                  style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : g.id)}
                >
                  {/* Fandom badge */}
                  <div style={{ width: 60, flexShrink: 0 }}>
                    {g.fandomName && (
                      <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {g.fandomName}
                      </span>
                    )}
                  </div>

                  {/* Names */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>
                      {g.nameEn}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
                      {g.nameKr}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {g.agency}
                    </span>
                    <Badge text={`GEN ${g.generation}`} color="var(--text-dim)" />
                    <Badge
                      text={g.status.toUpperCase()}
                      color={STATUS_COLOR[g.status] || 'var(--text-muted)'}
                    />
                    <Badge
                      text={TIER_LABEL[g.softPowerTier] || `T${g.softPowerTier}`}
                      color={TIER_COLOR[g.softPowerTier] || 'var(--text-muted)'}
                    />

                    {/* Monitor button */}
                    <button
                      className={g.sourceId ? 'btn-secondary' : 'btn-primary'}
                      style={{ padding: '3px 10px', fontSize: '0.6rem', marginLeft: 4 }}
                      disabled={monitoring === g.id}
                      onClick={e => { e.stopPropagation(); handleMonitor(g); }}
                    >
                      {monitoring === g.id
                        ? '...'
                        : g.sourceId
                          ? 'Monitoring ✓'
                          : 'Add to Monitor'}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 12px', borderTop: '1px solid var(--border)' }}>
                    {roles.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: 4 }}>
                          DIPLOMATIC ROLES
                        </div>
                        <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                          {roles.map((role, i) => (
                            <li key={i} style={{ fontSize: '0.65rem', color: 'var(--text)', marginBottom: 2 }}>{role}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {g.youtubeHandle && (
                      <div style={{ marginTop: 8, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        YouTube: @{g.youtubeHandle}
                        {g.debutYear && <span style={{ marginLeft: 12 }}>Debut: {g.debutYear}</span>}
                        {g.disbandYear && <span style={{ marginLeft: 8, color: 'var(--status-error)' }}>Disbanded: {g.disbandYear}</span>}
                      </div>
                    )}
                    {g.sourceId && (
                      <div style={{ marginTop: 6, fontSize: '0.6rem', color: 'var(--status-ok)', fontFamily: 'var(--font-mono)' }}>
                        Source ID #{g.sourceId} linked — visible in Sources tab
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {displayed.length === 0 && (
            <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              No groups match the current filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
