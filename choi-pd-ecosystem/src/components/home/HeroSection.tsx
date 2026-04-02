'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  profileImageTimestamp?: number;
  heroImages?: string[];
}

export function HeroSection({
  profileImageTimestamp = Date.now(),
  heroImages = []
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* 밝은 배경 + SLDS 블루 악센트 */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f8fafc 60%, #eff6ff 100%)' }} />

      {/* 장식용 블루 블러 */}
      <div className="absolute top-10 right-[10%] w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: '#00A1E0' }} />
      <div className="absolute bottom-0 left-[5%] w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: '#16325C' }} />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-20 md:py-28 lg:py-32">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border border-[#00A1E0]/30 bg-[#00A1E0]/10 px-4 py-1.5 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="text-sm font-medium text-[#16325C]">AI 브랜드 매니저 출시</span>
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#16325C] leading-[1.15] transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              AI가 당신의
              <br />
              <span className="text-[#00A1E0]">브랜드를 관리</span>합니다
            </h1>

            <p
              className={`mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              블로그, SNS, 쇼핑몰을 하나로.
              <br className="hidden sm:block" />
              AI가 콘텐츠를 자동 생성하고 예약 발행합니다.
            </p>

            {/* CTA Buttons */}
            <div className={`mt-10 flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center lg:justify-start transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold text-white shadow-lg shadow-[#00A1E0]/30 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: '#00A1E0' }}
              >
                무료로 시작하기
                <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                href="/chopd/education"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-base font-semibold border-2 border-[#16325C] text-[#16325C] bg-transparent transition-all duration-200 hover:bg-[#16325C] hover:text-white"
              >
                <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                데모 보기
              </Link>
            </div>

            {/* Social proof */}
            <div className={`mt-10 flex items-center gap-6 justify-center lg:justify-start text-gray-500 text-sm font-medium transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>500+ 사용자</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>4.9/5 만족도</span>
              </div>
              <div className="w-px h-4 bg-gray-300 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>무료 체험 가능</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard preview mockup */}
          <div className={`flex-1 w-full max-w-lg lg:max-w-xl transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 rounded-2xl opacity-10 blur-2xl" style={{ background: '#16325C' }} />

              {/* Dashboard mockup card */}
              <div className="relative rounded-xl border border-gray-200 bg-white p-1 shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4 rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-500 text-center">
                    app.impd.kr/dashboard
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 space-y-4 bg-white">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '이번 달 콘텐츠', value: '24', change: '+12%' },
                      { label: 'SNS 도달률', value: '8.2K', change: '+34%' },
                      { label: '신규 리드', value: '156', change: '+28%' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-lg font-bold text-[#16325C] mt-0.5">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-0.5">{stat.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Content schedule */}
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-[#16325C]">AI 콘텐츠 스케줄</p>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: '#00A1E0' }}>자동</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { platform: '블로그', title: '스마트폰 마케팅 5가지 팁', time: '오늘 14:00', color: '#22c55e' },
                        { platform: '인스타', title: '주간 카드뉴스 발행', time: '내일 10:00', color: '#ec4899' },
                        { platform: '유튜브', title: '숏폼 콘텐츠 업로드', time: '수요일', color: '#ef4444' },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-3 rounded-md bg-white px-3 py-2 border border-gray-100">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">{item.title}</p>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
