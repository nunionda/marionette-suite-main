import React, { useState } from 'react';
import '../styles/Dashboard.css';

const CATEGORIES = [
  { id: 'Feature Film', name: '🎥 Feature Film', desc: 'Full-length theatrical screenplay, 3-act structure (90-120p)' },
  { id: 'Short Film', name: '🎬 Short Film', desc: 'Single theme, high mise-en-scène (5-20p)' },
  { id: 'Netflix Original', name: '📺 Netflix Original', desc: 'Binge-hook strategy, serialized arcs (8-10 episodes)' },
  { id: 'Commercial', name: '💼 Commercial / Ad', desc: 'USP-focused, A/V Two-Column format (15-60s)' }
];

const GENRES = [
  { id: 'Thriller', name: '🔪 Thriller / Action' },
  { id: 'Drama', name: '🫂 Human Drama' },
  { id: 'SF', name: '🛸 SF / Mystery' },
  { id: 'Comedy', name: '🤡 Comedy / Satire' }
];

const ProjectCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Feature Film');
  const [genre, setGenre] = useState('Thriller');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onCreate({ title, category, genre });
    setTitle('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-dark project-create-modal animate-in">
        <div className="modal-header">
          <h2 className="gradient-text cinematic-title">INITIATE MISSION</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PROJECT TITLE</label>
            <input 
              type="text" 
              className="tactical-input" 
              placeholder="e.g. THE ALGORITHM"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>MEDIA CATEGORY</label>
              <div className="category-list">
                {CATEGORIES.map(cat => (
                  <div 
                    key={cat.id} 
                    className={`category-item glass-hover ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-desc">{cat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>GENRE MODULE</label>
              <div className="genre-grid">
                {GENRES.map(g => (
                  <div 
                    key={g.id} 
                    className={`genre-item glass-hover ${genre === g.id ? 'active' : ''}`}
                    onClick={() => setGenre(g.id)}
                  >
                    {g.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="tactical-btn secondary" onClick={onClose}>ABORT</button>
            <button type="submit" className="tactical-btn glow-effect">EXECUTE PRODUCTION</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
