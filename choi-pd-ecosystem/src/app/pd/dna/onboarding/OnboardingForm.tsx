'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BaseColors } from '@/lib/theme/types';

const DEFAULT_COLORS: BaseColors = {
  primary: '#E53935',
  trust: '#1A237E',
  secondary: '#00897B',
  accent: '#FF6F00',
  surface: '#FFFFFF',
};

const TONE_OPTIONS = [
  '열정적', '친근함', '전문적', '신뢰감', '에너지', '차분함', '혁신적', '실용적',
  '현장감', '따뜻함', '도전적', '섬세함',
];

const STYLE_OPTIONS = [
  '미니멀', '대담한', '클래식', '모던', '유기적', '기하학적', '컬러풀', '모노톤',
];

const COLOR_LABELS: Record<keyof BaseColors, { label: string; hint: string }> = {
  primary: { label: 'Primary · 핵심 컬러', hint: 'CTA · 강조' },
  trust: { label: 'Trust · 신뢰 컬러', hint: '제목 · 헤더' },
  secondary: { label: 'Secondary · 보조', hint: '2차 액션' },
  accent: { label: 'Accent · 포인트', hint: '뱃지 · 강조' },
  surface: { label: 'Surface · 배경', hint: '카드 · 여백' },
};

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [colors, setColors] = useState<BaseColors>(DEFAULT_COLORS);
  const [toneKeywords, setToneKeywords] = useState<string[]>([]);
  const [styleKeywords, setStyleKeywords] = useState<string[]>([]);
  const [coreValues, setCoreValues] = useState<string[]>(['', '', '', '']);
  const [slogan, setSlogan] = useState('');
  const [channelName, setChannelName] = useState('');
  const [profession, setProfession] = useState('');
  const [activity, setActivity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (list: string[], setter: (v: string[]) => void, tag: string, max = 8) => {
    if (list.includes(tag)) setter(list.filter((t) => t !== tag));
    else if (list.length < max) setter([...list, tag]);
  };

  const updateColor = (key: keyof BaseColors, value: string) => {
    setColors((p) => ({ ...p, [key]: value as BaseColors[keyof BaseColors] }));
  };

  const updateValue = (idx: number, v: string) => {
    setCoreValues((prev) => prev.map((x, i) => (i === idx ? v : x)));
  };

  const canNext = () => {
    if (step === 1) return Object.values(colors).every((c) => /^#[0-9a-fA-F]{6}$/.test(c));
    if (step === 2) return toneKeywords.length >= 3;
    if (step === 3) return coreValues.filter((v) => v.trim().length > 0).length >= 1;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/dna', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          colors,
          styleKeywords,
          toneKeywords,
          coreValues: coreValues.filter((v) => v.trim().length > 0),
          slogan: slogan.trim() || undefined,
          identity: {
            channelName: channelName.trim() || undefined,
            profession: profession.trim() || undefined,
            activity: activity.trim() || undefined,
          },
          syncPolicy: 'auto_all',
          autoFix: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      router.push(`/pd/theme?justCreated=1&slug=${encodeURIComponent(data.slug)}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2] p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6B85]">Pomelli · Phase 1</p>
          <h1 className="mt-1 text-2xl font-bold text-[#16325C]">개인 DNA 10문항</h1>
          <p className="mt-1 text-sm text-gray-600">
            컬러 · 톤 · 가치 · 정체성 4축을 입력하면 14개 시맨틱 토큰이 자동 파생되어
            공개 프로필 페이지의 실제 색상으로 반영됩니다.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-2 flex-1 rounded-full ${n <= step ? 'bg-[#E53935]' : 'bg-gray-200'}`}
              />
            ))}
            <span className="ml-2 text-xs text-gray-500">{step}/4</span>
          </div>
        </header>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {step === 1 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-[#16325C]">1. 컬러 팔레트 (5개)</h2>
              <div className="space-y-4">
                {(Object.keys(COLOR_LABELS) as (keyof BaseColors)[]).map((k) => (
                  <div key={k}>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      {COLOR_LABELS[k].label}
                      <span className="ml-2 font-normal text-gray-400">· {COLOR_LABELS[k].hint}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[k]}
                        onChange={(e) => updateColor(k, e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                        aria-label={`${COLOR_LABELS[k].label} 컬러 선택`}
                      />
                      <input
                        type="text"
                        value={colors[k]}
                        onChange={(e) => updateColor(k, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                        aria-label={`${COLOR_LABELS[k].label} HEX`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-[#16325C]">2. 톤 키워드 (3~8개)</h2>
              <p className="mb-3 text-xs text-gray-600">
                선택한 톤은 카피라이터 에이전트의 시드로 재사용됩니다.
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {TONE_OPTIONS.map((t) => {
                  const on = toneKeywords.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(toneKeywords, setToneKeywords, t, 8)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        on
                          ? 'border-[#E53935] bg-[#E53935] text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#E53935]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <h3 className="mb-2 text-sm font-bold text-[#16325C]">스타일 키워드 (선택)</h3>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((t) => {
                  const on = styleKeywords.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(styleKeywords, setStyleKeywords, t, 6)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        on
                          ? 'border-[#1A237E] bg-[#1A237E] text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#1A237E]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-[#16325C]">3. 핵심 가치 4개 + 슬로건</h2>
              <p className="mb-4 text-xs text-gray-600">
                About Me 섹션의 4-카드 레이아웃으로 자동 구성됩니다. 최소 1개 필수.
              </p>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {coreValues.map((v, i) => (
                  <input
                    key={i}
                    type="text"
                    value={v}
                    onChange={(e) => updateValue(i, e.target.value)}
                    placeholder={`가치 ${i + 1} · 예: 스마트폰으로 세상과 소통`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                  />
                ))}
              </div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">슬로건 (선택)</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="예: 1인미디어, 대중과 함께"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
              />
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-[#16325C]">4. 정체성 3항 (선택)</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">채널/브랜드 이름</label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="예: 최PD의 스마트폰 연구소"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">직업/직함</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="예: 스마트폰 창업 전략가"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">주요 활동 분야</label>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="예: 교육 · 미디어 · 저술"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  저장 실패: {error}
                </p>
              )}
            </section>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40"
            >
              이전
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="rounded-md bg-[#E53935] px-5 py-2 text-sm font-bold text-white disabled:bg-gray-300"
              >
                다음
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !canNext()}
                className="rounded-md bg-[#E53935] px-5 py-2 text-sm font-bold text-white disabled:bg-gray-400"
              >
                {submitting ? '저장 중…' : 'DNA 저장 + 테마 편집으로'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
