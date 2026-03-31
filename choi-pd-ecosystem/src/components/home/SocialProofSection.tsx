'use client';

import { useState } from 'react';

const TESTIMONIALS = [
  {
    name: '김민수',
    role: '온라인 강사',
    profession: 'educator',
    avatar: 'KM',
    rating: 5,
    text: '매일 5개 플랫폼에 일일이 글을 올리던 시간이 사라졌습니다. imPD 하나로 블로그, 인스타, 뉴스레터까지 15분이면 끝나요. 수강생 문의도 30% 늘었습니다.',
    metric: '콘텐츠 생산 시간 87% 절감',
  },
  {
    name: '박영희',
    role: '부동산 컨설턴트',
    profession: 'realtor',
    avatar: 'PY',
    rating: 5,
    text: 'AI가 매물 정보를 자동으로 SNS 포스트로 만들어줍니다. 네이버 블로그 글도 SEO에 맞게 생성해주니 검색 유입이 2배로 늘었어요.',
    metric: '검색 유입 200% 증가',
  },
  {
    name: '이준호',
    role: '프리랜서 디자이너',
    profession: 'freelancer',
    avatar: 'LJ',
    rating: 5,
    text: '포트폴리오 사이트, SNS 관리, 클라이언트 문의까지 한 곳에서. 월 19,000원이면 기존에 쓰던 3개 도구 비용의 1/5도 안 됩니다.',
    metric: '도구 비용 80% 절감',
  },
];

const LOGOS = [
  { name: '서울시 50+재단', width: 'w-24' },
  { name: '소상공인진흥공단', width: 'w-28' },
  { name: '한국콘텐츠진흥원', width: 'w-28' },
  { name: 'SaaS 전환지원센터', width: 'w-24' },
];

export function SocialProofSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
            사용자 후기
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
            500+ 사용자가 신뢰합니다
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
            다양한 직업군의 1인 사업자들이 imPD로 브랜드를 성장시키고 있습니다.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          {[
            { value: '500+', label: '활성 사용자' },
            { value: '4.9/5', label: '평균 만족도' },
            { value: '87%', label: '시간 절감' },
            { value: '15분', label: '평균 온보딩' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl border border-gray-200">
              <p className="text-2xl md:text-3xl font-bold" style={{ color: '#16325C' }}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`relative rounded-xl border-2 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                activeIndex === i ? 'shadow-lg' : ''
              }`}
              style={{ borderColor: activeIndex === i ? '#00A1E0' : '#e5e7eb' }}
              onClick={() => setActiveIndex(i)}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <svg key={si} className="w-4 h-4" style={{ color: '#FBBF24' }} viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Metric badge */}
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: '#00A1E0' }}>
                  {t.metric}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#16325C' }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#16325C' }}>{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust logos */}
        <div className="mt-16 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
            파트너 및 교육 기관
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {LOGOS.map((logo) => (
              <div key={logo.name} className={`${logo.width} h-8 bg-gray-300 rounded flex items-center justify-center`}>
                <span className="text-[10px] text-gray-500 font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
