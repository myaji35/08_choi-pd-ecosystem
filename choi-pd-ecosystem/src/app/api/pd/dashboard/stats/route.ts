import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsAccounts, snsScheduledPosts, leads, settings, heroImages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

// GET /api/pd/dashboard/stats — 대시보드 상단 지표 + 온보딩 체크리스트
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    // 1. SNS 연결 계정 수 (is_active = true)
    const activeSnsAccounts = await db
      .select()
      .from(snsAccounts)
      .where(and(
        tenantFilter(snsAccounts.tenantId, tenantId),
        eq(snsAccounts.isActive, true)
      ))
      .all();

    // 2. 예약 포스트 수 (status = 'pending')
    const scheduledPosts = await db
      .select()
      .from(snsScheduledPosts)
      .where(and(
        tenantFilter(snsScheduledPosts.tenantId, tenantId),
        eq(snsScheduledPosts.status, 'pending')
      ))
      .all();

    // 3. 구독자 수
    const subscribers = await db
      .select()
      .from(leads)
      .where(tenantFilter(leads.tenantId, tenantId))
      .all();

    // 4. 온보딩 체크리스트
    // 4-1. 프로필 사진: public/images/profile.jpg 파일 존재 여부
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    const profileImagePath = join(process.cwd(), 'public', 'images', 'profile.jpg');
    const hasProfileImage = existsSync(profileImagePath);

    // 4-2. 자기소개(bio): settings 테이블에 profile_bio 키 존재 + 값 있음
    const bioSetting = await db
      .select()
      .from(settings)
      .where(and(
        tenantFilter(settings.tenantId, tenantId),
        eq(settings.key, 'profile_bio')
      ))
      .get();
    const hasBio = !!(bioSetting?.value && bioSetting.value.trim().length > 0);

    // 4-3. SNS 연결: 활성 계정 1개 이상
    const hasSnsConnected = activeSnsAccounts.length > 0;

    // 4-4. 첫 콘텐츠 예약: scheduled posts 1개 이상 (status 무관)
    const allScheduledPosts = await db
      .select()
      .from(snsScheduledPosts)
      .where(tenantFilter(snsScheduledPosts.tenantId, tenantId))
      .all();
    const hasFirstPost = allScheduledPosts.length > 0;

    const checklist = [
      { key: 'profileImage', label: '프로필 사진', done: hasProfileImage },
      { key: 'bio', label: '자기소개(Bio)', done: hasBio },
      { key: 'snsConnected', label: 'SNS 계정 연결', done: hasSnsConnected },
      { key: 'firstPost', label: '첫 콘텐츠 예약', done: hasFirstPost },
    ];
    const completedCount = checklist.filter(c => c.done).length;
    const allComplete = completedCount === checklist.length;

    return NextResponse.json({
      success: true,
      stats: {
        activeSnsAccounts: activeSnsAccounts.length,
        scheduledPosts: scheduledPosts.length,
        subscribers: subscribers.length,
      },
      onboarding: {
        checklist,
        completedCount,
        totalCount: checklist.length,
        allComplete,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
