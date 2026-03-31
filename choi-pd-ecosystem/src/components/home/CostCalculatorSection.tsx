'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const TOOLS = [
  { id: 'linktree', name: 'Linktree Pro', price: 24, category: '브랜드 페이지' },
  { id: 'buffer', name: 'Buffer Pro', price: 15, category: 'SNS 예약' },
  { id: 'canva', name: 'Canva Pro', price: 13, category: '디자인' },
  { id: 'mailchimp', name: 'Mailchimp', price: 20, category: '뉴스레터' },
  { id: 'analytics', name: 'Analytics 도구', price: 29, category: '분석' },
  { id: 'chatgpt', name: 'ChatGPT Plus', price: 20, category: 'AI 생성' },
];

const IMPD_PRO_PRICE_USD = 14; // 19,000원 ≈ $14

export function CostCalculatorSection() {
  const [selected, setSelected] = useState<string[]>(['linktree', 'buffer', 'chatgpt']);

  const totalCurrent = useMemo(
    () => TOOLS.filter((t) => selected.includes(t.id)).reduce((sum, t) => sum + t.price, 0),
    [selected]
  );

  const savings = Math.max(0, totalCurrent - IMPD_PRO_PRICE_USD);
  const savingsPercent = totalCurrent > 0 ? Math.round((savings / totalCurrent) * 100) : 0;

  const toggleTool = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 md:py-24" style={{ background: '#F3F2F2' }}>
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
              비용 비교
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
              지금 쓰는 도구, 얼마나 내고 계세요?
            </h2>
            <p className="mt-4 text-base text-gray-500">
              현재 사용 중인 도구를 선택하면 절감 비용을 계산합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tool selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#16325C' }}>
                현재 사용 중인 도구 선택
              </h3>
              <div className="space-y-3">
                {TOOLS.map((tool) => {
                  const isSelected = selected.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50/50 shadow-sm'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      style={{ borderColor: isSelected ? '#00A1E0' : '#e5e7eb' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            isSelected ? 'border-transparent' : 'border-gray-300'
                          }`}
                          style={isSelected ? { background: '#00A1E0' } : undefined}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#16325C' }}>{tool.name}</p>
                          <p className="text-xs text-gray-400">{tool.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-500">${tool.price}/월</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison result */}
            <div className="space-y-5">
              {/* Current cost */}
              <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/30 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <h3 className="text-sm font-semibold text-red-700">현재 월 비용</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">${totalCurrent}<span className="text-base font-normal text-red-400">/월</span></p>
                <p className="text-xs text-red-400 mt-1">
                  ({selected.length}개 도구 합산)
                </p>
              </div>

              {/* imPD cost */}
              <div className="rounded-xl border-2 bg-white p-6 shadow-lg" style={{ borderColor: '#00A1E0' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: '#00A1E0' }}>
                    <span className="text-white text-[10px] font-bold">im</span>
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: '#00A1E0' }}>imPD Pro</h3>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#16325C' }}>${IMPD_PRO_PRICE_USD}<span className="text-base font-normal text-gray-400">/월</span></p>
                <p className="text-xs text-gray-400 mt-1">
                  위 도구 기능 모두 포함 + AI 자동화
                </p>
              </div>

              {/* Savings */}
              {savings > 0 && (
                <div className="rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
                  <p className="text-sm text-white/90 mb-1">연간 절감 비용</p>
                  <p className="text-4xl font-bold text-white">${savings * 12}</p>
                  <p className="text-sm text-white/80 mt-1">
                    매월 ${savings} 절감 ({savingsPercent}% 절감)
                  </p>
                </div>
              )}

              {/* CTA */}
              <Link
                href="/onboarding"
                className="flex items-center justify-center w-full px-6 py-3.5 rounded-lg text-base font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: '#00A1E0' }}
              >
                지금 무료로 시작하기
                <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
