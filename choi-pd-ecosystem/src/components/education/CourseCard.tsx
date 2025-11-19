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
    online: 'bg-blue-100 text-blue-700',
    offline: 'bg-green-100 text-green-700',
    b2b: 'bg-purple-100 text-purple-700',
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden transition-all hover:shadow-lg',
        variant === 'featured' && 'border-2 border-primary'
      )}
    >
      {course.thumbnailUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
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
        </div>
      )}

      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              typeColors[course.type] || 'bg-gray-100 text-gray-700'
            )}
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
          <Button asChild className="w-full">
            <Link href={course.externalLink} target="_blank" rel="noopener noreferrer">
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
