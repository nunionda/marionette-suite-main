import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  { id: 'storyboard', name: 'Storyboard', icon: '🎬' },
  { id: 'character', name: 'Character', icon: '👤' },
  { id: 'environment', name: 'Environment', icon: '🏜️' },
  { id: 'prop', name: 'Prop', icon: '🏮' },
  { id: 'costume', name: 'Costume', icon: '🎭' },
  { id: 'set', name: 'Set Design', icon: '🏛️' },
  { id: 'makeup', name: 'SFX Makeup', icon: '🧛' }
];

const MasterStyleSelector = ({ onChange }) => {
  const [masters, setMasters] = useState({});
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await fetch('/api/system/masters');
        const data = await response.json();
        if (data && !data.error) {
          setMasters(data);
        }
      } catch (err) {
        console.error('Failed to fetch masters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const handleSelect = (deptId, masterId) => {
    const newSelections = { ...selections, [deptId]: masterId };
    setSelections(newSelections);
    if (onChange) {
      onChange(newSelections);
    }
  };

  if (loading) return <div className="mono" style={{ fontSize: '0.7rem', opacity: 0.5 }}>Loading Master Database...</div>;

  return (
    <div className="master-style-selector glass" style={{
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(0, 255, 255, 0.02)',
      border: '1px solid rgba(0, 255, 255, 0.1)',
      marginBottom: '16px'
    }}>
      <div className="mono" style={{ 
        fontSize: '0.65rem', 
        color: 'var(--accent-primary)', 
        marginBottom: '12px',
        letterSpacing: '0.1em'
      }}>
        HOLLYWOOD MASTER STYLE INJECTION
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '12px' 
      }}>
        {DEPARTMENTS.map(dept => (
          <div key={dept.id} className="dept-select-group">
            <label className="mono" style={{ 
              display: 'block', 
              fontSize: '0.6rem', 
              color: 'var(--text-dim)',
              marginBottom: '4px'
            }}>
              {dept.icon} {dept.name}
            </label>
            <select 
              value={selections[dept.id] || ''} 
              onChange={(e) => handleSelect(dept.id, e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            >
              <option value="">Default (AI Pure)</option>
              {masters[dept.id]?.map(master => (
                <option key={master.id} value={master.id}>
                  {master.name.split('(')[0].trim()} ({master.styleLabel})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasterStyleSelector;
