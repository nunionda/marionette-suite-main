import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Legend
} from 'recharts';

const AnalyticsDashboard = ({ data }) => {
  // Mock data if no analysisData is provided
  const defaultData = {
    emotionalArc: [
      { name: 'Opener', valence: 8 },
      { name: 'Debate', valence: 3 },
      { name: 'Fun & Games', valence: 6 },
      { name: 'Midpoint', valence: -8 },
      { name: 'Dark Soul', valence: -10 },
      { name: 'Climax', valence: 10 }
    ],
    characterMap: [
      { subject: 'Protagonist', A: 90, B: 80, fullMark: 100 },
      { subject: 'Antagonist', A: 85, B: 95, fullMark: 100 },
      { subject: 'Mentor', A: 60, B: 50, fullMark: 100 },
      { subject: 'Sidekick', A: 40, B: 30, fullMark: 100 }
    ],
    beatProgress: [
      { name: 'Beats', completed: 7, total: 15 }
    ]
  };

  const chartData = data || defaultData;
  const isLive = !!data;

  return (
    <div className="analytics-dashboard" style={{ padding: '30px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', minHeight: '600px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <span className="badge" style={{ 
          padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
          background: isLive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
          color: isLive ? 'black' : 'var(--text-dim)',
          boxShadow: isLive ? '0 0 15px var(--accent-primary)' : 'none'
        }}>
          {isLive ? '● LIVE AI ANALYSIS' : '○ ESTIMATED / SIMULATION'}
        </span>
      </div>
      
      <header style={{ marginBottom: '40px', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '20px' }}>
        <h2 style={{ margin: 0, letterSpacing: '2px' }}>NARRATIVE <span style={{ color: 'var(--accent-primary)' }}>VISION</span></h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AI-Driven Quantitative Analysis of Emotional Arc and Character Agency</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* 1. Emotional Valence Arc */}
        <div className="chart-card glass" style={{ padding: '20px', height: '350px' }}>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>EMOTIONAL VALENCE ARC</h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData.emotionalArc}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={10} />
              <YAxis domain={[-10, 10]} stroke="var(--text-dim)" fontSize={10} />
              <Tooltip 
                contentStyle={{ background: '#111', border: '1px solid var(--accent-primary)', color: '#fff' }}
              />
              <Line type="monotone" dataKey="valence" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Character Prominence Radar */}
        <div className="chart-card glass" style={{ padding: '20px', height: '350px' }}>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>CHARACTER ARCHETYPE BALANCE</h4>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.characterMap}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--text-dim)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
              <Radar name="Prominence" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
              <Radar name="Agency/Power" dataKey="B" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Beat Sheet Progress */}
        <div className="chart-card glass" style={{ padding: '20px', height: '200px', gridColumn: 'span 2' }}>
          <h4 style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>15-BEAT COMPLETION STATUS</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flexGrow: 1, height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
              <div 
                style={{ 
                  width: `${(chartData.beatProgress[0].completed / chartData.beatProgress[0].total) * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                  boxShadow: '0 0 15px var(--accent-primary)'
                }} 
              />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {chartData.beatProgress[0].completed} / {chartData.beatProgress[0].total} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 300 }}>BEATS FOUND</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
