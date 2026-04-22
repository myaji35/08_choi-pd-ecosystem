import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { distributors, enrollments } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '대시보드 | imPD',
  description: '내 활동 요약',
};

export default async function DashboardPage() {
  const isDevMode =
    process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const session = await getSession();

  if (!session && !isDevMode) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const userId = session?.userId ?? 'dev-user';
  const email = session?.email ?? 'dev@impd.local';

  // distributor 상태 조회 (email 기준 — 현재 스키마엔 userId 컬럼 없음)
  const distributor = await db
    .select()
    .from(distributors)
    .where(eq(distributors.email, email))
    .get();

  // 수강권 카운트
  const paidEnrollments = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.status, 'paid')))
    .orderBy(desc(enrollments.paidAt))
    .all();

  // distributor 상태 분기
  if (distributor) {
    switch (distributor.status) {
      case 'pending':
        redirect('/dashboard/pending');
      case 'rejected':
        return <RejectedView name={distributor.name} />;
      case 'suspended':
        return <SuspendedView name={distributor.name} />;
      case 'approved':
      case 'active':
        return (
          <DistributorDashboard
            name={distributor.name}
            plan={distributor.subscriptionPlan}
            email={email}
          />
        );
    }
  }

  // 일반 사용자 (수강권 보유 또는 신규)
  return (
    <MemberDashboard
      email={email}
      courseCount={paidEnrollments.length}
    />
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </section>
  );
}

function MemberDashboard({ email, courseCount }: { email: string; courseCount: number }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-[#16325C]">안녕하세요, {email}</h1>
        <p className="mt-1 text-sm text-gray-600">내 활동 요약과 주요 메뉴입니다.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-gray-600">내 강의</h2>
          <p className="mt-2 text-3xl font-bold text-[#00A1E0]">{courseCount}</p>
          <Link href="/dashboard/my-courses" className="mt-3 inline-block text-xs font-semibold text-[#00A1E0] hover:underline">
            강의 목록 →
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-600">강의 둘러보기</h2>
          <p className="mt-2 text-sm text-gray-500">새 강의를 찾아보세요.</p>
          <Link href="/chopd/education" className="mt-3 inline-block rounded-lg bg-[#00A1E0] px-3 py-2 text-xs font-semibold text-white">
            강의 탐색
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-600">파트너 등록</h2>
          <p className="mt-2 text-sm text-gray-500">imPD 유통 파트너로 참여하시겠어요?</p>
          <Link href="/dashboard/apply" className="mt-3 inline-block rounded-lg border border-[#16325C] px-3 py-2 text-xs font-semibold text-[#16325C] hover:bg-[#F3F2F2]">
            파트너 신청
          </Link>
        </Card>
      </div>
    </main>
  );
}

function DistributorDashboard({
  name,
  plan,
  email,
}: {
  name: string;
  plan: string | null;
  email: string;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#16325C]">{name}님</h1>
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ background: '#00A1E0' }}
          >
            파트너
          </span>
          {plan && (
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
              style={{
                background:
                  plan === 'enterprise' ? '#8b5cf6' : plan === 'premium' ? '#F57C00' : '#616161',
              }}
            >
              {plan.toUpperCase()}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">{email}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-gray-600">리소스 라이브러리</h2>
          <p className="mt-2 text-sm text-gray-500">
            {plan ? `${plan.toUpperCase()} 플랜 리소스 이용 가능` : '무료 리소스 이용 가능'}
          </p>
          <Link
            href="/dashboard/resources"
            className="mt-3 inline-block rounded-lg bg-[#00A1E0] px-3 py-2 text-xs font-semibold text-white"
          >
            리소스 보기
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-600">플랜 · 결제</h2>
          <p className="mt-2 text-sm text-gray-500">현재 플랜과 결제 내역을 확인하세요.</p>
          <Link
            href="/dashboard/billing"
            className="mt-3 inline-block rounded-lg border border-[#16325C] px-3 py-2 text-xs font-semibold text-[#16325C] hover:bg-[#F3F2F2]"
          >
            플랜 관리
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-600">활동 로그</h2>
          <p className="mt-2 text-sm text-gray-500">다운로드 · 접근 기록을 확인하세요.</p>
          <Link
            href="/dashboard/activity"
            className="mt-3 inline-block text-xs font-semibold text-[#00A1E0] hover:underline"
          >
            활동 보기 →
          </Link>
        </Card>
      </div>
    </main>
  );
}

function RejectedView({ name }: { name: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-red-600">{name}님, 파트너 신청이 거절되었습니다</h1>
      <p className="mt-4 text-sm text-gray-600">
        자세한 사유는 등록하신 이메일로 안내드렸습니다. 추가 문의는 contact@impd.co.kr 로 주세요.
      </p>
      <Link href="/chopd" className="mt-6 inline-block rounded-lg bg-[#00A1E0] px-4 py-2 text-sm font-semibold text-white">
        홈으로
      </Link>
    </main>
  );
}

function SuspendedView({ name }: { name: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-amber-600">{name}님 계정이 일시 정지되었습니다</h1>
      <p className="mt-4 text-sm text-gray-600">
        이용 재개를 원하시면 contact@impd.co.kr 로 연락 주세요.
      </p>
    </main>
  );
}
