import { Work } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface PressSectionProps {
  works: Work[];
}

export function PressSection({ works }: PressSectionProps) {
  return (
    <section className="border-t border-gray-200 py-20 bg-white">
      <div className="container">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg" style={{ background: '#10b981' }}>
            <Newspaper className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: '#16325C' }}>언론 보도</h2>
          <p className="mt-4 text-gray-500">
            미디어에 소개된 활동 기록
          </p>
        </div>

        {works.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 md:p-16 text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <Newspaper className="h-10 w-10" style={{ color: '#10b981' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#16325C' }}>
              언론 보도 자료를 준비 중입니다
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              미디어에 소개된 활동과 보도 자료가 곧 업로드됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <Card key={work.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{work.title}</CardTitle>
                  {work.description && (
                    <CardDescription className="line-clamp-2">
                      {work.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      기사 보기
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {works.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              더 많은 보도 보기
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
