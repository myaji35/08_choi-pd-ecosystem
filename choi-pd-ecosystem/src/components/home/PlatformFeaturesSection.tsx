'use client';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'AI 콘텐츠 생성',
    description: '당신의 브랜드 보이스를 학습한 AI가 블로그, 뉴스레터, 상세페이지를 몇 초 만에 완성합니다.',
    gradient: 'from-[#00658e] to-[#00A1E0]',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    title: 'SNS 통합 관리',
    description: '분산된 채널을 하나의 대시보드에서 효율적으로 운영하세요. 인스타그램, X, 블로그를 한곳에서.',
    gradient: 'from-[#455f8b] to-[#6b84b5]',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: '교육 콘텐츠 판매',
    description: '전문성을 자산화하는 가장 빠른 방법입니다. 강의 제작부터 판매까지 강력한 LMS 도구를 제공합니다.',
    gradient: 'from-[#00658e] to-[#004c6c]',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76 2.83-2.83" />
      </svg>
    ),
    title: '유통 네트워크',
    description: '1.9만 전문가 네트워크로 비즈니스를 확장하세요. 혼자서는 닿을 수 없던 새로운 시장과 기회를 연결합니다.',
    gradient: 'from-[#004c6c] to-[#00658e]',
  },
];

export function PlatformFeaturesSection() {
  return (
    <section className="py-24 px-6 md:px-8 bg-[#f0f4f9]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-bold text-3xl md:text-4xl text-[#171c20] mb-6">
            비즈니스를 가속화하는 핵심 기능
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#00658e] to-[#00A1E0] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-10 rounded-xl flex items-start gap-8 hover:shadow-xl transition-shadow"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl mb-3 text-[#171c20]">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
