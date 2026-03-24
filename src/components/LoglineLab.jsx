import React, { useState, useEffect } from 'react';
import { useAgentEngine } from '../hooks/useAgentEngine';
import loglineRule from '../.agents/rules/logline_engine.md?raw';

const LoglineLab = () => {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey') || '');
  const [inputBrief, setInputBrief] = useState('');
  const [generatedLogline, setGeneratedLogline] = useState('');
  const [savedLoglines, setSavedLoglines] = useState([]);
  const [category, setCategory] = useState('Movie');
  const [genre, setGenre] = useState('Thriller');

  // We use useAgentEngine to handle the streaming
  const handleUpdateField = (field, value) => {
    if (field === 'logline') setGeneratedLogline(value);
  };
  
  const { executeAgent, isGenerating, generationStatus } = useAgentEngine(apiKey, handleUpdateField);

  useEffect(() => {
    fetchSavedLoglines();
  }, []);

  const fetchSavedLoglines = async () => {
    try {
      console.log("Fetching loglines via proxy /api/loglines...");
      const res = await fetch('/api/loglines');
      const data = await res.json();
      setSavedLoglines(data.loglines || []);
    } catch (e) {
      console.error("Failed to fetch loglines.");
    }
  };

  const generateIdea = () => {
    if (!inputBrief.trim()) {
      alert("Please enter an idea or theme first.");
      return;
    }
    setGeneratedLogline('');
    const prompt = `[Categorical Context]: ${category}\n[Genre]: ${genre}\n[User Brief]: ${inputBrief}\n\n위 아이디어를 바탕으로 천만 관객의 심장을 관통하는 단 한 문장의 하이-컨셉 로그라인을 도출하세요.`;
    executeAgent(loglineRule, prompt, 'logline', false, 'Brainstorming...');
  };

  const saveToDatabase = async () => {
    if (!generatedLogline) return;
    
    // Extract JSON if present in the response
    let finalContent = generatedLogline;
    let finalTitle = "";
    
    try {
      const jsonMatch = generatedLogline.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        finalContent = parsed.logline || generatedLogline;
        finalTitle = parsed.title || "";
      }
    } catch (e) {
      console.warn("Could not parse AI response as JSON, saving as raw string.");
    }

    try {
      console.log("Saving logline via proxy /api/loglines...", { content: finalContent, category: finalTitle, genre });
      const res = await fetch('/api/loglines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalContent,
          category: finalTitle ? `${category} | ${finalTitle}` : category,
          genre
        })
      });
      const data = await res.json();
      console.log("Save Result:", data);
      if (data.success) {
        setSavedLoglines(prev => [data.logline, ...prev]);
        alert("Idea saved successfully!");
      } else {
        alert("Server Error: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error("Save failed:", e);
      alert("Network Error: " + e.message + "\n(Is the server running on port 3005?)");
    }
  };

  const deleteLogline = async (id) => {
    if (!window.confirm("Delete this idea?")) return;
    try {
      const res = await fetch(`/api/loglines/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSavedLoglines(savedLoglines.filter(idea => idea.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete logline.");
    }
  };

  return (
    <div className="logline-lab-container animate-in">
      <div className="lab-header">
        <h2 className="gradient-text cinematic-title">💡 LOGLINE IDEA LAB</h2>
        <p className="lab-desc">Standalone repository for high-concept brainstorming.</p>
      </div>

      <div className="lab-grid">
        {/* 🧠 GENERATION ZONE */}
        <section className="lab-section brainstorm-zone glass-dark">
          <h3 className="section-title">Brainstorming Stage</h3>
          <div className="form-group">
            <label>CORE IDEA / THEME</label>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
              TIP: <span style={{ color: 'var(--accent-secondary)' }}>"[주인공]이 [어떤 장애물]에 맞서 [목표]를 이루기 위해 [행동]하는 이야기"</span> 구조로 생각해보세요.
            </div>
            <textarea 
              className="tactical-input lab-textarea"
              placeholder="예: [어린 소년 토토]가 [전쟁과 가난]에 맞서 [영화감독의 꿈]을 이루기 위해 [영사기사 알프레도와 우정을 쌓는] 이야기"
              value={inputBrief}
              onChange={(e) => setInputBrief(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CATEGORY</label>
              <select className="tactical-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Movie</option>
                <option>Series</option>
                <option>Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label>GENRE</label>
              <select className="tactical-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option>Thriller</option>
                <option>Drama</option>
                <option>SF</option>
                <option>Horror</option>
                <option>Comedy</option>
              </select>
            </div>
          </div>

          <button className="tactical-btn glow-effect full-width" onClick={generateIdea} disabled={isGenerating}>
            {isGenerating ? generationStatus.toUpperCase() : "⚡ GENERATE LOGLINE"}
          </button>

          {generatedLogline && (
            <div className="generation-result animate-in">
              <div className="result-header">
                <span className="badge production">RESULT</span>
                <button className="btn-save-idea" onClick={saveToDatabase}>💾 SAVE TO STORAGE</button>
              </div>
              <p className="result-text">{generatedLogline}</p>
            </div>
          )}
        </section>

        {/* 📂 STORAGE ZONE */}
        <section className="lab-section storage-zone glass-dark">
          <h3 className="section-title">Idea Repository ({savedLoglines.length})</h3>
          <div className="ideas-scroll">
            {savedLoglines.length === 0 ? (
              <div className="empty-ideas">No saved ideas yet.</div>
            ) : (
              savedLoglines.map(idea => (
                <div key={idea.id} className="saved-idea-card glass-hover" style={{ position: 'relative' }}>
                  <button 
                    className="delete-card-btn" 
                    onClick={() => deleteLogline(idea.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                  >
                    ✕
                  </button>
                  <div className="idea-meta">
                    <span className="idea-cat">{idea.category}</span>
                    <span className="idea-genre">{idea.genre}</span>
                  </div>
                  <p className="idea-content" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {idea.content}
                  </p>
                  <span className="idea-date">{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoglineLab;
