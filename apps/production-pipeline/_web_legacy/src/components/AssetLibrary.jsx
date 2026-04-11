import React, { useState, useEffect } from 'react';
import AssetCard from './AssetCard';

const ASSET_API = '/api/assets';

const AssetLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', tag: '' });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.type) query.append('asset_type', filter.type);
      if (filter.tag) query.append('tag', filter.tag);
      
      const res = await fetch(`${ASSET_API}/?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  return (
    <div className="asset-library-native fade-in">
      <div className="library-filters flex-between glass">
        <select 
          value={filter.type} 
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="node-tag mono x-small"
        >
          <option value="">ALL TYPES</option>
          <option value="concept_artist">CONCEPT ART</option>
          <option value="location_scout">LOCATION</option>
          <option value="generalist">VIDEO</option>
          <option value="asset_designer">3D ASSET</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search tags..." 
          value={filter.tag}
          onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
          className="mono x-small search-input"
        />
      </div>

      <div className="asset-grid mt-20">
        {loading ? (
          <div className="mono small muted text-center p-20">SCANNING BACKLOT...</div>
        ) : assets.length > 0 ? (
          assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} onRefresh={fetchAssets} />
          ))
        ) : (
          <div className="mono small muted text-center p-20 glass">NO ASSETS FOUND IN VAULT</div>
        )}
      </div>
    </div>
  );
};

export default AssetLibrary;
