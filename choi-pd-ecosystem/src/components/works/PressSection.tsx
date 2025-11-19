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
    <section className="border-t py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Newspaper className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">언론 보도</h2>
          <p className="mt-4 text-muted-foreground">
            미디어에 소개된 최범희 PD의 활동
          </p>
        </div>

        {works.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-12 text-center">
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              곧 언론 보도 자료가 업로드될 예정입니다
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
