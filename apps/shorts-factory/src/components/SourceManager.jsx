import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
  channelId: '',
  channelName: '',
  channelUrl: '',
  creditText: 'Source: Official channel. All rights belong to the original owners.',
  disclaimerText: 'This is a fan-made highlight for commentary and discovery.',
  riskLevel: 'low',
  maxClipSeconds: 20,
};

export default function SourceManager() {
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch('/api/sources').then(r => r.json()).then(d => setSources(d.sources || []));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/sources/${editingId}` : '/api/sources';
    const method = editingId ? 'PATCH' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    load();
  };

  const startEdit = (s) => {
    setForm({
      channelId: s.channelId,
      channelName: s.channelName,
      channelUrl: s.channelUrl,
      creditText: s.creditText,
      disclaimerText: s.disclaimerText || '',
      riskLevel: s.riskLevel || 'low',
      maxClipSeconds: s.maxClipSeconds || 20,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this source?')) return;
    await fetch(`/api/sources/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleEnabled = async (s) => {
    await fetch(`/api/sources/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: s.enabled ? 0 : 1 }),
    });
    load();
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: 0, color: 'var(--text-bright)' }}>
            Channel Sources
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Monitor official YouTube channels for new uploads
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add Source'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 16, letterSpacing: '1px' }}>
            {editingId ? 'EDIT SOURCE' : 'NEW SOURCE'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Channel ID</label>
              <input style={inputStyle} value={form.channelId} disabled={!!editingId}
                onChange={e => setForm({ ...form, channelId: e.target.value })}
                placeholder="UCEf_Bc-KVd7onSeifS3py9g" required />
            </div>
            <div>
              <label style={labelStyle}>Channel Name</label>
              <input style={inputStyle} value={form.channelName}
                onChange={e => setForm({ ...form, channelName: e.target.value })}
                placeholder="SMTOWN" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Channel URL</label>
              <input style={inputStyle} value={form.channelUrl}
                onChange={e => setForm({ ...form, channelUrl: e.target.value })}
                placeholder="https://www.youtube.com/@SMTOWN" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Credit Text</label>
              <input style={inputStyle} value={form.creditText}
                onChange={e => setForm({ ...form, creditText: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Disclaimer Text</label>
              <input style={inputStyle} value={form.disclaimerText}
                onChange={e => setForm({ ...form, disclaimerText: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Risk Level</label>
              <select style={inputStyle} value={form.riskLevel}
                onChange={e => setForm({ ...form, riskLevel: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Max Clip (seconds)</label>
              <input style={inputStyle} type="number" value={form.maxClipSeconds}
                onChange={e => setForm({ ...form, maxClipSeconds: Number(e.target.value) })}
                min={5} max={60} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add Source'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Source List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map(s => (
          <div key={s.id} className="glass" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.channelName}</span>
                  <span style={{
                    fontSize: '0.5rem', padding: '2px 6px', borderRadius: 3,
                    background: s.enabled ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
                    color: s.enabled ? 'var(--status-ok)' : 'var(--status-error)',
                    border: `1px solid ${s.enabled ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
                    fontWeight: 700, letterSpacing: '0.5px',
                  }}>
                    {s.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                  <span style={{
                    fontSize: '0.5rem', padding: '2px 6px', borderRadius: 3,
                    background: 'rgba(200,168,85,0.08)',
                    color: 'var(--gold-dim)', border: '1px solid rgba(200,168,85,0.2)',
                  }}>
                    {s.riskLevel?.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {s.channelId} — max {s.maxClipSeconds}s
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  {s.creditText}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.6rem' }}
                  onClick={() => toggleEnabled(s)}>
                  {s.enabled ? 'Disable' : 'Enable'}
                </button>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.6rem' }}
                  onClick={() => startEdit(s)}>
                  Edit
                </button>
                <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.6rem' }}
                  onClick={() => handleDelete(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <div className="glass" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            No sources yet. Click "+ Add Source" to monitor a YouTube channel.
          </div>
        )}
      </div>
    </div>
  );
}
