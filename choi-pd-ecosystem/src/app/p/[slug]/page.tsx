export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { tenants, courses, snsAccounts, tenantMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { SharePanel } from './SharePanel';

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

  // 소유자 여부 판별 (쿠키 기반)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('impd_session')?.value;
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  let isOwner = false;

  if (sessionCookie || isDevMode) {
    // dev mode에서는 dev_user가 소유자인지 확인
    const userId = isDevMode ? 'dev_user' : null;
    if (userId) {
      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(
          eq(tenantMembers.tenantId, tenant.id),
          eq(tenantMembers.clerkUserId, userId),
          eq(tenantMembers.role, 'owner')
        ))
        .get();
      isOwner = !!membership;
    }
  }

  // 설정 JSON 파싱
  const tenantSettings = tenant.settings ? JSON.parse(tenant.settings) : {};
  const tenantMetadata = tenant.metadata ? JSON.parse(tenant.metadata) : {};
  const bio = tenantSettings.bio || tenantMetadata.bio || '';
  const ownerName = tenantSettings.ownerName || '';
  const contactEmail = tenantSettings.email || '';
  const contactPhone = tenantSettings.phone || '';
  const serviceDescription = tenantSettings.serviceDescription || '';
  const externalLinks: Array<{ label: string; url: string }> = tenantSettings.externalLinks || [];
  const youtubeUrl = tenantSettings.youtubeUrl || '';

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
      {/* ---- 소유자 전용: 슬림 어드민 바 ---- */}
      {isOwner && (
        <div className="bg-[#16325C] text-white px-4 py-2">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-xs text-white/70">
              이 페이지는 방문자에게 이렇게 보입니다
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/${slug}/settings`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                편집
              </Link>
              <SharePanel slug={slug} brandName={tenant.name} primaryColor="#ffffff" compact />
            </div>
          </div>
        </div>
      )}

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

        {/* ---- 프로필 카드 (좌: 정보, 우: 명함 뒷면 인라인) ---- */}
        {(ownerName || serviceDescription || contactEmail || contactPhone) && (
          <section className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* 좌측: 프로필 정보 */}
                <div className="flex-1 min-w-0">
                  {ownerName && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
                        {ownerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#16325C]">{ownerName}</p>
                        <p className="text-xs text-gray-500">{professionInfo.label}</p>
                      </div>
                    </div>
                  )}
                  {serviceDescription && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        서비스 소개
                      </h3>
                      <p className="text-sm text-[#16325C] leading-relaxed">{serviceDescription}</p>
                    </div>
                  )}
                  {(contactEmail || contactPhone) && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                      {contactEmail && (
                        <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#16325C] transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                          </svg>
                          {contactEmail}
                        </a>
                      )}
                      {contactPhone && (
                        <a href={`tel:${contactPhone}`} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#16325C] transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {contactPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 우측: 명함 뒷면 (카드 안 인라인, 9:5 비율) */}
                <div className="md:w-[270px] flex-shrink-0 hidden md:block">
                  <div className="rounded border border-gray-400 bg-white cursor-pointer hover:shadow-md transition-shadow" style={{ aspectRatio: '9/5' }} title="클릭하면 PNG파일로 복사됩니다">
                    <div className="h-full flex items-center px-4 py-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {tenant.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tenant.logoUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}>
                              <span className="text-[9px] font-bold" style={{ color: primaryColor }}>{tenant.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-[#16325C] truncate leading-tight">{tenant.name}</p>
                            {ownerName && <p className="text-[8px] text-gray-400 truncate">{ownerName}</p>}
                          </div>
                        </div>
                        <div className="space-y-px">
                          {contactEmail && (
                            <p className="text-[8px] text-gray-400 flex items-center gap-1 truncate">
                              <svg className="w-2 h-2 flex-shrink-0" style={{ color: primaryColor }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                              </svg>
                              {contactEmail}
                            </p>
                          )}
                          <p className="text-[7px] text-gray-300 mt-0.5">impd.io/{slug}</p>
                        </div>
                      </div>
                      <div className="w-11 h-11 border border-gray-200 rounded bg-white flex items-center justify-center p-0.5 flex-shrink-0">
                        <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-[0.5px]">
                          {[1,1,1,0,1,1,1, 1,0,1,0,1,0,1, 1,1,1,0,1,1,1, 0,0,0,0,0,0,0, 1,0,1,1,0,1,0, 1,0,0,0,1,0,1, 1,1,1,0,1,1,1].map((v, i) => (
                            <div key={i} className={`${v ? 'bg-[#16325C]' : 'bg-transparent'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-center mt-1.5" style={{ color: '#808080' }}>클릭하면 PNG파일로 복사됩니다. 명함에 이쁘게 사용하세요!</p>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* ---- 직종 맞춤 서비스 쇼케이스 ---- */}
        {tenantCourses.length === 0 && tenantSns.length === 0 && externalLinks.length === 0 && (() => {
          // 직종별 맞춤 기능 설명
          const professionFeatures: Record<string, Array<{ title: string; desc: string; icon: string }>> = {
            pd: [
              { title: '방송·콘텐츠 포트폴리오', desc: '제작 영상, 출연 프로그램, 수상 이력을 한눈에 보여줍니다.', icon: 'film' },
              { title: '출연·섭외 문의', desc: '방송 출연, MC, 강연 섭외 요청을 바로 받을 수 있습니다.', icon: 'mic' },
              { title: '크리에이터 교육', desc: '유튜브, 틱톡, 라이브 방송 노하우를 공유합니다.', icon: 'book' },
              { title: 'SNS 채널 통합', desc: 'YouTube, Instagram 등 모든 채널을 한 페이지에서 관리합니다.', icon: 'share' },
            ],
            shopowner: [
              { title: '상품 카탈로그', desc: '대표 상품과 신상품을 매력적으로 소개합니다.', icon: 'package' },
              { title: '프로모션·이벤트', desc: '할인, 시즌 세일, 기획전 정보를 실시간 공유합니다.', icon: 'tag' },
              { title: '고객 후기', desc: '실제 구매 고객의 리뷰와 평점을 보여줍니다.', icon: 'star' },
              { title: '매장 안내', desc: '영업시간, 위치, 연락처를 한곳에서 안내합니다.', icon: 'map' },
            ],
            realtor: [
              { title: '매물 리스트', desc: '추천 매물, 신규 매물을 사진과 함께 소개합니다.', icon: 'home' },
              { title: '시세 리포트', desc: '지역별 시세 동향과 투자 분석 자료를 제공합니다.', icon: 'chart' },
              { title: '상담 예약', desc: '온라인으로 상담 일정을 잡을 수 있습니다.', icon: 'calendar' },
              { title: '자격·경력 소개', desc: '공인중개사 자격, 전문 분야, 거래 실적을 보여줍니다.', icon: 'award' },
            ],
            educator: [
              { title: '강의 프로그램', desc: '온·오프라인 강의, 워크숍 일정을 소개합니다.', icon: 'book' },
              { title: '수강 후기', desc: '수강생들의 생생한 후기와 성과를 보여줍니다.', icon: 'star' },
              { title: '교육 자료', desc: '무료 콘텐츠, 샘플 강의로 전문성을 증명합니다.', icon: 'file' },
              { title: '수강 신청', desc: '온라인으로 바로 수강 신청을 받을 수 있습니다.', icon: 'check' },
            ],
            insurance: [
              { title: '보험 컨설팅', desc: '생명보험, 손해보험, 연금 등 맞춤 설계를 안내합니다.', icon: 'shield' },
              { title: '자격·전문 분야', desc: 'MDRT, CFP 등 보유 자격과 전문 영역을 소개합니다.', icon: 'award' },
              { title: '고객 사례', desc: '실제 설계 사례와 고객 만족도를 보여줍니다.', icon: 'users' },
              { title: '무료 상담', desc: '온라인으로 무료 보험 상담을 신청할 수 있습니다.', icon: 'phone' },
            ],
            freelancer: [
              { title: '서비스 소개', desc: '제공하는 서비스와 전문 분야를 상세히 안내합니다.', icon: 'briefcase' },
              { title: '포트폴리오', desc: '작업물, 프로젝트 사례를 시각적으로 보여줍니다.', icon: 'image' },
              { title: '고객 후기', desc: '함께 일한 클라이언트의 추천과 평가를 공유합니다.', icon: 'star' },
              { title: '프로젝트 문의', desc: '새로운 프로젝트 의뢰를 바로 받을 수 있습니다.', icon: 'send' },
            ],
          };

          const features = professionFeatures[tenant.profession] || professionFeatures.freelancer;

          const iconSvgs: Record<string, React.ReactNode> = {
            film: <path d="M19.82 2H4.18A2.18 2.18 0 0 0 2 4.18v15.64A2.18 2.18 0 0 0 4.18 22h15.64A2.18 2.18 0 0 0 22 19.82V4.18A2.18 2.18 0 0 0 19.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />,
            mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
            book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
            share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
            package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
            tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
            star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
            map: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
            home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
            chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
            calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
            award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
            shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
            users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
            phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
            briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
            image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
            send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
            file: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
            check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
          };

          return (
            <section className="mb-8">
              <h2 className="text-base font-bold text-[#16325C] mb-1 text-center">
                {tenant.name}에서 만나보세요
              </h2>
              <p className="text-xs text-gray-500 mb-4 text-center">
                {professionInfo.label} 맞춤 브랜드 허브
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${primaryColor}15` }}>
                        <svg className="w-[18px] h-[18px]" style={{ color: primaryColor }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          {iconSvgs[f.icon] || iconSvgs.briefcase}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#16325C]">{f.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            {/* CTA — 방문자에게는 문의, 소유자에게는 설정 */}
            <div className="mt-4 text-center">
              {isOwner ? (
                <Link
                  href={`/${slug}/settings`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ background: primaryColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  콘텐츠 등록 시작하기
                </Link>
              ) : (
                <a
                  href={contactEmail ? `mailto:${contactEmail}` : '#'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ background: primaryColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  문의하기
                </a>
              )}
            </div>
          </section>
          );
        })()}

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
