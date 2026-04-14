export const revalidate = 86400;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { tenants, courses, snsAccounts, personalDna, members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { OwnerBar } from './OwnerBar';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { TrustSection } from './sections/TrustSection';
import { ActivitySection } from './sections/ActivitySection';
import { ChannelHub } from './sections/ChannelHub';
import { BusinessTrustSection, type BusinessInfo } from './sections/BusinessTrustSection';

// ---- 직업군 한글 라벨 + 배지 색상 ----

const PROFESSION_LABELS: Record<string, { label: string; color: string }> = {
  pd: { label: 'PD / 방송인', color: '#E4405F' },
  shopowner: { label: '쇼핑몰 운영자', color: '#FF6B35' },
  realtor: { label: '부동산 중개인', color: '#2EC4B6' },
  educator: { label: '교육자 / 강사', color: '#00A1E0' },
  insurance: { label: '보험 설계사', color: '#7B61FF' },
  freelancer: { label: '프리랜서', color: '#16325C' },
};


interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

// ---- generateMetadata ----

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;

  const tenantResult = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
    .limit(1);

  if (tenantResult.length === 0) {
    return { title: 'imPD' };
  }

  const tenant = tenantResult[0];
  const tenantSettings = tenant.settings ? JSON.parse(tenant.settings) : {};
  const tenantMetadata = tenant.metadata ? JSON.parse(tenant.metadata) : {};

  const bio = tenantSettings.bio || tenantMetadata.bio || '';
  const serviceDescription = tenantSettings.serviceDescription || '';
  const description =
    bio || serviceDescription || `${tenant.name}의 브랜드 페이지입니다.`;

  const ogImage = tenant.logoUrl || '/og-default.png';
  const pageUrl = `https://impd.townin.net/p/${slug}`;

  return {
    title: `${tenant.name} | imPD`,
    description,
    openGraph: {
      title: `${tenant.name} | imPD`,
      description,
      url: pageUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${tenant.name} 대표 이미지` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tenant.name} | imPD`,
      description,
      images: [ogImage],
    },
  };
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
  const ownerName = tenantSettings.ownerName || '';
  const contactEmail = tenantSettings.email || '';
  const contactPhone = tenantSettings.phone || '';
  const serviceDescription = tenantSettings.serviceDescription || '';
  const externalLinks: Array<{ label: string; url: string }> = tenantSettings.externalLinks || [];
  const youtubeUrl = tenantSettings.youtubeUrl || '';

  // 병렬 쿼리: 교육 과정 + SNS 계정 + Personal DNA (핵심 가치)
  // members 테이블에서 tenant 소유자 member 조회 후 dna 조회
  const [tenantCourses, tenantSns, tenantMembers] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(and(eq(courses.tenantId, tenant.id), eq(courses.published, true))),
    db
      .select()
      .from(snsAccounts)
      .where(and(eq(snsAccounts.tenantId, tenant.id), eq(snsAccounts.isActive, true))),
    db
      .select()
      .from(members)
      .where(eq(members.tenantId, tenant.id))
      .limit(1),
  ]);

  // Personal DNA — 첫 번째 멤버의 DNA에서 핵심 가치 추출
  let coreValues: string[] = [];
  if (tenantMembers.length > 0) {
    const dnaRows = await db
      .select()
      .from(personalDna)
      .where(eq(personalDna.memberId, tenantMembers[0].id))
      .limit(1);
    if (dnaRows.length > 0 && dnaRows[0].coreValues) {
      try {
        const parsed = JSON.parse(dnaRows[0].coreValues);
        if (Array.isArray(parsed)) coreValues = parsed;
      } catch {
        coreValues = [];
      }
    }
  }

  // 수상 이력 + 언론 노출 수 파싱
  const awards: Array<{ title: string; org?: string; year?: number }> =
    (() => {
      try {
        const raw = tenantSettings.awards;
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
  const pressMentions: number = Number(tenantMetadata.pressMentions) || 0;

  // 사업자 정보 파싱 (settings.businessInfo 하위 키)
  const businessInfo: BusinessInfo | null = (() => {
    try {
      const raw = tenantSettings.businessInfo;
      if (!raw) return null;
      if (typeof raw === 'object') return raw as BusinessInfo;
      return JSON.parse(raw) as BusinessInfo;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* ---- 소유자 전용: 슬림 어드민 바 (클라이언트 아일랜드) ---- */}
      <OwnerBar slug={slug} brandName={tenant.name} />

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

        {/* ---- About 섹션: 자기 소개 + 핵심 가치 + 연락처 ---- */}
        <AboutSection
          bio={bio}
          coreValues={coreValues}
          ownerName={ownerName}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          serviceDescription={serviceDescription}
          primaryColor={primaryColor}
          professionLabel={professionInfo.label}
        />

        {/* ---- Services 섹션: 교육 과정 + 외부 링크 ---- */}
        <ServicesSection
          courses={tenantCourses}
          serviceDescription={serviceDescription}
          externalLinks={externalLinks}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />

        {/* ---- Trust 섹션: 수상/언론/공신력 ---- */}
        <TrustSection
          awards={awards}
          pressMentions={pressMentions}
          primaryColor={primaryColor}
        />

        {/* ---- Activity 섹션: SNS 채널 + 최근 활동 ---- */}
        <ActivitySection
          snsAccounts={tenantSns}
        />

        {/* ---- Channel Hub 섹션: 채널별 활성화 점수 게이지 ---- */}
        <ChannelHub snsAccounts={tenantSns} />

        {/* ---- 사업자 신뢰블록: 법적 정보 + 수상 공인 ---- */}
        <BusinessTrustSection businessInfo={businessInfo} awards={awards} />

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
