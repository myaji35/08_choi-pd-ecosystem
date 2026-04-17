import Link from 'next/link';
import { Reveal } from '@/components/landing/Reveal';
import { CountUp } from '@/components/landing/CountUp';
import { FeaturedMembersMarquee } from '@/components/landing/FeaturedMembersMarquee';
import {
  User,
  FolderOpen,
  ShoppingBag,
  FileEdit,
  MessageCircle,
  Star,
  Calendar,
  ArrowRight,
  Tv,
  Store,
  Home,
  GraduationCap,
  Shield,
  Palette,
  Zap,
  BarChart3,
  Globe,
  Lock,
} from 'lucide-react';

const professions = [
  {
    id: 'pd',
    icon: Tv,
    name: 'PD / 크리에이터',
    desc: '방송 PD, 유튜버, 콘텐츠 크리에이터를 위한 포트폴리오와 비즈니스 허브',
    color: 'from-blue-600 to-cyan-500',
    demo: '/p/chopd',
  },
  {
    id: 'shopowner',
    icon: Store,
    name: '쇼핑몰 운영자',
    desc: '온·오프라인 쇼핑몰의 입점업체 관리와 상품 마케팅을 하나로',
    color: 'from-emerald-500 to-teal-400',
    demo: '/p/demo-shopowner',
  },
  {
    id: 'realtor',
    icon: Home,
    name: '부동산 중개사',
    desc: '매물 관리, 시장 동향 분석, 고객 문의까지 원스톱 부동산 플랫폼',
    color: 'from-amber-500 to-orange-400',
    demo: '/p/demo-realtor',
  },
  {
    id: 'educator',
    icon: GraduationCap,
    name: '교육자 / 강사',
    desc: '강의 관리, 수강생 커뮤니케이션, 교재 판매를 통합하는 교육 허브',
    color: 'from-violet-500 to-purple-400',
    demo: '/p/demo-educator',
  },
  {
    id: 'insurance',
    icon: Shield,
    name: '보험 설계사',
    desc: '고객 상담 예약, 맞춤 설계 포트폴리오, 신뢰도 높은 전문가 프로필',
    color: 'from-rose-500 to-pink-400',
    demo: '/p/demo-insurance',
  },
  {
    id: 'freelancer',
    icon: Palette,
    name: '프리랜서',
    desc: '디자이너, 개발자, 작가 — 작업물 전시부터 계약 문의까지 한 페이지에',
    color: 'from-indigo-500 to-blue-400',
    demo: '/p/demo-freelancer',
  },
];

const features = [
  { icon: User, title: '프로필', desc: '첫인상을 결정짓는 전문가 자기소개' },
  { icon: FolderOpen, title: '포트폴리오', desc: '결과물을 갤러리 형태로 전시' },
  { icon: ShoppingBag, title: '서비스/상품', desc: '설명부터 결제까지 한 번에' },
  { icon: FileEdit, title: '블로그', desc: '전문성을 보여주는 인사이트' },
  { icon: MessageCircle, title: '문의 폼', desc: '잠재 고객 문의를 자동 수집' },
  { icon: Star, title: '후기', desc: '고객 리뷰로 신뢰를 증명' },
  { icon: Calendar, title: '예약', desc: '상담 스케줄 자동화' },
  { icon: BarChart3, title: '분석', desc: '방문자·전환율 실시간 추적' },
];

const stats = [
  { value: '5분', label: '페이지 개설' },
  { value: '₩0', label: '시작 비용' },
  { value: '6개', label: '직종 템플릿' },
  { value: '99.9%', label: '가동률' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 antialiased">
      {/* Nav */}
      <nav
        className="fixed top-0 w-full z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10"
        style={{ color: '#ffffff' }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#ffffff' }}
          >
            imPD
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#professions"
              className="transition-colors text-sm font-semibold relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full"
              style={{ color: '#ffffff' }}
            >
              직종별 데모
            </a>
            <a
              href="#features"
              className="transition-colors text-sm font-semibold relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full"
              style={{ color: '#ffffff' }}
            >
              기능
            </a>
            <a
              href="#why"
              className="transition-colors text-sm font-semibold relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full"
              style={{ color: '#ffffff' }}
            >
              왜 imPD?
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center border px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              로그인
            </Link>
            <Link
              href="/onboarding"
              className="bg-cyan-400 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-cyan-300 transition-colors shadow-[0_0_24px_rgba(34,211,238,0.25)]"
              style={{ color: '#0f172a' }}
            >
              무료로 시작
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ─── Hero: 다크 임팩트 ─── */}
        <section className="relative bg-[#0f172a] overflow-hidden text-white">
          {/* 배경 — Gradient Mesh + Grain + Drift 애니메이션 */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Mesh orb 4개 (blend: soft-light, drift) */}
            <div className="absolute top-[10%] left-[15%] w-[520px] h-[520px] bg-blue-500/25 rounded-full blur-3xl mix-blend-soft-light animate-drift-a will-change-transform" />
            <div className="absolute bottom-[5%] right-[10%] w-[480px] h-[480px] bg-cyan-400/30 rounded-full blur-3xl mix-blend-soft-light animate-drift-b will-change-transform" />
            <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl mix-blend-soft-light animate-drift-c will-change-transform" />
            <div className="absolute bottom-[25%] left-[5%] w-[360px] h-[360px] bg-indigo-500/20 rounded-full blur-3xl mix-blend-soft-light animate-drift-a will-change-transform" style={{ animationDelay: '4s' }} />

            {/* Grain/noise texture */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
              <filter id="hero-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#hero-grain)" />
            </svg>

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
              {/* ◀ 좌: 메인 카피 */}
              <div>
                <Reveal delay={80} from="up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm mb-8">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold tracking-wide" style={{ color: '#ffffff' }}>
                      1인 사업가를 위한, 올인원 비즈니스 페이지
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={180} from="up">
                  <h1
                    className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-8"
                    style={{ color: '#ffffff', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}
                  >
                    <span style={{ color: '#ffffff' }}>흩어진 내 일,</span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(34,211,238,0.35)]">
                      하나의 주소로.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={320} from="up">
                  <p
                    className="text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-medium"
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    이메일로 문의받고, 카톡으로 예약받고, 계좌로 입금받던 당신에게.<br className="hidden md:block" />
                    <span style={{ color: '#67e8f9' }} className="font-bold">이제 페이지 하나면 됩니다.</span>
                  </p>
                </Reveal>

                {/* 한국 특화 뱃지 스트립 */}
                <Reveal delay={440} from="up">
                  <div className="flex flex-wrap items-center gap-2 mb-10">
                    {['🇰🇷 카카오톡 채널', '💳 토스 결제', '🧾 세금계산서', '🏦 계좌이체'].map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/15"
                        style={{ color: 'rgba(255,255,255,0.85)' }}
                      >
                        {chip}
                      </span>
                    ))}
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      기본 제공
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={560} from="up">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Link
                      href="/onboarding"
                      className="group bg-cyan-400 text-[#0f172a] px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-300 transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                    >
                      내 페이지 만들기
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                      href="#professions"
                      className="group border-2 border-white/50 bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/15 hover:border-white/80 transition-colors text-center flex items-center justify-center gap-2"
                      style={{ color: '#ffffff' }}
                    >
                      <span className="text-cyan-300 group-hover:translate-x-0.5 transition-transform">▶</span>
                      내 직종 데모 보기
                    </a>
                  </div>
                  <p
                    className="text-xs mb-10"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    신용카드 없이 · 평생 무료 시작 · 4분이면 첫 페이지 완성
                  </p>
                </Reveal>

                {/* 숫자 임팩트 — CountUp */}
                <Reveal delay={720} from="up">
                  <div className="grid grid-cols-4 gap-0 max-w-2xl pt-6 border-t border-white/20">
                    {stats.map((s, i) => (
                      <div
                        key={s.label}
                        className={i > 0 ? 'border-l border-white/20 pl-5' : 'pl-0'}
                        style={{ paddingLeft: i > 0 ? '1.25rem' : '0' }}
                      >
                        <div
                          className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight tabular-nums"
                          style={{ color: '#ffffff' }}
                        >
                          <CountUp target={s.value} duration={1500 + i * 120} />
                        </div>
                        <div
                          className="text-xs md:text-sm font-medium leading-tight"
                          style={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* ▶ 우: 제품 목업 카드 (브라우저 프레임, float) */}
              <Reveal delay={400} from="scale" duration={900} className="relative hidden lg:block animate-hero-float will-change-transform">
                {/* 뒤 레이어 — 직종 아이콘 클러스터 */}
                <div className="pointer-events-none absolute -top-16 -right-16 grid grid-cols-3 gap-3 opacity-40 blur-[0.5px]">
                  {professions.slice(0, 6).map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.id}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg ${i % 2 === 0 ? 'translate-y-0' : 'translate-y-2'}`}
                        style={{ opacity: 0.55 + (i % 3) * 0.1 }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    );
                  })}
                </div>

                {/* 앞 레이어 — 가짜 페이지 미리보기 */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform rotate-[-1.5deg] hover:rotate-0 transition-transform duration-500">
                  {/* 브라우저 크롬 */}
                  <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded text-xs text-gray-500 px-3 py-1 ml-3 font-mono truncate">
                      impd.me/<span className="text-cyan-600 font-semibold">yourname</span>
                    </div>
                  </div>

                  {/* 페이지 내용 */}
                  <div className="p-6 bg-white">
                    {/* 헤더 영역 */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-900 rounded w-28 mb-1.5" />
                        <div className="h-3 bg-gray-300 rounded w-40" />
                      </div>
                      <div className="bg-cyan-400 text-[#0f172a] text-xs font-bold px-3 py-1.5 rounded-lg">문의</div>
                    </div>

                    {/* KPI 미니 — 매출 중심 */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        { n: '12건', l: '받은 문의', c: 'text-cyan-600' },
                        { n: '7건', l: '이번 주 예약', c: 'text-emerald-600' },
                        { n: '₩1.4M', l: '예상 매출', c: 'text-blue-700' },
                      ].map((s) => (
                        <div key={s.l} className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <div className={`text-sm font-bold ${s.c}`}>{s.n}</div>
                          <div className="text-[10px] text-gray-500">{s.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* 포트폴리오 그리드 */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-400" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400" />
                    </div>

                    {/* 예약/결제 블록 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <div className="flex-1 h-3 bg-gray-300 rounded" />
                        <div className="text-[10px] font-bold text-cyan-600">예약 가능</div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <div className="flex-1 h-3 bg-gray-300 rounded" />
                        <div className="text-[10px] font-bold text-emerald-600">₩ 99,000</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 플로팅 "5분 만에 완성" 배지 */}
                <div className="absolute -bottom-6 -left-6 bg-[#0f172a] border border-cyan-400/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#0f172a]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/60 font-medium">페이지 생성</div>
                    <div className="text-sm font-bold text-white">5분 완성</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* 하단 웨이브 */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 74.7C120 69 240 59 360 53.3C480 48 600 48 720 53.3C840 59 960 69 1080 69.3C1200 69 1320 59 1380 53.3L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* ─── 소셜 프루프 바 ─── */}
        <section className="relative bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {professions.slice(0, 5).map((p) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.id}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center ring-2 ring-white shadow-sm`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    );
                  })}
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center ring-2 ring-white text-[10px] font-bold">
                    +12
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    1인 사업가 100명과 함께 시작합니다
                  </div>
                  <div className="text-xs text-gray-500">
                    PD · 강사 · 쇼핑몰 · 부동산 · 보험 · 프리랜서 얼리 액세스 진행 중
                  </div>
                </div>
              </div>

              {/* 실명 후기 카드 */}
              <div className="flex items-center gap-3 max-w-md border-l border-gray-200 pl-6 hidden md:flex">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold shrink-0">
                  김
                </div>
                <div>
                  <p className="text-sm text-gray-800 leading-snug">
                    "imPD로 만든 뒤 <strong className="text-gray-900">5일 만에 첫 문의 3건</strong> 받았어요."
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">부동산 중개사 · @김O중개사</p>
                </div>
              </div>

              {/* 평균 지표 */}
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  평균 개설 <span className="text-cyan-600">4분 30초</span>
                </div>
                <div className="text-xs text-gray-500">코드 0줄 · 디자이너 없이</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 우수 회원 섬네일 마퀴 ─── */}
        <FeaturedMembersMarquee />

        {/* ─── 직종별 카드 그리드 ─── */}
        <section className="py-20 md:py-28 bg-white" id="professions">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">어떤 일을 하시나요?</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                직종에 맞는 맞춤 데모를 체험해보세요. 당신의 비즈니스에 딱 맞는 페이지를 미리 볼 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professions.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.id}
                    href={p.demo}
                    className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* hover 시 그라데이션 배경 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed group-hover:text-white/80 transition-colors mb-6">
                        {p.desc}
                      </p>

                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                        데모 체험하기
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 기능 섹션 ─── */}
        <section className="py-20 md:py-28 bg-gray-50" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">하나의 플랫폼, 무한한 가능성</h2>
              <p className="text-xl text-gray-500">코딩 없이. 디자이너 없이. 당신만 있으면 됩니다.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-[#0f172a] hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                    <p className="text-gray-500 text-sm">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 왜 imPD? ─── */}
        <section className="py-20 md:py-28 bg-white" id="why">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                  5개 플랫폼에<br />
                  흩어진 당신을<br />
                  <span className="text-[#0f172a]/40">하나로 모으세요</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: Globe, title: '올인원 비즈니스 페이지', desc: '포트폴리오, 블로그, 예약, 결제를 하나의 URL로' },
                    { icon: Zap, title: 'AI 기반 콘텐츠 자동화', desc: 'SNS 포스트, 뉴스레터를 AI가 초안 작성' },
                    { icon: Lock, title: '직종별 맞춤 커스터마이징', desc: '선택한 직종에 최적화된 모듈과 용어를 자동 적용' },
                    { icon: BarChart3, title: '실시간 비즈니스 인사이트', desc: '방문자 분석, 문의 전환율, 매출 추적을 한눈에' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-4">
                        <div className="w-12 h-12 bg-[#0f172a]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#0f172a]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 비주얼: 비포/애프터 */}
              <div className="space-y-6">
                {/* Before */}
                <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-8">
                  <div className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Before</div>
                  <div className="grid grid-cols-5 gap-3">
                    {['블로그', '인스타', '예약앱', '결제', '포폴'].map((name) => (
                      <div key={name} className="bg-white rounded-lg p-3 text-center border border-red-100">
                        <div className="w-8 h-8 bg-red-100 rounded-md mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400">{name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-400 mt-4 font-medium">5개 플랫폼, 5개 로그인, 5배의 시간</p>
                </div>

                {/* After */}
                <div className="bg-[#0f172a] rounded-2xl p-8">
                  <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">After — imPD</div>
                  <div className="bg-white/10 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">P</div>
                      <div>
                        <div className="text-white font-bold">my-brand.impd.io</div>
                        <div className="text-gray-400 text-xs">프로필 · 포트폴리오 · 서비스 · 예약 · 분석</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['프로필', '포폴', '예약', '분석'].map((m) => (
                        <div key={m} className="bg-white/10 rounded-md py-2 text-center text-xs text-gray-300">{m}</div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-cyan-400 mt-4 font-medium">하나의 URL, 하나의 대시보드, 5분 만에 완성</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="relative py-24 md:py-32 bg-[#0f172a] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              지금 시작하면,<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                내일 고객이 찾아옵니다
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
              카드 등록 없이, 무료로 시작하세요.<br />5분이면 당신만의 비즈니스 페이지가 완성됩니다.
            </p>
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-3 bg-white text-[#0f172a] px-12 py-5 rounded-xl font-black text-xl hover:bg-gray-100 transition-all shadow-2xl shadow-white/10"
            >
              무료로 시작하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-white/10 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="space-y-4 max-w-sm">
              <div className="text-2xl font-bold tracking-tight text-white">imPD</div>
              <p className="text-sm text-gray-500">
                프리랜서와 개인사업자를 위한 올인원 비즈니스 플랫폼. 당신의 전문성이 빛나는 공간을 만듭니다.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-sm mb-4 text-gray-300">플랫폼</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#professions" className="hover:text-white transition-colors">직종별 데모</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">기능 소개</a></li>
                  <li><a href="#why" className="hover:text-white transition-colors">왜 imPD?</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4 text-gray-300">고객지원</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#" className="hover:text-white transition-colors">도움말 센터</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4 text-gray-300">법적 고지</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><Link href="/legal/terms" className="hover:text-white transition-colors">이용약관</Link></li>
                  <li><Link href="/legal/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-600">
            © 2026 imPD Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
