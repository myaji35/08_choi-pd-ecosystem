// ISS-049: 사업자 신뢰블록 — 한국 전자상거래법/개인정보보호법 대응
// Server Component

export interface BusinessInfo {
  businessName?: string;        // 상호
  representativeName?: string;  // 대표자명
  businessNumber?: string;      // 사업자등록번호 (000-00-00000)
  mailOrderNumber?: string;     // 통신판매업 신고번호
  businessType?: string;        // 업종/업태
  address?: string;             // 사업장 주소
  phone?: string;               // 대표 연락처
  email?: string;               // 고객센터 이메일
  privacyPolicyUrl?: string;    // 개인정보처리방침
  termsUrl?: string;            // 이용약관
}

export interface AwardItem {
  title: string;
  org?: string;
  year?: number;
}

interface BusinessTrustSectionProps {
  businessInfo?: BusinessInfo | null;
  awards?: AwardItem[];
}

// 사업자등록번호 포맷: 000-00-00000
function formatBusinessNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
  return raw;
}

const INFO_ROWS: Array<{ key: keyof BusinessInfo; label: string; format?: (v: string) => string }> = [
  { key: 'businessName', label: '상호' },
  { key: 'representativeName', label: '대표자명' },
  {
    key: 'businessNumber',
    label: '사업자등록번호',
    format: formatBusinessNumber,
  },
  { key: 'mailOrderNumber', label: '통신판매업 신고번호' },
  { key: 'businessType', label: '업종/업태' },
  { key: 'address', label: '사업장 주소' },
  { key: 'phone', label: '대표 연락처' },
  { key: 'email', label: '고객센터' },
];

export function BusinessTrustSection({
  businessInfo,
  awards,
}: BusinessTrustSectionProps) {
  const hasInfo = businessInfo && Object.values(businessInfo).some(
    (v) => typeof v === 'string' && v.trim() !== ''
  );
  const hasAwards = Array.isArray(awards) && awards.length > 0;

  // 빈 상태: 둘 다 없으면 렌더하지 않음
  if (!hasInfo && !hasAwards) {
    return null;
  }

  const hasLegalLinks =
    businessInfo?.privacyPolicyUrl || businessInfo?.termsUrl;

  return (
    <section className="mb-8">
      {/* 사업자 정보 테이블 */}
      {hasInfo && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500 flex-shrink-0"
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
            <span className="text-xs font-semibold text-gray-600">사업자 정보</span>
          </div>

          <table className="w-full">
            <tbody>
              {INFO_ROWS.map(({ key, label, format }) => {
                const raw = businessInfo?.[key];
                if (!raw || typeof raw !== 'string' || raw.trim() === '') return null;
                const displayValue = format ? format(raw) : raw;
                return (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-xs text-gray-500 font-medium whitespace-nowrap w-36 align-top">
                      {label}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700 break-words">
                      {displayValue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 법적 고지 링크 */}
          {hasLegalLinks && (
            <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-end gap-3">
              {businessInfo?.privacyPolicyUrl && (
                <a
                  href={businessInfo.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
                >
                  개인정보처리방침
                </a>
              )}
              {businessInfo?.termsUrl && (
                <a
                  href={businessInfo.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
                >
                  이용약관
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* 수상/공신력 인디케이터 */}
      {hasAwards && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-xs font-semibold text-gray-600">수상 및 인증</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {awards.map((award, idx) => (
              <li key={idx} className="px-4 py-2.5 flex items-center gap-2">
                <svg
                  className="w-3 h-3 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-xs text-gray-700 font-medium">{award.title}</span>
                {(award.org || award.year) && (
                  <span className="text-xs text-gray-400 ml-auto pl-2 whitespace-nowrap">
                    {[award.org, award.year].filter(Boolean).join(' · ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
