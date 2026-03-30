import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/lib/db/schema';

interface LatestCoursesSectionProps {
  courses: Course[];
}

export function LatestCoursesSection({ courses }: LatestCoursesSectionProps) {
  const typeLabels: Record<string, string> = {
    online: '온라인',
    offline: '오프라인',
    b2b: '기업/기관',
  };

  const typeColors: Record<string, string> = {
    online: '#00A1E0',
    offline: '#10b981',
    b2b: '#8b5cf6',
  };

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
            교육 과정
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
            최신 교육 프로그램
          </h2>
          <p className="mt-4 text-base text-gray-500">
            AI 시대에 맞는 실전 교육 과정을 만나보세요.
          </p>
        </div>

        {courses.length === 0 ? (
          /* Attractive empty state */
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 md:p-16 text-center">
            {/* SVG Illustration */}
            <div className="mx-auto mb-8 w-32 h-32 relative">
              <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Book/Screen shape */}
                <rect x="24" y="20" width="80" height="88" rx="8" fill="#F3F2F2" stroke="#E5E7EB" strokeWidth="2"/>
                <rect x="32" y="36" width="64" height="6" rx="3" fill="#E5E7EB"/>
                <rect x="32" y="48" width="48" height="6" rx="3" fill="#E5E7EB"/>
                <rect x="32" y="60" width="56" height="6" rx="3" fill="#E5E7EB"/>
                {/* Sparkle accent */}
                <circle cx="100" cy="28" r="8" fill="#00A1E0" opacity="0.15"/>
                <path d="M100 22v12M94 28h12" stroke="#00A1E0" strokeWidth="2" strokeLinecap="round"/>
                {/* Graduation cap */}
                <path d="M64 76l-20 10 20 10 20-10z" fill="#00A1E0" opacity="0.2"/>
                <path d="M64 76l-20 10 20 10 20-10z" stroke="#00A1E0" strokeWidth="1.5" fill="none"/>
                <line x1="84" y1="86" x2="84" y2="96" stroke="#00A1E0" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#16325C' }}>
              첫 번째 교육 과정이 곧 오픈됩니다
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              AI 브랜딩, SNS 마케팅, 콘텐츠 제작 등 실전 교육 과정을 준비 중입니다.
              뉴스레터를 구독하면 오픈 알림을 받을 수 있어요.
            </p>
            <Link
              href="/chopd/community"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ background: '#00A1E0' }}
            >
              <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              오픈 알림 구독하기
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={course.externalLink || `/chopd/education#course-${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {course.thumbnailUrl ? (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
                      <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ background: typeColors[course.type] || '#6b7280' }}
                      >
                        {typeLabels[course.type] || course.type}
                      </span>
                      {course.price !== null && course.price > 0 ? (
                        <span className="text-lg font-bold" style={{ color: '#16325C' }}>
                          {course.price.toLocaleString()}원
                        </span>
                      ) : course.price === null ? (
                        <span className="text-sm font-medium text-gray-400">견적 문의</span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: '#16325C' }}>
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          8주 과정
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          소규모
                        </span>
                      </div>
                      <span className="text-sm font-semibold transition-colors" style={{ color: '#00A1E0' }}>
                        상세보기 &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/chopd/education"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderColor: '#00A1E0', color: '#00A1E0' }}
              >
                모든 교육 과정 보기
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
