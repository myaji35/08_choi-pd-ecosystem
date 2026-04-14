import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/lib/db/schema';
import { Clock, Users, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'featured';
}

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const typeLabels: Record<string, string> = {
    online: '온라인',
    offline: '오프라인',
    b2b: '기업/기관',
  };

  const typeColors: Record<string, string> = {
    online: '#00A1E0',
    offline: '#10b981',
    b2b: '#8b5cf6',
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden transition-all hover:shadow-lg',
        variant === 'featured' && 'border-2 border-primary'
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <>
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            {variant === 'featured' && (
              <div className="absolute right-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                추천
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16325C 0%, #00A1E0 100%)' }}>
            <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: typeColors[course.type] || '#6b7280' }}
          >
            {typeLabels[course.type] || course.type}
          </span>
          {course.price !== null && (
            <span className="text-xl font-bold text-primary">
              {course.price.toLocaleString()}원
            </span>
          )}
          {course.price === null && (
            <span className="text-sm font-medium text-muted-foreground">
              견적 문의
            </span>
          )}
        </div>

        <CardTitle className="line-clamp-2 text-xl">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>8주 과정</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>소규모 클래스</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {course.externalLink ? (
          // /api/checkout/start 경유: 로그인 상태 확인 + orderId/userId/courseId 주입 후 외부 리다이렉트
          // webhook이 orderId를 키로 enrollments 생성 → /dashboard/my-courses 에서 수강권 노출
          <Button asChild className="w-full">
            <Link href={`/api/checkout/start?courseId=${course.id}`} rel="noopener noreferrer">
              수강 신청하기
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link href="/education#inquiry">문의하기</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
