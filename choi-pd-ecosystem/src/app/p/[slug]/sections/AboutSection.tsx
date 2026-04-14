// ISS-047: About 섹션 — 자기 소개(bio, 핵심 가치, 연락처)
// Server Component

import type { AboutSectionProps } from './types';

export function AboutSection({
  bio,
  coreValues,
  ownerName,
  contactEmail,
  contactPhone,
  serviceDescription,
  primaryColor,
  professionLabel,
}: AboutSectionProps) {
  const hasContent = ownerName || bio || serviceDescription || contactEmail || contactPhone || coreValues.length > 0;

  if (!hasContent) {
    return (
      <section className="mb-6">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">아직 자기 소개가 등록되지 않았습니다.</p>
          <p className="text-xs text-gray-400">곧 업데이트 예정입니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* 소유자 이름 + 직종 */}
        {ownerName && (
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: primaryColor }}
            >
              {ownerName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#16325C]">{ownerName}</p>
              <p className="text-xs text-gray-500">{professionLabel}</p>
            </div>
          </div>
        )}

        {/* 자기 소개 */}
        {bio && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              소개
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
          </div>
        )}

        {/* 서비스 설명 */}
        {serviceDescription && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              서비스 소개
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{serviceDescription}</p>
          </div>
        )}

        {/* 핵심 가치 배지 */}
        {coreValues.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
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
              핵심 가치
            </h2>
            <div className="flex flex-wrap gap-2">
              {coreValues.map((value, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: primaryColor }}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 연락처 */}
        {(contactEmail || contactPhone) && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#16325C] transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {contactEmail}
              </a>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#16325C] transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contactPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
