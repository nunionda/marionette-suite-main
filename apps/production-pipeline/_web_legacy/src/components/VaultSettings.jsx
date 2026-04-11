import React, { useState, useEffect } from 'react';
import AssetLibrary from './AssetLibrary';
import './VaultSettings.css';

const API_BASE = '/api/vault';

const VaultSettings = () => {
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'assets'
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState({ provider: 'openrouter', api_key: '' });
  const [status, setStatus] = useState(null);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${API_BASE}/credentials`);
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'keys') {
      fetchCredentials();
    }
  }, [activeTab]);

  const handleAddKey = async () => {
    if (!newKey.api_key) return;
    setStatus('Saving...');
    try {
      const res = await fetch(`${API_BASE}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      });
      if (res.ok) {
        setStatus('✅ Saved successfully');
        setNewKey({ ...newKey, api_key: '' });
        fetchCredentials();
      } else {
        setStatus('❌ Failed to save');
      }
    } catch {
      setStatus('❌ Network error');
    }
  };

  return (
    <div className="vault-settings-native">
      <div className="vault-header flex-between">
        <div className="sidebar-label mono accent">/ ENCRYPTED_SECURITY_VAULT /</div>
        <div className="tab-switcher mono x-small">
          <button 
            className={`tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          > AUTH_KEYS </button>
          <button 
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          > MASTER_ASSET_LIB </button>
        </div>
      </div>
      
      {activeTab === 'keys' ? (
        <div className="vault-content fade-in">
          <div className="vault-form">
            <div className="input-group-row">
              <select 
                value={newKey.provider} 
                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                className="mono"
              >
                <option value="openrouter">OpenRouter (Claude/Llama)</option>
                <option value="gemini">Google Gemini AI</option>
                <option value="elevenlabs">ElevenLabs Voice Engine</option>
                <option value="suno">Suno Audio Intelligence</option>
              </select>
              <input 
                type="password"
                placeholder="COMMIT SECRET KEY..."
                value={newKey.api_key}
                onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                className="mono accent"
              />
              <button onClick={handleAddKey} className="tactical-btn primary">UPGRADE_SECRET</button>
            </div>
            {status && <div className="status-msg mono accent italic" style={{ marginTop: '12px', fontSize: '0.7rem' }}>>> {status}</div>}
          </div>

          <div className="credential-list">
            <div className="sidebar-label mono accent" style={{ marginTop: '32px', opacity: 0.8, fontSize: '0.6rem' }}>/ ACTIVE_OPERATIONAL_CREDENTIALS /</div>
            {loading ? (
              <div className="mono" style={{ fontSize: '0.7rem', padding: '20px' }}>INITIALIZING_VAULT_DECODER...</div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                {credentials.map(cred => (
                  <div key={cred.id} className="cred-item flex-between">
                    <div className="mono" style={{ fontSize: '0.75rem' }}>
                      <span className="accent">{cred.provider.toUpperCase()}</span>
                      <span style={{ opacity: 0.4 }}> // {cred.key_name}</span>
                    </div>
                    <div className="status-dot-mini" title="Encrypted & Active" />
                  </div>
                ))}
              </div>
            )}
            {credentials.length === 0 && !loading && <div className="mono muted" style={{ fontSize: '0.7rem', padding: '20px' }}>NO_MATCHING_CREDENTIALS_FOUND.</div>}
          </div>

          <div className="vault-notice mono muted">
            SYSTEM_PROTOCOL: AES-256 BIT ENCRYPTED STORAGE ACTIVE. NO RECOVERY POSSIBLE ONCE SHREDDED.
          </div>
        </div>
      ) : (
        <AssetLibrary />
      )}
    </div>
  );
};

export default VaultSettings;
