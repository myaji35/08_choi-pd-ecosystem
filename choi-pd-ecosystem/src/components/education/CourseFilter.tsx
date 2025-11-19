'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function CourseFilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const filters = [
    { label: '전체', value: null },
    { label: '온라인', value: 'online' },
    { label: '오프라인', value: 'offline' },
    { label: '기업/기관', value: 'b2b' },
  ];

  const handleFilter = (value: string | null) => {
    if (value) {
      router.push(`/education?type=${value}`);
    } else {
      router.push('/education');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.label}
          variant={currentType === filter.value ? 'default' : 'outline'}
          onClick={() => handleFilter(filter.value)}
          className="min-w-[100px]"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

export function CourseFilter() {
  return (
    <Suspense fallback={<div className="h-10 w-full animate-pulse rounded bg-muted" />}>
      <CourseFilterContent />
    </Suspense>
  );
}
