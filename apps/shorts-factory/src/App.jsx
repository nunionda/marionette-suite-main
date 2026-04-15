import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SourceManager from './components/SourceManager';
import AssetList from './components/AssetList';
import CandidateEditor from './components/CandidateEditor';
import ReviewPanel from './components/ReviewPanel';
import SubtitleEditor from './components/SubtitleEditor';
import PublishQueue from './components/PublishQueue';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import KpopGroupBrowser from './components/KpopGroupBrowser';

const PAGES = {
  dashboard:  { label: 'Dashboard',  icon: '📊' },
  sources:    { label: 'Sources',    icon: '📡' },
  assets:     { label: 'Assets',     icon: '🎬' },
  subtitles:  { label: 'Subtitles',  icon: '💬' },
  review:     { label: 'Review',     icon: '✅' },
  publish:    { label: 'Publish',    icon: '📤' },
  analytics:  { label: 'Analytics',  icon: '📈' },
  kpop:       { label: 'K-pop DB',   icon: '⭐' },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  // selectedAssetId drives the CandidateEditor — set when user clicks "Edit Clips"
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const navigateTo = (p) => {
    setPage(p);
    if (p !== 'candidates') setSelectedAssetId(null);
  };

  const openCandidates = (assetId) => {
    setSelectedAssetId(assetId);
    setPage('candidates');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'sources':
        return <SourceManager />;
      case 'assets':
        return <AssetList onEditClips={openCandidates} />;
      case 'candidates':
        return selectedAssetId
          ? <CandidateEditor assetId={selectedAssetId} onBack={() => navigateTo('assets')} />
          : <AssetList onEditClips={openCandidates} />;
      case 'subtitles':
        return <SubtitleEditor />;
      case 'review':
        return <ReviewPanel />;
      case 'publish':
        return <PublishQueue />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'kpop':
        return <KpopGroupBrowser />;
      default:
        return (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{PAGES[page]?.icon}</div>
            <div style={{ fontSize: '0.9rem' }}>{PAGES[page]?.label} — Coming Soon</div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: 200,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '8px 16px 20px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--gold)',
          }}>
            Shorts Factory
          </div>
          <div style={{
            fontSize: '0.55rem',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px',
            marginTop: 4,
          }}>
            MARIONETTE SUITE
          </div>
        </div>

        {/* Nav items */}
        {Object.entries(PAGES).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => navigateTo(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: (page === key || (page === 'candidates' && key === 'assets'))
                ? 'var(--bg-hover)' : 'transparent',
              border: 'none',
              borderLeft: (page === key || (page === 'candidates' && key === 'assets'))
                ? '2px solid var(--gold)' : '2px solid transparent',
              color: (page === key || (page === 'candidates' && key === 'assets'))
                ? 'var(--text-bright)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-body)',
              fontWeight: (page === key || (page === 'candidates' && key === 'assets')) ? 600 : 400,
              textAlign: 'left',
              transition: 'var(--transition-smooth)',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-floor)' }}>
        {renderPage()}
      </main>
    </div>
  );
}
