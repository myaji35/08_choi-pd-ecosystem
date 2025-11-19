import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { CourseCard } from '@/components/education/CourseCard';
import { CourseFilter } from '@/components/education/CourseFilter';
import { GraduationCap, Users, Building2 } from 'lucide-react';

interface EducationPageProps {
  searchParams: Promise<{ type?: 'online' | 'offline' | 'b2b' }>;
}

export default async function EducationPage({ searchParams }: EducationPageProps) {
  const { type } = await searchParams;

  // 필터 조건
  const conditions = [eq(courses.published, true)];
  if (type) {
    conditions.push(eq(courses.type, type));
  }

  const allCourses = await db.query.courses.findMany({
    where: conditions.length > 1 ? and(...conditions) : conditions[0],
    orderBy: (courses, { desc }) => [desc(courses.createdAt)],
  });

  const features = [
    {
      icon: GraduationCap,
      title: '체계적인 커리큘럼',
      description: '기초부터 실전까지 단계별 학습',
    },
    {
      icon: Users,
      title: '소규모 클래스',
      description: '개인별 맞춤 지도',
    },
    {
      icon: Building2,
      title: 'B2B/B2G 맞춤',
      description: '기업 및 기관 교육 프로그램',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              최PD의 스마트폰 연구소
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              5060 베이비부머와 소상공인을 위한
              <br />
              스마트폰 창업 교육 과정
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">교육 과정</h2>
              <p className="mt-2 text-muted-foreground">
                {type
                  ? `${type === 'online' ? '온라인' : type === 'offline' ? '오프라인' : '기업/기관'} 과정`
                  : '전체 과정'}{' '}
                ({allCourses.length}개)
              </p>
            </div>
            <CourseFilter />
          </div>

          {allCourses.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <p className="text-muted-foreground">
                {type
                  ? '해당 유형의 교육 과정이 없습니다.'
                  : '등록된 교육 과정이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry CTA */}
      <section id="inquiry" className="border-t bg-muted/40 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">문의하기</h2>
            <p className="mt-4 text-muted-foreground">
              교육 과정에 대해 궁금하신 점이 있으신가요?
              <br />
              언제든지 문의해주세요. 빠른 시일 내에 답변드리겠습니다.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="mailto:contact@choipd.com"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                이메일로 문의하기
              </a>
              <a
                href="tel:010-XXXX-XXXX"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                전화로 문의하기
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
