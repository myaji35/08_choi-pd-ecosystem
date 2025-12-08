import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { snsAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/pd/sns-accounts/[id] - SNS 계정 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await db
      .select()
      .from(snsAccounts)
      .where(eq(snsAccounts.id, id))
      .get();

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Failed to fetch SNS account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SNS account' },
      { status: 500 }
    );
  }
}

// PUT /api/pd/sns-accounts/[id] - SNS 계정 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const {
      accountName,
      accountId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      isActive,
      metadata,
    } = body;

    // 업데이트 데이터 준비
    const updateData: any = {
      updatedAt: Math.floor(Date.now() / 1000),
    };

    if (accountName !== undefined) updateData.accountName = accountName;
    if (accountId !== undefined) updateData.accountId = accountId;
    if (accessToken !== undefined) updateData.accessToken = accessToken;
    if (refreshToken !== undefined) updateData.refreshToken = refreshToken;
    if (tokenExpiresAt !== undefined)
      updateData.tokenExpiresAt = Math.floor(new Date(tokenExpiresAt).getTime() / 1000);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

    const result = await db
      .update(snsAccounts)
      .set(updateData)
      .where(eq(snsAccounts.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account: result[0],
    });
  } catch (error) {
    console.error('Failed to update SNS account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SNS account' },
      { status: 500 }
    );
  }
}

// DELETE /api/pd/sns-accounts/[id] - SNS 계정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(snsAccounts)
      .where(eq(snsAccounts.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete SNS account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SNS account' },
      { status: 500 }
    );
  }
}
