import { Palette, BookOpen, Newspaper } from 'lucide-react';

export function WorksHeroSection() {
  const highlights = [
    {
      icon: BookOpen,
      title: '저서',
      description: '스마트폰 활용과 창업에 관한 실용서',
    },
    {
      icon: Palette,
      title: '모바일 스케치',
      description: '스마트폰으로 그린 감성 작품',
    },
    {
      icon: Newspaper,
      title: '언론 보도',
      description: '미디어에 소개된 활동',
    },
  ];

  return (
    <section className="border-b bg-gradient-to-b from-purple-50 via-blue-50 to-background py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            활동하는 최범희
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            교육자, 저자, 그리고 아티스트로서
            <br />
            다양한 분야에서 활동하며 영감을 나누고 있습니다
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
