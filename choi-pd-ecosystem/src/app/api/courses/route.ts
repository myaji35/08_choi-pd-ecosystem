import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'online' | 'offline' | 'b2b' | null;

    // 필터 조건 구성
    const conditions = [eq(courses.published, true)];
    if (type) {
      conditions.push(eq(courses.type, type));
    }

    const result = await db.query.courses.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: (courses, { desc }) => [desc(courses.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
