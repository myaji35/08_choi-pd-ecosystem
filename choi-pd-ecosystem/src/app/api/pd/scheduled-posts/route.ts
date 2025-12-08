import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsScheduledPosts, snsAccounts } from '@/lib/db/schema';
import { eq, desc, gte } from 'drizzle-orm';

// GET /api/pd/scheduled-posts - 예약 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const upcomingOnly = searchParams.get('upcomingOnly') === 'true';

    // Join with sns_accounts to get account details
    const results = await db
      .select({
        post: snsScheduledPosts,
        account: snsAccounts,
      })
      .from(snsScheduledPosts)
      .leftJoin(snsAccounts, eq(snsScheduledPosts.accountId, snsAccounts.id))
      .orderBy(desc(snsScheduledPosts.scheduledAt))
      .all();

    let filtered = results;

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.post.status === status);
    }

    // Filter by platform
    if (platform && platform !== 'all') {
      filtered = filtered.filter(r => r.post.platform === platform);
    }

    // Filter upcoming only
    if (upcomingOnly) {
      const now = Math.floor(Date.now() / 1000);
      filtered = filtered.filter(r =>
        r.post.scheduledAt && r.post.scheduledAt > now && r.post.status === 'pending'
      );
    }

    return NextResponse.json({
      success: true,
      posts: filtered.map(r => ({
        ...r.post,
        account: r.account,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch scheduled posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  }
}

// POST /api/pd/scheduled-posts - 예약 포스트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contentType,
      contentId,
      platform,
      accountId,
      message,
      imageUrl,
      link,
      scheduledAt,
    } = body;

    // 필수 필드 검증
    if (!contentType || !contentId || !platform || !accountId || !message || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 예약 포스트 생성
    const result = await db.insert(snsScheduledPosts).values({
      contentType,
      contentId,
      platform,
      accountId,
      message,
      imageUrl: imageUrl || null,
      link: link || null,
      scheduledAt: Math.floor(new Date(scheduledAt).getTime() / 1000),
      status: 'pending',
      publishedAt: null,
      externalPostId: null,
      error: null,
      retryCount: 0,
    }).returning();

    return NextResponse.json({
      success: true,
      post: result[0],
    });
  } catch (error) {
    console.error('Failed to create scheduled post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create scheduled post' },
      { status: 500 }
    );
  }
}
