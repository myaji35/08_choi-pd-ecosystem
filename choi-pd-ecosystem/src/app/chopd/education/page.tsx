export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { CourseCard } from '@/components/education/CourseCard';
import { CourseFilter } from '@/components/education/CourseFilter';
import { getContactInfo } from '@/lib/db/queries/contactInfo';
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

  const contactInfo = await getContactInfo();

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
      <section className="relative overflow-hidden py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0E2340 35%, #16325C 60%, #0080B8 100%)' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
              <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              교육 프로그램
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
              AI 시대, 실전 교육으로
              <br />시작하세요
            </h1>
            <p className="mt-5 text-lg text-white leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
              1인 사업자와 소상공인을 위한 체계적인 교육 과정.
              <br className="hidden sm:block" />
              기초부터 실전까지, AI 도구 활용법을 배워보세요.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-200 py-12" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: '#00A1E0' }}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#16325C' }}>{feature.title}</h3>
                  <p className="text-sm text-gray-500">
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
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 md:p-16 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,161,224,0.1)' }}>
                <svg className="w-10 h-10" style={{ color: '#00A1E0' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#16325C' }}>
                {type ? '해당 유형의 교육 과정을 준비 중입니다' : '새로운 교육 과정이 곧 시작됩니다'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                현재 교육 과정을 준비 중입니다. 아래 문의하기를 통해 먼저 관심을 등록해주세요.
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
      <section id="inquiry" className="border-t border-gray-200 py-16" style={{ background: '#F3F2F2' }}>
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,161,224,0.1)' }}>
              <svg className="w-7 h-7" style={{ color: '#00A1E0' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#16325C' }}>문의하기</h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              교육 과정에 대해 궁금하신 점이 있으신가요?
              <br />
              언제든지 문의해주세요. 빠른 시일 내에 답변드리겠습니다.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="mailto:contact@choipd.com"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ background: '#00A1E0' }}
              >
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                이메일로 문의하기
              </a>
              {contactInfo.phone ? (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5"
                  style={{ borderColor: '#16325C', color: '#16325C' }}
                >
                  <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  전화로 문의하기
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-sm font-semibold opacity-50 cursor-not-allowed"
                  style={{ borderColor: '#16325C', color: '#16325C' }}
                >
                  <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  전화번호 미등록
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
