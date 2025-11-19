import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const getCategoryVariant = (category: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      notice: 'default',
      review: 'secondary',
      media: 'outline',
    };
    return variants[category] || 'default';
  };

  if (posts.length === 0) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-muted-foreground">아직 등록된 게시물이 없습니다.</p>
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
                  <Badge variant={getCategoryVariant(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {post.createdAt instanceof Date
                      ? post.createdAt.toISOString().split('T')[0].replace(/-/g, '.')
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
