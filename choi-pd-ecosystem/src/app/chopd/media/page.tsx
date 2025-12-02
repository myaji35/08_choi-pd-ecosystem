import Link from 'next/link';
import { db } from '@/lib/db';
import { settings, posts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Award, ArrowRight } from 'lucide-react';

export const revalidate = 60; // ISR: 1분마다 재생성

export default async function MediaPage() {
  // 미디어 활동 게시물 가져오기 (실제 데이터베이스에서)
  const mediaActivities = await db.query.posts.findMany({
    where: and(
      eq(posts.category, 'media'),
      eq(posts.published, true)
    ),
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    limit: 3,
  });

  // 기본 특징 데이터 (정적 콘텐츠로 유지)
  const features = [
    {
      icon: Leaf,
      title: '환경 전문 언론',
      description: '대한민국 최고의 환경 파수꾼으로서 환경 이슈를 심층 보도합니다',
    },
    {
      icon: Users,
      title: '100인의 전문가',
      description: '환경, 과학, 정책 등 다양한 분야의 전문가 네트워크',
    },
    {
      icon: Award,
      title: '신뢰할 수 있는 정보',
      description: '정확하고 객관적인 환경 뉴스와 분석을 제공합니다',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-green-50 to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-green-900 sm:text-5xl">
              한국환경저널
            </h1>
            <p className="mt-4 text-xl font-semibold text-green-700">
              대한민국 최고의 환경 파수꾼
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              환경 문제에 대한 심층 보도와 전문가 네트워크를 통해
              <br />
              더 나은 미래를 만들어가는 언론 매체입니다
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/media/greeting">
                  발행인 인사말
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">한국환경저널의 특징</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="border-y bg-muted/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold">창간 배경</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-muted-foreground">
                한국환경저널은 환경 문제의 심각성이 날로 증가하는 현대 사회에서,
                정확하고 신뢰할 수 있는 환경 정보를 제공하기 위해 창간되었습니다.
              </p>
              <p className="mt-4 text-muted-foreground">
                기후변화, 생태계 파괴, 환경 오염 등 우리가 직면한 환경 문제들은
                더 이상 미룰 수 없는 시급한 과제입니다. 한국환경저널은 이러한
                문제들을 전문적으로 다루며, 해결 방안을 모색하는 플랫폼으로서의
                역할을 수행하고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">주요 활동</h2>
          {mediaActivities.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <p className="text-muted-foreground">
                등록된 미디어 활동이 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {mediaActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="rounded-lg border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{activity.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{activity.content}</p>
                  {activity.createdAt instanceof Date && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {activity.createdAt.toISOString().split('T')[0].replace(/-/g, '.')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-b from-background to-green-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">함께 만드는 지속 가능한 미래</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              한국환경저널과 함께 환경 문제에 관심을 가지고
              <br />
              더 나은 미래를 만들어가세요
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href="/media/greeting">발행인 인사말 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
