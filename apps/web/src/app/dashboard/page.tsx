'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Film, Users, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import './dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phase 4: Fetch from local API
    async function fetchReport() {
      try {
        const res = await fetch('http://localhost:3001/report/fight_club');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("API not ready, using mock data for UI demo");
        // Fallback mock data matching orchestrator output
        setData({
          summary: { protagonist: "JACK", predictedRoi: "Blockbuster", predictedRating: "R" },
          characterNetwork: [
            { name: "JACK", totalLines: 120, role: "Protagonist" },
            { name: "TYLER", totalLines: 110, role: "Antagonist" },
            { name: "MARLA", totalLines: 40, role: "Supporting" }
          ],
          emotionGraph: Array.from({ length: 20 }, (_, i) => ({
            sceneNumber: i + 1,
            score: Math.sin(i / 2) * 8 + (Math.random() * 2)
          })),
          beatSheet: [
            { act: 1, name: "Inciting Incident", description: "Meeting Tyler Durden" },
            { act: 2, name: "Midpoint", description: "Project Mayhem begins" },
            { act: 3, name: "Climax", description: "The skyscraper collapse" }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <div className="dashboard-container">Analyzing Script...</div>;

  return (
    <div className="dashboard-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Script Intelligence</h1>
          <p style={{ color: 'var(--text-dim)' }}>Project ID: Fight Club (Sample)</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={`badge badge-r`}>Rating: {data.summary.predictedRating}</div>
          <div className={`badge badge-blockbuster`}>ROI: {data.summary.predictedRoi}</div>
        </div>
      </header>

      <div className="grid-layout">
        {/* HUD Statistics */}
        <div className="glass-panel stat-card">
          <Film className="icon" style={{ color: 'var(--accent-gold)' }} />
          <h3>Protagonist</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.summary.protagonist}</p>
        </div>
        <div className="glass-panel stat-card">
          <TrendingUp className="icon" style={{ color: '#27ae60' }} />
          <h3>ROI Multiplier</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>12.5x</p>
        </div>
        <div className="glass-panel stat-card">
          <Users className="icon" style={{ color: 'var(--accent-blue)' }} />
          <h3>Cast Members</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.characterNetwork.length}</p>
        </div>
        <div className="glass-panel stat-card">
          <Activity className="icon" style={{ color: '#e74c3c' }} />
          <h3>Volatility</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>High</p>
        </div>

        {/* Emotion Graph */}
        <div className="glass-panel main-chart">
          <h3 style={{ marginBottom: '1.5rem' }}>Emotional Valence Arc</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.emotionGraph}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0070f3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sceneNumber" hide />
              <YAxis domain={[-10, 10]} stroke="var(--text-dim)" />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="score" stroke="#0070f3" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Character Network */}
        <div className="glass-panel sidebar-panel">
          <h3>Character Prominence</h3>
          <div style={{ marginTop: '1rem' }}>
            {data.characterNetwork.map((char: any) => (
              <div key={char.name} className="character-item">
                <div>
                  <div style={{ fontWeight: 600 }}>{char.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{char.role}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{char.totalLines || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Beat Sheet Timeline */}
        <div className="timeline-container">
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Narrative Beat Sheet</h3>
            <div style={{ display: 'flex' }}>
              {data.beatSheet.map((beat: any, idx: number) => (
                <div key={idx} className="beat-node">
                  <div className="dot" />
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>Act {beat.act}</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{beat.name}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'normal' }}>{beat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
