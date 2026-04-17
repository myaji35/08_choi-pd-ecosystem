'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, UserPlus, Loader2, XCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { validateSlug } from '@/lib/distributors/slug';

const distributorSchema = z.object({
  slug: z.string().min(3, 'ID는 3자 이상').max(30, '최대 30자'),
  name: z.string().min(1, '이름 또는 기업명을 입력해주세요'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().optional(),
  businessType: z.enum(['individual', 'company', 'organization']),
  region: z.string().optional(),
  subscriptionPlan: z.string().optional(),
  notes: z.string().optional(),
});

type FieldErrors = Partial<Record<string, string>>;

export default function NewDistributorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    email: '',
    phone: '',
    businessType: 'individual' as 'individual' | 'company' | 'organization',
    region: '',
    subscriptionPlan: '' as '' | 'basic' | 'premium' | 'enterprise',
    notes: '',
  });
  // slug 전용 실시간 검증 상태
  const [slugState, setSlugState] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    reason?: string;
    suggestion?: string;
  }>({ status: 'idle' });
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouchedRef = useRef(false);

  // 쿼리스트링 ?slug=... 로 들어오면 초기 slug 세팅
  useEffect(() => {
    const q = searchParams.get('slug');
    if (q) {
      slugTouchedRef.current = true;
      setFormData((prev) => (prev.slug ? prev : { ...prev, slug: q.toLowerCase() }));
    }
  }, [searchParams]);

  // slug 디바운스 검증
  useEffect(() => {
    if (!formData.slug) {
      setSlugState({ status: 'idle' });
      return;
    }
    const local = validateSlug(formData.slug);
    if (!local.ok) {
      setSlugState({ status: 'invalid', reason: local.reason });
      return;
    }
    setSlugState({ status: 'checking' });
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/distributors/check-id?id=${encodeURIComponent(local.normalized)}`);
        const data = await res.json();
        if (data?.success && data.available) {
          setSlugState({ status: 'available' });
        } else {
          setSlugState({ status: 'taken', reason: data?.reason || '사용 불가' });
        }
      } catch {
        setSlugState({ status: 'invalid', reason: '확인 실패' });
      }
    }, 350);
    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, [formData.slug]);

  // 이메일/이름 변경 시 slug 미터치 상태면 자동 추천
  useEffect(() => {
    if (slugTouchedRef.current) return;
    if (!formData.email && !formData.name) return;
    const params = new URLSearchParams({ suggest: '1' });
    if (formData.email) params.set('email', formData.email);
    if (formData.name) params.set('name', formData.name);
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/distributors/check-id?${params.toString()}`);
        const data = await res.json();
        if (!cancelled && data?.suggestion) {
          setFormData((prev) => (prev.slug ? prev : { ...prev, slug: data.suggestion }));
        }
      } catch {}
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [formData.email, formData.name]);

  const validateField = (field: string, value: string) => {
    if (field in distributorSchema.shape) {
      const shape = (distributorSchema.shape as Record<string, z.ZodTypeAny>)[field];
      const result = shape.safeParse(value);
      setErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const result = distributorSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // slug 최종 확인
    const v = validateSlug(formData.slug);
    if (!v.ok) {
      setErrors((prev) => ({ ...prev, slug: v.reason }));
      return;
    }
    if (slugState.status !== 'available') {
      setErrors((prev) => ({ ...prev, slug: slugState.reason || 'ID를 먼저 확정해주세요' }));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: v.normalized,
          subscriptionPlan: formData.subscriptionPlan || null,
        }),
      });

      if (response.ok) {
        // 등록 즉시 해당 slug로 관리 페이지 진입
        router.push(`/admin/distributors/${v.normalized}`);
      } else {
        const error = await response.json();
        setSubmitError(error.error || '등록에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to create distributor:', error);
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      validateField(field, value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/distributors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              신규 수요자 등록
            </h1>
            <p className="text-sm text-gray-600">새로운 분양 수요자를 등록합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>수요자 정보</CardTitle>
                <CardDescription>
                  기본 정보를 입력해주세요. 모든 필드는 나중에 수정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submit Error */}
                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* ID (slug) — impd.me/<id> 식별자 */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    ID (회원 주소) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-stretch rounded-lg border border-gray-300 bg-white focus-within:border-[#00A1E0] focus-within:ring-1 focus-within:ring-[#00A1E0] overflow-hidden">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-mono">
                      impd.me/
                    </span>
                    <input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        slugTouchedRef.current = true;
                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        handleChange('slug', v);
                      }}
                      onBlur={(e) => validateField('slug', e.target.value)}
                      placeholder="choi"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-mono"
                      autoComplete="off"
                    />
                    <span className="inline-flex items-center px-3">
                      {slugState.status === 'checking' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                      {slugState.status === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {(slugState.status === 'taken' || slugState.status === 'invalid') && <XCircle className="h-4 w-4 text-red-500" />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {slugState.status === 'available' && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        사용 가능 · <span className="font-mono">impd.me/{formData.slug}</span>
                      </p>
                    )}
                    {(slugState.status === 'taken' || slugState.status === 'invalid') && (
                      <p className="text-xs text-red-600">{slugState.reason}</p>
                    )}
                    {slugState.status === 'idle' && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        이메일/이름 입력 시 자동 추천됩니다. 영문 소문자·숫자·하이픈 (3~30자)
                      </p>
                    )}
                    {errors.slug && <p className="text-xs text-red-600">{errors.slug}</p>}
                  </div>
                </div>

                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 / 기업명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="홍길동 / (주)최PD컴퍼니"
                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="example@email.com"
                    className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* 연락처 */}
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>

                {/* 사업 구분 */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">
                    사업 구분 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleChange('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인</SelectItem>
                      <SelectItem value="company">기업</SelectItem>
                      <SelectItem value="organization">기관</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 지역 */}
                <div className="space-y-2">
                  <Label htmlFor="region">지역</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    placeholder="서울특별시 강남구"
                  />
                </div>

                {/* 구독 플랜 */}
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlan">구독 플랜</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) => handleChange('subscriptionPlan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="플랜 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    미선택 시 승인 후 플랜을 지정할 수 있습니다
                  </p>
                </div>

                {/* 메모 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">메모</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="관리자 메모 (수요자에게 보이지 않음)"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/distributors')}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-[#00A1E0] hover:bg-[#0082B3]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    등록하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
