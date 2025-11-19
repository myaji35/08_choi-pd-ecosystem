import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/lib/db/schema';

interface LatestCoursesSectionProps {
  courses: Course[];
}

export function LatestCoursesSection({ courses }: LatestCoursesSectionProps) {
  const typeLabels: Record<string, string> = {
    online: '온라인',
    offline: '오프라인',
    b2b: '기업/기관',
  };

  return (
    <section className="bg-muted/40 py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">최신 교육 과정</h2>
          <p className="text-muted-foreground">5060 세대를 위한 맞춤형 스마트폰 창업 교육</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              {course.thumbnailUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">{typeLabels[course.type]}</Badge>
                  {course.price && course.price > 0 && (
                    <span className="font-semibold">{course.price.toLocaleString()}원</span>
                  )}
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/education#course-${course.id}`}>자세히 보기</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-center text-muted-foreground">등록된 교육 과정이 없습니다.</p>
        )}
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/education">모든 교육 과정 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
