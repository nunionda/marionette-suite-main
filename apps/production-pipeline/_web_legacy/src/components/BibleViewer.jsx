import React, { useState, useEffect } from 'react';
import './BibleViewer.css';

const BibleViewer = ({ projectId, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBible = async () => {
      try {
        const res = await fetch(`/api/bible/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        } else {
          setContent('# ERROR: BIBLE_NOT_GENERATED\n\nPlease finish the production pipeline first.');
        }
      } catch (err) {
        setContent('# ERROR: CONNECTION_FAILED\n\nEnsure the backend BibleService is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchBible();
  }, [projectId]);

  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="mono accent">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="bible-viewer fade-in">
      <div className="bible-nav">
        <div className="sidebar-label mono accent">/ PRODUCTION_BIBLE_READER / {projectId} /</div>
        <button className="close-bible-btn" onClick={onClose}>CLOSE_ARCHIVE</button>
      </div>

      <div className="bible-scroll-area">
        <div className="bible-document fade-in">
          {loading ? (
            <div className="mono p-20" style={{ textAlign: 'center' }}>UNPACKING_CINEMATIC_INTEL...</div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default BibleViewer;
