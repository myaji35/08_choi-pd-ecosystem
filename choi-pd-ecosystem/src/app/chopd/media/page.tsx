export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getContactInfo } from '@/lib/db/queries/contactInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart2, Radio, ArrowRight } from 'lucide-react';

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

  const contactInfo = await getContactInfo();
  const contactEmail = contactInfo.email ?? 'contact@impd.kr';

  // imPD 플랫폼 미디어 기능 소개
  const features = [
    {
      icon: Zap,
      title: 'AI 콘텐츠 생성',
      description: 'AI가 초안을 작성하고, 사용자가 편집·발행하는 반자동 콘텐츠 파이프라인',
    },
    {
      icon: Radio,
      title: '멀티채널 발행',
      description: '블로그, SNS, 뉴스레터를 한 곳에서 예약 발행하고 통합 관리',
    },
    {
      icon: BarChart2,
      title: '성과 분석',
      description: '채널별 도달 수·반응률·전환율을 실시간 대시보드로 확인',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
              <Radio className="mr-2 h-4 w-4" />
              미디어 & 콘텐츠
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              미디어 & 콘텐츠 허브
            </h1>
            <p className="mt-4 text-xl font-semibold text-white/80">
              콘텐츠 제작부터 멀티채널 발행까지
            </p>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              imPD 플랫폼으로 콘텐츠를 만들고, 여러 채널에 한 번에 배포하며
              <br />
              성과를 실시간으로 분석하세요.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-[#00A1E0] text-white hover:bg-[#0088be]">
                <Link href="/chopd/community">
                  뉴스레터 구독
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-200 py-16" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold" style={{ color: '#16325C' }}>imPD 미디어 기능</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 p-5 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: '#00A1E0' }}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#16325C' }}>{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold" style={{ color: '#16325C' }}>최신 콘텐츠</h2>
          {mediaActivities.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                등록된 미디어 콘텐츠가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {mediaActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-gray-200 bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: '#00A1E0' }}>
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold" style={{ color: '#16325C' }}>{activity.title}</h3>
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
      <section className="border-t border-gray-200 py-20" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold" style={{ color: '#16325C' }}>콘텐츠 협업 문의</h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              미디어 협업, 콘텐츠 제작 의뢰, 플랫폼 도입 등
              <br />
              무엇이든 편하게 문의해주세요.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ background: '#00A1E0' }}
              >
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                이메일로 문의하기
              </a>
              <Button asChild variant="outline" size="lg" className="border-2" style={{ borderColor: '#16325C', color: '#16325C' }}>
                <Link href="/chopd/community">커뮤니티 바로가기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
