import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import InquiriesClient from './InquiriesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '문의 관리 | imPD Admin',
};

export default async function AdminInquiriesPage() {
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).all();

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    contacted: rows.filter((r) => r.status === 'contacted').length,
    closed: rows.filter((r) => r.status === 'closed').length,
    b2b: rows.filter((r) => r.type === 'b2b').length,
    contact: rows.filter((r) => r.type === 'contact').length,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#16325C]">문의 관리</h1>
        <p className="mt-1 text-sm text-gray-600">
          접수된 B2B/B2G · 일반 문의를 조회하고 상태를 관리합니다.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">전체</div>
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">대기</div>
          <div className="text-xl font-bold text-red-600">{stats.pending}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">연락완료</div>
          <div className="text-xl font-bold text-amber-600">{stats.contacted}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">종료</div>
          <div className="text-xl font-bold text-gray-600">{stats.closed}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">B2B</div>
          <div className="text-xl font-bold text-[#00A1E0]">{stats.b2b}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">일반</div>
          <div className="text-xl font-bold text-gray-900">{stats.contact}</div>
        </div>
      </section>

      <InquiriesClient initialRows={rows.map((r) => {
        let createdAtStr: string | null = null;
        if (r.createdAt instanceof Date) {
          const t = r.createdAt.getTime();
          createdAtStr = Number.isFinite(t) ? r.createdAt.toISOString() : null;
        } else if (typeof r.createdAt === 'string' || typeof r.createdAt === 'number') {
          const d = new Date(r.createdAt);
          createdAtStr = Number.isFinite(d.getTime()) ? d.toISOString() : null;
        }
        return { ...r, createdAt: createdAtStr };
      })} />
    </main>
  );
}
