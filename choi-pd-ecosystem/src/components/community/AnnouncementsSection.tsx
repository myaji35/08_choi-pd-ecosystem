import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Post } from '@/lib/db/schema';

interface AnnouncementsSectionProps {
  posts: Post[];
}

export function AnnouncementsSection({ posts }: AnnouncementsSectionProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      notice: '공지사항',
      review: '수강생 후기',
      media: '미디어 활동',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      notice: '#00A1E0',
      review: '#10b981',
      media: '#8b5cf6',
    };
    return colors[category] || '#00A1E0';
  };

  if (posts.length === 0) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 md:p-16 text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,161,224,0.1)' }}>
              <svg className="w-10 h-10" style={{ color: '#00A1E0' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#16325C' }}>
              첫 번째 소식이 곧 발행됩니다
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              커뮤니티 소식과 공지사항을 준비 중입니다.
              뉴스레터를 구독하면 새 소식을 가장 먼저 받아볼 수 있어요.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold">공지사항 및 소식</h2>
          <p className="text-muted-foreground">
            최신 소식과 공지사항을 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ background: getCategoryColor(post.category) }}
                  >
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
                      : '날짜 없음'}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.content}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
