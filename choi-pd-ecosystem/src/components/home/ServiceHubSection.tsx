import Link from 'next/link';

export function ServiceHubSection() {
  return (
    <section className="py-20 md:py-24" style={{ background: '#F3F2F2' }}>
      <div className="container px-4 md:px-6">
        {/* Section header - left aligned */}
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
            올인원 플랫폼
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
            흩어진 채널을 하나로 통합
          </h2>
          <p className="mt-4 text-base text-gray-500 leading-relaxed">
            교육, 미디어, 커머스 — 각각 관리하던 플랫폼을 imPD 하나로 묶으세요.
          </p>
        </div>

        {/* Bento grid: 좌측 큰 카드 + 우측 2개 스택 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Large featured card */}
          <Link
            href="/chopd/education"
            className="lg:col-span-3 group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: '#00A1E0' }}>
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: '#00A1E0' }}>핵심 서비스</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#16325C' }}>
                AI 콘텐츠 자동화
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-md">
                블로그 글, SNS 포스트, 뉴스레터를 AI가 자동 생성합니다.
                예약 발행까지 한 번에 관리하세요.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: '#00A1E0' }}>
                자세히 보기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-[0.04]" style={{ background: '#00A1E0' }} />
          </Link>

          {/* Right stack: 2 smaller cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Card: SNS 통합 */}
            <Link
              href="/chopd/community"
              className="group flex-1 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#16325C' }}>SNS 통합 관리</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                인스타, 블로그, 유튜브 — 하나의 대시보드에서 모든 채널을 관리하세요.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors">
                둘러보기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </Link>

            {/* Card: 분석 대시보드 */}
            <Link
              href="/chopd/works"
              className="group flex-1 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#16325C' }}>성과 분석</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                콘텐츠 성과, 구독자 증가, 매출 추이를 실시간으로 파악합니다.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-colors">
                둘러보기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
