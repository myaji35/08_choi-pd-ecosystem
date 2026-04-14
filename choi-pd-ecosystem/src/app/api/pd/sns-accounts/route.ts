import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsAccounts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';
import { encryptToken, maskToken } from '@/lib/crypto/token-cipher';

/** 토큰 필드를 마스킹한 안전 버전으로 변환 (목록/조회 응답용) */
function safeAccount<T extends { accessToken: string; refreshToken: string | null }>(a: T) {
  return { ...a, accessToken: maskToken(a.accessToken), refreshToken: maskToken(a.refreshToken) };
}

// GET /api/pd/sns-accounts - SNS 계정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let results;

    if (activeOnly) {
      results = await db
        .select()
        .from(snsAccounts)
        .where(and(
          tenantFilter(snsAccounts.tenantId, tenantId),
          eq(snsAccounts.isActive, true)
        ))
        .orderBy(desc(snsAccounts.createdAt))
        .all();
    } else {
      results = await db
        .select()
        .from(snsAccounts)
        .where(tenantFilter(snsAccounts.tenantId, tenantId))
        .orderBy(desc(snsAccounts.createdAt))
        .all();
    }

    // Filter by platform if specified
    if (platform && platform !== 'all') {
      results = results.filter(account => account.platform === platform);
    }

    return NextResponse.json({
      success: true,
      accounts: results.map(safeAccount),
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
    const tenantId = getTenantIdFromRequest(request);
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

    // SNS 계정 생성 — 토큰은 AES-256-GCM 암호화 후 저장 (개인정보보호법 대응)
    const result = await db.insert(snsAccounts).values({
      tenantId,
      platform: platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
      accountName,
      accountId: accountId || null,
      accessToken: encryptToken(accessToken),
      refreshToken: refreshToken ? encryptToken(refreshToken) : null,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
      isActive: true,
      lastSyncedAt: null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }).returning();

    return NextResponse.json({
      success: true,
      account: safeAccount(result[0]),
    });
  } catch (error) {
    console.error('Failed to create SNS account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SNS account' },
      { status: 500 }
    );
  }
}
