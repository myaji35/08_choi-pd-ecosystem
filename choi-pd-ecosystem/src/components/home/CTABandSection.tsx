import Link from 'next/link';

export function CTABandSection() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}
    >
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
          지금 무료로 시작하세요
        </h2>
        <p className="text-base text-white/90 max-w-xl mx-auto mb-8">
          신용카드 없이 가입하고, 5분 안에 AI가 만든 브랜드 페이지를 확인하세요.
          <br className="hidden sm:block" />
          500+ 사업자가 이미 시작했습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold bg-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ color: '#16325C' }}
          >
            무료로 시작하기
            <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
          <Link
            href="/chopd/ai"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold border-2 border-white/50 text-white transition-all duration-200 hover:bg-white/10 hover:border-white/70"
          >
            AI 데모 체험하기
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/70 text-xs">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            AES-256 암호화
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            한국 서버 보관
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            7일 환불 보장
          </div>
          <div className="w-px h-3 bg-white/20 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            GDPR 준수
          </div>
        </div>
      </div>
    </section>
  );
}
