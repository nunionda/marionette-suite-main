import React, { useState, useEffect, useCallback } from 'react';

const CHECKLIST_ITEMS = [
  { id: 'visual',   label: 'Visual quality OK (9:16 crop, no artifacts)' },
  { id: 'audio',    label: 'Audio clear (no clipping, good volume)' },
  { id: 'subtitle', label: 'Subtitles accurate and readable' },
  { id: 'credit',   label: 'Credit text visible at bottom' },
  { id: 'content',  label: 'Content appropriate (low copyright risk)' },
];

const DECISION_LABEL = {
  approve: 'APPROVED',
  reject: 'REJECTED',
  'request-edit': 'NEEDS EDIT',
};

const DECISION_COLOR = {
  approve: 'var(--status-ok)',
  reject: 'var(--status-error)',
  'request-edit': 'var(--status-warn)',
};

/** Convert absolute output file path → browser-accessible URL. */
function fileToUrl(filePath) {
  if (!filePath) return null;
  const idx = filePath.indexOf('/output/');
  return idx !== -1 ? filePath.substring(idx) : null;
}

function formatSec(s) {
  if (s == null) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const monoStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' };
const labelStyle = { fontSize: '0.6rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', color: 'var(--gold)' };

export default function ReviewPanel() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [titleVariants, setTitleVariants] = useState(null); // [str,str,str] from LLM
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [notes, setNotes] = useState('');
  const [filterDecision, setFilterDecision] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const loadJobs = useCallback(() => {
    fetch('/api/review').then(r => r.json()).then(d => setJobs(d.jobs || []));
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const loadDetail = useCallback(async (id) => {
    const res = await fetch(`/api/review/${id}`);
    const data = await res.json();
    setDetail(data);
    setChecklist({});
    setNotes('');
    setTitleVariants(null);
    setSelectedVariant(0);

    if (data.publishJob) {
      setEditTitle(data.publishJob.title || '');
      setEditDesc(data.publishJob.description || '');
      setEditTags(data.publishJob.hashtags || '');
    } else {
      setEditTitle('');
      setEditDesc('');
      setEditTags('');
    }
  }, []);

  useEffect(() => {
    if (selectedId !== null) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const handleGenerate = async () => {
    if (!selectedId || generating) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/review/${selectedId}/generate`, { method: 'POST' });
      const data = await res.json();
      if (data.metadata) {
        setTitleVariants(data.metadata.titles);
        setSelectedVariant(0);
        setEditTitle(data.metadata.titles[0]);
        setEditDesc(data.metadata.description);
        setEditTags(data.metadata.hashtags.join(' '));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleVariantSelect = (idx) => {
    setSelectedVariant(idx);
    setEditTitle(titleVariants[idx]);
  };

  const saveMetadata = async () => {
    if (!selectedId || !editTitle.trim()) return;
    setSavingMeta(true);
    try {
      await fetch(`/api/review/${selectedId}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDesc, hashtags: editTags }),
      });
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDecide = async (decision) => {
    if (!selectedId || deciding) return;
    if (decision === 'approve' && !editTitle.trim()) {
      alert('Please set a title before approving.');
      return;
    }
    setDeciding(true);
    try {
      if (editTitle.trim()) await saveMetadata();
      await fetch(`/api/review/${selectedId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, checklistResult: checklist, notes: notes || undefined }),
      });
      loadJobs();
      setSelectedId(null);
      setDetail(null);
    } finally {
      setDeciding(false);
    }
  };

  const displayed = jobs.filter(j => {
    if (filterDecision === 'all') return true;
    if (filterDecision === 'pending') return !j.latestDecision;
    return j.latestDecision?.decision === filterDecision;
  });

  const decisionBadge = detail?.latestDecision?.decision;
  const videoUrl = detail ? fileToUrl(detail.outputFilePath) : null;
  const hasMetadata = !!(detail?.publishJob || titleVariants);
  const canApprove = editTitle.trim().length > 0;

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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left: Job List ── */}
      <div style={{
        width: 300,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, color: 'var(--text-bright)' }}>
            Review Queue
          </h2>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
            Rendered shorts awaiting approval
          </p>
          <select style={selectStyle} value={filterDecision} onChange={e => setFilterDecision(e.target.value)}>
            <option value="all">All ({jobs.length})</option>
            <option value="pending">Pending ({jobs.filter(j => !j.latestDecision).length})</option>
            <option value="approve">Approved</option>
            <option value="reject">Rejected</option>
            <option value="request-edit">Needs Edit</option>
          </select>
        </div>

        {/* Job cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {displayed.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', ...monoStyle }}>
              {jobs.length === 0
                ? 'No rendered shorts yet.\nRender clips in the Assets tab first.'
                : 'No items match filter.'}
            </div>
          )}
          {displayed.map(j => {
            const dec = j.latestDecision?.decision;
            const isSelected = j.id === selectedId;
            const dur = j.endSec != null && j.startSec != null
              ? Math.round(j.endSec - j.startSec)
              : null;

            return (
              <div
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                style={{
                  padding: '10px 12px',
                  marginBottom: 6,
                  borderRadius: 'var(--r-sm)',
                  background: isSelected ? 'var(--bg-hover)' : 'var(--bg-elevated)',
                  border: `1px solid ${isSelected ? 'var(--gold)44' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {j.videoTitle ?? 'Untitled'}
                </div>
                <div style={{ ...monoStyle, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{j.ruleType ?? '—'}</span>
                  {dur != null && <span>{dur}s</span>}
                  {dec && (
                    <span style={{ color: DECISION_COLOR[dec], fontWeight: 700 }}>
                      {DECISION_LABEL[dec]}
                    </span>
                  )}
                  {!dec && (
                    <span style={{ color: 'var(--text-dim)' }}>PENDING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Detail Panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {!detail && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            Select a rendered short to review
          </div>
        )}

        {detail && (
          <div style={{ maxWidth: 700 }}>

            {/* Clip info header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, color: 'var(--text-bright)', flex: 1 }}>
                  {detail.videoTitle ?? 'Untitled'}
                </h3>
                {decisionBadge && (
                  <span style={{
                    fontSize: '0.55rem', padding: '3px 8px', borderRadius: 3,
                    background: `${DECISION_COLOR[decisionBadge]}18`,
                    color: DECISION_COLOR[decisionBadge],
                    border: `1px solid ${DECISION_COLOR[decisionBadge]}44`,
                    fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'var(--font-mono)',
                  }}>
                    {DECISION_LABEL[decisionBadge]}
                  </span>
                )}
              </div>
              <div style={monoStyle}>
                {detail.channelName} · {detail.ruleType} · {formatSec(detail.startSec)}–{formatSec(detail.endSec)}
                {' '}({Math.round((detail.endSec ?? 0) - (detail.startSec ?? 0))}s)
              </div>
            </div>

            {/* Video preview */}
            <div className="glass" style={{ marginBottom: 20, padding: 12, borderRadius: 'var(--r-sm)' }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>PREVIEW</div>
              {videoUrl ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <video
                    src={videoUrl}
                    controls
                    style={{
                      height: 480,
                      width: 270,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#000',
                    }}
                  />
                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', ...monoStyle }}>
                  No output file found
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="glass" style={{ marginBottom: 20, padding: '14px 16px' }}>
              <div style={{ ...labelStyle, marginBottom: 12 }}>QC CHECKLIST</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!checklist[item.id]}
                      onChange={e => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      style={{ width: 14, height: 14, accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Metadata section */}
            <div className="glass" style={{ marginBottom: 20, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={labelStyle}>METADATA</div>
                <button
                  className="btn-secondary"
                  style={{ padding: '3px 10px', fontSize: '0.6rem', marginLeft: 'auto' }}
                  disabled={generating}
                  onClick={handleGenerate}
                >
                  {generating
                    ? 'Generating...'
                    : hasMetadata ? '↺ Regenerate' : '✦ Generate with AI'}
                </button>
              </div>

              {/* Title variants (shown after generate) */}
              {titleVariants && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...monoStyle, marginBottom: 6 }}>TITLE VARIANTS — select one:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {titleVariants.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => handleVariantSelect(i)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${selectedVariant === i ? 'var(--gold)' : 'var(--border)'}`,
                          background: selectedVariant === i ? 'var(--bg-hover)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          color: selectedVariant === i ? 'var(--text-bright)' : 'var(--text)',
                          transition: 'var(--transition-smooth)',
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ ...monoStyle, marginBottom: 4 }}>TITLE</div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="YouTube Shorts title (under 60 chars)"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <div style={{ ...monoStyle, marginTop: 3 }}>
                    {editTitle.length}/60 chars
                    {editTitle.length > 60 && (
                      <span style={{ color: 'var(--status-error)', marginLeft: 8 }}>Too long!</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ ...monoStyle, marginBottom: 4 }}>HASHTAGS</div>
                  <input
                    type="text"
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    placeholder="#shorts #kpop #aespa ..."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div>
                  <div style={{ ...monoStyle, marginBottom: 4 }}>DESCRIPTION</div>
                  <textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    rows={5}
                    placeholder="Description with credit text..."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-body)',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {hasMetadata && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.65rem' }}
                      disabled={savingMeta}
                      onClick={saveMetadata}
                    >
                      {savingMeta ? 'Saving...' : 'Save Draft'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...monoStyle, marginBottom: 6 }}>NOTES (optional)</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes for this decision..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Decision buttons */}
            <div className="glass" style={{ padding: '14px 16px' }}>
              <div style={{ ...labelStyle, marginBottom: 12 }}>DECISION</div>
              {decisionBadge && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Previous decision: <span style={{ color: DECISION_COLOR[decisionBadge], fontWeight: 600 }}>{DECISION_LABEL[decisionBadge]}</span>
                  {detail.latestDecision?.notes && ` — "${detail.latestDecision.notes}"`}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.75rem',
                    background: canApprove ? 'var(--status-ok)' : 'var(--bg-elevated)',
                    opacity: canApprove ? 1 : 0.5,
                  }}
                  disabled={deciding || !canApprove}
                  onClick={() => handleDecide('approve')}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '0.75rem', color: 'var(--status-warn)', borderColor: 'var(--status-warn)44' }}
                  disabled={deciding}
                  onClick={() => handleDecide('request-edit')}
                >
                  ↩ Request Edit
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '0.75rem', color: 'var(--status-error)', borderColor: 'var(--status-error)44', marginLeft: 'auto' }}
                  disabled={deciding}
                  onClick={() => {
                    if (confirm('Reject this clip? This will reset the candidate to pending.')) {
                      handleDecide('reject');
                    }
                  }}
                >
                  ✕ Reject
                </button>
              </div>
              {!canApprove && (
                <div style={{ ...monoStyle, marginTop: 8, color: 'var(--text-dim)' }}>
                  Generate or enter a title to enable Approve
                </div>
              )}
            </div>

            {/* Previous decisions history */}
            {detail.decisions && detail.decisions.length > 1 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ ...monoStyle, marginBottom: 8 }}>DECISION HISTORY</div>
                {detail.decisions.map(d => (
                  <div key={d.id} style={{ ...monoStyle, marginBottom: 4 }}>
                    <span style={{ color: DECISION_COLOR[d.decision] }}>{DECISION_LABEL[d.decision]}</span>
                    {' '}— {new Date(d.decidedAt).toLocaleString()}
                    {d.notes && <span> — {d.notes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
