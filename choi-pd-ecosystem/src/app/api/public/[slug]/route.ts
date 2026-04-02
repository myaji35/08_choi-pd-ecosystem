/**
 * 공개 프로필 API — AI 크롤러 및 외부 서비스용
 *
 * GET /api/public/[slug] — 회원 프로필 + 과정 정보 구조화 JSON
 *
 * GEO(Generative Engine Optimization) 대응:
 * - AI 검색엔진(ChatGPT, Perplexity, Gemini)이 크롤링 가능한 공개 엔드포인트
 * - schema.org 호환 구조화 데이터 포함
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants, courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || slug.length < 2) {
      return NextResponse.json(
        { error: 'Invalid slug', code: 'INVALID_SLUG' },
        { status: 400 }
      );
    }

    // 테넌트 조회
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .get();

    if (!tenant) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 공개 과정 조회
    const publicCourses = await db.query.courses.findMany({
      where: eq(courses.published, true),
      columns: {
        id: true,
        title: true,
        description: true,
        type: true,
        price: true,
        thumbnailUrl: true,
        externalLink: true,
      },
      limit: 20,
    });

    // 구조화된 응답 (schema.org 호환)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://impd.com';

    const response = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: tenant.name,
        url: `${baseUrl}/p/${tenant.slug}`,
        description: `${tenant.name} - ${tenant.profession || '1인 사업자'}의 브랜드 허브`,
        jobTitle: tenant.profession || undefined,
        knowsAbout: tenant.profession
          ? getProfessionExpertise(tenant.profession)
          : [],
        sameAs: [], // SNS 링크 (향후 확장)
      },
      // 과정 정보
      courses: publicCourses.map((course) => ({
        '@type': 'Course',
        name: course.title,
        description: course.description || '',
        courseMode: (course.type as string) === 'vod' ? 'online' : 'mixed',
        ...(course.price
          ? {
              offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: 'KRW',
                availability: 'https://schema.org/InStock',
              },
            }
          : {}),
        ...(course.thumbnailUrl ? { image: course.thumbnailUrl } : {}),
        ...(course.externalLink ? { url: course.externalLink } : {}),
      })),
      // 플랫폼 정보
      platform: {
        name: 'imPD',
        url: baseUrl,
        description: '1인 사업자를 위한 AI 브랜드 매니저',
      },
      // 메타 정보
      meta: {
        slug: tenant.slug,
        profession: tenant.profession,
        createdAt: tenant.createdAt,
        courseCount: publicCourses.length,
      },
    };

    // 캐시 헤더 (1시간)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Type': 'application/ld+json',
      },
    });
  } catch (error) {
    console.error('Public profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/** 직업군별 전문 분야 매핑 */
function getProfessionExpertise(profession: string): string[] {
  const map: Record<string, string[]> = {
    pd: ['방송 제작', '콘텐츠 기획', '미디어 프로듀싱', '유튜브 운영'],
    shopowner: ['온라인 쇼핑몰', '이커머스', '상품 마케팅', '고객 관리'],
    realtor: ['부동산 중개', '부동산 컨설팅', '매물 마케팅', '부동산 투자'],
    educator: ['온라인 교육', '강의 제작', '교육 커리큘럼', '학습 콘텐츠'],
    insurance: ['보험 설계', '재무 컨설팅', '리스크 관리', '금융 상품'],
    freelancer: ['프리랜스', '포트폴리오', '클라이언트 관리', '프로젝트 관리'],
  };
  return map[profession] || ['브랜드 관리', '콘텐츠 마케팅', 'SNS 관리'];
}
