'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tv,
  ShoppingBag,
  Home,
  BookOpen,
  Shield,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Profession, PlanType } from '@/lib/tenant/types';

// ---- 직업군 데이터 ----

interface ProfessionOption {
  id: Profession;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const PROFESSIONS: ProfessionOption[] = [
  {
    id: 'pd',
    name: 'PD / 방송인',
    description: '방송 PD, 유튜버, 크리에이터',
    icon: <Tv className="h-6 w-6" />,
  },
  {
    id: 'shopowner',
    name: '쇼핑몰 운영자',
    description: '온라인/오프라인 쇼핑몰',
    icon: <ShoppingBag className="h-6 w-6" />,
  },
  {
    id: 'realtor',
    name: '부동산 중개인',
    description: '공인중개사, 부동산 컨설턴트',
    icon: <Home className="h-6 w-6" />,
  },
  {
    id: 'educator',
    name: '교육자 / 강사',
    description: '학원, 과외, 온라인 강의',
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    id: 'insurance',
    name: '보험 설계사',
    description: '보험 설계, 재무 컨설팅',
    icon: <Shield className="h-6 w-6" />,
  },
  {
    id: 'freelancer',
    name: '프리랜서',
    description: '디자이너, 개발자, 작가',
    icon: <Briefcase className="h-6 w-6" />,
  },
];

// ---- 플랜 데이터 ----

interface PlanOption {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'free',
    name: '무료',
    price: '0원',
    period: '영구 무료',
    features: [
      'SNS 계정 2개',
      '저장공간 500MB',
      '기본 대시보드',
      '교육 과정 10개',
      '유통사 5개',
    ],
  },
  {
    id: 'pro',
    name: '프로',
    price: '29,000원',
    period: '/ 월',
    popular: true,
    features: [
      'SNS 계정 10개',
      '저장공간 5GB',
      '커스텀 도메인',
      '팀원 3명',
      '교육 과정 무제한',
      '유통사 50개',
      '고급 분석',
    ],
  },
  {
    id: 'enterprise',
    name: '엔터프라이즈',
    price: '99,000원',
    period: '/ 월',
    features: [
      'SNS 계정 무제한',
      '저장공간 50GB',
      '커스텀 도메인',
      '팀원 무제한',
      '모든 기능 무제한',
      '전용 지원',
      'API 접근',
    ],
  },
];

// ---- 스텝 인디케이터 ----

const STEPS = ['직업군 선택', '브랜드 정보', '프로필 상세', '플랜 선택', '완료'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label={`온보딩 진행 단계: ${currentStep + 1}/${STEPS.length}`} className="flex items-center justify-center gap-2 mb-8">
      <ol className="flex items-center gap-2" role="list">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                index < currentStep
                  ? 'bg-[#00A1E0] text-white'
                  : index === currentStep
                  ? 'bg-[#16325C] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              aria-current={index === currentStep ? 'step' : undefined}
              aria-label={`${label} ${index < currentStep ? '(완료)' : index === currentStep ? '(현재)' : ''}`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`hidden sm:inline text-xs font-medium ${
                index <= currentStep ? 'text-[#16325C]' : 'text-gray-400'
              }`}
              aria-hidden="true"
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  index < currentStep ? 'bg-[#00A1E0]' : 'bg-gray-200'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ---- 메인 페이지 ----

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // 폼 데이터
  const [profession, setProfession] = useState<Profession | null>(null);
  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<PlanType>('free');
  const [fieldErrors, setFieldErrors] = useState<{ brandName?: string; slug?: string }>({});

  // Step 2: 프로필 상세
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [snsInstagram, setSnsInstagram] = useState('');
  const [snsYoutube, setSnsYoutube] = useState('');
  const [snsFacebook, setSnsFacebook] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // slug 유효성 체크
  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: value }),
      });
      const data = await res.json();
      setSlugStatus(data.available ? 'available' : 'taken');
    } catch {
      setSlugStatus('idle');
    }
  }, []);

  // slug 입력 핸들러
  const handleSlugChange = (value: string) => {
    // slug는 소문자 알파벳, 숫자, 하이픈만 허용
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    if (sanitized.length >= 3) {
      checkSlug(sanitized);
    } else {
      setSlugStatus('idle');
    }
  };

  // 다음 스텝 유효성
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return profession !== null;
      case 1:
        return brandName.trim().length >= 2 && slug.length >= 3 && slugStatus === 'available';
      case 2:
        return ownerName.trim().length >= 2 && email.trim().length >= 5 && privacyAgreed;
      case 3:
        return true; // 플랜은 기본값이 있으므로 항상 진행 가능
      default:
        return false;
    }
  };

  // 최종 제출
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName,
          slug,
          profession,
          businessType: 'individual',
          plan,
          ownerName,
          email,
          phone,
          bio,
          snsLinks: {
            instagram: snsInstagram || undefined,
            youtube: snsYoutube || undefined,
            facebook: snsFacebook || undefined,
          },
        }),
      });

      if (res.ok) {
        setStep(4); // 완료 스텝으로 이동
      } else {
        const data = await res.json();
        toast.error(data.error || '테넌트 생성에 실패했습니다.');
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Step 1 validation
    if (step === 1) {
      const newErrors: { brandName?: string; slug?: string } = {};
      if (brandName.trim().length < 2) {
        newErrors.brandName = '브랜드 이름은 2자 이상 입력해주세요';
      }
      if (slug.length < 3) {
        newErrors.slug = 'URL 슬러그는 3자 이상 입력해주세요';
      } else if (slugStatus === 'taken') {
        newErrors.slug = '이미 사용 중인 주소입니다. 다른 주소를 입력하세요.';
      }
      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
      }
      setFieldErrors({});
    }

    if (step === 3) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center px-4">
          <span className="text-xl font-bold text-[#16325C]">imPD</span>
          <span className="ml-2 text-sm text-gray-500">새 브랜드 만들기</span>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-8">
        <StepIndicator currentStep={step} />

        {/* Step 0: 직업군 선택 */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#16325C] text-center mb-2">
              직업군을 선택하세요
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              선택한 직업군에 맞게 용어와 UI가 자동 커스터마이징됩니다.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="직업군 선택">
              {PROFESSIONS.map((p) => (
                <Card
                  key={p.id}
                  role="radio"
                  aria-checked={profession === p.id}
                  tabIndex={0}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1E0] focus-visible:ring-offset-2 ${
                    profession === p.id
                      ? 'border-[#00A1E0] bg-blue-50/50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setProfession(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setProfession(p.id);
                    }
                  }}
                >
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                        profession === p.id
                          ? 'bg-[#00A1E0] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      aria-hidden="true"
                    >
                      {p.icon}
                    </div>
                    <h3 className="font-semibold text-[#16325C] text-sm">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: 브랜드 정보 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[#16325C] text-center mb-2">
              브랜드 정보를 입력하세요
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              나중에 설정에서 변경할 수 있습니다.
            </p>
            <Card className="border-gray-200">
              <CardContent className="p-6 space-y-6">
                {/* 브랜드 이름 */}
                <div>
                  <label htmlFor="brandName" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    브랜드 이름 <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(필수)</span>
                  </label>
                  <input
                    id="brandName"
                    type="text"
                    value={brandName}
                    onChange={(e) => {
                      setBrandName(e.target.value);
                      if (fieldErrors.brandName && e.target.value.trim().length >= 2) {
                        setFieldErrors((prev) => ({ ...prev, brandName: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (brandName.trim().length > 0 && brandName.trim().length < 2) {
                        setFieldErrors((prev) => ({ ...prev, brandName: '브랜드 이름은 2자 이상 입력해주세요' }));
                      }
                    }}
                    placeholder="예: 김부동산, 맛있는빵집"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.brandName}
                    aria-describedby={fieldErrors.brandName ? 'brandName-error' : undefined}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      fieldErrors.brandName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus-visible:ring-red-500'
                        : 'border-gray-300 focus:border-[#00A1E0] focus:ring-[#00A1E0] focus-visible:ring-[#00A1E0]'
                    }`}
                  />
                  {fieldErrors.brandName && <p id="brandName-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.brandName}</p>}
                </div>

                {/* 슬러그 (URL) */}
                <div>
                  <label htmlFor="slug" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    URL 슬러그 <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(필수)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5" aria-hidden="true">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        https://
                      </span>
                    </div>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="my-brand"
                      aria-required="true"
                      aria-invalid={slugStatus === 'taken' || !!fieldErrors.slug}
                      aria-describedby="slug-status slug-error"
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] focus-visible:ring-2 focus-visible:ring-[#00A1E0] focus-visible:ring-offset-2"
                    />
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5" aria-hidden="true">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        .impd.io
                      </span>
                    </div>
                  </div>
                  {/* slug 상태 표시 */}
                  <div id="slug-status" className="mt-1.5 h-5" aria-live="polite">
                    {slugStatus === 'checking' && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        확인 중...
                      </span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        사용 가능한 주소입니다.
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-xs text-red-600" role="alert">
                        이미 사용 중인 주소입니다. 다른 주소를 입력하세요.
                      </span>
                    )}
                  </div>
                  {fieldErrors.slug && slugStatus !== 'taken' && (
                    <p id="slug-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.slug}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: 프로필 상세 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[#16325C] text-center mb-2">
              프로필을 완성하세요
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              입력된 정보로 홍보 페이지가 자동 구성됩니다.
            </p>
            <Card className="border-gray-200">
              <CardContent className="p-6 space-y-5">
                {/* 대표자 이름 */}
                <div>
                  <label htmlFor="ownerName" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    대표자 이름 <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="ownerName"
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="홍길동"
                    aria-required="true"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    이메일 <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    aria-required="true"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    전화번호 <span className="text-xs font-normal text-gray-400">(선택)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                  />
                </div>

                {/* 소개 */}
                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    한 줄 소개 <span className="text-xs font-normal text-gray-400">(선택, 홍보 페이지에 표시)</span>
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="어떤 일을 하시나요? 고객에게 보여줄 한 줄 소개를 입력하세요."
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
                  />
                </div>

                {/* SNS 링크 */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    SNS 계정 <span className="text-xs font-normal text-gray-400">(선택, 홍보 페이지에 자동 연결)</span>
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={snsInstagram}
                        onChange={(e) => setSnsInstagram(e.target.value)}
                        placeholder="Instagram 사용자명 또는 URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 text-white flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={snsYoutube}
                        onChange={(e) => setSnsYoutube(e.target.value)}
                        placeholder="YouTube 채널 URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={snsFacebook}
                        onChange={(e) => setSnsFacebook(e.target.value)}
                        placeholder="Facebook 페이지 URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                      />
                    </div>
                  </div>
                </div>

                {/* 개인정보 수집 동의 */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#00A1E0] focus:ring-[#00A1E0]"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-700">[필수] 개인정보 수집·이용 동의</span>
                      <br />
                      수집항목: 이름, 이메일, 전화번호, SNS 계정 정보, SNS 공개 프로필 사진
                      <br />
                      수집목적: 브랜드 홍보 페이지 생성 및 서비스 제공
                      <br />
                      이용방법: SNS에 공개된 프로필 사진을 수집하여 브랜드 로고로 제안합니다 (변경 가능)
                      <br />
                      보유기간: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: 플랜 선택 */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[#16325C] text-center mb-2">
              플랜을 선택하세요
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              무료 플랜으로 시작하고 언제든 업그레이드할 수 있습니다.
            </p>
            <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="플랜 선택">
              {PLANS.map((p) => (
                <Card
                  key={p.id}
                  role="radio"
                  aria-checked={plan === p.id}
                  tabIndex={0}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1E0] focus-visible:ring-offset-2 ${
                    plan === p.id
                      ? 'border-[#00A1E0] shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPlan(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPlan(p.id);
                    }
                  }}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: '#00A1E0' }}>
                        인기
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-[#16325C] text-lg">{p.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-[#16325C]">{p.price}</span>
                        <span className="text-sm text-gray-500 ml-1">{p.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {p.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-[#00A1E0] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        plan === p.id
                          ? 'bg-[#00A1E0] hover:bg-[#0090c8] text-white'
                          : 'bg-white border border-gray-300 text-[#16325C] hover:bg-gray-50'
                      }`}
                      variant={plan === p.id ? 'default' : 'outline'}
                    >
                      {plan === p.id ? '선택됨' : '선택'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 완료 */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00A1E0] text-white mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#16325C] mb-2">
              축하합니다! 브랜드 페이지가 생성되었습니다
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-[#16325C]">{brandName}</span>의 브랜드 허브가 준비되었습니다.
            </p>

            {/* 브랜드 페이지 URL 카드 */}
            <div className="inline-block bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6 mt-2">
              <p className="text-xs text-gray-500 mb-1">내 브랜드 페이지 주소</p>
              <p className="text-sm font-semibold text-[#16325C]">
                {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push(`/${slug}`)}
                className="bg-[#00A1E0] hover:bg-[#0090c8] text-white"
              >
                내 브랜드 페이지 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push('/pd/dashboard')}
                variant="outline"
                className="border-gray-300 text-[#16325C]"
              >
                대시보드로 이동
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/pd/settings')}
                className="border-gray-300 text-[#16325C]"
              >
                브랜드 설정
              </Button>
            </div>
          </div>
        )}

        {/* 네비게이션 버튼 (Step 0~2) */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="border-gray-300 text-[#16325C]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-[#00A1E0] hover:bg-[#0090c8] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : step === 3 ? (
                '브랜드 생성'
              ) : (
                <>
                  다음
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
