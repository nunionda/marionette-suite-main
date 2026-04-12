import React, { useState } from 'react';
import { calculateGateReadiness, generateDispatchXML } from '../utils/gsExporter';

/**
 * GS Stage Gate Checklist — shows deliverable completion status
 * against Global Studios Standard pipeline requirements.
 */
const StageGateChecklist = ({ project, pipelineData, category }) => {
  const [showXML, setShowXML] = useState(false);
  const readiness = calculateGateReadiness(project, pipelineData, category);

  if (readiness.total === 0) return null;

  const statusIcon = (status) => {
    if (status === 'complete') return '✅';
    if (status === 'planned') return '📋';
    return '⬜';
  };

  const statusLabel = (status) => {
    if (status === 'complete') return 'COMPLETE';
    if (status === 'planned') return 'PLANNED';
    return 'NOT STARTED';
  };

  const xml = showXML ? generateDispatchXML(project, pipelineData, category) : '';

  return (
    <section className="sidebar-section">
      <h4 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>GS Stage Gate {readiness.gate}</span>
        <span style={{
          fontSize: '0.65rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: readiness.gateReady ? 'rgba(74,222,128,0.2)' : 'rgba(251,146,60,0.2)',
          color: readiness.gateReady ? '#4ade80' : '#fb923c',
          border: `1px solid ${readiness.gateReady ? 'rgba(74,222,128,0.4)' : 'rgba(251,146,60,0.4)'}`,
        }}>
          {readiness.gateReady ? 'READY' : `${readiness.percent}%`}
        </span>
      </h4>

      {/* Progress bar */}
      <div style={{
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        marginBottom: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${readiness.percent}%`,
          background: readiness.gateReady
            ? 'linear-gradient(90deg, #4ade80, #22c55e)'
            : 'linear-gradient(90deg, #fb923c, #f97316)',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Deliverable list */}
      <div style={{ fontSize: '0.7rem', lineHeight: '1.8' }}>
        {readiness.items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: item.status === 'planned' ? 0.5 : 1,
          }}>
            <span>
              {statusIcon(item.status)} {item.label}
            </span>
            <span style={{
              fontSize: '0.6rem',
              color: item.status === 'complete' ? '#4ade80' : 'var(--text-muted)',
            }}>
              {statusLabel(item.status)}
            </span>
          </div>
        ))}
      </div>

      {/* Agent info */}
      <div style={{
        marginTop: '10px',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '8px',
      }}>
        {readiness.completed}/{readiness.total} deliverables · CINE Agent
      </div>

      {/* Export button */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
        <button
          className="btn-secondary"
          onClick={() => setShowXML(!showXML)}
          style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px' }}
        >
          {showXML ? '✕ Close' : '📤 GS Dispatch XML'}
        </button>
      </div>

      {showXML && (
        <pre style={{
          marginTop: '8px',
          padding: '10px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          fontSize: '0.6rem',
          color: '#a5b4fc',
          overflow: 'auto',
          maxHeight: '200px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {xml}
        </pre>
      )}
    </section>
  );
};

export default StageGateChecklist;
