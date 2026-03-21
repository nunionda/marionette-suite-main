'use client';

import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
  labelKo: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: 'coverage', label: 'Coverage', labelKo: '커버리지', icon: '📋' },
  { id: 'production', label: 'Production', labelKo: '제작', icon: '🎬' },
  { id: 'stats', label: 'Stats', labelKo: '통계', icon: '📊' },
  { id: 'characters', label: 'Characters', labelKo: '캐릭터', icon: '👥' },
  { id: 'arc', label: 'Arc', labelKo: '아크', icon: '📈' },
  { id: 'market', label: 'Market', labelKo: '마켓', icon: '💰' },
  { id: 'beats', label: 'Beats', labelKo: '비트', icon: '🎵' },
];

interface SectionNavProps {
  locale?: 'en' | 'ko';
}

export default function SectionNav({ locale = 'en' }: SectionNavProps) {
  const ko = locale === 'ko';
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
    <nav className="section-nav no-print" aria-label={ko ? '섹션 탐색' : 'Section navigation'}>
      {SECTIONS.map(s => (
        <button
          key={s.id}
          className={`section-nav-item ${activeSection === s.id ? 'active' : ''}`}
          onClick={() => scrollTo(s.id)}
          title={ko ? s.labelKo : s.label}
        >
          <span className="section-nav-icon">{s.icon}</span>
          <span className="section-nav-label">{ko ? s.labelKo : s.label}</span>
        </button>
      ))}
    </nav>
  );
}
