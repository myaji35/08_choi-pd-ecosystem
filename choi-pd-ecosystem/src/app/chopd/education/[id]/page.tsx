export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/education/CourseCard';
import { ArrowLeft, Clock, Tag, Users, Building2, GraduationCap } from 'lucide-react';

const typeLabel: Record<string, string> = {
  online: '온라인',
  offline: '오프라인',
  b2b: '기업/기관',
};

const typeIcon: Record<string, typeof Users> = {
  online: GraduationCap,
  offline: Users,
  b2b: Building2,
};

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '무료';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);

  if (isNaN(id)) notFound();

  const course = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.published, true)))
    .get();

  if (!course) notFound();

  const related = await db
    .select()
    .from(courses)
    .where(
      and(eq(courses.published, true), eq(courses.type, course.type), ne(courses.id, course.id))
    )
    .limit(3)
    .all();

  const TypeIcon = typeIcon[course.type] || GraduationCap;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 md:py-20"
        style={{
          background:
            'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="container relative z-10">
          <Link
            href="/chopd/education"
            className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            교육 과정 목록
          </Link>
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeLabel[course.type] || course.type}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                {course.title}
              </h1>
              <p
                className="mt-4 text-lg text-white/90 leading-relaxed whitespace-pre-line"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
              >
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white">
                  <Tag className="h-4 w-4" />
                  {formatCurrency(course.price)}
                </div>
                {course.createdAt && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white">
                    <Clock className="h-4 w-4" />
                    {new Date(course.createdAt).toLocaleDateString('ko-KR')} 개설
                  </div>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {course.externalLink ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-[#16325C] hover:bg-white/90"
                  >
                    <a
                      href={course.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      수강 신청하기
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-[#00A1E0] hover:bg-[#0082B3] text-white">
                    <a href={`/api/checkout/start?courseId=${course.id}`}>결제하고 수강하기</a>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link href="/chopd/education#inquiry">문의하기</Link>
                </Button>
              </div>
            </div>
            {course.thumbnailUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20 bg-black/20">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 커리큘럼/상세 (추후 확장 영역) */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#16325C' }}>
              과정 소개
            </h2>
            <div className="prose prose-gray max-w-none whitespace-pre-line text-gray-700">
              {course.description}
            </div>
          </div>
        </div>
      </section>

      {/* 관련 강의 */}
      {related.length > 0 && (
        <section className="border-t border-gray-200 py-16 bg-[#F3F2F2]">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#16325C' }}>
              같은 유형의 다른 과정
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
