'use client';

import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: 'coverage', label: 'Coverage', icon: '📋' },
  { id: 'production', label: 'Production', icon: '🎬' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'characters', label: 'Characters', icon: '👥' },
  { id: 'arc', label: 'Arc', icon: '📈' },
  { id: 'market', label: 'Market', icon: '💰' },
  { id: 'beats', label: 'Beats', icon: '🎵' },
];

export default function SectionNav() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="section-nav no-print" aria-label="Section navigation">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          className={`section-nav-item ${activeSection === s.id ? 'active' : ''}`}
          onClick={() => scrollTo(s.id)}
          title={s.label}
        >
          <span className="section-nav-icon">{s.icon}</span>
          <span className="section-nav-label">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
