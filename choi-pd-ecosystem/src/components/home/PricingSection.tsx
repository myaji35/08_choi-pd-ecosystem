import Link from 'next/link';

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '원/월',
      description: '시작하기 좋은 무료 플랜',
      features: [
        '기본 브랜드 페이지 1개',
        'AI 콘텐츠 생성 월 5회',
        'SNS 채널 1개 연동',
        '기본 분석 대시보드',
        '커뮤니티 지원',
      ],
      cta: '무료로 시작하기',
      href: '/onboarding',
      highlighted: false,
      color: '#6b7280',
    },
    {
      name: 'Pro',
      price: '19,000',
      period: '원/월',
      description: '성장하는 1인 사업자를 위한 플랜',
      features: [
        '브랜드 페이지 무제한',
        'AI 콘텐츠 생성 무제한',
        'SNS 채널 5개 연동',
        '예약 발행 + 자동화',
        '상세 성과 분석',
        '뉴스레터 발송 월 1,000건',
        '우선 이메일 지원',
      ],
      cta: 'Pro 시작하기',
      href: '/onboarding?plan=pro',
      highlighted: true,
      color: '#00A1E0',
    },
    {
      name: 'Biz',
      price: '59,000',
      period: '원/월',
      description: '팀과 기업을 위한 플랜',
      features: [
        'Pro의 모든 기능',
        '팀 멤버 5명 포함',
        'SNS 채널 무제한',
        '고급 AI 분석 리포트',
        '뉴스레터 발송 무제한',
        'API 접근 권한',
        '전담 매니저 배정',
        'SLA 99.9% 보장',
      ],
      cta: '도입 문의하기',
      href: '/chopd/community#contact',
      highlighted: false,
      color: '#16325C',
    },
  ];

  return (
    <section className="py-20 md:py-24" style={{ background: '#F3F2F2' }}>
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
            가격
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
            합리적인 가격, 강력한 기능
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
            필요한 만큼만 시작하세요. 언제든 업그레이드할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl bg-white border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.highlighted ? 'shadow-lg' : ''
              }`}
              style={{ borderColor: plan.highlighted ? '#00A1E0' : '#e5e7eb' }}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-bold text-white shadow-sm" style={{ background: '#00A1E0' }}>
                    가장 인기
                  </span>
                </div>
              )}

              <div className="p-7 flex-1 flex flex-col">
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: '#16325C' }}>{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.highlighted ? '#00A1E0' : '#10b981' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'text-white shadow-md hover:shadow-lg'
                      : 'border-2 hover:bg-gray-50'
                  }`}
                  style={
                    plan.highlighted
                      ? { background: '#00A1E0' }
                      : { borderColor: plan.color, color: plan.color }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-gray-500">
            모든 플랜에 14일 무료 체험이 포함됩니다. 언제든 해지 가능합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              AES-256 암호화
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              데이터 한국 서버 보관
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              7일 이내 전액 환불
            </div>
            <div className="w-px h-3 bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              GDPR 준수
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
