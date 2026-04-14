// ISS-047: Services 섹션 — 교육 과정 + 외부 링크 허브
// Server Component

import type { ServicesSectionProps } from './types';

const COURSE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  online: { label: '온라인', color: '#00A1E0' },
  offline: { label: '오프라인', color: '#2EC4B6' },
  b2b: { label: 'B2B', color: '#7B61FF' },
};

export function ServicesSection({
  courses,
  serviceDescription,
  externalLinks,
  primaryColor,
  secondaryColor,
}: ServicesSectionProps) {
  const hasCourses = courses.length > 0;
  const hasLinks = externalLinks.length > 0;

  // 아무 데이터도 없을 때
  if (!hasCourses && !hasLinks && !serviceDescription) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">아직 서비스/교육 과정이 등록되지 않았습니다.</p>
          <p className="text-xs text-gray-400">곧 업데이트 예정입니다.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* 교육 과정 */}
      {hasCourses && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#16325C] mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            교육 과정
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {courses.map((course) => {
              const typeInfo = COURSE_TYPE_LABELS[course.type] || { label: course.type, color: '#6b7280' };
              return (
                <div
                  key={course.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
                >
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-36 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`,
                        }}
                      >
                        <svg
                          className="w-10 h-10 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      </div>
                    )}

                    <div className="p-4">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white mb-2"
                        style={{ background: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      <h3 className="font-semibold text-[#16325C] text-sm mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: primaryColor }}>
                          {course.price ? `${course.price.toLocaleString()}원` : '무료'}
                        </span>
                        {course.externalLink && (
                          <a
                            href={course.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                            style={{ color: primaryColor }}
                          >
                            자세히 보기
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 외부 링크 허브 */}
      {hasLinks && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#16325C] mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Links
          </h2>
          <div className="space-y-2">
            {externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[#16325C] font-medium hover:shadow-md hover:border-gray-300 transition-all text-sm"
                style={{ borderLeftWidth: '4px', borderLeftColor: primaryColor }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
