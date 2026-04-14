import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrollments, courses } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/enrollments/me — 로그인 사용자의 수강권 목록 (결제 완료 상태만) */
export async function GET() {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  const rows = await db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, session.userId), eq(enrollments.status, 'paid')))
    .orderBy(desc(enrollments.paidAt))
    .all();

  return NextResponse.json({
    success: true,
    enrollments: rows.map((r) => ({
      id: r.enrollment.id,
      courseId: r.enrollment.courseId,
      courseTitle: r.course?.title ?? null,
      courseThumbnail: r.course?.thumbnailUrl ?? null,
      externalLink: r.course?.externalLink ?? null,
      paidAt: r.enrollment.paidAt,
      provider: r.enrollment.provider,
    })),
  });
}
