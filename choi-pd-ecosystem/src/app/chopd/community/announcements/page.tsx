export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata = {
  title: '전체 공지사항',
  description: '모든 공지사항과 소식',
};

const PAGE_SIZE = 12;

const categoryLabel: Record<string, string> = {
  notice: '공지사항',
  review: '수강생 후기',
  media: '미디어 활동',
};

const categoryColor: Record<string, string> = {
  notice: '#00A1E0',
  review: '#10b981',
  media: '#8b5cf6',
};

export default async function AnnouncementsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const category = params.category;

  const whereClause = category
    ? sql`${posts.published} = 1 AND ${posts.category} = ${category}`
    : eq(posts.published, true);

  const allRows = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .all();

  const total = allRows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = allRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const categories = Array.from(new Set(allRows.map((r) => r.category).filter(Boolean)));

  return (
    <div className="min-h-screen py-16">
      <div className="container">
        <div className="mb-10">
          <Link
            href="/chopd/community"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#00A1E0]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            커뮤니티로
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-[#16325C]">전체 공지사항</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}건</p>
        </div>

        {/* 카테고리 필터 */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/chopd/community/announcements"
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
                !category
                  ? 'border-[#00A1E0] bg-[#00A1E0] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#00A1E0]'
              }`}
            >
              전체
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/chopd/community/announcements?category=${c}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
                  category === c
                    ? 'border-[#00A1E0] bg-[#00A1E0] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#00A1E0]'
                }`}
              >
                {categoryLabel[c] || c}
              </Link>
            ))}
          </div>
        )}

        {pagedRows.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            공지사항이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pagedRows.map((post) => (
              <Card key={post.id} className="flex flex-col border-gray-200">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ background: categoryColor[post.category] || '#00A1E0' }}
                    >
                      {categoryLabel[post.category] || post.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-4 whitespace-pre-line">
                    {post.content}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <nav className="mt-12 flex justify-center gap-2" aria-label="페이지">
            {currentPage > 1 && (
              <Link
                href={{
                  pathname: '/chopd/community/announcements',
                  query: { ...(category ? { category } : {}), page: currentPage - 1 },
                }}
                className="px-3 py-1.5 border border-gray-300 bg-white text-sm rounded text-gray-700 hover:border-[#00A1E0]"
              >
                이전
              </Link>
            )}
            <span className="flex items-center px-4 text-sm text-gray-700">
              {currentPage} / {pageCount}
            </span>
            {currentPage < pageCount && (
              <Link
                href={{
                  pathname: '/chopd/community/announcements',
                  query: { ...(category ? { category } : {}), page: currentPage + 1 },
                }}
                className="px-3 py-1.5 border border-gray-300 bg-white text-sm rounded text-gray-700 hover:border-[#00A1E0]"
              >
                다음
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
