import React, { useState, useEffect } from 'react';
import './BenchmarkInsights.css';

const BenchmarkInsights = () => {
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/system/benchmarks');
        if (res.ok) {
          const data = await res.json();
          setBenchmarks(data);
        }
      } catch (err) {
        console.error("Failed to fetch benchmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmarks();
  }, []);

  if (loading) return <div className="mono small p-24">Analyzing Multimodal Benchmarks...</div>;
  if (!benchmarks) return <div className="mono small p-24 muted">Benchmark data unavailable.</div>;

  return (
    <div className="benchmark-insights glass">
      <div className="sidebar-label mono">MODEL ORCHESTRATION INSIGHTS</div>
      <div className="benchmark-grid">
        {Object.entries(benchmarks.agents).map(([id, cfg]) => (
          <div key={id} className="benchmark-card glass">
            <div className="agent-header flex-between">
              <span className="mono bold">{cfg.name}</span>
              <span className="node-tag x-small mono">AGENT_ID: {id}</span>
            </div>
            
            <div className="model-comparison">
              <div className="model-row">
                <span className="label x-small mono muted">DEV (FREE)</span>
                <span className="value mono accent">{cfg.dev_model}</span>
              </div>
              <div className="model-row">
                <span className="label x-small mono muted">TARGET (FRONTIER)</span>
                <span className="value mono">{cfg.target_model}</span>
              </div>
            </div>

            <div className="reasoning-box x-small muted italic">
              ↳ {cfg.reason}
            </div>
            
            <div className="gap-indicator">
              <div className="gap-bar">
                <div className="gap-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="x-small mono muted">Intelligence Gap: ~15%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="benchmark-footer glass small">
        <div className="flex-between">
          <span className="mono">SOURCE: /Users/daniel/dev/multimodal-benchmark-2026</span>
          <span className="mono">LAST SYNC: {benchmarks.benchmark_metadata.last_sync}</span>
        </div>
        <p className="mono x-small accent" style={{ marginTop: '8px' }}>
          💡 SYSTEM_RULE: {benchmarks.benchmark_metadata.economy_mode_rule}
        </p>
      </div>
    </div>
  );
};

export default BenchmarkInsights;
