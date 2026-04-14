import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/start?courseId=123
 *
 * 외부 VOD 플랫폼 결제 시작 전 경유 지점.
 * - 비로그인 → /login?callbackUrl=... 로 redirect (현재 강의로 돌아오기)
 * - 로그인 → externalLink에 orderId/userId/courseId 쿼리스트링 주입 후 redirect
 *
 * 이후 외부 결제 완료 시 /api/payments/webhook/[provider]가 orderId를 키로 enrollments를 생성/업데이트.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseIdStr = url.searchParams.get('courseId');
  const courseId = courseIdStr ? Number(courseIdStr) : NaN;

  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: 'invalid courseId' }, { status: 400 });
  }

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course) {
    return NextResponse.json({ error: 'course not found' }, { status: 404 });
  }
  if (!course.externalLink) {
    return NextResponse.json({ error: 'this course has no external checkout' }, { status: 400 });
  }

  const isDevMode = process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const session = await getSession();

  if (!session && !isDevMode) {
    const callback = `/api/checkout/start?courseId=${courseId}`;
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callback)}`, req.url));
  }

  const userId = session?.userId ?? 'dev-user';
  const orderId = randomBytes(12).toString('hex');

  // 외부 플랫폼으로 orderId/userId/courseId 주입 (webhook metadata로 다시 돌아옴)
  const target = new URL(course.externalLink);
  target.searchParams.set('orderId', orderId);
  target.searchParams.set('userId', userId);
  target.searchParams.set('courseId', String(courseId));
  target.searchParams.set('returnUrl', new URL('/dashboard/my-courses', req.url).toString());

  return NextResponse.redirect(target.toString(), { status: 302 });
}
