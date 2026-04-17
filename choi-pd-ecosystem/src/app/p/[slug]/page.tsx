// distributors fallback 반영을 위해 항상 동적 렌더. 필요 시 fetch 레벨 캐시로 전환.
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { tenants, courses, snsAccounts, personalDna, members, posts, works } from '@/lib/db/schema';
import { distributors } from '@/lib/db/schema/distribution';
import { eq, and, desc } from 'drizzle-orm';
import { DistributorFallbackPage } from '@/app/member/[slug]/DistributorFallbackPage';
import { OwnerBar } from './OwnerBar';
import { ViewTracker } from './ViewTracker';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { TrustSection } from './sections/TrustSection';
import { ActivitySection } from './sections/ActivitySection';
import { ChannelHub } from './sections/ChannelHub';
import { FeedSection } from './sections/FeedSection';
import { BooksSection } from './sections/BooksSection';
import { PressSection } from './sections/PressSection';
import { CalendarSection } from './sections/CalendarSection';
import { BusinessTrustSection, type BusinessInfo } from './sections/BusinessTrustSection';
import { ContactSection } from './sections/ContactSection';
import { FooterSection } from './sections/FooterSection';

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

function safeParseJson<T = any>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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
  const description = bio || serviceDescription || `${tenant.name}의 브랜드 페이지입니다.`;

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
    // tenants 에 없으면 distributors 에서 재조회 → /choi 레이아웃 공개 페이지 렌더
    const distRows = await db
      .select()
      .from(distributors)
      .where(eq(distributors.slug, slug))
      .limit(1);

    if (distRows.length === 0) {
      notFound();
    }

    const d = distRows[0];
    const parsed = d.identityJson ? safeParseJson(d.identityJson) : null;
    return (
      <DistributorFallbackPage
        slug={d.slug || slug}
        name={d.name}
        email={d.email}
        region={d.region}
        businessType={d.businessType}
        identity={parsed}
        status={d.status}
        updatedAt={d.updatedAt ?? null}
      />
    );
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

  // 병렬 쿼리: 교육 과정 + SNS 계정 + 멤버 + 포스트 + 작품
  const [tenantCourses, tenantSns, tenantMembers, tenantPosts, tenantWorks] = await Promise.all([
    db.select().from(courses).where(and(eq(courses.tenantId, tenant.id), eq(courses.published, true))),
    db.select().from(snsAccounts).where(and(eq(snsAccounts.tenantId, tenant.id), eq(snsAccounts.isActive, true))),
    db.select().from(members).where(eq(members.tenantId, tenant.id)).limit(1),
    db.select().from(posts)
      .where(and(eq(posts.tenantId, tenant.id), eq(posts.published, true)))
      .orderBy(desc(posts.createdAt))
      .limit(5),
    db.select().from(works)
      .where(eq(works.tenantId, tenant.id))
      .orderBy(desc(works.createdAt))
      .limit(12),
  ]);

  const tenantBooks = tenantWorks.filter((w) => w.category === 'gallery').slice(0, 6);
  const tenantPress = tenantWorks.filter((w) => w.category === 'press').slice(0, 6);

  // Personal DNA — 핵심 가치 추출
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

  // 수상 이력 파싱
  const awards: Array<{ title: string; org?: string; year?: number }> = (() => {
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

  // 사업자 정보 파싱
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
      <ViewTracker slug={slug} />
      <OwnerBar slug={slug} brandName={tenant.name} />

      <HeroSection
        name={tenant.name}
        logoUrl={tenant.logoUrl ?? null}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        professionInfo={professionInfo}
        bio={bio}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2 space-y-6 pb-12">
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
        <ServicesSection
          courses={tenantCourses}
          serviceDescription={serviceDescription}
          externalLinks={externalLinks}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
        <TrustSection
          awards={awards}
          pressMentions={pressMentions}
          primaryColor={primaryColor}
        />
        <ActivitySection snsAccounts={tenantSns} />
        <ChannelHub snsAccounts={tenantSns} />
        <FeedSection posts={tenantPosts} />
        <BooksSection books={tenantBooks} />
        <PressSection pressItems={tenantPress} />
        <CalendarSection />
        <BusinessTrustSection businessInfo={businessInfo} awards={awards} />
        <ContactSection tenantId={tenant.id} primaryColor={primaryColor} />
        <FooterSection tenantName={tenant.name} primaryColor={primaryColor} />
      </main>
    </div>
  );
}
