'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_CHOI_BRAND,
  BRAND_COLOR_KEYS,
  BRAND_LABELS,
  type ChoiBrandColors,
} from '@/lib/data/choi-brand';

interface Props {
  initial: ChoiBrandColors;
}

export default function BrandAdmin({ initial }: Props) {
  const [brand, setBrand] = useState<ChoiBrandColors>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const update = useCallback((key: keyof ChoiBrandColors, value: string) => {
    setBrand((p) => ({ ...p, [key]: value }));
  }, []);

  const resetDefaults = useCallback(() => setBrand(DEFAULT_CHOI_BRAND), []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch('/api/choi/brand', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(brand),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(j.error || `HTTP ${r.status}`);
      }
      setSavedAt(new Date().toLocaleTimeString('ko-KR'));
      // 프리뷰 재로드
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [brand]);

  // 프리뷰 iframe은 초기 /choi 라우트 반영 (저장 후 리로드)
  const previewSrc = '/choi';

  // 4개 그룹으로 묶기 (Primary / Accent / Secondary / Trust + 중립)
  const groups = useMemo(() => ({
    '핵심 (Primary)': ['primary', 'primaryDark'] as (keyof ChoiBrandColors)[],
    '강조 (Accent)': ['accent', 'accentSoft'] as (keyof ChoiBrandColors)[],
    '보조 (Secondary)': ['secondary', 'secondarySoft'] as (keyof ChoiBrandColors)[],
    '신뢰 (Trust)': ['trust', 'trustSoft'] as (keyof ChoiBrandColors)[],
    '중립 (Neutral)': ['surface', 'ink', 'inkMuted', 'border'] as (keyof ChoiBrandColors)[],
  }), []);

  return (
    <div style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: 13, color: 'var(--choi-ink-muted)', marginBottom: '1rem' }}>
        12개 컬러 토큰을 편집 → 저장 시 <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 3 }}>data/choi-brand.json</code>에 기록되어
        <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 3, marginLeft: 4 }}>/choi/*</code> 전 페이지에 즉시 반영됩니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Editor */}
        <section style={{ background: 'white', border: '1px solid var(--choi-border)', borderRadius: 8, padding: '1.25rem', position: 'sticky', top: 24 }}>
          {Object.entries(groups).map(([groupLabel, keys]) => (
            <div key={groupLabel} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--choi-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid var(--choi-border)', paddingBottom: 4 }}>
                {groupLabel}
              </h3>
              {keys.map((k) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--choi-ink)', marginBottom: 4 }}>
                    {BRAND_LABELS[k].label}
                    <span style={{ color: 'var(--choi-ink-muted)', fontWeight: 400, marginLeft: 6 }}>· {BRAND_LABELS[k].hint}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={brand[k]}
                      onChange={(e) => update(k, e.target.value)}
                      style={{ width: 44, height: 34, border: '1px solid var(--choi-border)', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                      aria-label={BRAND_LABELS[k].label}
                    />
                    <input
                      type="text"
                      value={brand[k]}
                      onChange={(e) => update(k, e.target.value)}
                      style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 13, padding: '6px 10px', border: '1px solid var(--choi-border)', borderRadius: 4, color: 'var(--choi-ink)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {error && (
            <div style={{ padding: '10px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 6, fontSize: 12, color: '#991B1B', marginBottom: 10 }}>
              저장 실패: {error}
            </div>
          )}
          {savedAt && !error && (
            <div style={{ padding: '10px 12px', background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 6, fontSize: 12, color: '#065F46', marginBottom: 10 }}>
              ✓ 저장 완료 · {savedAt} · 프리뷰를 새로고침했습니다
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={resetDefaults}
              style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--choi-ink)', border: '1px solid var(--choi-border)', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              🔄 Townin 기본값 복구
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                flex: 1,
                padding: '10px',
                background: saving ? 'var(--choi-ink-muted)' : 'var(--choi-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '저장 중…' : '💾 저장 + 적용'}
            </button>
          </div>
        </section>

        {/* Preview */}
        <section style={{ background: 'white', border: '1px solid var(--choi-border)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 14px', background: 'var(--choi-trust)', color: 'white', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>실시간 프리뷰 · /choi</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, opacity: 0.8 }}>
              <a href="/choi" target="_blank" rel="noreferrer" style={{ color: 'white' }}>새 탭</a>
              <a href="/choi/campaigns" target="_blank" rel="noreferrer" style={{ color: 'white' }}>캠페인</a>
              <a href="/choi/channels" target="_blank" rel="noreferrer" style={{ color: 'white' }}>채널</a>
              <a href="/choi/roadmap" target="_blank" rel="noreferrer" style={{ color: 'white' }}>로드맵</a>
            </div>
          </div>
          <iframe
            ref={iframeRef}
            title="/choi preview"
            src={previewSrc}
            style={{ width: '100%', minHeight: 900, border: 0, flex: 1 }}
          />
        </section>
      </div>
    </div>
  );
}
