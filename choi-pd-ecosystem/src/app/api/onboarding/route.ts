/**
 * 온보딩 API
 *
 * POST /api/onboarding — slug 사용 가능 여부 확인 (check-slug)
 * GET  /api/onboarding — 직업군 목록 조회 (professions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rate-limit';

// 직업군 목록 정의
const PROFESSIONS = [
  {
    id: 'pd',
    name: 'PD/방송인',
    description: '방송 PD, 유튜버, 크리에이터',
    icon: 'tv',
  },
  {
    id: 'shopowner',
    name: '쇼핑몰 운영자',
    description: '온라인/오프라인 쇼핑몰',
    icon: 'shopping-bag',
  },
  {
    id: 'realtor',
    name: '부동산 중개인',
    description: '공인중개사, 부동산 컨설턴트',
    icon: 'home',
  },
  {
    id: 'educator',
    name: '교육자/강사',
    description: '학원, 과외, 온라인 강의',
    icon: 'book-open',
  },
  {
    id: 'insurance',
    name: '보험 설계사',
    description: '보험 설계, 재무 컨설팅',
    icon: 'shield',
  },
  {
    id: 'freelancer',
    name: '프리랜서',
    description: '디자이너, 개발자, 작가',
    icon: 'briefcase',
  },
];

// 예약어 slug (사용 불가)
const RESERVED_SLUGS = [
  'app', 'www', 'api', 'admin', 'dashboard', 'login', 'signup',
  'settings', 'billing', 'help', 'support', 'docs', 'blog',
  'static', 'assets', 'public', 'private', 'internal', 'system',
  'superadmin', 'onboarding', 'chopd',
];

// GET /api/onboarding — 직업군 목록 + 플랜 정보
export async function GET() {
  try {
    return NextResponse.json({
      professions: PROFESSIONS,
      plans: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          billingPeriod: 'monthly',
          features: [
            'SNS 계정 2개',
            '저장공간 500MB',
            '기본 템플릿',
            '커뮤니티 지원',
          ],
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 29000,
          billingPeriod: 'monthly',
          features: [
            'SNS 계정 10개',
            '저장공간 5GB',
            '커스텀 도메인',
            '팀 멤버 3명',
            '우선 지원',
            '고급 분석',
          ],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99000,
          billingPeriod: 'monthly',
          features: [
            'SNS 계정 무제한',
            '저장공간 50GB',
            '커스텀 도메인',
            '팀 멤버 무제한',
            '전담 지원',
            '고급 분석 + API',
            'SSO/SAML',
          ],
        },
      ],
    });
  } catch (error) {
    console.error('온보딩 정보 조회 실패:', error);
    return NextResponse.json(
      { error: '온보딩 정보 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/onboarding — slug 사용 가능 여부 확인
export async function POST(request: NextRequest) {
  try {
    // IP당 30회/분 제한
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const rl = rateLimit(`slug-check:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', code: 'TOO_MANY_REQUESTS' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rl.resetAt),
          },
        }
      );
    }

    // 인증 확인
    const clerkUserId = request.headers.get('x-clerk-user-id');
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!clerkUserId && !isDevMode) {
      return NextResponse.json({ error: '인증이 필요합니다', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'slug는 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // slug 형식 검증
    if (!/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'slug는 영문 소문자, 숫자, 하이픈만 허용되며 3~50자여야 합니다.',
      });
    }

    // 예약어 확인
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json({
        available: false,
        reason: '예약된 slug입니다.',
        suggestion: `${slug}-my`,
      });
    }

    // DB 중복 확인
    const existing = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .get();

    if (existing) {
      // 대안 slug 제안 — DB 중복 체크 루프
      let suggestion = '';
      for (let i = 0; i < 10; i++) {
        const candidate = `${slug}${Math.floor(Math.random() * 999) + 1}`;
        const exists = await db
          .select()
          .from(tenants)
          .where(eq(tenants.slug, candidate))
          .get();
        if (!exists) {
          suggestion = candidate;
          break;
        }
      }
      if (!suggestion) {
        suggestion = `${slug}-${Date.now().toString(36)}`;
      }
      return NextResponse.json({
        available: false,
        reason: '이미 사용 중인 slug입니다.',
        suggestion,
      });
    }

    return NextResponse.json({ available: true });

  } catch (error) {
    console.error('slug 확인 실패:', error);
    return NextResponse.json(
      { error: 'slug 확인에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
