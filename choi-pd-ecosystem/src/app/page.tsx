import Link from 'next/link';
import {
  User,
  FolderOpen,
  ShoppingBag,
  FileEdit,
  MessageCircle,
  Star,
  Calendar,
  ArrowRight,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';

const features = [
  { icon: User, title: 'Profile', desc: '첫인상을 결정짓는 감각적인 자기소개', wide: false },
  { icon: FolderOpen, title: 'Portfolio', desc: '나의 결과물을 갤러리 형태로 전시', wide: false },
  { icon: ShoppingBag, title: 'Service/Product', desc: '서비스 상세 설명부터 결제 연결까지 한 번에 관리하세요', wide: true },
  { icon: FileEdit, title: 'Blog', desc: '전문성을 보여주는 뉴스레터 및 인사이트', wide: false },
  { icon: MessageCircle, title: 'Inquiry Form', desc: '맞춤형 폼으로 잠재 고객 문의 수집', wide: false },
  { icon: Star, title: 'Review', desc: '신뢰를 더하는 고객들의 생생한 후기', wide: false },
  { icon: Calendar, title: 'Booking', desc: '일정 예약과 상담 스케줄 자동화', wide: false },
];

const showcaseUsers = [
  { name: '최범희 PD', role: '스마트폰 창업 전문가', color: 'from-[#00658e] to-[#00A1E0]', url: '/p/chopd' },
  { name: '이서연', role: '콘텐츠 마케터', color: 'from-purple-400 to-pink-400', url: '#' },
  { name: '최건우', role: '웨딩 사진 작가', color: 'from-amber-400 to-orange-400', url: '#' },
];

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    desc: '시작하는 프리랜서를 위한 필수 기능',
    features: [
      { text: '프로필 모듈', included: true },
      { text: '추가 모듈 2개 선택', included: true },
      { text: '커스텀 테마', included: false },
    ],
    cta: '시작하기',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₩9,900',
    period: '/mo',
    desc: '본격적인 비즈니스 확장을 위한 패키지',
    features: [
      { text: '프로필 모듈', included: true },
      { text: '추가 모듈 5개 선택', included: true },
      { text: '커스텀 테마 & 컬러', included: true },
      { text: '광고 제거', included: true },
    ],
    cta: '프리미엄 시작',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₩29,900',
    period: '/mo',
    desc: '전문 기업 및 팀을 위한 통합 솔루션',
    features: [
      { text: '모든 모듈 무제한', included: true },
      { text: '커스텀 도메인 연결', included: true },
      { text: '정밀 분석 대시보드', included: true },
      { text: '우선 기술 지원', included: true },
    ],
    cta: '문의하기',
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f9] font-sans text-gray-900 antialiased">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">imPD</Link>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-gray-600 font-medium hover:text-[#00A1E0] transition-colors">Features</a>
            <a href="#showcase" className="text-gray-600 font-medium hover:text-[#00A1E0] transition-colors">Showcase</a>
            <a href="#pricing" className="text-gray-600 font-medium hover:text-[#00A1E0] transition-colors">Pricing</a>
          </div>
          <Link
            href="/login"
            className="bg-gradient-to-r from-[#00658e] to-[#00A1E0] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:scale-95 transition-transform duration-200"
          >
            Start Free
          </Link>
        </div>
      </nav>

      <main className="pt-24 mesh-gradient-bg">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative overflow-visible">
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                나만의 비즈니스<br />페이지를 <span className="text-[#00A1E0]">5분 만에</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-lg">
                프리랜서·개인사업자를 위한 올인원 비즈니스 허브. 흩어져 있는 당신의 가치를 하나의 페이지로 큐레이션 하세요.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#00658e] to-[#00A1E0] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform text-center"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/chopd"
                className="bg-gray-200 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-300 transition-colors text-center"
              >
                데모 보기
              </Link>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Check className="w-5 h-5 text-green-500" />
              <span>카드 등록 없이 14일간 모든 기능 체험</span>
            </div>
          </div>

          {/* Hero Right - Mockup with Floating Elements */}
          <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-10 bg-[#00A1E0]/20 rounded-full blur-3xl animate-pulse-slow" />

            {/* Floating Card 1: Analytics */}
            <div className="absolute -top-12 -left-12 z-20 glass-card p-4 rounded-xl animate-float-delayed hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-[#00658e]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Weekly Views</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+1,284</div>
              <div className="w-32 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#00658e] h-full w-2/3" />
              </div>
            </div>

            {/* Floating Card 2: Profile Badge */}
            <div className="absolute -bottom-10 -right-4 z-20 glass-card p-3 rounded-full animate-float hidden lg:flex items-center gap-3 pr-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00658e] to-[#00A1E0] flex items-center justify-center text-white font-bold text-sm">
                K
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Kim M.J.</div>
                <div className="text-[10px] text-[#00658e] font-bold">PRO ACCOUNT</div>
              </div>
            </div>

            {/* Floating Card 3: New Lead Notification */}
            <div className="absolute top-1/4 -right-20 z-20 glass-card py-2 px-4 rounded-lg animate-float-delayed hidden xl:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-medium text-gray-700">New inquiry received!</span>
            </div>

            {/* Main Mockup Container */}
            <div className="relative bg-white p-2 rounded-3xl shadow-[0_10px_30px_-5px_rgba(22,50,92,0.08)] overflow-hidden border border-white/50 transform group-hover:scale-[1.01] transition-transform duration-500">
              <div className="w-full h-80 md:h-96 bg-gradient-to-br from-[#00658e] to-[#00A1E0] rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Decorative circles inside mockup */}
                <div className="absolute top-6 left-6 w-40 h-40 border border-white/10 rounded-full" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/10 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full" />

                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold">imPD</span>
                  </div>
                  <p className="text-lg font-medium opacity-80">Your Business Page Preview</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Bento Grid */}
        <section className="bg-gray-100 py-24" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">비즈니스 성장에 필요한 모든 기능</h2>
              <p className="text-gray-500">복잡한 코딩 없이 클릭 몇 번으로 완성하는 전문적인 모듈</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`bg-white p-8 rounded-xl shadow-[0_10px_30px_-5px_rgba(22,50,92,0.04)] group hover:bg-[#00658e] transition-all duration-300 ${f.wide ? 'lg:col-span-2' : ''}`}
                  >
                    <div className="w-12 h-12 bg-[#00658e]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/20">
                      <Icon className="w-6 h-6 text-[#00658e] group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-white">{f.title}</h3>
                    <p className="text-gray-500 text-sm group-hover:text-white/80">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="py-24 max-w-7xl mx-auto px-6" id="showcase">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">이런 페이지를<br />만들 수 있습니다</h2>
            <a className="text-[#00658e] font-semibold flex items-center gap-2 hover:underline" href="#">
              더 많은 사례 보기 <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseUsers.map((user) => (
              <div key={user.name} className="bg-white p-1 rounded-2xl shadow-[0_10px_30px_-5px_rgba(22,50,92,0.04)] group">
                <div className="relative overflow-hidden rounded-t-xl h-64">
                  <div className={`w-full h-full bg-gradient-to-br ${user.color} group-hover:scale-105 transition-transform duration-500`} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ring-2 ring-[#00658e] ring-offset-2 bg-gradient-to-br ${user.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{user.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{user.name}</h4>
                      <p className="text-gray-500 text-sm">{user.role}</p>
                    </div>
                  </div>
                  <a className="w-full block text-center py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium" href={user.url} target={user.url !== '#' ? '_blank' : undefined} rel={user.url !== '#' ? 'noopener noreferrer' : undefined}>
                    페이지 방문하기
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-gray-100 py-24 px-6" id="pricing">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">성공적인 비즈니스를 위한 합리적인 선택</h2>
              <p className="text-gray-500">언제든지 자유롭게 업그레이드하거나 취소할 수 있습니다</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white p-8 rounded-2xl shadow-[0_10px_30px_-5px_rgba(22,50,92,0.04)] flex flex-col relative ${plan.popular ? 'ring-2 ring-[#00658e]' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00658e] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                  <p className="text-gray-500 text-sm mb-8">{plan.desc}</p>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-center gap-3 text-sm ${!f.included ? 'text-gray-400' : plan.popular ? 'font-semibold' : ''}`}>
                        {f.included ? (
                          <Check className="w-5 h-5 text-[#00658e]" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300" />
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`w-full py-3 rounded-lg font-bold text-center block ${plan.popular
                        ? 'bg-gradient-to-r from-[#00658e] to-[#00A1E0] text-white hover:scale-[1.02] transition-transform'
                        : 'bg-gray-200 hover:bg-gray-300 transition-colors'
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-[#00A1E0]/5 py-20 px-8 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              지금, 당신만의 <span className="text-[#00A1E0]">imPD</span>를 만드세요
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
              프리랜서와 개인사업자들이 imPD와 함께하고 있습니다.
            </p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-[#00658e] to-[#00A1E0] text-white px-12 py-5 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
            >
              지금 시작하기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="space-y-4 max-w-sm">
              <div className="text-2xl font-bold tracking-tight text-gray-900">imPD</div>
              <p className="text-sm text-gray-500">
                개인 비즈니스의 시작과 완성. imPD는 개개인의 가치가 더욱 빛날 수 있는 공간을 만듭니다.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-sm mb-4">플랫폼</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#features" className="hover:text-[#00658e] transition-colors">기능 소개</a></li>
                  <li><a href="#showcase" className="hover:text-[#00658e] transition-colors">쇼케이스</a></li>
                  <li><a href="#pricing" className="hover:text-[#00658e] transition-colors">요금제</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4">고객지원</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#" className="hover:text-[#00658e] transition-colors">도움말 센터</a></li>
                  <li><a href="#" className="hover:text-[#00658e] transition-colors">문의하기</a></li>
                  <li><a href="#" className="hover:text-[#00658e] transition-colors">커뮤니티</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4">법적 고지</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#" className="hover:text-[#00658e] transition-colors">이용약관</a></li>
                  <li><a href="#" className="hover:text-[#00658e] transition-colors">개인정보처리방침</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
            © 2026 imPD Platform. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
