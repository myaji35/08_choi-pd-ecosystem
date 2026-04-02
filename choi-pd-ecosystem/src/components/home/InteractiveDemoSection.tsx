'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const DEMO_TEXTS = [
  '오늘 강의에서 스마트폰으로 쇼핑몰을 만드는 방법을 배웠습니다.',
  '부동산 매물 정보: 강남역 5분, 신축 오피스텔 월세 80만원',
  '이번 주 요가 클래스 새 수강생 모집합니다. 초보자 환영!',
];

const MOCK_RESULTS: Record<string, { channel: string; label: string; color: string; content: string; hashtags?: string[] }[]> = {
  default: [
    {
      channel: 'instagram',
      label: '인스타그램',
      color: '#E4405F',
      content: '\\u2728 스마트폰 하나로 나만의 쇼핑몰을 만들 수 있다면?\\n\\n오늘 배운 핵심 팁을 공유합니다!\\n작은 시작이 큰 변화를 만듭니다.\\n\\n\\ud83d\\udc49 프로필 링크에서 자세히 확인하세요!',
      hashtags: ['#스마트폰창업', '#쇼핑몰', '#1인기업', '#사이드프로젝트', '#디지털마케팅'],
    },
    {
      channel: 'naver-blog',
      label: '네이버 블로그',
      color: '#03C75A',
      content: '## 스마트폰으로 쇼핑몰 만들기 - 오늘 배운 핵심 정리\\n\\n안녕하세요! 오늘은 스마트폰만으로 나만의 쇼핑몰을 만드는 방법을 정리해보겠습니다...\\n\\n### 핵심 포인트\\n1. 플랫폼 선택\\n2. 상품 등록\\n3. SNS 연동',
      hashtags: ['#스마트폰창업', '#쇼핑몰만들기'],
    },
  ],
};

export function InteractiveDemoSection() {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<typeof MOCK_RESULTS.default | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [placeholder, setPlaceholder] = useState(DEMO_TEXTS[0]);

  // Rotate placeholder
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % DEMO_TEXTS.length;
      setPlaceholder(DEMO_TEXTS[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setResults(null);

    // Simulate AI generation delay
    setTimeout(() => {
      setResults(MOCK_RESULTS.default);
      setIsGenerating(false);
      setActiveTab(0);
    }, 1500);
  }, [text]);

  return (
    <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-sm px-4 py-1.5 mb-4">
              <span className="text-sm font-semibold text-white">30초 체험</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
              지금 바로 AI 콘텐츠 생성을 체험하세요
            </h2>
            <p className="mt-3 text-base text-white/90 drop-shadow-sm">
              텍스트를 입력하면 여러 채널에 맞는 콘텐츠가 자동으로 생성됩니다.
            </p>
          </div>

          {/* Demo area */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 shadow-xl">
            {/* Input */}
            <div className="mb-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/70 text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-white/80">{text.length}자 입력됨</p>
                <button
                  onClick={handleGenerate}
                  disabled={!text.trim() || isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-md"
                  style={{ background: '#00A1E0' }}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      생성 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      AI로 생성
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {results.map((r, i) => (
                    <button
                      key={r.channel}
                      onClick={() => setActiveTab(i)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === i
                          ? 'border-white text-white'
                          : 'border-transparent text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      {r.label}
                    </button>
                  ))}
                </div>
                {/* Content */}
                <div className="p-5">
                  <div className="whitespace-pre-wrap text-sm text-white/90 leading-relaxed">
                    {results[activeTab].content}
                  </div>
                  {results[activeTab].hashtags && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {results[activeTab].hashtags!.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ background: results[activeTab].color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 text-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: '#00A1E0' }}
              >
                무료로 시작하기 - 전체 기능 체험
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
              <p className="mt-3 text-sm text-white/80">
                신용카드 없이 무료 시작 &middot; 언제든 해지 가능
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
