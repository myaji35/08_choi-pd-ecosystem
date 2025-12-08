import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsAccounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/pd/sns-accounts - SNS 계정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let results;

    if (activeOnly) {
      results = await db
        .select()
        .from(snsAccounts)
        .where(eq(snsAccounts.isActive, true))
        .orderBy(desc(snsAccounts.createdAt))
        .all();
    } else {
      results = await db
        .select()
        .from(snsAccounts)
        .orderBy(desc(snsAccounts.createdAt))
        .all();
    }

    // Filter by platform if specified
    if (platform && platform !== 'all') {
      results = results.filter(account => account.platform === platform);
    }

    return NextResponse.json({
      success: true,
      accounts: results,
    });
  } catch (error) {
    console.error('Failed to fetch SNS accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SNS accounts' },
      { status: 500 }
    );
  }
}

// POST /api/pd/sns-accounts - SNS 계정 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platform,
      accountName,
      accountId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      metadata,
    } = body;

    // 필수 필드 검증
    if (!platform || !accountName || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // SNS 계정 생성
    const result = await db.insert(snsAccounts).values({
      platform,
      accountName,
      accountId: accountId || null,
      accessToken,
      refreshToken: refreshToken || null,
      tokenExpiresAt: tokenExpiresAt ? Math.floor(new Date(tokenExpiresAt).getTime() / 1000) : null,
      isActive: true,
      lastSyncedAt: null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }).returning();

    return NextResponse.json({
      success: true,
      account: result[0],
    });
  } catch (error) {
    console.error('Failed to create SNS account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SNS account' },
      { status: 500 }
    );
  }
}
