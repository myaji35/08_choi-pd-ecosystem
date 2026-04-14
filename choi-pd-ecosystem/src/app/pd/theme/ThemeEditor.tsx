'use client';

// Pomelli 테마 편집기 — 5개 base 컬러 슬라이더 + iframe 실시간 프리뷰
// 변경은 localStorage에 즉시 저장, "저장 + 발행" 클릭 시 API POST
// 참조: docs/pomelli-theme-tokens-plan.md §6

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { generateSemanticTokens } from '@/lib/theme/token-generator';
import { auditTokens, autoRemediate } from '@/lib/theme/contrast-guard';
import type { BaseColors } from '@/lib/theme/types';

interface Props {
  initialColors: BaseColors;
  initialUsername: string;
}

const LABELS: Array<{ key: keyof BaseColors; label: string; hint: string }> = [
  { key: 'primary', label: 'Primary', hint: '핵심 강조 · CTA 버튼' },
  { key: 'trust', label: 'Trust (Navy)', hint: '제목 · 신뢰 · 다크 헤더' },
  { key: 'secondary', label: 'Secondary (Teal)', hint: '보조 액션 · 차분' },
  { key: 'accent', label: 'Accent (Orange)', hint: '뱃지 · 2차 CTA' },
  { key: 'surface', label: 'Surface', hint: '카드 · 배경' },
];

export function ThemeEditor({ initialColors, initialUsername }: Props) {
  const [colors, setColors] = useState<BaseColors>(initialColors);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [autoFix, setAutoFix] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // localStorage 복원
  useEffect(() => {
    const stored = localStorage.getItem('pomelli:draft-colors');
    if (stored) {
      try { setColors(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // 변경 시 localStorage 저장 + iframe 갱신
  useEffect(() => {
    localStorage.setItem('pomelli:draft-colors', JSON.stringify(colors));
    if (iframeRef.current) {
      const params = new URLSearchParams({
        primary: colors.primary,
        trust: colors.trust,
        secondary: colors.secondary,
        accent: colors.accent,
        surface: colors.surface,
      });
      iframeRef.current.src = `/p/dna/${initialUsername}?${params.toString()}`;
    }
  }, [colors, initialUsername]);

  const tokens = useMemo(() => {
    const base = generateSemanticTokens(colors);
    return autoFix ? autoRemediate(base).tokens : base;
  }, [colors, autoFix]);

  const report = useMemo(() => auditTokens(tokens), [tokens]);

  const updateColor = useCallback((key: keyof BaseColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value as BaseColors[keyof BaseColors] }));
  }, []);

  const resetToDna = useCallback(() => {
    setColors(initialColors);
    localStorage.removeItem('pomelli:draft-colors');
  }, [initialColors]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/theme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: initialUsername, colors, autoFix }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedAt(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) {
      console.error('[theme-editor] save failed', e);
      setSavedAt(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', padding: '1.5rem', minHeight: '100vh', background: '#F3F2F2' }}>
      {/* Left: editor panel */}
      <aside style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem', height: 'fit-content', position: 'sticky', top: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#16325C' }}>컬러 팔레트 편집</h1>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: '1.25rem' }}>
          슬라이더 · 컬러픽커로 조정하면 오른쪽 프리뷰가 실시간 반영됩니다.
        </p>

        {LABELS.map(({ key, label, hint }) => (
          <div key={key} style={{ marginBottom: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              {label}
              <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: 6 }}>· {hint}</span>
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                style={{ width: 48, height: 36, border: '1px solid #D1D5DB', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                aria-label={`${label} 컬러 선택`}
              />
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 13, padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 4, color: '#111827' }}
                aria-label={`${label} HEX 코드`}
              />
            </div>
          </div>
        ))}

        {/* WCAG 검증 */}
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: report.failedCount === 0 ? '#ECFDF5' : '#FEF3C7', borderRadius: 6, border: `1px solid ${report.failedCount === 0 ? '#6EE7B7' : '#FCD34D'}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: report.failedCount === 0 ? '#065F46' : '#92400E' }}>
            {report.failedCount === 0
              ? `✓ WCAG AA 통과 (${report.passedCount}/${report.checks.length})`
              : `⚠ ${report.failedCount}건 대비 부족 · 자동 보정 ${autoFix ? '활성' : '비활성'}`}
          </div>
          <label style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <input type="checkbox" checked={autoFix} onChange={(e) => setAutoFix(e.target.checked)} />
            자동 보정 (AA 미달 시 shade 조정)
          </label>
        </div>

        {/* 토큰 미리보기 */}
        <details style={{ marginTop: '0.75rem' }}>
          <summary style={{ fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>파생된 14 토큰 보기</summary>
          <div style={{ marginTop: 8, fontSize: 11, fontFamily: 'ui-monospace, monospace', maxHeight: 180, overflowY: 'auto', background: '#F9FAFB', padding: '8px 10px', borderRadius: 4 }}>
            {Object.entries(tokens).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ color: '#6B7280' }}>{k}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, background: v as string, border: '1px solid #D1D5DB', borderRadius: 2 }} />
                  {v as string}
                </span>
              </div>
            ))}
          </div>
        </details>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
          <button
            type="button"
            onClick={resetToDna}
            style={{ flex: 1, padding: '10px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            🔄 DNA로 초기화
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, padding: '10px', background: saving ? '#9CA3AF' : '#E53935', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? '저장 중…' : '💾 저장 + 발행'}
          </button>
        </div>
        {savedAt && <p style={{ fontSize: 11, color: '#6B7280', marginTop: 8 }}>마지막 저장: {savedAt}</p>}
      </aside>

      {/* Right: live iframe preview */}
      <section style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 14px', background: '#16325C', color: 'white', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>실시간 프리뷰 · /p/dna/{initialUsername}</span>
          <span style={{ opacity: 0.7 }}>iframe</span>
        </div>
        <iframe
          ref={iframeRef}
          title="Pomelli 프로필 프리뷰"
          style={{ width: '100%', flex: 1, minHeight: 900, border: 0 }}
          src={`/p/dna/${initialUsername}`}
        />
      </section>
    </div>
  );
}
