import React from 'react';

const AssetCard = ({ asset, onRefresh }) => {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this asset from global vault?")) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/assets/${asset.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  };

  // 썸네일 경로 처리 (로컬 vs 클라우드)
  const isCloud = asset.output_path?.startsWith('http');
  const previewUrl = isCloud ? asset.output_path : `http://localhost:8000/output/${asset.output_path?.split('/').pop()}`;

  return (
    <div className="asset-card glass fade-in">
      <div className="asset-preview">
        {asset.asset_type === 'generalist' ? (
          <video src={previewUrl} muted loop onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
        ) : (
          <img src={previewUrl} alt={asset.name} loading="lazy" />
        )}
        <div className="asset-overlay">
          <button className="delete-btn x-small mono" onClick={handleDelete}>DELETE</button>
        </div>
      </div>
      
      <div className="asset-info p-10">
        <div className="flex-between">
          <span className="asset-name mono small">{asset.name.substring(0, 15)}{asset.name.length > 15 ? '...' : ''}</span>
          <span className="asset-v mono x-small muted">V{asset.version}</span>
        </div>
        <div className="asset-tags mt-5">
          {asset.tags?.split(',').map((tag, i) => (
            <span key={i} className="tag mono x-small">#{tag.trim()}</span>
          ))}
        </div>
        <div className="asset-meta mt-10 flex-between">
          <span className="mono x-small muted">{new Date(asset.created_at).toLocaleDateString()}</span>
          <div className={`verify-dot ${asset.is_verified ? 'active' : ''}`} title="Verified Asset" />
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
