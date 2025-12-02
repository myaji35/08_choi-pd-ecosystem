import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Users,
  TrendingUp,
  Globe,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default function ImPDHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-blue-600 text-white hover:bg-blue-700" variant="default">
              <Sparkles className="mr-1 h-3 w-3" />
              차세대 브랜드 플랫폼
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                imPD
              </span>
            </h1>
            <p className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
              I'm PD - Interactive Management Platform for Distribution
            </p>
            <p className="mb-8 text-lg text-gray-600 md:text-xl">
              교육·미디어·작품 브랜드 생태계를 당신의 비즈니스로.
              <br />
              검증된 콘텐츠와 시스템을 분양받아 즉시 시작하세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/admin/distributors/new">
                  <Rocket className="mr-2 h-5 w-5" />
                  지금 신청하기
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  자세히 알아보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Demo Link */}
            <div className="mt-8 text-sm text-gray-600">
              <span>imPD 브랜드 데모를 보시겠어요? </span>
              <a
                href="http://chopd.localhost:3011"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                chopd.localhost:3011 방문하기 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">12+</div>
              <div className="text-sm text-gray-600">활성 파트너</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-600">50+</div>
              <div className="text-sm text-gray-600">제공 콘텐츠</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-pink-600">24/7</div>
              <div className="text-sm text-gray-600">기술 지원</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-indigo-600">95%</div>
              <div className="text-sm text-gray-600">만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              왜 imPD인가요?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              검증된 브랜드 생태계를 통째로 분양받아 당신만의 비즈니스를 시작하세요
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-blue-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>즉시 시작 가능</CardTitle>
                <CardDescription>
                  완성된 웹사이트, 콘텐츠, 시스템을 분양받아 설정만으로 오픈
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>3개 브랜드 생태계</CardTitle>
                <CardDescription>
                  교육·미디어·작품을 아우르는 통합 브랜드 허브 제공
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>검증된 타겟층</CardTitle>
                <CardDescription>
                  베이비부머·소상공인·교육기관 대상 최적화된 콘텐츠
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>완전한 기술 지원</CardTitle>
                <CardDescription>
                  호스팅, 유지보수, 업데이트 모두 포함된 올인원 패키지
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>실시간 분석</CardTitle>
                <CardDescription>
                  방문자·수익·활동 통계를 대시보드에서 실시간 확인
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>지속적 업데이트</CardTitle>
                <CardDescription>
                  신규 콘텐츠, 기능 추가가 자동으로 반영되는 살아있는 플랫폼
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Included Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl">
              패키지에 포함된 것들
            </h2>
            <div className="space-y-4">
              {[
                '완성된 반응형 웹사이트 (모바일·태블릿·PC 최적화)',
                '교육 과정 관리 시스템 (온라인·오프라인·B2B)',
                '미디어 콘텐츠 CMS (환경저널 아카이브)',
                '작품 갤러리 & 언론 보도 관리',
                '뉴스레터 구독 & 리드 관리',
                'SNS 통합 자동 포스팅',
                '관리자 대시보드 (분석·통계)',
                '결제 연동 (Stripe/TossPayments)',
                'SEO 최적화 & 성능 튜닝',
                '지속적인 기술 지원 & 업데이트'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              선택하세요
            </h2>
            <p className="text-gray-600">
              당신의 비즈니스 규모에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Basic Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>개인 사업자</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-gray-600">/월</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">기본 웹사이트</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">콘텐츠 관리 시스템</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">월 1회 업데이트</span>
                </div>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href="/admin/distributors/new">신청하기</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-4 border-blue-600 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600">추천</Badge>
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>중소기업</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-gray-600">/월</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic 모든 기능</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">SNS 자동 포스팅</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">실시간 분석 대시보드</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">주 1회 업데이트</span>
                </div>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/admin/distributors/new">신청하기</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>대기업/기관</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">문의</span>
                  <span className="text-gray-600">/월</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Premium 모든 기능</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">맞춤 개발 지원</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">전담 기술 매니저</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">실시간 업데이트</span>
                </div>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href="/admin/distributors/new">신청하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            당신의 브랜드 비즈니스를 시작할 준비가 되셨나요?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            지금 신청하고 검증된 브랜드 생태계를 분양받으세요
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/admin/distributors/new">
                <Rocket className="mr-2 h-5 w-5" />
                무료 상담 신청
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="http://chopd.localhost:3011">
                데모 체험하기
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">imPD</h3>
              <p className="text-sm text-gray-600">
                Interactive Management Platform for Distribution
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-blue-600">기능</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600">요금제</Link></li>
                <li><a href="http://chopd.localhost:3011" className="hover:text-blue-600">데모</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">관리</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/admin/dashboard" className="hover:text-blue-600">분양 관리</Link></li>
                <li><Link href="/pd/dashboard" className="hover:text-blue-600">PD 대시보드</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">문의</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/admin/distributors/new" className="hover:text-blue-600">파트너 신청</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            © 2024 imPD. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
