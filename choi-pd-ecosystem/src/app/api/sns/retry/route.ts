import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsScheduledPosts, snsPostHistory } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { publishToSocialPulse } from '@/lib/sns/social-pulse-client';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

const MAX_RETRY_COUNT = 3;

// POST /api/sns/retry - 실패한 예약 포스트 재시도
// body: { postId?: number } — 특정 포스트 ID 지정 시 해당 건만 재시도, 없으면 전체 실패 건 일괄 재시도
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { postId } = body as { postId?: number };

    // 재시도 대상 조회: status='failed' AND retryCount < MAX_RETRY_COUNT
    const conditions = [
      tenantFilter(snsScheduledPosts.tenantId, tenantId),
      eq(snsScheduledPosts.status, 'failed'),
      lt(snsScheduledPosts.retryCount, MAX_RETRY_COUNT),
    ];

    if (postId) {
      conditions.push(eq(snsScheduledPosts.id, postId));
    }

    const failedPosts = await db
      .select()
      .from(snsScheduledPosts)
      .where(and(...conditions))
      .all();

    if (failedPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: '재시도할 실패 포스트가 없습니다.',
        retried: 0,
        results: [],
      });
    }

    const results: Array<{
      postId: number;
      platform: string;
      retryCount: number;
      success: boolean;
      error?: string;
      newStatus: string;
    }> = [];

    for (const post of failedPosts) {
      const newRetryCount = (post.retryCount ?? 0) + 1;

      // 발행 상태로 전환
      await db
        .update(snsScheduledPosts)
        .set({
          status: 'publishing',
          retryCount: newRetryCount,
          updatedAt: new Date(),
        })
        .where(eq(snsScheduledPosts.id, post.id));

      try {
        // SNS 발행 시도 (SocialPulse 클라이언트 사용)
        const publishResult = await publishToSocialPulse({
          platform: post.platform.toUpperCase(),
          content: post.message,
          imageUrl: post.imageUrl ?? undefined,
          link: post.link ?? undefined,
        });

        if (publishResult.success) {
          // 성공: status='published'로 변경
          await db
            .update(snsScheduledPosts)
            .set({
              status: 'published',
              publishedAt: new Date(),
              externalPostId: publishResult.externalPostId ?? publishResult.postId ?? null,
              error: null,
              updatedAt: new Date(),
            })
            .where(eq(snsScheduledPosts.id, post.id));

          // 히스토리 기록
          await db.insert(snsPostHistory).values({
            tenantId: post.tenantId,
            scheduledPostId: post.id,
            platform: post.platform,
            externalPostId: publishResult.externalPostId ?? publishResult.postId ?? null,
            action: 'created',
            status: 'success',
            response: JSON.stringify(publishResult),
            metadata: JSON.stringify({ retryCount: newRetryCount }),
          });

          results.push({
            postId: post.id,
            platform: post.platform,
            retryCount: newRetryCount,
            success: true,
            newStatus: 'published',
          });
        } else {
          // 발행 실패
          const newStatus = newRetryCount >= MAX_RETRY_COUNT ? 'permanently_failed' : 'failed';
          const errorMsg = publishResult.error ?? 'Unknown publish error';

          await db
            .update(snsScheduledPosts)
            .set({
              status: newStatus,
              error: errorMsg,
              updatedAt: new Date(),
            })
            .where(eq(snsScheduledPosts.id, post.id));

          // 히스토리 기록
          await db.insert(snsPostHistory).values({
            tenantId: post.tenantId,
            scheduledPostId: post.id,
            platform: post.platform,
            action: 'failed',
            status: 'error',
            error: errorMsg,
            metadata: JSON.stringify({ retryCount: newRetryCount, permanentlyFailed: newStatus === 'permanently_failed' }),
          });

          results.push({
            postId: post.id,
            platform: post.platform,
            retryCount: newRetryCount,
            success: false,
            error: errorMsg,
            newStatus,
          });
        }
      } catch (err) {
        // 네트워크/런타임 에러
        const newStatus = newRetryCount >= MAX_RETRY_COUNT ? 'permanently_failed' : 'failed';
        const errorMsg = err instanceof Error ? err.message : 'Unexpected error during retry';

        await db
          .update(snsScheduledPosts)
          .set({
            status: newStatus,
            error: errorMsg,
            updatedAt: new Date(),
          })
          .where(eq(snsScheduledPosts.id, post.id));

        await db.insert(snsPostHistory).values({
          tenantId: post.tenantId,
          scheduledPostId: post.id,
          platform: post.platform,
          action: 'failed',
          status: 'error',
          error: errorMsg,
          metadata: JSON.stringify({ retryCount: newRetryCount, permanentlyFailed: newStatus === 'permanently_failed' }),
        });

        results.push({
          postId: post.id,
          platform: post.platform,
          retryCount: newRetryCount,
          success: false,
          error: errorMsg,
          newStatus,
        });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const permanentlyFailed = results.filter(r => r.newStatus === 'permanently_failed').length;

    return NextResponse.json({
      success: true,
      message: `${results.length}건 재시도 완료: ${succeeded}건 성공, ${results.length - succeeded}건 실패 (${permanentlyFailed}건 영구 실패)`,
      retried: results.length,
      succeeded,
      permanentlyFailed,
      results,
    });
  } catch (error) {
    console.error('Failed to retry SNS posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retry SNS posts' },
      { status: 500 }
    );
  }
}

// GET /api/sns/retry - 재시도 가능한 실패 포스트 조회
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    const retryable = await db
      .select()
      .from(snsScheduledPosts)
      .where(
        and(
          tenantFilter(snsScheduledPosts.tenantId, tenantId),
          eq(snsScheduledPosts.status, 'failed'),
          lt(snsScheduledPosts.retryCount, MAX_RETRY_COUNT),
        )
      )
      .all();

    const permanentlyFailedPosts = await db
      .select()
      .from(snsScheduledPosts)
      .where(
        and(
          tenantFilter(snsScheduledPosts.tenantId, tenantId),
          eq(snsScheduledPosts.status, 'permanently_failed'),
        )
      )
      .all();

    return NextResponse.json({
      success: true,
      retryable: {
        count: retryable.length,
        posts: retryable,
      },
      permanentlyFailed: {
        count: permanentlyFailedPosts.length,
        posts: permanentlyFailedPosts,
      },
    });
  } catch (error) {
    console.error('Failed to fetch retryable posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch retryable posts' },
      { status: 500 }
    );
  }
}
