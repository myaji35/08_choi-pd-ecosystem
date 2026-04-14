'use client';

import { useState } from 'react';
import BrandAdmin from './BrandAdmin';
import { DnaSection, ProfileSection, CampaignsSection, ChannelsSection, RoadmapSection } from './ReportSections';
import type { ChoiBrandColors } from '@/lib/data/choi-brand';

type Tab = 'brand' | 'dna' | 'profile' | 'campaigns' | 'channels' | 'roadmap';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'brand', label: '🎨 브랜드 컬러' },
  { id: 'dna', label: '① DNA 분석' },
  { id: 'profile', label: '② 인물·수상' },
  { id: 'campaigns', label: '③④ 캠페인·소재' },
  { id: 'channels', label: '⑤⑥⑦ 채널·캘린더·태그' },
  { id: 'roadmap', label: '⑧⑨ 포지셔닝·로드맵' },
];

export default function AdminTabs({ initialBrand }: { initialBrand: ChoiBrandColors }) {
  const [tab, setTab] = useState<Tab>('brand');

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--choi-trust)' }}>/choi 관리자</h1>
        <p style={{ fontSize: 13, color: 'var(--choi-ink-muted)', marginTop: 4 }}>
          브랜드 컬러 편집 + Townin Personal DNA Report 전문 (9섹션)
        </p>
      </header>

      {/* Tabs */}
      <nav style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--choi-border)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? 'var(--choi-primary)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--choi-ink-muted)',
              border: 'none',
              borderBottom: tab === t.id ? '3px solid var(--choi-primary)' : '3px solid transparent',
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ background: 'white', border: '1px solid var(--choi-border)', borderRadius: 8, padding: tab === 'brand' ? 0 : '1.5rem', minHeight: 500 }}>
        {tab === 'brand' && <BrandAdmin initial={initialBrand} />}
        {tab === 'dna' && <DnaSection />}
        {tab === 'profile' && <ProfileSection />}
        {tab === 'campaigns' && <CampaignsSection />}
        {tab === 'channels' && <ChannelsSection />}
        {tab === 'roadmap' && <RoadmapSection />}
      </div>
    </div>
  );
}
