// ISS-047: Trust 섹션 — 수상/언론/공신력 지표
// Server Component

import type { TrustSectionProps } from './types';

export function TrustSection({ awards, pressMentions, primaryColor }: TrustSectionProps) {
  const hasAwards = awards.length > 0;
  const hasPress = pressMentions > 0;

  if (!hasAwards && !hasPress) {
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
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">아직 수상/언론 정보가 등록되지 않았습니다.</p>
          <p className="text-xs text-gray-400">곧 업데이트 예정입니다.</p>
        </div>
      </section>
    );
  }

  return (
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
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
        공신력
      </h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* 언론 노출 지표 */}
        {hasPress && (
          <div className="mb-5">
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: `${primaryColor}10` }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: primaryColor }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l4 4v10a2 2 0 0 1-2 2z" />
                  <line x1="9" y1="11" x2="15" y2="11" />
                  <line x1="9" y1="15" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: primaryColor }}>
                  {pressMentions}
                  <span className="text-sm font-normal text-gray-600 ml-1">건</span>
                </p>
                <p className="text-xs text-gray-600">언론 보도 / 미디어 노출</p>
              </div>
            </div>
          </div>
        )}

        {/* 수상 목록 */}
        {hasAwards && (
          <div>
            {hasPress && (
              <h3 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                수상 이력
              </h3>
            )}
            <ul className="space-y-3">
              {awards.map((award, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${primaryColor}15` }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      style={{ color: primaryColor }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#16325C]">{award.title}</p>
                    {(award.org || award.year) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[award.org, award.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
