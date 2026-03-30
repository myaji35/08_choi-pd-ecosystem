export function WhyImpdSection() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
            왜 imPD인가
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
            흩어진 5개 플랫폼, imPD 하나로
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
          {/* Before: 흩어진 플랫폼 */}
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-500 text-white">
                BEFORE
              </span>
            </div>
            <div className="relative p-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
              {/* Scattered platform icons */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: '블로그', icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  )},
                  { name: '인스타그램', icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  )},
                  { name: '유튜브', icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                  )},
                  { name: '카카오', icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  )},
                  { name: '쇼핑몰', icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  )},
                ].map((platform) => (
                  <div key={platform.name} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 shadow-sm opacity-60">
                    <div className="text-gray-400">{platform.icon}</div>
                    <span className="text-xs text-gray-400 font-medium">{platform.name}</span>
                  </div>
                ))}
                {/* Empty confused state */}
                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  <span className="text-xs text-gray-300 font-medium">???</span>
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-gray-400">
                매일 5개 플랫폼 로그인... 콘텐츠 복사-붙여넣기...
              </p>
              {/* Diagonal lines connecting scattered icons */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="20" y1="30" x2="80" y2="70" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
                  <line x1="50" y1="20" x2="30" y2="80" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
                  <line x1="70" y1="25" x2="40" y2="75" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* After: imPD 통합 */}
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: '#00A1E0' }}>
                AFTER
              </span>
            </div>
            <div className="relative p-8 rounded-xl border-2 bg-white shadow-lg" style={{ borderColor: '#00A1E0' }}>
              {/* Central imPD hub */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
                  <span className="text-white text-xl font-bold">imPD</span>
                </div>

                {/* Connected features */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {[
                    { label: '콘텐츠 자동 생성', icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    )},
                    { label: '멀티채널 발행', icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    )},
                    { label: '성과 분석', icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    )},
                    { label: '고객 관리', icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    )},
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md shrink-0" style={{ background: '#00A1E0' }}>
                        <span className="text-white">{feature.icon}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#16325C' }}>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-center text-sm font-medium" style={{ color: '#00A1E0' }}>
                로그인 한 번으로 모든 채널 관리 완료
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
