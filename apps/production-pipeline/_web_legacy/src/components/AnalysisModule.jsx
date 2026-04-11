import React, { useState, useEffect } from 'react';
import '../styles/AnalysisModule.css';

const AnalysisModule = ({ projectId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4005/report/${encodeURIComponent(projectId)}`);
        if (!res.ok) throw new Error('Report not found');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [projectId]);

  if (loading) return <div className="analysis-loading mono">SYNCHRONIZING LOGIC ENGINE...</div>;
  if (error) return <div className="analysis-error glass mono">⚠️ ANALYSIS DATA NOT FOUND (ID: {projectId})</div>;

  const { summary, predictions, emotionGraph } = data;

  // Render SVG Sparkline for Emotion (Valence)
  const renderEmotionSparkline = () => {
    if (!emotionGraph || emotionGraph.length === 0) return null;
    
    const width = 800;
    const height = 150;
    const padding = 20;
    
    const points = emotionGraph.map((scene, i) => {
      const x = (i / (emotionGraph.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((scene.valence + 1) / 2) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="emotion-sparkline">
        <defs>
          <linearGradient id="valenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff00cc" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#valenceGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Baseline */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
      </svg>
    );
  };

  return (
    <div className="analysis-module glass">
      <div className="analysis-grid">
        {/* Core Metrics */}
        <div className="analysis-card glass">
          <div className="card-label mono">INVESTMENT VERDICT</div>
          <div className={`roi-badge ${summary.predictedRoi === 'Blockbuster' ? 'gold' : 'blue'}`}>
            {summary.predictedRoi}
          </div>
          <div className="rating-tag mono">MPAA: {summary.predictedRating}</div>
        </div>

        <div className="analysis-card glass">
          <div className="card-label mono">MARKET PREDICTION (KR)</div>
          <div className="market-value">{predictions?.boxOfficeHigh || '0'} <span>M</span></div>
          <div className="market-label mono">ESTIMATED ATTENDANCE</div>
        </div>

        <div className="analysis-card glass">
          <div className="card-label mono">SENTIMENT SCORE</div>
          <div className="sentiment-value">84<span>/100</span></div>
          <div className="sentiment-bar">
            <div className="sentiment-fill" style={{ width: '84%' }}></div>
          </div>
        </div>
      </div>

      <div className="emotion-section glass">
        <div className="section-header">
          <div className="card-label mono">NARRATIVE VALENCE GRAPH</div>
          <div className="legend mono">
            <span className="pos">POSITIVE</span>
            <span className="neg">NEGATIVE</span>
          </div>
        </div>
        <div className="sparkline-container">
          {renderEmotionSparkline()}
        </div>
      </div>

      <div className="analysis-footer">
        <button 
          className="tactical-btn" 
          onClick={() => window.open(`http://localhost:4000/dashboard?reportId=${projectId}`, '_blank')}
        >
          OPEN FULL ANALYSIS DASHBOARD ↗
        </button>
      </div>
    </div>
  );
};

export default AnalysisModule;
