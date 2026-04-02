export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { tenants, courses, snsAccounts, inquiries } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { BrandPageContactForm } from './contact-form';

// ---- 직업군 한글 라벨 + 배지 색상 ----

const PROFESSION_LABELS: Record<string, { label: string; color: string }> = {
  pd: { label: 'PD / 방송인', color: '#E4405F' },
  shopowner: { label: '쇼핑몰 운영자', color: '#FF6B35' },
  realtor: { label: '부동산 중개인', color: '#2EC4B6' },
  educator: { label: '교육자 / 강사', color: '#00A1E0' },
  insurance: { label: '보험 설계사', color: '#7B61FF' },
  freelancer: { label: '프리랜서', color: '#16325C' },
};

// ---- SNS 아이콘 매핑 (Feather-style SVG) ----

const SNS_ICONS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  twitter: {
    label: 'X (Twitter)',
    color: '#000000',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
};

// ---- 과정 타입 라벨 ----

const COURSE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  online: { label: '온라인', color: '#00A1E0' },
  offline: { label: '오프라인', color: '#2EC4B6' },
  b2b: { label: 'B2B', color: '#7B61FF' },
};

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;

  // 테넌트 조회
  const tenantResult = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
    .limit(1);

  if (tenantResult.length === 0) {
    notFound();
  }

  const tenant = tenantResult[0];
  const primaryColor = tenant.primaryColor || '#3b82f6';
  const secondaryColor = tenant.secondaryColor || '#8b5cf6';
  const professionInfo = PROFESSION_LABELS[tenant.profession] || { label: tenant.profession, color: '#16325C' };

  // 설정 JSON 파싱
  const tenantSettings = tenant.settings ? JSON.parse(tenant.settings) : {};
  const tenantMetadata = tenant.metadata ? JSON.parse(tenant.metadata) : {};
  const bio = tenantSettings.bio || tenantMetadata.bio || '';
  const externalLinks: Array<{ label: string; url: string }> = tenantSettings.externalLinks || [];

  // 해당 테넌트의 공개 교육 과정
  const tenantCourses = await db
    .select()
    .from(courses)
    .where(and(eq(courses.tenantId, tenant.id), eq(courses.published, true)));

  // 해당 테넌트의 활성 SNS 계정
  const tenantSns = await db
    .select()
    .from(snsAccounts)
    .where(and(eq(snsAccounts.tenantId, tenant.id), eq(snsAccounts.isActive, true)));

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* ---- 히어로 헤더 ---- */}
      <header
        className="relative w-full"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center">
            {/* 로고 또는 이니셜 */}
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={`${tenant.name} 로고`}
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {tenant.name.charAt(0)}
                </span>
              </div>
            )}

            {/* 테넌트 이름 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {tenant.name}
            </h1>

            {/* 직업군 배지 */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
              style={{ background: professionInfo.color }}
            >
              {professionInfo.label}
            </span>

            {/* 소개 텍스트 */}
            {bio && (
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-lg">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* 하단 곡선 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C360 0 720 0 1080 30L1440 60H0Z" fill="#F3F2F2" />
          </svg>
        </div>
      </header>

      {/* ---- 메인 콘텐츠 ---- */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2">

        {/* ---- SNS 링크 섹션 ---- */}
        {tenantSns.length > 0 && (
          <section className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {tenantSns.map((account) => {
                const snsInfo = SNS_ICONS[account.platform];
                if (!snsInfo) return null;
                // SNS 계정의 metadata에서 profileUrl 가져오기
                const meta = account.metadata ? JSON.parse(account.metadata) : {};
                const url = meta.profileUrl || `#`;

                return (
                  <a
                    key={account.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md transition-all text-sm font-medium"
                  >
                    <span style={{ color: snsInfo.color }}>{snsInfo.icon}</span>
                    <span>{account.accountName || snsInfo.label}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ---- 외부 링크 허브 (Linktree 대체) ---- */}
        {externalLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#16325C] mb-3 text-center">
              <svg className="w-5 h-5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[#16325C] font-medium hover:shadow-md hover:border-gray-300 transition-all text-sm"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: primaryColor,
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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

        {/* ---- 교육 과정 섹션 ---- */}
        {tenantCourses.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#16325C] mb-3">
              <svg className="w-5 h-5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              교육 과정
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {tenantCourses.map((course) => {
                const typeInfo = COURSE_TYPE_LABELS[course.type] || { label: course.type, color: '#6b7280' };
                return (
                  <div
                    key={course.id}
                    className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
                  >
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* 썸네일 */}
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
                          style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
                        >
                          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                        </div>
                      )}

                      <div className="p-4">
                        {/* 타입 배지 */}
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
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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

        {/* ---- 문의 폼 섹션 ---- */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#16325C] mb-3">
            <svg className="w-5 h-5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            문의하기
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <BrandPageContactForm tenantId={tenant.id} primaryColor={primaryColor} />
          </div>
        </section>

        {/* ---- 푸터 ---- */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Powered by
            <Link
              href="https://impd.townin.net"
              className="inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: primaryColor }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              imPD
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
