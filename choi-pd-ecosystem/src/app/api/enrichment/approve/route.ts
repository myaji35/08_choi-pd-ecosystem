import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrichmentCache, enrichmentLog, members } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/enrichment/approve
 * 제안 승인/거부 처리
 * Body: { memberId: number, approvedIds?: number[], rejectedIds?: number[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { memberId, approvedIds, rejectedIds } = body;

    if (!memberId || typeof memberId !== 'number') {
      return NextResponse.json(
        { success: false, error: '유효한 memberId가 필요합니다.' },
        { status: 400 },
      );
    }

    // 승인 처리
    if (approvedIds?.length) {
      await db
        .update(enrichmentCache)
        .set({ isApproved: 1 })
        .where(inArray(enrichmentCache.id, approvedIds));

      // 승인된 항목을 프로필에 반영
      const approved = await db
        .select()
        .from(enrichmentCache)
        .where(inArray(enrichmentCache.id, approvedIds))
        .all();

      for (const item of approved) {
        await applyToProfile(memberId, item);
      }

      // 승인 로그
      await db.insert(enrichmentLog).values({
        memberId,
        action: 'user_approved',
        source: 'admin',
        metadata: JSON.stringify({
          ids: approvedIds,
          count: approvedIds.length,
          uploaded_by: 'System Auto-Collection',
        }),
        createdAt: new Date().toISOString(),
      });
    }

    // 거부 처리 — 다시 추천하지 않음
    if (rejectedIds?.length) {
      await db
        .update(enrichmentCache)
        .set({ isApproved: -1 })
        .where(inArray(enrichmentCache.id, rejectedIds));

      // 거부 로그
      await db.insert(enrichmentLog).values({
        memberId,
        action: 'user_rejected',
        source: 'admin',
        metadata: JSON.stringify({
          ids: rejectedIds,
          count: rejectedIds.length,
        }),
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Enrichment:approve] 처리 실패:', error);
    return NextResponse.json(
      { success: false, error: '승인/거부 처리에 실패했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 승인된 enrichment 데이터를 members 프로필에 반영
 * dataType별로 적절한 필드에 매핑
 */
async function applyToProfile(
  memberId: number,
  item: { dataType: string; value: string; source: string },
): Promise<void> {
  try {
    const updateData: Record<string, string> = {};

    switch (item.dataType) {
      case 'photo_url':
        updateData.profileImage = item.value;
        break;
      case 'bio':
        updateData.bio = item.value;
        break;
      case 'location':
        updateData.region = item.value;
        break;
      case 'name':
        // 이름은 이미 있으면 덮어쓰지 않음 (수동 입력 우선)
        break;
      default:
        // company, title, skills, sns_url 등은 socialLinks JSON에 저장
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(members)
        .set(updateData)
        .where(eq(members.id, memberId));
    }
  } catch (error) {
    console.error(`[Enrichment:applyToProfile] 프로필 반영 실패 (${item.dataType}):`, error);
  }
}
