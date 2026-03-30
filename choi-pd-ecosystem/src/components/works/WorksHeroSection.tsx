export function WorksHeroSection() {
  const highlights = [
    {
      title: '저서',
      description: '스마트폰 활용과 창업에 관한 실용서',
      color: '#00A1E0',
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      ),
    },
    {
      title: '모바일 스케치',
      description: '스마트폰으로 그린 감성 작품',
      color: '#8b5cf6',
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
      ),
    },
    {
      title: '언론 보도',
      description: '미디어에 소개된 활동',
      color: '#10b981',
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 mb-6">
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            저서 및 활동
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
            저서 및 작품 활동
          </h1>
          <p className="mt-5 text-lg text-white/70 leading-relaxed">
            교육자, 저자, 그리고 아티스트로서
            <br className="hidden sm:block" />
            다양한 분야에서 활동하며 영감을 나누고 있습니다.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: item.color }}>
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
