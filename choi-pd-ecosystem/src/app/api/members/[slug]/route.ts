import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

/**
 * GET /api/members/[slug]
 * 회원 공개 프로필 조회 (approved 상태만)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { slug } = await params;

    const member = await db
      .select({
        id: members.id,
        slug: members.slug,
        name: members.name,
        bio: members.bio,
        profileImage: members.profileImage,
        coverImage: members.coverImage,
        socialLinks: members.socialLinks,
        enabledModules: members.enabledModules,
        themeConfig: members.themeConfig,
        businessType: members.businessType,
        region: members.region,
      })
      .from(members)
      .where(and(eq(members.slug, slug), eq(members.status, 'approved'), tenantFilter(members.tenantId, tenantId)))
      .limit(1);

    if (member.length === 0) {
      return NextResponse.json(
        { error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const data = member[0];

    return NextResponse.json({
      ...data,
      socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : {},
      enabledModules: data.enabledModules ? JSON.parse(data.enabledModules) : [],
      themeConfig: data.themeConfig ? JSON.parse(data.themeConfig) : {},
    });
  } catch (error) {
    console.error('Member API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
