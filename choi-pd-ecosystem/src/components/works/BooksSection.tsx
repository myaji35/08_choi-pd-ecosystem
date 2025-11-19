import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function BooksSection() {
  const books = [
    {
      title: '스마트폰으로 시작하는 1인 창업',
      description: '5060 세대를 위한 스마트폰 활용 창업 가이드북. 실전 노하우와 성공 사례를 담았습니다.',
      year: '2023',
      publisher: '한국환경저널',
      coverImage: '/images/books/startup-guide.jpg',
      link: '#',
    },
    {
      title: '모바일 마케팅 실전 전략',
      description: '소상공인과 중소기업을 위한 모바일 마케팅 완벽 가이드. SNS부터 블로그까지 모든 것을 다룹니다.',
      year: '2022',
      publisher: '한국환경저널',
      coverImage: '/images/books/mobile-marketing.jpg',
      link: '#',
    },
  ];

  return (
    <section className="border-b py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">저서</h2>
          <p className="mt-4 text-muted-foreground">
            실용적인 지식과 경험을 담은 책들
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {books.map((book) => (
            <Card key={book.title} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-64 w-full bg-muted md:h-auto md:w-48">
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{book.title}</CardTitle>
                    <CardDescription>
                      {book.publisher} · {book.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{book.description}</p>
                    <div className="mt-6">
                      <Button variant="outline" asChild>
                        <a href={book.link} target="_blank" rel="noopener noreferrer">
                          자세히 보기
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            더 많은 저서가 준비 중입니다
          </p>
        </div>
      </div>
    </section>
  );
}
