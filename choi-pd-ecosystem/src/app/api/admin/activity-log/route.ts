import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributorActivityLog, distributors } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/admin/activity-log - 활동 로그 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const distributorId = searchParams.get('distributorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .select({
        log: distributorActivityLog,
        distributor: {
          id: distributors.id,
          name: distributors.name,
          email: distributors.email,
        },
      })
      .from(distributorActivityLog)
      .leftJoin(distributors, eq(distributorActivityLog.distributorId, distributors.id))
      .orderBy(desc(distributorActivityLog.createdAt))
      .limit(limit)
      .offset(offset);

    // 특정 수요자 필터
    if (distributorId) {
      const id = parseInt(distributorId);
      if (!isNaN(id)) {
        query = query.where(eq(distributorActivityLog.distributorId, id)) as any;
      }
    }

    const results = await query.all();

    return NextResponse.json({
      success: true,
      logs: results,
      pagination: {
        limit,
        offset,
        total: results.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/activity-log - 활동 로그 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      distributorId,
      activityType,
      description,
      metadata,
      ipAddress,
      userAgent,
    } = body;

    // 필수 필드 검증
    if (!distributorId || !activityType || !description) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 활동 로그 생성
    const result = await db.insert(distributorActivityLog).values({
      distributorId,
      activityType,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      createdAt: sql`CURRENT_TIMESTAMP`,
    }).returning();

    // 수요자의 lastActivityAt 업데이트
    await db
      .update(distributors)
      .set({ lastActivityAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(distributors.id, distributorId));

    return NextResponse.json({
      success: true,
      log: result[0],
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
