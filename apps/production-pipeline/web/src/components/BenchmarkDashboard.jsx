import React, { useState, useEffect } from 'react';
import './BenchmarkDashboard.css';

const API_BASE = 'http://localhost:8000/api/benchmark';

const BenchmarkDashboard = () => {
  const [suites, setSuites] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchData = async () => {
    try {
      const [suitesRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/suites`),
        fetch(`${API_BASE}/history`)
      ]);
      
      if (suitesRes.ok) setSuites(await suitesRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch (err) {
      console.error("Failed to fetch benchmark data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBenchmark = async (key) => {
    setRunning(true);
    try {
      const res = await fetch(`${API_BASE}/run/${key}`, { method: 'POST' });
      if (res.ok) {
        alert("Benchmark sequence started. Track progress in the main dashboard.");
        fetchData();
      }
    } catch (err) {
      alert("Failed to start benchmark");
    } finally {
      setRunning(false);
    }
  };

  const viewReport = async (runId) => {
    try {
      const res = await fetch(`${API_BASE}/report/${runId}`);
      if (res.ok) {
        setSelectedReport(await res.json());
      }
    } catch (err) {
      console.error("Failed to load report");
    }
  };

  if (loading) return <div className="mono p-20">BOOTING PERFORMANCE MONITOR...</div>;

  return (
    <div className="benchmark-dashboard">
      <div className="sidebar-label mono accent">/ COMMAND_PERFORMANCE_SUITES /</div>
      
      <div className="suites-grid">
        {Object.entries(suites).map(([key, suite]) => (
          <div key={key} className="suite-card">
            <div className="suite-info">
              <h4 className="mono">{suite.title}</h4>
              <p className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                GENRE_{suite.genre.toUpperCase()} // SCENES_{suite.shots_count}
              </p>
              <div className="steps-tags">
                {suite.steps.map(s => <span key={s} className="tag mono">{s.toUpperCase()}</span>)}
              </div>
            </div>
            <button 
              className="tactical-btn primary" 
              style={{ padding: '8px 12px', fontSize: '0.7rem' }}
              disabled={running}
              onClick={() => handleRunBenchmark(key)}
            >
              TRIGGER_EXECUTION
            </button>
          </div>
        ))}
      </div>

      <div className="mt-32">
        <div className="sidebar-label mono accent">/ PERFORMANCE_LOG_ARCHIVE /</div>
        <div className="history-table">
          <div className="table-header mono muted" style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
            <span>RUN_ID</span>
            <span>TIMESTAMP</span>
            <span>OS_STATE</span>
            <span>PRECISION_INTEL</span>
          </div>
          {history.map(run => (
            <div key={run.id} className="table-row mono" style={{ fontSize: '0.7rem' }}>
              <span className="accent">#{run.id.substring(0, 8)}</span>
              <span style={{ opacity: 0.6 }}>{new Date(run.created_at).toLocaleString()}</span>
              <span className={`status-${run.status.toLowerCase()}`}>{run.status.toUpperCase()}</span>
              <button className="text-btn accent" onClick={() => viewReport(run.id)}>VIEW_FULL_REPORT</button>
            </div>
          ))}
        </div>
      </div>

      {selectedReport && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999 }} onClick={() => setSelectedReport(null)}></div>
          <div className="report-modal">
            <div className="flex-between" style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h2 className="serif" style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>Benchmark Report</h2>
              <button className="text-btn" style={{ fontSize: '1.2rem' }} onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            
            <div className="metrics-summary grid-3">
              <div className="stat-card" style={{ borderLeft: '2px solid var(--color-accent)' }}>
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}>TTH (TOTAL_TIME_TO_HOLLY)</span>
                <span className="stat-value" style={{ fontSize: '2.5rem', marginTop: '4px' }}>{selectedReport.total_duration_sec}s</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '2px solid var(--color-gold)' }}>
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}>AVG_SIGNAL_OF_QUALITY</span>
                <span className="stat-value accent" style={{ fontSize: '2.5rem', marginTop: '4px' }}>{selectedReport.average_soq_score.toFixed(1)}</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '2px solid #fff' }}>
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}>AGENTS_DEPLOYED</span>
                <span className="stat-value" style={{ fontSize: '2.5rem', marginTop: '4px', opacity: 0.8 }}>{Object.keys(selectedReport.step_breakdown).length}</span>
              </div>
            </div>

            <div className="mt-32">
               <div className="sidebar-label mono accent" style={{ fontSize: '0.6rem', marginBottom: '16px' }}>/ AGENT_OPS_BREAKDOWN /</div>
               <div style={{ border: '1px solid var(--color-border)' }}>
                 {Object.entries(selectedReport.step_breakdown).map(([step, data]) => (
                   <div key={step} className="flex-between p-10 border-b mono" style={{ padding: '12px 20px' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{step.toUpperCase()}</span>
                     <div className="flex-gap-10">
                       <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{data.duration_sec}S_DUR</span>
                       <div className="score-badge">
                         {data.soq_score ? `SOQ_${data.soq_score}` : 'NO_SCORE'}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="mono muted mt-20" style={{ fontSize: '0.6rem', textAlign: 'center', letterSpacing: '0.1em' }}>
              INTEL_LOG_ID: {selectedReport.run_id}
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default BenchmarkDashboard;
