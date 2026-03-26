import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import ProjectDetailStyle from '../styles/ProjectDetail.css';
import ArtDeptModule from './ArtDeptModule';
import AnalysisModule from './AnalysisModule';

const ProjectDetail = ({ project, onBack }) => {
  const { updateProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('LOGLINE');

  // Local state for smooth editing
  const [logline, setLogline] = useState(project.logline);
  const [protagonist, setProtagonist] = useState(project.characters?.protagonist || '');
  const [antagonist, setAntagonist] = useState(project.characters?.antagonist || '');
  const [script, setScript] = useState(project.script || '');

  // Sync local state if project prop changes
  useEffect(() => {
    setLogline(project.logline);
    setProtagonist(project.characters?.protagonist || '');
    setAntagonist(project.characters?.antagonist || '');
    setScript(project.script || '');
  }, [project]);

  const handleSaveLogline = () => {
    updateProject(project.id, { logline });
    alert("Logline saved!");
  };

  const handleSaveArchitecture = () => {
    updateProject(project.id, { characters: { protagonist, antagonist } });
    alert("Architecture saved!");
  };

  const handleSaveScript = () => {
    updateProject(project.id, { script });
    alert("Script saved!");
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    alert("Script copied to clipboard! 📋");
  };

  return (
    <div className="project-detail">
      <div className="back-btn" onClick={onBack}>
        ← BACK TO DASHBOARD
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', margin: 0 }}>
              {project.genre} • <span style={{ color: 'var(--accent-primary)' }}>{project.status}</span>
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div className={`status-badge ${project.analysis_status === 'analyzing' ? 'working' : ''}`} style={{ borderColor: project.analysis_status === 'done' ? 'var(--accent-primary)' : 'var(--text-dim)', color: project.analysis_status === 'done' ? 'var(--accent-primary)' : 'var(--text-dim)' }}>
                🧠 Brain: {project.analysis_status?.toUpperCase() || 'NONE'}
              </div>
              <div className={`status-badge ${project.art_bible_status === 'generating' ? 'working' : ''}`} style={{ borderColor: project.art_bible_status === 'ready' ? 'var(--color-gold)' : 'var(--text-dim)', color: project.art_bible_status === 'ready' ? 'var(--color-gold)' : 'var(--text-dim)' }}>
                🎭 Art: {project.art_bible_status?.toUpperCase() || 'NONE'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="tactical-btn"
              style={{
                borderColor: project.analysis_status === 'done' ? 'var(--accent-primary)' : 'var(--text-dim)',
                color: project.analysis_status === 'done' ? 'var(--accent-primary)' : 'var(--text-dim)',
                fontSize: '0.9rem',
                opacity: project.analysis_status === 'analyzing' ? 0.6 : 1
              }}
              onClick={() => {
                const scenarioUrl = import.meta.env.VITE_SCENARIO_ANALYSIS_URL || 'http://localhost:4000';
                window.open(scenarioUrl, '_blank');
              }}
            >
              {project.analysis_status === 'analyzing' ? '🧠 Analyzing...' : project.analysis_status === 'done' ? '🧠 View Brain' : '🧠 Scenario Analysis'}
            </button>
            <button
              className="tactical-btn"
              style={{
                borderColor: project.art_bible_status === 'ready' ? 'var(--color-gold)' : 'var(--text-dim)',
                color: project.art_bible_status === 'ready' ? 'var(--color-gold)' : 'var(--text-dim)',
                fontSize: '0.9rem'
              }}
              onClick={() => {
                const artUrl = import.meta.env.VITE_ART_DEPT_URL || 'http://localhost:3001';
                const params = new URLSearchParams({
                  title: project.title,
                  genre: project.genre,
                  concept: project.logline || '',
                  vision: project.vision || '',
                  auto: 'true'
                });
                window.open(`${artUrl}/?${params.toString()}`, '_blank');
              }}
            >
              {project.art_bible_status === 'generating' ? '🎭 Generating...' : project.art_bible_status === 'ready' ? '🎭 Open Art Bible' : '🎭 Art Department'}
            </button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {['LOGLINE', 'ARCHITECTURE', 'SCRIPT', 'ANALYSIS', 'ART DEPT'].map(tab => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="content">
        {activeTab === 'ANALYSIS' && (
          <AnalysisModule projectId={project.id} />
        )}

        {activeTab === 'ART DEPT' && (
          <ArtDeptModule project={project} />
        )}

        {activeTab === 'LOGLINE' && (
          <div className="section-card glass">
            <h2 className="section-title">Logline Engine</h2>
            <textarea
              className="logline-editor"
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
            />
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <button className="tactical-btn">Auto-Generate</button>
              <button className="tactical-btn" onClick={handleSaveLogline} style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>Save & Lock</button>
            </div>
          </div>
        )}

        {activeTab === 'ARCHITECTURE' && (
          <div className="section-card glass">
            <h2 className="section-title">Character & World Building</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="glass" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Protagonist</h4>
                <textarea
                  style={{ width: '100%', height: '80px', background: 'transparent', border: 'none', color: 'var(--text-dim)', resize: 'none' }}
                  value={protagonist}
                  onChange={(e) => setProtagonist(e.target.value)}
                  placeholder="Describe protagonist..."
                />
              </div>
              <div className="glass" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Antagonist</h4>
                <textarea
                  style={{ width: '100%', height: '80px', background: 'transparent', border: 'none', color: 'var(--text-dim)', resize: 'none' }}
                  value={antagonist}
                  onChange={(e) => setAntagonist(e.target.value)}
                  placeholder="Describe antagonist..."
                />
              </div>
            </div>
            <button className="tactical-btn" onClick={handleSaveArchitecture} style={{ marginTop: '24px' }}>Save Architecture</button>
          </div>
        )}

        {activeTab === 'SCRIPT' && (
          <div className="section-card">
            <h2 className="section-title">Master Scene Format</h2>
            <textarea
              className="script-view"
              style={{ width: '100%', minHeight: '400px', resize: 'vertical' }}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Start writing scene..."
            />
            <button className="tactical-btn" onClick={handleSaveScript} style={{ marginTop: '24px' }}>Save Script</button>
            <button className="tactical-btn" onClick={handleCopyScript} style={{ marginTop: '24px', marginLeft: '12px', borderColor: 'var(--text-dim)', color: 'var(--text-dim)' }}>Copy to Clipboard 📋</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
