export function CommunityHeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 mb-6">
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            커뮤니티
          </span>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl text-white">
            소식과 인사이트를
            <br />함께 나누세요
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            공지사항과 최신 소식을 확인하고,
            <br className="hidden sm:block" />
            뉴스레터를 구독하여 유용한 정보를 받아보세요.
          </p>
        </div>
      </div>
    </section>
  );
}
