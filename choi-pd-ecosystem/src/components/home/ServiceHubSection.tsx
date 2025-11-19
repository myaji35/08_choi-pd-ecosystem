import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, Newspaper, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function ServiceHubSection() {
  const services = [
    {
      icon: GraduationCap,
      title: 'EDUCATION',
      description: '스마트폰 창업 교육 과정',
      details: '5060 베이비부머를 위한 맞춤형 스마트폰 창업 교육',
      href: '/education',
    },
    {
      icon: Newspaper,
      title: 'MEDIA',
      description: '한국환경저널 발행인',
      details: '대한민국 최고의 환경 파수꾼',
      href: '/media',
    },
    {
      icon: BookOpen,
      title: 'WORKS',
      description: '저서 및 작품 활동',
      details: '저자이자 모바일 스케치 아티스트',
      href: '/works',
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">다양한 분야에서 활동하는 최범희</h2>
          <p className="text-muted-foreground">교육, 미디어, 저작 활동을 통해 새로운 가치를 창출합니다</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service) => (
            <Link key={service.title} href={service.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {service.description}
                  </CardDescription>
                  <p className="mt-2 text-sm text-muted-foreground">{service.details}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
