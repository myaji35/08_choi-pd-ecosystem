import Link from 'next/link';
import { db } from '@/lib/db';
import { enrollments, courses } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '내 강의 | imPD',
  description: '결제하신 강의 모음',
};

export default async function MyCoursesPage() {
  const isDevMode = process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const session = await getSession();

  if (!session && !isDevMode) {
    redirect('/login?callbackUrl=/dashboard/my-courses');
  }

  const userId = session?.userId ?? 'dev-user';

  const rows = await db
    .select({
      e: enrollments,
      c: courses,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, userId), eq(enrollments.status, 'paid')))
    .orderBy(desc(enrollments.paidAt))
    .all();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-[#16325C]">내 강의</h1>
        <p className="mt-1 text-sm text-gray-600">
          결제 완료된 강의가 표시됩니다. 외부 결제 완료 후 5분 이내에 자동 반영됩니다.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm text-gray-600">
            아직 결제하신 강의가 없습니다.
          </p>
          <Link
            href="/chopd/education"
            className="mt-4 inline-block rounded-lg bg-[#00A1E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0082B3]"
          >
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ e, c }) => (
            <li key={e.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              {c?.thumbnailUrl && (
                <img
                  src={c.thumbnailUrl}
                  alt={c.title}
                  className="mb-3 h-32 w-full rounded object-cover"
                />
              )}
              <h2 className="text-base font-semibold text-gray-900">{c?.title ?? `강의 #${e.courseId}`}</h2>
              <p className="mt-1 text-xs text-gray-500">
                결제일: {e.paidAt ? new Date(e.paidAt).toLocaleDateString('ko-KR') : '-'}
              </p>
              {c?.externalLink ? (
                <a
                  href={c.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block w-full rounded-lg bg-[#00A1E0] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#0082B3]"
                >
                  강의 시청하기
                </a>
              ) : (
                <p className="mt-3 text-xs text-gray-400">시청 링크 준비 중</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
